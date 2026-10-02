"use client";
import { useEffect, useRef, useState } from "react";
import {
  Truck,
  Navigation,
  ClipboardCheck,
  ShieldCheck,
  Clock,
  Users,
  Banknote,
  Laptop,
  FileSpreadsheet,
  Search,
  Mail,
  Phone,
  Download,
  MapPin,
  GraduationCap,
  Briefcase,
  X,
  ExternalLink,
} from "lucide-react";

/* ---------- Custom Facebook Icon ---------- */
function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
    </svg>
  );
}

/* ---------- Header Clock: Welcome → Time → Date ---------- */
function HeaderClock() {
  const [phase, setPhase] = useState(0); // 0 = Welcome, 1 = Time, 2 = Date
  const [now, setNow] = useState<Date | null>(null);

  // লাইভ সময় — প্রতি সেকেন্ডে আপডেট (শুধু ক্লায়েন্টে, তাই hydration মিসম্যাচ হবে না)
  useEffect(() => {
    setNow(new Date());
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  // Welcome ২ সেকেন্ড → সময় ৫ সেকেন্ড → তারিখ ৪ সেকেন্ড → আবার Welcome
  useEffect(() => {
    const durations = [2000, 5000, 4000];
    const t = setTimeout(() => setPhase((p) => (p + 1) % 3), durations[phase]);
    return () => clearTimeout(t);
  }, [phase]);

  const time = now
    ? now.toLocaleTimeString("en-US", {
        timeZone: "Asia/Dhaka",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "";
  const date = now
    ? now.toLocaleDateString("en-GB", {
        timeZone: "Asia/Dhaka",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="w-[190px] sm:w-[250px] whitespace-nowrap">
      <style>{`@keyframes meFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}`}</style>
      <span
        key={phase}
        className="inline-block text-xs sm:text-sm font-semibold text-indigo-200 tabular-nums"
        style={{ animation: "meFade 0.4s ease-out" }}
      >
        {phase === 0 ? "Welcome" : phase === 1 ? time : date}
      </span>
    </div>
  );
}

/* ---------- Gmail Icon (multicolor) ---------- */
function GmailIcon() {
  return (
    <svg viewBox="52 42 88 66" aria-hidden="true">
      <path fill="#4285f4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6" />
      <path fill="#34a853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15" />
      <path fill="#fbbc04" d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2" />
      <path fill="#ea4335" d="M72 74V48l24 18 24-18v26L96 92" />
      <path fill="#c5221f" d="M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2" />
    </svg>
  );
}

/* ---------- Custom LinkedIn Icon ---------- */
function LinkedInIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

/* ---------- Reveal on scroll ---------- */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ---------- Data ---------- */
const skills = [
  { icon: Truck, label: "Delivery Ops" },
  { icon: Navigation, label: "Route Optimization" },
  { icon: ClipboardCheck, label: "POD Systems" },
  { icon: ShieldCheck, label: "Fleet Compliance" },
  { icon: Clock, label: "Time-Critical" },
  { icon: Users, label: "Customer Relations" },
  { icon: Banknote, label: "COD Reconciliation" },
  { icon: Laptop, label: "Delivery Software" },
  { icon: FileSpreadsheet, label: "Excel & Sheets" },
  { icon: Search, label: "SEO Research" },
];

const experience = [
  {
    role: "Sr. Executive",
    company: "eCourier.com.bd",
    place: "Tejgaon Industrial Area, Dhaka",
    time: "12/2022 – Present",
    detail: "Promoted to Sr. Executive from Executive.",
  },
  {
    role: "Executive at Fulfillment",
    company: "eCourier.com.bd",
    place: "Tejgaon Industrial Area, Dhaka",
    time: "08/2019 – 11/2022",
    detail: "",
  },
  {
    role: "Call Center Executive & Computer Operator",
    company: "Query Market Research Company",
    place: "South Badda, Gulshan, Dhaka",
    time: "01/2019 – 09/2019",
    detail: "",
  },
];

const education = [
  {
    degree: "Bachelor of Arts (Hons), Bangla",
    school: "Govt. Akbar Ali College, Sirajganj",
    time: "2023",
    detail: "CGPA 2.62 (out of 4.00) · National University",
  },
  {
    degree: "Higher Secondary Certificate (H.S.C), Science",
    school: "Sherwood International Private School & College, Sherpur, Bogura",
    time: "2016",
    detail: "GPA 4.58 (out of 5.00) · Board: Rajshahi",
  },
  {
    degree: "Secondary School Certificate (S.S.C), Science",
    school: "Kanaikandor High School, Sherpur, Bogura",
    time: "2014",
    detail: "GPA 5.00 (out of 5.00) · Board: Rajshahi",
  },
];

const projects = [
  {
    name: "Farmer Kamol — Personal E-commerce Website",
    detail:
      "A full-featured e-commerce platform built entirely solo: Next.js, TypeScript, Tailwind CSS, PostgreSQL, Supabase storage, Redis caching, SSLCommerz payment gateway, Pathao courier integration, and real-time live-chat support.",
    link: "https://farmerkamol.com",
  },
];

export default function MeContent() {
  const cvUrl = "/cv/Kamol-Kumar-Mahato-CV.pdf";
  const [showCall, setShowCall] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText("01737939688");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f2a] via-[#12183a] to-[#0d1329] text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-[#0b0f2a]/80 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
        <HeaderClock />

          <nav className="hidden md:flex gap-8 text-sm text-slate-300">
            <a href="#home" className="hover:text-white transition">
              Home
            </a>
            <a href="#about" className="hover:text-white transition">
              About
            </a>
            <a href="#skills" className="hover:text-white transition">
              Skills
            </a>
            <a href="#experience" className="hover:text-white transition">
              Experience
            </a>
            <a href="#projects" className="hover:text-white transition">
              Projects
            </a>
          </nav>

          <a
            href={cvUrl}
            download="Kamol-Kumar-Mahato-CV.pdf"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            <Download size={16} /> Resume
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="max-w-6xl mx-auto px-5 pt-16 pb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <Reveal>
            <p className="text-slate-400 mb-2">Hello, I am 👋</p>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">
              Kamol Kumar Mahato
            </h1>
            <p className="text-slate-300 leading-relaxed mb-8 max-w-lg">
              A dependable{" "}
              <span className="text-amber-400 font-semibold">
                Fulfillment & Logistics Specialist
              </span>{" "}
              with 6+ years of experience in{" "}
              <span className="text-indigo-300">Route Optimization</span>,{" "}
              <span className="text-indigo-300">POD Systems</span> and{" "}
              <span className="text-indigo-300">COD Reconciliation</span>.
              Recognized for achieving 98–100% order accuracy.
            </p>

            <div className="flex flex-wrap gap-3">
            <a
                href={cvUrl}
                download="Kamol-Kumar-Mahato-CV.pdf"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition text-white text-sm font-medium px-5 py-2.5 rounded-lg"
              >
                <Download size={16} /> Resume
              </a>
              <button
                onClick={() => setShowCall(true)}
                className="flex items-center gap-2 border border-white/20 hover:border-white/40 transition text-slate-200 text-sm font-medium px-5 py-2.5 rounded-lg"
              >
                CONTACT ME
              </button>
            </div>
          </Reveal>

          <Reveal className="flex justify-center">
            <div className="relative">
            <div className="group w-64 h-64 md:w-72 md:h-72 rounded-full overflow-hidden border-4 border-indigo-500/30 shadow-2xl shadow-indigo-900/40 transition-all duration-500 hover:border-indigo-400 hover:shadow-indigo-500/50 hover:-translate-y-1">
                <img
                  src="/uploads/kamol-mahato.png"
                  alt="Kamol Kumar Mahato"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Skills Strip */}
      <section id="skills" className="max-w-6xl mx-auto px-5 pb-20">
        <Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {skills.map((s, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center text-center gap-2 hover:bg-white/10 transition"
              >
                <s.icon size={26} className="text-indigo-300" />
                <span className="text-xs text-slate-300">{s.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* About Section */}
      <section id="about" className="max-w-6xl mx-auto px-5 pb-20">
        <Reveal>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Info Card */}
            <div className="bg-[#111827]/80 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-5">
                Personal Info
              </h3>
              <div className="space-y-4 text-sm text-slate-300">
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-indigo-400" />
                  <span>01737939688</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-indigo-400" />
                  <span>kamolmahato@gmail.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-indigo-400" />
                  <span>Dhaka, Bangladesh</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-indigo-400 text-base">🌐</span>
                  <span>Bengali, English</span>
                </div>
              </div>
            </div>

            {/* About Me Card */}
            <div className="bg-[#111827]/80 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                About Me
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Highly dependable Fulfillment & Logistics Specialist with 6+
                years of experience supporting end-to-end fulfillment
                operations, including order processing, picking, packing,
                dispatch, and last-mile delivery across urban and regional
                networks. Expert in inventory flow coordination, order accuracy,
                route optimization, POD systems, and fulfillment KPIs.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Experience */}
      <section id="experience" className="max-w-6xl mx-auto px-5 pb-20">
        <Reveal>
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <Briefcase size={22} className="text-indigo-300" /> Experience
          </h2>
          <div className="space-y-6 border-l border-white/10 pl-6">
            {experience.map((e, i) => (
              <div key={i} className="relative">
                <span className="absolute -left-[29px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-400" />
                <div className="flex justify-between items-baseline flex-wrap gap-1">
                  <p className="font-semibold text-white">{e.role}</p>
                  <span className="text-xs text-amber-400 font-medium">
                    {e.time}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{e.company}</p>
                <p className="text-xs text-slate-500">{e.place}</p>
                {e.detail && (
                  <p className="text-sm text-slate-300 mt-1">{e.detail}</p>
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Projects Section - Farmer Kamol */}
      <section id="projects" className="max-w-6xl mx-auto px-5 pb-20">
        <Reveal>
          <h2 className="text-2xl font-bold mb-8">Projects</h2>
          {projects.map((p, i) => (
            <div
              key={i}
              className="bg-[#111827]/80 border border-white/10 rounded-2xl p-6 hover:border-indigo-500/40 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <p className="font-semibold text-white text-lg">{p.name}</p>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                    {p.detail}
                  </p>
                </div>
              </div>
              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-sm text-indigo-300 font-medium hover:text-indigo-200 transition"
              >
                {p.link}
                <ExternalLink size={14} />
              </a>
            </div>
          ))}
        </Reveal>
      </section>

      {/* Education */}
      <section className="max-w-6xl mx-auto px-5 pb-24">
        <Reveal>
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <GraduationCap size={22} className="text-indigo-300" /> Education
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {education.map((ed, i) => (
              <div
                key={i}
                className="bg-[#111827]/80 border border-white/10 rounded-2xl p-6"
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <p className="font-semibold text-white">{ed.degree}</p>
                  <span className="text-xs text-amber-400 font-medium whitespace-nowrap">
                    {ed.time}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{ed.school}</p>
                <p className="text-sm text-slate-500 mt-1">{ed.detail}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 pb-10">
        © {new Date().getFullYear()} Kamol Kumar Mahato
      </footer>

      {/* Call number modal */}
      {showCall && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowCall(false)}
        >
          <div
            className="bg-[#111827] border border-white/10 rounded-2xl p-6 w-full max-w-xs text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-slate-400 text-sm mb-1">Call me on</p>
            <p className="text-2xl font-bold text-white tracking-wide mb-5">
              01737939688
            </p>
            <div className="flex gap-2">
              <a
                href="tel:01737939688"
                className="flex-1 flex items-center justify-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] transition text-white text-sm font-semibold py-2.5 rounded-lg"
              >
                <Phone size={16} /> Call now
              </a>
              <button
                onClick={copyNumber}
                className="flex-1 border border-white/20 hover:border-white/40 transition text-slate-200 text-sm font-semibold py-2.5 rounded-lg"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <button
              onClick={() => setShowCall(false)}
              className="mt-4 text-xs text-slate-500 hover:text-slate-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Fixed Social Icons — সব ডিভাইসে লম্বা সারি; মোবাইলে ছোট */}
      <div className="fixed right-3 bottom-4 md:right-5 md:bottom-5 flex flex-col gap-2 md:gap-3 z-30">
        <a
          href="mailto:kamolmahato@gmail.com"
          aria-label="Email"
          title="Email"
          className="w-9 h-9 md:w-11 md:h-11 [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-5 md:[&>svg]:h-5 rounded-full bg-white hover:bg-gray-100 shadow-lg shadow-black/40 ring-2 ring-white/25 hover:scale-110 transition flex items-center justify-center"
        >
          <GmailIcon />
        </a>
        <a
          href="tel:01737939688"
          aria-label="Call"
          title="Call"
          className="w-9 h-9 md:w-11 md:h-11 [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-5 md:[&>svg]:h-5 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-white shadow-lg shadow-black/40 ring-2 ring-white/25 hover:scale-110 transition flex items-center justify-center"
        >
          <Phone />
        </a>
        <a
          href="https://www.facebook.com/komolmahato67"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          title="Facebook"
          className="w-9 h-9 md:w-11 md:h-11 [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-5 md:[&>svg]:h-5 rounded-full bg-[#1877F2] hover:bg-[#0f5fd0] text-white shadow-lg shadow-black/40 ring-2 ring-white/25 hover:scale-110 transition flex items-center justify-center"
        >
          <FacebookIcon />
        </a>
        <a
          href="https://www.linkedin.com/in/kamol-kumar-mahato-552a06184"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          title="LinkedIn"
          className="w-9 h-9 md:w-11 md:h-11 [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-5 md:[&>svg]:h-5 rounded-full bg-[#0A66C2] hover:bg-[#084e96] text-white shadow-lg shadow-black/40 ring-2 ring-white/25 hover:scale-110 transition flex items-center justify-center"
        >
          <LinkedInIcon />
        </a>
      </div>
    </div>
  );
}
