import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecordButtonProps {
  isRecording: boolean;
  isAnalyzing: boolean;
  onToggle: () => void;
}

export function RecordButton({ isRecording, isAnalyzing, onToggle }: RecordButtonProps) {
  return (
    <div className="relative flex items-center justify-center">
      {isRecording && (
        <>
          <div className="absolute w-52 h-52 md:w-72 md:h-72 rounded-full bg-primary/20 animate-pulse-ring" />
          <div className="absolute w-60 h-60 md:w-80 md:h-80 rounded-full bg-primary/10 animate-pulse-ring" style={{ animationDelay: "0.5s" }} />
        </>
      )}
      
      <button
        onClick={onToggle}
        disabled={isAnalyzing}
        data-testid="button-record"
        className={cn(
          "relative z-10 w-44 h-44 md:w-56 md:h-56 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/30",
          isRecording 
            ? "bg-destructive shadow-lg shadow-destructive/30 scale-95" 
            : isAnalyzing 
              ? "bg-muted cursor-not-allowed"
              : "bg-primary shadow-lg shadow-primary/30 hover:scale-105 active:scale-95"
        )}
      >
        {isAnalyzing ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
            <span className="text-sm font-medium text-muted-foreground">Analyzing...</span>
          </div>
        ) : isRecording ? (
          <Square className="w-16 h-16 md:w-20 md:h-20 text-white fill-white" />
        ) : (
          <Mic className="w-16 h-16 md:w-20 md:h-20 text-white" />
        )}
      </button>
      
      <div className="absolute -bottom-16 text-center">
        <span className={cn(
          "text-base font-medium transition-colors",
          isRecording ? "text-destructive" : "text-muted-foreground"
        )}>
          {isAnalyzing ? "Processing your pet's sound..." : isRecording ? "Tap to stop recording" : "Tap to start recording"}
        </span>
      </div>
    </div>
  );
}
