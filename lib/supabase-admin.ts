import { createClient } from "@supabase/supabase-js";
import { requireEnv } from "@/lib/env";

interface GenericTable {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: [];
}

interface SupabaseDatabase {
  public: {
    Tables: {
      users: GenericTable;
      buckets: GenericTable;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

let adminClient: ReturnType<typeof createClient<SupabaseDatabase>> | null = null;

export function getSupabaseAdmin() {
  if (!adminClient) {
    adminClient = createClient<SupabaseDatabase>(
      requireEnv("SUPABASE_URL"),
      requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  return adminClient;
}
