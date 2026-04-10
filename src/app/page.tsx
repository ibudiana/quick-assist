"use client";

// import Image from "next/image";
import { ChatWidget } from "@/features/chat/components/ChatWidget";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 sm:p-20 font-(family-name:--font-geist-sans) text-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <main className="z-10 flex flex-col items-center gap-8 max-w-3xl">
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
          Next-Gen{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">
            Customer Support
          </span>
        </h1>
        <p className="text-xl sm:text-2xl text-gray-600 max-w-2xl">
          Engage with your customers in real-time. Boost satisfaction and
          resolve issues faster with Quick Assist.
        </p>

        <div className="flex gap-4 items-center flex-col sm:flex-row mt-8">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white gap-2 hover:bg-blue-700 text-sm sm:text-base h-12 px-8 font-medium shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1 transform duration-200"
            href="#chat"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              // Trigger the widget using click on the default widget button (id hack or simple interaction hint)
              alert(
                "Click the blue message icon at the bottom right to start chatting!",
              );
            }}
          >
            Try the Chat Widget 👇
          </a>
          <a
            className="rounded-full border border-solid border-gray-200 bg-white transition-colors flex items-center justify-center hover:bg-gray-50 text-gray-900 text-sm sm:text-base h-12 px-8 font-medium shadow-sm hover:shadow-md hover:-translate-y-1 transform duration-200"
            href="/admin/login"
            rel="noopener noreferrer"
          >
            Go to Admin Dashboard
          </a>
        </div>
      </main>

      <footer className="absolute bottom-6 flex gap-6 items-center flex-wrap justify-center text-sm text-gray-500 z-10">
        Building blocks for real-time web support with Next.js and Firebase.
      </footer>

      <ChatWidget />
    </div>
  );
}
