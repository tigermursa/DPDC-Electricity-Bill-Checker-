import Link from "next/link";
import React from "react";

const Header = () => {
  return (
    <div className="flex flex-wrap justify-between items-center gap-4">
      <div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-wider bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          DPDC BALANCE
        </h1>
        <p className="text-gray-500 text-xs md:text-sm mt-1 tracking-[0.2em]">
          ⚡Monitor your DPDC electricity balance
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
  );
};

export default Header;
