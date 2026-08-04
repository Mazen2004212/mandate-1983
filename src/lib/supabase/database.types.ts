export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PoliticalBackgroundId =
  | "civil_service_reformer"
  | "labor_mediator"
  | "provincial_governor"
  | "security_insider";

export type MutationReceiptType = "choice_resolution" | "period_advance";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          updated_at?: string;
        };
        Relationships: [];
      };
      saves: {
        Row: {
          save_id: string;
          owner_id: string;
          save_version: "save-1.0.0";
          content_version: "mvp-0.1.0";
          schema_version: "schema-1.0.0";
          revision: number;
          game_seed: string;
          political_period: number;
          selected_background: PoliticalBackgroundId;
          family_identity: Json;
          authoritative_state: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          save_id: string;
          owner_id: string;
          save_version: "save-1.0.0";
          content_version: "mvp-0.1.0";
          schema_version: "schema-1.0.0";
          revision: number;
          game_seed: string;
          political_period: number;
          selected_background: PoliticalBackgroundId;
          family_identity: Json;
          authoritative_state: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          updated_at?: string;
        };
        Relationships: [];
      };
      mutation_history: {
        Row: {
          save_id: string;
          idempotency_key: string;
          mutation_type: MutationReceiptType;
          expected_revision: number;
          resulting_revision: number;
          occurred_at: string;
          receipt_body: Json;
          created_at: string;
        };
        Insert: {
          save_id: string;
          idempotency_key: string;
          mutation_type: MutationReceiptType;
          expected_revision: number;
          resulting_revision: number;
          occurred_at: string;
          receipt_body: Json;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [
          {
            foreignKeyName: "mutation_history_save_id_fkey";
            columns: ["save_id"];
            isOneToOne: false;
            referencedRelation: "saves";
            referencedColumns: ["save_id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
