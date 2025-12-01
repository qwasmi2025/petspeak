import type { Recording, InsertRecording, UserProfile, AdminStats } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createRecording(recording: InsertRecording): Promise<Recording>;
  getRecordingsByUserId(userId: string): Promise<Recording[]>;
  getRecordingById(id: string): Promise<Recording | undefined>;
  deleteRecording(id: string): Promise<void>;
  getAllRecordings(): Promise<Recording[]>;
  
  createUserProfile(profile: UserProfile): Promise<UserProfile>;
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  getAllUsers(): Promise<UserProfile[]>;
  updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | undefined>;
  
  getAdminStats(): Promise<AdminStats>;
}

export class MemStorage implements IStorage {
  private recordings: Map<string, Recording>;
  private users: Map<string, UserProfile>;

  constructor() {
    this.recordings = new Map();
    this.users = new Map();
  }

  async createRecording(insertRecording: InsertRecording): Promise<Recording> {
    const id = randomUUID();
    const recording: Recording = { ...insertRecording, id };
    this.recordings.set(id, recording);
    return recording;
  }

  async getRecordingsByUserId(userId: string): Promise<Recording[]> {
    return Array.from(this.recordings.values())
      .filter((recording) => recording.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getRecordingById(id: string): Promise<Recording | undefined> {
    return this.recordings.get(id);
  }

  async deleteRecording(id: string): Promise<void> {
    this.recordings.delete(id);
  }

  async getAllRecordings(): Promise<Recording[]> {
    return Array.from(this.recordings.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createUserProfile(profile: UserProfile): Promise<UserProfile> {
    this.users.set(profile.id, profile);
    return profile;
  }

  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    return this.users.get(userId);
  }

  async getAllUsers(): Promise<UserProfile[]> {
    return Array.from(this.users.values());
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | undefined> {
    const existing = this.users.get(userId);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.users.set(userId, updated);
    return updated;
  }

  async getAdminStats(): Promise<AdminStats> {
    const recordings = Array.from(this.recordings.values());
    const users = Array.from(this.users.values());
    
    const needDistribution: Record<string, number> = {};
    const animalDistribution: Record<string, number> = {};
    let totalConfidence = 0;
    
    recordings.forEach((r) => {
      needDistribution[r.detectedNeed] = (needDistribution[r.detectedNeed] || 0) + 1;
      animalDistribution[r.animalType] = (animalDistribution[r.animalType] || 0) + 1;
      totalConfidence += r.confidence;
    });
    
    const dailyRecordings: { date: string; count: number }[] = [];
    const last7Days = new Map<string, number>();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last7Days.set(dateStr, 0);
    }
    
    recordings.forEach((r) => {
      const dateStr = r.createdAt.split('T')[0];
      if (last7Days.has(dateStr)) {
        last7Days.set(dateStr, (last7Days.get(dateStr) || 0) + 1);
      }
    });
    
    last7Days.forEach((count, date) => {
      dailyRecordings.push({ date, count });
    });
    
    return {
      totalRecordings: recordings.length,
      totalUsers: users.length,
      avgConfidence: recordings.length > 0 ? totalConfidence / recordings.length : 0,
      needDistribution,
      animalDistribution,
      dailyRecordings,
    };
  }
}

export const storage = new MemStorage();
