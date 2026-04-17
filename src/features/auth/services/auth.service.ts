import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth, db } from "@/features/core/firebase/config";
import { ref, update, set, serverTimestamp } from "firebase/database";

export const AuthService = {
  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    // const userId = userCredential.user.uid;
    const user = userCredential.user;

    // Mengecek apakah email sudah diverifikasi
    if (!user.emailVerified) {
      throw new Error(
        "Email belum diverifikasi. Harap periksa email Anda untuk verifikasi.",
      );
    }

    // Set user online
    const userId = user.uid;

    // Set user online
    const userRef = ref(db, `users/${userId}`);
    await update(userRef, {
      onlineStatus: true,
      lastSeen: serverTimestamp(),
    });

    return userCredential.user;
  },

  async register(
    email: string,
    password: string,
    role: string = "agent",
    defaultName?: string,
  ) {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    const userRef = ref(db, `users/${user.uid}`);
    await set(userRef, {
      name: defaultName || email.split("@")[0],
      email: email,
      role: role,
      onlineStatus: false,
      lastSeen: serverTimestamp(),
    });

    // send email verification
    const actionCodeSettings = {
      url: process.env.VERIF_URL || "http://localhost:3000/verify-email",
      handleCodeInApp: true,
    };

    await sendEmailVerification(user, actionCodeSettings);
    await signOut(auth); // Log out immediately after registration to force email verification

    return user;
  },

  async logout(userId?: string) {
    const hasInvalidKeyChars =
      typeof userId === "string" && /[.#$\[\]/]/.test(userId);

    if (userId && !hasInvalidKeyChars) {
      const userRef = ref(db, `users/${userId}`);
      await update(userRef, {
        onlineStatus: false,
        lastSeen: serverTimestamp(),
      });
    }
    await signOut(auth);
  },
};
