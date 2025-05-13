import http from 'k6/http';
import { check, sleep } from 'k6';

// Opções do teste - teste MUITO simples apenas para verificar conectividade
export const options = {
  vus: 1,           // Apenas um usuário virtual
  iterations: 1,    // Apenas uma requisição
  thresholds: {
    http_req_failed: ['rate<0.1'], // Menos de 10% de falhas
    http_req_duration: ['p(95)<5000'], // Requisição deve ser menor que 5 segundos
  },
  httpDebug: 'full', // Mostra detalhes HTTP completos para diagnóstico
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
  console.log('Iniciando teste de conexão básica...');

  // Faça uma única requisição com timeout longo
  const res = http.post(API_URL, QUERY, {
    headers: {
      'Content-Type': 'application/json',
      'Test-ID': 'basic-connection-test'
    },
    timeout: '15s' // Timeout bastante longo para garantir que não vai falhar por timeout
  });

  // Verifica resposta
  const success = check(res, {
    'status 200': (r) => r.status === 200,
    'resposta contém dados': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && body.data && body.data.tokenStatus;
      } catch (e) {
        console.log(`Erro ao analisar resposta: ${e.message}`);
        return false;
      }
    },
  });

  if (success) {
    console.log(`✅ Conexão bem sucedida! Status: ${res.status}`);
    console.log(`Resposta: ${res.body}`);
  } else {
    console.log(`❌ Erro na conexão! Status: ${res.status}`);
    console.log(`Resposta: ${res.body || 'Nenhuma resposta'}`);

    // Se houve timeout
    if (res.error) {
      console.log(`Erro: ${res.error}`);
    }
  }

  // Pequena pausa no final
  sleep(1);
}
