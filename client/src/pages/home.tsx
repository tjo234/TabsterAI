import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Music, 
  List, 
  Heart, 
  TrendingUp, 
  Plus, 
  Play, 
  Download,
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
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ["/api/stats"],
    retry: false,
  });

  const { data: recentTabs, isLoading: tabsLoading } = useQuery<Tab[]>({
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
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
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
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white">Dashboard</h2>
                <p className="text-gray-400 mt-1">Welcome back! Here's your guitar tab library.</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  className="bg-dark-tertiary hover:bg-dark-quaternary text-white border-dark-quaternary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export All
                </Button>
                <Link href="/tab/new">
                  <Button className="bg-tabster-orange hover:bg-orange-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Tab
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-dark-secondary border-dark-tertiary">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Tabs</p>
                      <p className="text-2xl font-bold text-white">
                        {stats?.totalTabs || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-tabster-orange/20 rounded-lg flex items-center justify-center">
                      <Music className="text-tabster-orange" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-secondary border-dark-tertiary">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Playlists</p>
                      <p className="text-2xl font-bold text-white">
                        {stats?.totalPlaylists || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <List className="text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-secondary border-dark-tertiary">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Favorites</p>
                      <p className="text-2xl font-bold text-white">
                        {stats?.totalFavorites || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <Heart className="text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-secondary border-dark-tertiary">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">This Month</p>
                      <p className="text-2xl font-bold text-white">
                        {stats?.monthlyTabs || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Tabs */}
            <Card className="bg-dark-secondary border-dark-tertiary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Recent Tabs</h3>
                  <Link href="/tabs" className="text-tabster-orange hover:text-orange-400 transition-colors">
                    View All
                  </Link>
                </div>
                
                {tabsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center p-4 bg-dark-tertiary rounded-lg">
                        <div className="w-12 h-12 bg-dark-quaternary rounded-lg mr-4"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-dark-quaternary rounded w-1/3 mb-2"></div>
                          <div className="h-3 bg-dark-quaternary rounded w-1/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentTabs && recentTabs.length > 0 ? (
                  <div className="space-y-4">
                    {recentTabs.slice(0, 5).map((tab) => (
                      <Link key={tab.id} href={`/tab/${tab.id}`}>
                        <div className="flex items-center p-4 bg-dark-tertiary rounded-lg hover:bg-dark-quaternary transition-colors cursor-pointer">
                          <div className="w-12 h-12 bg-tabster-orange/20 rounded-lg flex items-center justify-center mr-4">
                            <Guitar className="text-tabster-orange" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{tab.title}</h4>
                            <p className="text-gray-400 text-sm">{tab.artist}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm ${getDifficultyColor(tab.difficulty)}`}>
                              {tab.difficulty}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {formatTimeAgo(tab.updatedAt)}
                            </p>
                          </div>
                          <div className="ml-4 flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="w-8 h-8 p-0 bg-dark-quaternary hover:bg-tabster-orange"
                            >
                              <Play className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="w-8 h-8 p-0 bg-dark-quaternary hover:bg-red-500"
                            >
                              <Heart className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Guitar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-white mb-2">No tabs yet</h4>
                    <p className="text-gray-400 mb-4">Create your first guitar tab to get started</p>
                    <Link href="/tab/new">
                      <Button className="bg-tabster-orange hover:bg-orange-600 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Tab
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Playlists Section */}
            <Card className="bg-dark-secondary border-dark-tertiary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">My Playlists</h3>
                  <Button className="bg-tabster-orange hover:bg-orange-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    New Playlist
                  </Button>
                </div>
                
                {playlistsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-dark-tertiary rounded-lg p-4 h-32"></div>
                    ))}
                  </div>
                ) : playlists && playlists.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {playlists.map((playlist) => (
                      <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
                        <div className="bg-dark-tertiary border border-dark-quaternary rounded-lg p-4 hover:border-tabster-orange transition-colors cursor-pointer">
                          <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-tabster-orange/20 rounded-lg flex items-center justify-center mr-3">
                              <List className="text-tabster-orange" />
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{playlist.title}</h4>
                              <p className="text-gray-400 text-sm">Playlist</p>
                            </div>
                          </div>
                          <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                            {playlist.description || "No description"}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-xs">
                              {formatTimeAgo(playlist.updatedAt)}
                            </span>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="text-tabster-orange hover:text-orange-400 p-0"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <List className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-white mb-2">No playlists yet</h4>
                    <p className="text-gray-400 mb-4">Create playlists to organize your tabs</p>
                    <Button className="bg-tabster-orange hover:bg-orange-600 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Playlist
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Popular Tabs Section */}
            <Card className="bg-dark-secondary border-dark-tertiary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Popular Tabs</h3>
                  <Button 
                    variant="outline" 
                    className="bg-dark-tertiary hover:bg-dark-quaternary text-white border-dark-quaternary"
                  >
                    View All
                  </Button>
                </div>
                
                {popularLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-dark-tertiary rounded-lg p-4 h-32"></div>
                    ))}
                  </div>
                ) : popularTabs && popularTabs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {popularTabs.slice(0, 6).map((tab) => (
                      <Link key={tab.id} href={`/tab/${tab.id}`}>
                        <div className="bg-dark-tertiary border border-dark-quaternary rounded-lg p-4 hover:border-tabster-orange transition-colors cursor-pointer">
                          <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-tabster-orange/20 rounded-lg flex items-center justify-center mr-3">
                              <Music className="text-tabster-orange" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-medium truncate">{tab.title}</h4>
                              <p className="text-gray-400 text-sm">by {tab.user.email?.split('@')[0] || 'Anonymous'}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              {tab.genre && (
                                <span className="px-2 py-1 bg-dark-quaternary text-gray-300 rounded text-xs">
                                  {tab.genre}
                                </span>
                              )}
                              {tab.difficulty && (
                                <span className={`text-xs ${getDifficultyColor(tab.difficulty)}`}>
                                  {tab.difficulty}
                                </span>
                              )}
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="w-8 h-8 p-0 bg-dark-quaternary hover:bg-tabster-orange"
                            >
                              <Play className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-white mb-2">No popular tabs yet</h4>
                    <p className="text-gray-400">Be the first to create a popular tab!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Community Tabs Section */}
            <Card className="bg-dark-secondary border-dark-tertiary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Recent Community Tabs</h3>
                  <Button 
                    variant="outline" 
                    className="bg-dark-tertiary hover:bg-dark-quaternary text-white border-dark-quaternary"
                  >
                    View All
                  </Button>
                </div>
                
                {recentPublicLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-dark-tertiary rounded-lg p-4 h-32"></div>
                    ))}
                  </div>
                ) : recentPublicTabs && recentPublicTabs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentPublicTabs.slice(0, 6).map((tab) => (
                      <Link key={tab.id} href={`/tab/${tab.id}`}>
                        <div className="bg-dark-tertiary border border-dark-quaternary rounded-lg p-4 hover:border-tabster-orange transition-colors cursor-pointer">
                          <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-tabster-orange/20 rounded-lg flex items-center justify-center mr-3">
                              <Clock className="text-tabster-orange" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-medium truncate">{tab.title}</h4>
                              <p className="text-gray-400 text-sm">by {tab.user.email?.split('@')[0] || 'Anonymous'}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              {tab.genre && (
                                <span className="px-2 py-1 bg-dark-quaternary text-gray-300 rounded text-xs">
                                  {tab.genre}
                                </span>
                              )}
                              <span className="text-gray-500 text-xs">
                                {formatTimeAgo(tab.createdAt)}
                              </span>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="w-8 h-8 p-0 bg-dark-quaternary hover:bg-tabster-orange"
                            >
                              <Play className="w-3 h-3" />
                            </Button>
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
    </div>
  );
}
