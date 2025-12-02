import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type User 
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { UserProfile } from "@shared/schema";

const googleProvider = new GoogleAuthProvider();

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  useCredit: () => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (firebaseUser: User) => {
    try {
      const profileDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (profileDoc.exists()) {
        const profile = profileDoc.data() as UserProfile;
        setUserProfile(profile);
        return profile;
      }
      return null;
    } catch (error) {
      console.warn("Could not fetch user profile (offline?):", error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        await fetchUserProfile(firebaseUser);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    
    const profileDoc = await getDoc(doc(db, "users", result.user.uid));
    
    if (!profileDoc.exists()) {
      const profile: UserProfile = {
        id: result.user.uid,
        email: result.user.email || "",
        displayName: result.user.displayName || result.user.email?.split("@")[0] || "User",
        photoURL: result.user.photoURL || undefined,
        credits: 100,
        isAdmin: false,
        createdAt: new Date().toISOString(),
      };
      
      await setDoc(doc(db, "users", result.user.uid), profile);
      setUserProfile(profile);
    } else {
      setUserProfile(profileDoc.data() as UserProfile);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserProfile(null);
  };

  const useCredit = async (): Promise<boolean> => {
    if (!user || !userProfile) return false;
    if (userProfile.credits <= 0) return false;
    
    try {
      await updateDoc(doc(db, "users", user.uid), {
        credits: increment(-1)
      });
      
      setUserProfile(prev => prev ? { ...prev, credits: prev.credits - 1 } : null);
      return true;
    } catch (error) {
      console.error("Failed to use credit:", error);
      return false;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      signInWithGoogle,
      signOut,
      useCredit,
      refreshProfile,
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
