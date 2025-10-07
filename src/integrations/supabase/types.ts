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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          adresse_siege: string | null
          contacts: Json | null
          contrat_sla: string | null
          created_at: string
          gouvernorat: Database["public"]["Enums"]["gouvernorat"] | null
          id: string
          logo: string | null
          matricule_fiscal: string | null
          nom_legal: string
          notes: string | null
          rne_rc: string | null
          secteur: Database["public"]["Enums"]["secteur"] | null
          updated_at: string
        }
        Insert: {
          adresse_siege?: string | null
          contacts?: Json | null
          contrat_sla?: string | null
          created_at?: string
          gouvernorat?: Database["public"]["Enums"]["gouvernorat"] | null
          id?: string
          logo?: string | null
          matricule_fiscal?: string | null
          nom_legal: string
          notes?: string | null
          rne_rc?: string | null
          secteur?: Database["public"]["Enums"]["secteur"] | null
          updated_at?: string
        }
        Update: {
          adresse_siege?: string | null
          contacts?: Json | null
          contrat_sla?: string | null
          created_at?: string
          gouvernorat?: Database["public"]["Enums"]["gouvernorat"] | null
          id?: string
          logo?: string | null
          matricule_fiscal?: string | null
          nom_legal?: string
          notes?: string | null
          rne_rc?: string | null
          secteur?: Database["public"]["Enums"]["secteur"] | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          client_id: string | null
          created_at: string
          email: string | null
          fonction: string | null
          id: string
          nom: string | null
          prenom: string | null
          site_id: string | null
          telephone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          client_id?: string | null
          created_at?: string
          email?: string | null
          fonction?: string | null
          id: string
          nom?: string | null
          prenom?: string | null
          site_id?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          client_id?: string | null
          created_at?: string
          email?: string | null
          fonction?: string | null
          id?: string
          nom?: string | null
          prenom?: string | null
          site_id?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          activite: string | null
          adresse: string | null
          autorite_protection_civile: string | null
          client_id: string
          code_site: string
          coordonnees_gps: unknown | null
          created_at: string
          documents: Json | null
          effectif: number | null
          email: string | null
          gouvernorat: Database["public"]["Enums"]["gouvernorat"] | null
          id: string
          niveau_risque: Database["public"]["Enums"]["niveau_risque"] | null
          nom_site: string
          prestataires_affectes: Json | null
          responsable_site: string | null
          telephone: string | null
          updated_at: string
        }
        Insert: {
          activite?: string | null
          adresse?: string | null
          autorite_protection_civile?: string | null
          client_id: string
          code_site: string
          coordonnees_gps?: unknown | null
          created_at?: string
          documents?: Json | null
          effectif?: number | null
          email?: string | null
          gouvernorat?: Database["public"]["Enums"]["gouvernorat"] | null
          id?: string
          niveau_risque?: Database["public"]["Enums"]["niveau_risque"] | null
          nom_site: string
          prestataires_affectes?: Json | null
          responsable_site?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          activite?: string | null
          adresse?: string | null
          autorite_protection_civile?: string | null
          client_id?: string
          code_site?: string
          coordonnees_gps?: unknown | null
          created_at?: string
          documents?: Json | null
          effectif?: number | null
          email?: string | null
          gouvernorat?: Database["public"]["Enums"]["gouvernorat"] | null
          id?: string
          niveau_risque?: Database["public"]["Enums"]["niveau_risque"] | null
          nom_site?: string
          prestataires_affectes?: Json | null
          responsable_site?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sites_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      get_user_client_id: {
        Args: { _user_id: string }
        Returns: string
      }
      get_user_site_id: {
        Args: { _user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin_global"
        | "admin_client"
        | "gestionnaire_hse"
        | "chef_site"
        | "lecteur"
      gouvernorat:
        | "Ariana"
        | "Béja"
        | "Ben Arous"
        | "Bizerte"
        | "Gabès"
        | "Gafsa"
        | "Jendouba"
        | "Kairouan"
        | "Kasserine"
        | "Kébili"
        | "Kef"
        | "Mahdia"
        | "Manouba"
        | "Médenine"
        | "Monastir"
        | "Nabeul"
        | "Sfax"
        | "Sidi Bouzid"
        | "Siliana"
        | "Sousse"
        | "Tataouine"
        | "Tozeur"
        | "Tunis"
        | "Zaghouan"
      niveau_risque: "Faible" | "Moyen" | "Élevé" | "Critique"
      secteur:
        | "Alimentaire"
        | "Automobile"
        | "Chimie"
        | "Textile"
        | "Construction"
        | "Électronique"
        | "Pharmaceutique"
        | "Services"
        | "Logistique"
        | "Autre"
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
        "admin_global",
        "admin_client",
        "gestionnaire_hse",
        "chef_site",
        "lecteur",
      ],
      gouvernorat: [
        "Ariana",
        "Béja",
        "Ben Arous",
        "Bizerte",
        "Gabès",
        "Gafsa",
        "Jendouba",
        "Kairouan",
        "Kasserine",
        "Kébili",
        "Kef",
        "Mahdia",
        "Manouba",
        "Médenine",
        "Monastir",
        "Nabeul",
        "Sfax",
        "Sidi Bouzid",
        "Siliana",
        "Sousse",
        "Tataouine",
        "Tozeur",
        "Tunis",
        "Zaghouan",
      ],
      niveau_risque: ["Faible", "Moyen", "Élevé", "Critique"],
      secteur: [
        "Alimentaire",
        "Automobile",
        "Chimie",
        "Textile",
        "Construction",
        "Électronique",
        "Pharmaceutique",
        "Services",
        "Logistique",
        "Autre",
      ],
    },
  },
} as const
