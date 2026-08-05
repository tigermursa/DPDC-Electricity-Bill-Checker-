"use client";

import { useState, useEffect, useRef } from "react";
import BillBarChart from "@/components/BarChart";
import Link from "next/link";
import Toast from "@/components/Toast";
import Header from "@/components/Home/Header";
import Footer from "@/components/Home/Footer";

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

  const [email, setEmail] = useState("");
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState(null);
  const [subscribeError, setSubscribeError] = useState(null);
  const [showSubscribeForm, setShowSubscribeForm] = useState(false);
  const [toast, setToast] = useState(null);

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
    if (isNaN(num)) return "text-gray-500";
    return num >= 100
      ? "text-[#33ff9c] drop-shadow-[0_0_18px_rgba(51,255,156,0.55)]"
      : "text-[#ff5555] drop-shadow-[0_0_18px_rgba(255,85,85,0.55)]";
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
    <main className="min-h-screen bg-[#070b0a] py-6 px-4 md:py-12 relative overflow-hidden">
      {/* circuit dot texture */}
      <div
        className="fixed inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(201,121,60,0.08) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="fixed top-0 left-1/3 w-96 h-96 bg-[#33ff9c]/[0.04] rounded-full blur-[130px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-[#c9793c]/[0.05] rounded-full blur-[130px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 relative z-10">
        <Header />

        {/* Search Section */}
        <div className="bg-[#0e1512]/80 backdrop-blur-xl border border-[#c9793c]/10 rounded-3xl p-5 md:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
          <label className="block text-[0.65rem] text-[#5a9a7a] tracking-[0.25em] uppercase font-mono mb-2">
            Meter Number
          </label>
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
                placeholder="e.g. 1234567"
                className="w-full bg-[#050807] border border-[#c9793c]/20 rounded-xl px-5 py-3.5 text-[#d8ffe8] font-mono tracking-wider placeholder:text-[#3a453f] outline-none focus:border-[#33ff9c]/50 focus:ring-2 focus:ring-[#33ff9c]/10 transition-all"
                disabled={loading}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0e1512] border border-[#c9793c]/20 rounded-xl shadow-2xl z-10 max-h-48 overflow-y-auto">
                  {suggestions.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => selectSuggestion(id)}
                      className="w-full text-left px-4 py-2.5 text-sm text-[#9aab9f] hover:bg-[#33ff9c]/10 hover:text-[#33ff9c] transition-colors font-mono"
                    >
                      {id}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="px-8 py-3.5 bg-gradient-to-r from-[#c9793c] to-[#a85e28] rounded-xl font-bold text-[#0a0806] tracking-wider hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(201,121,60,0.4)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
              disabled={loading}
            >
              {loading ? "READING..." : "READ METER"}
            </button>
          </form>

          {loading && (
            <div className="flex flex-col items-center py-12">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-4 border-[#33ff9c]/10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-[#33ff9c] rounded-full animate-spin"></div>
              </div>
              <p className="mt-4 text-[#33ff9c] text-xs tracking-[0.25em] font-mono animate-pulse">
                CONNECTING TO GRID
              </p>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-[#2a0d0d] border border-[#ff4d4d]/25 rounded-xl text-[#ff8080] text-center text-sm font-mono">
              ⚠ {error}
            </div>
          )}

          {/* Meter faceplate */}
          {data && (
            <div className="mt-6 space-y-6 animate-fadeIn">
              <div className="relative rounded-[28px] p-[3px] bg-gradient-to-b from-[#3a2a1a] via-[#1a1410] to-[#0a0806] shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                <div className="relative rounded-[25px] bg-gradient-to-b from-[#141110] to-[#0a0908] p-6 md:p-8 overflow-hidden">
                  <span className="absolute top-3 left-3 w-2 h-2 rounded-full bg-[#3a2f24] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]"></span>
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#3a2f24] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]"></span>
                  <span className="absolute bottom-3 left-3 w-2 h-2 rounded-full bg-[#3a2f24] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]"></span>
                  <span className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-[#3a2f24] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]"></span>

                  <div className="flex items-center justify-between text-[0.6rem] text-[#8a7a5a] tracking-[0.2em] mb-4 font-mono uppercase">
                    <span>DPDC · Prepaid</span>
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          data.connectionStatus?.toLowerCase() === "active"
                            ? "bg-[#33ff9c] animate-pulse shadow-[0_0_8px_#33ff9c]"
                            : "bg-[#ff4d4d]"
                        }`}
                      />
                      {data.connectionStatus || "N/A"}
                    </span>
                  </div>

                  <div className="relative rounded-xl bg-[#03100b] border border-[#0f2a1e] px-4 py-8 md:py-10 overflow-hidden">
                    <div
                      className="absolute inset-0 opacity-[0.12] pointer-events-none"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 3px)",
                      }}
                    ></div>
                    <p className="text-center text-[0.6rem] text-[#2f7a55] tracking-[0.4em] uppercase font-mono mb-2 relative z-10">
                      Available Balance
                    </p>
                    <p
                      className={`text-center font-mono font-bold text-5xl md:text-7xl tracking-wide relative z-10 transition-all duration-300 ${getBalanceColor(animatedBalance)}`}
                    >
                      {formatBalance(animatedBalance)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map(({ key, label }) => {
                  if (key === "balanceRemaining" || key === "connectionStatus")
                    return null;
                  const value = data[key];
                  return (
                    <div
                      key={key}
                      className="bg-[#0e1512]/60 border border-[#c9793c]/10 rounded-xl p-4 hover:bg-[#0e1512] hover:border-[#c9793c]/25 transition-all"
                    >
                      <span className="text-[#5a6a63] text-xs uppercase tracking-wider font-mono">
                        {label}
                      </span>
                      <p className="text-[#d8e8dc] font-medium mt-1 text-sm md:text-base">
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
                  className="text-xs text-[#5a6a63] hover:text-[#33ff9c] transition tracking-[0.15em] disabled:opacity-40 font-mono"
                >
                  ⟳ REFRESH
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Subscription Section */}
        <div className="bg-[#0e1512]/80 backdrop-blur-xl border border-[#c9793c]/10 rounded-3xl p-5 md:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
          <h2 className="text-lg font-bold text-[#c9793c] mb-1.5 tracking-wider font-mono uppercase">
            ⚡ Weekly Alert Relay
          </h2>
          <p className="text-[#5a6a63] text-sm mb-5">
            Get your balance reading every Friday, delivered to your inbox.
          </p>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target;
              const email = form.email.value;
              const number = form.customerNumber.value;

              if (!number || !email) {
                setToast({
                  message: "Please fill in both fields",
                  type: "error",
                });
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
                  setToast({
                    message: result.message || "Subscription successful! ✅",
                    type: "success",
                  });
                  form.reset();
                } else {
                  setToast({
                    message: result.error || "Subscription failed",
                    type: "error",
                  });
                }
              } catch (err) {
                setToast({
                  message: "Network error. Please try again.",
                  type: "error",
                });
              } finally {
                setLoading(false);
              }
            }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <input
              type="text"
              name="customerNumber"
              placeholder="Meter Number"
              className="flex-1 bg-[#050807] border border-[#c9793c]/20 rounded-xl px-5 py-3 text-[#d8ffe8] font-mono placeholder:text-[#3a453f] outline-none focus:border-[#33ff9c]/50 focus:ring-2 focus:ring-[#33ff9c]/10 transition-all"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              className="flex-1 bg-[#050807] border border-[#c9793c]/20 rounded-xl px-5 py-3 text-[#d8ffe8] font-mono placeholder:text-[#3a453f] outline-none focus:border-[#33ff9c]/50 focus:ring-2 focus:ring-[#33ff9c]/10 transition-all"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-[#c9793c] to-[#a85e28] rounded-xl font-bold text-[#0a0806] tracking-wider hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(201,121,60,0.35)] active:scale-[0.98] transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "SAVING..." : "SUBSCRIBE"}
            </button>
          </form>
        </div>

        {/* History & Chart */}
        <div className="bg-[#0e1512]/80 backdrop-blur-xl border border-[#c9793c]/10 rounded-3xl p-5 md:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
          <h2 className="text-lg font-bold text-[#c9793c] mb-4 tracking-wider font-mono uppercase">
            ▤ Reading Log
          </h2>

          {historyLoading ? (
            <div className="flex justify-center py-12">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 border-4 border-[#33ff9c]/10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-[#33ff9c] rounded-full animate-spin"></div>
              </div>
            </div>
          ) : historyError ? (
            <div className="text-center py-8">
              <div className="text-[#ffb020] text-sm mb-2 font-mono">
                ⚠ {historyError}
              </div>
              <p className="text-[#5a6a63] text-xs">
                Log may be unavailable right now.
              </p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-[#5a6a63] text-sm font-mono">
              No readings yet. Look up a meter to start logging.
            </div>
          ) : (
            <>
              <div className="mb-8">
                <BillBarChart data={history} />
              </div>
              <div className="overflow-x-auto rounded-xl border border-[#c9793c]/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#c9793c]/10 bg-[#050807]">
                      <th className="text-left py-3 px-4 text-[#5a6a63] font-medium tracking-wider font-mono uppercase text-xs">
                        Date & Time
                      </th>
                      <th className="text-right py-3 px-4 text-[#5a6a63] font-medium tracking-wider font-mono uppercase text-xs">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr
                        key={item._id}
                        className="border-b border-[#c9793c]/5 hover:bg-[#c9793c]/5 transition-colors"
                      >
                        <td className="py-3 px-4 text-[#9aab9f] text-sm font-mono">
                          {formatDate(item.checkedAt)}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-semibold font-mono ${
                            item.balance >= 0
                              ? "text-[#33ff9c]"
                              : "text-[#ff5555]"
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
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <Footer />
      </div>
    </main>
  );
}
