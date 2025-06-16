import { Context, Next } from "koa";
import { config } from "../../config/environment";
import { consumeToken, getOrCreateBucket, restoreToken } from "./bucket";
import { handleRateLimitExceeded, setRateLimitHeaders } from "./responses";
import { LeakyBucketOptions } from "./types";
import { isTokenStatusQuery } from "./utils";

/**
 * Middleware de Leaky Bucket para rate limiting
 *
 * Implementa o algoritmo de leaky bucket para controlar a taxa de requisições.
 * Cada cliente (identificado por IP ou função customizada) tem seu próprio bucket
 * com capacidade limitada que se recarrega ao longo do tempo.
 *
 * Comportamento:
 * - Se a requisição for bem-sucedida: consome o token mas o restaura
 * - Se a requisição falhar: consome o token permanentemente
 * - Tokens são adicionados ao bucket automaticamente pela passagem do tempo (leak rate)
 * - Se não há tokens disponíveis, a requisição é rejeitada com status 429
 *
 * @param options Opções de configuração
 * @returns Middleware Koa
 */
export const leakyBucketMiddleware = (options: LeakyBucketOptions = {}) => {
  const capacity = options.capacity || config.bucketCapacity;
  const identifierKey = options.identifierKey || ((ctx: Context) => ctx.ip);

  return async (ctx: Context, next: Next): Promise<void> => {
    const identifier = identifierKey(ctx);
    const now = Date.now();

    // Add rate limit info to context
    ctx.state.rateLimit = {
      identifier,
      capacity,
    };

    const requestBody = (ctx.request.body as { query?: string }) || {};

    // Skip rate limiting for token status queries
    if (isTokenStatusQuery(requestBody)) {
      await next();
      return;
    }

    // Get or create bucket for this identifier
    const bucket = getOrCreateBucket(identifier, capacity, now);

    // Check if we have tokens available
    if (bucket.tokens < 1) {
      handleRateLimitExceeded(
        ctx,
        requestBody,
        bucket.lastRefill,
        capacity,
        identifier
      );
      return;
    }

    // Consume a token
    const currentTokens = consumeToken(bucket);

    // Set rate limit headers
    setRateLimitHeaders(ctx, {
      limit: capacity.toString(),
      remaining: currentTokens.toString(),
    });

    try {
      await next();

      // Check if response has GraphQL errors
      let responseBody = ctx.body;
      if (typeof responseBody === "string") {
        try {
          responseBody = JSON.parse(responseBody);
        } catch (e) {
          console.error(
            `[LeakyBucket] Failed to parse response body: ${
              (e as Error).message
            }`
          );
        }
      }

      const hasGraphQLErrors =
        responseBody &&
        typeof responseBody === "object" &&
        "errors" in responseBody &&
        Array.isArray(responseBody.errors) &&
        responseBody.errors.length > 0;

      if (hasGraphQLErrors) {
        // GraphQL error detected, token remains consumed
        console.log(
          `[LeakyBucket] Request failed (GraphQL errors found), token consumed. Remaining: ${bucket.tokens}/${capacity}`
        );
      } else {
        // Request was successful, restore the token
        restoreToken(identifier, capacity);
        console.log(
          `[LeakyBucket] Request successful, token restored. Available: ${bucket.tokens}/${capacity}`
        );
      }
    } catch (error) {
      // If request failed with exception, token remains consumed
      console.log(
        `[LeakyBucket] Request failed (exception), token consumed. Remaining: ${bucket.tokens}/${capacity}`
      );
      throw error;
    }
  };
};

// Re-export important functions and data
export { buckets, getTokenStatus } from "./bucket";
export * from "./types";

export default leakyBucketMiddleware;
