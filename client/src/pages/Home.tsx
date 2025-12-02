import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { RecordButton } from "@/components/RecordButton";
import { WaveformVisualizer } from "@/components/WaveformVisualizer";
import { TranslationCard } from "@/components/TranslationCard";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import type { AnalyzeResponse, LanguageCode } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { RotateCcw, Mic, Coins } from "lucide-react";

export default function Home() {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [language, setLanguage] = useState<LanguageCode>("en");
  const { toast } = useToast();
  const { user, userProfile, useCredit, refreshProfile, loading } = useAuth();
  
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
    mutationFn: async (data: { audioData: string; language: LanguageCode }) => {
      if (user && userProfile) {
        const success = await useCredit();
        if (!success) {
          throw new Error("Could not deduct credit. Please try again.");
        }
      }
      
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

  const handleToggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      if (user && loading) {
        toast({
          title: "Please wait",
          description: "Loading your account...",
        });
        return;
      }
      
      if (user && userProfile && userProfile.credits <= 0) {
        toast({
          title: "No credits remaining",
          description: "You've used all your credits. Contact support for more.",
          variant: "destructive",
        });
        return;
      }
      
      if (user && !userProfile) {
        toast({
          title: "Please wait",
          description: "Loading your credits...",
        });
        return;
      }
      
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
        analyzeMutation.mutate({ audioData: base64, language });
      };
      reader.readAsDataURL(audioBlob);
    }
    
    if (!audioBlob) {
      hasAnalyzed.current = false;
    }
  }, [audioBlob, result, analyzeMutation.isPending, language]);

  useEffect(() => {
    if (user) {
      refreshProfile();
    }
  }, [user]);

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 bg-black/40 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
          <h1 className="text-xl font-bold font-serif text-primary">PetSpeak</h1>
          <div className="flex items-center gap-2">
            {user && userProfile && (
              <Badge variant="secondary" className="gap-1" data-testid="badge-credits">
                <Coins className="w-3 h-3" />
                {userProfile.credits}
              </Badge>
            )}
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
                className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={handleRecordAgain}
                data-testid="button-record-again"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Record Again
              </Button>
            </div>
            
            {!user && (
              <div className="text-center p-4 rounded-lg glass-card-light">
                <p className="text-sm text-gray-300 mb-2">
                  Sign in to get 100 free credits
                </p>
                <Link href="/login" asChild>
                  <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20" data-testid="button-signin-save">
                    Sign In with Google
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <h2 className="text-2xl md:text-3xl font-bold font-serif mb-2 text-white">
                What does your pet want?
              </h2>
              <p className="text-gray-400">
                Tap to record - we'll detect the animal automatically
              </p>
            </div>

            <div className="w-full mb-6">
              <LanguageSelector
                value={language}
                onChange={setLanguage}
                disabled={isRecording || analyzeMutation.isPending}
              />
            </div>

            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
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
                <span className="text-2xl font-mono font-semibold text-red-400">
                  {formatDuration(recordingDuration)}
                </span>
              </div>
            )}

            <div className="w-full">
              <WaveformVisualizer data={waveformData} isRecording={isRecording} />
            </div>

            {user && userProfile && userProfile.credits <= 0 && (
              <div className="mt-8 text-center p-4 rounded-lg glass-card-light border border-red-500/20">
                <p className="text-sm text-red-400 font-medium mb-1">
                  No credits remaining
                </p>
                <p className="text-xs text-gray-400">
                  Contact support to get more credits
                </p>
              </div>
            )}

            {!user && (
              <div className="mt-12 text-center p-4 rounded-lg glass-card-light">
                <p className="text-sm text-gray-300 mb-2">
                  Sign in to get 100 free credits
                </p>
                <Link href="/login" asChild>
                  <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20" data-testid="button-signin-prompt">
                    Sign In with Google
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
