import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { RecordButton } from "@/components/RecordButton";
import { WaveformVisualizer } from "@/components/WaveformVisualizer";
import { TranslationCard } from "@/components/TranslationCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { AnalyzeResponse } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { RotateCcw, Save, Mic } from "lucide-react";

export default function Home() {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const {
    isRecording,
    audioBlob,
    waveformData,
    startRecording,
    stopRecording,
    resetRecording,
    recordingDuration,
  } = useAudioRecorder();

  const analyzeMutation = useMutation({
    mutationFn: async (data: { audioData: string }) => {
      const response = await apiRequest("POST", "/api/analyze", data);
      return response as AnalyzeResponse;
    },
    onSuccess: (data) => {
      setResult(data);
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis failed",
        description: error.message || "Could not analyze the audio. Please try again.",
        variant: "destructive",
      });
      resetRecording();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!result || !audioBlob || !user) throw new Error("No result to save");
      
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("animalType", result.animalType);
      formData.append("transcription", result.transcription);
      formData.append("detectedNeed", result.detectedNeed);
      formData.append("confidence", result.confidence.toString());
      formData.append("tips", JSON.stringify(result.tips));
      
      const response = await fetch("/api/recordings", {
        method: "POST",
        body: formData,
        headers: {
          "x-user-id": user.uid,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to save recording");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Saved!",
        description: "Recording saved to your history.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/recordings"] });
      handleRecordAgain();
    },
    onError: (error: Error) => {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleToggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      try {
        setResult(null);
        await startRecording();
      } catch (error) {
        toast({
          title: "Microphone access denied",
          description: "Please allow microphone access to record pet sounds.",
          variant: "destructive",
        });
      }
    }
  };

  const handleRecordAgain = () => {
    setResult(null);
    resetRecording();
  };

  const handleSave = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save recordings to your history.",
      });
      return;
    }
    saveMutation.mutate();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const hasAnalyzed = useRef(false);
  
  useEffect(() => {
    if (audioBlob && !result && !analyzeMutation.isPending && !hasAnalyzed.current) {
      hasAnalyzed.current = true;
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(",")[1];
        analyzeMutation.mutate({ audioData: base64 });
      };
      reader.readAsDataURL(audioBlob);
    }
    
    if (!audioBlob) {
      hasAnalyzed.current = false;
    }
  }, [audioBlob, result, analyzeMutation.isPending]);

  return (
    <div className="min-h-screen pb-20 bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
          <h1 className="text-xl font-bold font-serif text-primary">PetSpeak</h1>
          <div className="flex items-center gap-2">
            {!user && (
              <Link href="/login" asChild>
                <Button variant="ghost" size="sm" data-testid="button-login-header">
                  Sign In
                </Button>
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex flex-col items-center px-4 pt-8 max-w-lg mx-auto">
        {result ? (
          <div className="w-full space-y-4">
            <TranslationCard result={result} />
            
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleRecordAgain}
                data-testid="button-record-again"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Record Again
              </Button>
              {user && (
                <Button
                  className="flex-1"
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  data-testid="button-save"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveMutation.isPending ? "Saving..." : "Save"}
                </Button>
              )}
            </div>
            
            {!user && (
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">
                  Sign in to save this recording to your history
                </p>
                <Link href="/login" asChild>
                  <Button variant="outline" size="sm" data-testid="button-signin-save">
                    Sign In to Save
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold font-serif mb-2">
                What does your pet want?
              </h2>
              <p className="text-muted-foreground">
                Tap to record - we'll detect the animal automatically
              </p>
            </div>

            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mic className="w-4 h-4" />
                <span>Works with dogs, cats, birds, and more</span>
              </div>
            </div>

            <div className="relative mb-12">
              <RecordButton
                isRecording={isRecording}
                isAnalyzing={analyzeMutation.isPending}
                onToggle={handleToggleRecording}
              />
            </div>

            {isRecording && (
              <div className="text-center mb-4">
                <span className="text-2xl font-mono font-semibold text-destructive">
                  {formatDuration(recordingDuration)}
                </span>
              </div>
            )}

            <div className="w-full">
              <WaveformVisualizer data={waveformData} isRecording={isRecording} />
            </div>

            {!user && (
              <div className="mt-12 text-center p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">
                  Sign in to save recordings and access your history
                </p>
                <Link href="/login" asChild>
                  <Button variant="outline" size="sm" data-testid="button-signin-prompt">
                    Create an account
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
