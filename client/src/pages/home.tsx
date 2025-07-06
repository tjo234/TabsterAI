import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Music, 
  List, 
  Heart, 
  TrendingUp, 
  Play, 
  Clock,
  Guitar 
} from "lucide-react";
import type { Tab, Playlist, TabWithUser } from "@shared/schema";

interface UserStats {
  totalTabs: number;
  totalPlaylists: number;
  totalFavorites: number;
  monthlyTabs: number;
}

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ["/api/stats"],
    retry: false,
  });

  const { data: userTabs, isLoading: userTabsLoading } = useQuery<Tab[]>({
    queryKey: ["/api/tabs"],
    retry: false,
  });

  const { data: playlists, isLoading: playlistsLoading } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists"],
    retry: false,
  });

  const { data: popularTabs, isLoading: popularLoading } = useQuery<TabWithUser[]>({
    queryKey: ["/api/tabs/public/browse", "popular"],
    retry: false,
  });

  const { data: recentPublicTabs, isLoading: recentPublicLoading } = useQuery<TabWithUser[]>({
    queryKey: ["/api/tabs/public/browse", "recent"],
    retry: false,
  });

  if (isLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-dark-primary">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-dark-tertiary rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-dark-secondary rounded-xl"></div>
              ))}
            </div>
            <div className="h-64 bg-dark-secondary rounded-xl"></div>
          </div>
        </main>
      </div>
    );
  }

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return "Unknown";
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`;
    if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    return "Just now";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-orange-400';
      case 'expert': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-dark-primary">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white">Dashboard</h2>
              <p className="text-gray-400 mt-1">Welcome back! Here's your guitar tab library.</p>
            </div>

          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-dark-secondary border-dark-tertiary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Tabs</p>
                    <p className="text-2xl font-bold text-white">{stats?.totalTabs || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-tabster-orange/20 rounded-lg flex items-center justify-center">
                    <Music className="w-6 h-6 text-tabster-orange" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-secondary border-dark-tertiary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Playlists</p>
                    <p className="text-2xl font-bold text-white">{stats?.totalPlaylists || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <List className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-secondary border-dark-tertiary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Favorites</p>
                    <p className="text-2xl font-bold text-white">{stats?.totalFavorites || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <Heart className="w-6 h-6 text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-secondary border-dark-tertiary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">This Month</p>
                    <p className="text-2xl font-bold text-white">{stats?.monthlyTabs || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Popular Tabs Section */}
          <Card className="bg-dark-secondary border-dark-tertiary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-tabster-orange" />
                  Popular Tabs
                </h3>
                <Link href="/browse/popular">
                  <Button variant="ghost" size="sm" className="text-tabster-orange hover:bg-dark-tertiary">
                    View All
                  </Button>
                </Link>
              </div>
              
              {popularLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-24 bg-dark-tertiary rounded animate-pulse"></div>
                  ))}
                </div>
              ) : popularTabs && popularTabs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {popularTabs.slice(0, 6).map((tab: TabWithUser) => (
                    <Link key={tab.id} href={`/tab/${tab.id}`}>
                      <div className="bg-dark-tertiary rounded-lg p-4 hover:bg-dark-quaternary transition-colors cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white truncate">{tab.title}</h4>
                            <p className="text-sm text-gray-400 truncate">{tab.artist}</p>
                          </div>
                          <Button size="sm" variant="ghost" className="ml-2 text-tabster-orange hover:bg-tabster-orange/10">
                            <Play className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className={getDifficultyColor(tab.difficulty)}>{tab.difficulty}</span>
                          <span>{tab.genre}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Guitar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-white mb-2">No popular tabs yet</h4>
                  <p className="text-gray-400">Popular tabs will appear here based on community activity</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Tabs Section */}
          <Card className="bg-dark-secondary border-dark-tertiary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-tabster-orange" />
                  Recent Tabs
                </h3>
                <Link href="/browse/recent">
                  <Button variant="ghost" size="sm" className="text-tabster-orange hover:bg-dark-tertiary">
                    View All
                  </Button>
                </Link>
              </div>
              
              {recentPublicLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-24 bg-dark-tertiary rounded animate-pulse"></div>
                  ))}
                </div>
              ) : recentPublicTabs && recentPublicTabs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentPublicTabs.slice(0, 6).map((tab: TabWithUser) => (
                    <Link key={tab.id} href={`/tab/${tab.id}`}>
                      <div className="bg-dark-tertiary rounded-lg p-4 hover:bg-dark-quaternary transition-colors cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white truncate">{tab.title}</h4>
                            <p className="text-sm text-gray-400 truncate">{tab.artist}</p>
                          </div>
                          <Button size="sm" variant="ghost" className="ml-2 text-tabster-orange hover:bg-tabster-orange/10">
                            <Play className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className={getDifficultyColor(tab.difficulty)}>{tab.difficulty}</span>
                          <span>{formatTimeAgo(tab.createdAt)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-white mb-2">No recent tabs yet</h4>
                  <p className="text-gray-400">Community tabs will appear here as they're created</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}