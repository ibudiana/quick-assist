import { useState, useEffect } from "react";
import { db } from "@/features/core/firebase/config";
import { ref, onValue } from "firebase/database";
import { AgentProfile } from "../types/team.types";
import { TeamService } from "../services/team.service";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { AuditService } from "@/features/audit/services/audit.service";

export function useTeam() {
  const { user, userProfile } = useAuth();
  const [agents, setAgents] = useState<AgentProfile[]>([]);

  // Create Form State
  const [isAddingAgent, setIsAddingAgent] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentEmail, setNewAgentEmail] = useState("");
  const [newAgentPassword, setNewAgentPassword] = useState("");
  const [newAgentRole, setNewAgentRole] = useState("agent");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [crudError, setCrudError] = useState("");

  const isSuperadmin = userProfile?.role === "superadmin";

  useEffect(() => {
    if (!isSuperadmin) return;

    const usersRef = ref(db, "users");
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val() as Record<
        string,
        Omit<AgentProfile, "id">
      > | null;
      if (data) {
        const allUsers = Object.entries(data).map(
          ([key, val]: [string, Omit<AgentProfile, "id">]) => ({
            id: key,
            ...val,
          }),
        ) as AgentProfile[];

        const teamMembers = allUsers.filter(
          (u) => u.role === "agent" || u.role === "superadmin",
        );
        setAgents(teamMembers);
      } else {
        setAgents([]);
      }
    });

    return () => unsubscribe();
  }, [isSuperadmin]);

  const addAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCrudError("");

    try {
      await TeamService.createAgent(
        newAgentName,
        newAgentEmail,
        newAgentPassword,
        newAgentRole,
      );
      if (user && userProfile) {
        await AuditService.logAuditEvent(
          "AGENT_CREATED",
          `Created new agent: ${newAgentEmail} with role ${newAgentRole}`,
          { uid: user.uid, email: user.email, role: userProfile.role },
        );
      }

      // Reset form
      setIsAddingAgent(false);
      setNewAgentName("");
      setNewAgentEmail("");
      setNewAgentPassword("");
      setNewAgentRole("agent");
    } catch (err: Error | unknown) {
      if (err instanceof Error) {
        setCrudError(err.message);
      } else {
        setCrudError("An unknown error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRole = async (agentId: string, currentRole: string) => {
    await TeamService.updateRole(agentId, currentRole);
    if (user && userProfile) {
      const newRole = currentRole === "agent" ? "superadmin" : "agent";

      await AuditService.logAuditEvent(
        "ROLE_UPDATED",
        `Updated agent ${agentId} to ${newRole}`,
        { uid: user.uid, email: user.email, role: userProfile.role },
      );
    }
  };

  const removeAgent = async (agentId: string) => {
    await TeamService.removeAgent(agentId);
    if (user && userProfile) {
      await AuditService.logAuditEvent(
        "AGENT_REMOVED",
        `Removed agent ${agentId}`,
        { uid: user.uid, email: user.email, role: userProfile.role },
      );
    }
  };

  return {
    agents,
    isSuperadmin,
    isAddingAgent,
    setIsAddingAgent,
    newAgentName,
    setNewAgentName,
    newAgentEmail,
    setNewAgentEmail,
    newAgentPassword,
    setNewAgentPassword,
    newAgentRole,
    setNewAgentRole,
    isSubmitting,
    crudError,
    addAgent,
    updateRole,
    removeAgent,
  };
}
