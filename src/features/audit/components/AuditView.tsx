"use client";

import { useAuditLogs } from "../hooks/useAuditLogs";
import { FiList, FiUser, FiShield } from "react-icons/fi";

export function AuditView() {
  const { auditLogs, isSuperadmin } = useAuditLogs();

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

  return (
    <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-800 p-6 flex flex-col w-full">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <FiList className="text-blue-600" /> Audit Logs
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            System & Access History
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm">
          Total Events: {auditLogs.length}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full pr-2 space-y-4">
        {auditLogs.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 text-sm bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 border-dashed">
            No audit logs found.
          </div>
        ) : (
          auditLogs.map((log) => (
            <div
              key={log.id}
              className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gray-200 group-hover:bg-blue-400 transition-colors"></div>

              <div className="pl-3 flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md uppercase border border-blue-100">
                    {log.action}
                  </span>
                  <span className="text-sm text-gray-400 font-medium whitespace-nowrap">
                    {log.timestamp
                      ? new Date(log.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                  {log.details}
                </p>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-col md:items-end gap-1 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 pt-3 md:pt-0 md:pl-6 shrink-0 md:min-w-50">
                <div className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                  <FiUser size={12} className="text-gray-400" />{" "}
                  {log.performedBy?.email || "System"}
                </div>
                <div className="text-gray-400">
                  Role: {log.performedBy?.role || "System"}
                </div>
                <div className="text-gray-400 mt-1">
                  {log.timestamp
                    ? new Date(log.timestamp).toLocaleDateString()
                    : ""}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
