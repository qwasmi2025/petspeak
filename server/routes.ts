import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { analyzeAnimalSound } from "./openai";
import { analyzeRequestSchema, animalTypes, needTypes } from "@shared/schema";
import type { AnimalType, NeedType } from "@shared/schema";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/analyze", async (req: Request, res: Response) => {
    try {
      const parsed = analyzeRequestSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request", details: parsed.error.errors });
      }
      
      const { audioData } = parsed.data;
      
      const result = await analyzeAnimalSound(audioData);
      
      res.json(result);
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: "Failed to analyze audio" });
    }
  });
  
  app.post("/api/recordings", upload.single("audio"), async (req: Request, res: Response) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }
      
      const animalType = req.body.animalType as AnimalType;
      const transcription = req.body.transcription as string;
      const detectedNeed = req.body.detectedNeed as NeedType;
      const confidence = parseFloat(req.body.confidence);
      const tips = JSON.parse(req.body.tips || "[]");
      
      if (!animalTypes.includes(animalType)) {
        return res.status(400).json({ error: "Invalid animal type" });
      }
      
      if (!needTypes.includes(detectedNeed)) {
        return res.status(400).json({ error: "Invalid detected need" });
      }
      
      const recording = await storage.createRecording({
        userId,
        animalType,
        transcription,
        detectedNeed,
        confidence,
        tips,
        createdAt: new Date().toISOString(),
      });
      
      res.json(recording);
    } catch (error) {
      console.error("Save recording error:", error);
      res.status(500).json({ error: "Failed to save recording" });
    }
  });
  
  app.get("/api/recordings", async (req: Request, res: Response) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }
      
      const recordings = await storage.getRecordingsByUserId(userId);
      res.json(recordings);
    } catch (error) {
      console.error("Get recordings error:", error);
      res.status(500).json({ error: "Failed to get recordings" });
    }
  });
  
  app.delete("/api/recordings/:id", async (req: Request, res: Response) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      const { id } = req.params;
      
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }
      
      const recording = await storage.getRecordingById(id);
      
      if (!recording) {
        return res.status(404).json({ error: "Recording not found" });
      }
      
      if (recording.userId !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      await storage.deleteRecording(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete recording error:", error);
      res.status(500).json({ error: "Failed to delete recording" });
    }
  });
  
  app.get("/api/admin/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Get admin stats error:", error);
      res.status(500).json({ error: "Failed to get stats" });
    }
  });
  
  app.get("/api/admin/users", async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  return httpServer;
}
