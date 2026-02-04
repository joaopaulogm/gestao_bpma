/** Declarações para o editor: Supabase Edge Functions rodam em Deno. */
declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(
    handler: (req: Request) => Response | Promise<Response>,
    options?: { port?: number }
  ): void;
}

interface SupabaseClient {
  from: (table: string) => { select: (cols?: string) => unknown; insert: (data: unknown) => unknown; delete: () => unknown; order: (col: string, opts: { ascending: boolean }) => unknown; gte: (col: string, val: number) => unknown };
  functions: { invoke: (name: string, opts?: { body?: unknown }) => Promise<{ data: unknown; error: unknown }> };
}
declare module "https://esm.sh/@supabase/supabase-js@2" {
  export function createClient(url: string, key: string, options?: Record<string, unknown>): SupabaseClient;
}
declare module "https://esm.sh/@supabase/supabase-js@2.39.0" {
  export function createClient(url: string, key: string, options?: Record<string, unknown>): SupabaseClient;
}
declare module "https://esm.sh/@supabase/supabase-js@2.49.1" {
  export function createClient(url: string, key: string, options?: Record<string, unknown>): SupabaseClient;
}

declare const Deno: {
  env: { get: (key: string) => string | undefined };
};
