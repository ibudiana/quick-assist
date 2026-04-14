import { db } from "@/features/core/firebase/config";
import { ref, onValue } from "firebase/database";
import { push, set, serverTimestamp } from "firebase/database";
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

    // Log audit event
    await AuditService.logAuditEvent(
      "CAMPAIGN_SENT",
      `Broadcasted '${subject}' to ${recipientCount} subscribers.`,
      {
        uid: user.uid,
        email: user.email,
        role: userProfile.role || "Agent",
      } as { uid: string; email: string; role: string },
    );

    // ...existing code...
    const getSubscribersEmails = () => {
      return new Promise<string[]>((resolve, reject) => {
        const subRef = ref(db, "subscribers");
        onValue(
          subRef,
          (snapshot) => {
            const data = snapshot.val() as Record<
              string,
              { email?: string }
            > | null;

            if (!data) {
              reject(new Error("No subscribers found."));
              return;
            }

            const emails = Object.values(data)
              .map((subscriber) => subscriber.email)
              .filter(
                (email): email is string =>
                  typeof email === "string" && email.length > 0,
              );

            resolve(emails);
          },
          (error) => reject(error),
          { onlyOnce: true },
        );
      });
    };

    try {
      const emails = await getSubscribersEmails();
      if (emails.length === 0) {
        throw new Error("No subscribers email found.");
      }

      // Kirim email ke semua penerima
      const sendCampaignEmail = async () => {
        try {
          const response = await fetch("/api/sendCampaign", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              subject,
              body,
              recipients: emails, // Menggunakan daftar email yang diambil dari Firebase
              recipientCount: emails.length,
              senderEmail: user.email, // Gunakan email pengirim yang telah login
            }),
          });

          const data = await response.json();
          if (response.ok) {
            console.log("Email sent successfully");
          } else {
            console.error("Error: " + data.error);
          }
        } catch (error) {
          console.error("Error:", error);
          throw new Error("Failed to send email");
        }
      };

      await sendCampaignEmail();
    } catch (error) {
      console.error("Error fetching subscribers' emails:", error);
    }
  },
};
