import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  real,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User roles enum
export const userRoles = ["admin", "analyst", "researcher"] as const;
export type UserRole = (typeof userRoles)[number];

// Subscription tiers
export const subscriptionTiers = ["free", "professional", "enterprise"] as const;
export type SubscriptionTier = (typeof subscriptionTiers)[number];

// Users table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  passwordHash: varchar("password_hash"),
  isEmailVerified: boolean("is_email_verified").default(false),
  emailVerificationToken: varchar("email_verification_token"),
  resetPasswordToken: varchar("reset_password_token"),
  resetPasswordTokenExpiry: timestamp("reset_password_token_expiry"),
  role: varchar("role", { length: 50 }).default("researcher"),
  subscriptionTier: varchar("subscription_tier", { length: 50 }).default("free"),
  apiCallsUsed: integer("api_calls_used").default(0),
  apiCallsLimit: integer("api_calls_limit").default(100),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Attack types enum
export const attackTypes = ["RW", "FDI", "RS", "BF", "BD"] as const;
export type AttackType = (typeof attackTypes)[number];

// Attack type labels
export const attackTypeLabels: Record<AttackType, string> = {
  RW: "Ransomware",
  FDI: "False Data Injection",
  RS: "Reverse Shell",
  BF: "Brute Force",
  BD: "Backdoor",
};

// Grid topology types
export const gridTopologies = ["ieee14", "ieee30", "ieee118"] as const;
export type GridTopology = (typeof gridTopologies)[number];

// Load profile types
export const loadProfiles = ["normal", "stress"] as const;
export type LoadProfile = (typeof loadProfiles)[number];

// Observability modes
export const observabilityModes = ["full", "partial"] as const;
export type ObservabilityMode = (typeof observabilityModes)[number];

// Alert severity levels
export const severityLevels = ["critical", "high", "medium", "low"] as const;
export type SeverityLevel = (typeof severityLevels)[number];

// Simulation status
export const simulationStatuses = ["pending", "running", "completed", "failed"] as const;
export type SimulationStatus = (typeof simulationStatuses)[number];

// Alerts table for GNN detection events
export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  simulationId: varchar("simulation_id"),
  attackType: varchar("attack_type", { length: 20 }).notNull(),
  severity: varchar("severity", { length: 20 }).notNull(),
  affectedNodes: text("affected_nodes").array(),
  confidenceScore: real("confidence_score").notNull(),
  classification: varchar("classification", { length: 20 }).notNull(),
  mitigationRecommendation: text("mitigation_recommendation"),
  isAcknowledged: boolean("is_acknowledged").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Simulations table
export const simulations = pgTable("simulations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: varchar("name", { length: 255 }),
  topology: varchar("topology", { length: 20 }).notNull(),
  loadProfile: varchar("load_profile", { length: 20 }).notNull(),
  observabilityMode: varchar("observability_mode", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  attackSequence: jsonb("attack_sequence"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  results: jsonb("results"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Knowledge base articles
export const knowledgeArticles = pgTable("knowledge_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  subcategory: varchar("subcategory", { length: 100 }),
  content: text("content").notNull(),
  tags: text("tags").array(),
  relatedArticles: text("related_articles").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Threat intelligence feed
export const threatFeeds = pgTable("threat_feeds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 500 }).notNull(),
  summary: text("summary").notNull(),
  source: varchar("source", { length: 255 }).notNull(),
  sourceUrl: varchar("source_url", { length: 1000 }),
  severity: varchar("severity", { length: 20 }).notNull(),
  category: varchar("category", { length: 100 }),
  publishedAt: timestamp("published_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat messages for AI chatbot
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Datasets generated by users
export const datasets = pgTable("datasets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  topology: varchar("topology", { length: 20 }).notNull(),
  attackTypes: text("attack_types").array(),
  sampleCount: integer("sample_count").notNull(),
  format: varchar("format", { length: 20 }).notNull(),
  fileSize: integer("file_size"),
  downloadUrl: varchar("download_url", { length: 1000 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// System metrics for dashboard
export const systemMetrics = pgTable("system_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  metricType: varchar("metric_type", { length: 50 }).notNull(),
  value: real("value").notNull(),
  metadata: jsonb("metadata"),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

// Automated Mitigation Actions
export const mitigationActions = pgTable("mitigation_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  actionType: varchar("action_type", { length: 50 }).notNull(),
  description: text("description").notNull(),
  isEnabled: boolean("is_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Mitigation Execution Logs
export const mitigationLogs = pgTable("mitigation_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  alertId: varchar("alert_id").references(() => alerts.id),
  actionId: varchar("action_id"), // Can be null if manual or ad-hoc
  actionType: varchar("action_type", { length: 50 }).notNull(),
  target: varchar("target", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(), // 'success', 'failed', 'pending'
  message: text("message"),
  executedAt: timestamp("executed_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  alerts: many(alerts),
  simulations: many(simulations),
  chatMessages: many(chatMessages),
  datasets: many(datasets),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  user: one(users, {
    fields: [alerts.userId],
    references: [users.id],
  }),
}));

export const simulationsRelations = relations(simulations, ({ one }) => ({
  user: one(users, {
    fields: [simulations.userId],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

export const datasetsRelations = relations(datasets, ({ one }) => ({
  user: one(users, {
    fields: [datasets.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

export const insertSimulationSchema = createInsertSchema(simulations).omit({
  id: true,
  createdAt: true,
});

export const insertKnowledgeArticleSchema = createInsertSchema(knowledgeArticles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertThreatFeedSchema = createInsertSchema(threatFeeds).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertDatasetSchema = createInsertSchema(datasets).omit({
  id: true,
  createdAt: true,
});

export const insertSystemMetricSchema = createInsertSchema(systemMetrics).omit({
  id: true,
  recordedAt: true,
});

export const insertMitigationActionSchema = createInsertSchema(mitigationActions).omit({
  id: true,
  createdAt: true,
});

export const insertMitigationLogSchema = createInsertSchema(mitigationLogs).omit({
  id: true,
  executedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertSimulation = z.infer<typeof insertSimulationSchema>;
export type Simulation = typeof simulations.$inferSelect;
export type InsertKnowledgeArticle = z.infer<typeof insertKnowledgeArticleSchema>;
export type KnowledgeArticle = typeof knowledgeArticles.$inferSelect;
export type InsertThreatFeed = z.infer<typeof insertThreatFeedSchema>;
export type ThreatFeed = typeof threatFeeds.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertDataset = z.infer<typeof insertDatasetSchema>;
export type Dataset = typeof datasets.$inferSelect;
export type InsertSystemMetric = z.infer<typeof insertSystemMetricSchema>;
export type SystemMetric = typeof systemMetrics.$inferSelect;
export type InsertMitigationAction = z.infer<typeof insertMitigationActionSchema>;
export type MitigationAction = typeof mitigationActions.$inferSelect;
export type InsertMitigationLog = z.infer<typeof insertMitigationLogSchema>;
export type MitigationLog = typeof mitigationLogs.$inferSelect;

// Grid node types for visualization
export interface GridNode {
  id: string;
  type: "generator" | "bus" | "load" | "transformer" | "pmu" | "plc" | "router" | "hmi";
  layer: "physical" | "cyber";
  x: number;
  y: number;
  status: "normal" | "warning" | "critical" | "offline";
  anomalyScore: number;
  label: string;
  metadata?: Record<string, unknown>;
}

export interface GridEdge {
  source: string;
  target: string;
  type: "physical" | "cyber" | "coupling";
  weight: number;
}

export interface GridTopologyData {
  nodes: GridNode[];
  edges: GridEdge[];
  topology: GridTopology;
}

// GNN inference result
export interface GNNInferenceResult {
  classification: "benign" | "malicious";
  probability: number;
  attackType?: AttackType;
  affectedNodes: string[];
  confidenceScore: number;
  inferenceTimeMs: number;
}

// Simulation configuration
export interface SimulationConfig {
  topology: GridTopology;
  loadProfile: LoadProfile;
  observabilityMode: ObservabilityMode;
  attackSequence?: {
    attackType: AttackType;
    targetNode: string;
    timestamp: number;
  }[];
  duration?: number;
}

// System health metrics
export interface SystemHealthMetrics {
  securityIndex: number;
  detectionRate: number;
  falseAlarmRate: number;
  gridReliabilityScore: number;
  activeSimulations: number;
  alertsLast24h: number;
}

// Model performance metrics
export interface ModelPerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  detectionRateByAttack: Record<AttackType, number>;
  confusionMatrix: number[][];
  rocCurve: { fpr: number; tpr: number }[];
  scalabilityMetrics: {
    topology: GridTopology;
    inferenceTimeMs: number;
    detectionRate: number;
  }[];
}
