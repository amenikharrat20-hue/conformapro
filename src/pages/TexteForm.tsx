import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { TexteReglementaire, TypeActeRow } from "@/types/textes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { z } from "zod";

const texteSchema = z.object({
  type_acte: z.string().min(1, "Type d'acte requis"),
  numero_officiel: z.string().regex(/^\d{4}-\d{1,4}$/, "Format: AAAA-NNN (ex: 2016-772)"),
  annee: z.number().min(1900).max(2100),
  date_signature: z.string().optional(),
  date_publication_jort: z.string().optional(),
  jort_numero: z.string().optional(),
  jort_page_debut: z.string().optional(),
  jort_page_fin: z.string().optional(),
  autorite_emettrice: z.string().optional(),
  intitule: z.string().min(1, "Intitulé requis"),
  objet_resume: z.string().optional(),
  statut_vigueur: z.enum(["en_vigueur", "modifie", "abroge", "suspendu"]),
  url_pdf_ar: z.string().url("URL PDF arabe requise"),
  url_pdf_fr: z.string().url().optional().or(z.literal("")),
  notes_editoriales: z.string().optional(),
});

export default function TexteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    type_acte: "",
    numero_officiel: "",
    annee: new Date().getFullYear(),
    date_signature: "",
    date_publication_jort: "",
    jort_numero: "",
    jort_page_debut: "",
    jort_page_fin: "",
    autorite_emettrice: "",
    intitule: "",
    objet_resume: "",
    statut_vigueur: "en_vigueur",
    url_pdf_ar: "",
    url_pdf_fr: "",
    notes_editoriales: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: typesActe } = useQuery<TypeActeRow[]>({
    queryKey: ["types-acte"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("types_acte")
        .select("*")
        .order("libelle");
      if (error) throw error;
      return data as unknown as TypeActeRow[];
    },
  });

  const { data: texte } = useQuery<TexteReglementaire>({
    queryKey: ["texte", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("textes_reglementaires")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as TexteReglementaire;
    },
    enabled: isEdit,
  });

  // Populate form when editing
  if (isEdit && texte && formData.intitule === "") {
    setFormData({
      type_acte: texte.type_acte || "",
      numero_officiel: texte.numero_officiel || "",
      annee: texte.annee || new Date().getFullYear(),
      date_signature: texte.date_signature || "",
      date_publication_jort: texte.date_publication_jort || "",
      jort_numero: texte.jort_numero || "",
      jort_page_debut: texte.jort_page_debut || "",
      jort_page_fin: texte.jort_page_fin || "",
      autorite_emettrice: texte.autorite_emettrice || "",
      intitule: texte.intitule || "",
      objet_resume: texte.objet_resume || "",
      statut_vigueur: texte.statut_vigueur || "en_vigueur",
      url_pdf_ar: texte.url_pdf_ar || "",
      url_pdf_fr: texte.url_pdf_fr || "",
      notes_editoriales: texte.notes_editoriales || "",
    });
  }

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEdit) {
        const { error } = await supabase
          .from("textes_reglementaires")
          .update(data)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("textes_reglementaires")
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["textes-reglementaires"] });
      toast({
        title: isEdit ? "Texte modifié" : "Texte créé",
        description: isEdit
          ? "Le texte a été mis à jour avec succès"
          : "Le nouveau texte a été créé avec succès",
      });
      navigate("/textes");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validData = texteSchema.parse({
        ...formData,
        annee: parseInt(formData.annee.toString()),
        url_pdf_fr: formData.url_pdf_fr || undefined,
      });

      saveMutation.mutate(validData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
        toast({
          title: "Erreurs de validation",
          description: "Veuillez corriger les erreurs dans le formulaire",
          variant: "destructive",
        });
      }
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/textes")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {isEdit ? "Éditer un texte" : "Créer un texte réglementaire"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isEdit ? "Modifier les informations du texte" : "Ajouter un nouveau texte à la base"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identification */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Identification du texte</CardTitle>
            <CardDescription>Informations principales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="type_acte">Type d'acte *</Label>
                <Select
                  value={formData.type_acte}
                  onValueChange={(value) => handleChange("type_acte", value)}
                >
                  <SelectTrigger id="type_acte" className={errors.type_acte ? "border-destructive" : ""}>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typesActe?.map((type) => (
                      <SelectItem key={type.code} value={type.code}>
                        {type.libelle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type_acte && (
                  <p className="text-xs text-destructive mt-1">{errors.type_acte}</p>
                )}
              </div>

              <div>
                <Label htmlFor="numero_officiel">Numéro officiel * (Format: AAAA-NNN)</Label>
                <Input
                  id="numero_officiel"
                  placeholder="2016-772"
                  value={formData.numero_officiel}
                  onChange={(e) => handleChange("numero_officiel", e.target.value)}
                  className={errors.numero_officiel ? "border-destructive" : ""}
                />
                {errors.numero_officiel && (
                  <p className="text-xs text-destructive mt-1">{errors.numero_officiel}</p>
                )}
              </div>

              <div>
                <Label htmlFor="annee">Année *</Label>
                <Input
                  id="annee"
                  type="number"
                  min="1900"
                  max="2100"
                  value={formData.annee}
                  onChange={(e) => handleChange("annee", parseInt(e.target.value))}
                  className={errors.annee ? "border-destructive" : ""}
                />
                {errors.annee && (
                  <p className="text-xs text-destructive mt-1">{errors.annee}</p>
                )}
              </div>

              <div>
                <Label htmlFor="date_signature">Date de signature</Label>
                <Input
                  id="date_signature"
                  type="date"
                  value={formData.date_signature}
                  onChange={(e) => handleChange("date_signature", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="intitule">Intitulé *</Label>
              <Input
                id="intitule"
                placeholder="Titre complet du texte"
                value={formData.intitule}
                onChange={(e) => handleChange("intitule", e.target.value)}
                className={errors.intitule ? "border-destructive" : ""}
              />
              {errors.intitule && (
                <p className="text-xs text-destructive mt-1">{errors.intitule}</p>
              )}
            </div>

            <div>
              <Label htmlFor="autorite_emettrice">Autorité émettrice</Label>
              <Input
                id="autorite_emettrice"
                placeholder="Ex: Ministère de l'Intérieur"
                value={formData.autorite_emettrice}
                onChange={(e) => handleChange("autorite_emettrice", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="objet_resume">Objet / Résumé</Label>
              <Textarea
                id="objet_resume"
                placeholder="Résumé du contenu du texte"
                value={formData.objet_resume}
                onChange={(e) => handleChange("objet_resume", e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="statut_vigueur">Statut *</Label>
              <Select
                value={formData.statut_vigueur}
                onValueChange={(value) => handleChange("statut_vigueur", value)}
              >
                <SelectTrigger id="statut_vigueur">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_vigueur">En vigueur</SelectItem>
                  <SelectItem value="modifie">Modifié</SelectItem>
                  <SelectItem value="abroge">Abrogé</SelectItem>
                  <SelectItem value="suspendu">Suspendu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* JORT */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Publication au JORT</CardTitle>
            <CardDescription>Référence au Journal Officiel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="jort_numero">Numéro JORT</Label>
                <Input
                  id="jort_numero"
                  placeholder="Ex: 51"
                  value={formData.jort_numero}
                  onChange={(e) => handleChange("jort_numero", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="date_publication_jort">Date de publication</Label>
                <Input
                  id="date_publication_jort"
                  type="date"
                  value={formData.date_publication_jort}
                  onChange={(e) => handleChange("date_publication_jort", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="jort_page_debut">Page de début</Label>
                <Input
                  id="jort_page_debut"
                  type="number"
                  placeholder="Ex: 1234"
                  value={formData.jort_page_debut}
                  onChange={(e) => handleChange("jort_page_debut", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="jort_page_fin">Page de fin</Label>
                <Input
                  id="jort_page_fin"
                  type="number"
                  placeholder="Ex: 1240"
                  value={formData.jort_page_fin}
                  onChange={(e) => handleChange("jort_page_fin", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fichiers */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Documents PDF</CardTitle>
            <CardDescription>
              Le PDF arabe est obligatoire (texte officiel). Le PDF français est informatif.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="url_pdf_ar">URL PDF Arabe (Officiel) *</Label>
              <Input
                id="url_pdf_ar"
                type="url"
                placeholder="https://example.com/document.pdf"
                value={formData.url_pdf_ar}
                onChange={(e) => handleChange("url_pdf_ar", e.target.value)}
                className={errors.url_pdf_ar ? "border-destructive" : ""}
              />
              {errors.url_pdf_ar && (
                <p className="text-xs text-destructive mt-1">{errors.url_pdf_ar}</p>
              )}
            </div>

            <div>
              <Label htmlFor="url_pdf_fr">URL PDF Français (Informatif)</Label>
              <Input
                id="url_pdf_fr"
                type="url"
                placeholder="https://example.com/document_fr.pdf"
                value={formData.url_pdf_fr}
                onChange={(e) => handleChange("url_pdf_fr", e.target.value)}
                className={errors.url_pdf_fr ? "border-destructive" : ""}
              />
              {errors.url_pdf_fr && (
                <p className="text-xs text-destructive mt-1">{errors.url_pdf_fr}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Traduction informative — seul l'arabe fait foi
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Notes éditoriales</CardTitle>
            <CardDescription>Notes internes (optionnel)</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              id="notes_editoriales"
              placeholder="Notes internes, remarques..."
              value={formData.notes_editoriales}
              onChange={(e) => handleChange("notes_editoriales", e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/textes")}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            className="bg-gradient-primary shadow-medium"
            disabled={saveMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending
              ? "Enregistrement..."
              : isEdit
              ? "Enregistrer"
              : "Créer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
