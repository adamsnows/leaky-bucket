import { GraphQLResolveInfo } from 'graphql';
import { GraphQLContext } from '../graphql/context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AuthResponse = {
  __typename?: 'AuthResponse';
  token: Scalars['String']['output'];
  user: User;
};

export type Mutation = {
  __typename?: 'Mutation';
  initiatePixTransaction: PixTransactionResponse;
  login: AuthResponse;
  register: AuthResponse;
};


export type MutationInitiatePixTransactionArgs = {
  input: PixTransactionInput;
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationRegisterArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type PixTransaction = {
  __typename?: 'PixTransaction';
  amount: Scalars['Float']['output'];
  createdAt: Scalars['String']['output'];
  pixKey: Scalars['String']['output'];
  pixKeyType: Scalars['String']['output'];
  status: Scalars['String']['output'];
  transactionId: Scalars['String']['output'];
};

export type PixTransactionInput = {
  amount: Scalars['Float']['input'];
  pixKey: Scalars['String']['input'];
  pixKeyType: Scalars['String']['input'];
};

export type PixTransactionResponse = {
  __typename?: 'PixTransactionResponse';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  transactionId?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  getRateLimit: RateLimitInfo;
  me?: Maybe<User>;
  tokenStatus: TokenStatus;
};

export type RateLimitInfo = {
  __typename?: 'RateLimitInfo';
  limit: Scalars['Int']['output'];
  remaining: Scalars['Int']['output'];
  resetAt?: Maybe<Scalars['String']['output']>;
};

export type TokenStatus = {
  __typename?: 'TokenStatus';
  availableTokens: Scalars['Int']['output'];
  maxTokens: Scalars['Int']['output'];
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  updatedAt: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  AuthResponse: ResolverTypeWrapper<AuthResponse>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  PixTransaction: ResolverTypeWrapper<PixTransaction>;
  PixTransactionInput: PixTransactionInput;
  PixTransactionResponse: ResolverTypeWrapper<PixTransactionResponse>;
  Query: ResolverTypeWrapper<{}>;
  RateLimitInfo: ResolverTypeWrapper<RateLimitInfo>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  TokenStatus: ResolverTypeWrapper<TokenStatus>;
  User: ResolverTypeWrapper<User>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  AuthResponse: AuthResponse;
  Boolean: Scalars['Boolean']['output'];
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Mutation: {};
  PixTransaction: PixTransaction;
  PixTransactionInput: PixTransactionInput;
  PixTransactionResponse: PixTransactionResponse;
  Query: {};
  RateLimitInfo: RateLimitInfo;
  String: Scalars['String']['output'];
  TokenStatus: TokenStatus;
  User: User;
}>;

export type AuthResponseResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AuthResponse'] = ResolversParentTypes['AuthResponse']> = ResolversObject<{
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  initiatePixTransaction?: Resolver<ResolversTypes['PixTransactionResponse'], ParentType, ContextType, RequireFields<MutationInitiatePixTransactionArgs, 'input'>>;
  login?: Resolver<ResolversTypes['AuthResponse'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'email' | 'password'>>;
  register?: Resolver<ResolversTypes['AuthResponse'], ParentType, ContextType, RequireFields<MutationRegisterArgs, 'email' | 'password' | 'username'>>;
}>;

export type PixTransactionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PixTransaction'] = ResolversParentTypes['PixTransaction']> = ResolversObject<{
  amount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  pixKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  pixKeyType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  transactionId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PixTransactionResponseResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PixTransactionResponse'] = ResolversParentTypes['PixTransactionResponse']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  transactionId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  getRateLimit?: Resolver<ResolversTypes['RateLimitInfo'], ParentType, ContextType>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  tokenStatus?: Resolver<ResolversTypes['TokenStatus'], ParentType, ContextType>;
}>;

export type RateLimitInfoResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['RateLimitInfo'] = ResolversParentTypes['RateLimitInfo']> = ResolversObject<{
  limit?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  remaining?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  resetAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TokenStatusResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TokenStatus'] = ResolversParentTypes['TokenStatus']> = ResolversObject<{
  availableTokens?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  maxTokens?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = GraphQLContext> = ResolversObject<{
  AuthResponse?: AuthResponseResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  PixTransaction?: PixTransactionResolvers<ContextType>;
  PixTransactionResponse?: PixTransactionResponseResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RateLimitInfo?: RateLimitInfoResolvers<ContextType>;
  TokenStatus?: TokenStatusResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
}>;

