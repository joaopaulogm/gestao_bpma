/** Declarações para o editor: Supabase Edge Functions rodam em Deno. */
declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(
    handler: (req: Request) => Response | Promise<Response>,
    options?: { port?: number }
  ): void;
}

declare module "https://deno.land/std@0.168.0/encoding/base64.ts" {
  export function decode(input: string): Uint8Array;
  export function encode(input: Uint8Array | string): string;
}

declare module "https://deno.land/std@0.168.0/testing/asserts.ts" {
  export function assertEquals(actual: unknown, expected: unknown, msg?: string): void;
  export function assertExists(actual: unknown, msg?: string): void;
  export function assertThrows(fn: () => unknown, msg?: string): void;
}

// Full Supabase client type with all methods - uses any for flexibility
interface SupabaseQueryBuilder extends Promise<{ data: any; error: any }> {
  select: (cols?: string) => SupabaseQueryBuilder;
  insert: (data: any) => SupabaseQueryBuilder;
  update: (data: any) => SupabaseQueryBuilder;
  upsert: (data: any, opts?: { onConflict?: string }) => SupabaseQueryBuilder;
  delete: () => SupabaseQueryBuilder;
  eq: (col: string, val: any) => SupabaseQueryBuilder;
  neq: (col: string, val: any) => SupabaseQueryBuilder;
  gt: (col: string, val: any) => SupabaseQueryBuilder;
  gte: (col: string, val: any) => SupabaseQueryBuilder;
  lt: (col: string, val: any) => SupabaseQueryBuilder;
  lte: (col: string, val: any) => SupabaseQueryBuilder;
  like: (col: string, val: string) => SupabaseQueryBuilder;
  ilike: (col: string, val: string) => SupabaseQueryBuilder;
  is: (col: string, val: any) => SupabaseQueryBuilder;
  in: (col: string, vals: any[]) => SupabaseQueryBuilder;
  contains: (col: string, val: any) => SupabaseQueryBuilder;
  containedBy: (col: string, val: any) => SupabaseQueryBuilder;
  range: (col: string, val: any) => SupabaseQueryBuilder;
  or: (filters: string) => SupabaseQueryBuilder;
  filter: (col: string, op: string, val: any) => SupabaseQueryBuilder;
  and: (filters: string) => SupabaseQueryBuilder;
  not: (col: string, op: string, val: any) => SupabaseQueryBuilder;
  order: (col: string, opts?: { ascending?: boolean }) => SupabaseQueryBuilder;
  limit: (count: number) => SupabaseQueryBuilder;
  single: () => SupabaseQueryBuilder;
  maybeSingle: () => SupabaseQueryBuilder;
}

interface SupabaseStorageBucket {
  upload: (path: string, file: Blob | ArrayBuffer, opts?: { contentType?: string; upsert?: boolean }) => Promise<{ data: { path: string } | null; error: any }>;
  download: (path: string) => Promise<{ data: Blob | null; error: any }>;
  list: (path?: string, opts?: any) => Promise<{ data: any[]; error: any }>;
  remove: (paths: string[]) => Promise<{ data: any; error: any }>;
  getPublicUrl: (path: string) => { data: { publicUrl: string } };
}

interface SupabaseStorage {
  from: (bucket: string) => SupabaseStorageBucket;
  listBuckets: () => Promise<{ data: any[]; error: any }>;
  createBucket: (name: string, opts?: any) => Promise<{ data: any; error: any }>;
}

interface SupabaseAuth {
  getUser: (jwt?: string) => Promise<{ data: { user: { id: string; email?: string } | null }; error: any }>;
  signInWithPassword: (credentials: { email: string; password: string }) => Promise<{ data: any; error: any }>;
  signUp: (credentials: { email: string; password: string }) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  admin: {
    createUser: (opts: any) => Promise<{ data: any; error: any }>;
    deleteUser: (id: string) => Promise<{ data: any; error: any }>;
    listUsers: (opts?: any) => Promise<{ data: { users: any[] }; error: any }>;
    updateUserById: (id: string, attrs: any) => Promise<{ data: any; error: any }>;
  };
}

interface SupabaseClient {
  from: (table: string) => SupabaseQueryBuilder;
  rpc: (fn: string, params?: any) => SupabaseQueryBuilder;
  storage: SupabaseStorage;
  auth: SupabaseAuth;
  functions: { invoke: (name: string, opts?: { body?: any }) => Promise<{ data: any; error: any }> };
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  export function createClient(url: string, key: string, options?: Record<string, any>): SupabaseClient;
}
declare module "https://esm.sh/@supabase/supabase-js@2.39.0" {
  export function createClient(url: string, key: string, options?: Record<string, any>): SupabaseClient;
}
declare module "https://esm.sh/@supabase/supabase-js@2.49.1" {
  export function createClient(url: string, key: string, options?: Record<string, any>): SupabaseClient;
}

declare const Deno: {
  env: { get: (key: string) => string | undefined };
  test: (name: string, fn: () => void | Promise<void>) => void;
  serve: typeof serve;
};

declare function serve(
  handler: (req: Request) => Response | Promise<Response>,
  options?: { port?: number }
): void;

declare const EdgeRuntime: {
  waitUntil: (promise: Promise<any>) => void;
};
