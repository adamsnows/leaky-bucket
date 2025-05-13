import http from 'k6/http';
import { check } from 'k6';

// Configuração bem simples
export const options = {
  vus: 1,           // Apenas um usuário virtual
  iterations: 1,    // Apenas uma requisição
  thresholds: {
    http_req_failed: ['rate<0.1'], // Menos de 10% de falhas
  },
};

// URL da API
const API_URL = 'http://localhost:4000/graphql';

// Query GraphQL simples
const QUERY = JSON.stringify({
  query: `
    query {
      tokenStatus {
        availableTokens
        maxTokens
      }
    }
  `
});

export default function () {
  console.log('Iniciando teste simples...');

  // Fazer uma única requisição
  const res = http.post(API_URL, QUERY, {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: '5s' // Timeout curto para diagnóstico rápido
  });

  // Verificar resposta
  check(res, {
    'status 200': (r) => r.status === 200,
  });

  console.log(`Status: ${res.status}`);
  console.log(`Resposta: ${res.body}`);
}
