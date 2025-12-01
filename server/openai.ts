import OpenAI from "openai";
import fs from "fs";
import path from "path";
import os from "os";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ProductRecommendation {
  name: string;
  description: string;
  category: string;
}

export interface Action {
  icon: string;
  title: string;
  description: string;
  urgent: boolean;
}

export interface AnalysisResult {
  transcription: string;
  translation: string;
  animalType: string;
  animalEmoji: string;
  mood: string;
  moodEmoji: string;
  detectedNeed: string;
  confidence: number;
  action: Action;
  tips: string[];
  products: ProductRecommendation[];
}

const animalPrompts: Record<string, string> = {
  dog: `You are an expert dog whisperer who can translate dog vocalizations into human speech. Analyze the sound and translate it as if the dog is speaking to their human.

Common dog vocalizations:
- Barking: excitement, alerting, fear, attention seeking, playfulness
- Whining: stress, anxiety, wanting something, submission, or pain
- Growling: warning, fear, or playful
- Howling: communication, loneliness, response to sounds
- Yelping: sudden pain or fear

Translation style examples:
- Excited bark → "Oh boy oh boy! You're home! This is the BEST day ever!"
- Whine → "Please... I really need something... can you help me?"
- Growl → "Hey, back off! I'm not comfortable with this."`,

  cat: `You are an expert cat whisperer who can translate cat vocalizations into human speech. Analyze the sound and translate it as if the cat is speaking to their human (cats are often sassy and regal).

Common cat vocalizations:
- Meowing: greeting, attention seeking, hunger, complaint
- Purring: content, self-soothing, sometimes pain
- Hissing: fear, aggression, warning
- Chirping: excitement, hunting instinct
- Yowling: mating, territorial, distress

Translation style examples:
- Demanding meow → "Excuse me, human. My food bowl appears to be at an unacceptable level."
- Purring → "Mmm, this is acceptable. You may continue petting me."
- Chirp → "Look! A bird! I could totally catch that if this window wasn't here!"`,

  bird: `You are an expert bird whisperer who can translate bird vocalizations into human speech. Analyze the sound and translate it as if the bird is speaking (birds are often cheerful and chatty).

Common bird vocalizations:
- Singing: territory, mating, happiness
- Chirping: communication, alerting
- Screaming: attention, fear, excitement
- Talking: social interaction
- Clicking: content, curious

Translation style examples:
- Happy chirp → "What a beautiful day! La la la! Look at me!"
- Loud squawk → "HEY! Pay attention to me RIGHT NOW!"
- Singing → "This is MY house! I'm the prettiest bird here!"`,

  default: `You are an expert animal whisperer who can translate animal vocalizations into human speech. Analyze the sound and translate it as if the animal is speaking to their human.`
};

export async function analyzeAnimalSound(
  audioBase64: string
): Promise<AnalysisResult> {
  const tempFile = path.join(os.tmpdir(), `recording-${Date.now()}.webm`);
  
  try {
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    fs.writeFileSync(tempFile, audioBuffer);
    
    let transcription = "";
    try {
      const audioStream = fs.createReadStream(tempFile);
      const whisperResponse = await openai.audio.transcriptions.create({
        file: audioStream,
        model: "whisper-1",
        language: "en",
        prompt: `This is an animal making sounds. Describe the sounds you hear including barks, meows, chirps, whines, growls, squeaks, or other animal vocalizations. Identify the type of animal if possible.`
      });
      transcription = whisperResponse.text;
    } catch (whisperError) {
      console.log("Whisper transcription error (expected for non-speech audio):", whisperError);
      transcription = "[Animal vocalization detected]";
    }
    
    const analysisPrompt = `You are an expert animal behaviorist and pet whisperer who can identify animals and translate their vocalizations into human speech.

Audio description/transcription: "${transcription || "Animal making sounds"}"

Based on this sound:
1. FIRST identify what type of animal this is (dog, cat, bird, hamster, guinea pig, rabbit, ferret, horse, cow, sheep, goat, chicken, duck, pig, or other)
2. Provide a fun, personality-filled translation of what the animal is "saying" in human words (1-2 sentences)
   - Dogs: excited, loyal, enthusiastic
   - Cats: sassy, regal, demanding
   - Birds: cheerful, chatty, dramatic
   - Small pets: curious, squeaky, timid
   - Farm animals: straightforward, practical
3. Detect their current mood
4. What need they're expressing
5. A specific action the owner should take
6. 2-3 relevant product recommendations
7. 2-3 helpful tips

You MUST respond with valid JSON in this exact format:
{
  "animalType": "the detected animal type (dog, cat, bird, hamster, etc.)",
  "animalEmoji": "emoji representing the animal (🐕 for dog, 🐱 for cat, 🐦 for bird, etc.)",
  "translation": "The animal's 'speech' in human words with personality",
  "mood": "happy" | "excited" | "content" | "curious" | "anxious" | "scared" | "frustrated" | "lonely" | "urgent" | "neutral",
  "moodEmoji": "appropriate emoji for the mood",
  "detectedNeed": "hungry" | "playful" | "stressed" | "tired" | "attention" | "happy" | "anxious" | "territorial" | "pain" | "unknown",
  "confidence": <number between 0 and 100>,
  "action": {
    "icon": "emoji for the action (like 🍖 for food, 🚶 for walk, 🎾 for play, 🤗 for comfort, 🏥 for vet)",
    "title": "Short action title like 'Time for food!' or 'Play time!'",
    "description": "Brief description of what to do",
    "urgent": false
  },
  "tips": ["tip 1", "tip 2", "tip 3"],
  "products": [
    {"name": "Product name", "description": "Why this helps", "category": "food/toys/comfort/health"},
    {"name": "Product name", "description": "Why this helps", "category": "food/toys/comfort/health"}
  ]
}`;

    let response;
    try {
      response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an expert animal behaviorist. Always respond with valid JSON only." },
          { role: "user", content: analysisPrompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1024,
      });
    } catch (apiError: any) {
      console.error("OpenAI API error:", apiError.message);
      throw new Error(`OpenAI API error: ${apiError.message}`);
    }

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error("No content in response:", JSON.stringify(response));
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content);
    
    return {
      transcription,
      translation: result.translation || "Your pet is trying to tell you something!",
      animalType: result.animalType || "unknown",
      animalEmoji: result.animalEmoji || "🐾",
      mood: result.mood || "neutral",
      moodEmoji: result.moodEmoji || "🐾",
      detectedNeed: result.detectedNeed || "unknown",
      confidence: Math.min(100, Math.max(0, result.confidence || 50)),
      action: result.action || {
        icon: "👀",
        title: "Observe your pet",
        description: "Watch for more signals to understand what they need",
        urgent: false
      },
      tips: result.tips || ["Observe your pet's behavior", "Ensure basic needs are met", "Consult a vet if concerned"],
      products: result.products || [],
    };
  } finally {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}
