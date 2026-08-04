"use client";

import { useState, useEffect, useRef } from "react";
import BillBarChart from "@/components/BarChart";
import Link from "next/link";

export default function Home() {
  const [customerNumber, setCustomerNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [animatedBalance, setAnimatedBalance] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Email subscription state
  const [email, setEmail] = useState("");
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState(null);
  const [subscribeError, setSubscribeError] = useState(null);
  const [showSubscribeForm, setShowSubscribeForm] = useState(false);

  // localStorage থেকে সাজেশন লোড
  useEffect(() => {
    const saved = localStorage.getItem("dpdc_searched_ids");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSuggestions(parsed.slice(0, 5));
        if (parsed.length > 0) {
          setCustomerNumber(parsed[0]);
        }
      } catch (e) {
        console.error("Failed to load suggestions", e);
      }
    }
  }, []);

  const updateSuggestions = (newId) => {
    if (!newId.trim()) return;
    const updated = [
      newId.trim(),
      ...suggestions.filter((id) => id !== newId.trim()),
    ];
    const limited = updated.slice(0, 5);
    setSuggestions(limited);
    localStorage.setItem("dpdc_searched_ids", JSON.stringify(limited));
  };

  const fetchHistory = async (number) => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await fetch(`/api/history?customerNumber=${number}`);
      const result = await res.json();
      if (res.ok) {
        setHistory(result.history || []);
        if (result.error) setHistoryError(result.error);
      } else {
        setHistoryError(result.error || "Failed to fetch history");
        setHistory([]);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
      setHistoryError("Network error fetching history");
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (customerNumber.trim()) {
      fetchHistory(customerNumber.trim());
    }
  }, []);

  const fetchBalance = async (e) => {
    e.preventDefault();
    const trimmed = customerNumber.trim();
    if (!trimmed) {
      setError("Please enter a customer number");
      return;
    }

    updateSuggestions(trimmed);

    setLoading(true);
    setError(null);
    setData(null);
    setAnimatedBalance(0);
    setIsAnimating(false);

    try {
      const res = await fetch("/api/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerNumber: trimmed }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Something went wrong");
      if (result.data) {
        setData(result.data);
        await fetchHistory(trimmed);
      } else {
        throw new Error("No data received");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim() || !customerNumber.trim()) {
      setSubscribeError("Please enter both customer number and email");
      return;
    }

    setSubscribeLoading(true);
    setSubscribeError(null);
    setSubscribeMessage(null);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerNumber: customerNumber.trim(),
          email: email.trim(),
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Subscription failed");
      }

      setSubscribeMessage(result.message);
      setSubscribeError(null);
      setEmail("");
      setTimeout(() => setSubscribeMessage(null), 5000);
    } catch (err) {
      setSubscribeError(err.message);
      setSubscribeMessage(null);
    } finally {
      setSubscribeLoading(false);
    }
  };

  // Balance animation
  useEffect(() => {
    if (data && !isAnimating) {
      const target = parseFloat(data.balanceRemaining);
      if (!isNaN(target)) {
        setIsAnimating(true);
        let start = 0;
        const duration = 1200;
        const startTime = Date.now();

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 2);
          const current = start + (target - start) * eased;
          setAnimatedBalance(current);

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setAnimatedBalance(target);
            setIsAnimating(false);
          }
        };
        animate();
      }
    }
  }, [data]);

  const formatBalance = (value) => {
    if (value === null || value === undefined) return "N/A";
    const num = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(num)) return value;
    return `৳ ${num.toFixed(2)}`;
  };

  const getBalanceColor = (value) => {
    const num = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(num)) return "text-gray-400";
    return num >= 100
      ? "text-green-400 drop-shadow-[0_0_20px_rgba(0,255,136,0.4)]"
      : "text-red-400 drop-shadow-[0_0_20px_rgba(255,0,68,0.4)]";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleString("en-US", options).replace(",", " at");
  };

  const fields = [
    { key: "customerName", label: "Customer Name" },
    { key: "customerClass", label: "Customer Class" },
    { key: "mobileNumber", label: "Mobile Number" },
    { key: "balanceRemaining", label: "Balance" },
    { key: "connectionStatus", label: "Status" },
  ];

  const selectSuggestion = (id) => {
    setCustomerNumber(id);
    setShowSuggestions(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#08080e] py-6 px-4 md:py-10">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-wider bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              DPDC BALANCE
            </h1>
            <p className="text-gray-500 text-xs md:text-sm mt-1 tracking-[0.2em]">
              ⚡ AUTO TOKEN • MONGODB HISTORY
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/history">
              <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/10 transition">
                📜 History
              </button>
            </Link>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-3xl p-5 md:p-8 shadow-2xl">
          <form
            onSubmit={fetchBalance}
            className="relative flex flex-col sm:flex-row gap-4"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={customerNumber}
                onChange={(e) => {
                  setCustomerNumber(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onFocus={() => setShowSuggestions(suggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Enter customer number"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder:text-gray-500 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition"
                disabled={loading}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl z-10 max-h-48 overflow-y-auto">
                  {suggestions.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => selectSuggestion(id)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 transition"
                    >
                      {id}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-bold text-white tracking-wider hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,212,255,0.3)] transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "SCANNING..." : "🔍 SEARCH"}
            </button>
          </form>

          {loading && (
            <div className="flex flex-col items-center py-10">
              <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
              <p className="mt-4 text-cyan-400 text-xs tracking-[0.2em] animate-pulse">
                FETCHING DATA
              </p>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-center text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Data Display */}
          {data && (
            <div className="mt-6 space-y-6 animate-fadeIn">
              <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-purple-500/10 border border-cyan-500/20 rounded-3xl p-6 md:p-8 text-center backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                <p className="text-gray-400 text-xs tracking-[0.3em] uppercase relative z-10">
                  Available Balance
                </p>
                <p
                  className={`text-5xl md:text-7xl font-bold relative z-10 mt-1 transition-all duration-300 ${getBalanceColor(animatedBalance)}`}
                >
                  {formatBalance(animatedBalance)}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map(({ key, label }) => {
                  if (key === "balanceRemaining") return null;
                  const value = data[key];
                  if (key === "connectionStatus") {
                    return (
                      <div
                        key={key}
                        className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition"
                      >
                        <span className="text-gray-400 text-xs uppercase tracking-wider">
                          {label}
                        </span>
                        <span
                          className={`px-4 py-1 rounded-full text-xs font-semibold ${
                            value?.toLowerCase() === "active"
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {value || "N/A"}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={key}
                      className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-4 hover:bg-white/10 transition"
                    >
                      <span className="text-gray-400 text-xs uppercase tracking-wider">
                        {label}
                      </span>
                      <p className="text-white font-medium mt-1 text-sm md:text-base">
                        {value || "N/A"}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={fetchBalance}
                  disabled={loading}
                  className="text-xs text-gray-500 hover:text-cyan-400 transition tracking-[0.15em] disabled:opacity-40"
                >
                  ⟳ REFRESH
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Subscription Section */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-3xl p-5 md:p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-cyan-400 mb-4 tracking-wider">
            📧 Weekly Email Report
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Get your DPDC bill update every Friday via email.
          </p>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target;
              const email = form.email.value;
              const number = form.customerNumber.value;

              if (!number || !email) {
                alert("Please fill in both fields");
                return;
              }

              setLoading(true);
              try {
                const res = await fetch("/api/subscribe", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ customerNumber: number, email }),
                });
                const result = await res.json();
                if (res.ok) {
                  alert(result.message || "Subscription successful!");
                  form.reset();
                } else {
                  alert(result.error || "Subscription failed");
                }
              } catch (err) {
                alert("Network error. Please try again.");
              } finally {
                setLoading(false);
              }
            }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <input
              type="text"
              name="customerNumber"
              placeholder="Customer Number"
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder:text-gray-500 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder:text-gray-500 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-bold text-white tracking-wider hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition"
              disabled={loading}
            >
              {loading ? "SUBMITTING..." : "📧 SUBSCRIBE"}
            </button>
          </form>
        </div>
        {/* History & Chart */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-3xl p-5 md:p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-cyan-400 mb-4 tracking-wider">
            📊 Bill History & Chart
          </h2>

          {historyLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
            </div>
          ) : historyError ? (
            <div className="text-center py-8">
              <div className="text-yellow-400 text-sm mb-2">
                ⚠️ {historyError}
              </div>
              <p className="text-gray-500 text-xs">
                History may be unavailable
              </p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              No history found. Check a bill to start saving.
            </div>
          ) : (
            <>
              <div className="mb-8">
                <BillBarChart data={history} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-3 text-gray-400 font-medium tracking-wider">
                        Date & Time
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
                        <td className="py-3 px-3 text-gray-300 text-sm">
                          {formatDate(item.checkedAt)}
                        </td>
                        <td
                          className={`py-3 px-3 text-right font-semibold ${
                            item.balance >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          ৳ {item.balance.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <footer className="text-center text-[0.55rem] text-gray-600 tracking-[0.2em] pt-4 border-t border-white/5">
          Developer Mursalin Hossain • DPDC BALANCE v1.0
        </footer>
      </div>
    </main>
  );
}
