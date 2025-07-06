import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Heart, 
  Plus, 
  Download, 
  Edit,
  Play,
  Loader2
} from "lucide-react";
import type { TabWithUser, Playlist } from "@shared/schema";

interface TabViewerComponentProps {
  tab: TabWithUser;
  isAuthenticated: boolean;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  onExportPDF: () => void;
  onEdit: () => void;
  onBack: () => void;
  favoriteMutationLoading: boolean;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: number) => void;
  addToPlaylistLoading: boolean;
}

export default function TabViewerComponent({
  tab,
  isAuthenticated,
  isFavorited,
  onToggleFavorite,
  onExportPDF,
  onEdit,
  onBack,
  favoriteMutationLoading,
  playlists,
  onAddToPlaylist,
  addToPlaylistLoading,
}: TabViewerComponentProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'expert': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const canEdit = isAuthenticated && tab.user.id; // User can edit their own tabs

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
            <div>
              <h2 className="text-3xl font-bold text-white">{tab.title}</h2>
              <p className="text-gray-400">by {tab.artist}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <Button 
                variant="outline"
                onClick={onToggleFavorite}
                disabled={favoriteMutationLoading}
                className={`border-dark-quaternary ${
                  isFavorited 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-dark-tertiary hover:bg-dark-quaternary text-white'
                }`}
              >
                {favoriteMutationLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Heart className={`w-4 h-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
                )}
                {isFavorited ? 'Favorited' : 'Favorite'}
              </Button>
            )}
            {isAuthenticated && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    className="bg-dark-tertiary hover:bg-dark-quaternary text-white border-dark-quaternary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Playlist
                  </Button>
                </DialogTrigger>
                <DialogContent 
                  className="bg-dark-secondary border-dark-tertiary" 
                  style={{ backgroundColor: 'hsl(0, 0%, 16.5%)', backdropFilter: 'blur(8px)' }}
                >
                  <DialogHeader>
                    <DialogTitle className="text-white">Add to Playlist</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Choose a playlist to add "{tab.title}" to.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {playlists.length === 0 ? (
                      <p className="text-gray-400 text-center py-4">
                        No playlists found. Create a playlist first to add tabs.
                      </p>
                    ) : (
                      playlists.map((playlist) => (
                        <Button
                          key={playlist.id}
                          variant="outline"
                          className="w-full justify-start bg-dark-tertiary hover:bg-dark-quaternary text-white border-dark-quaternary"
                          onClick={() => {
                            onAddToPlaylist(playlist.id);
                            setDialogOpen(false);
                          }}
                          disabled={addToPlaylistLoading}
                        >
                          {addToPlaylistLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4 mr-2" />
                          )}
                          {playlist.title}
                          {playlist.description && (
                            <span className="text-gray-400 ml-2">- {playlist.description}</span>
                          )}
                        </Button>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
            {canEdit && (
              <Button 
                variant="outline"
                onClick={onEdit}
                className="bg-dark-tertiary hover:bg-dark-quaternary text-white border-dark-quaternary"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            <Button 
              onClick={onExportPDF}
              className="bg-tabster-orange hover:bg-orange-600 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Tab Info */}
        <Card className="bg-dark-secondary border-dark-tertiary">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              <div>
                <span className="text-gray-400 text-sm">Difficulty</span>
                <div className="mt-1">
                  <Badge 
                    variant="outline" 
                    className={getDifficultyColor(tab.difficulty)}
                  >
                    {tab.difficulty}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Genre</span>
                <p className="text-white font-medium mt-1">{tab.genre}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Tuning</span>
                <p className="text-white font-medium mt-1 tab-text">{tab.tuning}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Capo</span>
                <p className="text-white font-medium mt-1">{tab.capo || "None"}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Created by</span>
                <p className="text-white font-medium mt-1">
                  {tab.user.firstName && tab.user.lastName 
                    ? `${tab.user.firstName} ${tab.user.lastName}`
                    : tab.user.email || "Anonymous"
                  }
                </p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Created</span>
                <p className="text-white font-medium mt-1">{formatDate(tab.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab Content */}
        <Card className="bg-dark-secondary border-dark-tertiary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-white">Tablature</CardTitle>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline"
                  size="sm"
                  className="bg-dark-tertiary hover:bg-dark-quaternary text-white border-dark-quaternary"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Play
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  className="bg-dark-tertiary hover:bg-dark-quaternary text-white border-dark-quaternary"
                >
                  Font Size
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-dark-primary border border-dark-quaternary rounded-lg p-6">
              <div className="mb-4">
                <div className="flex items-center space-x-4 mb-2">
                  <span className="text-gray-400 text-sm w-16">Tuning:</span>
                  <span className="tab-text text-gray-300">{tab.tuning}</span>
                  {tab.capo && (
                    <>
                      <span className="text-gray-400 text-sm">|</span>
                      <span className="text-gray-400 text-sm">Capo:</span>
                      <span className="tab-text text-gray-300">{tab.capo}</span>
                    </>
                  )}
                </div>
                <div className="h-px bg-dark-quaternary fretboard-line"></div>
              </div>
              
              <pre className="tab-text text-green-400 text-sm leading-relaxed whitespace-pre-wrap overflow-x-auto">
                {tab.content}
              </pre>
            </div>

            {/* Tab Stats */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-quaternary">
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span>
                  Characters: <span className="text-white">{tab.content.length}</span>
                </span>
                <span>
                  Lines: <span className="text-white">{tab.content.split('\n').length}</span>
                </span>
                <span>
                  {tab.isPublic ? (
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                      Public
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                      Private
                    </Badge>
                  )}
                </span>
              </div>
              {tab.updatedAt && tab.updatedAt !== tab.createdAt && (
                <div className="text-gray-500 text-sm">
                  Last updated: {formatDate(tab.updatedAt)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
