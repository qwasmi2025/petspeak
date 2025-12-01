import { cn } from "@/lib/utils";

interface WaveformVisualizerProps {
  data: number[];
  isRecording: boolean;
}

export function WaveformVisualizer({ data, isRecording }: WaveformVisualizerProps) {
  return (
    <div className="flex items-center justify-center gap-1 h-24 md:h-32 px-4">
      {data.map((value, index) => (
        <div
          key={index}
          className={cn(
            "w-1.5 md:w-2 rounded-full transition-all duration-100",
            isRecording ? "bg-primary" : "bg-muted"
          )}
          style={{
            height: `${Math.max(8, value * 100)}%`,
            animationDelay: `${index * 30}ms`,
          }}
        />
      ))}
    </div>
  );
}
