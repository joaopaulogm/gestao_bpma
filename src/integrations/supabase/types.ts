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
      allowed_users: {
        Row: {
          created_at: string | null
          efetivo_id: string | null
          email: string
          id: string
          nome: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          efetivo_id?: string | null
          email: string
          id?: string
          nome?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          efetivo_id?: string | null
          email?: string
          id?: string
          nome?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "allowed_users_efetivo_id_fkey"
            columns: ["efetivo_id"]
            isOneToOne: false
            referencedRelation: "dim_efetivo"
            referencedColumns: ["id"]
          },
        ]
      }
      dim_area_protegida: {
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
      dim_efetivo: {
        Row: {
          antiguidade: number | null
          created_at: string
          id: string
          lotacao: string
          matricula: string
          nome: string
          nome_guerra: string
          posto_graduacao: string
          quadro: string
          quadro_sigla: string
          sexo: string
        }
        Insert: {
          antiguidade?: number | null
          created_at?: string
          id?: string
          lotacao?: string
          matricula: string
          nome: string
          nome_guerra: string
          posto_graduacao: string
          quadro: string
          quadro_sigla: string
          sexo: string
        }
        Update: {
          antiguidade?: number | null
          created_at?: string
          id?: string
          lotacao?: string
          matricula?: string
          nome?: string
          nome_guerra?: string
          posto_graduacao?: string
          quadro?: string
          quadro_sigla?: string
          sexo?: string
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
          "Bem Apreendido": string
          created_at: string | null
          id: string
          Item: string
          "Tipo de Crime": string
          "Uso Ilicito": string
        }
        Insert: {
          "Bem Apreendido": string
          created_at?: string | null
          id?: string
          Item: string
          "Tipo de Crime": string
          "Uso Ilicito": string
        }
        Update: {
          "Bem Apreendido"?: string
          created_at?: string | null
          id?: string
          Item?: string
          "Tipo de Crime"?: string
          "Uso Ilicito"?: string
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
      fat_crime_fauna: {
        Row: {
          atropelamento: boolean | null
          created_at: string | null
          destinacao_id: string | null
          especie_id: string | null
          estado_saude_id: string | null
          estagio_vida_id: string | null
          id: string
          id_ocorrencia: string | null
          quantidade_adulto: number | null
          quantidade_filhote: number | null
          quantidade_total: number | null
        }
        Insert: {
          atropelamento?: boolean | null
          created_at?: string | null
          destinacao_id?: string | null
          especie_id?: string | null
          estado_saude_id?: string | null
          estagio_vida_id?: string | null
          id?: string
          id_ocorrencia?: string | null
          quantidade_adulto?: number | null
          quantidade_filhote?: number | null
          quantidade_total?: number | null
        }
        Update: {
          atropelamento?: boolean | null
          created_at?: string | null
          destinacao_id?: string | null
          especie_id?: string | null
          estado_saude_id?: string | null
          estagio_vida_id?: string | null
          id?: string
          id_ocorrencia?: string | null
          quantidade_adulto?: number | null
          quantidade_filhote?: number | null
          quantidade_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fat_crime_fauna_destinacao_id_fkey"
            columns: ["destinacao_id"]
            isOneToOne: false
            referencedRelation: "dim_destinacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_crime_fauna_especie_id_fkey"
            columns: ["especie_id"]
            isOneToOne: false
            referencedRelation: "dim_especies_fauna"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_crime_fauna_estado_saude_id_fkey"
            columns: ["estado_saude_id"]
            isOneToOne: false
            referencedRelation: "dim_estado_saude"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_crime_fauna_estagio_vida_id_fkey"
            columns: ["estagio_vida_id"]
            isOneToOne: false
            referencedRelation: "dim_estagio_vida"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_crime_fauna_id_ocorrencia_fkey"
            columns: ["id_ocorrencia"]
            isOneToOne: false
            referencedRelation: "fat_registros_de_crime"
            referencedColumns: ["id"]
          },
        ]
      }
      fat_crime_flora: {
        Row: {
          condicao: string | null
          created_at: string | null
          destinacao: string | null
          especie_id: string | null
          id: string
          id_ocorrencia: string | null
          quantidade: number | null
        }
        Insert: {
          condicao?: string | null
          created_at?: string | null
          destinacao?: string | null
          especie_id?: string | null
          id?: string
          id_ocorrencia?: string | null
          quantidade?: number | null
        }
        Update: {
          condicao?: string | null
          created_at?: string | null
          destinacao?: string | null
          especie_id?: string | null
          id?: string
          id_ocorrencia?: string | null
          quantidade?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fat_crime_flora_especie_id_fkey"
            columns: ["especie_id"]
            isOneToOne: false
            referencedRelation: "dim_especies_flora"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_crime_flora_id_ocorrencia_fkey"
            columns: ["id_ocorrencia"]
            isOneToOne: false
            referencedRelation: "fat_registros_de_crime"
            referencedColumns: ["id"]
          },
        ]
      }
      fat_equipe_crime: {
        Row: {
          created_at: string
          efetivo_id: string
          id: string
          registro_id: string
        }
        Insert: {
          created_at?: string
          efetivo_id: string
          id?: string
          registro_id: string
        }
        Update: {
          created_at?: string
          efetivo_id?: string
          id?: string
          registro_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fat_equipe_crime_efetivo_id_fkey"
            columns: ["efetivo_id"]
            isOneToOne: false
            referencedRelation: "dim_efetivo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_equipe_crime_registro_id_fkey"
            columns: ["registro_id"]
            isOneToOne: false
            referencedRelation: "fat_registros_de_crime"
            referencedColumns: ["id"]
          },
        ]
      }
      fat_equipe_resgate: {
        Row: {
          created_at: string
          efetivo_id: string
          id: string
          registro_id: string
        }
        Insert: {
          created_at?: string
          efetivo_id: string
          id?: string
          registro_id: string
        }
        Update: {
          created_at?: string
          efetivo_id?: string
          id?: string
          registro_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fat_equipe_resgate_efetivo_id_fkey"
            columns: ["efetivo_id"]
            isOneToOne: false
            referencedRelation: "dim_efetivo"
            referencedColumns: ["id"]
          },
        ]
      }
      fat_ocorrencia_apreensao: {
        Row: {
          created_at: string | null
          id: string
          id_item_apreendido: string | null
          id_ocorrencia: string | null
          quantidade: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          id_item_apreendido?: string | null
          id_ocorrencia?: string | null
          quantidade?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          id_item_apreendido?: string | null
          id_ocorrencia?: string | null
          quantidade?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fat_ocorrencia_apreensao_id_ocorrencia_fkey"
            columns: ["id_ocorrencia"]
            isOneToOne: false
            referencedRelation: "fat_registros_de_crime"
            referencedColumns: ["id"]
          },
        ]
      }
      fat_registros_de_crime: {
        Row: {
          alteracao_visual: boolean | null
          animal_afetado: boolean | null
          area_protegida: boolean | null
          areas_protegidas_ids: string[] | null
          created_at: string | null
          dano_perceptivel: string | null
          data: string
          descricao_adm_ambiental: string | null
          descricao_material_adm: string | null
          descricao_material_ord: string | null
          descricao_poluicao: string | null
          desfecho_id: string | null
          doc_irregular: boolean | null
          enquadramento_id: string | null
          estruturas_encontradas: string | null
          id: string
          intensidade_percebida: string | null
          latitude: string
          longitude: string
          maquinas_presentes: boolean | null
          material_apreendido_adm: boolean | null
          material_apreendido_ord: boolean | null
          material_visivel: string | null
          mortandade_animais: boolean | null
          ocorreu_apreensao: boolean | null
          odor_forte: boolean | null
          origem_aparente: string | null
          procedimento_legal: string | null
          qtd_detidos_maior: number | null
          qtd_detidos_menor: number | null
          qtd_estruturas: number | null
          qtd_liberados_maior: number | null
          qtd_liberados_menor: number | null
          regiao_administrativa_id: string | null
          risco_imediato: boolean | null
          tipo_area_id: string | null
          tipo_crime_id: string | null
          tipo_impedimento: string | null
          tipo_intervencao: string | null
          tipo_irregularidade_visual: string | null
          tipo_poluicao: string | null
          vegetacao_afetada: boolean | null
          veiculo_relacionado: boolean | null
          volume_aparente: string | null
        }
        Insert: {
          alteracao_visual?: boolean | null
          animal_afetado?: boolean | null
          area_protegida?: boolean | null
          areas_protegidas_ids?: string[] | null
          created_at?: string | null
          dano_perceptivel?: string | null
          data: string
          descricao_adm_ambiental?: string | null
          descricao_material_adm?: string | null
          descricao_material_ord?: string | null
          descricao_poluicao?: string | null
          desfecho_id?: string | null
          doc_irregular?: boolean | null
          enquadramento_id?: string | null
          estruturas_encontradas?: string | null
          id?: string
          intensidade_percebida?: string | null
          latitude: string
          longitude: string
          maquinas_presentes?: boolean | null
          material_apreendido_adm?: boolean | null
          material_apreendido_ord?: boolean | null
          material_visivel?: string | null
          mortandade_animais?: boolean | null
          ocorreu_apreensao?: boolean | null
          odor_forte?: boolean | null
          origem_aparente?: string | null
          procedimento_legal?: string | null
          qtd_detidos_maior?: number | null
          qtd_detidos_menor?: number | null
          qtd_estruturas?: number | null
          qtd_liberados_maior?: number | null
          qtd_liberados_menor?: number | null
          regiao_administrativa_id?: string | null
          risco_imediato?: boolean | null
          tipo_area_id?: string | null
          tipo_crime_id?: string | null
          tipo_impedimento?: string | null
          tipo_intervencao?: string | null
          tipo_irregularidade_visual?: string | null
          tipo_poluicao?: string | null
          vegetacao_afetada?: boolean | null
          veiculo_relacionado?: boolean | null
          volume_aparente?: string | null
        }
        Update: {
          alteracao_visual?: boolean | null
          animal_afetado?: boolean | null
          area_protegida?: boolean | null
          areas_protegidas_ids?: string[] | null
          created_at?: string | null
          dano_perceptivel?: string | null
          data?: string
          descricao_adm_ambiental?: string | null
          descricao_material_adm?: string | null
          descricao_material_ord?: string | null
          descricao_poluicao?: string | null
          desfecho_id?: string | null
          doc_irregular?: boolean | null
          enquadramento_id?: string | null
          estruturas_encontradas?: string | null
          id?: string
          intensidade_percebida?: string | null
          latitude?: string
          longitude?: string
          maquinas_presentes?: boolean | null
          material_apreendido_adm?: boolean | null
          material_apreendido_ord?: boolean | null
          material_visivel?: string | null
          mortandade_animais?: boolean | null
          ocorreu_apreensao?: boolean | null
          odor_forte?: boolean | null
          origem_aparente?: string | null
          procedimento_legal?: string | null
          qtd_detidos_maior?: number | null
          qtd_detidos_menor?: number | null
          qtd_estruturas?: number | null
          qtd_liberados_maior?: number | null
          qtd_liberados_menor?: number | null
          regiao_administrativa_id?: string | null
          risco_imediato?: boolean | null
          tipo_area_id?: string | null
          tipo_crime_id?: string | null
          tipo_impedimento?: string | null
          tipo_intervencao?: string | null
          tipo_irregularidade_visual?: string | null
          tipo_poluicao?: string | null
          vegetacao_afetada?: boolean | null
          veiculo_relacionado?: boolean | null
          volume_aparente?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fat_registros_de_crime_desfecho_id_fkey"
            columns: ["desfecho_id"]
            isOneToOne: false
            referencedRelation: "dim_desfecho"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_registros_de_crime_regiao_administrativa_id_fkey"
            columns: ["regiao_administrativa_id"]
            isOneToOne: false
            referencedRelation: "dim_regiao_administrativa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_registros_de_crime_tipo_area_id_fkey"
            columns: ["tipo_area_id"]
            isOneToOne: false
            referencedRelation: "dim_tipo_de_area"
            referencedColumns: ["id"]
          },
        ]
      }
      fat_registros_de_resgate: {
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
          tipo_area_id: string | null
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
          tipo_area_id?: string | null
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
          tipo_area_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fat_registros_de_resgate_tipo_area_id_fkey"
            columns: ["tipo_area_id"]
            isOneToOne: false
            referencedRelation: "dim_tipo_de_area"
            referencedColumns: ["id"]
          },
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
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_allowed_user: { Args: { check_email: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "user"
        | "operador"
        | "secao_operacional"
        | "secao_pessoas"
        | "secao_logistica"
        | "publico"
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
    Enums: {
      app_role: [
        "admin",
        "user",
        "operador",
        "secao_operacional",
        "secao_pessoas",
        "secao_logistica",
        "publico",
      ],
    },
  },
} as const
