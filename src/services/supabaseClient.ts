
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://oiwwptnqaunsyhpkwbrz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pd3dwdG5xYXVuc3locGt3YnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NjI2MzQsImV4cCI6MjA1NjMzODYzNH0.lK5-KS8bxrtQYJsCRNOeeqBS-9Fn0MMsIdolhkeApuE';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: (url, options = {}) => {
      // Aumentar timeout para 60 segundos
      // Se já houver um signal nas opções, criar um AbortController que combine ambos
      const existingSignal = (options as RequestInit)?.signal;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      // Se houver um signal existente, combinar com o timeout
      if (existingSignal) {
        existingSignal.addEventListener('abort', () => {
          controller.abort();
        });
      }
      
      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => {
        clearTimeout(timeoutId);
      });
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
