import { Context } from "koa";
import { TokenStatus as GraphQLTokenStatus } from "../../types/graphql";

export interface BucketState {
  tokens: number;
  lastRefill: number;
  lastRequest: number;
}

export interface LeakyBucketOptions {
  capacity?: number;
  identifierKey?: (ctx: Context) => string;
}

// Use the GraphQL generated type
export interface TokenStatus extends GraphQLTokenStatus {
  // Keep the same structure as the GraphQL type
}

export interface RateLimitResponse {
  success: boolean;
  message: string;
  retryAfter: number;
  retryAfterFormatted: string;
  tokenStatus: {
    available: number;
    maximum: number;
    remaining: number;
  };
}

export interface GraphQLRateLimitResponse {
  data: null;
  errors: Array<{
    message: string;
    extensions: {
      code: string;
      retryAfter: number;
      retryAfterFormatted: string;
      availableTokens: number;
      maxTokens: number;
      tokenStatus: {
        available: number;
        maximum: number;
        remaining: number;
      };
    };
  }>;
}

export interface RateLimitHeaders {
  limit: string;
  remaining: string;
  reset?: string;
}
