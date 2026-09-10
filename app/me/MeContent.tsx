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
} from "lucide-react";

/* lucide-react ভার্সন 1.x-এ ব্র্যান্ড/সোশ্যাল আইকন (Facebook ইত্যাদি) নেই, তাই নিজস্ব SVG */
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

/* ---------- fade-up on scroll (no external library) ---------- */
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

/* ---------- data ---------- */
const skills = [
  { icon: Truck, label: "Delivery Ops" },
  { icon: Navigation, label: "Route Optimization" },
  { icon: ClipboardCheck, label: "POD Systems" },
  { icon: ShieldCheck, label: "Fleet Compliance" },
  { icon: Clock, label: "Time-Critical Shipments" },
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
    place: "Plot #6, Tejgaon Industrial Area 270/B, Beside Ifad Tower",
    time: "12/2022 – Present",
    detail: "Promoted to Sr. Executive from Executive.",
  },
  {
    role: "Executive at Fulfillment",
    company: "eCourier.com.bd",
    place: "Plot #6, Tejgaon Industrial Area 270/B, Beside Ifad Tower",
    time: "08/2019 – 11/2022",
    detail: "",
  },
  {
    role: "Call Center Executive & Cum Computer Operator",
    company: "Query Market Research Company",
    place:
      "Flat: 4/C, House: TA-203, Rubi Amena Lake View, South Badda, Gulshan, Dhaka-1212",
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

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
];

export default function MeContent() {
  const printCV = () => window.print();

  return (
    <div className="min-h-screen bg-[#0b1224] text-slate-100 selection:bg-indigo-500/30">
      <style>{`
        .blob-shape {
          border-radius: 71% 29% 61% 39% / 42% 42% 58% 58%;
        }
        @keyframes floaty {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        .float-anim { animation: floaty 5s ease-in-out infinite; }

        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          .print-root { background: #fff !important; }
          .print-root, .print-root * {
            color: #000 !important;
            background: transparent !important;
            box-shadow: none !important;
            border-color: #999 !important;
          }
          .print-photo {
            border-radius: 9999px !important;
            width: 110px !important;
            height: 110px !important;
          }
          @page { size: A4; margin: 14mm; }
        }
      `}</style>

      <div className="print-root">
        {/* ---------- top navbar ---------- */}
        <header className="no-print sticky top-0 z-30 backdrop-blur bg-[#0b1224]/80 border-b border-white/10">
          <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
            <span className="font-mono text-sm text-indigo-300">
              &lt;Kamol Mahato/&gt;
            </span>
            <nav className="hidden md:flex gap-6 text-sm text-slate-300">
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} className="hover:text-white transition">
                  {l.label}
                </a>
              ))}
            </nav>
            <button
              onClick={printCV}
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 transition text-white text-sm font-semibold px-4 py-2 rounded-lg"
            >
              <Download size={16} /> Resume
            </button>
          </div>
        </header>

        {/* ---------- hero ---------- */}
        <section
          id="home"
          className="max-w-6xl mx-auto px-5 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center"
        >
          <Reveal>
            <p className="text-slate-400 mb-2">Hello, I am 👋</p>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Kamol Kumar Mahato
            </h1>
            <p className="text-slate-300 leading-relaxed mb-6">
              A dependable{" "}
              <span className="text-amber-400 font-semibold">
                Fulfillment &amp; Logistics Specialist
              </span>{" "}
              with 6+ years of experience in{" "}
              <span className="text-indigo-300 font-semibold">
                Route Optimization
              </span>
              ,{" "}
              <span className="text-indigo-300 font-semibold">
                POD Systems
              </span>{" "}
              and{" "}
              <span className="text-indigo-300 font-semibold">
                COD Reconciliation
              </span>
              . Recognized for achieving 98–100% order accuracy and on-time
              dispatch across urban and regional delivery networks.
            </p>
            <div className="flex flex-wrap gap-3 mb-6 no-print">
              <button
                onClick={printCV}
                className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 transition text-white text-sm font-semibold px-5 py-2.5 rounded-lg"
              >
                <Download size={16} /> Download CV
              </button>
              <a
                href="mailto:kamolmahato@gmail.com"
                className="flex items-center gap-2 border border-white/20 hover:border-white/40 transition text-slate-200 text-sm font-semibold px-5 py-2.5 rounded-lg"
              >
                Contact Me
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <MapPin size={14} /> Dhaka, Bangladesh
            </div>
          </Reveal>

          <Reveal className="flex justify-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80 float-anim">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-rose-400 to-indigo-500 blob-shape" />
              <img
                src="/uploads/kamol-mahato.png"
                alt="Kamol Kumar Mahato"
                className="print-photo absolute inset-[6px] w-[calc(100%-12px)] h-[calc(100%-12px)] object-cover blob-shape"
              />
            </div>
          </Reveal>
        </section>

        {/* ---------- skills strip ---------- */}
        <section id="skills" className="max-w-6xl mx-auto px-5 pb-20">
          <Reveal>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {skills.map((s, i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center text-center gap-2"
                >
                  <s.icon size={26} className="text-indigo-300" />
                  <span className="text-xs text-slate-300">{s.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ---------- about ---------- */}
        <section id="about" className="max-w-6xl mx-auto px-5 pb-20">
          <Reveal>
            <h2 className="text-2xl font-bold mb-4">About</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Highly dependable Fulfillment &amp; Logistics Specialist with
              6+ years of experience supporting end-to-end fulfillment
              operations, including order processing, picking, packing,
              dispatch, and last-mile delivery across urban and regional
              networks. Expert in inventory flow coordination, order
              accuracy, route optimization, POD systems, and fulfillment
              KPIs. Recognized for achieving 98–100% order accuracy and
              on-time dispatch, reducing operational delays, optimizing
              labor and fuel utilization, and maintaining strict safety,
              quality, and compliance standards.
            </p>
            <ul className="text-sm text-slate-400 list-disc list-inside space-y-1">
              <li>Strong motivation &amp; commitment</li>
              <li>Ability to work independently as well as in a team</li>
              <li>Commendable communication and presentation skills</li>
              <li>Fluent communication in both Bengali &amp; English</li>
            </ul>
          </Reveal>
        </section>

        {/* ---------- experience ---------- */}
        <section id="experience" className="max-w-6xl mx-auto px-5 pb-20">
          <Reveal>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
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

        {/* ---------- education ---------- */}
        <section id="education" className="max-w-6xl mx-auto px-5 pb-20">
          <Reveal>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <GraduationCap size={22} className="text-indigo-300" /> Education
            </h2>
            <div className="space-y-6 border-l border-white/10 pl-6">
              {education.map((ed, i) => (
                <div key={i} className="relative">
                  <span className="absolute -left-[29px] top-1.5 w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="flex justify-between items-baseline flex-wrap gap-1">
                    <p className="font-semibold text-white">{ed.degree}</p>
                    <span className="text-xs text-amber-400 font-medium">
                      {ed.time}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{ed.school}</p>
                  <p className="text-sm text-slate-300">{ed.detail}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-6">
              Professional Training: Practical SEO (Search Engine
              Optimization) course — BASIS Institute of Technology &amp;
              Management (BITM), Oct–Nov 2018.
            </p>
          </Reveal>
        </section>

        {/* ---------- projects ---------- */}
        <section id="projects" className="max-w-6xl mx-auto px-5 pb-24">
          <Reveal>
            <h2 className="text-2xl font-bold mb-6">Projects</h2>
            {projects.map((p, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-xl p-6"
              >
                <p className="font-semibold text-white">{p.name}</p>
                <p className="text-sm text-slate-300 mt-2">{p.detail}</p>
                <a
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-sm text-indigo-300 font-medium underline underline-offset-2"
                >
                  {p.link}
                </a>
              </div>
            ))}
          </Reveal>
        </section>

        <footer className="no-print text-center text-xs text-slate-500 pb-10">
          © {new Date().getFullYear()} Kamol Kumar Mahato
        </footer>
      </div>

      {/* ---------- fixed social icons ---------- */}
      <div className="no-print fixed right-5 bottom-5 md:bottom-auto md:top-1/2 md:-translate-y-1/2 flex md:flex-col gap-4 z-30">
        <a
          href="mailto:kamolmahato@gmail.com"
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-indigo-500 transition flex items-center justify-center"
          aria-label="Email"
        >
          <Mail size={18} />
        </a>
        <a
          href="tel:01737939688"
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-indigo-500 transition flex items-center justify-center"
          aria-label="Phone"
        >
          <Phone size={18} />
        </a>
        <a
          href="https://www.facebook.com/komolmahato67"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-indigo-500 transition flex items-center justify-center"
          aria-label="Facebook"
        >
        <FacebookIcon size={18} />
        </a>
      </div>
    </div>
  );
}