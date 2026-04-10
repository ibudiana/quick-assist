import { useState, useEffect } from "react";
import { db } from "@/features/core/firebase/config";
import { ref, update } from "firebase/database";
import { updatePassword } from "firebase/auth";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function useProfileSettings() {
  const { user, userProfile } = useAuth();

  const [profileNameInput, setProfileNameInput] = useState("");
  const [profilePasswordInput, setProfilePasswordInput] = useState("");
  const [profileUpdateMsg, setProfileUpdateMsg] = useState({
    text: "",
    type: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (userProfile?.name) {
      setProfileNameInput(userProfile.name);
    }
  }, [userProfile?.name]);

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdating(true);
    setProfileUpdateMsg({ text: "Updating...", type: "info" });

    try {
      // 1. Update Name in DB
      if (profileNameInput !== userProfile?.name) {
        const userRef = ref(db, `users/${user.uid}`);
        await update(userRef, { name: profileNameInput });
      }

      // 2. Update Password via Auth if provided
      if (profilePasswordInput) {
        await updatePassword(user, profilePasswordInput);
        setProfilePasswordInput("");
      }

      setProfileUpdateMsg({
        text: "Profile updated successfully!",
        type: "success",
      });
      setTimeout(() => setProfileUpdateMsg({ text: "", type: "" }), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setProfileUpdateMsg({ text: err.message, type: "error" });
      } else {
        setProfileUpdateMsg({
          text: "An unknown error occurred.",
          type: "error",
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    userProfile,
    profileNameInput,
    setProfileNameInput,
    profilePasswordInput,
    setProfilePasswordInput,
    profileUpdateMsg,
    isUpdating,
    updateProfile,
  };
}
