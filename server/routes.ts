import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTabSchema, insertPlaylistSchema, insertPlaylistItemSchema, insertFavoriteSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Tab routes
  app.post('/api/tabs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tabData = insertTabSchema.parse({ ...req.body, userId });
      const tab = await storage.createTab(tabData);
      res.json(tab);
    } catch (error) {
      console.error("Error creating tab:", error);
      res.status(400).json({ message: "Failed to create tab" });
    }
  });

  app.get('/api/tabs/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tab = await storage.getTabWithUser(id);
      if (!tab) {
        return res.status(404).json({ message: "Tab not found" });
      }
      res.json(tab);
    } catch (error) {
      console.error("Error fetching tab:", error);
      res.status(500).json({ message: "Failed to fetch tab" });
    }
  });

  app.get('/api/tabs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tabs = await storage.getUserTabs(userId);
      res.json(tabs);
    } catch (error) {
      console.error("Error fetching tabs:", error);
      res.status(500).json({ message: "Failed to fetch tabs" });
    }
  });

  app.get('/api/tabs/public/browse', async (req, res) => {
    try {
      const tabs = await storage.getPublicTabs();
      res.json(tabs);
    } catch (error) {
      console.error("Error fetching public tabs:", error);
      res.status(500).json({ message: "Failed to fetch public tabs" });
    }
  });

  app.put('/api/tabs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if tab belongs to user
      const tab = await storage.getTab(id);
      if (!tab || tab.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const tabData = insertTabSchema.partial().parse(req.body);
      const updatedTab = await storage.updateTab(id, tabData);
      res.json(updatedTab);
    } catch (error) {
      console.error("Error updating tab:", error);
      res.status(400).json({ message: "Failed to update tab" });
    }
  });

  app.delete('/api/tabs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if tab belongs to user
      const tab = await storage.getTab(id);
      if (!tab || tab.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteTab(id);
      res.json({ message: "Tab deleted successfully" });
    } catch (error) {
      console.error("Error deleting tab:", error);
      res.status(500).json({ message: "Failed to delete tab" });
    }
  });

  app.get('/api/search/tabs', async (req, res) => {
    try {
      const query = req.query.q as string;
      const userId = req.query.userId as string;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const tabs = await storage.searchTabs(query, userId);
      res.json(tabs);
    } catch (error) {
      console.error("Error searching tabs:", error);
      res.status(500).json({ message: "Failed to search tabs" });
    }
  });

  // Playlist routes
  app.post('/api/playlists', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const playlistData = insertPlaylistSchema.parse({ ...req.body, userId });
      const playlist = await storage.createPlaylist(playlistData);
      res.json(playlist);
    } catch (error) {
      console.error("Error creating playlist:", error);
      res.status(400).json({ message: "Failed to create playlist" });
    }
  });

  app.get('/api/playlists/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const playlist = await storage.getPlaylistWithItems(id);
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      
      // Check if user owns playlist
      if (playlist.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(playlist);
    } catch (error) {
      console.error("Error fetching playlist:", error);
      res.status(500).json({ message: "Failed to fetch playlist" });
    }
  });

  app.get('/api/playlists', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const playlists = await storage.getUserPlaylists(userId);
      res.json(playlists);
    } catch (error) {
      console.error("Error fetching playlists:", error);
      res.status(500).json({ message: "Failed to fetch playlists" });
    }
  });

  app.put('/api/playlists/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if playlist belongs to user
      const playlist = await storage.getPlaylist(id);
      if (!playlist || playlist.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const playlistData = insertPlaylistSchema.partial().parse(req.body);
      const updatedPlaylist = await storage.updatePlaylist(id, playlistData);
      res.json(updatedPlaylist);
    } catch (error) {
      console.error("Error updating playlist:", error);
      res.status(400).json({ message: "Failed to update playlist" });
    }
  });

  app.delete('/api/playlists/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if playlist belongs to user
      const playlist = await storage.getPlaylist(id);
      if (!playlist || playlist.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deletePlaylist(id);
      res.json({ message: "Playlist deleted successfully" });
    } catch (error) {
      console.error("Error deleting playlist:", error);
      res.status(500).json({ message: "Failed to delete playlist" });
    }
  });

  // Playlist item routes
  app.post('/api/playlists/:id/items', isAuthenticated, async (req: any, res) => {
    try {
      const playlistId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if playlist belongs to user
      const playlist = await storage.getPlaylist(playlistId);
      if (!playlist || playlist.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get current playlist items to calculate order
      const existingItems = await storage.getPlaylistItems(playlistId);
      const order = existingItems.length;
      
      const itemData = insertPlaylistItemSchema.parse({ ...req.body, playlistId, order });
      const item = await storage.addTabToPlaylist(itemData);
      res.json(item);
    } catch (error) {
      console.error("Error adding tab to playlist:", error);
      res.status(400).json({ message: "Failed to add tab to playlist" });
    }
  });

  app.delete('/api/playlists/:playlistId/items/:tabId', isAuthenticated, async (req: any, res) => {
    try {
      const playlistId = parseInt(req.params.playlistId);
      const tabId = parseInt(req.params.tabId);
      const userId = req.user.claims.sub;
      
      // Check if playlist belongs to user
      const playlist = await storage.getPlaylist(playlistId);
      if (!playlist || playlist.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.removeTabFromPlaylist(playlistId, tabId);
      res.json({ message: "Tab removed from playlist successfully" });
    } catch (error) {
      console.error("Error removing tab from playlist:", error);
      res.status(500).json({ message: "Failed to remove tab from playlist" });
    }
  });

  app.put('/api/playlists/:id/reorder', isAuthenticated, async (req: any, res) => {
    try {
      const playlistId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { itemOrders } = req.body;
      
      // Check if playlist belongs to user
      const playlist = await storage.getPlaylist(playlistId);
      if (!playlist || playlist.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.reorderPlaylistItems(playlistId, itemOrders);
      res.json({ message: "Playlist reordered successfully" });
    } catch (error) {
      console.error("Error reordering playlist:", error);
      res.status(500).json({ message: "Failed to reorder playlist" });
    }
  });

  // Favorite routes
  app.post('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favoriteData = insertFavoriteSchema.parse({ ...req.body, userId });
      const favorite = await storage.addFavorite(favoriteData);
      res.json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(400).json({ message: "Failed to add favorite" });
    }
  });

  app.delete('/api/favorites/:tabId', isAuthenticated, async (req: any, res) => {
    try {
      const tabId = parseInt(req.params.tabId);
      const userId = req.user.claims.sub;
      
      await storage.removeFavorite(userId, tabId);
      res.json({ message: "Favorite removed successfully" });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  app.get('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.get('/api/favorites/:tabId/check', isAuthenticated, async (req: any, res) => {
    try {
      const tabId = parseInt(req.params.tabId);
      const userId = req.user.claims.sub;
      
      const isFavorited = await storage.isFavorited(userId, tabId);
      res.json({ isFavorited });
    } catch (error) {
      console.error("Error checking favorite status:", error);
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });

  // Stats route
  app.get('/api/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
