import { db, firebaseConfig } from "@/features/core/firebase/config";
import { ref, update, remove } from "firebase/database";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
// Note: In a real production app with high security, user creation should happen via a Secure Cloud Function (Admin SDK). 
// Here we follow the original project's architecture of using a secondary client app to bypass login session takeover.

export const TeamService = {
  async createAgent(name: string, email: string, password: string, role: string) {
      // Initialize secondary app to avoid logging out the current superadmin
      const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp" + Date.now());
      const secondaryAuth = getAuth(secondaryApp);
      
      const userCred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const newUserId = userCred.user.uid;
      
      const userRef = ref(db, `users/${newUserId}`);
      await update(userRef, {
          name: name || "Support Agent",
          email: email,
          role: role,
          onlineStatus: false,
          lastSeen: Date.now()
      });
      
      // Sign out and clean up the secondary instance
      await signOut(secondaryAuth);
      
      return { id: newUserId, email, role };
  },

  async updateRole(agentId: string, currentRole: string) {
      const newRole = currentRole === "agent" ? "superadmin" : "agent";
      const userRef = ref(db, `users/${agentId}`);
      await update(userRef, { role: newRole });
      return newRole;
  },

  async removeAgent(agentId: string) {
      // Note: Only removes DB profile. True Auth deletion requires Admin SDK ideally.
      const agentRef = ref(db, `users/${agentId}`);
      await remove(agentRef);
  }
};
