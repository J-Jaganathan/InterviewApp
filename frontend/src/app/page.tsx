"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { clearAuthCookie } from "@/lib/auth";
import { Home, CheckCircle, FileText, BookOpen, Mic } from "lucide-react";

/* ---------------------- Inline SVG Icon Components ---------------------- */

const SearchIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#1a3bcc" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const LightbulbIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#1a3bcc" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const DatabaseIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#1a3bcc" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

const NetworkIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#1a3bcc" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

/* ---------------------------- Small Components --------------------------- */

function ProgressRing({ percentage }: { percentage: number }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 110, height: 110 }}>
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={radius} fill="none" stroke="#e8eeff" strokeWidth="10" />
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke="#1a3bcc"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 55 55)"
          style={{ transition: "stroke-dashoffset 1.5s ease" }}
          className="progress-ring-fill"
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-2xl font-bold text-gray-800">{percentage}%</span>
      </div>
    </div>
  );
}

function SidebarItem({
  icon,
  active = false,
  label,
  isMenuOpen,
}: {
  icon: React.ReactNode;
  active?: boolean;
  label: string;
  isMenuOpen: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 cursor-pointer transition-all duration-300 px-3 py-2 rounded-xl ${
        active ? "bg-white text-blue-700 shadow-md" : "text-blue-200 hover:bg-blue-600 hover:text-white"
      }`}
    >
      <div className="w-8 h-8 flex items-center justify-center">{icon}</div>
      {isMenuOpen && <span className="text-sm font-medium">{label}</span>}
    </div>
  );
}

function QuickStartItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100 transition-all duration-200 group">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">{icon}</div>
        <span className="text-sm font-semibold text-gray-700">{label}</span>
      </div>
      <div className="text-blue-400 group-hover:text-blue-600 transition-colors">
        <ChevronRightIcon />
      </div>
    </div>
  );
}

function InterviewIllustration() {
  return (
    <svg width="120" height="90" viewBox="0 0 120 90" fill="none">
      <rect x="10" y="65" width="100" height="6" rx="3" fill="#dbeafe" />
      <circle cx="30" cy="45" r="12" fill="#bfdbfe" />
      <circle cx="30" cy="32" r="8" fill="#93c5fd" />
      <rect x="18" y="44" width="24" height="20" rx="12" fill="#bfdbfe" />
      <circle cx="85" cy="45" r="12" fill="#fde68a" />
      <circle cx="85" cy="32" r="8" fill="#fbbf24" />
      <rect x="73" y="44" width="24" height="20" rx="12" fill="#fde68a" />
      <rect x="38" y="20" width="40" height="18" rx="8" fill="#1a3bcc" />
      <polygon points="42,38 38,44 50,38" fill="#1a3bcc" />
      <rect x="43" y="25" width="24" height="3" rx="1.5" fill="white" opacity="0.7" />
      <rect x="43" y="31" width="16" height="3" rx="1.5" fill="white" opacity="0.5" />
    </svg>
  );
}

/* ------------------------------ Main Page ------------------------------- */


export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Example state (your actual values)
  const [progress] = useState(75);
  const [sessionsCompleted] = useState(12);
  const [totalSessions] = useState(20);
  const [avgScore] = useState(86);

  useEffect(() => setIsLoaded(true), []);

  const goToInterview = () => router.push("/interview");
  
  const logout = () => {
    clearAuthCookie();
    router.push("/login");


    useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn')
 
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [router])
 
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    router.push('/login')
  }
 
  return (
    <div>
      <h2>Welcome to Dashboard 🎉</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
  };

  const navItems = [
    { id: "home", icon: <Home size={18} strokeWidth={2} />, label: "Dashboard", href: "/" },
    { id: "progress", icon: <CheckCircle size={18} strokeWidth={2} />, label: "Progress", href: "/progress" },
    { id: "resources", icon: <FileText size={18} strokeWidth={2} />, label: "Resources", href: "/resources" },
    { id: "study", icon: <BookOpen size={18} strokeWidth={2} />, label: "Study Plan", href: "/study-plan" },
    { id: "interview", icon: <Mic size={18} strokeWidth={2} />, label: "Mock Interview", href: "/interview" },
  ];

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col py-6 gap-6 transition-all duration-300 ${
          isMenuOpen ? "w-56 px-4" : "w-20 items-center"
        }`}
        style={{ background: "linear-gradient(180deg, #1a3bcc 0%, #1430a8 100%)" }}
      >
        {/* Hamburger Button */}
        <div
          className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg mb-2 cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="text-blue-700 text-xl font-bold">{isMenuOpen ? "✕" : "☰"}</span>
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col gap-3 flex-1 w-full">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <button key={item.id} onClick={() => router.push(item.href)} className="text-left w-full">
                <SidebarItem icon={item.icon} active={active} label={item.label} isMenuOpen={isMenuOpen} />
              </button>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="flex flex-col gap-2 mb-4 w-full px-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-300 border-2 border-white" />
            {isMenuOpen && <span className="text-white text-sm font-medium">User</span>}
          </div>
          <button onClick={logout} className="text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg py-2">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-blue-50 px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="flex-1 flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-2">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none text-sm text-gray-500 w-full placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Bell */}
            <div className="relative cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-gray-500 hover:bg-blue-50 transition-colors">
                <BellIcon />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">3</span>
              </div>
            </div>

            {/* User */}
            <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 rounded-xl px-3 py-2 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow">
                JD
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">John Doe</p>
                <p className="text-xs text-gray-400">Software Engineer</p>
              </div>
              <ChevronDownIcon />
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Welcome */}
          <div className={`mb-8 transition-all duration-500 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <h1 className="text-3xl font-extrabold text-gray-900">Welcome, John! 👋</h1>
            <p className="text-gray-500 mt-1 text-base">Let&apos;s prepare for your next interview</p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-3 gap-6">
            {/* Your Progress */}
            <div
              className={`bg-white rounded-2xl p-6 shadow-sm border border-blue-50 transition-all duration-500 delay-100 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <h3 className="font-bold text-gray-800 text-lg mb-5">Your Progress</h3>
              <div className="flex flex-col items-center gap-2">
                <ProgressRing percentage={progress} />
                <p className="text-gray-400 text-sm font-medium mt-2">Completed</p>
                <div className="w-full mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-blue-700">{sessionsCompleted}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Sessions Done</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-blue-700">{avgScore}%</p>
                    <p className="text-xs text-gray-400 mt-0.5">Avg Score</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Interview */}
            <div
              className={`bg-white rounded-2xl p-6 shadow-sm border border-blue-50 transition-all duration-500 delay-200 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <h3 className="font-bold text-gray-800 text-lg mb-5">Upcoming Interview</h3>
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <CalendarIcon />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-gray-900">Google</p>
                    <p className="text-sm text-gray-400 mt-0.5">• Software Engineer</p>
                  </div>
                </div>

                <div className="w-full bg-blue-50 rounded-xl py-4 px-6 text-center">
                  <p className="text-lg font-bold text-gray-800">In 5 Days</p>
                </div>

                <button
                  onClick={goToInterview}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-3 transition-colors text-sm"
                >
                  Start Practice Session
                </button>
              </div>
            </div>

            {/* Quick Start */}
            <div
              className={`bg-white rounded-2xl p-6 shadow-sm border border-blue-50 transition-all duration-500 delay-300 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <h3 className="font-bold text-gray-800 text-lg mb-2">Quick Start</h3>
              <div className="flex justify-center my-3 opacity-80">
                <svg width="100" height="70" viewBox="0 0 100 70" fill="none">
                  <rect x="20" y="30" width="60" height="35" rx="4" fill="#dbeafe" />
                  <rect x="50" y="38" width="22" height="3" rx="1.5" fill="#bfdbfe" />
                  <rect x="50" y="44" width="16" height="3" rx="1.5" fill="#bfdbfe" />
                  <rect x="50" y="50" width="20" height="3" rx="1.5" fill="#bfdbfe" />
                  <circle cx="35" cy="46" r="10" fill="#1a3bcc" />
                  <circle cx="35" cy="42" r="4" fill="#bfdbfe" />
                  <rect x="28" y="47" width="14" height="8" rx="8" fill="#bfdbfe" />
                </svg>
              </div>
              <p className="text-xs text-gray-400 mb-4 text-center">Jump into a practice session</p>
              <div className="flex flex-col gap-2">
                <QuickStartItem icon={<LightbulbIcon />} label="Aptitude" />
                <QuickStartItem icon={<DatabaseIcon />} label="DSA" />
                <QuickStartItem icon={<NetworkIcon />} label="System Design" />
              </div>
            </div>

            {/* Mock Interview Prep - full width bottom */}
            <div
              className={`col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-blue-50 transition-all duration-500 delay-400 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >

              <h3 className="font-bold text-gray-800 text-lg mb-4">Mock Interview Prep</h3>
              <div className="flex items-center gap-8">
                {/* Illustration */}
                <div className="flex-shrink-0">
                  <InterviewIllustration />
                </div>

                {/* Stats */}
                <div className="flex-1 flex items-center gap-8">
                  <div>
                    <p className="text-3xl font-extrabold text-gray-900">
                      {sessionsCompleted}/{totalSessions}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Sessions completed</p>
                  </div>
                  <div className="w-px h-12 bg-gray-100" />
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Average Score
                    </p>
                    <p className="text-3xl font-extrabold text-blue-600">{avgScore}%</p>
                  </div>
                  <div className="w-px h-12 bg-gray-100" />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                      <span>Progress to goal</span>
                      <span>
                        {sessionsCompleted}/{totalSessions}
                      </span>
                    </div>
                    <div className="h-2 bg-blue-50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                        style={{ width: `${(sessionsCompleted / totalSessions) * 100}%` }}
                      />
                    </div>
                    <div className="mt-2 flex gap-2">
                      {["HR", "Technical", "Behavioral", "System Design"].map((tag) => (
                        <span
                          key={tag}
                          className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg flex items-center justify-center"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Continue button */}
                <button
                  onClick={goToInterview}
                  className="flex-shrink-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded px-6 py-3 transition-colors shadow-md shadow-blue-200"
                >
                  Continue
                  <ChevronDownIcon />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}