import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";
import { useLocation, Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  List,
  Store,
  FileText,
  Users,
  LayoutDashboard,
} from "lucide-react";

export function AppSidebar() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/",
      roles: [UserRole.ADMIN, UserRole.SALES, UserRole.MANAGEMENT],
    },
    {
      title: "Visit Logs",
      icon: List,
      path: "/visits",
      roles: [UserRole.ADMIN, UserRole.SALES, UserRole.MANAGEMENT],
    },
    {
      title: "Stores",
      icon: Store,
      path: "/stores",
      roles: [UserRole.ADMIN, UserRole.SALES, UserRole.MANAGEMENT],
    },
    {
      title: "Veterinary Clinics",
      icon: Store,
      path: "/veterinary-clinics",
      roles: [UserRole.ADMIN, UserRole.SALES, UserRole.MANAGEMENT],
    },
    {
      title: "Others",
      icon: Store,
      path: "/others",
      roles: [UserRole.ADMIN, UserRole.SALES, UserRole.MANAGEMENT],
    },
    {
      title: "Reports",
      icon: FileText,
      path: "/reports",
      roles: [UserRole.ADMIN, UserRole.MANAGEMENT],
    },
    {
      title: "Team",
      icon: Users,
      path: "/team",
      roles: [UserRole.ADMIN],
    },
    {
      title: "Profile",
      icon: Users,
      path: "/profile",
      roles: [UserRole.ADMIN, UserRole.SALES, UserRole.MANAGEMENT],
    },
  ];

  const filteredNavItems = navItems.filter((item) => 
    currentUser ? item.roles.includes(currentUser.role) : false
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-sidebar">
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={isActive(item.path)}>
                    <Link
                      to={item.path}
                      className="flex items-center gap-3 w-full"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
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

export default AppSidebar;
