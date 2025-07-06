import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Star, Calendar, User, Search } from "lucide-react";
import { Link } from "wouter";
import type { TabWithUser } from "@shared/schema";

export default function Browse() {
  const [, params] = useRoute("/browse/:category");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  
  const category = params?.category || "popular";

  const { data: tabs = [], isLoading, error } = useQuery<TabWithUser[]>({
    queryKey: ["/api/tabs/public/browse", category, searchQuery, selectedGenre, selectedDifficulty],
    retry: false,
  });

  const genres = ["Rock", "Pop", "Blues", "Metal", "Jazz", "Classical", "Country", "Folk"];
  const difficulties = ["Beginner", "Intermediate", "Advanced", "Expert"];

  const getCategoryTitle = () => {
    switch (category) {
      case "popular": return "Popular Tabs";
      case "recent": return "Recent Tabs";
      case "top-rated": return "Top Rated Tabs";
      case "discover": return "Discover New Tabs";
      default: return "Browse Tabs";
    }
  };

  const getCategoryDescription = () => {
    switch (category) {
      case "popular": return "Most played and favorited guitar tabs";
      case "recent": return "Latest guitar tabs from the community";
      case "top-rated": return "Highest rated tabs by our users";
      case "discover": return "Find new tabs to expand your repertoire";
      default: return "Explore our collection of guitar tabs";
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-dark-primary">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Unable to Load Tabs</h1>
            <p className="text-gray-400">There was an error loading the tabs. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{getCategoryTitle()}</h1>
          <p className="text-gray-400">{getCategoryDescription()}</p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tabs..."
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
              <SelectItem value="">All Genres</SelectItem>
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
              <SelectItem value="">All Difficulties</SelectItem>
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
        {!isLoading && tabs.length === 0 && (
          <div className="text-center py-12">
            <div className="mb-4">
              <Search className="mx-auto h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No tabs found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || selectedGenre || selectedDifficulty
                ? "Try adjusting your filters or search terms."
                : "Be the first to create a tab in this category!"}
            </p>
            <Link href="/tab/new">
              <Button className="bg-tabster-orange hover:bg-tabster-amber text-white">
                Create Your First Tab
              </Button>
            </Link>
          </div>
        )}

        {/* Tabs Grid */}
        {!isLoading && tabs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tabs.map((tab: TabWithUser) => (
              <Card key={tab.id} className="bg-dark-secondary border-dark-tertiary hover:border-tabster-orange transition-colors group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white group-hover:text-tabster-orange transition-colors">
                        <Link href={`/tab/${tab.id}`} className="block">
                          {tab.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        by {tab.user.email?.split('@')[0] || 'Anonymous'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-3">
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
                  
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {tab.createdAt ? new Date(tab.createdAt as string).toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>
                    <Link href={`/tab/${tab.id}`}>
                      <Button size="sm" variant="ghost" className="text-tabster-orange hover:text-tabster-amber hover:bg-dark-tertiary">
                        View Tab
                      </Button>
                    </Link>
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