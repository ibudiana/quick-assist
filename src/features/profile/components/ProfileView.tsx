"use client";

import { useProfileSettings } from "../hooks/useProfileSettings";
import { FiSettings, FiUser, FiLock } from "react-icons/fi";

export function ProfileView() {
  const {
      userProfile,
      profileNameInput, setProfileNameInput,
      profilePasswordInput, setProfilePasswordInput,
      profileUpdateMsg, isUpdating,
      updateProfile
  } = useProfileSettings();

  return (
    <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-800 p-6 flex flex-col items-center">
        <div className="w-full max-w-2xl mt-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    <FiSettings className="text-blue-600" /> Account Settings
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your personal profile and security</p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                        <FiUser size={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{userProfile?.name || 'Agent'}</h2>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{userProfile?.email}</p>
                        <span className="inline-block mt-2 text-[10px] font-bold tracking-wider text-blue-700 bg-blue-100 px-2.5 py-1 rounded uppercase">
                            {userProfile?.role || 'User'}
                        </span>
                    </div>
                </div>

                <div className="p-8">
                    {profileUpdateMsg.text && (
                        <div className={`p-4 rounded-xl text-sm font-medium mb-6 flex items-center gap-2 border ${
                            profileUpdateMsg.type === 'error' ? 'bg-red-50 text-red-700 border-red-100' : 
                            profileUpdateMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 
                            'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                            {profileUpdateMsg.type === 'error' ? '⚠️' : profileUpdateMsg.type === 'success' ? '✅' : '⏳'}
                            {profileUpdateMsg.text}
                        </div>
                    )}

                    <form onSubmit={updateProfile} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Display Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <FiUser />
                                </div>
                                <input
                                    type="text"
                                    value={profileNameInput}
                                    onChange={(e) => setProfileNameInput(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all text-black dark:text-white font-medium"
                                    placeholder="Your Full Name"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">New Password (Optional)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <FiLock />
                                </div>
                                <input
                                    type="password"
                                    value={profilePasswordInput}
                                    onChange={(e) => setProfilePasswordInput(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all text-black dark:text-white"
                                    placeholder="Leave blank to keep current password"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-2 ml-1">Must be at least 6 characters long.</p>
                        </div>

                        <div className="pt-4 mt-8 border-t border-gray-100 dark:border-gray-700">
                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="w-full sm:w-auto float-right bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-xl transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUpdating ? "Saving Changes..." : "Save Changes"}
                            </button>
                            <div className="clear-both"></div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
  );
}
