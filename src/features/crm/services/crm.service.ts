import { db } from "@/features/core/firebase/config";
import { ref, push, set, serverTimestamp } from "firebase/database";
import { AuditService } from "@/features/audit/services/audit.service";
import { User } from "firebase/auth";

export const CrmService = {
  async sendCampaign(
    subject: string,
    body: string,
    recipientCount: number,
    user: User,
    userProfile: { role: string },
  ) {
    if (recipientCount === 0) throw new Error("No subscribers to send to.");

    // Simulate broadcasting by writing to campaigns node
    const campRef = push(ref(db, "campaigns"));
    await set(campRef, {
      subject,
      body,
      recipientCount,
      sentBy: user.email,
      timestamp: serverTimestamp(),
    });

    await AuditService.logAuditEvent(
      "CAMPAIGN_SENT",
      `Broadcasted '${subject}' to ${recipientCount} subscribers.`,
      {
        uid: user.uid,
        email: user.email,
        role: userProfile.role || "Agent",
      } as { uid: string; email: string; role: string },
    );
  },
};
