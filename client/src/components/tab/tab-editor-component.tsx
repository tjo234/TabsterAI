import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Share2, Plus, Play, Loader2 } from "lucide-react";
import type { Tab, InsertTab } from "@shared/schema";

interface TabEditorComponentProps {
  initialTab?: Tab;
  onSave: (tabData: InsertTab) => void;
  onCancel: () => void;
  isLoading: boolean;
  isEditing: boolean;
}

export default function TabEditorComponent({
  initialTab,
  onSave,
  onCancel,
  isLoading,
  isEditing,
}: TabEditorComponentProps) {
  const [formData, setFormData] = useState<InsertTab>({
    userId: "", // Will be set by the server
    title: initialTab?.title || "",
    artist: initialTab?.artist || "",
    difficulty: initialTab?.difficulty || "Beginner",
    genre: initialTab?.genre || "Rock",
    tuning: initialTab?.tuning || "E A D G B E",
    capo: initialTab?.capo || "",
    content: initialTab?.content || "",
  });

  const [characterCount, setCharacterCount] = useState(0);
  const [lineCount, setLineCount] = useState(0);

  useEffect(() => {
    setCharacterCount(formData.content.length);
    setLineCount(formData.content.split('\n').length);
  }, [formData.content]);

  const handleInputChange = (field: keyof InsertTab, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleAutoFormat = () => {
    // Basic auto-formatting for tablature
    const lines = formData.content.split('\n');
    const formatted = lines.map(line => {
      // Remove extra spaces and normalize formatting
      return line.trim().replace(/\s+/g, ' ');
    }).join('\n');
    
    handleInputChange('content', formatted);
  };

  const validateTab = () => {
    // Basic validation for guitar tablature format
    const lines = formData.content.split('\n');
    const errors: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes('|') && !line.match(/^[EADGBEeadgbe]\|/)) {
        errors.push(`Line ${i + 1}: Tab line should start with string notation (E, A, D, G, B, E)`);
      }
    }
    
    if (errors.length > 0) {
      alert('Validation errors:\n' + errors.join('\n'));
    } else {
      alert('Tab format looks good!');
    }
  };

  const exampleTab = `E|--3--2--0--2--3--3--3--2--2--2--0--0--0--
B|--1--1--1--1--1--1--1--1--1--1--1--1--1--
G|--0--0--0--0--0--0--0--0--0--0--0--0--0--
D|--2--2--2--2--2--2--2--2--2--2--2--2--2--
A|--3--3--3--3--3--3--3--3--3--3--3--3--3--
E|--x--x--x--x--x--x--x--x--x--x--x--x--x--

Example: Wonderwall - Oasis (Intro)
Use standard guitar tablature notation:
- Numbers represent fret positions
- x means don't play that string
- 0 means open string`;

  return (
    <main className="flex-1 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">
              {isEditing ? 'Edit Tab' : 'Tab Editor'}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline"
              className="bg-dark-tertiary hover:bg-dark-quaternary text-white border-dark-quaternary"
              disabled={isLoading}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button 
              onClick={handleSubmit}
              className="bg-tabster-orange hover:bg-orange-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Share2 className="w-4 h-4 mr-2" />
              )}
              {isEditing ? 'Update' : 'Publish'}
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tab Metadata */}
          <Card className="bg-dark-secondary border-dark-tertiary">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Tab Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="title" className="text-gray-400 text-sm">Song Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Enter song title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="bg-dark-tertiary border-dark-quaternary text-white placeholder-gray-500 focus:border-tabster-orange"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="artist" className="text-gray-400 text-sm">Artist *</Label>
                  <Input
                    id="artist"
                    type="text"
                    placeholder="Enter artist name"
                    value={formData.artist}
                    onChange={(e) => handleInputChange('artist', e.target.value)}
                    className="bg-dark-tertiary border-dark-quaternary text-white placeholder-gray-500 focus:border-tabster-orange"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="difficulty" className="text-gray-400 text-sm">Difficulty</Label>
                  <Select 
                    value={formData.difficulty} 
                    onValueChange={(value) => handleInputChange('difficulty', value)}
                  >
                    <SelectTrigger className="bg-dark-tertiary border-dark-quaternary text-white focus:border-tabster-orange">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-tertiary border-dark-quaternary">
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="genre" className="text-gray-400 text-sm">Genre</Label>
                  <Select 
                    value={formData.genre} 
                    onValueChange={(value) => handleInputChange('genre', value)}
                  >
                    <SelectTrigger className="bg-dark-tertiary border-dark-quaternary text-white focus:border-tabster-orange">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-tertiary border-dark-quaternary">
                      <SelectItem value="Rock">Rock</SelectItem>
                      <SelectItem value="Pop">Pop</SelectItem>
                      <SelectItem value="Metal">Metal</SelectItem>
                      <SelectItem value="Blues">Blues</SelectItem>
                      <SelectItem value="Classical">Classical</SelectItem>
                      <SelectItem value="Country">Country</SelectItem>
                      <SelectItem value="Jazz">Jazz</SelectItem>
                      <SelectItem value="Folk">Folk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <Label htmlFor="tuning" className="text-gray-400 text-sm">Tuning</Label>
                  <Input
                    id="tuning"
                    type="text"
                    placeholder="E A D G B E"
                    value={formData.tuning || ""}
                    onChange={(e) => handleInputChange('tuning', e.target.value)}
                    className="bg-dark-tertiary border-dark-quaternary text-white placeholder-gray-500 focus:border-tabster-orange"
                  />
                </div>
                <div>
                  <Label htmlFor="capo" className="text-gray-400 text-sm">Capo</Label>
                  <Input
                    id="capo"
                    type="text"
                    placeholder="e.g., 2nd fret"
                    value={formData.capo || ""}
                    onChange={(e) => handleInputChange('capo', e.target.value)}
                    className="bg-dark-tertiary border-dark-quaternary text-white placeholder-gray-500 focus:border-tabster-orange"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label className="text-gray-400 text-sm">
                    All tabs are public
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tab Editor */}
          <Card className="bg-dark-secondary border-dark-tertiary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-white">Tablature Editor</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAutoFormat}
                    className="bg-dark-tertiary hover:bg-dark-quaternary text-white border-dark-quaternary"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Section
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-dark-tertiary hover:bg-dark-quaternary text-white border-dark-quaternary"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-dark-primary border border-dark-quaternary rounded-lg p-4">
                <div className="mb-4">
                  <div className="flex items-center space-x-4 mb-2">
                    <span className="text-gray-400 text-sm w-16">Tuning:</span>
                    <span className="tab-text text-gray-300">{formData.tuning}</span>
                  </div>
                  <div className="h-px bg-dark-quaternary fretboard-line"></div>
                </div>
                
                <Textarea
                  placeholder={`Enter your guitar tablature here...\n\n${exampleTab}`}
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  className="w-full h-64 bg-transparent text-green-400 tab-text text-sm resize-none focus:outline-none border-none p-0"
                  required
                />
              </div>
              
              {/* Tab Tools */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-quaternary">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-400 text-sm">Tools:</span>
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAutoFormat}
                    className="bg-dark-tertiary hover:bg-dark-quaternary text-white border-dark-quaternary"
                  >
                    Auto-format
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={validateTab}
                    className="bg-dark-tertiary hover:bg-dark-quaternary text-white border-dark-quaternary"
                  >
                    Validate Tab
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-dark-tertiary hover:bg-dark-quaternary text-white border-dark-quaternary"
                  >
                    Import from File
                  </Button>
                </div>
                <div className="text-gray-500 text-sm">
                  Characters: <span className="text-white">{characterCount}</span> | 
                  Lines: <span className="text-white">{lineCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </main>
  );
}
