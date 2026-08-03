import "./globals.css";

export const metadata = {
  title: "DPDC Balance Viewer",
  description: "Next-gen DPDC balance checker with auto-refresh and history",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#0a0a0f] text-gray-200 font-sans antialiased"
      >
        {children}
      </body>
    </html>
  );
}
