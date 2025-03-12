export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          quantidade_adulto: number | null
          quantidade_filhote: number | null
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
          quantidade_adulto?: number | null
          quantidade_filhote?: number | null
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
          quantidade_adulto?: number | null
          quantidade_filhote?: number | null
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
