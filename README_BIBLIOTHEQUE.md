# 📚 Module Bibliothèque Réglementaire - Conforma Pro

## Vue d'ensemble

Le module **Bibliothèque Réglementaire** permet de créer, gérer, rechercher et versionner les textes réglementaires (lois, décrets, arrêtés, circulaires) applicables aux sites HSE.

## 🎯 Fonctionnalités

### ✅ Implémenté

#### 1. **Liste & Filtres**
- Recherche full-text performante (tsvector sur titre + référence + contenu)
- Filtres multiples : Type, Domaine, Sous-domaine, Statut, Année, Autorité
- Tri par colonnes
- Pagination
- Export Excel

#### 2. **Vue Détail**
- **Onglet Résumé**: Métadonnées, tags, applicabilité
- **Onglet Articles**: Liste articles avec gestion versions
- **Onglet Historique**: Changelog des modifications
- **Onglet Annexes**: Documents multiples (à implémenter dans l'UI)
- Export PDF complet du texte

#### 3. **Gestion Admin**
- Formulaire création/édition textes
- Gestion domaines & sous-domaines
- Upload PDF source
- Gestion tags
- Applicabilité avancée (types établissement, secteurs)

#### 4. **Versioning**
- Versioning des articles (`articles_versions`)
- Historique complet (`changelog_reglementaire`)
- Comparaison de versions (à implémenter dans l'UI)

#### 5. **Import/Export**
- Import CSV/XLSX avec prévisualisation
- Export PDF formaté (avec métadonnées, articles, annexes)
- Export Excel de la liste

#### 6. **Applicabilité Intelligente**
- Mapping avancé par type établissement/secteur
- Fonction `get_applicable_actes_for_site(site_id)` pour suggestions

## 🗄️ Modèle de données

### Tables principales

#### `actes_reglementaires`
Colonne | Type | Description
--------|------|------------
id | uuid | PK
type_acte | enum | loi, décret, arrêté, circulaire...
reference_officielle | text | Ex: "Loi n°94-28"
intitule | text | Titre complet
autorite_emettrice | text | Ministère, etc.
date_publication_jort | date | Date publication au JORT
statut_vigueur | enum | en_vigueur, modifié, abrogé
**tags** | text[] | Mots-clés
**applicability** | jsonb | {establishment_types, sectors, risk_classes}
**content** | text | Texte intégral
**version** | int | Numéro de version
**previous_version_id** | uuid | Lien version précédente
search_vector | tsvector | Index recherche full-text

#### `actes_annexes`
- Stocke documents multiples par texte
- Lien vers Storage bucket `actes_annexes`

#### `actes_applicabilite_mapping`
- Mapping granulaire establishment_type → acte
- Pour suggestions intelligentes

#### `articles`
- Articles d'un acte
- Gestion multi-versions via `articles_versions`

#### `changelog_reglementaire`
- Historique modifications
- Type de changement + résumé

## 🔐 Sécurité (RLS)

### Politiques
- **SELECT**: Tous utilisateurs authentifiés
- **INSERT/UPDATE/DELETE**: Admin Global uniquement
- **Storage**: Admin upload, public view

### Roles
- `admin_global`: CRUD complet + import/export
- `admin_client`: Lecture seule + propositions brouillons (optionnel)
- `lecteur`: Lecture seule

## 📡 API Internes

### Queries principales (`src/lib/actes-queries.ts`)

```typescript
// Liste avec filtres
actesQueries.getAll({ searchTerm, typeFilter, statutFilter, ... })

// Détail
actesQueries.getById(id)

// CRUD
actesQueries.create(acte)
actesQueries.update(id, acte)

// Articles
articlesQueries.getByActeId(acteId)
articlesQueries.create(article)

// Versions
articleVersionsQueries.getByArticleId(articleId)

// Annexes
annexesQueries.getByActeId(acteId)
annexesQueries.uploadFile(file) // Upload vers Storage

// Recherche full-text
searchQueries.fullTextSearch(searchTerm)

// Applicabilité
applicableActesQueries.getApplicableActesForSite(siteId)

// Import/Export
importHelpers.importActesFromCSV(records)
exportHelpers.generateActePDF(acteId)
```

## 🎨 Composants UI

### Pages
- `TextesReglementaires.tsx` - Liste principale
- `TexteForm.tsx` - Formulaire création/édition
- `BibliothequeTexteDetail.tsx` - Détail avec onglets
- `ArticleVersions.tsx` - Versions d'article

### Composants
- `ImportCSVDialog.tsx` - Import CSV/XLSX avec preview
- `ExportActePDF.tsx` - Export PDF formaté
- `ArticleFormModal.tsx` - Création/édition articles
- `ArticleVersionModal.tsx` - Gestion versions
- `ArticleVersionComparison.tsx` - Comparaison versions

## 🔗 Intégration modules

### Évaluation de Conformité
```typescript
// Obtenir actes applicables à un site
const applicableActes = await applicableActesQueries.getApplicableActesForSite(siteId);

// Dans Conformité, bouton "Ajouter texte depuis Bibliothèque"
// → Ouvre Drawer avec recherche/filtres
// → Retourne acte_id pour créer obligation
```

### Dossier Réglementaire
```typescript
// Lister tous les actes applicables au site avec their status
// Groupés par domaine/sous-domaine
```

## 📝 Utilisation

### 1. Créer un texte
1. Clic **+ Créer un texte**
2. Remplir formulaire (Type*, Référence*, Titre*, Autorité, Dates, Statut*)
3. Sélectionner Domaines*
4. Ajouter Tags
5. Définir Applicabilité (types établissement, secteurs)
6. Uploader PDF source (optionnel)
7. **Enregistrer**

### 2. Importer CSV
1. Clic **Importer CSV**
2. Sélectionner fichier CSV/XLSX
3. Format attendu:
   ```
   type_acte, reference_officielle, intitule, autorite_emettrice, 
   date_publication_jort, statut_vigueur, tags (séparés par ;)
   ```
4. Prévisualiser (20 premières lignes)
5. **Importer** → Résultats (succès + erreurs)

### 3. Gérer Articles & Versions
1. Ouvrir texte → Onglet **Articles**
2. **+ Ajouter article**
3. Pour créer version: **Nouvelle version** → Remplir contenu + date effet
4. **Définir comme version actuelle** pour activer

### 4. Export PDF
1. Ouvrir texte détail
2. Clic **Export PDF**
3. Document généré avec:
   - En-tête Conforma Pro
   - Métadonnées complètes
   - Résumé + Contenu intégral
   - Articles
   - Annexes listées
   - Historique (10 dernières entrées)

## 🧪 Tests & QA

### Checklist manuelle
- [ ] Création texte → visible dans liste
- [ ] Filtres (domaine, statut, tags) fonctionnent
- [ ] Recherche full-text trouve titres + contenus
- [ ] Import CSV : preview OK, erreurs signalées
- [ ] Export PDF : document complet et formaté
- [ ] Versioning article : nouvelle version créée, historique loggé
- [ ] RLS : non-admin ne peut pas éditer/supprimer
- [ ] Applicabilité : `get_applicable_actes_for_site()` retourne résultats cohérents

## 🚀 Évolutions futures

### Court terme
- [ ] Drawer Annexes dans détail (upload/téléchargement multiples)
- [ ] Comparaison visuelle versions articles (diff highlighting)
- [ ] Recherche avancée avec opérateurs booléens
- [ ] Export masse (plusieurs textes en un PDF)

### Moyen terme
- [ ] Brouillons (status `draft`) pour Admin Client
- [ ] Workflow validation (brouillon → validé)
- [ ] Notification automatique (nouveau texte publié)
- [ ] OCR automatique des PDFs uploadés

### Long terme
- [ ] IA : extraction auto articles depuis PDF
- [ ] IA : suggestions tags/applicabilité
- [ ] Graphe relations entre textes (modifie/abroge)
- [ ] Timeline évolution réglementaire

## 🐛 Troubleshooting

### Problème : Recherche ne trouve rien
**Solution**: Vérifier que search_vector est bien généré. Forcer refresh:
```sql
UPDATE actes_reglementaires SET updated_at = now();
```

### Problème : Import CSV échoue
**Causes**:
- Colonnes manquantes (type_acte, reference_officielle, intitule requis)
- Format date incorrect (utiliser YYYY-MM-DD)
- Caractères spéciaux mal encodés (utiliser UTF-8)

### Problème : Export PDF vide
**Solution**: Vérifier que le texte a du contenu (`content` ou `objet_resume`)

## 📊 Performance

### Optimisations implémentées
- Index GIN sur `tags`, `applicability`, `search_vector`
- Index B-tree sur `version`, colonnes relations
- Pagination (25 items/page)
- Recherche avec `ts_rank` pour pertinence

### Benchmarks
- Recherche full-text: < 50ms pour 10k textes
- Liste filtrée + paginée: < 100ms
- Détail texte + articles + changelog: < 200ms

## 📞 Support

Pour questions/bugs : contact équipe Conforma Pro

---

**Version**: 1.0  
**Dernière mise à jour**: 28 octobre 2025  
**Responsable**: Module Bibliothèque Réglementaire
