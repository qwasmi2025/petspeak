import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { SiGoogle } from "react-icons/si";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      toast({ title: "Welcome to PetSpeak!" });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Could not sign in with Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-black/40 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
          <Link href="/" asChild>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold font-serif text-primary">PetSpeak</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md glass-card">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-3xl">🐾</span>
            </div>
            <CardTitle className="text-2xl font-serif text-white">Welcome to PetSpeak</CardTitle>
            <CardDescription className="text-gray-300">
              Sign in to get 100 free credits and start translating your pet's sounds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline"
              className="w-full h-12 text-base gap-3 bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              data-testid="button-google-signin"
            >
              <SiGoogle className="w-5 h-5" />
              {isLoading ? "Signing in..." : "Continue with Google"}
            </Button>
            
            <div className="text-center text-sm text-gray-400 pt-4">
              <p>By signing in, you agree to our</p>
              <p>Terms of Service and Privacy Policy</p>
            </div>
            
            <div className="border-t border-white/10 pt-4 mt-4">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                <span className="text-lg">🎁</span>
                <span>New users get <strong className="text-primary">100 free credits</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
