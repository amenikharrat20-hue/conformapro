// Query helpers for Actes Réglementaires
import { supabase } from "@/integrations/supabase/client";
import type { 
  ActeReglementaire, 
  TypeActeRow, 
  Article, 
  RelationActe,
  StructureCode,
  ChangelogEntry,
  DomaineApplication,
  SousDomaineApplication,
  ArticleVersion
} from "@/types/actes";

// Type-safe wrappers for actes_reglementaires queries
export const actesQueries = {
  async getAll(filters?: {
    searchTerm?: string;
    typeFilter?: string;
    statutFilter?: string;
  }) {
    let query = (supabase as any)
      .from("actes_reglementaires")
      .select("*")
      .is("deleted_at", null)
      .order("date_publication_jort", { ascending: false });

    if (filters?.searchTerm) {
      query = query.or(
        `intitule.ilike.%${filters.searchTerm}%,numero_officiel.ilike.%${filters.searchTerm}%,objet_resume.ilike.%${filters.searchTerm}%`
      );
    }
    if (filters?.typeFilter && filters.typeFilter !== "all") {
      query = query.eq("type_acte", filters.typeFilter);
    }
    if (filters?.statutFilter && filters.statutFilter !== "all") {
      query = query.eq("statut_vigueur", filters.statutFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as ActeReglementaire[];
  },

  async getById(id: string) {
    const { data, error } = await (supabase as any)
      .from("actes_reglementaires")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    return data as ActeReglementaire | null;
  },

  async create(acte: Partial<ActeReglementaire>) {
    // Check for duplicate intitule
    const { data: existing } = await (supabase as any)
      .from("actes_reglementaires")
      .select("id")
      .eq("intitule", acte.intitule)
      .maybeSingle();
    
    if (existing) {
      throw new Error("Un acte avec ce titre existe déjà");
    }

    const { data, error } = await (supabase as any)
      .from("actes_reglementaires")
      .insert([acte])
      .select()
      .single();
    if (error) throw error;
    return data as ActeReglementaire;
  },

  async update(id: string, acte: Partial<ActeReglementaire>) {
    // Check for duplicate intitule (excluding current)
    if (acte.intitule) {
      const { data: existing } = await (supabase as any)
        .from("actes_reglementaires")
        .select("id")
        .eq("intitule", acte.intitule)
        .neq("id", id)
        .maybeSingle();
      
      if (existing) {
        throw new Error("Un acte avec ce titre existe déjà");
      }
    }

    const { data, error } = await (supabase as any)
      .from("actes_reglementaires")
      .update(acte)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as ActeReglementaire;
  },

  async delete(id: string) {
    const { error } = await (supabase as any)
      .from("actes_reglementaires")
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
  async getByActeId(acteId: string) {
    const { data, error } = await (supabase as any)
      .from("articles")
      .select("*")
      .eq("acte_id", acteId)
      .is("deleted_at", null)
      .order("ordre");
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

export const structuresQueries = {
  async getByActeId(acteId: string) {
    const { data, error } = await (supabase as any)
      .from("structures_code")
      .select("*")
      .eq("acte_id", acteId)
      .order("numero");
    if (error) throw error;
    return data as StructureCode[];
  },

  async create(structure: Partial<StructureCode>) {
    const { data, error } = await (supabase as any)
      .from("structures_code")
      .insert([structure])
      .select()
      .single();
    if (error) throw error;
    return data as StructureCode;
  },

  async update(id: string, structure: Partial<StructureCode>) {
    const { data, error } = await (supabase as any)
      .from("structures_code")
      .update(structure)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as StructureCode;
  },

  async delete(id: string) {
    const { error } = await (supabase as any)
      .from("structures_code")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

export const relationsQueries = {
  async getBySourceId(sourceId: string) {
    const { data, error } = await (supabase as any)
      .from("relations_actes")
      .select(`
        *,
        cible:actes_reglementaires!relations_actes_cible_id_fkey(numero_officiel, intitule)
      `)
      .eq("source_id", sourceId);
    if (error) throw error;
    return data as RelationActe[];
  },

  async create(relation: Partial<RelationActe>) {
    const { data, error } = await (supabase as any)
      .from("relations_actes")
      .insert([relation])
      .select()
      .single();
    if (error) throw error;
    return data as RelationActe;
  },

  async delete(id: string) {
    const { error } = await (supabase as any)
      .from("relations_actes")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

export const changelogQueries = {
  async getByActeId(acteId: string) {
    const { data, error } = await (supabase as any)
      .from("changelog_reglementaire")
      .select("*")
      .eq("acte_id", acteId)
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

export const domainesQueries = {
  async getAll() {
    const { data, error } = await (supabase as any)
      .from("domaines_application")
      .select("*")
      .is("deleted_at", null)
      .order("libelle");
    if (error) throw error;
    return data as DomaineApplication[];
  },

  async getActive() {
    const { data, error } = await (supabase as any)
      .from("domaines_application")
      .select("*")
      .eq("actif", true)
      .is("deleted_at", null)
      .order("libelle");
    if (error) throw error;
    return data as DomaineApplication[];
  },

  async create(domaine: Partial<DomaineApplication>) {
    const { data, error } = await (supabase as any)
      .from("domaines_application")
      .insert([domaine])
      .select()
      .single();
    if (error) throw error;
    return data as DomaineApplication;
  },

  async update(id: string, domaine: Partial<DomaineApplication>) {
    const { data, error } = await (supabase as any)
      .from("domaines_application")
      .update(domaine)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as DomaineApplication;
  },

  async softDelete(id: string) {
    const { error } = await (supabase as any)
      .from("domaines_application")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },
};

export const sousDomainesQueries = {
  async getByDomaineId(domaineId: string) {
    const { data, error } = await (supabase as any)
      .from("sous_domaines_application")
      .select("*, domaine:domaines_application(*)")
      .eq("domaine_id", domaineId)
      .is("deleted_at", null)
      .order("ordre");
    if (error) throw error;
    return data as SousDomaineApplication[];
  },

  async getActive(domaineId?: string) {
    let query = (supabase as any)
      .from("sous_domaines_application")
      .select("*, domaine:domaines_application(*)")
      .eq("actif", true)
      .is("deleted_at", null);
    
    if (domaineId) {
      query = query.eq("domaine_id", domaineId);
    }
    
    const { data, error } = await query.order("ordre");
    if (error) throw error;
    return data as SousDomaineApplication[];
  },

  async create(sousDomaine: Partial<SousDomaineApplication>) {
    const { data, error } = await (supabase as any)
      .from("sous_domaines_application")
      .insert([sousDomaine])
      .select()
      .single();
    if (error) throw error;
    return data as SousDomaineApplication;
  },

  async update(id: string, sousDomaine: Partial<SousDomaineApplication>) {
    const { data, error } = await (supabase as any)
      .from("sous_domaines_application")
      .update(sousDomaine)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as SousDomaineApplication;
  },

  async softDelete(id: string) {
    const { error } = await (supabase as any)
      .from("sous_domaines_application")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },
};

export const articleVersionsQueries = {
  async getByArticleId(articleId: string) {
    const { data, error } = await (supabase as any)
      .from("articles_versions")
      .select("*")
      .eq("article_id", articleId)
      .is("deleted_at", null)
      .order("date_effet", { ascending: false });
    if (error) throw error;
    return data as ArticleVersion[];
  },

  async create(version: Partial<ArticleVersion>) {
    const { data, error } = await (supabase as any)
      .from("articles_versions")
      .insert([version])
      .select()
      .single();
    if (error) throw error;
    return data as ArticleVersion;
  },

  async update(id: string, version: Partial<ArticleVersion>) {
    const { data, error } = await (supabase as any)
      .from("articles_versions")
      .update(version)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as ArticleVersion;
  },

  async softDelete(id: string) {
    const { error } = await (supabase as any)
      .from("articles_versions")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },
};
