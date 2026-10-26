import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Auriga — 4-Hour Job Search Automation | Vipin V V",
  description:
    "Automated 4-hour job search navigator for Vipin V V (React.js / Frontend Developer). Tailored ATS resumes, ready-to-send emails, Dubai & India job tracking.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 min-h-screen relative antialiased selection:bg-indigo-500 selection:text-white pb-16 md:pb-0">
        {/* Subtle radial ambient background light glows */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[130px]" />
          <div className="absolute top-[30%] -right-[15%] w-[650px] h-[650px] rounded-full bg-cyan-600/8 blur-[150px]" />
          <div className="absolute -bottom-[20%] left-[20%] w-[700px] h-[700px] rounded-full bg-purple-600/8 blur-[160px]" />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
