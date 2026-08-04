// components/Toast.js

"use client";

import { useEffect, useState } from "react";

export default function Toast({
  message,
  type = "success",
  duration = 3000,
  onClose,
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const bgColor =
    type === "success"
      ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30"
      : type === "error"
        ? "bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-500/30"
        : "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30";

  const iconColor =
    type === "success"
      ? "text-green-400"
      : type === "error"
        ? "text-red-400"
        : "text-blue-400";

  const icon = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 max-w-md w-full animate-slideUp`}
    >
      <div
        className={`backdrop-blur-xl border ${bgColor} rounded-2xl px-5 py-4 shadow-2xl shadow-black/50 flex items-start gap-3`}
      >
        <span className={`text-xl ${iconColor}`}>{icon}</span>
        <div className="flex-1">
          <p className="text-white text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={() => {
            setVisible(false);
            if (onClose) setTimeout(onClose, 300);
          }}
          className="text-gray-500 hover:text-gray-300 transition"
        >
          ✕
        </button>
      </div>
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}
