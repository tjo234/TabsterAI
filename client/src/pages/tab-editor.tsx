import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import TabEditorComponent from "@/components/tab/tab-editor-component";
import { insertTabSchema, type Tab, type InsertTab } from "@shared/schema";

export default function TabEditor() {
  const [, params] = useRoute("/tab/:id/edit");
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const isEditing = !!params?.id;
  const tabId = params?.id ? parseInt(params.id) : null;

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

  // Fetch existing tab if editing
  const { data: existingTab, isLoading: tabLoading } = useQuery<Tab>({
    queryKey: [`/api/tabs/${tabId}`],
    enabled: isEditing && !!tabId,
    retry: false,
  });

  // Create tab mutation
  const createTabMutation = useMutation({
    mutationFn: async (tabData: InsertTab) => {
      const response = await apiRequest("POST", "/api/tabs", tabData);
      return response.json();
    },
    onSuccess: (newTab) => {
      toast({
        title: "Success",
        description: "Tab created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tabs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      navigate(`/tab/${newTab.id}`);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to create tab. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update tab mutation
  const updateTabMutation = useMutation({
    mutationFn: async (tabData: Partial<InsertTab>) => {
      const response = await apiRequest("PUT", `/api/tabs/${tabId}`, tabData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tab updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/tabs/${tabId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/tabs"] });
      navigate(`/tab/${tabId}`);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update tab. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = (tabData: InsertTab) => {
    try {
      // Validate the data
      insertTabSchema.parse(tabData);

      if (isEditing) {
        updateTabMutation.mutate(tabData);
      } else {
        createTabMutation.mutate(tabData);
      }
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
    }
  };

  if (authLoading || (isEditing && tabLoading)) {
    return (
      <div className="min-h-screen bg-dark-primary">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tabster-orange"></div>
        </div>
      </div>
    );
  }

  if (isEditing && !existingTab) {
    return (
      <div className="min-h-screen bg-dark-primary">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Tab Not Found</h2>
            <p className="text-gray-400">The tab you're looking for doesn't exist or you don't have permission to edit it.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary">
      <Header />
      <TabEditorComponent
        initialTab={existingTab}
        onSave={handleSave}
        onCancel={() => navigate("/")}
        isLoading={createTabMutation.isPending || updateTabMutation.isPending}
        isEditing={isEditing}
      />
    </div>
  );
}
