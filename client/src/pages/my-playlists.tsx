import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  ListMusic,
  Music
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Playlist } from "@shared/schema";

export default function MyPlaylists() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: playlists = [], isLoading, error } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists"],
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (playlistId: number) => {
      await apiRequest(`/api/playlists/${playlistId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      toast({
        title: "Success",
        description: "Playlist deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete playlist",
        variant: "destructive",
      });
    },
  });

  // Filter playlists based on search
  const filteredPlaylists = playlists.filter(playlist => {
    const matchesSearch = !searchQuery || 
      playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      playlist.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  if (error) {
    return (
      <div className="min-h-screen bg-dark-primary">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Unable to Load Your Playlists</h1>
            <p className="text-gray-400">There was an error loading your playlists. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Playlists</h1>
            <p className="text-gray-400">Organize your tabs into collections</p>
          </div>
          <Button className="bg-tabster-orange hover:bg-tabster-amber text-white">
            <Plus className="mr-2 h-4 w-4" />
            Create New Playlist
          </Button>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search your playlists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-dark-secondary border-dark-tertiary text-white"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-dark-secondary border-dark-tertiary">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 bg-dark-tertiary" />
                  <Skeleton className="h-4 w-1/2 bg-dark-tertiary" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2 bg-dark-tertiary" />
                  <Skeleton className="h-4 w-3/4 bg-dark-tertiary" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredPlaylists.length === 0 && (
          <div className="text-center py-12">
            <div className="mb-4">
              <ListMusic className="mx-auto h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {playlists.length === 0 ? "No playlists yet" : "No playlists match your search"}
            </h3>
            <p className="text-gray-400 mb-6">
              {playlists.length === 0 
                ? "Create your first playlist to organize your tabs!"
                : "Try adjusting your search terms."}
            </p>
            <Button className="bg-tabster-orange hover:bg-tabster-amber text-white">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Playlist
            </Button>
          </div>
        )}

        {/* Playlists Grid */}
        {!isLoading && filteredPlaylists.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaylists.map((playlist) => (
              <Card key={playlist.id} className="bg-dark-secondary border-dark-tertiary hover:border-tabster-orange transition-colors group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white group-hover:text-tabster-orange transition-colors">
                        {playlist.name}
                      </CardTitle>
                      {playlist.description && (
                        <CardDescription className="text-gray-400 mt-2">
                          {playlist.description}
                        </CardDescription>
                      )}
                    </div>
                    <Badge variant={playlist.isPublic ? "default" : "secondary"} className="ml-2">
                      {playlist.isPublic ? "Public" : "Private"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {playlist.createdAt ? new Date(playlist.createdAt as string).toLocaleDateString() : 'Unknown'}
                    </div>
                    <div className="flex items-center">
                      <Music className="h-4 w-4 mr-1" />
                      {/* You could add tab count here if available */}
                      Tabs
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/playlist/${playlist.id}`} className="flex-1">
                      <Button size="sm" variant="ghost" className="w-full text-tabster-orange hover:text-tabster-amber hover:bg-dark-tertiary">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white hover:bg-dark-tertiary">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-dark-tertiary">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-dark-secondary border-dark-tertiary">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Delete Playlist</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-400">
                            Are you sure you want to delete "{playlist.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-dark-tertiary text-white border-dark-quaternary hover:bg-dark-quaternary">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteMutation.mutate(playlist.id)}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}