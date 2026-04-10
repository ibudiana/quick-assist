import { useState, useEffect } from "react";
import { db } from "@/features/core/firebase/config";
import { ref, onValue } from "firebase/database";
import { AuditLogItem } from "../types/audit.types";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function useAuditLogs() {
  const { userProfile } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  const isSuperadmin = userProfile?.role === "superadmin";

  useEffect(() => {
    if (!isSuperadmin) return;

    const auditRef = ref(db, "audit_logs");

    const unsubscribe = onValue(auditRef, (snapshot) => {
      const data = snapshot.val() as Record<
        string,
        Omit<AuditLogItem, "id">
      > | null;

      if (!data) {
        setAuditLogs([]);
        return;
      }

      const logs: AuditLogItem[] = Object.entries(data).map(([key, val]) => ({
        id: key,
        ...val,
      }));

      logs.sort((a, b) => b.timestamp - a.timestamp);
      setAuditLogs(logs);
    });

    return () => unsubscribe();
  }, [isSuperadmin]);

  return { auditLogs, isSuperadmin };
}
