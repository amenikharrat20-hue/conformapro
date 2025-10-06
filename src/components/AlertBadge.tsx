import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AlertBadgeProps {
  status: "conforme" | "expire-bientot" | "expire" | "en-cours";
  children: React.ReactNode;
}

export function AlertBadge({ status, children }: AlertBadgeProps) {
  const variants = {
    conforme: "bg-success text-success-foreground",
    "expire-bientot": "bg-warning text-warning-foreground",
    expire: "bg-destructive text-destructive-foreground",
    "en-cours": "bg-primary text-primary-foreground",
  };

  return (
    <Badge className={cn("font-medium", variants[status])}>
      {children}
    </Badge>
  );
}
