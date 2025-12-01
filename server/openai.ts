import OpenAI from "openai";
import fs from "fs";
import path from "path";
import os from "os";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AnalysisResult {
  transcription: string;
  detectedNeed: string;
  confidence: number;
  tips: string[];
}

const animalPrompts: Record<string, string> = {
  dog: `You are an expert in canine behavior and communication. Analyze the following audio transcription/description of a dog's vocalization and determine what the dog is trying to communicate.

Common dog vocalizations:
- Barking: Can indicate excitement, alerting, fear, seeking attention, playfulness
- Whining/Whimpering: Often indicates stress, anxiety, wanting something, submission, or pain
- Growling: Warning, fear, or playful (context dependent)
- Howling: Communication, loneliness, response to sounds
- Yelping: Sudden pain or fear`,

  cat: `You are an expert in feline behavior and communication. Analyze the following audio transcription/description of a cat's vocalization and determine what the cat is trying to communicate.

Common cat vocalizations:
- Meowing: Greeting, attention seeking, hunger, complaint
- Purring: Content, self-soothing, sometimes pain
- Hissing/Growling: Fear, aggression, warning
- Chirping/Chattering: Excitement, hunting instinct
- Yowling: Mating, territorial, distress`,

  bird: `You are an expert in avian behavior and communication. Analyze the following audio transcription/description of a bird's vocalization and determine what the bird is trying to communicate.

Common bird vocalizations:
- Singing: Territory marking, mating, happiness
- Chirping: Communication, alerting
- Screaming: Attention, fear, excitement
- Talking/Mimicking: Social interaction
- Quiet clicking: Content, curious`,

  default: `You are an expert in animal behavior and communication. Analyze the following audio transcription/description of an animal's vocalization and determine what the animal is trying to communicate.`
};

export async function analyzeAnimalSound(
  audioBase64: string, 
  animalType: string
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
        prompt: `This is a ${animalType} making sounds. Describe the sounds you hear including barks, meows, chirps, whines, growls, or other animal vocalizations.`
      });
      transcription = whisperResponse.text;
    } catch (whisperError) {
      console.log("Whisper transcription error (expected for non-speech audio):", whisperError);
      transcription = `[${animalType} vocalization detected]`;
    }
    
    const systemPrompt = animalPrompts[animalType] || animalPrompts.default;
    
    const analysisPrompt = `${systemPrompt}

Audio description/transcription: "${transcription || `${animalType} making sounds`}"

Based on this sound, determine:
1. What need or emotion is the animal expressing?
2. How confident are you in this assessment (0-100)?
3. What are 3-4 helpful tips for the owner based on this interpretation?

You MUST respond with valid JSON in this exact format:
{
  "detectedNeed": "hungry" | "playful" | "stressed" | "tired" | "attention" | "happy" | "anxious" | "territorial" | "pain" | "unknown",
  "confidence": <number between 0 and 100>,
  "tips": ["tip 1", "tip 2", "tip 3"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: "You are an expert animal behaviorist. Always respond with valid JSON only." },
        { role: "user", content: analysisPrompt }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 1024,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content);
    
    return {
      transcription,
      detectedNeed: result.detectedNeed || "unknown",
      confidence: Math.min(100, Math.max(0, result.confidence || 50)),
      tips: result.tips || ["Observe your pet's behavior", "Ensure basic needs are met", "Consult a vet if concerned"],
    };
  } finally {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}
