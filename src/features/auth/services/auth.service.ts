import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { auth, db } from "@/features/core/firebase/config";
import { ref, update, set, serverTimestamp } from "firebase/database";

export const AuthService = {
  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;
    
    // Set user online
    const userRef = ref(db, `users/${userId}`);
    await update(userRef, {
        onlineStatus: true,
        lastSeen: serverTimestamp()
    });
    
    return userCredential.user;
  },

  async register(email: string, password: string, role: string = "customer", defaultName?: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userRef = ref(db, `users/${user.uid}`);
    await set(userRef, {
      name: defaultName || email.split("@")[0],
      email: email,
      role: role,
      onlineStatus: true,
      lastSeen: serverTimestamp()
    });

    return user;
  },

  async logout(userId?: string) {
    if (userId) {
      const userRef = ref(db, `users/${userId}`);
      await update(userRef, {
        onlineStatus: false,
        lastSeen: serverTimestamp()
      });
    }
    await signOut(auth);
  }
};
