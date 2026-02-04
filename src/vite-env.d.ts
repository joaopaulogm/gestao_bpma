/// <reference types="vite/client" />

declare module 'react-router-dom' {
  import type { ComponentType, ReactNode } from 'react';
  export function useLocation(): { pathname: string; search: string; hash: string; state: unknown; key: string };
  export function useNavigate(): (to: string | number, options?: { replace?: boolean }) => void;
  export function useSearchParams(): [URLSearchParams, (params: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams)) => void];
  export function useParams(): Record<string, string | undefined>;
  export const BrowserRouter: ComponentType<{ children?: ReactNode }>;
  export const Routes: ComponentType<{ children?: ReactNode }>;
  export const Route: ComponentType<{ path?: string; element?: ReactNode; index?: boolean }>;
  export const Navigate: ComponentType<{ to: string; replace?: boolean }>;
  export const Link: ComponentType<{ to: string; className?: string; children?: ReactNode; [key: string]: unknown }>;
  export const Outlet: ComponentType<object>;
}
