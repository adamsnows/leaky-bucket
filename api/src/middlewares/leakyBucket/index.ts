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
    } catch (error) {
      // Restore token on error (except for rate limit errors)
      restoreToken(identifier, capacity);
      throw error;
    }
  };
};

// Re-export important functions and data
export { buckets, getTokenStatus } from "./bucket";
export * from "./types";

export default leakyBucketMiddleware;
