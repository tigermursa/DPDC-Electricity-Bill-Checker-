// app/history/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("bill_history") || "[]");
    setHistory(stored.reverse());
  }, []);

  const clearHistory = () => {
    if (confirm("Clear all bill history?")) {
      localStorage.removeItem("bill_history");
      setHistory([]);
    }
  };

  return (
    <main className="min-h-screen bg-[#08080e] py-8 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            📜 Bill History
          </h1>
          <Link href="/">
            <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/10 transition">
              ← Back
            </button>
          </Link>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 opacity-10">📭</div>
            <p className="text-gray-500 text-sm tracking-[0.2em]">
              No bill history yet
            </p>
            <p className="text-gray-600 text-xs mt-2">
              Check a bill to save it here
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white/10 transition"
                >
                  <div>
                    <div className="text-xs text-gray-400">
                      {entry.date} • {entry.time}
                    </div>
                    <div className="text-sm text-gray-300">
                      {entry.customerName} ({entry.customerNumber})
                    </div>
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      entry.balance >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    ৳ {entry.balance.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={clearHistory}
                className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 hover:bg-red-500/20 transition"
              >
                🗑️ Clear All
              </button>
            </div>
          </>
        )}

        <footer className="mt-8 pt-6 border-t border-white/5 text-center text-[0.55rem] text-gray-600 tracking-[0.2em]">
          DPDC • HISTORY v1.0
        </footer>
      </div>
    </main>
  );
}
