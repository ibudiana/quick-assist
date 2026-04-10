import { db } from "@/features/core/firebase/config";
import { ref, push, set, serverTimestamp } from "firebase/database";

export const AuditService = {
  async logAuditEvent(
    action: string,
    details: string,
    performedByData: { uid: string; email: string | null; role: string },
  ) {
    try {
      const auditRef = push(ref(db, "audit_logs"));
      await set(auditRef, {
        action,
        details,
        performedBy: performedByData,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to log audit event:", err);
    }
  },
};
