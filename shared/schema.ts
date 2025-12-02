import { z } from "zod";

export const animalTypes = ["dog", "cat", "bird", "hamster", "rabbit", "other"] as const;
export type AnimalType = typeof animalTypes[number];

export const needTypes = ["hungry", "playful", "stressed", "tired", "attention", "happy", "anxious", "territorial", "pain", "unknown"] as const;
export type NeedType = typeof needTypes[number];

export const languageCodes = ["en", "ar", "zh", "es", "fr", "de", "ja", "ko", "pt", "ru"] as const;
export type LanguageCode = typeof languageCodes[number];

export const languages: { code: LanguageCode; name: string; nativeName: string; flag: string }[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
];

export const recordingSchema = z.object({
  id: z.string(),
  userId: z.string(),
  animalType: z.enum(animalTypes),
  audioUrl: z.string().optional(),
  transcription: z.string().optional(),
  detectedNeed: z.enum(needTypes),
  confidence: z.number().min(0).max(100),
  tips: z.array(z.string()),
  createdAt: z.string(),
});

export type Recording = z.infer<typeof recordingSchema>;

export const insertRecordingSchema = recordingSchema.omit({ id: true });
export type InsertRecording = z.infer<typeof insertRecordingSchema>;

export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  isAdmin: z.boolean().default(false),
  createdAt: z.string(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

export const petSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  type: z.enum(animalTypes),
  breed: z.string().optional(),
  age: z.number().optional(),
  createdAt: z.string(),
});

export type Pet = z.infer<typeof petSchema>;

export const analyzeRequestSchema = z.object({
  audioData: z.string(),
  language: z.enum(languageCodes).default("en"),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

export const moodTypes = ["happy", "excited", "content", "curious", "anxious", "scared", "frustrated", "lonely", "urgent", "neutral"] as const;
export type MoodType = typeof moodTypes[number];

export const productRecommendationSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.string(),
});

export type ProductRecommendation = z.infer<typeof productRecommendationSchema>;

export const actionSchema = z.object({
  icon: z.string(),
  title: z.string(),
  description: z.string(),
  urgent: z.boolean().default(false),
});

export type Action = z.infer<typeof actionSchema>;

export const analyzeResponseSchema = z.object({
  transcription: z.string(),
  translation: z.string(),
  animalType: z.string(),
  animalEmoji: z.string(),
  mood: z.enum(moodTypes),
  moodEmoji: z.string(),
  detectedNeed: z.enum(needTypes),
  confidence: z.number(),
  action: actionSchema,
  tips: z.array(z.string()),
  products: z.array(productRecommendationSchema),
});

export type AnalyzeResponse = z.infer<typeof analyzeResponseSchema>;

export const adminStatsSchema = z.object({
  totalRecordings: z.number(),
  totalUsers: z.number(),
  avgConfidence: z.number(),
  needDistribution: z.record(z.string(), z.number()),
  animalDistribution: z.record(z.string(), z.number()),
  dailyRecordings: z.array(z.object({
    date: z.string(),
    count: z.number(),
  })),
});

export type AdminStats = z.infer<typeof adminStatsSchema>;

export const trainingDataSchema = z.object({
  id: z.string(),
  audioUrl: z.string(),
  animalType: z.enum(animalTypes),
  labeledNeed: z.enum(needTypes),
  adminNotes: z.string().optional(),
  createdAt: z.string(),
  createdBy: z.string(),
});

export type TrainingData = z.infer<typeof trainingDataSchema>;
