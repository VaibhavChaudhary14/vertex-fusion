import { 
  users, alerts, simulations, knowledgeArticles, threatFeeds, 
  chatMessages, datasets, systemMetrics,
  type User, type UpsertUser, type Alert, type InsertAlert,
  type Simulation, type InsertSimulation, type KnowledgeArticle,
  type ThreatFeed, type ChatMessage, type InsertChatMessage,
  type Dataset, type InsertDataset
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  
  getAlerts(userId?: string, limit?: number): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  acknowledgeAlert(id: string): Promise<Alert | undefined>;
  getAlertsLast24h(): Promise<number>;
  
  getSimulations(userId: string): Promise<Simulation[]>;
  getSimulation(id: string): Promise<Simulation | undefined>;
  createSimulation(simulation: InsertSimulation): Promise<Simulation>;
  updateSimulation(id: string, data: Partial<Simulation>): Promise<Simulation | undefined>;
  
  getChatMessages(userId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  getDatasets(userId: string): Promise<Dataset[]>;
  createDataset(dataset: InsertDataset): Promise<Dataset>;
  
  getKnowledgeArticles(): Promise<KnowledgeArticle[]>;
  getThreatFeeds(limit?: number): Promise<ThreatFeed[]>;
}

class MemoryStorage implements IStorage {
  private users = new Map<string, User>();
  private alerts: Alert[] = [];
  private simulations = new Map<string, Simulation>();
  private chatMessages: ChatMessage[] = [];
  private datasets = new Map<string, Dataset>();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const userId = userData.id;
    if (!userId) throw new Error("User ID is required for upsert");
    const user: User = {
      ...userData,
      id: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
    this.users.set(userId, user);
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      const updated = { ...user, ...data, updatedAt: new Date() };
      this.users.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async getAlerts(userId?: string, limit: number = 50): Promise<Alert[]> {
    let alerts = this.alerts;
    if (userId) {
      alerts = alerts.filter(a => a.userId === userId);
    }
    return alerts
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
      .slice(0, limit);
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const newAlert: Alert = {
      ...alert,
      id: Math.random().toString(),
      createdAt: new Date(),
      isAcknowledged: false,
    } as Alert;
    this.alerts.push(newAlert);
    return newAlert;
  }

  async acknowledgeAlert(id: string): Promise<Alert | undefined> {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.isAcknowledged = true;
    }
    return alert;
  }

  async getAlertsLast24h(): Promise<number> {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.alerts.filter(a => (a.createdAt ?? new Date(0)) > yesterday).length;
  }

  async getSimulations(userId: string): Promise<Simulation[]> {
    return Array.from(this.simulations.values())
      .filter(s => s.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  }

  async getSimulation(id: string): Promise<Simulation | undefined> {
    return this.simulations.get(id);
  }

  async createSimulation(simulation: InsertSimulation): Promise<Simulation> {
    const newSim: Simulation = {
      ...simulation,
      id: Math.random().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Simulation;
    this.simulations.set(newSim.id, newSim);
    return newSim;
  }

  async updateSimulation(id: string, data: Partial<Simulation>): Promise<Simulation | undefined> {
    const sim = this.simulations.get(id);
    if (sim) {
      const updated = { ...sim, ...data, updatedAt: new Date() };
      this.simulations.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async getChatMessages(userId: string): Promise<ChatMessage[]> {
    return this.chatMessages.filter(m => m.userId === userId);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const newMsg: ChatMessage = {
      ...message,
      id: Math.random().toString(),
      createdAt: new Date(),
    } as ChatMessage;
    this.chatMessages.push(newMsg);
    return newMsg;
  }

  async getDatasets(userId: string): Promise<Dataset[]> {
    return Array.from(this.datasets.values())
      .filter(d => d.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  }

  async createDataset(dataset: InsertDataset): Promise<Dataset> {
    const newDs: Dataset = {
      ...dataset,
      id: Math.random().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Dataset;
    this.datasets.set(newDs.id, newDs);
    return newDs;
  }

  async getKnowledgeArticles(): Promise<KnowledgeArticle[]> {
    return [];
  }

  async getThreatFeeds(limit: number = 20): Promise<ThreatFeed[]> {
    return [];
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    if (!db) return undefined;
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (!db) return { ...userData, createdAt: new Date(), updatedAt: new Date() } as User;
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

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    if (!db) return undefined;
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAlerts(userId?: string, limit: number = 50): Promise<Alert[]> {
    if (!db) return [];
    if (userId) {
      return db.select().from(alerts)
        .where(eq(alerts.userId, userId))
        .orderBy(desc(alerts.createdAt))
        .limit(limit);
    }
    return db.select().from(alerts)
      .orderBy(desc(alerts.createdAt))
      .limit(limit);
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    if (!db) return { ...alert, id: Math.random().toString(), createdAt: new Date(), isAcknowledged: false } as Alert;
    const [newAlert] = await db.insert(alerts).values(alert).returning();
    return newAlert;
  }

  async acknowledgeAlert(id: string): Promise<Alert | undefined> {
    if (!db) return undefined;
    const [alert] = await db
      .update(alerts)
      .set({ isAcknowledged: true })
      .where(eq(alerts.id, id))
      .returning();
    return alert;
  }

  async getAlertsLast24h(): Promise<number> {
    if (!db) return 0;
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(alerts)
      .where(gte(alerts.createdAt, yesterday));
    return result[0]?.count || 0;
  }

  async getSimulations(userId: string): Promise<Simulation[]> {
    if (!db) return [];
    return db.select().from(simulations)
      .where(eq(simulations.userId, userId))
      .orderBy(desc(simulations.createdAt));
  }

  async getSimulation(id: string): Promise<Simulation | undefined> {
    if (!db) return undefined;
    const [simulation] = await db.select().from(simulations).where(eq(simulations.id, id));
    return simulation;
  }

  async createSimulation(simulation: InsertSimulation): Promise<Simulation> {
    if (!db) return { ...simulation, id: Math.random().toString(), createdAt: new Date(), updatedAt: new Date() } as Simulation;
    const [newSimulation] = await db.insert(simulations).values(simulation).returning();
    return newSimulation;
  }

  async updateSimulation(id: string, data: Partial<Simulation>): Promise<Simulation | undefined> {
    if (!db) return undefined;
    const [simulation] = await db
      .update(simulations)
      .set(data)
      .where(eq(simulations.id, id))
      .returning();
    return simulation;
  }

  async getChatMessages(userId: string): Promise<ChatMessage[]> {
    if (!db) return [];
    return db.select().from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(chatMessages.createdAt);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    if (!db) return { ...message, id: Math.random().toString(), createdAt: new Date() } as ChatMessage;
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  async getDatasets(userId: string): Promise<Dataset[]> {
    if (!db) return [];
    return db.select().from(datasets)
      .where(eq(datasets.userId, userId))
      .orderBy(desc(datasets.createdAt));
  }

  async createDataset(dataset: InsertDataset): Promise<Dataset> {
    if (!db) return { ...dataset, id: Math.random().toString(), createdAt: new Date(), updatedAt: new Date() } as Dataset;
    const [newDataset] = await db.insert(datasets).values(dataset).returning();
    return newDataset;
  }

  async getKnowledgeArticles(): Promise<KnowledgeArticle[]> {
    if (!db) return [];
    return db.select().from(knowledgeArticles).orderBy(knowledgeArticles.category);
  }

  async getThreatFeeds(limit: number = 20): Promise<ThreatFeed[]> {
    if (!db) return [];
    return db.select().from(threatFeeds)
      .orderBy(desc(threatFeeds.publishedAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
