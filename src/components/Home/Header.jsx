import Link from "next/link";
import React from "react";

const Header = () => {
  return (
    <div className="flex flex-wrap justify-between items-end gap-4 relative pb-2">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#33ff9c] animate-pulse shadow-[0_0_8px_#33ff9c]" />
          <span className="text-[0.6rem] text-[#5a9a7a] tracking-[0.3em] uppercase font-mono">
            Model DPDC-X1 · Live
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-wide bg-gradient-to-r from-[#33ff9c] via-[#7de8b8] to-[#c9793c] bg-clip-text text-transparent">
          DPDC BALANCE
        </h1>
        <p className="text-[#5a6a63] text-xs md:text-sm mt-1.5 tracking-[0.1em] font-mono">
          prepaid meter reader // check taka remaining
        </p>
      </div>
      <Link href="/history">
        <button className="px-4 py-2.5 bg-[#0e1512] border border-[#c9793c]/25 rounded-lg text-xs text-[#c9793c] hover:bg-[#c9793c]/10 hover:border-[#c9793c]/50 transition-all tracking-[0.15em] font-mono uppercase">
          Log ▸
        </button>
      </Link>
    </div>
  );
};

export default Header;
