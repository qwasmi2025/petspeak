import { useEffect, useState } from "react";
import { Check, RotateCcw, Save, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { AnalyzeResponse, AnimalType } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ResultsCardProps {
  result: AnalyzeResponse;
  animalType: AnimalType;
  onRecordAgain: () => void;
  onSave: () => void;
  isSaving?: boolean;
}

const needLabels: Record<string, { label: string; color: string }> = {
  hungry: { label: "Hungry", color: "text-chart-2" },
  playful: { label: "Wants to Play", color: "text-chart-3" },
  stressed: { label: "Feeling Stressed", color: "text-destructive" },
  tired: { label: "Tired/Sleepy", color: "text-chart-4" },
  attention: { label: "Wants Attention", color: "text-chart-1" },
  happy: { label: "Happy/Content", color: "text-primary" },
  anxious: { label: "Anxious", color: "text-chart-5" },
  territorial: { label: "Territorial", color: "text-chart-2" },
  pain: { label: "In Pain/Discomfort", color: "text-destructive" },
  unknown: { label: "Unknown", color: "text-muted-foreground" },
};

export function ResultsCard({ result, animalType, onRecordAgain, onSave, isSaving }: ResultsCardProps) {
  const [displayConfidence, setDisplayConfidence] = useState(0);
  const needInfo = needLabels[result.detectedNeed] || needLabels.unknown;

  useEffect(() => {
    const duration = 1000;
    const steps = 50;
    const increment = result.confidence / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= result.confidence) {
        setDisplayConfidence(result.confidence);
        clearInterval(timer);
      } else {
        setDisplayConfidence(Math.round(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [result.confidence]);

  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in-up">
      <CardHeader className="text-center pb-2 gap-2">
        <div className="mx-auto mb-2 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-3xl">
            {animalType === "dog" ? "🐕" : animalType === "cat" ? "🐈" : animalType === "bird" ? "🐦" : "🐾"}
          </span>
        </div>
        <CardTitle className={cn("text-2xl md:text-3xl font-bold font-serif", needInfo.color)}>
          {needInfo.label}
        </CardTitle>
        {result.transcription && (
          <p className="text-sm text-muted-foreground italic">
            "{result.transcription}"
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Confidence</span>
            <span className="font-semibold text-lg animate-count-up">{displayConfidence}%</span>
          </div>
          <Progress value={displayConfidence} className="h-3" />
        </div>
        
        <div className="space-y-3">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Suggestions</h4>
          <ul className="space-y-2">
            {result.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3 text-sm">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex flex-col gap-3 pt-2">
          <Button 
            onClick={onSave} 
            disabled={isSaving}
            className="w-full"
            data-testid="button-save-result"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save to History"}
          </Button>
          <Button 
            variant="outline" 
            onClick={onRecordAgain}
            className="w-full"
            data-testid="button-record-again"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Record Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
