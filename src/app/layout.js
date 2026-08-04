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
        className="min-h-screen font-sans antialiased"
      >
        {children}
      </body>
    </html>
  );
}
