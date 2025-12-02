import { useEffect } from "react";
import { LogOut, User, Mail } from "lucide-react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 bg-black/40 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
          <h1 className="text-xl font-bold font-serif text-primary">Profile</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="w-20 h-20 ring-2 ring-primary/30">
                {userProfile.photoURL && (
                  <AvatarImage src={userProfile.photoURL} alt={userProfile.displayName || "Profile"} />
                )}
                <AvatarFallback className="text-2xl font-semibold bg-primary text-primary-foreground">
                  {userProfile.displayName?.charAt(0).toUpperCase() || userProfile.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-3 w-full">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <User className="w-5 h-5 text-gray-400" />
                  <div className="text-left">
                    <p className="text-xs text-gray-400">Name</p>
                    <p className="font-medium text-white" data-testid="text-username">
                      {userProfile.displayName || "Pet Lover"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div className="text-left">
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="font-medium text-white" data-testid="text-email">
                      {userProfile.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          variant="outline" 
          className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20" 
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
