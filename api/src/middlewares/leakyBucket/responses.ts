import { Context } from "koa";
import {
  GraphQLRateLimitResponse,
  RateLimitHeaders,
  RateLimitResponse,
} from "./types";
import {
  calculateTimeUntilNextToken,
  formatTimeInMinutes,
  isGraphQLRequest,
} from "./utils";

/**
 * Define headers de rate limit no contexto
 * @param ctx Contexto Koa
 * @param headers Headers a serem definidos
 */
export const setRateLimitHeaders = (
  ctx: Context,
  headers: RateLimitHeaders
): void => {
  ctx.set("X-RateLimit-Limit", headers.limit);
  ctx.set("X-RateLimit-Remaining", headers.remaining);
  if (headers.reset) {
    ctx.set("X-RateLimit-Reset", headers.reset);
  }
};

/**
 * Cria resposta de rate limit para requisições GraphQL
 * @param secondsUntilNextToken Segundos até o próximo token
 * @param capacity Capacidade máxima do bucket
 * @returns Resposta formatada para GraphQL
 */
export const createGraphQLRateLimitResponse = (
  secondsUntilNextToken: number,
  capacity: number
): GraphQLRateLimitResponse => {
  const formattedTime = formatTimeInMinutes(secondsUntilNextToken);

  return {
    data: null,
    errors: [
      {
        message: `Limite de requisições excedido. Por favor, tente novamente em ${formattedTime}.`,
        extensions: {
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter: secondsUntilNextToken,
          retryAfterFormatted: formattedTime,
          availableTokens: 0,
          maxTokens: capacity,
          tokenStatus: {
            available: 0,
            maximum: capacity,
            remaining: 0,
          },
        },
      },
    ],
  };
};

/**
 * Cria resposta de rate limit para requisições REST
 * @param secondsUntilNextToken Segundos até o próximo token
 * @param capacity Capacidade máxima do bucket
 * @returns Resposta formatada para REST
 */
export const createRestRateLimitResponse = (
  secondsUntilNextToken: number,
  capacity: number
): RateLimitResponse => {
  const formattedTime = formatTimeInMinutes(secondsUntilNextToken);

  return {
    success: false,
    message: `Limite de requisições excedido. Por favor, tente novamente em ${formattedTime}.`,
    retryAfter: secondsUntilNextToken,
    retryAfterFormatted: formattedTime,
    tokenStatus: {
      available: 0,
      maximum: capacity,
      remaining: 0,
    },
  };
};

/**
 * Cria e define a resposta apropriada para rate limit
 * @param ctx Contexto Koa
 * @param requestBody Corpo da requisição
 * @param lastRefill Timestamp do último refill
 * @param capacity Capacidade do bucket
 * @param identifier Identificador do cliente
 */
export const handleRateLimitExceeded = (
  ctx: Context,
  requestBody: any,
  lastRefill: number,
  capacity: number,
  identifier: string
): void => {
  const now = Date.now();
  const millisecondsUntilNextToken = calculateTimeUntilNextToken(
    lastRefill,
    now
  );
  const secondsUntilNextToken = Math.ceil(millisecondsUntilNextToken / 1000);

  // Set headers
  setRateLimitHeaders(ctx, {
    limit: capacity.toString(),
    remaining: "0",
    reset: secondsUntilNextToken.toString(),
  });

  // Set response body based on request type
  if (isGraphQLRequest(requestBody)) {
    ctx.body = createGraphQLRateLimitResponse(secondsUntilNextToken, capacity);
  } else {
    ctx.body = createRestRateLimitResponse(secondsUntilNextToken, capacity);
  }

  // Log the rate limit
  console.log(
    `[LeakyBucket] Rate limit exceeded for ${identifier}. Retry after ${formatTimeInMinutes(
      secondsUntilNextToken
    )}.`
  );
};
