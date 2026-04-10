import { useState, useEffect } from "react";
import { db } from "@/features/core/firebase/config";
import { ref, onValue } from "firebase/database";
import { Subscriber } from "../types/crm.types";
import { CrmService } from "../services/crm.service";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function useSubscribers() {
  const { user, userProfile } = useAuth();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  // Campaign Form State
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignBody, setCampaignBody] = useState("");
  const [isSendingCampaign, setIsSendingCampaign] = useState(false);
  const [campaignMsg, setCampaignMsg] = useState({ text: "", type: "" });

  const isSuperadmin = userProfile?.role === "superadmin";

  useEffect(() => {
    if (!isSuperadmin) return;

    const subRef = ref(db, "subscribers");
    const unsubscribe = onValue(subRef, (snapshot) => {
      const data = snapshot.val() as Record<
        string,
        Omit<Subscriber, "id">
      > | null;
      if (data) {
        const list = Object.entries(data).map(
          ([key, val]: [string, Omit<Subscriber, "id">]) => ({
            id: key,
            ...val,
          }),
        ) as Subscriber[];
        list.sort((a, b) => (b.subscribedAt || 0) - (a.subscribedAt || 0));
        setSubscribers(list);
      } else {
        setSubscribers([]);
      }
    });

    return () => unsubscribe();
  }, [isSuperadmin]);

  const sendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!campaignSubject.trim() || !campaignBody.trim()) return;

    if (subscribers.length === 0) {
      setCampaignMsg({ text: "No subscribers to send to.", type: "error" });
      return;
    }

    if (!user || !userProfile) {
      setCampaignMsg({ text: "User is not authenticated.", type: "error" });
      return;
    }

    setIsSendingCampaign(true);
    setCampaignMsg({ text: "Sending...", type: "info" });

    try {
      await CrmService.sendCampaign(
        campaignSubject,
        campaignBody,
        subscribers.length,
        user,
        userProfile,
      );

      setCampaignSubject("");
      setCampaignBody("");
      setCampaignMsg({
        text: `Success! Email blasted to ${subscribers.length} subscribers.`,
        type: "success",
      });
      setTimeout(() => setCampaignMsg({ text: "", type: "" }), 5000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setCampaignMsg({ text: err.message, type: "error" });
      } else {
        setCampaignMsg({ text: "An unknown error occurred.", type: "error" });
      }
    } finally {
      setIsSendingCampaign(false);
    }
  };

  return {
    subscribers,
    isSuperadmin,
    campaignSubject,
    setCampaignSubject,
    campaignBody,
    setCampaignBody,
    isSendingCampaign,
    campaignMsg,
    sendCampaign,
  };
}
