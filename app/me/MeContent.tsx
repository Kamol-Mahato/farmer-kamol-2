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
} from "lucide-react";

/* ---------- Custom Facebook Icon ---------- */
function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
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
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
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

/* ---------- Active Section ---------- */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { threshold: 0.4, rootMargin: "-80px 0px -40% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [ids]);
  return active;
}

/* ---------- Modal ---------- */
function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto bg-[#0f172a] border border-white/10 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
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

export default function MeContent() {
  const printCV = () => window.print();
  const activeSection = useActiveSection(["home", "about", "skills", "experience"]);
  const [modal, setModal] = useState<"about" | "education" | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f2a] via-[#12183a] to-[#0d1329] text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-[#0b0f2a]/80 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <span className="font-mono text-sm text-indigo-300">&lt;Kamol Mahato/&gt;</span>
          
          <nav className="hidden md:flex gap-8 text-sm text-slate-300">
            <a href="#home" className="hover:text-white transition">Home</a>
            <a href="#about" className="hover:text-white transition">About</a>
            <a href="#skills" className="hover:text-white transition">Skills</a>
            <a href="#experience" className="hover:text-white transition">Experience</a>
          </nav>

          <button
            onClick={printCV}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            <Download size={16} /> Resume
          </button>
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
              <span className="text-amber-400 font-semibold">Fulfillment & Logistics Specialist</span>{" "}
              with 6+ years of experience in{" "}
              <span className="text-indigo-300">Route Optimization</span>,{" "}
              <span className="text-indigo-300">POD Systems</span> and{" "}
              <span className="text-indigo-300">COD Reconciliation</span>. Recognized for achieving 98–100% order accuracy.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={printCV}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition text-white text-sm font-medium px-5 py-2.5 rounded-lg"
              >
                <Download size={16} /> Resume
              </button>
              <a
                href="mailto:kamolmahato@gmail.com"
                className="flex items-center gap-2 border border-white/20 hover:border-white/40 transition text-slate-200 text-sm font-medium px-5 py-2.5 rounded-lg"
              >
                CONTACT ME
              </a>
            </div>
          </Reveal>

          <Reveal className="flex justify-center">
            <div className="relative">
              <div className="w-64 h-64 md:w-72 md:h-72 rounded-[40%_60%_60%_40%/50%_40%_60%_50%] overflow-hidden border-4 border-indigo-500/30 shadow-2xl shadow-indigo-900/40">
                <img
                  src="/uploads/kamol-mahato.png"
                  alt="Kamol Kumar Mahato"
                  className="w-full h-full object-cover"
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

      {/* About Section - Card Style like Milon */}
      <section id="about" className="max-w-6xl mx-auto px-5 pb-20">
        <Reveal>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Info Card */}
            <div className="bg-[#111827]/80 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-5">Personal Info</h3>
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
              <h3 className="text-lg font-semibold text-white mb-4">About Me</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Highly dependable Fulfillment & Logistics Specialist with 6+ years of experience supporting end-to-end fulfillment operations, including order processing, picking, packing, dispatch, and last-mile delivery across urban and regional networks. Expert in inventory flow coordination, order accuracy, route optimization, POD systems, and fulfillment KPIs.
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
                  <span className="text-xs text-amber-400 font-medium">{e.time}</span>
                </div>
                <p className="text-sm text-slate-400">{e.company}</p>
                <p className="text-xs text-slate-500">{e.place}</p>
                {e.detail && <p className="text-sm text-slate-300 mt-1">{e.detail}</p>}
              </div>
            ))}
          </div>
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
              <div key={i} className="bg-[#111827]/80 border border-white/10 rounded-2xl p-6">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <p className="font-semibold text-white">{ed.degree}</p>
                  <span className="text-xs text-amber-400 font-medium whitespace-nowrap">{ed.time}</span>
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

      {/* Fixed Social Icons */}
      <div className="fixed right-5 bottom-5 md:bottom-auto md:top-1/2 md:-translate-y-1/2 flex md:flex-col gap-3 z-30">
        <a
          href="mailto:kamolmahato@gmail.com"
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-indigo-600 transition flex items-center justify-center"
        >
          <Mail size={18} />
        </a>
        <a
          href="tel:01737939688"
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-indigo-600 transition flex items-center justify-center"
        >
          <Phone size={18} />
        </a>
        <a
          href="https://www.facebook.com/komolmahato67"
          target="_blank"
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-indigo-600 transition flex items-center justify-center"
        >
          <FacebookIcon size={18} />
        </a>
      </div>
    </div>
  );
}