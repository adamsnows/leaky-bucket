# Woovi Leaky Bucket Challenge

Este projeto é a solução para o desafio técnico da Woovi:
[Descrição do desafio](https://github.com/woovibr/jobs/blob/main/challenges/woovi-leaky-bucket-challenge.md)

## 📋 Sobre o Projeto

O objetivo é implementar uma estratégia de **Leaky Bucket** com autenticação via **Bearer Token** e suporte a **multi-tenant** para limitar a frequência de requisições a uma API seguindo as especificações do BACEN (Banco Central do Brasil) para o sistema PIX.

### Regras de Negócio do Leaky Bucket

- Cada usuário começa com 10 tokens de requisição (capacidade máxima)
- Cada requisição consome 1 token
- Se a requisição for bem-sucedida, o token é restaurado (não é consumido)
- Se a requisição falhar, o token permanece consumido
- A cada hora, 1 token é adicionado ao total de tokens disponíveis
- 10 é o limite máximo de tokens

## 🔄 Controle de Versão

### v1.3 (13/05/2025) - Testes de carga avançados com K6 e Mutex

- **Scripts de teste de carga**: Implementação de múltiplos cenários de teste com K6
- **Teste simples**: Adição de testes simplificados para verificação rápida da API
- **Scripts de execução automatizada**: Facilitando a execução dos diferentes cenários de teste
- **Mutex para controle de concorrência**: Explicação detalhada da implementação de mutex para garantia de atomicidade
- **Prevenção de race conditions**: Garantia de consistência em ambientes de alta concorrência
- **Documentação aprimorada**: Detalhamento dos testes disponíveis e suas finalidades

### v1.2 (07/05/2025) - Correções de TypeScript e melhorias no client

- **Correções no api-client**: Resolução de problemas de tipagem no cliente de API do frontend
- **Melhoria na manipulação de headers**: Implementação da classe Headers para correta tipagem dos cabeçalhos HTTP
- **Tratamento adequado de API_URL**: Garantia de que o API_URL nunca seja undefined
- **Manipulação segura de autenticação**: Melhor gerenciamento do token de autenticação nos headers

### v1.1 (07/05) - Atomicidade, concorrência e pnpm workspace

Melhorias significativas para o sistema de rate limiting, com foco em:

- **Operações atômicas**: Implementação do padrão Mutex para garantir atomicidade nas operações de leitura/escrita de tokens
- **Testes de concorrência**: Suporte a testes automatizados para validar comportamento em ambientes de alta concorrência
- **Prevenção de race conditions**: Solução para problemas onde múltiplas requisições simultâneas poderiam ultrapassar os limites configurados
- **PNPM Workspace**: Solução para monorepos

#### Principais melhorias:

- Utilização da biblioteca `async-mutex` para garantir operações atômicas
- Implementação de testes simplificados para validar atomicidade
- Adição de script de teste de carga K6 para simular requisições concorrentes
- Melhorias na documentação sobre concorrência e atomicidade

### v1.0 (02/05 2025) - Versão inicial

Implementação inicial do sistema Leaky Bucket com todas as funcionalidades básicas.

## 🏗️ Arquitetura do Projeto

O projeto está dividido em duas partes principais:

### Backend (pasta `/api`)

#### Tecnologias Principais

- **Node.js**: Ambiente de execução JavaScript
- **TypeScript**: Superset tipado do JavaScript
- **Koa.js**: Framework web minimalista para Node.js
- **Apollo Server**: Servidor GraphQL para Koa
- **GraphQL**: Linguagem de consulta para APIs

#### Estrutura do Diretório Backend

```
api/
  ├── package.json
  ├── tsconfig.json
  ├── src/
  │   ├── index.ts                # Ponto de entrada da aplicação
  │   ├── config/
  │   │   └── environment.ts      # Configurações do ambiente
  │   ├── graphql/
  │   │   ├── resolvers/
  │   │   │   └── index.ts        # Resolvers GraphQL
  │   │   └── typeDefs/
  │   │       └── index.ts        # Definições de tipos GraphQL
  │   ├── middlewares/
  │   │   ├── error.ts            # Middleware de tratamento de erros
  │   │   └── leakyBucket.ts      # Middleware de rate limiting (Leaky Bucket)
```

### Frontend (pasta `/frontend`)

#### Tecnologias Principais

- **React**: Biblioteca JavaScript para construção de interfaces
- **Next.js**: Framework React para aplicações web
- **TypeScript**: Superset tipado do JavaScript
- **Tailwind CSS**: Framework CSS utilitário
- **Shadcn UI**: Componentes de UI reutilizáveis
- **Apollo Client**: Conectar aplicação React com API GraphQL

#### Estrutura do Diretório Frontend

```
frontend/
  ├── app/                      # Rotas do Next.js
  │   ├── globals.css
  │   ├── layout.tsx
  │   ├── page.tsx              # Página inicial (login)
  │   └── register/
  │       └── page.tsx          # Página de registro
  ├── components/               # Componentes React
  │   ├── login-form.tsx        # Formulário de login
  │   ├── pix-transaction-form.tsx  # Formulário de transação PIX
  │   ├── register-form.tsx     # Formulário de registro
  │   ├── token-display.tsx     # Exibe o status dos tokens
  │   └── ui/                   # Componentes de UI (Shadcn)
  ├── context/
  │   └── auth-context.tsx      # Contexto de autenticação
  ├── lib/                      # Utilitários e serviços
  │   ├── api.ts                # Funções para chamadas à API GraphQL
  │   ├── axios.ts              # Configuração do Axios
  │   └── utils.ts              # Funções utilitárias
```

## 🚀 Principais Funcionalidades

### 1. Middleware Leaky Bucket (Backend)

O coração da aplicação é o middleware Leaky Bucket implementado em `src/middlewares/leakyBucket.ts`. Este middleware:

- Rastreia os tokens disponíveis para cada usuário
- Aplica a lógica de consumo e restauração de tokens
- Implementa o mecanismo de recarga de tokens (1 token por hora)
- Impede o usuário de fazer mais requisições ao bater o limite
- **NOVO (v1.2)**: Garante atomicidade das operações usando Mutex

#### Implementação do Leaky Bucket com Mutex (v1.2)

```typescript
// Importar mutex para garantir atomicidade
import { Mutex } from 'async-mutex';

// Mapa de mutexes para cada identificador de bucket
const mutexMap = new Map<string, Mutex>();

// Obtém um mutex para um identificador específico
const getMutex = (identifier: string): Mutex => {
  let mutex = mutexMap.get(identifier);
  if (!mutex) {
    mutex = new Mutex();
    mutexMap.set(identifier, mutex);
  }
  return mutex;
};

// Uso do mutex para garantir atomicidade nas operações
return await mutex.runExclusive(async () => {
  // Lógica de verificação e consumo de tokens
  // Operações são realizadas de forma atômica dentro deste bloco
  if (bucket.tokens < 1) {
    // Lógica de limite excedido
    return;
  }

  bucket.tokens -= 1;
  const currentTokens = bucket.tokens;

  // Resto da lógica do middleware
  // ...
});
```

#### Implementação original do Leaky Bucket

```typescript
bucket.tokens -= 1;

ctx.set("X-RateLimit-Limit", capacity.toString());
ctx.set("X-RateLimit-Remaining", bucket.tokens.toString());

try {
  await next();
  await new Promise((resolve) => setTimeout(resolve, 0));

  let responseBody = ctx.body;
  if (typeof responseBody === "string") {
    try {
      responseBody = JSON.parse(responseBody);
    } catch (e) {
      console.error(
        `[LeakyBucket] Failed to parse response body: ${(e as Error).message}`
      );
      throw new Error("Failed to parse response body");
    }
  }

  const graphQLResponse = responseBody as GraphQLResponse;

  const hasGraphQLErrors =
    graphQLResponse &&
    typeof graphQLResponse === "object" &&
    "errors" in graphQLResponse;

  if (hasGraphQLErrors) {
    if (graphQLResponse.errors && Array.isArray(graphQLResponse.errors)) {
      graphQLResponse.errors.forEach((error: GraphQLError) => {
        if (!error.extensions) {
          error.extensions = {};
        }

        error.extensions.tokenStatus = {
          available: bucket.tokens,
          maximum: capacity,
          remaining: bucket.tokens,
        };
      });

      ctx.body = graphQLResponse;
    }

    console.log(
      `[LeakyBucket] Request failed (GraphQL errors found), token consumed. Remaining: ${bucket.tokens}/${capacity}`
    );
  } else {
    bucket.tokens += 1;
    console.log(
      `[LeakyBucket] Request successful, token restored. Available: ${bucket.tokens}/${capacity}`
    );
  }
} catch (error) {
  console.log(
    `[LeakyBucket] Request error, token consumed. Remaining: ${bucket.tokens}/${capacity}`
  );
  throw error;
}
```

### 2. API GraphQL (Backend)

A API GraphQL oferece as seguintes operações:

**Queries:**

- `tokenStatus`: Retorna o status atual dos tokens para o usuário
- `me`: Retorna informações do usuário autenticado
- `getRateLimit`: Retorna informações sobre os limites de taxa

**Mutations:**

- `register`: Registra um novo usuário
- `login`: Autentica um usuário
- `initiatePixTransaction`: Simula o início de uma transação PIX

### 3. Interface de Usuário (Frontend)

O frontend fornece:

- **TokenDisplay**: Interface visual para o status dos tokens com:

  - Barra de progresso colorida (verde/amarelo/vermelho)
  - Atualização automática a cada 10 segundos
  - Animações suaves quando os valores de tokens mudam

- **Sistema de Autenticação**:

  - Registro de novos usuários
  - Login de usuários existentes
  - Armazenamento de tokens JWT em localStorage
  - Contexto de autenticação para todo o aplicativo

- **Simulação de Transações PIX**:
  - Formulário para iniciar transações PIX
  - Feedback visual sobre o sucesso ou falha da transação
  - Visualização do impacto nas cotas de rate limiting

## 🚀 Como Executar o Projeto

### Backend (API)

#### Pré-requisitos

- Node.js (v16+)
- npm ou pnpm

#### Instalação e execução

```bash
# Navegar para a pasta da API
cd api

# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev

# Compilar para produção
npm run build

# Executar versão compilada
npm start
```

O servidor GraphQL estará disponível em `http://localhost:4000/graphql`.

#### Executando com Docker

```bash
# Navegar para a pasta da API
cd api

# Construir e iniciar os containers em modo detached
docker-compose up -d
```

#### Variáveis de Ambiente para Backend

Crie um arquivo `.env` na pasta `/api` com:

```
PORT=4000
NODE_ENV=development
BUCKET_CAPACITY=10
LEAK_RATE=1
JWT_SECRET=leaky-bucket-secret-key
JWT_EXPIRES_IN=1d
```

### Frontend

#### Pré-requisitos

- Node.js (v16+)
- npm ou pnpm
- Backend em execução

#### Instalação e execução

```bash
# Navegar para a pasta do frontend
cd frontend

# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev

# Compilar para produção
npm run build

# Iniciar versão compilada
npm start
```

O frontend estará disponível em `http://localhost:3000`.

#### Variáveis de Ambiente para Frontend

Crie um arquivo `.env.local` na pasta `/frontend` com:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
```

## 🧪 Como Testar o Rate Limiting

### No Frontend

1. Faça login com credenciais inválidas múltiplas vezes
   - Cada tentativa falhada consumirá 1 token
   - O componente TokenDisplay mostrará a diminuição dos tokens
2. Continue até consumir todos os tokens
   - Você verá uma notificação de erro
3. Faça login com credenciais corretas
   - Se bem-sucedido, o token não será consumido
   - Observe que o número de tokens permanece o mesmo
4. Teste a transação PIX
   - Inicie transações PIX para ver como o sistema lida com essas requisições

### Na API diretamente

1. Use o Apollo Sandbox ou Postman para enviar múltiplas consultas GraphQL
2. Envie requisições com dados inválidos (por exemplo, tentativas de login com credenciais erradas)
3. Observe os headers de resposta `X-RateLimit-*` para ver o consumo de tokens
4. Após consumir todos os tokens, você receberá um erro
5. Use a query `tokenStatus` para monitorar o estado dos seus tokens

### Testes de Carga com K6 (v1.3)

Para validar o comportamento do middleware sob alta concorrência, implementamos uma série de testes de carga usando K6. Esses testes simulam diferentes cenários de uso e ajudam a verificar se o sistema de leaky bucket funciona adequadamente sob pressão.

#### Instalação do K6

```bash
# macOS
brew install k6

# Linux
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
chocolatey install k6
```

#### Scripts de Execução

Foram criados dois scripts para facilitar a execução dos testes:

```bash
# Execute todos os testes de carga
./run-tests.sh

# Execute apenas o teste simples para verificação rápida
./run-simple-test.sh
```

#### Testes Disponíveis

1. **Teste Simples**
   - Teste básico para verificação rápida do funcionamento da API
   - Execução: `k6 run src/tests/k6/k6-simples.js`
   - Comportamento: Faz uma única requisição para verificar a disponibilidade de tokens

2. **Teste de Conectividade**
   - Verifica a conectividade básica com o servidor
   - Execução: `k6 run src/tests/k6/k6-connectivity-check.js`
   - Usado para garantir que o servidor está operacional antes de executar testes mais complexos

3. **Teste Básico de Conexão**
   - Teste complementar de conectividade
   - Execução: `k6 run src/tests/k6/k6-basic-connection-test.js`
   - Verifica headers e tempos de resposta básicos

4. **Teste de Pico de Carga (Spike Test)**
   - Simula um aumento repentino de tráfego
   - Execução: `k6 run src/tests/k6/k6-leaky-bucket-improved.js`
   - Comportamento: Começa com poucas req/s, aumenta rapidamente para simular pico, e depois reduz gradualmente

#### Métricas e Análise

Após a execução dos testes, o K6 fornece um relatório detalhado com métricas como:

- Taxa de requisições por segundo
- Tempo médio de resposta
- Taxa de falha
- Percentis de tempo de resposta (p90, p95)

Essas métricas ajudam a identificar possíveis gargalos e verificar se o leaky bucket está funcionando conforme esperado em condições de alta carga.

### Implementação do Mutex para Controle de Concorrência

No sistema Leaky Bucket, utilizamos o padrão Mutex (Mutual Exclusion) para garantir operações atômicas durante o controle de acesso concorrente aos tokens. O Mutex desempenha um papel crítico nas seguintes áreas:

1. **Prevenção de race conditions**: Evita que múltiplas requisições simultâneas acessem e modifiquem o mesmo bucket simultaneamente
2. **Garantia de atomicidade**: Assegura que operações críticas como verificação, consumo e restauração de tokens sejam executadas de forma atômica
3. **Consistência do estado**: Mantém o estado do bucket consistente mesmo sob alta carga concorrente

Implementamos o Mutex usando a biblioteca `async-mutex`, que fornece uma API Promise-based para controle de concorrência. Cada bucket de usuário tem seu próprio mutex, permitindo que diferentes usuários façam requisições simultaneamente sem afetar uns aos outros.

```typescript
// Código simplificado mostrando uso do mutex
return await mutex.runExclusive(async () => {
  // Operações atômicas no bucket
  if (bucket.tokens < 1) {
    // Limite excedido
    return;
  }

  // Consumir token
  bucket.tokens -= 1;

  // Processar requisição
  await next();

  // Restaurar token em caso de sucesso
  if (requisicaoBemSucedida) {
    bucket.tokens += 1;
  }
});
```
### Testes Unitários para Atomicidade e Mutex

O projeto inclui testes automatizados para validar a atomicidade das operações e o funcionamento do Mutex:

```bash
cd api
pnpm test src/tests/leakyBucket.test.ts
```

Esses testes verificam:
- O consumo de tokens respeita o limite configurado
- As operações de consumo e restauração de tokens são atômicas
- Múltiplas requisições simultâneas são tratadas corretamente pelo Mutex
- O sistema não permite condições de corrida que poderiam levar ao consumo excessivo de tokens

Exemplos de testes unitários:

```typescript
test('deve consumir um token quando uma requisição falha', async () => {
  // Configuração inicial do bucket
  // Simula uma requisição com falha
  // Verifica se o token foi corretamente consumido
});

test('não deve permitir concorrência que resulte em consumo excessivo de tokens', async () => {
  // Configura bucket com tokens limitados
  // Executa múltiplas requisições concorrentes
  // Verifica se o número total de requisições bem-sucedidas não excede o limite de tokens
});
```
## 📚 Documentação da API GraphQL

### Queries

#### tokenStatus

```graphql
query {
  tokenStatus {
    availableTokens
    maxTokens
  }
}
```

#### me

```graphql
query {
  me {
    id
    username
    email
    createdAt
    updatedAt
  }
}
```

### Mutations

#### register

```graphql
mutation {
  register(
    username: "newuser"
    email: "user@example.com"
    password: "password123"
  ) {
    token
    user {
      id
      username
      email
    }
  }
}
```

#### login

```graphql
mutation {
  login(email: "user@example.com", password: "password123") {
    token
    user {
      id
      username
      email
    }
  }
}
```

#### initiatePixTransaction

```graphql
mutation {
  initiatePixTransaction(
    input: { pixKeyType: "cpf", pixKey: "12345678900", amount: 100.50 }
  ) {
    success
    message
    transactionId
  }
}
```

## Diagrama de sequência


<div align="center">
  <img src="https://img001.prntscr.com/file/img001/ICObCq_mSUWXJLj8uEhU7w.png" alt="Diagrama Mermaid" />
</div>

## 🚧 Limitações e Próximos Passos

- Implementação atual usa armazenamento em memória (para produção, usar Redis)
- Autenticação JWT simples (para produção, implementar refresh tokens)
- Adicionar testes automatizados para frontend e backend
- Implementar um contador de tempo para que o usuário saiba quando será liberado um novo token
- **NOVO (v1.3)**: Expandir os testes automatizados de K6 para cobrir mais cenários de uso
- **NOVO (v1.3)**: Implementar visualização gráfica dos resultados dos testes de carga
- **NOVO (v1.2)**: Melhorar cobertura de testes para cenários específicos de concorrência
- **NOVO (v1.2)**: Implementar monitoramento em tempo real do consumo de tokens
- **NOVO (v1.2)**: Configurar CI/CD com testes automatizados de carga para validar performance antes de deploys

## 📝 Especificações do BACEN (DICT)

Este projeto segue as diretrizes do BACEN para implementação de um sistema de rate limiting para o Diretório de Identificadores de Contas Transacionais (DICT), conforme documentado em:
https://www.bcb.gov.br/content/estabilidadefinanceira/pix/API-DICT.html#section/Seguranca/Limitacao-de-requisicoes
