import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exportHelpers } from "@/lib/bibliotheque-queries";

interface ExportActePDFProps {
  acteId: string;
  acteTitle: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ExportActePDF({ acteId, acteTitle, variant = "outline", size = "sm" }: ExportActePDFProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Fetch data
      const data = await exportHelpers.generateActePDF(acteId);
      
      // Generate PDF content (HTML structure)
      const htmlContent = generateHTMLContent(data);
      
      // Create print window
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for content to load, then print
        printWindow.onload = () => {
          printWindow.print();
        };
        
        toast.success("Document prêt à imprimer/enregistrer en PDF");
      }
    } catch (error: any) {
      toast.error("Erreur lors de l'export: " + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const generateHTMLContent = (data: any) => {
    const { acte, annexes, changelog } = data;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${acte.intitule}</title>
        <style>
          @page { margin: 2cm; }
          body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
          .header { text-align: center; border-bottom: 3px solid #0B2540; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #0B2540; margin-bottom: 10px; }
          .subtitle { color: #666; font-size: 14px; }
          h1 { color: #0B2540; font-size: 24px; margin-top: 30px; }
          h2 { color: #0B2540; font-size: 18px; margin-top: 25px; border-bottom: 2px solid #D4A017; padding-bottom: 8px; }
          h3 { color: #0B2540; font-size: 16px; margin-top: 20px; }
          .meta-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .meta-table td { padding: 8px; border: 1px solid #ddd; }
          .meta-table td:first-child { font-weight: bold; background-color: #f5f5f5; width: 30%; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
          .badge-success { background-color: #dcfce7; color: #166534; }
          .badge-warning { background-color: #fef3c7; color: #92400e; }
          .badge-danger { background-color: #fee2e2; color: #991b1b; }
          .content-section { margin: 25px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px; }
          .article-item { margin: 15px 0; padding: 15px; background-color: white; border-left: 4px solid #D4A017; }
          .article-title { font-weight: bold; color: #0B2540; margin-bottom: 8px; }
          .annexe-item { margin: 10px 0; padding: 12px; background-color: white; border: 1px solid #ddd; border-radius: 4px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #666; font-size: 12px; }
          .tags { margin: 10px 0; }
          .tag { display: inline-block; padding: 4px 10px; margin: 2px; background-color: #e5e7eb; border-radius: 4px; font-size: 12px; }
          @media print { 
            .no-print { display: none; }
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Conforma Pro</div>
          <div class="subtitle">Bibliothèque Réglementaire</div>
        </div>

        <h1>${acte.intitule}</h1>

        <table class="meta-table">
          <tr>
            <td>Référence officielle</td>
            <td>${acte.reference_officielle || acte.numero_officiel || '—'}</td>
          </tr>
          <tr>
            <td>Type</td>
            <td>${acte.type_acte || '—'}</td>
          </tr>
          <tr>
            <td>Autorité émettrice</td>
            <td>${acte.autorite_emettrice || '—'}</td>
          </tr>
          <tr>
            <td>Date de signature</td>
            <td>${acte.date_signature ? new Date(acte.date_signature).toLocaleDateString('fr-FR') : '—'}</td>
          </tr>
          <tr>
            <td>Date de publication (JORT)</td>
            <td>${acte.date_publication_jort ? new Date(acte.date_publication_jort).toLocaleDateString('fr-FR') : '—'}</td>
          </tr>
          <tr>
            <td>Statut de vigueur</td>
            <td><span class="badge ${getStatusClass(acte.statut_vigueur)}">${getStatusLabel(acte.statut_vigueur)}</span></td>
          </tr>
          <tr>
            <td>Version</td>
            <td>${acte.version || 1}</td>
          </tr>
        </table>

        ${acte.tags && acte.tags.length > 0 ? `
          <h2>Mots-clés</h2>
          <div class="tags">
            ${acte.tags.map((tag: string) => `<span class="tag">${tag}</span>`).join('')}
          </div>
        ` : ''}

        ${acte.objet_resume ? `
          <h2>Résumé</h2>
          <div class="content-section">
            ${acte.objet_resume}
          </div>
        ` : ''}

        ${acte.content ? `
          <h2>Contenu intégral</h2>
          <div class="content-section">
            ${acte.content.replace(/\n/g, '<br>')}
          </div>
        ` : ''}

        ${acte.articles && acte.articles.length > 0 ? `
          <h2>Articles (${acte.articles.length})</h2>
          ${acte.articles.map((article: any) => `
            <div class="article-item">
              <div class="article-title">Article ${article.numero}${article.titre_court ? ` - ${article.titre_court}` : ''}</div>
              <div>${article.contenu_fr || article.contenu_ar || '—'}</div>
            </div>
          `).join('')}
        ` : ''}

        ${annexes.length > 0 ? `
          <h2>Annexes (${annexes.length})</h2>
          ${annexes.map((annexe: any) => `
            <div class="annexe-item">
              <strong>${annexe.label}</strong><br>
              <span style="color: #666; font-size: 12px;">Fichier: ${annexe.file_url.split('/').pop()}</span>
            </div>
          `).join('')}
        ` : ''}

        ${changelog.length > 0 ? `
          <h2>Historique des modifications</h2>
          ${changelog.slice(0, 10).map((entry: any) => `
            <div class="annexe-item">
              <strong>${entry.type_changement}</strong> - 
              ${new Date(entry.date_changement).toLocaleDateString('fr-FR')}<br>
              <span style="font-size: 13px;">${entry.resume || ''}</span>
            </div>
          `).join('')}
        ` : ''}

        <div class="footer">
          Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}<br>
          Conforma Pro - Bibliothèque Réglementaire
        </div>
      </body>
      </html>
    `;
  };

  return (
    <Button variant={variant} size={size} onClick={handleExport} disabled={isExporting}>
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Export...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </>
      )}
    </Button>
  );
}

function getStatusClass(statut: string) {
  switch (statut) {
    case 'en_vigueur': return 'badge-success';
    case 'modifie': return 'badge-warning';
    case 'abroge': case 'suspendu': return 'badge-danger';
    default: return '';
  }
}

function getStatusLabel(statut: string) {
  switch (statut) {
    case 'en_vigueur': return 'En vigueur';
    case 'modifie': return 'Modifié';
    case 'abroge': return 'Abrogé';
    case 'suspendu': return 'Suspendu';
    default: return statut;
  }
}
