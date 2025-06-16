import { BucketState, TokenStatus } from "./types";
import { calculateTokensToAdd } from "./utils";

// Storage global dos buckets
export const buckets = new Map<string, BucketState>();

/**
 * Atualiza os tokens disponíveis no bucket com base no tempo decorrido
 * @param bucket Estado do bucket
 * @param capacity Capacidade máxima do bucket
 * @param now Timestamp atual
 * @returns Número atual de tokens
 */
export const getCurrentTokens = (
  bucket: BucketState,
  capacity: number,
  now: number
): number => {
  const tokensToAdd = calculateTokensToAdd(bucket.lastRefill, now);

  if (tokensToAdd > 0) {
    const millisecondsInHour = 60 * 60 * 1000;
    const hoursToAdd = tokensToAdd;
    bucket.lastRefill += hoursToAdd * millisecondsInHour;
    bucket.tokens = Math.min(capacity, bucket.tokens + tokensToAdd);
  }

  return bucket.tokens;
};

/**
 * Obtém ou cria um bucket para um identificador
 * @param identifier Identificador único (ex: IP)
 * @param capacity Capacidade máxima do bucket
 * @param now Timestamp atual
 * @returns Estado do bucket
 */
export const getOrCreateBucket = (
  identifier: string,
  capacity: number,
  now: number
): BucketState => {
  let bucket = buckets.get(identifier);

  if (!bucket) {
    bucket = {
      tokens: capacity,
      lastRefill: now,
      lastRequest: now,
    };
    buckets.set(identifier, bucket);
  } else {
    getCurrentTokens(bucket, capacity, now);
    bucket.lastRequest = now;
  }

  return bucket;
};

/**
 * Consome um token do bucket temporariamente
 * O token será restaurado após o processamento da requisição
 * @param bucket Estado do bucket
 * @returns Número de tokens restantes
 */
export const consumeToken = (bucket: BucketState): number => {
  bucket.tokens = Math.max(0, bucket.tokens - 1);
  return bucket.tokens;
};

/**
 * Restaura um token no bucket (usado após processamento da requisição)
 * @param identifier Identificador do bucket
 * @param capacity Capacidade máxima
 */
export const restoreToken = (identifier: string, capacity: number): void => {
  const bucket = buckets.get(identifier);
  if (bucket) {
    bucket.tokens = Math.min(capacity, bucket.tokens + 1);
  }
};

/**
 * Obtém o status de tokens para um identificador
 * @param identifier Identificador único
 * @param capacity Capacidade máxima
 * @returns Status dos tokens
 */
export const getTokenStatus = async (
  identifier: string,
  capacity: number
): Promise<TokenStatus> => {
  const now = Date.now();
  const bucket = getOrCreateBucket(identifier, capacity, now);

  return {
    availableTokens: bucket.tokens,
    maxTokens: capacity,
  };
};
