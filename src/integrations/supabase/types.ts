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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
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
      dim_desfecho_crime_ambientais: {
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
      dim_desfecho_crime_comum: {
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
      dim_desfecho_resgates: {
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
          ativo: boolean
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
          ativo?: boolean
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
          ativo?: boolean
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
      dim_equipes: {
        Row: {
          created_at: string
          escala: string | null
          grupamento: string
          id: string
          nome: string
          servico: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          escala?: string | null
          grupamento: string
          id?: string
          nome: string
          servico?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          escala?: string | null
          grupamento?: string
          id?: string
          nome?: string
          servico?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dim_equipes_campanha: {
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
      dim_especies_fauna: {
        Row: {
          classe_taxonomica: string | null
          estado_de_conservacao: string | null
          familia_taxonomica: string | null
          foto_fonte_validacao: string | null
          foto_principal_path: string | null
          foto_status: string | null
          foto_validada_em: string | null
          fotos_paths: Json | null
          id: string
          imagens: Json | null
          imagens_atualizado_em: string | null
          imagens_erro: string | null
          imagens_fontes: Json | null
          imagens_paths: Json | null
          imagens_qtd: number | null
          imagens_status: string | null
          imagens_updated_at: string | null
          nome_cientifico: string | null
          nome_cientifico_slug: string | null
          nome_popular: string | null
          nomes_populares: Json | null
          ordem_taxonomica: string | null
          tipo_de_fauna: string | null
        }
        Insert: {
          classe_taxonomica?: string | null
          estado_de_conservacao?: string | null
          familia_taxonomica?: string | null
          foto_fonte_validacao?: string | null
          foto_principal_path?: string | null
          foto_status?: string | null
          foto_validada_em?: string | null
          fotos_paths?: Json | null
          id: string
          imagens?: Json | null
          imagens_atualizado_em?: string | null
          imagens_erro?: string | null
          imagens_fontes?: Json | null
          imagens_paths?: Json | null
          imagens_qtd?: number | null
          imagens_status?: string | null
          imagens_updated_at?: string | null
          nome_cientifico?: string | null
          nome_cientifico_slug?: string | null
          nome_popular?: string | null
          nomes_populares?: Json | null
          ordem_taxonomica?: string | null
          tipo_de_fauna?: string | null
        }
        Update: {
          classe_taxonomica?: string | null
          estado_de_conservacao?: string | null
          familia_taxonomica?: string | null
          foto_fonte_validacao?: string | null
          foto_principal_path?: string | null
          foto_status?: string | null
          foto_validada_em?: string | null
          fotos_paths?: Json | null
          id?: string
          imagens?: Json | null
          imagens_atualizado_em?: string | null
          imagens_erro?: string | null
          imagens_fontes?: Json | null
          imagens_paths?: Json | null
          imagens_qtd?: number | null
          imagens_status?: string | null
          imagens_updated_at?: string | null
          nome_cientifico?: string | null
          nome_cientifico_slug?: string | null
          nome_popular?: string | null
          nomes_populares?: Json | null
          ordem_taxonomica?: string | null
          tipo_de_fauna?: string | null
        }
        Relationships: []
      }
      dim_especies_flora: {
        Row: {
          classe_taxonomica: string | null
          estado_de_conservacao: string | null
          familia_taxonomica: string | null
          foto_fonte_validacao: string | null
          foto_principal_path: string | null
          foto_status: string | null
          foto_validada_em: string | null
          fotos_paths: Json | null
          id: string
          imagens: Json | null
          imagens_atualizado_em: string | null
          imagens_erro: string | null
          imagens_fontes: Json | null
          imagens_paths: Json | null
          imagens_qtd: number | null
          imagens_status: string | null
          imagens_updated_at: string | null
          imune_ao_corte: string | null
          madeira_de_lei: string | null
          nome_cientifico: string | null
          nome_cientifico_slug: string | null
          nome_popular: string | null
          nomes_populares: Json | null
          ordem_taxonomica: string | null
          tipo_de_planta: string | null
        }
        Insert: {
          classe_taxonomica?: string | null
          estado_de_conservacao?: string | null
          familia_taxonomica?: string | null
          foto_fonte_validacao?: string | null
          foto_principal_path?: string | null
          foto_status?: string | null
          foto_validada_em?: string | null
          fotos_paths?: Json | null
          id: string
          imagens?: Json | null
          imagens_atualizado_em?: string | null
          imagens_erro?: string | null
          imagens_fontes?: Json | null
          imagens_paths?: Json | null
          imagens_qtd?: number | null
          imagens_status?: string | null
          imagens_updated_at?: string | null
          imune_ao_corte?: string | null
          madeira_de_lei?: string | null
          nome_cientifico?: string | null
          nome_cientifico_slug?: string | null
          nome_popular?: string | null
          nomes_populares?: Json | null
          ordem_taxonomica?: string | null
          tipo_de_planta?: string | null
        }
        Update: {
          classe_taxonomica?: string | null
          estado_de_conservacao?: string | null
          familia_taxonomica?: string | null
          foto_fonte_validacao?: string | null
          foto_principal_path?: string | null
          foto_status?: string | null
          foto_validada_em?: string | null
          fotos_paths?: Json | null
          id?: string
          imagens?: Json | null
          imagens_atualizado_em?: string | null
          imagens_erro?: string | null
          imagens_fontes?: Json | null
          imagens_paths?: Json | null
          imagens_qtd?: number | null
          imagens_status?: string | null
          imagens_updated_at?: string | null
          imune_ao_corte?: string | null
          madeira_de_lei?: string | null
          nome_cientifico?: string | null
          nome_cientifico_slug?: string | null
          nome_popular?: string | null
          nomes_populares?: Json | null
          ordem_taxonomica?: string | null
          tipo_de_planta?: string | null
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
      dim_indicador_bpma: {
        Row: {
          categoria: string | null
          id: string
          nome: string
        }
        Insert: {
          categoria?: string | null
          id: string
          nome: string
        }
        Update: {
          categoria?: string | null
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
      dim_tempo: {
        Row: {
          ano: number
          id: number
          inicio_mes: string
          mes: number
          mes_abreviacao: string
        }
        Insert: {
          ano: number
          id: number
          inicio_mes: string
          mes: number
          mes_abreviacao: string
        }
        Update: {
          ano?: number
          id?: number
          inicio_mes?: string
          mes?: number
          mes_abreviacao?: string
        }
        Relationships: []
      }
      dim_tipo_atividade_prevencao: {
        Row: {
          categoria: string
          created_at: string | null
          id: string
          nome: string
          ordem: number | null
        }
        Insert: {
          categoria: string
          created_at?: string | null
          id?: string
          nome: string
          ordem?: number | null
        }
        Update: {
          categoria?: string
          created_at?: string | null
          id?: string
          nome?: string
          ordem?: number | null
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
      dim_tipo_penal: {
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
      efetivo_roles: {
        Row: {
          created_at: string | null
          efetivo_id: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          efetivo_id: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          efetivo_id?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "efetivo_roles_efetivo_id_fkey"
            columns: ["efetivo_id"]
            isOneToOne: false
            referencedRelation: "dim_efetivo"
            referencedColumns: ["id"]
          },
        ]
      }
      fact_indicador_mensal_bpma: {
        Row: {
          indicador_id: string
          tempo_id: number
          valor: number
        }
        Insert: {
          indicador_id: string
          tempo_id: number
          valor: number
        }
        Update: {
          indicador_id?: string
          tempo_id?: number
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fact_indicador_mensal_bpma_indicador_id_fkey"
            columns: ["indicador_id"]
            isOneToOne: false
            referencedRelation: "dim_indicador_bpma"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fact_indicador_mensal_bpma_tempo_id_fkey"
            columns: ["tempo_id"]
            isOneToOne: false
            referencedRelation: "dim_tempo"
            referencedColumns: ["id"]
          },
        ]
      }
      fact_recordes_apreensao: {
        Row: {
          ano: number
          created_at: string | null
          data_ocorrencia: string
          descricao: string | null
          especie_nome_cientifico: string | null
          especie_nome_popular: string
          id: string
          mes: number
          quantidade: number
          tipo_crime: string | null
        }
        Insert: {
          ano: number
          created_at?: string | null
          data_ocorrencia: string
          descricao?: string | null
          especie_nome_cientifico?: string | null
          especie_nome_popular: string
          id?: string
          mes: number
          quantidade: number
          tipo_crime?: string | null
        }
        Update: {
          ano?: number
          created_at?: string | null
          data_ocorrencia?: string
          descricao?: string | null
          especie_nome_cientifico?: string | null
          especie_nome_popular?: string
          id?: string
          mes?: number
          quantidade?: number
          tipo_crime?: string | null
        }
        Relationships: []
      }
      fact_resgate_fauna_especie_mensal: {
        Row: {
          id: string
          id_especie_fauna: string | null
          id_regiao_administrativa: string | null
          nome_cientifico: string
          nome_popular: string | null
          quantidade: number
          tempo_id: number
        }
        Insert: {
          id?: string
          id_especie_fauna?: string | null
          id_regiao_administrativa?: string | null
          nome_cientifico: string
          nome_popular?: string | null
          quantidade: number
          tempo_id: number
        }
        Update: {
          id?: string
          id_especie_fauna?: string | null
          id_regiao_administrativa?: string | null
          nome_cientifico?: string
          nome_popular?: string | null
          quantidade?: number
          tempo_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fact_resgate_fauna_especie_mensal_id_especie_fauna_fkey"
            columns: ["id_especie_fauna"]
            isOneToOne: false
            referencedRelation: "dim_especies_fauna"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fact_resgate_fauna_especie_mensal_id_regiao_administrativa_fkey"
            columns: ["id_regiao_administrativa"]
            isOneToOne: false
            referencedRelation: "dim_regiao_administrativa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fact_resgate_fauna_especie_mensal_tempo_id_fkey"
            columns: ["tempo_id"]
            isOneToOne: false
            referencedRelation: "dim_tempo"
            referencedColumns: ["id"]
          },
        ]
      }
      fact_resumo_mensal_historico: {
        Row: {
          ano: number
          atropelamentos: number
          created_at: string | null
          feridos: number
          filhotes: number
          id: string
          mes: number
          obitos: number
          resgates: number
          solturas: number
        }
        Insert: {
          ano: number
          atropelamentos?: number
          created_at?: string | null
          feridos?: number
          filhotes?: number
          id?: string
          mes: number
          obitos?: number
          resgates?: number
          solturas?: number
        }
        Update: {
          ano?: number
          atropelamentos?: number
          created_at?: string | null
          feridos?: number
          filhotes?: number
          id?: string
          mes?: number
          obitos?: number
          resgates?: number
          solturas?: number
        }
        Relationships: []
      }
      fat_abono: {
        Row: {
          ano: number
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          efetivo_id: string | null
          id: string
          mes: number
          mes_previsao: number | null
          mes_reprogramado: number | null
          minuta_observacao: string | null
          observacao: string | null
          parcela: number | null
          parcela1_campanha: boolean | null
          parcela1_dias: number | null
          parcela1_fim: string | null
          parcela1_inicio: string | null
          parcela1_sgpol: boolean | null
          parcela2_campanha: boolean | null
          parcela2_dias: number | null
          parcela2_fim: string | null
          parcela2_inicio: string | null
          parcela2_sgpol: boolean | null
          parcela3_dias: number | null
          parcela3_fim: string | null
          parcela3_inicio: string | null
          updated_at: string | null
        }
        Insert: {
          ano?: number
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          efetivo_id?: string | null
          id?: string
          mes: number
          mes_previsao?: number | null
          mes_reprogramado?: number | null
          minuta_observacao?: string | null
          observacao?: string | null
          parcela?: number | null
          parcela1_campanha?: boolean | null
          parcela1_dias?: number | null
          parcela1_fim?: string | null
          parcela1_inicio?: string | null
          parcela1_sgpol?: boolean | null
          parcela2_campanha?: boolean | null
          parcela2_dias?: number | null
          parcela2_fim?: string | null
          parcela2_inicio?: string | null
          parcela2_sgpol?: boolean | null
          parcela3_dias?: number | null
          parcela3_fim?: string | null
          parcela3_inicio?: string | null
          updated_at?: string | null
        }
        Update: {
          ano?: number
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          efetivo_id?: string | null
          id?: string
          mes?: number
          mes_previsao?: number | null
          mes_reprogramado?: number | null
          minuta_observacao?: string | null
          observacao?: string | null
          parcela?: number | null
          parcela1_campanha?: boolean | null
          parcela1_dias?: number | null
          parcela1_fim?: string | null
          parcela1_inicio?: string | null
          parcela1_sgpol?: boolean | null
          parcela2_campanha?: boolean | null
          parcela2_dias?: number | null
          parcela2_fim?: string | null
          parcela2_inicio?: string | null
          parcela2_sgpol?: boolean | null
          parcela3_dias?: number | null
          parcela3_fim?: string | null
          parcela3_inicio?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fat_abono_efetivo_id_fkey"
            columns: ["efetivo_id"]
            isOneToOne: false
            referencedRelation: "dim_efetivo"
            referencedColumns: ["id"]
          },
        ]
      }
      fat_atividades_prevencao: {
        Row: {
          created_at: string | null
          data: string
          id: string
          latitude: string | null
          longitude: string | null
          observacoes: string | null
          quantidade_publico: number | null
          regiao_administrativa_id: string | null
          tipo_atividade_id: string | null
        }
        Insert: {
          created_at?: string | null
          data: string
          id?: string
          latitude?: string | null
          longitude?: string | null
          observacoes?: string | null
          quantidade_publico?: number | null
          regiao_administrativa_id?: string | null
          tipo_atividade_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: string
          id?: string
          latitude?: string | null
          longitude?: string | null
          observacoes?: string | null
          quantidade_publico?: number | null
          regiao_administrativa_id?: string | null
          tipo_atividade_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fat_atividades_prevencao_regiao_administrativa_id_fkey"
            columns: ["regiao_administrativa_id"]
            isOneToOne: false
            referencedRelation: "dim_regiao_administrativa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_atividades_prevencao_tipo_atividade_id_fkey"
            columns: ["tipo_atividade_id"]
            isOneToOne: false
            referencedRelation: "dim_tipo_atividade_prevencao"
            referencedColumns: ["id"]
          },
        ]
      }
      fat_campanha_alteracoes: {
        Row: {
          created_at: string | null
          created_by: string | null
          data: string
          equipe_nova_id: string
          equipe_original_id: string | null
          id: string
          motivo: string | null
          unidade: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data: string
          equipe_nova_id: string
          equipe_original_id?: string | null
          id?: string
          motivo?: string | null
          unidade: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          data?: string
          equipe_nova_id?: string
          equipe_original_id?: string | null
          id?: string
          motivo?: string | null
          unidade?: string
        }
        Relationships: [
          {
            foreignKeyName: "fat_campanha_alteracoes_equipe_nova_id_fkey"
            columns: ["equipe_nova_id"]
            isOneToOne: false
            referencedRelation: "dim_equipes_campanha"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_campanha_alteracoes_equipe_original_id_fkey"
            columns: ["equipe_original_id"]
            isOneToOne: false
            referencedRelation: "dim_equipes_campanha"
            referencedColumns: ["id"]
          },
        ]
      }
      fat_campanha_config: {
        Row: {
          ano: number
          created_at: string | null
          data_inicio: string
          equipe_inicial_id: string | null
          id: string
          unidade: string
          updated_at: string | null
        }
        Insert: {
          ano?: number
          created_at?: string | null
          data_inicio?: string
          equipe_inicial_id?: string | null
          id?: string
          unidade: string
          updated_at?: string | null
        }
        Update: {
          ano?: number
          created_at?: string | null
          data_inicio?: string
          equipe_inicial_id?: string | null
          id?: string
          unidade?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fat_campanha_config_equipe_inicial_id_fkey"
            columns: ["equipe_inicial_id"]
            isOneToOne: false
            referencedRelation: "dim_equipes_campanha"
            referencedColumns: ["id"]
          },
        ]
      }
      fat_campanha_membros: {
        Row: {
          ano: number
          created_at: string | null
          efetivo_id: string
          equipe_id: string
          funcao: string | null
          id: string
          unidade: string
        }
        Insert: {
          ano?: number
          created_at?: string | null
          efetivo_id: string
          equipe_id: string
          funcao?: string | null
          id?: string
          unidade: string
        }
        Update: {
          ano?: number
          created_at?: string | null
          efetivo_id?: string
          equipe_id?: string
          funcao?: string | null
          id?: string
          unidade?: string
        }
        Relationships: [
          {
            foreignKeyName: "fat_campanha_membros_efetivo_id_fkey"
            columns: ["efetivo_id"]
            isOneToOne: false
            referencedRelation: "dim_efetivo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_campanha_membros_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "dim_equipes_campanha"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "fat_crime_flora_id_ocorrencia_fkey"
            columns: ["id_ocorrencia"]
            isOneToOne: false
            referencedRelation: "fat_registros_de_crime"
            referencedColumns: ["id"]
          },
        ]
      }
      fat_crimes_comuns: {
        Row: {
          arma_utilizada: boolean | null
          created_at: string | null
          data: string
          descricao_material: string | null
          descricao_ocorrencia: string | null
          desfecho_id: string | null
          enquadramento_legal: string | null
          horario_acionamento: string | null
          horario_desfecho: string | null
          id: string
          latitude: string
          local_especifico: string | null
          longitude: string
          material_apreendido: boolean | null
          natureza_crime: string | null
          observacoes: string | null
          ocorreu_apreensao: boolean | null
          placa_veiculo: string | null
          procedimento_legal: string | null
          qtd_detidos_maior: number | null
          qtd_detidos_menor: number | null
          qtd_liberados_maior: number | null
          qtd_liberados_menor: number | null
          regiao_administrativa_id: string | null
          situacao_autor: string | null
          suspeitos_envolvidos: number | null
          tipo_area_id: string | null
          tipo_arma: string | null
          tipo_penal_id: string | null
          tipo_veiculo: string | null
          veiculo_envolvido: boolean | null
          vitimas_envolvidas: number | null
        }
        Insert: {
          arma_utilizada?: boolean | null
          created_at?: string | null
          data: string
          descricao_material?: string | null
          descricao_ocorrencia?: string | null
          desfecho_id?: string | null
          enquadramento_legal?: string | null
          horario_acionamento?: string | null
          horario_desfecho?: string | null
          id?: string
          latitude: string
          local_especifico?: string | null
          longitude: string
          material_apreendido?: boolean | null
          natureza_crime?: string | null
          observacoes?: string | null
          ocorreu_apreensao?: boolean | null
          placa_veiculo?: string | null
          procedimento_legal?: string | null
          qtd_detidos_maior?: number | null
          qtd_detidos_menor?: number | null
          qtd_liberados_maior?: number | null
          qtd_liberados_menor?: number | null
          regiao_administrativa_id?: string | null
          situacao_autor?: string | null
          suspeitos_envolvidos?: number | null
          tipo_area_id?: string | null
          tipo_arma?: string | null
          tipo_penal_id?: string | null
          tipo_veiculo?: string | null
          veiculo_envolvido?: boolean | null
          vitimas_envolvidas?: number | null
        }
        Update: {
          arma_utilizada?: boolean | null
          created_at?: string | null
          data?: string
          descricao_material?: string | null
          descricao_ocorrencia?: string | null
          desfecho_id?: string | null
          enquadramento_legal?: string | null
          horario_acionamento?: string | null
          horario_desfecho?: string | null
          id?: string
          latitude?: string
          local_especifico?: string | null
          longitude?: string
          material_apreendido?: boolean | null
          natureza_crime?: string | null
          observacoes?: string | null
          ocorreu_apreensao?: boolean | null
          placa_veiculo?: string | null
          procedimento_legal?: string | null
          qtd_detidos_maior?: number | null
          qtd_detidos_menor?: number | null
          qtd_liberados_maior?: number | null
          qtd_liberados_menor?: number | null
          regiao_administrativa_id?: string | null
          situacao_autor?: string | null
          suspeitos_envolvidos?: number | null
          tipo_area_id?: string | null
          tipo_arma?: string | null
          tipo_penal_id?: string | null
          tipo_veiculo?: string | null
          veiculo_envolvido?: boolean | null
          vitimas_envolvidas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fat_crimes_comuns_desfecho_id_fkey"
            columns: ["desfecho_id"]
            isOneToOne: false
            referencedRelation: "dim_desfecho_crime_comum"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_crimes_comuns_regiao_administrativa_id_fkey"
            columns: ["regiao_administrativa_id"]
            isOneToOne: false
            referencedRelation: "dim_regiao_administrativa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_crimes_comuns_tipo_area_id_fkey"
            columns: ["tipo_area_id"]
            isOneToOne: false
            referencedRelation: "dim_tipo_de_area"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_crimes_comuns_tipo_penal_id_fkey"
            columns: ["tipo_penal_id"]
            isOneToOne: false
            referencedRelation: "dim_tipo_penal"
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
      fat_equipe_crime_comum: {
        Row: {
          created_at: string | null
          efetivo_id: string
          id: string
          registro_id: string
        }
        Insert: {
          created_at?: string | null
          efetivo_id: string
          id?: string
          registro_id: string
        }
        Update: {
          created_at?: string | null
          efetivo_id?: string
          id?: string
          registro_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fat_equipe_crime_comum_efetivo_id_fkey"
            columns: ["efetivo_id"]
            isOneToOne: false
            referencedRelation: "dim_efetivo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_equipe_crime_comum_registro_id_fkey"
            columns: ["registro_id"]
            isOneToOne: false
            referencedRelation: "fat_crimes_comuns"
            referencedColumns: ["id"]
          },
        ]
      }
      fat_equipe_membros: {
        Row: {
          created_at: string
          efetivo_id: string
          equipe_id: string
          funcao: string | null
          id: string
        }
        Insert: {
          created_at?: string
          efetivo_id: string
          equipe_id: string
          funcao?: string | null
          id?: string
        }
        Update: {
          created_at?: string
          efetivo_id?: string
          equipe_id?: string
          funcao?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fat_equipe_membros_efetivo_id_fkey"
            columns: ["efetivo_id"]
            isOneToOne: false
            referencedRelation: "dim_efetivo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_equipe_membros_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "dim_equipes"
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
      fat_ferias: {
        Row: {
          ano: number
          created_at: string | null
          dias: number | null
          efetivo_id: string | null
          id: string
          mes_fim: number | null
          mes_inicio: number
          minuta_data_fim: string | null
          minuta_data_inicio: string | null
          minuta_observacao: string | null
          observacao: string | null
          source_row_number: number | null
          source_sheet: string | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          ano?: number
          created_at?: string | null
          dias?: number | null
          efetivo_id?: string | null
          id?: string
          mes_fim?: number | null
          mes_inicio: number
          minuta_data_fim?: string | null
          minuta_data_inicio?: string | null
          minuta_observacao?: string | null
          observacao?: string | null
          source_row_number?: number | null
          source_sheet?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          ano?: number
          created_at?: string | null
          dias?: number | null
          efetivo_id?: string | null
          id?: string
          mes_fim?: number | null
          mes_inicio?: number
          minuta_data_fim?: string | null
          minuta_data_inicio?: string | null
          minuta_observacao?: string | null
          observacao?: string | null
          source_row_number?: number | null
          source_sheet?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fat_ferias_efetivo_id_fkey"
            columns: ["efetivo_id"]
            isOneToOne: false
            referencedRelation: "dim_efetivo"
            referencedColumns: ["id"]
          },
        ]
      }
      fat_ferias_parcelas: {
        Row: {
          data_fim: string | null
          data_inicio: string | null
          dias: number | null
          fat_ferias_id: string
          id: string
          lancado_campanha: boolean | null
          lancado_livro: boolean | null
          lancado_sgpol: boolean | null
          mes: string | null
          parcela_num: number
          source_row_number: number | null
          source_sheet: string | null
          updated_at: string
        }
        Insert: {
          data_fim?: string | null
          data_inicio?: string | null
          dias?: number | null
          fat_ferias_id: string
          id?: string
          lancado_campanha?: boolean | null
          lancado_livro?: boolean | null
          lancado_sgpol?: boolean | null
          mes?: string | null
          parcela_num: number
          source_row_number?: number | null
          source_sheet?: string | null
          updated_at?: string
        }
        Update: {
          data_fim?: string | null
          data_inicio?: string | null
          dias?: number | null
          fat_ferias_id?: string
          id?: string
          lancado_campanha?: boolean | null
          lancado_livro?: boolean | null
          lancado_sgpol?: boolean | null
          mes?: string | null
          parcela_num?: number
          source_row_number?: number | null
          source_sheet?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fat_ferias_parcelas_fat_ferias_id_fkey"
            columns: ["fat_ferias_id"]
            isOneToOne: false
            referencedRelation: "fat_ferias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_ferias_parcelas_fat_ferias_id_fkey"
            columns: ["fat_ferias_id"]
            isOneToOne: false
            referencedRelation: "vw_ferias_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      fat_licencas_medicas: {
        Row: {
          ano: number
          cid: string | null
          created_at: string | null
          data_fim: string | null
          data_fim_norm: string | null
          data_inicio: string
          dias: number | null
          efetivo_id: string | null
          id: string
          observacao: string | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          ano?: number
          cid?: string | null
          created_at?: string | null
          data_fim?: string | null
          data_fim_norm?: string | null
          data_inicio: string
          dias?: number | null
          efetivo_id?: string | null
          id?: string
          observacao?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          ano?: number
          cid?: string | null
          created_at?: string | null
          data_fim?: string | null
          data_fim_norm?: string | null
          data_inicio?: string
          dias?: number | null
          efetivo_id?: string | null
          id?: string
          observacao?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fat_licencas_medicas_efetivo_id_fkey"
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
      fat_ocorrencia_apreensao_crime_comum: {
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
            foreignKeyName: "fat_ocorrencia_apreensao_crime_comum_id_item_apreendido_fkey"
            columns: ["id_item_apreendido"]
            isOneToOne: false
            referencedRelation: "dim_itens_apreensao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_ocorrencia_apreensao_crime_comum_id_ocorrencia_fkey"
            columns: ["id_ocorrencia"]
            isOneToOne: false
            referencedRelation: "fat_crimes_comuns"
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
          horario_acionamento: string | null
          horario_desfecho: string | null
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
          horario_acionamento?: string | null
          horario_desfecho?: string | null
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
          horario_acionamento?: string | null
          horario_desfecho?: string | null
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
            referencedRelation: "dim_desfecho_resgates"
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
          horario_acionamento: string | null
          horario_termino: string | null
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
          horario_acionamento?: string | null
          horario_termino?: string | null
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
          horario_acionamento?: string | null
          horario_termino?: string | null
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
            foreignKeyName: "fat_registros_de_resgate_desfecho_id_fkey"
            columns: ["desfecho_id"]
            isOneToOne: false
            referencedRelation: "dim_desfecho_resgates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_registros_de_resgate_desfecho_id_fkey1"
            columns: ["desfecho_id"]
            isOneToOne: false
            referencedRelation: "dim_desfecho_resgates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_registros_de_resgate_destinacao_id_fkey"
            columns: ["destinacao_id"]
            isOneToOne: false
            referencedRelation: "dim_destinacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_registros_de_resgate_destinacao_id_fkey1"
            columns: ["destinacao_id"]
            isOneToOne: false
            referencedRelation: "dim_destinacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_registros_de_resgate_especie_id_fkey"
            columns: ["especie_id"]
            isOneToOne: false
            referencedRelation: "dim_especies_fauna"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_registros_de_resgate_especie_id_fkey1"
            columns: ["especie_id"]
            isOneToOne: false
            referencedRelation: "dim_especies_fauna"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_registros_de_resgate_estado_saude_id_fkey"
            columns: ["estado_saude_id"]
            isOneToOne: false
            referencedRelation: "dim_estado_saude"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_registros_de_resgate_estado_saude_id_fkey1"
            columns: ["estado_saude_id"]
            isOneToOne: false
            referencedRelation: "dim_estado_saude"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_registros_de_resgate_estagio_vida_id_fkey"
            columns: ["estagio_vida_id"]
            isOneToOne: false
            referencedRelation: "dim_estagio_vida"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_registros_de_resgate_estagio_vida_id_fkey1"
            columns: ["estagio_vida_id"]
            isOneToOne: false
            referencedRelation: "dim_estagio_vida"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_registros_de_resgate_origem_id_fkey"
            columns: ["origem_id"]
            isOneToOne: false
            referencedRelation: "dim_origem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_registros_de_resgate_origem_id_fkey1"
            columns: ["origem_id"]
            isOneToOne: false
            referencedRelation: "dim_origem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_registros_de_resgate_regiao_administrativa_id_fkey"
            columns: ["regiao_administrativa_id"]
            isOneToOne: false
            referencedRelation: "dim_regiao_administrativa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_registros_de_resgate_regiao_administrativa_id_fkey1"
            columns: ["regiao_administrativa_id"]
            isOneToOne: false
            referencedRelation: "dim_regiao_administrativa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_registros_de_resgate_tipo_area_id_fkey1"
            columns: ["tipo_area_id"]
            isOneToOne: false
            referencedRelation: "dim_tipo_de_area"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fat_registros_de_resgate_tipo_area_id_fkey2"
            columns: ["tipo_area_id"]
            isOneToOne: false
            referencedRelation: "dim_tipo_de_area"
            referencedColumns: ["id"]
          },
        ]
      }
      fat_resgates_diarios_2020: {
        Row: {
          classe_taxonomica: string | null
          criado_em: string | null
          data_ocorrencia: string | null
          especie_id: string | null
          estado_de_conservacao: string | null
          id: string
          mes: string | null
          nome_cientifico: string | null
          nome_popular: string | null
          ordem_taxonomica: string | null
          quantidade_feridos: number | null
          quantidade_filhotes: number | null
          quantidade_obitos: number | null
          quantidade_resgates: number | null
          quantidade_solturas: number | null
          tipo_de_fauna: string | null
        }
        Insert: {
          classe_taxonomica?: string | null
          criado_em?: string | null
          data_ocorrencia?: string | null
          especie_id?: string | null
          estado_de_conservacao?: string | null
          id?: string
          mes?: string | null
          nome_cientifico?: string | null
          nome_popular?: string | null
          ordem_taxonomica?: string | null
          quantidade_feridos?: number | null
          quantidade_filhotes?: number | null
          quantidade_obitos?: number | null
          quantidade_resgates?: number | null
          quantidade_solturas?: number | null
          tipo_de_fauna?: string | null
        }
        Update: {
          classe_taxonomica?: string | null
          criado_em?: string | null
          data_ocorrencia?: string | null
          especie_id?: string | null
          estado_de_conservacao?: string | null
          id?: string
          mes?: string | null
          nome_cientifico?: string | null
          nome_popular?: string | null
          ordem_taxonomica?: string | null
          quantidade_feridos?: number | null
          quantidade_filhotes?: number | null
          quantidade_obitos?: number | null
          quantidade_resgates?: number | null
          quantidade_solturas?: number | null
          tipo_de_fauna?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fat_resgates_diarios_2020_especie_id_fkey"
            columns: ["especie_id"]
            isOneToOne: false
            referencedRelation: "dim_especies_fauna"
            referencedColumns: ["id"]
          },
        ]
      }
      fat_resgates_diarios_2020a2024: {
        Row: {
          Ano: number | null
          classe_taxonomica: string | null
          criado_em: string | null
          data_ocorrencia: string | null
          estado_de_conservacao: string | null
          id: string
          Mês: string | null
          nome_cientifico: string | null
          nome_popular: string | null
          ordem_taxonomica: string | null
          quantidade_feridos: number | null
          quantidade_filhotes: number | null
          quantidade_obitos: number | null
          quantidade_resgates: number | null
          quantidade_solturas: number | null
          tipo_de_fauna: string | null
        }
        Insert: {
          Ano?: number | null
          classe_taxonomica?: string | null
          criado_em?: string | null
          data_ocorrencia?: string | null
          estado_de_conservacao?: string | null
          id?: string
          Mês?: string | null
          nome_cientifico?: string | null
          nome_popular?: string | null
          ordem_taxonomica?: string | null
          quantidade_feridos?: number | null
          quantidade_filhotes?: number | null
          quantidade_obitos?: number | null
          quantidade_resgates?: number | null
          quantidade_solturas?: number | null
          tipo_de_fauna?: string | null
        }
        Update: {
          Ano?: number | null
          classe_taxonomica?: string | null
          criado_em?: string | null
          data_ocorrencia?: string | null
          estado_de_conservacao?: string | null
          id?: string
          Mês?: string | null
          nome_cientifico?: string | null
          nome_popular?: string | null
          ordem_taxonomica?: string | null
          quantidade_feridos?: number | null
          quantidade_filhotes?: number | null
          quantidade_obitos?: number | null
          quantidade_resgates?: number | null
          quantidade_solturas?: number | null
          tipo_de_fauna?: string | null
        }
        Relationships: []
      }
      fat_resgates_diarios_2021: {
        Row: {
          classe_taxonomica: string | null
          criado_em: string | null
          data_ocorrencia: string | null
          especie_id: string | null
          estado_de_conservacao: string | null
          id: string
          mes: string | null
          nome_cientifico: string | null
          nome_popular: string | null
          ordem_taxonomica: string | null
          quantidade_feridos: number | null
          quantidade_filhotes: number | null
          quantidade_obitos: number | null
          quantidade_resgates: number | null
          quantidade_solturas: number | null
          tipo_de_fauna: string | null
        }
        Insert: {
          classe_taxonomica?: string | null
          criado_em?: string | null
          data_ocorrencia?: string | null
          especie_id?: string | null
          estado_de_conservacao?: string | null
          id?: string
          mes?: string | null
          nome_cientifico?: string | null
          nome_popular?: string | null
          ordem_taxonomica?: string | null
          quantidade_feridos?: number | null
          quantidade_filhotes?: number | null
          quantidade_obitos?: number | null
          quantidade_resgates?: number | null
          quantidade_solturas?: number | null
          tipo_de_fauna?: string | null
        }
        Update: {
          classe_taxonomica?: string | null
          criado_em?: string | null
          data_ocorrencia?: string | null
          especie_id?: string | null
          estado_de_conservacao?: string | null
          id?: string
          mes?: string | null
          nome_cientifico?: string | null
          nome_popular?: string | null
          ordem_taxonomica?: string | null
          quantidade_feridos?: number | null
          quantidade_filhotes?: number | null
          quantidade_obitos?: number | null
          quantidade_resgates?: number | null
          quantidade_solturas?: number | null
          tipo_de_fauna?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fat_resgates_diarios_2021_especie_id_fkey"
            columns: ["especie_id"]
            isOneToOne: false
            referencedRelation: "dim_especies_fauna"
            referencedColumns: ["id"]
          },
        ]
      }
      fat_resgates_diarios_2022: {
        Row: {
          classe_taxonomica: string | null
          criado_em: string | null
          data_ocorrencia: string | null
          especie_id: string | null
          estado_de_conservacao: string | null
          id: string
          mes: string | null
          nome_cientifico: string | null
          nome_popular: string | null
          ordem_taxonomica: string | null
          quantidade_feridos: number | null
          quantidade_filhotes: number | null
          quantidade_obitos: number | null
          quantidade_resgates: number | null
          quantidade_solturas: number | null
          tipo_de_fauna: string | null
        }
        Insert: {
          classe_taxonomica?: string | null
          criado_em?: string | null
          data_ocorrencia?: string | null
          especie_id?: string | null
          estado_de_conservacao?: string | null
          id?: string
          mes?: string | null
          nome_cientifico?: string | null
          nome_popular?: string | null
          ordem_taxonomica?: string | null
          quantidade_feridos?: number | null
          quantidade_filhotes?: number | null
          quantidade_obitos?: number | null
          quantidade_resgates?: number | null
          quantidade_solturas?: number | null
          tipo_de_fauna?: string | null
        }
        Update: {
          classe_taxonomica?: string | null
          criado_em?: string | null
          data_ocorrencia?: string | null
          especie_id?: string | null
          estado_de_conservacao?: string | null
          id?: string
          mes?: string | null
          nome_cientifico?: string | null
          nome_popular?: string | null
          ordem_taxonomica?: string | null
          quantidade_feridos?: number | null
          quantidade_filhotes?: number | null
          quantidade_obitos?: number | null
          quantidade_resgates?: number | null
          quantidade_solturas?: number | null
          tipo_de_fauna?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fat_resgates_diarios_2022_especie_id_fkey"
            columns: ["especie_id"]
            isOneToOne: false
            referencedRelation: "dim_especies_fauna"
            referencedColumns: ["id"]
          },
        ]
      }
      fat_resgates_diarios_2023: {
        Row: {
          classe_taxonomica: string | null
          criado_em: string | null
          data_ocorrencia: string | null
          especie_id: string | null
          estado_de_conservacao: string | null
          id: string
          mes: string | null
          nome_cientifico: string | null
          nome_popular: string | null
          ordem_taxonomica: string | null
          quantidade_feridos: number | null
          quantidade_filhotes: number | null
          quantidade_obitos: number | null
          quantidade_resgates: number | null
          quantidade_solturas: number | null
          tipo_de_fauna: string | null
        }
        Insert: {
          classe_taxonomica?: string | null
          criado_em?: string | null
          data_ocorrencia?: string | null
          especie_id?: string | null
          estado_de_conservacao?: string | null
          id?: string
          mes?: string | null
          nome_cientifico?: string | null
          nome_popular?: string | null
          ordem_taxonomica?: string | null
          quantidade_feridos?: number | null
          quantidade_filhotes?: number | null
          quantidade_obitos?: number | null
          quantidade_resgates?: number | null
          quantidade_solturas?: number | null
          tipo_de_fauna?: string | null
        }
        Update: {
          classe_taxonomica?: string | null
          criado_em?: string | null
          data_ocorrencia?: string | null
          especie_id?: string | null
          estado_de_conservacao?: string | null
          id?: string
          mes?: string | null
          nome_cientifico?: string | null
          nome_popular?: string | null
          ordem_taxonomica?: string | null
          quantidade_feridos?: number | null
          quantidade_filhotes?: number | null
          quantidade_obitos?: number | null
          quantidade_resgates?: number | null
          quantidade_solturas?: number | null
          tipo_de_fauna?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fat_resgates_diarios_2023_especie_id_fkey"
            columns: ["especie_id"]
            isOneToOne: false
            referencedRelation: "dim_especies_fauna"
            referencedColumns: ["id"]
          },
        ]
      }
      fat_resgates_diarios_2024: {
        Row: {
          classe_taxonomica: string | null
          criado_em: string | null
          data_ocorrencia: string | null
          especie_id: string | null
          estado_de_conservacao: string | null
          id: string
          mes: string | null
          nome_cientifico: string | null
          nome_popular: string | null
          ordem_taxonomica: string | null
          quantidade_feridos: number | null
          quantidade_filhotes: number | null
          quantidade_obitos: number | null
          quantidade_resgates: number | null
          quantidade_solturas: number | null
          tipo_de_fauna: string | null
        }
        Insert: {
          classe_taxonomica?: string | null
          criado_em?: string | null
          data_ocorrencia?: string | null
          especie_id?: string | null
          estado_de_conservacao?: string | null
          id?: string
          mes?: string | null
          nome_cientifico?: string | null
          nome_popular?: string | null
          ordem_taxonomica?: string | null
          quantidade_feridos?: number | null
          quantidade_filhotes?: number | null
          quantidade_obitos?: number | null
          quantidade_resgates?: number | null
          quantidade_solturas?: number | null
          tipo_de_fauna?: string | null
        }
        Update: {
          classe_taxonomica?: string | null
          criado_em?: string | null
          data_ocorrencia?: string | null
          especie_id?: string | null
          estado_de_conservacao?: string | null
          id?: string
          mes?: string | null
          nome_cientifico?: string | null
          nome_popular?: string | null
          ordem_taxonomica?: string | null
          quantidade_feridos?: number | null
          quantidade_filhotes?: number | null
          quantidade_obitos?: number | null
          quantidade_resgates?: number | null
          quantidade_solturas?: number | null
          tipo_de_fauna?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fat_resgates_diarios_2024_especie_id_fkey"
            columns: ["especie_id"]
            isOneToOne: false
            referencedRelation: "dim_especies_fauna"
            referencedColumns: ["id"]
          },
        ]
      }
      fat_resgates_diarios_2025: {
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
          horario_acionamento: string | null
          horario_termino: string | null
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
          horario_acionamento?: string | null
          horario_termino?: string | null
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
          horario_acionamento?: string | null
          horario_termino?: string | null
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
            referencedRelation: "dim_desfecho_resgates"
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
          {
            foreignKeyName: "fk_resgates_2025_desfecho"
            columns: ["desfecho_id"]
            isOneToOne: false
            referencedRelation: "dim_desfecho_resgates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_resgates_2025_destinacao"
            columns: ["destinacao_id"]
            isOneToOne: false
            referencedRelation: "dim_destinacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_resgates_2025_especie"
            columns: ["especie_id"]
            isOneToOne: false
            referencedRelation: "dim_especies_fauna"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_resgates_2025_estado_saude"
            columns: ["estado_saude_id"]
            isOneToOne: false
            referencedRelation: "dim_estado_saude"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_resgates_2025_estagio_vida"
            columns: ["estagio_vida_id"]
            isOneToOne: false
            referencedRelation: "dim_estagio_vida"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_resgates_2025_origem"
            columns: ["origem_id"]
            isOneToOne: false
            referencedRelation: "dim_origem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_resgates_2025_regiao"
            columns: ["regiao_administrativa_id"]
            isOneToOne: false
            referencedRelation: "dim_regiao_administrativa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_resgates_2025_tipo_area"
            columns: ["tipo_area_id"]
            isOneToOne: false
            referencedRelation: "dim_tipo_de_area"
            referencedColumns: ["id"]
          },
        ]
      }
      fat_resgates_diarios_2025_especies: {
        Row: {
          classe_taxonomica: string | null
          criado_em: string | null
          data_ocorrencia: string | null
          especie_id: string | null
          estado_de_conservacao: string | null
          id: string
          mes: string | null
          nome_cientifico: string | null
          nome_popular: string | null
          ordem_taxonomica: string | null
          quantidade_feridos: number | null
          quantidade_filhotes: number | null
          quantidade_obitos: number | null
          quantidade_resgates: number | null
          quantidade_solturas: number | null
          tipo_de_fauna: string | null
        }
        Insert: {
          classe_taxonomica?: string | null
          criado_em?: string | null
          data_ocorrencia?: string | null
          especie_id?: string | null
          estado_de_conservacao?: string | null
          id?: string
          mes?: string | null
          nome_cientifico?: string | null
          nome_popular?: string | null
          ordem_taxonomica?: string | null
          quantidade_feridos?: number | null
          quantidade_filhotes?: number | null
          quantidade_obitos?: number | null
          quantidade_resgates?: number | null
          quantidade_solturas?: number | null
          tipo_de_fauna?: string | null
        }
        Update: {
          classe_taxonomica?: string | null
          criado_em?: string | null
          data_ocorrencia?: string | null
          especie_id?: string | null
          estado_de_conservacao?: string | null
          id?: string
          mes?: string | null
          nome_cientifico?: string | null
          nome_popular?: string | null
          ordem_taxonomica?: string | null
          quantidade_feridos?: number | null
          quantidade_filhotes?: number | null
          quantidade_obitos?: number | null
          quantidade_resgates?: number | null
          quantidade_solturas?: number | null
          tipo_de_fauna?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fat_resgates_diarios_2025_especies_especie_id_fkey"
            columns: ["especie_id"]
            isOneToOne: false
            referencedRelation: "dim_especies_fauna"
            referencedColumns: ["id"]
          },
        ]
      }
      fat_restricoes: {
        Row: {
          ano: number
          created_at: string | null
          data_fim: string | null
          data_fim_norm: string | null
          data_inicio: string
          efetivo_id: string | null
          id: string
          observacao: string | null
          tipo_restricao: string
          updated_at: string | null
        }
        Insert: {
          ano?: number
          created_at?: string | null
          data_fim?: string | null
          data_fim_norm?: string | null
          data_inicio: string
          efetivo_id?: string | null
          id?: string
          observacao?: string | null
          tipo_restricao: string
          updated_at?: string | null
        }
        Update: {
          ano?: number
          created_at?: string | null
          data_fim?: string | null
          data_fim_norm?: string | null
          data_inicio?: string
          efetivo_id?: string | null
          id?: string
          observacao?: string | null
          tipo_restricao?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fat_restricoes_efetivo_id_fkey"
            columns: ["efetivo_id"]
            isOneToOne: false
            referencedRelation: "dim_efetivo"
            referencedColumns: ["id"]
          },
        ]
      }
      fila_imagens_especies: {
        Row: {
          atualizado_em: string
          criado_em: string
          erro: string | null
          especie_id: number
          id: number
          nome_cientifico: string
          slug: string
          status: string
          tentativas: number
          tipo: string
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          erro?: string | null
          especie_id: number
          id?: number
          nome_cientifico: string
          slug: string
          status?: string
          tentativas?: number
          tipo: string
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          erro?: string | null
          especie_id?: number
          id?: number
          nome_cientifico?: string
          slug?: string
          status?: string
          tentativas?: number
          tipo?: string
        }
        Relationships: []
      }
      log_importacao_imagens: {
        Row: {
          data_hora: string | null
          especie: string | null
          id: string
          mensagem: string | null
          status: string | null
          tipo: string | null
        }
        Insert: {
          data_hora?: string | null
          especie?: string | null
          id?: string
          mensagem?: string | null
          status?: string | null
          tipo?: string | null
        }
        Update: {
          data_hora?: string | null
          especie?: string | null
          id?: string
          mensagem?: string | null
          status?: string | null
          tipo?: string | null
        }
        Relationships: []
      }
      rap_processados: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          drive_file_id: string
          drive_file_name: string
          extracted_data: Json | null
          form_type: string | null
          id: string
          processed_at: string | null
          rap_numero: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          drive_file_id: string
          drive_file_name: string
          extracted_data?: Json | null
          form_type?: string | null
          id?: string
          processed_at?: string | null
          rap_numero?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          drive_file_id?: string
          drive_file_name?: string
          extracted_data?: Json | null
          form_type?: string | null
          id?: string
          processed_at?: string | null
          rap_numero?: string | null
        }
        Relationships: []
      }
      stg_abono_2026: {
        Row: {
          ano: number | null
          loaded_at: string
          matricula: string | null
          mes: number | null
          mes_previsao: number | null
          mes_reprogramado: number | null
          nome_completo: string | null
          observacao: string | null
          parcela1_campanha: boolean | null
          parcela1_dias: number | null
          parcela1_fim: string | null
          parcela1_inicio: string | null
          parcela1_sgpol: boolean | null
          parcela2_campanha: boolean | null
          parcela2_dias: number | null
          parcela2_fim: string | null
          parcela2_inicio: string | null
          parcela2_sgpol: boolean | null
          parcela3_dias: number | null
          parcela3_fim: string | null
          parcela3_inicio: string | null
          posto_graduacao: string | null
          source_row_number: number
          source_sheet: string
        }
        Insert: {
          ano?: number | null
          loaded_at?: string
          matricula?: string | null
          mes?: number | null
          mes_previsao?: number | null
          mes_reprogramado?: number | null
          nome_completo?: string | null
          observacao?: string | null
          parcela1_campanha?: boolean | null
          parcela1_dias?: number | null
          parcela1_fim?: string | null
          parcela1_inicio?: string | null
          parcela1_sgpol?: boolean | null
          parcela2_campanha?: boolean | null
          parcela2_dias?: number | null
          parcela2_fim?: string | null
          parcela2_inicio?: string | null
          parcela2_sgpol?: boolean | null
          parcela3_dias?: number | null
          parcela3_fim?: string | null
          parcela3_inicio?: string | null
          posto_graduacao?: string | null
          source_row_number: number
          source_sheet: string
        }
        Update: {
          ano?: number | null
          loaded_at?: string
          matricula?: string | null
          mes?: number | null
          mes_previsao?: number | null
          mes_reprogramado?: number | null
          nome_completo?: string | null
          observacao?: string | null
          parcela1_campanha?: boolean | null
          parcela1_dias?: number | null
          parcela1_fim?: string | null
          parcela1_inicio?: string | null
          parcela1_sgpol?: boolean | null
          parcela2_campanha?: boolean | null
          parcela2_dias?: number | null
          parcela2_fim?: string | null
          parcela2_inicio?: string | null
          parcela2_sgpol?: boolean | null
          parcela3_dias?: number | null
          parcela3_fim?: string | null
          parcela3_inicio?: string | null
          posto_graduacao?: string | null
          source_row_number?: number
          source_sheet?: string
        }
        Relationships: []
      }
      stg_dm_2026: {
        Row: {
          ano: number | null
          cid: string | null
          data_fim: string | null
          data_inicio: string | null
          dias: number | null
          loaded_at: string
          matricula: string | null
          nome_completo: string | null
          observacao: string | null
          posto_graduacao: string | null
          source_row_number: number
          source_sheet: string
          tipo: string | null
        }
        Insert: {
          ano?: number | null
          cid?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          dias?: number | null
          loaded_at?: string
          matricula?: string | null
          nome_completo?: string | null
          observacao?: string | null
          posto_graduacao?: string | null
          source_row_number: number
          source_sheet: string
          tipo?: string | null
        }
        Update: {
          ano?: number | null
          cid?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          dias?: number | null
          loaded_at?: string
          matricula?: string | null
          nome_completo?: string | null
          observacao?: string | null
          posto_graduacao?: string | null
          source_row_number?: number
          source_sheet?: string
          tipo?: string | null
        }
        Relationships: []
      }
      stg_dm_xlsx: {
        Row: {
          ano: number | null
          cid: string | null
          data_fim: string | null
          data_inicio: string | null
          hospital: string | null
          matricula: string | null
          nome: string | null
          upm: string | null
        }
        Insert: {
          ano?: number | null
          cid?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          hospital?: string | null
          matricula?: string | null
          nome?: string | null
          upm?: string | null
        }
        Update: {
          ano?: number | null
          cid?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          hospital?: string | null
          matricula?: string | null
          nome?: string | null
          upm?: string | null
        }
        Relationships: []
      }
      stg_ferias_2026_pracas: {
        Row: {
          ano_gozo: number | null
          ano_referencia: number | null
          cod_grad: number | null
          loaded_at: string
          matricula: string | null
          mes_previsto: string | null
          mes_reprogramado: string | null
          nome_completo: string | null
          p1_campanha: boolean | null
          p1_dias: number | null
          p1_fim: string | null
          p1_inicio: string | null
          p1_livro: boolean | null
          p1_mes_num: number | null
          p1_sgpol: boolean | null
          p2_campanha: boolean | null
          p2_dias: number | null
          p2_fim: string | null
          p2_inicio: string | null
          p2_livro: boolean | null
          p2_mes_num: number | null
          p2_sgpol: boolean | null
          p3_campanha: boolean | null
          p3_dias: number | null
          p3_fim: string | null
          p3_inicio: string | null
          p3_livro: boolean | null
          p3_mes_num: number | null
          p3_sgpol: boolean | null
          parc1_mes: string | null
          parc2_mes: string | null
          parc3_mes: string | null
          posto_graduacao: string | null
          sei: string | null
          source_row_number: number
          source_sheet: string
          total_dias: number | null
          upm: string | null
        }
        Insert: {
          ano_gozo?: number | null
          ano_referencia?: number | null
          cod_grad?: number | null
          loaded_at?: string
          matricula?: string | null
          mes_previsto?: string | null
          mes_reprogramado?: string | null
          nome_completo?: string | null
          p1_campanha?: boolean | null
          p1_dias?: number | null
          p1_fim?: string | null
          p1_inicio?: string | null
          p1_livro?: boolean | null
          p1_mes_num?: number | null
          p1_sgpol?: boolean | null
          p2_campanha?: boolean | null
          p2_dias?: number | null
          p2_fim?: string | null
          p2_inicio?: string | null
          p2_livro?: boolean | null
          p2_mes_num?: number | null
          p2_sgpol?: boolean | null
          p3_campanha?: boolean | null
          p3_dias?: number | null
          p3_fim?: string | null
          p3_inicio?: string | null
          p3_livro?: boolean | null
          p3_mes_num?: number | null
          p3_sgpol?: boolean | null
          parc1_mes?: string | null
          parc2_mes?: string | null
          parc3_mes?: string | null
          posto_graduacao?: string | null
          sei?: string | null
          source_row_number: number
          source_sheet: string
          total_dias?: number | null
          upm?: string | null
        }
        Update: {
          ano_gozo?: number | null
          ano_referencia?: number | null
          cod_grad?: number | null
          loaded_at?: string
          matricula?: string | null
          mes_previsto?: string | null
          mes_reprogramado?: string | null
          nome_completo?: string | null
          p1_campanha?: boolean | null
          p1_dias?: number | null
          p1_fim?: string | null
          p1_inicio?: string | null
          p1_livro?: boolean | null
          p1_mes_num?: number | null
          p1_sgpol?: boolean | null
          p2_campanha?: boolean | null
          p2_dias?: number | null
          p2_fim?: string | null
          p2_inicio?: string | null
          p2_livro?: boolean | null
          p2_mes_num?: number | null
          p2_sgpol?: boolean | null
          p3_campanha?: boolean | null
          p3_dias?: number | null
          p3_fim?: string | null
          p3_inicio?: string | null
          p3_livro?: boolean | null
          p3_mes_num?: number | null
          p3_sgpol?: boolean | null
          parc1_mes?: string | null
          parc2_mes?: string | null
          parc3_mes?: string | null
          posto_graduacao?: string | null
          sei?: string | null
          source_row_number?: number
          source_sheet?: string
          total_dias?: number | null
          upm?: string | null
        }
        Relationships: []
      }
      stg_restricoes_2025: {
        Row: {
          ano: number | null
          data_fim: string | null
          data_inicio: string | null
          loaded_at: string
          matricula: string | null
          nome_completo: string | null
          observacao: string | null
          posto_graduacao: string | null
          source_row_number: number
          source_sheet: string
          tipo_restricao: string | null
        }
        Insert: {
          ano?: number | null
          data_fim?: string | null
          data_inicio?: string | null
          loaded_at?: string
          matricula?: string | null
          nome_completo?: string | null
          observacao?: string | null
          posto_graduacao?: string | null
          source_row_number: number
          source_sheet: string
          tipo_restricao?: string | null
        }
        Update: {
          ano?: number | null
          data_fim?: string | null
          data_inicio?: string | null
          loaded_at?: string
          matricula?: string | null
          nome_completo?: string | null
          observacao?: string | null
          posto_graduacao?: string | null
          source_row_number?: number
          source_sheet?: string
          tipo_restricao?: string | null
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          acao: string
          created_at: string | null
          detalhes: Json | null
          erro: string | null
          especie_id: string | null
          especie_nome: string
          fotos_encontradas: number | null
          id: string
          status_final: string | null
          tipo: string
        }
        Insert: {
          acao: string
          created_at?: string | null
          detalhes?: Json | null
          erro?: string | null
          especie_id?: string | null
          especie_nome: string
          fotos_encontradas?: number | null
          id?: string
          status_final?: string | null
          tipo: string
        }
        Update: {
          acao?: string
          created_at?: string | null
          detalhes?: Json | null
          erro?: string | null
          especie_id?: string | null
          especie_nome?: string
          fotos_encontradas?: number | null
          id?: string
          status_final?: string | null
          tipo?: string
        }
        Relationships: []
      }
      sync_run_logs: {
        Row: {
          created_at: string
          detalhes: Json | null
          erro: string | null
          finished_at: string | null
          id: string
          started_at: string
          status: string
        }
        Insert: {
          created_at?: string
          detalhes?: Json | null
          erro?: string | null
          finished_at?: string | null
          id?: string
          started_at?: string
          status?: string
        }
        Update: {
          created_at?: string
          detalhes?: Json | null
          erro?: string | null
          finished_at?: string | null
          id?: string
          started_at?: string
          status?: string
        }
        Relationships: []
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
      usuarios_permitidos: {
        Row: {
          CPF: number | null
          criado_em: string | null
          "Data Nascimento": string | null
          "Email 1": string | null
          "Email 2": string | null
          id: string
          Lotação: string | null
          Matrícula: string | null
          Nome: string | null
          "Nome Guerra": string | null
          Post_Grad: string | null
          Quadro: string | null
          Sexo: string | null
          "Telefone 1": string | null
          "Telefone 2": string | null
          user_id: string
        }
        Insert: {
          CPF?: number | null
          criado_em?: string | null
          "Data Nascimento"?: string | null
          "Email 1"?: string | null
          "Email 2"?: string | null
          id?: string
          Lotação?: string | null
          Matrícula?: string | null
          Nome?: string | null
          "Nome Guerra"?: string | null
          Post_Grad?: string | null
          Quadro?: string | null
          Sexo?: string | null
          "Telefone 1"?: string | null
          "Telefone 2"?: string | null
          user_id?: string
        }
        Update: {
          CPF?: number | null
          criado_em?: string | null
          "Data Nascimento"?: string | null
          "Email 1"?: string | null
          "Email 2"?: string | null
          id?: string
          Lotação?: string | null
          Matrícula?: string | null
          Nome?: string | null
          "Nome Guerra"?: string | null
          Post_Grad?: string | null
          Quadro?: string | null
          Sexo?: string | null
          "Telefone 1"?: string | null
          "Telefone 2"?: string | null
          user_id?: string
        }
        Relationships: []
      }
      usuarios_por_login: {
        Row: {
          ativo: boolean | null
          auth_user_id: string | null
          contato: string | null
          cpf: number | null
          data_inclusao: string | null
          data_nascimento: string | null
          efetivo_id: string | null
          email: string | null
          id: string
          idade: number | null
          login: string | null
          lotacao: string | null
          matricula: string | null
          nome: string | null
          nome_guerra: string | null
          porte_arma: string | null
          post_grad: string | null
          quadro: string | null
          senha: number | null
          sexo: string | null
          vinculado_em: string | null
        }
        Insert: {
          ativo?: boolean | null
          auth_user_id?: string | null
          contato?: string | null
          cpf?: number | null
          data_inclusao?: string | null
          data_nascimento?: string | null
          efetivo_id?: string | null
          email?: string | null
          id?: string
          idade?: number | null
          login?: string | null
          lotacao?: string | null
          matricula?: string | null
          nome?: string | null
          nome_guerra?: string | null
          porte_arma?: string | null
          post_grad?: string | null
          quadro?: string | null
          senha?: number | null
          sexo?: string | null
          vinculado_em?: string | null
        }
        Update: {
          ativo?: boolean | null
          auth_user_id?: string | null
          contato?: string | null
          cpf?: number | null
          data_inclusao?: string | null
          data_nascimento?: string | null
          efetivo_id?: string | null
          email?: string | null
          id?: string
          idade?: number | null
          login?: string | null
          lotacao?: string | null
          matricula?: string | null
          nome?: string | null
          nome_guerra?: string | null
          porte_arma?: string | null
          post_grad?: string | null
          quadro?: string | null
          senha?: number | null
          sexo?: string | null
          vinculado_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_por_login_efetivo_id_fkey"
            columns: ["efetivo_id"]
            isOneToOne: false
            referencedRelation: "dim_efetivo"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vw_anos_disponiveis: {
        Row: {
          ano: number | null
        }
        Relationships: []
      }
      vw_distribuicao_classe_historico: {
        Row: {
          ano: number | null
          classe_taxonomica: string | null
          total: number | null
        }
        Relationships: []
      }
      vw_ferias_completo: {
        Row: {
          ano: number | null
          created_at: string | null
          dias: number | null
          efetivo_id: string | null
          id: string | null
          lotacao: string | null
          matricula: string | null
          mes_fim: number | null
          mes_inicio: number | null
          nome: string | null
          nome_guerra: string | null
          observacao: string | null
          posto_graduacao: string | null
          tipo: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fat_ferias_efetivo_id_fkey"
            columns: ["efetivo_id"]
            isOneToOne: false
            referencedRelation: "dim_efetivo"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_kpis_anuais_historico: {
        Row: {
          ano: number | null
          total_atropelamentos: number | null
          total_obitos: number | null
          total_resgates: number | null
          total_solturas: number | null
        }
        Relationships: []
      }
      vw_ranking_especies_historico: {
        Row: {
          ano: number | null
          nome_cientifico: string | null
          nome_popular: string | null
          total: number | null
        }
        Relationships: []
      }
      vw_resgates_basicos_union: {
        Row: {
          ano: number | null
          classe_taxonomica: string | null
          data: string | null
          especie_id: string | null
          mes_texto: string | null
          nome_cientifico: string | null
          nome_popular_norm: string | null
          nome_popular_raw: string | null
          total_feridos: number | null
          total_filhotes: number | null
          total_obitos: number | null
          total_resgates: number | null
          total_solturas: number | null
        }
        Relationships: []
      }
      vw_resgates_historicos: {
        Row: {
          ano: number | null
          classe_taxonomica: string | null
          criado_em: string | null
          data_ocorrencia: string | null
          especie_id: string | null
          estado_de_conservacao: string | null
          id: string | null
          mes: string | null
          nome_cientifico: string | null
          nome_popular: string | null
          ordem_taxonomica: string | null
          quantidade_feridos: number | null
          quantidade_filhotes: number | null
          quantidade_obitos: number | null
          quantidade_resgates: number | null
          quantidade_solturas: number | null
          tipo_de_fauna: string | null
        }
        Relationships: []
      }
      vw_resumo_anual_resgates: {
        Row: {
          ano: number | null
          classe_taxonomica: string | null
          especies_unicas: number | null
          tipo_de_fauna: string | null
          total_feridos: number | null
          total_filhotes: number | null
          total_obitos: number | null
          total_resgates: number | null
          total_solturas: number | null
        }
        Relationships: []
      }
      vw_resumo_especies_historico: {
        Row: {
          classe_taxonomica: string | null
          estado_de_conservacao: string | null
          nome_cientifico: string | null
          nome_popular: string | null
          num_ocorrencias: number | null
          tipo_de_fauna: string | null
          total_feridos: number | null
          total_filhotes: number | null
          total_obitos: number | null
          total_resgates: number | null
          total_solturas: number | null
        }
        Relationships: []
      }
      vw_serie_mensal_historico: {
        Row: {
          ano: number | null
          atropelamentos: number | null
          feridos: number | null
          filhotes: number | null
          mes: number | null
          obitos: number | null
          resgates: number | null
          solturas: number | null
        }
        Insert: {
          ano?: number | null
          atropelamentos?: number | null
          feridos?: number | null
          filhotes?: number | null
          mes?: number | null
          obitos?: number | null
          resgates?: number | null
          solturas?: number | null
        }
        Update: {
          ano?: number | null
          atropelamentos?: number | null
          feridos?: number | null
          filhotes?: number | null
          mes?: number | null
          obitos?: number | null
          resgates?: number | null
          solturas?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      exec_sql: { Args: { sql_query: string }; Returns: undefined }
      fn_nome_cientifico_prefix: { Args: { nome: string }; Returns: string }
      forcar_sincronizacao_user_roles: {
        Args: never
        Returns: {
          detalhes_erros: Json
          roles_atualizados: number
          roles_criados: number
          usuarios_processados: number
          usuarios_sem_auth_user_id: number
          usuarios_sem_efetivo_id: number
          usuarios_sem_matricula: number
        }[]
      }
      get_current_user_efetivo_id: { Args: never; Returns: string }
      has_role:
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
        | { Args: { _role: string; _user_id: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_allowed_user: { Args: { check_email: string }; Returns: boolean }
      jsonb_array_union_unique: { Args: { a: Json; b: Json }; Returns: Json }
      listar_usuarios_sem_auth_user_id: {
        Args: never
        Returns: {
          cpf: number
          efetivo_id: string
          email: string
          id: string
          login: string
          matricula: string
          nome: string
          nome_efetivo: string
          precisa_criar_auth: boolean
          role_efetivo: Database["public"]["Enums"]["app_role"]
        }[]
      }
      make_slug: { Args: { txt: string }; Returns: string }
      month_to_int: { Args: { m: string }; Returns: number }
      norm_txt: { Args: { t: string }; Returns: string }
      normalize_text: { Args: { input_text: string }; Returns: string }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      slugify: { Args: { input: string }; Returns: string }
      slugify_pt: { Args: { input: string }; Returns: string }
      sync_abono_2026_from_stg: {
        Args: { p_source_sheet?: string }
        Returns: Json
      }
      sync_dm_2026_from_stg: {
        Args: { p_source_sheet?: string }
        Returns: Json
      }
      sync_ferias_2026_from_stg: {
        Args: { p_source_sheet?: string }
        Returns: Json
      }
      sync_ferias_2026_pai_from_stg: {
        Args: { p_source_sheet?: string }
        Returns: Json
      }
      sync_ferias_2026_parcelas_cleanup_from_stg: {
        Args: { p_source_sheet?: string }
        Returns: Json
      }
      sync_ferias_2026_parcelas_from_stg: {
        Args: { p_source_sheet?: string }
        Returns: Json
      }
      sync_imagens_fauna: { Args: never; Returns: undefined }
      sync_imagens_flora: { Args: never; Returns: undefined }
      sync_restricoes_from_stg: {
        Args: { p_source_sheet?: string }
        Returns: Json
      }
      sync_stg_to_fat_abono: { Args: never; Returns: undefined }
      unaccent: { Args: { "": string }; Returns: string }
      upsert_ferias_com_parcelas: {
        Args: {
          p_ano: number
          p_dias?: number
          p_efetivo_id: string
          p_mes_fim?: number
          p_mes_inicio?: number
          p_observacao?: string
          p_parcelas?: Json
          p_substituir_parcelas?: boolean
          p_tipo: string
        }
        Returns: string
      }
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
