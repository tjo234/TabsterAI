import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  List, 
  Flame, 
  Clock, 
  Star, 
  Shuffle, 
  Heart, 
  Folder, 
  ListMusic 
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <aside className="w-64 bg-dark-secondary border-r border-dark-tertiary p-6 hidden lg:block">
      <div className="space-y-6">
        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <Link href="/tab/new">
              <Button className="w-full bg-tabster-orange hover:bg-orange-600 text-white justify-start">
                <Plus className="mr-3 h-4 w-4" />
                Create New Tab
              </Button>
            </Link>
            <Button 
              variant="outline"
              className="w-full bg-dark-tertiary hover:bg-dark-quaternary text-white border-dark-quaternary justify-start"
            >
              <List className="mr-3 h-4 w-4" />
              New Playlist
            </Button>
          </div>
        </div>

        {/* Browse */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Browse
          </h3>
          <div className="space-y-1">
            <Link 
              href="/browse/popular"
              className={`block px-3 py-2 text-gray-300 hover:text-tabster-orange hover:bg-dark-tertiary rounded transition-colors ${
                isActive('/browse/popular') ? 'text-tabster-orange bg-dark-tertiary' : ''
              }`}
            >
              <Flame className="inline mr-3 h-4 w-4" />
              Popular
            </Link>
            <Link 
              href="/browse/recent"
              className={`block px-3 py-2 text-gray-300 hover:text-tabster-orange hover:bg-dark-tertiary rounded transition-colors ${
                isActive('/browse/recent') ? 'text-tabster-orange bg-dark-tertiary' : ''
              }`}
            >
              <Clock className="inline mr-3 h-4 w-4" />
              Recent
            </Link>
            <Link 
              href="/browse/top-rated"
              className={`block px-3 py-2 text-gray-300 hover:text-tabster-orange hover:bg-dark-tertiary rounded transition-colors ${
                isActive('/browse/top-rated') ? 'text-tabster-orange bg-dark-tertiary' : ''
              }`}
            >
              <Star className="inline mr-3 h-4 w-4" />
              Top Rated
            </Link>
            <Link 
              href="/browse/discover"
              className={`block px-3 py-2 text-gray-300 hover:text-tabster-orange hover:bg-dark-tertiary rounded transition-colors ${
                isActive('/browse/discover') ? 'text-tabster-orange bg-dark-tertiary' : ''
              }`}
            >
              <Shuffle className="inline mr-3 h-4 w-4" />
              Discover
            </Link>
          </div>
        </div>

        {/* My Library */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            My Library
          </h3>
          <div className="space-y-1">
            <Link 
              href="/favorites"
              className={`block px-3 py-2 text-gray-300 hover:text-tabster-orange hover:bg-dark-tertiary rounded transition-colors ${
                isActive('/favorites') ? 'text-tabster-orange bg-dark-tertiary' : ''
              }`}
            >
              <Heart className="inline mr-3 h-4 w-4" />
              Favorites
            </Link>
            <Link 
              href="/tabs"
              className={`block px-3 py-2 text-gray-300 hover:text-tabster-orange hover:bg-dark-tertiary rounded transition-colors ${
                isActive('/tabs') ? 'text-tabster-orange bg-dark-tertiary' : ''
              }`}
            >
              <Folder className="inline mr-3 h-4 w-4" />
              My Tabs
            </Link>
            <Link 
              href="/playlists"
              className={`block px-3 py-2 text-gray-300 hover:text-tabster-orange hover:bg-dark-tertiary rounded transition-colors ${
                isActive('/playlists') ? 'text-tabster-orange bg-dark-tertiary' : ''
              }`}
            >
              <ListMusic className="inline mr-3 h-4 w-4" />
              Playlists
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
