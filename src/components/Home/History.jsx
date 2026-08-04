import React, { useState } from "react";
import BillBarChart from "../BarChart";

const History = () => {
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

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
  return (
    <div>
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
            <p className="text-gray-500 text-xs">History may be unavailable</p>
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
                          item.balance >= 0 ? "text-green-400" : "text-red-400"
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
    </div>
  );
};

export default History;
