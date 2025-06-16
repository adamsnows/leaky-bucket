/**
 * Calcula quantos tokens devem ser adicionados com base no tempo decorrido
 * @param lastRefill Timestamp do último refill
 * @param now Timestamp atual
 * @returns Número de tokens a serem adicionados
 */
export const calculateTokensToAdd = (
  lastRefill: number,
  now: number
): number => {
  const millisecondsInHour = 60 * 60 * 1000;
  const hoursElapsed = Math.floor((now - lastRefill) / millisecondsInHour);
  return hoursElapsed;
};

/**
 * Formata tempo em segundos para uma string legível em português
 * @param seconds Tempo em segundos
 * @returns String formatada (ex: "2 minutos e 30 segundos")
 */
export const formatTimeInMinutes = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds} segundos`;
  }
  if (remainingSeconds === 0) {
    return `${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
  }

  return `${minutes} ${
    minutes === 1 ? "minuto" : "minutos"
  } e ${remainingSeconds} segundos`;
};

/**
 * Calcula o tempo até o próximo token
 * @param lastRefill Timestamp do último refill
 * @param now Timestamp atual
 * @returns Milissegundos até o próximo token
 */
export const calculateTimeUntilNextToken = (
  lastRefill: number,
  now: number
): number => {
  const millisecondsInHour = 60 * 60 * 1000;
  return millisecondsInHour - ((now - lastRefill) % millisecondsInHour);
};

/**
 * Verifica se uma requisição é uma query de status de tokens
 * @param requestBody Corpo da requisição
 * @returns true se for uma query de token status
 */
export const isTokenStatusQuery = (requestBody: any): boolean => {
  return (
    requestBody &&
    typeof requestBody.query === "string" &&
    requestBody.query.includes("tokenStatus")
  );
};

/**
 * Verifica se uma requisição é do tipo GraphQL
 * @param requestBody Corpo da requisição
 * @returns true se for uma requisição GraphQL
 */
export const isGraphQLRequest = (requestBody: any): boolean => {
  return (
    requestBody && typeof requestBody === "object" && "query" in requestBody
  );
};
