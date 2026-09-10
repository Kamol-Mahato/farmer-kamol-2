"use client";

import { useEffect, useRef, useState } from "react";

/* ---------- scroll-reveal hook (no external library) ---------- */
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
  direction = "left",
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  direction?: "left" | "right" | "up";
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useReveal();
  const hidden =
    direction === "left"
      ? "-translate-x-14"
      : direction === "right"
      ? "translate-x-14"
      : "translate-y-8";

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-x-0 translate-y-0" : `opacity-0 ${hidden}`
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ---------- data ---------- */
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
    place: "Flat: 4/C, House: TA-203, Rubi Amena Lake View, South Badda, Gulshan, Dhaka-1212",
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

const skills = [
  "End-to-End Delivery Operation",
  "Route Optimization & GPS Systems",
  "Proof of Delivery (POD) Systems",
  "Fleet & Vehicle Compliance",
  "Time-Critical & High-Value Shipments",
  "Customer Relationship Management",
  "Cash on Delivery (COD) Reconciliation",
  "Delivery Management by Software",
];

const computerSkills = [
  "MS Excel & Google Spreadsheet (Pivot Table, VLOOKUP, Filter, Table)",
  "Web Market Research through SEO",
  "MS Word & Email Communication",
];

const projects = [
  {
    name: "Farmer Kamol — Personal E-commerce Website",
    detail:
      "A full-featured e-commerce platform built entirely solo: Next.js, TypeScript, Tailwind CSS, PostgreSQL, Supabase storage, Redis caching, SSLCommerz payment gateway, Pathao courier integration, and real-time live-chat support.",
    link: "https://farmerkamol.com",
  },
];

/* ---------- page ---------- */
export default function MeContent() {
  const printCV = () => window.print();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 print:bg-white">
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          body { -webkit-print-color-adjust: exact; }
        }
      `}</style>

      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 px-4 py-10 print:block print:px-0 print:py-0">
        {/* ---------- sidebar ---------- */}
        <Reveal
          direction="left"
          className="md:w-72 shrink-0 md:sticky md:top-10 md:self-start print:static"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center print:shadow-none print:border-slate-300">
            <div className="relative w-28 h-28 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,theme(colors.indigo.500),theme(colors.emerald.400),theme(colors.amber.400),theme(colors.indigo.500))] animate-[spin_6s_linear_infinite]" />
              <img
                src="/uploads/kamol-mahato.png"
                alt="Kamol Kumar Mahato"
                className="absolute inset-[3px] w-[calc(100%-6px)] h-[calc(100%-6px)] rounded-full object-cover bg-white print:static print:inset-0 print:w-28 print:h-28"
              />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Kamol Kumar Mahato</h1>
            <p className="text-sm text-indigo-600 font-medium mt-1">
              Fulfillment &amp; Logistics Specialist
            </p>

            <div className="mt-6 text-left text-sm space-y-2 text-slate-600">
              <p>📧 kamolmahato@gmail.com</p>
              <p>📞 01737939688</p>
              <p>📍 Dhaka, Bangladesh</p>
              <p>🌐 farmerkamol.com</p>
            </div>

            <button
              onClick={printCV}
              className="print:hidden mt-6 w-full bg-slate-900 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-slate-700 transition"
            >
              🖨️ Print / Download CV
            </button>
          </div>
        </Reveal>

        {/* ---------- content ---------- */}
        <div className="flex-1 space-y-10 print:space-y-6">
          <Reveal direction="right">
            <section>
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
                Career Objective
              </h2>
              <p className="text-sm leading-relaxed text-slate-600">
                Highly dependable Fulfillment &amp; Logistics Specialist with 6+ years of
                experience supporting end-to-end fulfillment operations, including order
                processing, picking, packing, dispatch, and last-mile delivery across urban
                and regional networks. Expert in inventory flow coordination, order accuracy,
                route optimization, POD systems, and fulfillment KPIs. Recognized for
                achieving 98–100% order accuracy and on-time dispatch, reducing operational
                delays, optimizing labor and fuel utilization, and maintaining strict safety,
                quality, and compliance standards.
              </p>
            </section>
          </Reveal>

          <Reveal direction="left">
            <section>
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">
                Experience
              </h2>
              <div className="space-y-5">
                {experience.map((e, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline flex-wrap gap-1">
                      <p className="font-semibold text-slate-800">{e.role}</p>
                      <span className="text-xs text-indigo-600 font-medium">{e.time}</span>
                    </div>
                    <p className="text-sm text-slate-500">{e.company}</p>
                    <p className="text-xs text-slate-400">{e.place}</p>
                    {e.detail && (
                      <p className="text-sm text-slate-600 mt-1">{e.detail}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal direction="right">
            <section>
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">
                Education
              </h2>
              <div className="space-y-5">
                {education.map((ed, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline flex-wrap gap-1">
                      <p className="font-semibold text-slate-800">{ed.degree}</p>
                      <span className="text-xs text-indigo-600 font-medium">{ed.time}</span>
                    </div>
                    <p className="text-sm text-slate-500">{ed.school}</p>
                    <p className="text-sm text-slate-600">{ed.detail}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-4">
                Professional Training: Practical SEO (Search Engine Optimization) course —
                BASIS Institute of Technology &amp; Management (BITM), Oct–Nov 2018.
              </p>
            </section>
          </Reveal>

          <Reveal direction="left">
            <section>
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {skills.map((s, i) => (
                  <span
                    key={i}
                    className="text-xs font-medium bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                {computerSkills.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </section>
          </Reveal>

          <Reveal direction="right">
            <section>
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">
                Projects
              </h2>
              {projects.map((p, i) => (
                <div key={i}>
                  <p className="font-semibold text-slate-800">{p.name}</p>
                  <p className="text-sm text-slate-600 mt-1">{p.detail}</p>
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 font-medium underline underline-offset-2"
                  >
                    {p.link}
                  </a>
                </div>
              ))}
            </section>
          </Reveal>

          <Reveal direction="up">
            <section>
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
                Self-Analysis
              </h2>
              <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                <li>Strong motivation &amp; commitment</li>
                <li>Ability to work independently as well as in a team</li>
                <li>Commendable communication and presentation skills</li>
                <li>Fluent communication in both Bengali &amp; English</li>
              </ul>
            </section>
          </Reveal>
        </div>
      </div>
    </div>
  );
}