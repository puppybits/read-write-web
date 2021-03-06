import { ReduxFirestoreQuerySetting } from 'react-redux-firebase';
import * as Firebase from 'firebase';
import { Dispatch } from 'redux';
import {
  AsyncThunkAction,
  ActionCreatorWithPreparedPayload,
} from '@reduxjs/toolkit';

/**
 * Action types used within actions dispatched internally. These action types
 * can be manually dispatched to update state.
 */
export const actionTypes: {
  START: string;
  ERROR: string;
  CLEAR_DATA: string;
  CLEAR_ERROR: string;
  CLEAR_ERRORS: string;
  SET_LISTENER: string;
  UNSET_LISTENER: string;
  GET_REQUEST: string;
  GET_SUCCESS: string;
  GET_FAILURE: string;
  SET_REQUEST: string;
  SET_SUCCESS: string;
  SET_FAILURE: string;
  ADD_REQUEST: string;
  ADD_SUCCESS: string;
  ADD_FAILURE: string;
  UPDATE_REQUEST: string;
  UPDATE_SUCCESS: string;
  UPDATE_FAILURE: string;
  DELETE_REQUEST: string;
  DELETE_SUCCESS: string;
  DELETE_FAILURE: string;
  ATTACH_LISTENER: string;
  LISTENER_RESPONSE: string;
  LISTENER_ERROR: string;
  ON_SNAPSHOT_REQUEST: string;
  ON_SNAPSHOT_SUCCESS: string;
  ON_SNAPSHOT_FAILURE: string;
  DOCUMENT_ADDED: string;
  DOCUMENT_MODIFIED: string;
  DOCUMENT_REMOVED: string;
  TRANSACTION_START: string;
  TRANSACTION_SUCCESS: string;
  TRANSACTION_FAILURE: string;
  MUTATE_START: string;
  MUTATE_SUCCESS: string;
  MUTATE_FAILURE: string;
};

/**
 * Constants used within redux-firestore. Includes actionTypes, actionsPrefix,
 * and default config.
 */
export const constants: {
  actionTypes: typeof actionTypes;
  actionsPrefix: string;
  defaultConfig: Config;
};

export interface Config {
  enableLogging: boolean;

  helpersNamespace: string | null;

  // https://github.com/prescottprue/redux-firestore#loglistenererror
  logListenerError: boolean;

  // https://github.com/prescottprue/redux-firestore#enhancernamespace
  enhancerNamespace: string;

  // https://github.com/prescottprue/redux-firestore#allowmultiplelisteners
  allowMultipleListeners:
    | ((listenerToAttach: any, currentListeners: any) => boolean)
    | boolean;

  // https://github.com/prescottprue/redux-firestore#preserveondelete
  preserveOnDelete: null | object;

  // https://github.com/prescottprue/redux-firestore#preserveonlistenererror
  preserveOnListenerError: null | object;

  preserveCacheAfterUnset: boolean;

  // https://github.com/prescottprue/redux-firestore#onattemptcollectiondelete
  onAttemptCollectionDelete:
    | null
    | ((queryOption: string, dispatch: Dispatch, firebase: Object) => void);

  // https://github.com/prescottprue/redux-firestore#mergeordered
  mergeOrdered: boolean;

  // https://github.com/prescottprue/redux-firestore#mergeordereddocupdate
  mergeOrderedDocUpdate: boolean;

  // https://github.com/prescottprue/redux-firestore#mergeorderedcollectionupdates
  mergeOrderedCollectionUpdates: boolean;

  globalDataConvertor: {
    toFirestore: (snapshot) => null | object | array;
    fromFirestore: (snapshot) => any;
  };
}

/**
 *
 * mutate - Data-driven Design for writing, batching & transacting with Firestore
 *
 */
type ArrayUnion = ['::arrayUnion', any | any[]];
type ArrayRemove = ['::arrayRemove', any | any[]];
type Increment = ['::increment', number];
type ServerTimestamp = ['::serverTimestamp'];
type FieldValueTuple = ArrayUnion | ArrayRemove | Increment | ServerTimestamp;

type PathId = { id: string; path: string };
export type Read = PathId;
/**
 * As of Nov 2021, Firestore does not support transactional queries.
 * Queries are run as a standard read. Each document returned is read
 * a second time in the transaction. This is a best effort. Full
 * Transactional Query support is only available with firebase-admin.
 */
export type ReadQuery = Omit<ReduxFirestoreQuerySetting, 'storeAs'> &
  Pick<PathId, 'path'> & { alias: string };
export type ReadProvides = () => unknown;

export type Write = PathId & { [key: string]: FieldValueTuple | unknown };
export type WriteFn<Reads extends string> = (reads: { [Key in Reads]: any }) =>
  | Write
  | Write[];

export type Batch = Write[];

export type Transaction<Type extends Record<string, unknown>> = {
  reads: {
    [P in keyof Type]: ReadQuery | Read | ReadProvides;
  };
  writes:
    | WriteFn<Extract<keyof Type, string>>[]
    | WriteFn<Extract<keyof Type, string>>
    | Write
    | Write[];
};

/**
 * Mutate turns Firestore into immedaite mode. Calling getFirestore returns
 * a RRF wrapper around Firestore that included the mutate function.
 * The primary aim of mutate is to make firestore feel lighting fast to user.
 * Instead of Firestore's API which is async first, the mutate function
 * provides eventual consistency. Change requests synchronously update the
 * cache reducer. When the change is accepted or rejected it updated the
 * cache reducer to reflect data in firestore.
 */
export type mutate = <Reads extends Record<string, unknown>>(
  operations: Transaction<Reads> | Batch | Write,
) => Promise;

/**
 *
 * createMutate - Simple wrapper for Redux Toolkit async action creators
 *
 */
type Writer<ReadType extends Record<string, unknown>> =
  | WriteFn<Extract<keyof ReadType, string>>
  | Write;
type Writers<ReadType extends Record<string, unknown>> =
  | Writer<ReadType>
  | Writer<ReadType>[];

type SimpleRead<ReadType extends Record<string, unknown>> = {
  [P in keyof ReadType]: ReadProvides;
};
type TransactionRead<ReadType extends Record<string, unknown>> = {
  [P in keyof ReadType]: ReadQuery | Read | ReadProvides;
};

type SimpleReadFn<Payload, ReadType extends Record<string, unknown>> = (
  payload?: Payload,
) => SimpleRead<ReadType>;

type TransactionReadFn<Payload, ReadType extends Record<string, unknown>> = (
  payload?: Payload,
) => TransactionRead<ReadType>;

type SimpleMutate<Payload, ReadType extends Record<string, unknown>> = {
  action: string;
  read: SimpleReadFn<Payload, ReadType>;
  write: Writer<ReadType>;
};
type ComplexMutate<Payload, ReadType extends Record<string, unknown>> = {
  action: string;
  readwrite: (payload: Payload, thunkAPI: FirebaseThunkAPI) => Writer<ReadType>;
};

type BatchMutate<Payload, ReadType extends Record<string, unknown>> = {
  action: string;
  read: SimpleReadFn<Payload, ReadType>;
  write: Writers<ReadType>;
};
type ComplexBatch<Payload, ReadType extends Record<string, unknown>> = {
  action: string;
  readwrite: (
    payload?: Payload,
    thunkAPI: FirebaseThunkAPI,
  ) => Writers<ReadType>;
};

type TransactionMutate<Payload, ReadType extends Record<string, unknown>> = {
  action: string;
  read: TransactionReadFn<Payload, ReadType>;
  write: Writers<ReadType>;
};
type ComplexTransaction<Payload, ReadType extends Record<string, unknown>> = {
  action: string;
  readwrite: (
    payload: Payload,
    thunkAPI: FirebaseThunkAPI,
  ) => {
    read: TransactionRead<ReadType>;
    write: Writers<ReadType>;
  };
};

type Mutations<Payload, ReadType extends Record<string, unknown>> =
  | SimpleMutate<Payload, ReadType>
  | ComplexMutate<Payload, ReadType>
  | BatchMutate<Payload, ReadType>
  | ComplexBatch<Payload, ReadType>
  | TransactionMutate<Payload, ReadType>
  | ComplexTransaction<Payload, ReadType>;

export function createMutate<Payload, ReadType extends Record<string, unknown>>(
  mutation: Mutations<Payload, ReadType, ReadType>,
): ((arg: Payload) => AsyncThunkAction<any, void, {}>) & {
  pending: ActionCreatorWithPreparedPayload<
    [string, void],
    undefined,
    string,
    never,
    {
      arg: Payload;
      requestId: string;
    }
  >;
  rejected: ActionCreatorWithPreparedPayload<
    [string, void],
    undefined,
    string,
    never,
    {
      arg: Payload;
      requestId: string;
    }
  >;
  fulfilled: ActionCreatorWithPreparedPayload<
    [string, void],
    undefined,
    string,
    never,
    {
      arg: Payload;
      requestId: string;
    }
  >;
  typePrefix: string;
};

export function ReactReduxFirebaseProvider(
  props: ReactReduxFirebaseProviderProps,
): any;

export interface ReactReduxFirebaseProviderProps {
  firebase: any;
  config: any;
  dispatch: Dispatch;
  children?: React.ReactNode;
  initializeAuth?: boolean;
  createFirestoreInstance?: (
    firebase: any,
    configs: any,
    dispatch: Dispatch,
  ) => object;
}

export namespace ReduxFirestoreContext {
  const prototype: {};
}

export function useFirestore(): any;

// -- useRead subscriptions

type Loading = undefined;
type NotFound = null;

/**
 * read subscription for a single doc
 * @param query ReadQuery
 * @returns Docs
 */
function useRead<Doc extends PathId>(pathId: PathId): Doc | Loading | NotFound;
/**
 * read single value from cache
 * @param pathId PathId
 * @param field keyof Doc
 * @returns Value of key
 */
function useRead<Doc extends PathId>(
  pathId: PathId,
  field: K,
): Doc[K] | Loading | NotFound;
/**
 * read single value from cache
 * @param pathId PathId
 * @param field keyof Doc
 * @returns Value of key
 */
function useRead<Doc extends PathId>(
  pathId: PathId,
  fields: K[],
): Pick<Doc, K> | Loading | NotFound;
/**
 * read subscription to get docs
 * @param query ReadQuery
 * @returns Docs
 */
function useRead<Doc extends PathId>(
  query: Omit<ReadQuery, 'id'>,
): Doc[] | Loading | NotFound;
/**
 * read subscription for single value
 * @param query ReadQuery
 * @param field keyof Doc
 * @returns Value of key
 */
function useRead<Doc extends PathId>(
  query: Omit<ReadQuery, 'id'>,
  field: K,
): Doc[K][] | Loading | NotFound;
/**
 * read subscription for single value
 * @param query ReadQuery
 * @param field keyof Doc
 * @returns Value of key
 */
function useRead<Doc extends PathId>(
  query: Omit<ReadQuery, 'id'>,
  fields: K[],
): Pick<Doc, K>[] | Loading | NotFound;
/**
 * read subscription that returns the alias
 * @param query ReadQuery
 * @param aliasEnum '::alias'
 * @returns Alias for the query
 */
function useRead<Doc extends PathId>(
  query: Omit<ReadQuery, 'id'>,
  alias: '::alias',
): string;
/**
 * read from cache
 * @param alias string
 * @returns Alias for the query
 */
function useRead<Doc extends PathId>(alias: string): Doc[] | undefined;
/**
 * read from cache
 * @param alias string
 * @param field field of doc
 * @returns Select keys from doc
 */
export function useRead<Doc extends PathId>(
  alias: string,
  field: K,
): Doc[K][] | Loading | NotFound;
/**
 * read from cache
 * @param alias string
 * @param fields keys of doc
 * @returns Select keys from doc
 */
export function useRead<Doc extends PathId>(
  alias: string,
  fields: K[],
): Pick<Doc, K>[] | Loading | NotFound;

// -- useCache reads from cache

/**
 * reads single doc from cahce
 * @param query ReadQuery
 * @returns Docs
 */
function useCache<Doc extends PathId>(pathId: PathId): Doc;
/**
 * read single value from cache
 * @param pathId PathId
 * @param field keyof Doc
 * @returns Value of key
 */
function useCache<Doc extends PathId>(pathId: PathId, field: K): Doc[K];
/**
 * read single value from cache
 * @param pathId PathId
 * @param field keyof Doc
 * @returns Value of key
 */
function useRead<Doc extends PathId>(
  pathId: PathId,
  fields: K[],
): Pick<Doc, K> | undefined;
/**
 * read from cache
 * @param alias string
 * @returns Alias for the query
 */
function useCache<Doc extends PathId>(alias: string): Doc[] | undefined;
/**
 * read from cache
 * @param alias string
 * @param field field of doc
 * @returns Select keys from doc
 */
export function useCache<Doc extends PathId>(
  alias: string,
  field: K,
): Doc[K][] | undefined;
/**
 * read from cache
 * @param alias string
 * @param fields keys of doc
 * @returns Select keys from doc
 */
export function useCache<Doc extends PathId>(
  alias: string,
  fields: K[],
): Pick<Doc, K>[] | undefined;

// -- setCache for storybook

export function setCache(aliases: Record<string, any>, middlewares?: any): any;

export function shouldPass(actionCreatorFnc: any): any;
export function shouldPass(testname: string, actionCreatorFnc: any): any;
export function shouldFail(actionCreatorFnc: any): any;
export function shouldFail(testname: string, actionCreatorFnc: any): any;

/**
 * A redux store enhancer that adds store.firebase (passed to React component
 * context through react-redux's <Provider>).
 */
export function reduxFirestore(
  firebaseInstance: typeof Firebase,
  otherConfig?: Partial<Config>,
): Firebase.default.firestore & { mutate: mutate };

/**
 * Get extended firestore instance (attached to store.firestore)
 */
export function getFirestore(
  firebaseInstance: typeof Firebase,
  otherConfig?: Partial<Config>,
): Firebase.default.firestore & { mutate: mutate };

export function getFirebase(
  firebaseInstance: typeof Firebase,
  otherConfig?: Partial<Config>,
): Firebase.default.firebase;

/**
 * Reducer for Firestore state
 * @param state - Current Firebase Redux State (state.firestore)
 * @param action - Action which will modify state
 * @param action.type - Type of Action being called
 * @param action.path - Path of action that was dispatched
 * @param action.data - Data associated with action
 * @see https://react-redux-firebase.com/docs/api/reducer.html
 */
export function firestoreReducer<Schema extends Record<string, any> = {}>(
  state: any,
  action: any,
): Reducer<FirestoreReducer.State<Schema>>;

export function firebaseReducer<Schema extends Record<string, any> = {}>(
  state: any,
  action: any,
): Reducer<FirebaseReducer.State<Schema>>;

/**
 * Create a firestore instance that has helpers attached for dispatching actions
 */
export function createFirestoreInstance(
  firebaseInstance: typeof Firebase,
  configs: Partial<Config>,
  dispatch: Dispatch,
): object;

/**
 * A redux store reducer for Firestore state
 */
export namespace firestoreReducer {
  const prototype: {};
}

/**
 * A redux store reducer for Firestore state
 */
export namespace reduxFirestore {
  const prototype: {};
}

export namespace FirebaseReducer {
  const prototype: {};
  export interface Reducer<Schema extends Record<string, any> = {}> {
    profile: any;
  }
}

export namespace FirestoreReducer {
  declare const entitySymbol: unique symbol;
  declare const entityPath: unique symbol;
  declare const entityId: unique symbol;
  declare const queryAlias: unique symbol;

  export type Entity<T> = T & {
    [entitySymbol]: never;
  };
  export type EntityWithId<T> = T & { id: entityId };
  export type EntityWithIdPath<T> = EntityWithId<T> & { path: entityPath };
  export type FirestoreData<Schema extends Record<string, any>> = {
    [T in keyof Schema]: Record<
      string,
      Schema[T] extends Entity<infer V> ? V : FirestoreData<Schema[T]>
    >;
  };

  export type OrderedData<Schema extends Record<string, any>> = {
    [T in keyof Schema]: Schema[T] extends Entity<infer V>
      ? EntityWithId<V>[]
      : OrderedData<EntityWithId<Schema[T]>>[];
  };

  export interface CacheDatabase<T> {
    [entityPath]: { entityId: Entity<T> };
  }
  export type CachedData<Schema extends Record<string, any>> = {
    [T in keyof Schema]: Schema[T] extends Entity<infer V>
      ? EntityWithIdPath<V>[]
      : CachedData<EntityWithIdPath<Schema[T]>>[];
  };

  export interface Reducer<Schema extends Record<string, any> = {}> {
    errors: {
      allIds: string[];
      byQuery: any[];
    };
    listeners: Listeners;
    queries: Data<ReduxFirestoreQuerySetting & (Dictionary<any> | any)>;
    cache: CachedData<Schema> & {
      database: CacheDatabase<Schema>;
      databaseOverrides: CacheDatabase<Schema> | null;
      [queryAlias]: ReduxFirestoreQuerySetting & {
        ordered: [entityId, entityPath][];
      };
    };
    status: {
      requested: Dictionary<boolean>;
      requesting: Dictionary<boolean>;
      timestamps: Dictionary<number>;
    };
  }

  const prototype: {};
}
