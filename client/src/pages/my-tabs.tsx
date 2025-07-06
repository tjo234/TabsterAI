import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
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
import type { Tab } from "@shared/schema";

export default function MyTabs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const { toast } = useToast();

  const { data: tabs = [], isLoading, error } = useQuery<Tab[]>({
    queryKey: ["/api/tabs"],
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (tabId: number) => {
      const response = await fetch(`/api/tabs/${tabId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete tab");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tabs"] });
      toast({
        title: "Success",
        description: "Tab deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete tab",
        variant: "destructive",
      });
    },
  });

  const genres = ["Rock", "Pop", "Blues", "Metal", "Jazz", "Classical", "Country", "Folk"];
  const difficulties = ["Beginner", "Intermediate", "Advanced", "Expert"];

  // Filter tabs based on search and filters
  const filteredTabs = tabs.filter(tab => {
    const matchesSearch = !searchQuery || 
      tab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tab.artist?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGenre = !selectedGenre || selectedGenre === "all" || 
      tab.genre?.toLowerCase() === selectedGenre;
    
    const matchesDifficulty = !selectedDifficulty || selectedDifficulty === "all" ||
      tab.difficulty?.toLowerCase() === selectedDifficulty;

    return matchesSearch && matchesGenre && matchesDifficulty;
  });

  if (error) {
    return (
      <div className="min-h-screen bg-dark-primary">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Unable to Load Your Tabs</h1>
            <p className="text-gray-400">There was an error loading your tabs. Please try again later.</p>
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
            <h1 className="text-3xl font-bold text-white mb-2">My Tabs</h1>
            <p className="text-gray-400">Manage your guitar tablatures</p>
          </div>
          <Link href="/tab/new">
            <Button className="bg-tabster-orange hover:bg-tabster-amber text-white">
              <Plus className="mr-2 h-4 w-4" />
              Create New Tab
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search your tabs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-dark-secondary border-dark-tertiary text-white"
            />
          </div>
          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="w-full sm:w-48 bg-dark-secondary border-dark-tertiary text-white">
              <SelectValue placeholder="All Genres" />
            </SelectTrigger>
            <SelectContent className="bg-dark-secondary border-dark-tertiary">
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre.toLowerCase()}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-full sm:w-48 bg-dark-secondary border-dark-tertiary text-white">
              <SelectValue placeholder="All Difficulties" />
            </SelectTrigger>
            <SelectContent className="bg-dark-secondary border-dark-tertiary">
              <SelectItem value="all">All Difficulties</SelectItem>
              {difficulties.map((difficulty) => (
                <SelectItem key={difficulty} value={difficulty.toLowerCase()}>
                  {difficulty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        {!isLoading && filteredTabs.length === 0 && (
          <div className="text-center py-12">
            <div className="mb-4">
              <Music className="mx-auto h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {tabs.length === 0 ? "No tabs yet" : "No tabs match your filters"}
            </h3>
            <p className="text-gray-400 mb-6">
              {tabs.length === 0 
                ? "Create your first guitar tab to get started!"
                : "Try adjusting your search or filter settings."}
            </p>
            <Link href="/tab/new">
              <Button className="bg-tabster-orange hover:bg-tabster-amber text-white">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Tab
              </Button>
            </Link>
          </div>
        )}

        {/* Tabs Grid */}
        {!isLoading && filteredTabs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTabs.map((tab) => (
              <Card key={tab.id} className="bg-dark-secondary border-dark-tertiary hover:border-tabster-orange transition-colors group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white group-hover:text-tabster-orange transition-colors">
                        {tab.title}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {tab.artist && `by ${tab.artist}`}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tab.genre && (
                      <Badge variant="secondary" className="bg-dark-tertiary text-gray-300">
                        {tab.genre}
                      </Badge>
                    )}
                    {tab.difficulty && (
                      <Badge variant="secondary" className="bg-dark-tertiary text-gray-300">
                        {tab.difficulty}
                      </Badge>
                    )}
                    {tab.tuning && (
                      <Badge variant="secondary" className="bg-dark-tertiary text-gray-300">
                        {tab.tuning}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {tab.createdAt ? new Date(tab.createdAt).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/tab/${tab.id}`} className="flex-1">
                      <Button size="sm" variant="ghost" className="w-full text-tabster-orange hover:text-tabster-amber hover:bg-dark-tertiary">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/tab/${tab.id}/edit`}>
                      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white hover:bg-dark-tertiary">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-dark-tertiary">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-dark-secondary border-dark-tertiary">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Delete Tab</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-400">
                            Are you sure you want to delete "{tab.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-dark-tertiary text-white border-dark-quaternary hover:bg-dark-quaternary">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteMutation.mutate(tab.id)}
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