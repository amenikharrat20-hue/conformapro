import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>

      <Card className="shadow-medium">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Construction className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">Module en développement</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Cette fonctionnalité sera bientôt disponible. Revenez plus tard pour découvrir toutes les capacités de ce module.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
