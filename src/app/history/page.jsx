"use client";

import { useState } from "react";
import Link from "next/link";

export default function HistoryPage() {
  const [customerNumber, setCustomerNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const fetchHistory = async (e) => {
    e.preventDefault();
    if (!customerNumber.trim()) {
      setError("Please enter a customer number");
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(false);

    try {
      const res = await fetch(
        `/api/history?customerNumber=${customerNumber.trim()}`,
      );
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to fetch history");
      }

      setHistory(result.history || []);
      setSearched(true);

      if (result.history?.length === 0) {
        setError("No history found for this customer");
      }
    } catch (err) {
      setError(err.message);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleString("en-US", options);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#08080e] py-6 px-4 md:py-10">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-3xl p-5 md:p-8 shadow-2xl">
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

          <form
            onSubmit={fetchHistory}
            className="flex flex-col sm:flex-row gap-4 mb-8"
          >
            <input
              type="text"
              value={customerNumber}
              onChange={(e) => setCustomerNumber(e.target.value)}
              placeholder="Enter customer number"
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder:text-gray-500 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition"
              disabled={loading}
            />
            <button
              type="submit"
              className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-bold text-white tracking-wider hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,212,255,0.3)] transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "LOADING..." : "🔍 SEARCH"}
            </button>
          </form>

          {loading && (
            <div className="flex justify-center py-10">
              <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
            </div>
          )}

          {error && (
            <div
              className={`text-center py-10 text-sm ${searched ? "text-yellow-400" : "text-red-400"}`}
            >
              {error}
            </div>
          )}

          {history.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-3 text-gray-400 font-medium tracking-wider">
                      Date & Time
                    </th>
                    <th className="text-left py-3 px-3 text-gray-400 font-medium tracking-wider">
                      Customer Name
                    </th>
                    <th className="text-right py-3 px-3 text-gray-400 font-medium tracking-wider">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b border-white/5 hover:bg-white/5 transition"
                    >
                      <td className="py-3 px-3 text-gray-300">
                        {formatDate(item.checkedAt)}
                      </td>
                      <td className="py-3 px-3 text-gray-300">
                        {item.customerName || "N/A"}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-semibold ${item.balance >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        ৳ {item.balance.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
