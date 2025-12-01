import { useQuery } from "@tanstack/react-query";
import { LogOut, User, Mail, Calendar, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import type { Recording } from "@shared/schema";

export default function Profile() {
  const { user, userProfile, signOut } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const { data: recordings, isLoading } = useQuery<Recording[]>({
    queryKey: ["/api/recordings"],
    enabled: !!user,
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: "Signed out successfully" });
      navigate("/");
    } catch (error) {
      toast({
        title: "Sign out failed",
        variant: "destructive",
      });
    }
  };

  if (!user || !userProfile) {
    navigate("/login");
    return null;
  }

  const totalRecordings = recordings?.length || 0;
  const avgConfidence = recordings?.length 
    ? Math.round(recordings.reduce((acc, r) => acc + r.confidence, 0) / recordings.length)
    : 0;
  
  const needCounts: Record<string, number> = {};
  recordings?.forEach((r) => {
    needCounts[r.detectedNeed] = (needCounts[r.detectedNeed] || 0) + 1;
  });
  const topNeed = Object.entries(needCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="min-h-screen pb-20 bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
          <h1 className="text-xl font-bold font-serif text-primary">Profile</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-20 h-20 mb-4">
                <AvatarFallback className="text-2xl font-semibold bg-primary text-primary-foreground">
                  {userProfile.displayName?.charAt(0).toUpperCase() || userProfile.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold" data-testid="text-username">
                {userProfile.displayName || "Pet Lover"}
              </h2>
              <p className="text-sm text-muted-foreground" data-testid="text-email">
                {userProfile.email}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Member since {format(parseISO(userProfile.createdAt), "MMMM yyyy")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Your Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-primary" data-testid="stat-total-recordings">
                    {totalRecordings}
                  </p>
                  <p className="text-xs text-muted-foreground">Recordings</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-primary" data-testid="stat-avg-confidence">
                    {avgConfidence}%
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Confidence</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-primary capitalize" data-testid="stat-top-need">
                    {topNeed?.[0] || "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">Top Need</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleSignOut}
          data-testid="button-signout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </main>
    </div>
  );
}
