import { useQuery } from "@tanstack/react-query";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { Clock, Dog, Cat, Bird, Rabbit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { Link } from "wouter";
import type { Recording, AnimalType } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const animalIcons: Record<AnimalType, typeof Dog> = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  rabbit: Rabbit,
  hamster: Rabbit,
  other: Dog,
};

const needColors: Record<string, string> = {
  hungry: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  playful: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  stressed: "bg-destructive/10 text-destructive border-destructive/20",
  tired: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  attention: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  happy: "bg-primary/10 text-primary border-primary/20",
  anxious: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  territorial: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  pain: "bg-destructive/10 text-destructive border-destructive/20",
  unknown: "bg-muted text-muted-foreground border-muted",
};

function formatDateGroup(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
}

function groupRecordingsByDate(recordings: Recording[]): Record<string, Recording[]> {
  const groups: Record<string, Recording[]> = {};
  
  recordings.forEach((recording) => {
    const dateKey = format(parseISO(recording.createdAt), "yyyy-MM-dd");
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(recording);
  });
  
  return groups;
}

export default function History() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: recordings, isLoading } = useQuery<Recording[]>({
    queryKey: ["/api/recordings"],
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/recordings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recordings"] });
      toast({ title: "Recording deleted" });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen pb-20 bg-background">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
            <h1 className="text-xl font-bold font-serif text-primary">History</h1>
            <ThemeToggle />
          </div>
        </header>
        
        <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <Clock className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Sign in to view history</h2>
          <p className="text-muted-foreground mb-6">
            Your recording history will appear here once you sign in
          </p>
          <Link href="/login" asChild>
            <Button data-testid="button-signin-history">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  const groupedRecordings = recordings ? groupRecordingsByDate(recordings) : {};
  const sortedDates = Object.keys(groupedRecordings).sort((a, b) => b.localeCompare(a));

  return (
    <div className="min-h-screen pb-20 bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
          <h1 className="text-xl font-bold font-serif text-primary">History</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : sortedDates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <Clock className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No recordings yet</h2>
            <p className="text-muted-foreground mb-6">
              Start recording your pet's sounds to see them here
            </p>
            <Link href="/" asChild>
              <Button data-testid="button-start-recording">Start Recording</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((dateKey) => (
              <div key={dateKey}>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 sticky top-14 bg-background py-2 z-30">
                  {formatDateGroup(dateKey + "T00:00:00")}
                </h3>
                <div className="space-y-3">
                  {groupedRecordings[dateKey].map((recording) => {
                    const Icon = animalIcons[recording.animalType];
                    return (
                      <Card 
                        key={recording.id} 
                        className="hover-elevate overflow-visible"
                        data-testid={`card-recording-${recording.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <Badge 
                                  variant="outline" 
                                  className={needColors[recording.detectedNeed]}
                                >
                                  {recording.detectedNeed}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {recording.confidence}% confidence
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {format(parseISO(recording.createdAt), "h:mm a")}
                              </p>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => deleteMutation.mutate(recording.id)}
                              disabled={deleteMutation.isPending}
                              data-testid={`button-delete-${recording.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
