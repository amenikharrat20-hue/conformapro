import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

// ==================== CLIENTS ====================

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];
type ClientUpdate = Database["public"]["Tables"]["clients"]["Update"];

export const fetchClients = async () => {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("nom_legal");
  
  if (error) throw error;
  return data;
};

export const fetchClientById = async (clientId: string) => {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();
  
  if (error) throw error;
  return data;
};

export const createClient = async (client: ClientInsert) => {
  const { data, error } = await supabase
    .from("clients")
    .insert(client)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateClient = async (clientId: string, updates: ClientUpdate) => {
  const { data, error } = await supabase
    .from("clients")
    .update(updates)
    .eq("id", clientId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteClient = async (clientId: string) => {
  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", clientId);
  
  if (error) throw error;
};

// ==================== SITES ====================

type SiteRow = Database["public"]["Tables"]["sites"]["Row"];
type SiteInsert = Database["public"]["Tables"]["sites"]["Insert"];
type SiteUpdate = Database["public"]["Tables"]["sites"]["Update"];

export const fetchSites = async () => {
  const { data, error } = await supabase
    .from("sites")
    .select("*, clients(nom_legal)")
    .order("nom_site");
  
  if (error) throw error;
  return data;
};

export const fetchSitesByClient = async (clientId: string) => {
  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .eq("client_id", clientId)
    .order("nom_site");
  
  if (error) throw error;
  return data;
};

export const fetchSiteById = async (siteId: string) => {
  const { data, error } = await supabase
    .from("sites")
    .select("*, clients(nom_legal)")
    .eq("id", siteId)
    .single();
  
  if (error) throw error;
  return data;
};

export const createSite = async (site: SiteInsert) => {
  const { data, error } = await supabase
    .from("sites")
    .insert(site)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateSite = async (siteId: string, updates: SiteUpdate) => {
  const { data, error } = await supabase
    .from("sites")
    .update(updates)
    .eq("id", siteId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteSite = async (siteId: string) => {
  const { error } = await supabase
    .from("sites")
    .delete()
    .eq("id", siteId);
  
  if (error) throw error;
};

// ==================== UTILISATEURS CLIENTS (PROFILES) ====================

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export const fetchUtilisateurs = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      *,
      clients(nom_legal),
      sites(nom_site),
      user_roles(role)
    `)
    .order("nom");
  
  if (error) throw error;
  return data;
};

export const fetchUtilisateursByClient = async (clientId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      *,
      sites(nom_site),
      user_roles(role)
    `)
    .eq("client_id", clientId)
    .order("nom");
  
  if (error) throw error;
  return data;
};

export const fetchUtilisateurById = async (utilisateurId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      *,
      clients(nom_legal),
      sites(nom_site),
      user_roles(role)
    `)
    .eq("id", utilisateurId)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateUtilisateur = async (utilisateurId: string, updates: ProfileUpdate) => {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", utilisateurId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const toggleUtilisateurActif = async (utilisateurId: string, actif: boolean) => {
  const { data, error } = await supabase
    .from("profiles")
    .update({ actif })
    .eq("id", utilisateurId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// ==================== ACCESS SCOPES ====================

type AccessScopeRow = Database["public"]["Tables"]["access_scopes"]["Row"];
type AccessScopeInsert = Database["public"]["Tables"]["access_scopes"]["Insert"];
type AccessScopeUpdate = Database["public"]["Tables"]["access_scopes"]["Update"];

export const fetchAccessScopes = async () => {
  const { data, error } = await supabase
    .from("access_scopes")
    .select(`
      *,
      profiles(nom, prenom, email),
      sites(nom_site, clients(nom_legal))
    `)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data;
};

export const fetchAccessScopesByUser = async (utilisateurId: string) => {
  const { data, error } = await supabase
    .from("access_scopes")
    .select(`
      *,
      sites(nom_site, client_id, clients(nom_legal))
    `)
    .eq("utilisateur_id", utilisateurId);
  
  if (error) throw error;
  return data;
};

export const fetchAccessScopesBySite = async (siteId: string) => {
  const { data, error } = await supabase
    .from("access_scopes")
    .select(`
      *,
      profiles(nom, prenom, email, fonction)
    `)
    .eq("site_id", siteId);
  
  if (error) throw error;
  return data;
};

export const createAccessScope = async (scope: AccessScopeInsert) => {
  const { data, error } = await supabase
    .from("access_scopes")
    .insert(scope)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateAccessScope = async (scopeId: string, updates: AccessScopeUpdate) => {
  const { data, error } = await supabase
    .from("access_scopes")
    .update(updates)
    .eq("id", scopeId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteAccessScope = async (scopeId: string) => {
  const { error } = await supabase
    .from("access_scopes")
    .delete()
    .eq("id", scopeId);
  
  if (error) throw error;
};

export const grantSiteAccess = async (utilisateurId: string, siteId: string, readOnly: boolean = false) => {
  return createAccessScope({
    utilisateur_id: utilisateurId,
    site_id: siteId,
    read_only: readOnly,
  });
};

export const revokeSiteAccess = async (utilisateurId: string, siteId: string) => {
  const { error } = await supabase
    .from("access_scopes")
    .delete()
    .eq("utilisateur_id", utilisateurId)
    .eq("site_id", siteId);
  
  if (error) throw error;
};

// ==================== INTEGRITY CHECKS ====================

export const runIntegrityChecks = async () => {
  const { data, error } = await supabase.rpc('run_integrity_checks');
  
  if (error) throw error;
  return data;
};

// ==================== MODULES SYSTEM ====================

type ModuleSystemeRow = Database["public"]["Tables"]["modules_systeme"]["Row"];
type SiteModuleRow = Database["public"]["Tables"]["site_modules"]["Row"];
type SiteModuleInsert = Database["public"]["Tables"]["site_modules"]["Insert"];
type SiteVeilleDomaineRow = Database["public"]["Tables"]["site_veille_domaines"]["Row"];
type SiteVeilleDomaineInsert = Database["public"]["Tables"]["site_veille_domaines"]["Insert"];

export const listModulesSysteme = async () => {
  const { data, error } = await supabase
    .from("modules_systeme")
    .select("*")
    .eq("actif", true)
    .order("libelle");
  
  if (error) throw error;
  return data;
};

export const listSiteModules = async (siteId: string) => {
  const { data, error } = await supabase
    .from("site_modules")
    .select(`
      *,
      modules_systeme(code, libelle, description)
    `)
    .eq("site_id", siteId);
  
  if (error) throw error;
  return data;
};

export const toggleSiteModule = async (
  siteId: string, 
  moduleCode: string, 
  enabled: boolean,
  userId?: string
) => {
  // First, get the module_id by code
  const { data: module, error: moduleError } = await supabase
    .from("modules_systeme")
    .select("id")
    .eq("code", moduleCode)
    .single();
  
  if (moduleError) throw moduleError;
  if (!module) throw new Error(`Module ${moduleCode} not found`);

  // Upsert site_modules
  const { data, error } = await supabase
    .from("site_modules")
    .upsert({
      site_id: siteId,
      module_id: module.id,
      enabled,
      enabled_by: userId,
      enabled_at: new Date().toISOString(),
    }, {
      onConflict: "site_id,module_id"
    })
    .select()
    .single();
  
  if (error) throw error;

  // If disabling VEILLE module, disable all veille domains
  if (moduleCode === 'VEILLE' && !enabled) {
    const { error: disableError } = await supabase
      .from("site_veille_domaines")
      .update({ enabled: false })
      .eq("site_id", siteId);
    
    if (disableError) throw disableError;
  }

  return data;
};

export const listDomaines = async () => {
  const { data, error } = await supabase
    .from("domaines_application")
    .select("*")
    .eq("actif", true)
    .is("deleted_at", null)
    .order("libelle");
  
  if (error) throw error;
  return data;
};

export const listSiteVeilleDomaines = async (siteId: string) => {
  const { data, error } = await supabase
    .from("site_veille_domaines")
    .select(`
      *,
      domaines_application(code, libelle, description)
    `)
    .eq("site_id", siteId);
  
  if (error) throw error;
  return data;
};

export const toggleSiteVeilleDomaine = async (
  siteId: string, 
  domaineId: string, 
  enabled: boolean
) => {
  const { data, error } = await supabase
    .from("site_veille_domaines")
    .upsert({
      site_id: siteId,
      domaine_id: domaineId,
      enabled,
    }, {
      onConflict: "site_id,domaine_id"
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// ==================== ADDRESS REFERENCE DATA ====================

export const listGouvernorats = async () => {
  const { data, error } = await supabase
    .from("gouvernorats")
    .select("*")
    .order("nom");
  
  if (error) throw error;
  return data;
};

export const listDelegationsByGouvernorat = async (gouvernoratId: string) => {
  const { data, error } = await supabase
    .from("delegations")
    .select("*")
    .eq("gouvernorat_id", gouvernoratId)
    .order("nom");
  
  if (error) throw error;
  return data;
};

export const listLocalitesByDelegation = async (delegationId: string) => {
  const { data, error } = await supabase
    .from("localites")
    .select("*")
    .eq("delegation_id", delegationId)
    .order("nom");
  
  if (error) throw error;
  return data;
};

// ==================== CLIENT USERS MANAGEMENT ====================

export const inviteClientUser = async (
  email: string,
  fullName: string,
  role: string,
  clientId: string,
  siteIds: string[]
) => {
  // First, check if user already exists
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, email, client_id")
    .eq("email", email)
    .single();

  if (existingProfile) {
    // User exists - verify same client
    if (existingProfile.client_id && existingProfile.client_id !== clientId) {
      throw new Error("Cet utilisateur appartient à un autre client");
    }

    // Update existing user
    await updateClientUserAccess(existingProfile.id, role, clientId, siteIds);
    return { action: 'updated', userId: existingProfile.id };
  }

  // User doesn't exist - create via Supabase Auth signUp
  // Note: In production, you'd use admin.inviteUserByEmail with service role key
  // For now, we'll return that invite is needed
  return {
    action: 'invite_needed',
    email,
    fullName,
    role,
    clientId,
    siteIds,
  };
};

export const createUserProfile = async (
  userId: string,
  email: string,
  fullName: string,
  role: string,
  clientId: string,
  siteIds: string[]
) => {
  // Create profile
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      email,
      nom: fullName.split(' ')[0] || fullName,
      prenom: fullName.split(' ').slice(1).join(' ') || '',
      client_id: clientId,
    });

  if (profileError) throw profileError;

  // Delete existing roles
  await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", userId);

  // Insert new role (using type assertion since types may not be updated)
  const { error: roleError } = await supabase
    .from("user_roles")
    .insert([{ user_id: userId, role: role }] as any);

  if (roleError) throw roleError;

  // Create access scopes
  const scopes = siteIds.map(siteId => ({
    utilisateur_id: userId,
    site_id: siteId,
    read_only: role === 'lecteur',
  }));

  const { error: scopesError } = await supabase
    .from("access_scopes")
    .insert(scopes);

  if (scopesError) throw scopesError;
};

export const updateClientUserAccess = async (
  userId: string,
  role: string,
  clientId: string,
  siteIds: string[]
) => {
  // Update user role - delete and re-insert
  await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", userId);

  // Insert new role
  const { error: roleError } = await supabase
    .from("user_roles")
    .insert([{ user_id: userId, role: role }] as any);

  if (roleError) throw roleError;

  // Delete existing access scopes for this client's sites
  const { data: clientSites } = await supabase
    .from("sites")
    .select("id")
    .eq("client_id", clientId);

  if (clientSites) {
    const siteIdsList = clientSites.map(s => s.id);
    await supabase
      .from("access_scopes")
      .delete()
      .eq("utilisateur_id", userId)
      .in("site_id", siteIdsList);
  }

  // Create new access scopes
  const scopes = siteIds.map(siteId => ({
    utilisateur_id: userId,
    site_id: siteId,
    read_only: role === 'lecteur',
  }));

  await supabase
    .from("access_scopes")
    .upsert(scopes);
};

export const fetchClientUsers = async (clientId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      *,
      user_roles(role),
      access_scopes(
        site_id,
        read_only,
        sites(nom_site)
      )
    `)
    .eq("client_id", clientId)
    .order("nom");

  if (error) throw error;
  return data;
};

export const resendInvite = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/`,
  });

  if (error) throw error;
};
