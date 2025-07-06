import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DragDropList from "@/components/ui/drag-drop-list";
import { 
  ArrowLeft, 
  Edit, 
  Download, 
  Search,
  List,
  Play,
  Trash2,
  Loader2,
  Plus,
  Music
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { PlaylistWithItems, TabWithUser } from "@shared/schema";

interface PlaylistManagerComponentProps {
  playlist: PlaylistWithItems;
  onRemoveTab: (tabId: number) => void;
  onReorder: (itemOrders: { id: number; order: number }[]) => void;
  onExportPDF: () => void;
  onPlayTab: (tabId: number) => void;
  onBack: () => void;
  isLoading: boolean;
}

export default function PlaylistManagerComponent({
  playlist,
  onRemoveTab,
  onReorder,
  onExportPDF,
  onPlayTab,
  onBack,
  isLoading,
}: PlaylistManagerComponentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { toast } = useToast();
  
  // Search tabs query
  const { data: searchResults, isLoading: searchLoading } = useQuery<TabWithUser[]>({
    queryKey: ["/api/search/tabs", searchQuery],
    enabled: searchQuery.length > 0,
    queryFn: async () => {
      const response = await fetch(`/api/search/tabs?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
  });

  // Add tab to playlist mutation
  const addTabMutation = useMutation({
    mutationFn: async (tabId: number) => {
      const response = await apiRequest("POST", `/api/playlists/${playlist.id}/items`, { 
        tabId
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tab added to playlist!",
        className: "bg-green-600 border-green-500"
      });
      queryClient.invalidateQueries({ queryKey: [`/api/playlists/${playlist.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      setSearchQuery("");
      setShowSearchResults(false);
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
        description: "Failed to add tab to playlist. Tab may already be in the playlist.",
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: Date | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  const getIconColor = (index: number) => {
    const colors = [
      'text-blue-400 bg-blue-500/20',
      'text-green-400 bg-green-500/20',
      'text-purple-400 bg-purple-500/20',
      'text-red-400 bg-red-500/20',
      'text-yellow-400 bg-yellow-500/20',
      'text-pink-400 bg-pink-500/20',
    ];
    return colors[index % colors.length];
  };

  const sortedItems = playlist.items.sort((a, b) => a.order - b.order);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShowSearchResults(true);
    }
  };

  const handleAddTab = (tabId: number) => {
    // Check if tab is already in playlist
    const isAlreadyInPlaylist = playlist.items.some(item => item.tab.id === tabId);
    if (isAlreadyInPlaylist) {
      toast({
        title: "Already Added",
        description: "This tab is already in the playlist.",
        variant: "destructive",
      });
      return;
    }
    addTabMutation.mutate(tabId);
  };

  const handleReorder = (startIndex: number, endIndex: number) => {
    const items = [...sortedItems];
    const [reorderedItem] = items.splice(startIndex, 1);
    items.splice(endIndex, 0, reorderedItem);

    // Update order values
    const itemOrders = items.map((item, index) => ({
      id: item.id,
      order: index + 1,
    }));

    onReorder(itemOrders);
  };

  const renderPlaylistItem = (item: typeof sortedItems[0], index: number) => (
    <div className="draggable-item flex items-center p-4 bg-dark-tertiary border border-dark-quaternary rounded-lg cursor-move hover:border-tabster-orange transition-colors">
      <div className="flex items-center space-x-4 flex-1">
        <div className="text-gray-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 7h2v2H3V7zm0 4h2v2H3v-2zm4-4h2v2H7V7zm0 4h2v2H7v-2zm4-4h2v2h-2V7zm0 4h2v2h-2v-2z"/>
          </svg>
        </div>
        <div className="w-8 h-8 bg-tabster-orange/20 rounded flex items-center justify-center">
          <span className="text-tabster-orange text-sm font-bold">{index + 1}</span>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconColor(index)}`}>
          <Play className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h4 className="text-white font-medium">{item.tab.title}</h4>
          <p className="text-gray-400 text-sm">
            {item.tab.artist} • 
            <span className={`ml-1 ${getDifficultyColor(item.tab.difficulty)}`}>
              {item.tab.difficulty}
            </span>
          </p>
        </div>
        <div className="text-gray-500 text-sm">
          {item.tab.genre}
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => onPlayTab(item.tab.id)}
            className="w-8 h-8 p-0 bg-dark-quaternary hover:bg-tabster-orange"
          >
            <Play className="w-3 h-3" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => onRemoveTab(item.tab.id)}
            disabled={isLoading}
            className="w-8 h-8 p-0 bg-dark-quaternary hover:bg-red-500"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Trash2 className="w-3 h-3" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <main className="flex-1 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h2 className="text-3xl font-bold text-white">{playlist.title}</h2>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline"
              className="bg-dark-tertiary hover:bg-dark-quaternary text-white border-dark-quaternary"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Info
            </Button>
            <Button 
              onClick={onExportPDF}
              className="bg-tabster-orange hover:bg-orange-600 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Playlist Info */}
        <Card className="bg-dark-secondary border-dark-tertiary">
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              <div className="w-24 h-24 bg-tabster-orange/20 rounded-xl flex items-center justify-center">
                <List className="text-3xl text-tabster-orange" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">{playlist.title}</h3>
                <p className="text-gray-400 mb-4">
                  {playlist.description || "No description provided"}
                </p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span>
                    <List className="inline w-4 h-4 mr-2" />
                    {playlist.items.length} tabs
                  </span>
                  <span>
                    <svg className="inline w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                    </svg>
                    Updated {formatDate(playlist.updatedAt)}
                  </span>
                  <span>
                    <svg className="inline w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                    </svg>
                    Created by {
                      playlist.user.firstName && playlist.user.lastName 
                        ? `${playlist.user.firstName} ${playlist.user.lastName}`
                        : "you"
                    }
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Tabs Section */}
        <Card className="bg-dark-secondary border-dark-tertiary">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Add Tabs to Playlist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search your tabs or browse library..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value.trim()) {
                        setShowSearchResults(true);
                      } else {
                        setShowSearchResults(false);
                      }
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="bg-dark-tertiary border-dark-quaternary text-white placeholder-gray-500 focus:border-tabster-orange"
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || searchLoading}
                  className="bg-tabster-orange hover:bg-orange-600 text-white px-6"
                >
                  {searchLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Search
                </Button>
              </div>

              {/* Search Results */}
              {showSearchResults && searchQuery.trim() && (
                <div className="space-y-2">
                  {searchLoading ? (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                      <p className="text-gray-400 mt-2">Searching tabs...</p>
                    </div>
                  ) : searchResults && searchResults.length > 0 ? (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      <h4 className="text-sm font-medium text-gray-300">Search Results ({searchResults.length})</h4>
                      {searchResults.map((tab) => {
                        const isAlreadyInPlaylist = playlist.items.some(item => item.tab.id === tab.id);
                        return (
                          <div key={tab.id} className="flex items-center justify-between p-3 bg-dark-tertiary rounded-lg border border-dark-quaternary">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center">
                                <Music className="w-4 h-4 text-blue-400" />
                              </div>
                              <div>
                                <h5 className="text-white font-medium">{tab.title}</h5>
                                <p className="text-gray-400 text-sm">
                                  {tab.artist} • 
                                  <span className={`ml-1 ${getDifficultyColor(tab.difficulty)}`}>
                                    {tab.difficulty}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleAddTab(tab.id)}
                              disabled={isAlreadyInPlaylist || addTabMutation.isPending}
                              size="sm"
                              className={
                                isAlreadyInPlaylist 
                                  ? "bg-gray-600 text-gray-400 cursor-not-allowed" 
                                  : "bg-tabster-orange hover:bg-orange-600 text-white"
                              }
                            >
                              {addTabMutation.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : isAlreadyInPlaylist ? (
                                "Already Added"
                              ) : (
                                <>
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add
                                </>
                              )}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Music className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400">No tabs found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Playlist Items */}
        <Card className="bg-dark-secondary border-dark-tertiary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-white">Playlist Contents</CardTitle>
              <div className="text-gray-400 text-sm">
                Drag and drop to reorder • Total: {playlist.items.length} tabs
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {playlist.items.length === 0 ? (
              <div className="text-center py-12">
                <List className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-white mb-2">No tabs in playlist</h4>
                <p className="text-gray-400 mb-4">Add tabs to this playlist to get started</p>
                <Button className="bg-tabster-orange hover:bg-orange-600 text-white">
                  <Search className="w-4 h-4 mr-2" />
                  Browse Tabs
                </Button>
              </div>
            ) : (
              <DragDropList
                items={sortedItems}
                onReorder={handleReorder}
                renderItem={renderPlaylistItem}
                keyExtractor={(item) => item.id.toString()}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
