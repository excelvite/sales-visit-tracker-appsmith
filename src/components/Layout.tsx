
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { Link, useLocation } from "react-router-dom";
import { FileText, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isDashboard = location.pathname === "/";

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <Header />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                {!isDashboard && (
                  <Link to="/">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      <span className="hidden md:inline">Back to Dashboard</span>
                    </Button>
                  </Link>
                )}
              </div>
              <Link to="/weekly-updates">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden md:inline">This Week's Updates</span>
                </Button>
              </Link>
            </div>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default Layout;
