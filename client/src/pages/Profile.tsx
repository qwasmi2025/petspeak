import { useEffect } from "react";
import { LogOut, Coins } from "lucide-react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";

export default function Profile() {
  const { user, userProfile, signOut, loading, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user) {
      refreshProfile();
    }
  }, [user]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

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
                {userProfile.photoURL && (
                  <AvatarImage src={userProfile.photoURL} alt={userProfile.displayName || "Profile"} />
                )}
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
              <Coins className="w-5 h-5 text-primary" />
              Your Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
              <p className="text-5xl font-bold text-primary" data-testid="text-credits">
                {userProfile.credits}
              </p>
              <p className="text-sm text-muted-foreground mt-2">credits remaining</p>
              <p className="text-xs text-muted-foreground mt-1">
                Each pet sound analysis uses 1 credit
              </p>
            </div>
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
