export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      especies_fauna: {
        Row: {
          classe_taxonomica: string
          estado_de_conservacao: string
          id: string
          nome_cientifico: string
          nome_popular: string
          ordem_taxonomica: string
          tipo_de_fauna: string
        }
        Insert: {
          classe_taxonomica: string
          estado_de_conservacao: string
          id?: string
          nome_cientifico: string
          nome_popular: string
          ordem_taxonomica: string
          tipo_de_fauna: string
        }
        Update: {
          classe_taxonomica?: string
          estado_de_conservacao?: string
          id?: string
          nome_cientifico?: string
          nome_popular?: string
          ordem_taxonomica?: string
          tipo_de_fauna?: string
        }
        Relationships: []
      }
      registros: {
        Row: {
          atropelamento: string
          classe_taxonomica: string
          created_at: string
          data: string
          desfecho_apreensao: string | null
          desfecho_resgate: string | null
          destinacao: string
          estado_saude: string
          estagio_vida: string
          hora_guarda_ceapa: string | null
          id: string
          latitude_origem: string
          latitude_soltura: string | null
          longitude_origem: string
          longitude_soltura: string | null
          motivo_entrega_ceapa: string | null
          nome_cientifico: string
          nome_popular: string
          numero_tco: string | null
          numero_termo_entrega: string | null
          origem: string
          outro_desfecho: string | null
          outro_destinacao: string | null
          quantidade: number | null
          quantidade_adulto: number | null
          quantidade_filhote: number | null
          quantidade_total: number | null
          regiao_administrativa: string
        }
        Insert: {
          atropelamento: string
          classe_taxonomica: string
          created_at?: string
          data: string
          desfecho_apreensao?: string | null
          desfecho_resgate?: string | null
          destinacao: string
          estado_saude: string
          estagio_vida: string
          hora_guarda_ceapa?: string | null
          id?: string
          latitude_origem: string
          latitude_soltura?: string | null
          longitude_origem: string
          longitude_soltura?: string | null
          motivo_entrega_ceapa?: string | null
          nome_cientifico: string
          nome_popular: string
          numero_tco?: string | null
          numero_termo_entrega?: string | null
          origem: string
          outro_desfecho?: string | null
          outro_destinacao?: string | null
          quantidade?: number | null
          quantidade_adulto?: number | null
          quantidade_filhote?: number | null
          quantidade_total?: number | null
          regiao_administrativa: string
        }
        Update: {
          atropelamento?: string
          classe_taxonomica?: string
          created_at?: string
          data?: string
          desfecho_apreensao?: string | null
          desfecho_resgate?: string | null
          destinacao?: string
          estado_saude?: string
          estagio_vida?: string
          hora_guarda_ceapa?: string | null
          id?: string
          latitude_origem?: string
          latitude_soltura?: string | null
          longitude_origem?: string
          longitude_soltura?: string | null
          motivo_entrega_ceapa?: string | null
          nome_cientifico?: string
          nome_popular?: string
          numero_tco?: string | null
          numero_termo_entrega?: string | null
          origem?: string
          outro_desfecho?: string | null
          outro_destinacao?: string | null
          quantidade?: number | null
          quantidade_adulto?: number | null
          quantidade_filhote?: number | null
          quantidade_total?: number | null
          regiao_administrativa?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
