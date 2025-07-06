import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  Heart, 
  Plus, 
  Download, 
  Edit,
  Play,
  Loader2,
  ChevronUp,
  ChevronDown,
  RotateCcw
} from "lucide-react";
import type { TabWithUser, Playlist } from "@shared/schema";
import { transposeText, detectChords, getChordDiagram } from "@/lib/chord-utils";
import { ChordDiagram } from "@/components/ui/chord-diagram";

interface TabViewerComponentProps {
  tab: TabWithUser;
  isAuthenticated: boolean;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  onExportPDF: () => void;
  onEdit: () => void;
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
  favoriteMutationLoading,
  playlists,
  onAddToPlaylist,
  addToPlaylistLoading,
}: TabViewerComponentProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transposeSteps, setTransposeSteps] = useState(0);

  // Compute transposed content
  const transposedContent = useMemo(() => {
    const transposed = transposeText(tab.content, transposeSteps);
    if (transposeSteps !== 0) {
      console.log('Transposed content sample:', transposed.substring(0, 200));
    }
    return transposed;
  }, [tab.content, transposeSteps]);

  // Detect chords in the content for hover functionality
  const detectedChords = useMemo(() => {
    const chords = detectChords(transposedContent);
    // Log detected chords to help debug highlighting issues
    console.log('All detected chords:', chords.map(c => c.chord));
    return chords;
  }, [transposedContent]);
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

  // Function to render content with interactive chords
  const renderContentWithChords = (content: string) => {
    if (detectedChords.length === 0) {
      return <pre className="tab-text text-white text-base leading-relaxed whitespace-pre-wrap overflow-x-auto">{content}</pre>;
    }

    const parts = [];
    let lastIndex = 0;

    detectedChords.forEach((chordMatch, index) => {
      // Add text before chord
      if (chordMatch.position > lastIndex) {
        parts.push(
          <span key={`text-${index}`}>
            {content.slice(lastIndex, chordMatch.position)}
          </span>
        );
      }

      // Add interactive chord
      const chordDiagram = getChordDiagram(chordMatch.chord);
      // Debug major sharp chords specifically
      if (chordMatch.chord.match(/^[A-G]#$/)) {
        console.log(`Major sharp chord "${chordMatch.chord}" -> diagram found:`, !!chordDiagram);
      }
      if (chordDiagram) {
        parts.push(
          <Popover key={`chord-${index}`}>
            <PopoverTrigger asChild>
              <span className="text-blue-400 hover:text-blue-300 cursor-pointer underline decoration-dotted">
                {chordMatch.chord}
              </span>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" side="top">
              <ChordDiagram chord={chordDiagram} />
            </PopoverContent>
          </Popover>
        );
      } else {
        parts.push(
          <span key={`chord-${index}`} className="text-blue-400">
            {chordMatch.chord}
          </span>
        );
      }

      lastIndex = chordMatch.position + chordMatch.chord.length;
    });

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(
        <span key="text-final">
          {content.slice(lastIndex)}
        </span>
      );
    }

    return (
      <pre className="tab-text text-white text-base leading-relaxed whitespace-pre-wrap overflow-x-auto">
        {parts}
      </pre>
    );
  };

  return (
    <main className="flex-1 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">{tab.title}</h2>
            <p className="text-gray-400">by {tab.artist}</p>
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

        {/* Transpose Controls */}
        <Card className="bg-dark-secondary border-dark-tertiary">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">Transpose:</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTransposeSteps(prev => prev - 1)}
                  className="bg-dark-tertiary hover:bg-dark-quaternary text-white border-dark-quaternary h-8 w-8 p-0"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <div className="bg-dark-primary border border-dark-quaternary rounded px-3 py-1 min-w-[60px] text-center">
                  <span className="text-white text-sm">
                    {transposeSteps === 0 ? 'Original' : `${transposeSteps > 0 ? '+' : ''}${transposeSteps}`}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTransposeSteps(prev => prev + 1)}
                  className="bg-dark-tertiary hover:bg-dark-quaternary text-white border-dark-quaternary h-8 w-8 p-0"
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTransposeSteps(0)}
                  className="bg-dark-tertiary hover:bg-dark-quaternary text-white border-dark-quaternary ml-2"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              </div>
              {transposeSteps !== 0 && (
                <div className="text-gray-400 text-sm">
                  {transposeSteps > 0 ? `+${transposeSteps}` : transposeSteps} semitones
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
          <CardContent className="p-6">
            {renderContentWithChords(transposedContent)}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
