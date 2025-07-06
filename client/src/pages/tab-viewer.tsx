import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import TabViewerComponent from "@/components/tab/tab-viewer-component";
import { generateTabPDF } from "@/lib/pdf-export";
import type { TabWithUser, Playlist } from "@shared/schema";

export default function TabViewer() {
  const [, params] = useRoute("/tab/:id");
  const [location, navigate] = useLocation();
  const { toastSuccess, toastError, toastUnauthorized } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const tabId = params?.id ? parseInt(params.id) : null;

  // Don't require auth for viewing tabs (public tabs can be viewed)
  const { data: tab, isLoading: tabLoading, error } = useQuery<TabWithUser>({
    queryKey: [`/api/tabs/${tabId}`],
    enabled: !!tabId,
    retry: false,
  });

  // Check if favorited (only if authenticated)
  const { data: favoriteStatus } = useQuery<{ isFavorited: boolean }>({
    queryKey: [`/api/favorites/${tabId}/check`],
    enabled: isAuthenticated && !!tabId,
    retry: false,
  });

  // Get user's playlists (only if authenticated)
  const { data: playlists = [] } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Add/remove favorite mutations
  const addFavoriteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/favorites", { tabId });
      return response.json();
    },
    onSuccess: () => {
      toastSuccess("Added to favorites!");
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${tabId}/check`] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toastUnauthorized();
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toastError("Failed to add favorite. Please try again.");
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/favorites/${tabId}`);
      return response.json();
    },
    onSuccess: () => {
      toastSuccess("Removed from favorites!");
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${tabId}/check`] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toastUnauthorized();
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toastError("Failed to remove favorite. Please try again.");
    },
  });

  // Add to playlist mutation
  const addToPlaylistMutation = useMutation({
    mutationFn: async (playlistId: number) => {
      const response = await apiRequest("POST", `/api/playlists/${playlistId}/items`, { 
        tabId 
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Add to playlist success:", data);
      toastSuccess("Tab added to playlist!");
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      queryClient.invalidateQueries({ queryKey: ["/api/playlist-items"] });
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
        description: "Failed to add tab to playlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddToPlaylist = (playlistId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add tabs to playlists.",
        variant: "destructive",
      });
      return;
    }
    addToPlaylistMutation.mutate(playlistId);
  };

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      toastError("Please sign in to favorite tabs.");
      return;
    }

    // Prevent multiple concurrent mutations
    if (addFavoriteMutation.isPending || removeFavoriteMutation.isPending) {
      return;
    }

    if (favoriteStatus?.isFavorited) {
      removeFavoriteMutation.mutate();
    } else {
      addFavoriteMutation.mutate();
    }
  };

  const handleExportPDF = () => {
    if (!tab) return;
    
    try {
      generateTabPDF(tab);
      toast({
        title: "Success",
        description: "PDF exported successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    navigate(`/tab/${tabId}/edit`);
  };

  if (!tabId) {
    return (
      <div className="min-h-screen bg-dark-primary">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Invalid Tab</h2>
            <p className="text-gray-400">The tab ID is not valid.</p>
          </div>
        </div>
      </div>
    );
  }

  if (tabLoading) {
    return (
      <div className="min-h-screen bg-dark-primary">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tabster-orange"></div>
        </div>
      </div>
    );
  }

  if (error || !tab) {
    return (
      <div className="min-h-screen bg-dark-primary">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Tab Not Found</h2>
            <p className="text-gray-400">The tab you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary">
      <Header />
      <TabViewerComponent
        tab={tab}
        isAuthenticated={isAuthenticated}
        isFavorited={favoriteStatus?.isFavorited || false}
        onToggleFavorite={handleToggleFavorite}
        onExportPDF={handleExportPDF}
        onEdit={handleEdit}

        favoriteMutationLoading={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
        playlists={playlists || []}
        onAddToPlaylist={handleAddToPlaylist}
        addToPlaylistLoading={addToPlaylistMutation.isPending}
      />
    </div>
  );
}
