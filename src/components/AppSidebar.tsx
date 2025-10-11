import { LayoutDashboard, FileText, ClipboardCheck, AlertTriangle, ShieldCheck, GraduationCap, HardHat, Users, FileCheck, BookOpen, Menu, Building2, Factory, Library, ChevronDown } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { UserMenu } from "@/components/UserMenu";

interface SubMenuItem {
  title: string;
  url: string;
}

interface MenuItem {
  title: string;
  url?: string;
  icon: any;
  subItems?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  { title: "Tableau de bord", url: "/", icon: LayoutDashboard },
  { title: "Clients", url: "/clients", icon: Building2 },
  { title: "Sites", url: "/sites", icon: Factory },
  { title: "Actes réglementaires", url: "/actes", icon: BookOpen },
  { 
    title: "Veille réglementaire", 
    url: "/veille", 
    icon: FileText,
    subItems: [
      { title: "Bibliothèque", url: "/veille/bibliotheque" },
      { title: "Évaluation de conformité", url: "/veille/conformite" },
      { title: "Plan d'action", url: "/veille/actions" },
      { title: "Gestion des domaines", url: "/veille/domaines" }
    ]
  },
  { title: "Dossier réglementaire", url: "/dossier", icon: FileCheck },
  { title: "Contrôles techniques", url: "/controles", icon: ClipboardCheck },
  { title: "Incidents HSE", url: "/incidents", icon: AlertTriangle },
  { title: "Audits & Inspections", url: "/audits", icon: ShieldCheck },
  { title: "Formations", url: "/formations", icon: GraduationCap },
  { title: "EPI & Équipements", url: "/epi", icon: HardHat },
  { title: "Prestataires", url: "/prestataires", icon: Users },
  { title: "Permis de travail", url: "/permis", icon: FileCheck },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-sidebar-primary" />
            <span className="font-bold text-lg text-sidebar-foreground">Conforma Pro</span>
          </div>
        )}
        <SidebarTrigger className={isCollapsed ? "mx-auto" : ""}>
          <Menu className="h-5 w-5" />
        </SidebarTrigger>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <Collapsible
                  key={item.title}
                  open={openItems.includes(item.title)}
                  onOpenChange={() => toggleItem(item.title)}
                >
                  <SidebarMenuItem>
                    {item.subItems && item.subItems.length > 0 ? (
                      <>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            onClick={() => {
                              if (item.url) {
                                // Navigate to parent URL if it exists
                                window.location.href = item.url;
                              }
                            }}
                          >
                            <item.icon className="h-4 w-4" />
                            {!isCollapsed && (
                              <>
                                <span>{item.title}</span>
                                <ChevronDown className="ml-auto h-4 w-4 transition-transform" />
                              </>
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        {!isCollapsed && (
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.subItems.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.url}>
                                  <SidebarMenuSubButton asChild>
                                    <NavLink
                                      to={subItem.url}
                                      className={({ isActive }) =>
                                        isActive
                                          ? "bg-sidebar-accent text-sidebar-primary font-medium"
                                          : "hover:bg-sidebar-accent/50"
                                      }
                                    >
                                      <span>{subItem.title}</span>
                                    </NavLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        )}
                      </>
                    ) : (
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url!}
                          end
                          className={({ isActive }) =>
                            isActive
                              ? "bg-sidebar-accent text-sidebar-primary font-medium"
                              : "hover:bg-sidebar-accent/50"
                          }
                        >
                          <item.icon className="h-4 w-4" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center justify-center p-2 border-t border-sidebar-border">
          <UserMenu />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
