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
      dim_desfecho: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          tipo: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          tipo: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          tipo?: string
        }
        Relationships: []
      }
      dim_destinacao: {
        Row: {
          created_at: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      dim_enquadramento: {
        Row: {
          Enquadramento: string | null
          id_enquadramento: string
          id_tipo_de_crime: string
          "Tipo de Crime": string | null
        }
        Insert: {
          Enquadramento?: string | null
          id_enquadramento?: string
          id_tipo_de_crime: string
          "Tipo de Crime"?: string | null
        }
        Update: {
          Enquadramento?: string | null
          id_enquadramento?: string
          id_tipo_de_crime?: string
          "Tipo de Crime"?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dim_enquadramento_id_tipo_de_crime_fkey"
            columns: ["id_tipo_de_crime"]
            isOneToOne: false
            referencedRelation: "dim_tipo_de_crime"
            referencedColumns: ["id_tipo_de_crime"]
          },
        ]
      }
      dim_especies_fauna: {
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
      dim_especies_flora: {
        Row: {
          Classe: string | null
          "Estado de Conservação": string | null
          Família: string | null
          id: string
          "Imune ao Corte": string | null
          "Madeira de Lei": string | null
          "Nome Científico": string | null
          "Nome Popular": string | null
          Ordem: string | null
          "Tipo de Planta": string | null
        }
        Insert: {
          Classe?: string | null
          "Estado de Conservação"?: string | null
          Família?: string | null
          id?: string
          "Imune ao Corte"?: string | null
          "Madeira de Lei"?: string | null
          "Nome Científico"?: string | null
          "Nome Popular"?: string | null
          Ordem?: string | null
          "Tipo de Planta"?: string | null
        }
        Update: {
          Classe?: string | null
          "Estado de Conservação"?: string | null
          Família?: string | null
          id?: string
          "Imune ao Corte"?: string | null
          "Madeira de Lei"?: string | null
          "Nome Científico"?: string | null
          "Nome Popular"?: string | null
          Ordem?: string | null
          "Tipo de Planta"?: string | null
        }
        Relationships: []
      }
      dim_estado_saude: {
        Row: {
          created_at: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      dim_estagio_vida: {
        Row: {
          created_at: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      dim_itens_apreensao: {
        Row: {
          Aplicacao: string | null
          Categoria: string | null
          id: string
          Item: string | null
          "Uso Ilicito": string | null
        }
        Insert: {
          Aplicacao?: string | null
          Categoria?: string | null
          id?: string
          Item?: string | null
          "Uso Ilicito"?: string | null
        }
        Update: {
          Aplicacao?: string | null
          Categoria?: string | null
          id?: string
          Item?: string | null
          "Uso Ilicito"?: string | null
        }
        Relationships: []
      }
      dim_origem: {
        Row: {
          created_at: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      dim_regiao_administrativa: {
        Row: {
          created_at: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      dim_tipo_de_area: {
        Row: {
          created_at: string
          id: string
          "Tipo de Área": string | null
        }
        Insert: {
          created_at?: string
          id?: string
          "Tipo de Área"?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          "Tipo de Área"?: string | null
        }
        Relationships: []
      }
      dim_tipo_de_crime: {
        Row: {
          created_at: string
          id_tipo_de_crime: string
          "Tipo de Crime": string | null
        }
        Insert: {
          created_at?: string
          id_tipo_de_crime?: string
          "Tipo de Crime"?: string | null
        }
        Update: {
          created_at?: string
          id_tipo_de_crime?: string
          "Tipo de Crime"?: string | null
        }
        Relationships: []
      }
      registros: {
        Row: {
          atropelamento: string
          created_at: string
          data: string
          desfecho_id: string | null
          destinacao_id: string | null
          especie_id: string | null
          estado_saude_id: string | null
          estagio_vida_id: string | null
          hora_guarda_ceapa: string | null
          id: string
          latitude_origem: string
          latitude_soltura: string | null
          longitude_origem: string
          longitude_soltura: string | null
          motivo_entrega_ceapa: string | null
          numero_tco: string | null
          numero_termo_entrega: string | null
          origem_id: string | null
          outro_desfecho: string | null
          outro_destinacao: string | null
          quantidade: number | null
          quantidade_adulto: number | null
          quantidade_filhote: number | null
          quantidade_total: number | null
          regiao_administrativa_id: string | null
        }
        Insert: {
          atropelamento: string
          created_at?: string
          data: string
          desfecho_id?: string | null
          destinacao_id?: string | null
          especie_id?: string | null
          estado_saude_id?: string | null
          estagio_vida_id?: string | null
          hora_guarda_ceapa?: string | null
          id?: string
          latitude_origem: string
          latitude_soltura?: string | null
          longitude_origem: string
          longitude_soltura?: string | null
          motivo_entrega_ceapa?: string | null
          numero_tco?: string | null
          numero_termo_entrega?: string | null
          origem_id?: string | null
          outro_desfecho?: string | null
          outro_destinacao?: string | null
          quantidade?: number | null
          quantidade_adulto?: number | null
          quantidade_filhote?: number | null
          quantidade_total?: number | null
          regiao_administrativa_id?: string | null
        }
        Update: {
          atropelamento?: string
          created_at?: string
          data?: string
          desfecho_id?: string | null
          destinacao_id?: string | null
          especie_id?: string | null
          estado_saude_id?: string | null
          estagio_vida_id?: string | null
          hora_guarda_ceapa?: string | null
          id?: string
          latitude_origem?: string
          latitude_soltura?: string | null
          longitude_origem?: string
          longitude_soltura?: string | null
          motivo_entrega_ceapa?: string | null
          numero_tco?: string | null
          numero_termo_entrega?: string | null
          origem_id?: string | null
          outro_desfecho?: string | null
          outro_destinacao?: string | null
          quantidade?: number | null
          quantidade_adulto?: number | null
          quantidade_filhote?: number | null
          quantidade_total?: number | null
          regiao_administrativa_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_registros_desfecho"
            columns: ["desfecho_id"]
            isOneToOne: false
            referencedRelation: "dim_desfecho"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_registros_destinacao"
            columns: ["destinacao_id"]
            isOneToOne: false
            referencedRelation: "dim_destinacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_registros_especie"
            columns: ["especie_id"]
            isOneToOne: false
            referencedRelation: "dim_especies_fauna"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_registros_estado_saude"
            columns: ["estado_saude_id"]
            isOneToOne: false
            referencedRelation: "dim_estado_saude"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_registros_estagio_vida"
            columns: ["estagio_vida_id"]
            isOneToOne: false
            referencedRelation: "dim_estagio_vida"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_registros_origem"
            columns: ["origem_id"]
            isOneToOne: false
            referencedRelation: "dim_origem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_registros_regiao"
            columns: ["regiao_administrativa_id"]
            isOneToOne: false
            referencedRelation: "dim_regiao_administrativa"
            referencedColumns: ["id"]
          },
        ]
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
