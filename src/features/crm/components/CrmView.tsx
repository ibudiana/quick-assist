"use client";

import { useSubscribers } from "../hooks/useSubscribers";
import { FiMail, FiShield, FiSend, FiUsers } from "react-icons/fi";

export function CrmView() {
  const {
    subscribers,
    isSuperadmin,
    campaignSubject,
    setCampaignSubject,
    campaignBody,
    setCampaignBody,
    isSendingCampaign,
    campaignMsg,
    sendCampaign,
  } = useSubscribers();

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
    <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-800 p-6 flex flex-col md:flex-row gap-6 w-full">
      {/* Subscribers List Panel */}
      <div className="w-full md:w-1/3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden shrink-0 h-100 md:h-auto">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 shrink-0">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FiUsers className="text-blue-600" /> Subscribers
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Opted-in from Chat
            </p>
          </div>
          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
            {subscribers.length} Total
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {subscribers.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
              <FiUsers size={32} className="mb-3 opacity-20" />
              <p className="text-sm">No subscribers found yet.</p>
            </div>
          ) : (
            subscribers.map((sub) => (
              <div
                key={sub.id}
                className="bg-white dark:bg-gray-900 p-3.5 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 shadow-xs transition-colors group"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {sub.name}
                  </span>
                </div>
                <p className="text-sm border-blue-100 text-blue-600 my-1 font-medium flex items-center gap-1.5 bg-blue-50/50 p-1.5 rounded-md w-fit">
                  <FiMail size={12} /> {sub.email}
                </p>
                <p className="text-[10px] text-gray-400 mt-2 font-medium">
                  Joined:{" "}
                  {sub.subscribedAt
                    ? new Date(sub.subscribedAt).toLocaleDateString()
                    : "Unknown"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Campaign Composer Panel */}
      <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shrink-0">
          <h2 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FiSend className="text-blue-600" /> Broadcast Campaign
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Send an email blast or promo to your audience
          </p>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {campaignMsg.text && (
            <div
              className={`p-4 rounded-xl text-sm font-medium mb-6 flex items-center gap-2 border ${
                campaignMsg.type === "error"
                  ? "bg-red-50 text-red-700 border-red-100"
                  : campaignMsg.type === "success"
                    ? "bg-green-50 text-green-700 border-green-100"
                    : "bg-blue-50 text-blue-700 border-blue-100"
              }`}
            >
              {campaignMsg.type === "error"
                ? "⚠️"
                : campaignMsg.type === "success"
                  ? "✅"
                  : "⏳"}
              {campaignMsg.text}
            </div>
          )}

          <form
            onSubmit={sendCampaign}
            className="flex flex-col h-full space-y-5"
          >
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Subject Line
              </label>
              <input
                type="text"
                required
                value={campaignSubject}
                onChange={(e) => setCampaignSubject(e.target.value)}
                placeholder="Special Offer for loyal customers!"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all text-black dark:text-white font-medium"
              />
            </div>

            <div className="flex-1 flex flex-col min-h-62.5">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Message Body
              </label>
              <textarea
                required
                value={campaignBody}
                onChange={(e) => setCampaignBody(e.target.value)}
                placeholder="Hi there! We are excited to announce..."
                className="w-full flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all text-black dark:text-white resize-none"
              ></textarea>
              <p className="text-xs text-gray-400 mt-2 text-right">
                Markdown formatting supported (simulated)
              </p>
            </div>

            <div className="pt-2 shrink-0">
              <button
                type="submit"
                disabled={isSendingCampaign || subscribers.length === 0}
                className="w-full md:w-auto md:min-w-50 float-right bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FiSend />{" "}
                {isSendingCampaign ? "Sending..." : "Blast to All Subscribers"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
