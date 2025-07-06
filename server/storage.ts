import {
  users,
  tabs,
  playlists,
  playlistItems,
  favorites,
  type User,
  type UpsertUser,
  type Tab,
  type InsertTab,
  type Playlist,
  type InsertPlaylist,
  type PlaylistItem,
  type InsertPlaylistItem,
  type Favorite,
  type InsertFavorite,
  type TabWithUser,
  type PlaylistWithItems,
  type PlaylistItemWithTab,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, like, or, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Tab operations
  createTab(tab: InsertTab): Promise<Tab>;
  getTab(id: number): Promise<Tab | undefined>;
  getTabWithUser(id: number): Promise<TabWithUser | undefined>;
  getUserTabs(userId: string): Promise<Tab[]>;
  getPublicTabs(): Promise<TabWithUser[]>;
  updateTab(id: number, tab: Partial<InsertTab>): Promise<Tab>;
  deleteTab(id: number): Promise<void>;
  searchTabs(query: string, userId?: string): Promise<TabWithUser[]>;

  // Playlist operations
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  getPlaylist(id: number): Promise<Playlist | undefined>;
  getPlaylistWithItems(id: number): Promise<PlaylistWithItems | undefined>;
  getUserPlaylists(userId: string): Promise<Playlist[]>;
  updatePlaylist(id: number, playlist: Partial<InsertPlaylist>): Promise<Playlist>;
  deletePlaylist(id: number): Promise<void>;

  // Playlist item operations
  addTabToPlaylist(playlistItem: InsertPlaylistItem): Promise<PlaylistItem>;
  removeTabFromPlaylist(playlistId: number, tabId: number): Promise<void>;
  reorderPlaylistItems(playlistId: number, itemOrders: { id: number; order: number }[]): Promise<void>;
  getPlaylistItems(playlistId: number): Promise<PlaylistItemWithTab[]>;

  // Favorite operations
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, tabId: number): Promise<void>;
  getUserFavorites(userId: string): Promise<TabWithUser[]>;
  isFavorited(userId: string, tabId: number): Promise<boolean>;

  // Stats operations
  getUserStats(userId: string): Promise<{
    totalTabs: number;
    totalPlaylists: number;
    totalFavorites: number;
    monthlyTabs: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Tab operations
  async createTab(tab: InsertTab): Promise<Tab> {
    const [newTab] = await db.insert(tabs).values(tab).returning();
    return newTab;
  }

  async getTab(id: number): Promise<Tab | undefined> {
    const [tab] = await db.select().from(tabs).where(eq(tabs.id, id));
    return tab;
  }

  async getTabWithUser(id: number): Promise<TabWithUser | undefined> {
    const [result] = await db
      .select()
      .from(tabs)
      .innerJoin(users, eq(tabs.userId, users.id))
      .where(eq(tabs.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.tabs,
      user: result.users,
    };
  }

  async getUserTabs(userId: string): Promise<Tab[]> {
    return await db
      .select()
      .from(tabs)
      .where(eq(tabs.userId, userId))
      .orderBy(desc(tabs.updatedAt));
  }

  async getPublicTabs(): Promise<TabWithUser[]> {
    const results = await db
      .select()
      .from(tabs)
      .innerJoin(users, eq(tabs.userId, users.id))
      .orderBy(desc(tabs.updatedAt))
      .limit(50);

    return results.map(result => ({
      ...result.tabs,
      user: result.users,
    }));
  }

  async updateTab(id: number, tabData: Partial<InsertTab>): Promise<Tab> {
    const [updatedTab] = await db
      .update(tabs)
      .set({ ...tabData, updatedAt: new Date() })
      .where(eq(tabs.id, id))
      .returning();
    return updatedTab;
  }

  async deleteTab(id: number): Promise<void> {
    await db.delete(tabs).where(eq(tabs.id, id));
  }

  async searchTabs(query: string, userId?: string): Promise<TabWithUser[]> {
    // PostgreSQL ILIKE for case-insensitive search
    const searchCondition = or(
      sql`${tabs.title} ILIKE ${'%' + query + '%'}`,
      sql`${tabs.artist} ILIKE ${'%' + query + '%'}`,
      sql`${tabs.content} ILIKE ${'%' + query + '%'}`
    );

    const conditions = userId 
      ? and(searchCondition, eq(tabs.userId, userId))
      : searchCondition;

    const results = await db
      .select()
      .from(tabs)
      .innerJoin(users, eq(tabs.userId, users.id))
      .where(conditions)
      .orderBy(desc(tabs.updatedAt))
      .limit(50);

    return results.map(result => ({
      ...result.tabs,
      user: result.users,
    }));
  }

  // Playlist operations
  async createPlaylist(playlist: InsertPlaylist): Promise<Playlist> {
    const [newPlaylist] = await db.insert(playlists).values(playlist).returning();
    return newPlaylist;
  }

  async getPlaylist(id: number): Promise<Playlist | undefined> {
    const [playlist] = await db.select().from(playlists).where(eq(playlists.id, id));
    return playlist;
  }

  async getPlaylistWithItems(id: number): Promise<PlaylistWithItems | undefined> {
    const [playlist] = await db
      .select()
      .from(playlists)
      .innerJoin(users, eq(playlists.userId, users.id))
      .where(eq(playlists.id, id));

    if (!playlist) return undefined;

    const items = await this.getPlaylistItems(id);

    return {
      ...playlist.playlists,
      user: playlist.users,
      items,
    };
  }

  async getUserPlaylists(userId: string): Promise<Playlist[]> {
    return await db
      .select()
      .from(playlists)
      .where(eq(playlists.userId, userId))
      .orderBy(desc(playlists.updatedAt));
  }

  async updatePlaylist(id: number, playlistData: Partial<InsertPlaylist>): Promise<Playlist> {
    const [updatedPlaylist] = await db
      .update(playlists)
      .set({ ...playlistData, updatedAt: new Date() })
      .where(eq(playlists.id, id))
      .returning();
    return updatedPlaylist;
  }

  async deletePlaylist(id: number): Promise<void> {
    await db.delete(playlistItems).where(eq(playlistItems.playlistId, id));
    await db.delete(playlists).where(eq(playlists.id, id));
  }

  // Playlist item operations
  async addTabToPlaylist(playlistItem: InsertPlaylistItem): Promise<PlaylistItem> {
    const [newItem] = await db.insert(playlistItems).values(playlistItem).returning();
    return newItem;
  }

  async removeTabFromPlaylist(playlistId: number, tabId: number): Promise<void> {
    await db
      .delete(playlistItems)
      .where(and(eq(playlistItems.playlistId, playlistId), eq(playlistItems.tabId, tabId)));
  }

  async reorderPlaylistItems(playlistId: number, itemOrders: { id: number; order: number }[]): Promise<void> {
    for (const { id, order } of itemOrders) {
      await db
        .update(playlistItems)
        .set({ order })
        .where(and(eq(playlistItems.id, id), eq(playlistItems.playlistId, playlistId)));
    }
  }

  async getPlaylistItems(playlistId: number): Promise<PlaylistItemWithTab[]> {
    const results = await db
      .select()
      .from(playlistItems)
      .innerJoin(tabs, eq(playlistItems.tabId, tabs.id))
      .where(eq(playlistItems.playlistId, playlistId))
      .orderBy(asc(playlistItems.order));

    return results.map(result => ({
      ...result.playlist_items,
      tab: result.tabs,
    }));
  }

  // Favorite operations
  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db.insert(favorites).values(favorite).returning();
    return newFavorite;
  }

  async removeFavorite(userId: string, tabId: number): Promise<void> {
    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.tabId, tabId)));
  }

  async getUserFavorites(userId: string): Promise<TabWithUser[]> {
    const results = await db
      .select()
      .from(favorites)
      .innerJoin(tabs, eq(favorites.tabId, tabs.id))
      .innerJoin(users, eq(tabs.userId, users.id))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));

    return results.map(result => ({
      ...result.tabs,
      user: result.users,
    }));
  }

  async isFavorited(userId: string, tabId: number): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.tabId, tabId)));
    return !!favorite;
  }

  // Stats operations
  async getUserStats(userId: string): Promise<{
    totalTabs: number;
    totalPlaylists: number;
    totalFavorites: number;
    monthlyTabs: number;
  }> {
    const userTabs = await db.select().from(tabs).where(eq(tabs.userId, userId));
    const userPlaylists = await db.select().from(playlists).where(eq(playlists.userId, userId));
    const userFavorites = await db.select().from(favorites).where(eq(favorites.userId, userId));
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const monthlyTabs = userTabs.filter(tab => 
      tab.createdAt && tab.createdAt > oneMonthAgo
    );

    return {
      totalTabs: userTabs.length,
      totalPlaylists: userPlaylists.length,
      totalFavorites: userFavorites.length,
      monthlyTabs: monthlyTabs.length,
    };
  }
}

export const storage = new DatabaseStorage();
