// Temporary query helpers to bypass TypeScript errors until Supabase types regenerate
import { supabase } from "@/integrations/supabase/client";
import type { TexteReglementaire, TypeActeRow, Article, RelationTexte } from "@/types/textes";

// Type-safe wrappers for textes_reglementaires queries
export const textesQueries = {
  async getAll(filters?: {
    searchTerm?: string;
    typeFilter?: string;
    anneeFilter?: string;
    statutFilter?: string;
  }) {
    let query = (supabase as any)
      .from("textes_reglementaires")
      .select("*, types_acte(code, libelle)")
      .order("date_publication_jort", { ascending: false });

    if (filters?.searchTerm) {
      query = query.or(
        `intitule.ilike.%${filters.searchTerm}%,numero_officiel.ilike.%${filters.searchTerm}%,objet_resume.ilike.%${filters.searchTerm}%`
      );
    }
    if (filters?.typeFilter && filters.typeFilter !== "all") {
      query = query.eq("type_acte", filters.typeFilter);
    }
    if (filters?.anneeFilter && filters.anneeFilter !== "all") {
      query = query.eq("annee", parseInt(filters.anneeFilter));
    }
    if (filters?.statutFilter && filters.statutFilter !== "all") {
      query = query.eq("statut_vigueur", filters.statutFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as TexteReglementaire[];
  },

  async getById(id: string) {
    const { data, error } = await (supabase as any)
      .from("textes_reglementaires")
      .select("*, types_acte(code, libelle)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data as TexteReglementaire | null;
  },

  async create(texte: Partial<TexteReglementaire>) {
    // Check for duplicate titre
    const { data: existing } = await (supabase as any)
      .from("textes_reglementaires")
      .select("id")
      .eq("intitule", texte.intitule)
      .maybeSingle();
    
    if (existing) {
      throw new Error("Un texte avec ce titre existe déjà");
    }

    const { data, error } = await (supabase as any)
      .from("textes_reglementaires")
      .insert([texte])
      .select()
      .single();
    if (error) throw error;
    return data as TexteReglementaire;
  },

  async update(id: string, texte: Partial<TexteReglementaire>) {
    // Check for duplicate titre (excluding current)
    if (texte.intitule) {
      const { data: existing } = await (supabase as any)
        .from("textes_reglementaires")
        .select("id")
        .eq("intitule", texte.intitule)
        .neq("id", id)
        .maybeSingle();
      
      if (existing) {
        throw new Error("Un texte avec ce titre existe déjà");
      }
    }

    const { data, error } = await (supabase as any)
      .from("textes_reglementaires")
      .update(texte)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as TexteReglementaire;
  },

  async delete(id: string) {
    const { error } = await (supabase as any)
      .from("textes_reglementaires")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

export const typesActeQueries = {
  async getAll() {
    const { data, error } = await (supabase as any)
      .from("types_acte")
      .select("*")
      .order("libelle");
    if (error) throw error;
    return data as TypeActeRow[];
  },
};

export const articlesQueries = {
  async getByTexteId(texteId: string) {
    const { data, error } = await (supabase as any)
      .from("articles")
      .select("*")
      .eq("texte_id", texteId)
      .order("numero");
    if (error) throw error;
    return data as Article[];
  },

  async create(article: Partial<Article>) {
    const { data, error } = await (supabase as any)
      .from("articles")
      .insert([article])
      .select()
      .single();
    if (error) throw error;
    return data as Article;
  },

  async createBulk(articles: Partial<Article>[]) {
    const { data, error } = await (supabase as any)
      .from("articles")
      .insert(articles)
      .select();
    if (error) throw error;
    return data as Article[];
  },

  async update(id: string, article: Partial<Article>) {
    const { data, error } = await (supabase as any)
      .from("articles")
      .update(article)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Article;
  },

  async delete(id: string) {
    const { error } = await (supabase as any)
      .from("articles")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

export const relationsQueries = {
  async getBySourceId(sourceId: string) {
    const { data, error } = await (supabase as any)
      .from("relations_textes")
      .select(`
        *,
        cible:textes_reglementaires!relations_textes_cible_id_fkey(numero_officiel, intitule)
      `)
      .eq("source_id", sourceId);
    if (error) throw error;
    return data as RelationTexte[];
  },
};

export interface ChangelogEntry {
  id: string;
  texte_id: string;
  type_changement: "ajout" | "modification" | "abrogation";
  resume: string;
  date_changement: string;
  created_at: string;
}

export const changelogQueries = {
  async getByTexteId(texteId: string) {
    const { data, error } = await (supabase as any)
      .from("changelog_reglementaire")
      .select("*")
      .eq("texte_id", texteId)
      .order("date_changement", { ascending: false });
    if (error) throw error;
    return data as ChangelogEntry[];
  },

  async create(entry: Partial<ChangelogEntry>) {
    const { data, error } = await (supabase as any)
      .from("changelog_reglementaire")
      .insert([entry])
      .select()
      .single();
    if (error) throw error;
    return data as ChangelogEntry;
  },

  async delete(id: string) {
    const { error } = await (supabase as any)
      .from("changelog_reglementaire")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};
