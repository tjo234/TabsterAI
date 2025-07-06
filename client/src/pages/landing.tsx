import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Music, Guitar, List, Download, Star, Users, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark-primary text-white">
      {/* Header */}
      <header className="bg-dark-secondary border-b border-dark-tertiary">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-10 bg-tabster-orange guitar-pick flex items-center justify-center">
                <Music className="text-white text-sm" />
              </div>
              <h1 className="text-2xl font-bold text-tabster-orange">Tabster</h1>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-tabster-orange hover:bg-orange-600 text-white px-6 py-2"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">
            Your Ultimate <span className="text-tabster-orange">Guitar Tab</span> Library
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Create, organize, and share guitar tablatures with ease. Build playlists, export to PDF, and discover an amazing community of guitarists.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg"
            className="bg-tabster-orange hover:bg-orange-600 text-white px-8 py-4 text-lg"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-dark-secondary">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Everything You Need for Guitar Tabs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-dark-tertiary border-dark-quaternary">
              <CardContent className="p-6">
                <Guitar className="w-12 h-12 text-tabster-orange mb-4" />
                <h4 className="text-xl font-semibold mb-3 text-white">Tab Editor</h4>
                <p className="text-gray-400">
                  Create and edit guitar tablatures with our intuitive editor. Support for all standard notation and custom tunings.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-dark-tertiary border-dark-quaternary">
              <CardContent className="p-6">
                <List className="w-12 h-12 text-tabster-orange mb-4" />
                <h4 className="text-xl font-semibold mb-3 text-white">Playlist Management</h4>
                <p className="text-gray-400">
                  Organize your tabs into custom playlists. Drag and drop to reorder and create the perfect practice sessions.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-dark-tertiary border-dark-quaternary">
              <CardContent className="p-6">
                <Download className="w-12 h-12 text-tabster-orange mb-4" />
                <h4 className="text-xl font-semibold mb-3 text-white">PDF Export</h4>
                <p className="text-gray-400">
                  Export individual tabs or entire playlists to beautifully formatted PDFs. Perfect for offline practice or sharing.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-dark-tertiary border-dark-quaternary">
              <CardContent className="p-6">
                <Star className="w-12 h-12 text-tabster-orange mb-4" />
                <h4 className="text-xl font-semibold mb-3 text-white">Favorites & Discovery</h4>
                <p className="text-gray-400">
                  Save your favorite tabs and discover new music from our community of guitarists worldwide.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-dark-tertiary border-dark-quaternary">
              <CardContent className="p-6">
                <Users className="w-12 h-12 text-tabster-orange mb-4" />
                <h4 className="text-xl font-semibold mb-3 text-white">Community Sharing</h4>
                <p className="text-gray-400">
                  Share your tabs with the community and explore thousands of user-contributed tablatures.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-dark-tertiary border-dark-quaternary">
              <CardContent className="p-6">
                <Zap className="w-12 h-12 text-tabster-orange mb-4" />
                <h4 className="text-xl font-semibold mb-3 text-white">Fast & Intuitive</h4>
                <p className="text-gray-400">
                  Lightning-fast interface designed by guitarists, for guitarists. Focus on your music, not the software.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6">Ready to Transform Your Practice?</h3>
          <p className="text-xl text-gray-400 mb-8 max-w-xl mx-auto">
            Join thousands of guitarists who are already using Tabster to improve their skills and organize their music.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg"
            className="bg-tabster-orange hover:bg-orange-600 text-white px-8 py-4 text-lg"
          >
            Start Creating Tabs Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-secondary border-t border-dark-tertiary py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-6 h-8 bg-tabster-orange guitar-pick flex items-center justify-center">
              <Music className="text-white text-xs" />
            </div>
            <span className="text-xl font-bold text-tabster-orange">Tabster</span>
          </div>
          <p className="text-gray-400">
            © 2025 Tabster. The ultimate guitar tablature library.
          </p>
        </div>
      </footer>
    </div>
  );
}
