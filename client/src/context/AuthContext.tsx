import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { UserProfile } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const profileDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (profileDoc.exists()) {
            setUserProfile(profileDoc.data() as UserProfile);
          }
        } catch (error) {
          console.warn("Could not fetch user profile (offline?):", error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    const profile: UserProfile = {
      id: result.user.uid,
      email: result.user.email || email,
      displayName: displayName || email.split("@")[0],
      isAdmin: false,
      createdAt: new Date().toISOString(),
    };
    
    await setDoc(doc(db, "users", result.user.uid), profile);
    setUserProfile(profile);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      signIn,
      signUp,
      signOut,
      isAdmin: userProfile?.isAdmin || false,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
