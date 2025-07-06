import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import PlaylistManagerComponent from "@/components/playlist/playlist-manager-component";
import { generatePlaylistPDF } from "@/lib/pdf-export";
import type { PlaylistWithItems } from "@shared/schema";

export default function PlaylistManager() {
  const [, params] = useRoute("/playlist/:id");
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const playlistId = params?.id ? parseInt(params.id) : null;

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

  // Fetch playlist with items
  const { data: playlist, isLoading: playlistLoading, error } = useQuery<PlaylistWithItems>({
    queryKey: [`/api/playlists/${playlistId}`],
    enabled: !!playlistId && isAuthenticated,
    retry: false,
  });

  // Remove tab from playlist mutation
  const removeTabMutation = useMutation({
    mutationFn: async (tabId: number) => {
      const response = await apiRequest("DELETE", `/api/playlists/${playlistId}/items/${tabId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tab removed from playlist!",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/playlists/${playlistId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
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
        description: "Failed to remove tab from playlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Reorder playlist items mutation
  const reorderMutation = useMutation({
    mutationFn: async (itemOrders: { id: number; order: number }[]) => {
      const response = await apiRequest("PUT", `/api/playlists/${playlistId}/reorder`, { itemOrders });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/playlists/${playlistId}`] });
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
        description: "Failed to reorder playlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRemoveTab = (tabId: number) => {
    removeTabMutation.mutate(tabId);
  };

  const handleReorder = (itemOrders: { id: number; order: number }[]) => {
    reorderMutation.mutate(itemOrders);
  };

  const handleExportPDF = () => {
    if (!playlist) return;
    
    try {
      generatePlaylistPDF(playlist);
      toast({
        title: "Success",
        description: "Playlist PDF exported successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export playlist PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePlayTab = (tabId: number) => {
    navigate(`/tab/${tabId}`);
  };

  if (!playlistId) {
    return (
      <div className="min-h-screen bg-dark-primary">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Invalid Playlist</h2>
            <p className="text-gray-400">The playlist ID is not valid.</p>
          </div>
        </div>
      </div>
    );
  }

  if (authLoading || playlistLoading) {
    return (
      <div className="min-h-screen bg-dark-primary">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tabster-orange"></div>
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="min-h-screen bg-dark-primary">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Playlist Not Found</h2>
            <p className="text-gray-400">The playlist you're looking for doesn't exist or you don't have permission to view it.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary">
      <Header />
      <PlaylistManagerComponent
        playlist={playlist}
        onRemoveTab={handleRemoveTab}
        onReorder={handleReorder}
        onExportPDF={handleExportPDF}
        onPlayTab={handlePlayTab}
        onBack={() => navigate("/")}
        isLoading={removeTabMutation.isPending || reorderMutation.isPending}
      />
    </div>
  );
}
