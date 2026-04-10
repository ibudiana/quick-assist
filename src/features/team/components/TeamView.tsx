"use client";

import { useTeam } from "../hooks/useTeam";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useModal } from "@/features/core/components/ModalProvider";
import {
  FiUsers,
  FiPlus,
  FiX,
  FiUser,
  FiShield,
  FiCircle,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";

export function TeamView() {
  const { user } = useAuth();
  const { openModal } = useModal();

  const {
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
  } = useTeam();

  if (!isSuperadmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
        <FiShield size={48} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300">
          Access Denied
        </h2>
        <p className="text-sm mt-2">
          You need superadmin privileges to view this page.
        </p>
      </div>
    );
  }

  const handleUpdateRole = (agentId: string, currentRole: string) => {
    const newRole = currentRole === "agent" ? "superadmin" : "agent";
    openModal({
      title: "Update Role",
      message: `Change this user's role to ${newRole}?`,
      onConfirm: async () => {
        await updateRole(agentId, currentRole);
      },
    });
  };

  const handleDeleteAgent = (agentId: string) => {
    openModal({
      title: "Remove Agent",
      message:
        "Are you sure you want to remove this agent? They will no longer have dashboard access.",
      type: "danger",
      onConfirm: async () => {
        await removeAgent(agentId);
      },
    });
  };

  return (
    <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-800 p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <FiUsers className="text-blue-600" /> Team Directory
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage agent and superadmin access levels
          </p>
        </div>
        <button
          onClick={() => setIsAddingAgent(!isAddingAgent)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
        >
          {isAddingAgent ? <FiX size={16} /> : <FiPlus size={16} />}
          {isAddingAgent ? "Cancel" : "Add New Agent"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto w-full">
        {/* Create Agent Form */}
        {isAddingAgent && (
          <form
            onSubmit={addAgent}
            className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-blue-200 shadow-md mb-6 max-w-lg"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Create New Account
            </h3>
            {crudError && (
              <p className="text-sm text-red-500 mb-4 bg-red-50 p-3 rounded-lg border border-red-100">
                {crudError}
              </p>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="John Doe"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  placeholder="john@example.com"
                  value={newAgentEmail}
                  onChange={(e) => setNewAgentEmail(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Temporary Password
                </label>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={newAgentPassword}
                  onChange={(e) => setNewAgentPassword(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Access Role
                </label>
                <select
                  value={newAgentRole}
                  onChange={(e) => setNewAgentRole(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-4 py-2 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="agent">Support Agent</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>
              <button
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-3 rounded-lg transition-colors mt-2 shadow-sm"
              >
                {isSubmitting ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>
        )}

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 ${agent.role === "superadmin" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"} rounded-2xl flex items-center justify-center shrink-0`}
                  >
                    {agent.role === "superadmin" ? (
                      <FiShield size={24} />
                    ) : (
                      <FiUser size={24} />
                    )}
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 flex items-center gap-1.5 rounded-full font-medium ${agent.onlineStatus ? "bg-green-100 text-green-700 border border-green-200" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"}`}
                  >
                    <FiCircle
                      className={`fill-current ${agent.onlineStatus ? "text-green-500" : "text-gray-400"}`}
                      size={8}
                    />
                    {agent.onlineStatus ? "Online" : "Offline"}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                  {agent.name || "Agent Name"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-1">
                  {agent.email}
                </p>

                <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-3 mb-5 flex items-center gap-2">
                  <span
                    className={`${agent.role === "superadmin" ? "text-purple-600" : "text-blue-600"}`}
                  >
                    {agent.role}
                  </span>
                </div>
              </div>

              {/* CRUD Controls (Disabled for Self to prevent lockout) */}
              {user?.uid !== agent.id ? (
                <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => handleUpdateRole(agent.id, agent.role)}
                    className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 py-2.5 rounded-xl transition-colors border border-gray-200 dark:border-gray-700"
                    title="Toggle Role"
                  >
                    <FiEdit2 size={16} /> Role
                  </button>
                  <button
                    onClick={() => handleDeleteAgent(agent.id)}
                    className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 py-2.5 rounded-xl transition-colors border border-red-100"
                    title="Revoke Access"
                  >
                    <FiTrash2 size={16} /> Remove
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
                  <p className="text-xs text-gray-400 font-medium">
                    Its You • Profile Managed in Settings
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
        {agents.length === 0 && (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 text-sm bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 border-dashed">
            No team members found.
          </div>
        )}
      </div>
    </div>
  );
}
