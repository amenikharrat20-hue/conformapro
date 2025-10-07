import { LayoutDashboard, FileText, ClipboardCheck, AlertTriangle, ShieldCheck, GraduationCap, HardHat, Users, FileCheck, BookOpen, Menu, Building2, Factory } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Tableau de bord", url: "/", icon: LayoutDashboard },
  { title: "Clients", url: "/clients", icon: Building2 },
  { title: "Sites", url: "/sites", icon: Factory },
  { title: "Textes réglementaires", url: "/textes", icon: BookOpen },
  { title: "Veille réglementaire", url: "/veille", icon: FileText },
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
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
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
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
