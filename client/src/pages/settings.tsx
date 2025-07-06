import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Download,
  Plus,
  Shield,
  Settings as SettingsIcon,
  Users,
  Database
} from "lucide-react";

export default function Settings() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Check if user is admin
  const isAdmin = user?.isAdmin || false;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark-primary">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tabster-orange"></div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-dark-primary">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-gray-400">You don't have permission to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <SettingsIcon className="w-8 h-8 text-tabster-orange" />
            <h1 className="text-3xl font-bold text-white">Admin Settings</h1>
          </div>
          <p className="text-gray-400">Manage Tabster platform settings and administrative functions.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Management */}
          <Card className="bg-dark-secondary border-dark-tertiary">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Database className="w-5 h-5 mr-2 text-tabster-orange" />
                Content Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-400 text-sm">
                Manage tabs, playlists, and export data from the platform.
              </p>
              
              <div className="flex flex-col space-y-2">
                <Button 
                  variant="outline" 
                  className="bg-dark-tertiary hover:bg-dark-quaternary text-white border-dark-quaternary justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export All Tabs
                </Button>
                
                <Link href="/tab/new">
                  <Button className="bg-tabster-orange hover:bg-orange-600 text-white w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Tab
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card className="bg-dark-secondary border-dark-tertiary">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-tabster-orange" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-400 text-sm">
                Manage user accounts, permissions, and platform access.
              </p>
              
              <div className="flex flex-col space-y-2">
                <Button 
                  variant="outline" 
                  className="bg-dark-tertiary hover:bg-dark-quaternary text-white border-dark-quaternary justify-start"
                  disabled
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}