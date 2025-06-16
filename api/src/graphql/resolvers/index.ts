import { AuthenticationError, UserInputError } from "apollo-server-koa";
import { Context } from "koa";
import { config } from "../../config/environment";
import { getTokenStatus } from "../../middlewares/leakyBucket";
import {
  AuthResponse,
  PixTransaction as GraphQLPixTransaction,
  PixTransactionResponse as GraphQLPixTransactionResponse,
  MutationInitiatePixTransactionArgs,
  MutationLoginArgs,
  MutationRegisterArgs,
  PixTransactionInput,
  RateLimitInfo,
  TokenStatus,
  User,
} from "../../types/graphql";
import { GraphQLContext } from "../context";

// Extended interfaces for internal use (with password field)
interface UserWithPassword extends User {
  password: string;
}

interface PixTransaction extends GraphQLPixTransaction {
  // Add any additional fields needed internally
}

interface PixTransactionResponse extends GraphQLPixTransactionResponse {
  // Add any additional fields needed internally
}

interface ResolverContext {
  ctx: Context;
}

interface PixTransactionArgs {
  input: PixTransactionInput;
}

const mockUsers: UserWithPassword[] = [
  {
    id: "1",
    username: "testuser",
    email: "test@example.com",
    password: "hashed_password",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockTransactions: PixTransaction[] = [];

const resolvers = {
  Query: {
    me: (
      _: any,
      __: any,
      { ctx }: GraphQLContext
    ): Omit<User, "password"> | null => {
      const user = mockUsers[0];
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    },

    getRateLimit: (_: any, __: any, { ctx }: GraphQLContext): RateLimitInfo => {
      const remaining = parseInt(
        ctx.response.get("X-RateLimit-Remaining") || "0",
        10
      );
      const limit = config.bucketCapacity;

      return {
        remaining,
        limit,
        resetAt: new Date(Date.now() + 1000).toISOString(),
      };
    },

    tokenStatus: async (
      _: any,
      __: any,
      { ctx }: GraphQLContext
    ): Promise<TokenStatus> => {
      const identifier = ctx.state.rateLimit?.identifier || ctx.ip;
      const capacity = config.bucketCapacity;
      const status = await getTokenStatus(identifier, capacity);

      return status;
    },
  },

  Mutation: {
    register: (
      _parent: any,
      { username, email, password }: MutationRegisterArgs
    ): AuthResponse => {
      if (mockUsers.some((user) => user.email === email)) {
        throw new UserInputError("Usuário com esse e-mail já existe!");
      }

      const newUser: UserWithPassword = {
        id: (mockUsers.length + 1).toString(),
        username,
        email,
        password,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUsers.push(newUser);

      const { password: _, ...userWithoutPassword } = newUser;
      return {
        token: "mock_token_for_" + newUser.id,
        user: userWithoutPassword,
      };
    },

    login: (
      _parent: any,
      { email, password }: MutationLoginArgs,
      { ctx }: GraphQLContext
    ): AuthResponse => {
      const user = mockUsers.find((user) => user.email === email);

      if (!user) {
        throw new UserInputError("Credenciais inválidas");
      }

      if (user.password !== password) {
        throw new AuthenticationError("Credenciais inválidas");
      }

      const { password: _, ...userWithoutPassword } = user;
      return {
        token: "mock_token_for_" + user.id,
        user: userWithoutPassword,
      };
    },

    initiatePixTransaction: (
      _parent: any,
      { input }: MutationInitiatePixTransactionArgs,
      { ctx }: GraphQLContext
    ): PixTransactionResponse => {
      const { pixKeyType, pixKey, amount } = input;

      if (!pixKeyType || !pixKey || !amount) {
        throw new UserInputError("Todos os campos são obrigatórios");
      }

      if (amount <= 0) {
        throw new UserInputError("O valor deve ser maior que zero");
      }

      const transactionId = `pix-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}`;

      const newTransaction: PixTransaction = {
        transactionId,
        pixKeyType,
        pixKey,
        amount,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      mockTransactions.push(newTransaction);

      return {
        success: true,
        message: `Transação PIX de R$ ${amount.toFixed(
          2
        )} para ${pixKey} (${pixKeyType}) iniciada com sucesso.`,
        transactionId,
      };
    },
  },
};

export default resolvers;
