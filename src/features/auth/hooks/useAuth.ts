import { useState, useEffect } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, db } from "@/features/core/firebase/config";
import { ref, onValue, update, onDisconnect, serverTimestamp } from "firebase/database";
import { UserProfile } from "../types/auth.types";

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const userRef = ref(db, `users/${currentUser.uid}`);
        
        // Set online status and offline trigger
        update(userRef, { onlineStatus: true });
        onDisconnect(userRef).update({ onlineStatus: false, lastSeen: serverTimestamp() });

        const unsubscribeDb = onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
             setUserProfile(data as UserProfile);
          }
          setLoading(false);
        });
        
        return () => {
           unsubscribeDb();
           // Explicitly set offline on component unmount
           update(userRef, { onlineStatus: false, lastSeen: serverTimestamp() }).catch(console.error);
        };
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return { user, userProfile, loading };
}
