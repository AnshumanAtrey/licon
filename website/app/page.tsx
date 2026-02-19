import { useId } from "react";
import Image from "next/image";
import ScrollReveal from "./scroll-reveal";

/* ── SVG divider: bg → dark ── */
function DiagonalDividerDark() {
  return (
    <div className="relative h-16 md:h-24 -mb-px overflow-hidden">
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
      >
        <path
          d="M0 0 L0 40 C0 62 18 68 40 74 L1400 118 C1422 124 1440 118 1440 96 L1440 0 Z"
          className="fill-fg"
        />
      </svg>
    </div>
  );
}

/* ── Star icon for testimonials (badge style) ── */
function StarIcon({ size = 16, className = "text-blue-400" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

/* ── Badge star for testimonial cards (star in white circle, Maily-style) ── */
function BadgeStar() {
  const id = useId();
  return (
    <div
      className="w-[30px] h-[30px] rounded-full shrink-0 flex items-center justify-center"
      style={{
        background: "#FFFFFF",
        boxShadow: "rgba(10, 114, 237, 0.64) 0px -1px 1px 0px inset",
      }}
    >
      <svg width={18} height={18} viewBox="0 0 30 30" aria-hidden>
        <defs>
          <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7EC8FF" />
            <stop offset="100%" stopColor="#0066FF" />
          </linearGradient>
          <radialGradient id={`h${id}`} cx="0.35" cy="0.25" r="0.45">
            <stop offset="0%" stopColor="white" stopOpacity="0.55" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path
          d="M15 1.5 Q15.8 1.5 16.3 2.8 L18.6 7.8 Q19 8.6 19.9 8.8 L25.2 9.6 Q26.8 9.8 26.8 11 Q26.8 11.6 26.2 12.2 L22.2 16.1 Q21.6 16.7 21.8 17.6 L22.7 23 Q22.9 24.6 21.5 24.6 Q21 24.6 20.4 24.2 L15.7 21.7 Q15 21.3 14.3 21.7 L9.6 24.2 Q9 24.6 8.5 24.6 Q7.1 24.6 7.3 23 L8.2 17.6 Q8.4 16.7 7.8 16.1 L3.8 12.2 Q3.2 11.6 3.2 11 Q3.2 9.8 4.8 9.6 L10.1 8.8 Q11 8.6 11.4 7.8 L13.7 2.8 Q14.2 1.5 15 1.5 Z"
          fill={`url(#g${id})`}
        />
        <path
          d="M15 1.5 Q15.8 1.5 16.3 2.8 L18.6 7.8 Q19 8.6 19.9 8.8 L25.2 9.6 Q26.8 9.8 26.8 11 Q26.8 11.6 26.2 12.2 L22.2 16.1 Q21.6 16.7 21.8 17.6 L22.7 23 Q22.9 24.6 21.5 24.6 Q21 24.6 20.4 24.2 L15.7 21.7 Q15 21.3 14.3 21.7 L9.6 24.2 Q9 24.6 8.5 24.6 Q7.1 24.6 7.3 23 L8.2 17.6 Q8.4 16.7 7.8 16.1 L3.8 12.2 Q3.2 11.6 3.2 11 Q3.2 9.8 4.8 9.6 L10.1 8.8 Q11 8.6 11.4 7.8 L13.7 2.8 Q14.2 1.5 15 1.5 Z"
          fill={`url(#h${id})`}
        />
      </svg>
    </div>
  );
}

/* ── Shield icon ── */
function ShieldIcon() {
  return (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

/* ── Bell/Envelope icon ── */
function BellIcon() {
  return (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      <circle cx="18" cy="5" r="3" fill="white" stroke="none" />
    </svg>
  );
}

/* ── Search icon ── */
function SearchIcon() {
  return (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

/* ── GitHub icon ── */
function GitHubIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

/* ── LinkedIn icon ── */
function LinkedInIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

/* ── Testimonial Card (Maily-style) ── */
function TestimonialCard({
  quote,
  name,
  initial,
  color,
}: {
  quote: React.ReactNode;
  name: string;
  initial: string;
  color: string;
}) {
  return (
    <div
      className="w-[540px] min-h-[262px] shrink-0 rounded-[40px] p-[38px_48px] flex flex-col gap-6 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #B5D8FF 100%)" }}
    >
      <p className="text-[18px] leading-[1.51] text-black/70 font-normal">
        {quote}
      </p>
      <div className="flex items-center gap-[22px] mt-auto">
        <div
          className="w-[64px] h-[64px] rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0"
          style={{ background: color }}
        >
          {initial}
        </div>
        <div className="flex flex-col gap-3">
          <span className="text-[16px] font-medium text-black">{name}</span>
          <div className="flex gap-2">
            <BadgeStar /><BadgeStar /><BadgeStar /><BadgeStar /><BadgeStar />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Tool circle (Maily neumorphic style) ── */
function ToolCircle({ children, size = 160 }: { children: React.ReactNode; label?: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(180deg, #FFFFFF 0%, #C7C7C7 129%)",
        boxShadow: "rgba(0,0,0,0.05) -1px 9px 19px 0px, rgba(0,0,0,0.05) -4px 35px 35px 0px, rgba(0,0,0,0.07) -10px 78px 48px 0px, rgb(255,255,255) 0px 0px 20px 0px inset",
      }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-surface text-fg font-body">
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative hero-gradient overflow-hidden pb-24 md:pb-32">
        {/* ── Decorative ring ── */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[600px] h-[600px] md:w-[800px] md:h-[800px] hero-ring pointer-events-none" />

        {/* ── Floating 3D LinkedIn logos ── */}
        <div
          className="hidden md:block absolute top-24 left-[5%] w-28 opacity-70 float-slow pointer-events-none"
          style={{ "--rotate": "-18deg" } as React.CSSProperties}
        >
          <Image
            src="/assets/3d-linkedin-logo.png"
            alt=""
            width={120}
            height={120}
            className="drop-shadow-xl"
          />
        </div>
        <div
          className="hidden md:block absolute top-20 right-[4%] w-36 opacity-60 float-medium pointer-events-none"
          style={{ "--rotate": "14deg" } as React.CSSProperties}
        >
          <Image
            src="/assets/3d-linkedin-logo.png"
            alt=""
            width={150}
            height={150}
            className="drop-shadow-xl"
          />
        </div>
        <div
          className="hidden lg:block absolute bottom-32 left-[8%] w-24 opacity-50 float-medium pointer-events-none"
          style={{ "--rotate": "-25deg" } as React.CSSProperties}
        >
          <Image
            src="/assets/3d-linkedin-logo.png"
            alt=""
            width={100}
            height={100}
            className="drop-shadow-lg"
          />
        </div>
        <div
          className="hidden lg:block absolute bottom-28 right-[7%] w-32 opacity-55 float-slow pointer-events-none"
          style={{ "--rotate": "10deg" } as React.CSSProperties}
        >
          <Image
            src="/assets/3d-linkedin-logo.png"
            alt=""
            width={130}
            height={130}
            className="drop-shadow-xl"
          />
        </div>

        {/* ── Floating pill nav ── */}
        <nav className="relative z-50 flex justify-center pt-5 px-4">
          <div className="flex items-center gap-1 bg-white/80 backdrop-blur-xl rounded-full px-2.5 py-2 shadow-lg shadow-black/[0.04] border border-white/60">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2 pl-2 pr-4">
              <Image
                src="/assets/icons/icon48.png"
                alt="LICON"
                width={28}
                height={28}
              />
            </a>

            {/* Links */}
            <a
              href="#features"
              className="hidden sm:inline-block px-4 py-2.5 text-[16px] font-medium text-fg hover:text-fg/70 transition-colors rounded-full"
            >
              Features
            </a>
            <a
              href="#stats"
              className="hidden sm:inline-block px-4 py-2.5 text-[16px] font-medium text-fg hover:text-fg/70 transition-colors rounded-full"
            >
              Results
            </a>
            <a
              href="/changelog"
              className="hidden sm:inline-block px-4 py-2.5 text-[16px] font-medium text-fg hover:text-fg/70 transition-colors rounded-full"
            >
              Changelog
            </a>
            <a
              href="https://github.com/AnshumanAtrey/licon"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-block px-4 py-2.5 text-[16px] font-medium text-fg hover:text-fg/70 transition-colors rounded-full"
            >
              GitHub
            </a>

            {/* CTA */}
            <a
              href="#"
              className="bg-fg text-white px-10 py-3 rounded-[15px] text-[16px] font-semibold hover:bg-fg/85 transition-colors ml-1"
            >
              Add to Chrome
            </a>
          </div>
        </nav>

        {/* ── Hero content ── */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-14 md:pt-20">
          {/* Social proof badge */}
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full pl-1.5 pr-5 py-1.5 shadow-md shadow-black/[0.04] border border-white/60 anim-fade-up">
            {/* Avatar stack */}
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                A
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                S
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                M
              </div>
            </div>
            <span className="text-[18px] text-black/[0.69]">
              500+ professionals growing their network
            </span>
          </div>

          {/* Main headline */}
          <h1 className="mt-8 md:mt-10 font-heading text-[clamp(3rem,8vw,6.5rem)] font-black italic leading-[1.05] tracking-tight text-white/[0.94] anim-fade-up anim-delay-1">
            Your network,
            <br />
            on autopilot.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 md:mt-8 text-[18px] text-black/[0.69] max-w-lg mx-auto leading-[1.5] anim-fade-up anim-delay-2">
            Automate <span className="font-bold text-black/[0.69]">LinkedIn connections</span> and{" "}
            <span className="font-bold text-black/[0.69]">AI-powered engagement</span>, ensuring you
            never miss an opportunity to grow.
          </p>

          {/* CTA buttons */}
          <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 anim-fade-up anim-delay-3">
            <a
              href="#"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-fg text-white px-[60px] py-4 rounded-[20px] text-[22px] font-bold tracking-[-0.04em] hover:bg-fg/85 transition-all shadow-xl shadow-black/10 h-[65px]"
            >
              <Image
                src="/assets/icons/icon16.png"
                alt=""
                width={20}
                height={20}
                className="invert"
              />
              Get Started
            </a>
            <a
              href="https://github.com/AnshumanAtrey/licon"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white text-fg px-[60px] py-4 rounded-[20px] text-[22px] font-bold tracking-[-0.04em] hover:bg-white/90 transition-all shadow-xl shadow-black/[0.04] h-[65px]"
            >
              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 1: Features Intro (Two-column) ═══════════════════ */}
      <section id="features" className="bg-[#F9F9F9] pt-24 md:pt-32 pb-20">
        <div className="mx-auto px-6 md:px-12 flex flex-col md:flex-row md:justify-between md:items-start gap-6" style={{ maxWidth: "1360px" }}>
          <ScrollReveal className="md:w-[50%]">
            <h2 className="font-heading font-bold leading-[1.05] tracking-tight text-fg" style={{ fontSize: "clamp(2.5rem, 6vw, 4.25rem)" }}>
              Features you will love.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={150} className="md:w-[40%]">
            <p className="text-[17px] text-muted leading-relaxed md:text-right">
              Automate LinkedIn networking for hundreds of professionals, making the process seamless and efficient
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════════ SECTION 2: Feature Cards (3-column grid) ═══════════════════ */}
      <section className="bg-[#F9F9F9] pb-24 md:pb-32">
        <div className="mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-6" style={{ maxWidth: "1360px" }}>

          {/* Card 1 — Security / Privacy */}
          <div className="rounded-[40px] bg-white overflow-hidden" style={{ padding: "8px 8px 32px", boxShadow: "rgba(0,0,0,0.1) 0px 1px 1px 0px, rgba(0,0,0,0.09) 0px 1.5px 1.5px 0px, rgba(0,0,0,0.05) 0px 4px 2.5px 0px" }}>
            <ScrollReveal>
              {/* Illustration area — inset with own border-radius */}
              <div
                className="relative flex items-center justify-center overflow-hidden"
                style={{
                  height: "280px",
                  borderRadius: "32px",
                  background: "radial-gradient(62.4% 80.1% at 52.5% 31.5%, rgb(29, 127, 255) 5.5%, rgb(142, 208, 242) 78.5%)",
                }}
              >
                {/* Decorative rings */}
                <div className="absolute w-[220px] h-[220px] rounded-full border border-white/15" />
                <div className="absolute w-[160px] h-[160px] rounded-full border border-white/20" />
                {/* Glass hexagon shield */}
                <div className="relative">
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: "110px",
                      height: "120px",
                      background: "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 100%)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                      border: "1px solid rgba(255,255,255,0.4)",
                    }}
                  >
                    <ShieldIcon />
                  </div>
                  {/* Glass reflection */}
                  <div className="absolute -top-1 -left-1 w-[112px] h-[60px] rounded-t-full opacity-30"
                    style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%)", clipPath: "polygon(50% 0%, 100% 25%, 100% 50%, 0% 50%, 0% 25%)" }} />
                </div>
              </div>
              {/* Text */}
              <div style={{ padding: "20px 16px 0" }}>
                <p className="text-[15px] text-fg/70 leading-relaxed">
                  We ensure every connection stays <strong className="text-fg">secure with privacy controls</strong>, giving you full control over who you connect with and when.
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* Card 2 — Notifications / Engagement */}
          <div className="rounded-[40px] bg-white overflow-hidden" style={{ padding: "8px 8px 32px", boxShadow: "rgba(0,0,0,0.1) 0px 1px 1px 0px, rgba(0,0,0,0.09) 0px 1.5px 1.5px 0px, rgba(0,0,0,0.05) 0px 4px 2.5px 0px" }}>
            <ScrollReveal delay={150}>
              <div
                className="relative flex items-center justify-center overflow-hidden"
                style={{
                  height: "280px",
                  borderRadius: "32px",
                  background: "radial-gradient(62.4% 80.1% at 52.5% 31.5%, rgb(29, 127, 255) 5.5%, rgb(142, 208, 242) 78.5%)",
                }}
              >
                {/* Glass envelope shape */}
                <div className="relative">
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: "150px",
                      height: "110px",
                      borderRadius: "20px",
                      background: "linear-gradient(145deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 100%)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.4)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                    }}
                  >
                    <BellIcon />
                  </div>
                  {/* Glass reflection */}
                  <div className="absolute top-0 left-0 w-full h-[50%] rounded-t-[20px] opacity-30"
                    style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)" }} />
                </div>
                {/* Notification dot */}
                <div className="absolute" style={{ top: "75px", right: "calc(50% - 70px)" }}>
                  <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-white text-[10px] text-white font-bold flex items-center justify-center shadow-lg">
                    3
                  </div>
                </div>
              </div>
              <div style={{ padding: "20px 16px 0" }}>
                <p className="text-[15px] text-fg/70 leading-relaxed">
                  Never miss an <strong className="text-fg">important connection</strong>. Get notified instantly, ensuring <strong className="text-fg">you&apos;re always in the loop</strong> and ready.
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* Card 3 — Smart Search */}
          <div className="rounded-[40px] bg-white overflow-hidden" style={{ padding: "8px 8px 32px", boxShadow: "rgba(0,0,0,0.1) 0px 1px 1px 0px, rgba(0,0,0,0.09) 0px 1.5px 1.5px 0px, rgba(0,0,0,0.05) 0px 4px 2.5px 0px" }}>
            <ScrollReveal delay={300}>
              <div
                className="relative flex items-center justify-center overflow-hidden"
                style={{
                  height: "280px",
                  borderRadius: "32px",
                  background: "radial-gradient(62.4% 80.1% at 52.5% 31.5%, rgb(29, 127, 255) 5.5%, rgb(142, 208, 242) 78.5%)",
                }}
              >
                {/* Glass magnifying glass */}
                <div className="relative" style={{ transform: "rotate(-15deg)" }}>
                  {/* Glass circle lens */}
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 100%)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      border: "2px solid rgba(255,255,255,0.45)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                    }}
                  >
                    <SearchIcon />
                  </div>
                  {/* Handle */}
                  <div
                    className="absolute"
                    style={{
                      bottom: "-22px",
                      right: "-12px",
                      width: "14px",
                      height: "44px",
                      borderRadius: "7px",
                      background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.15) 100%)",
                      border: "2px solid rgba(255,255,255,0.45)",
                      transform: "rotate(-45deg)",
                    }}
                  />
                  {/* Glass reflection on lens */}
                  <div className="absolute top-2 left-3 w-[50px] h-[30px] rounded-full opacity-40"
                    style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.7) 0%, transparent 100%)" }} />
                </div>
                {/* Search text hints floating behind */}
                <div className="absolute right-6 top-[60%] flex flex-col gap-2 opacity-40">
                  <div className="w-[100px] h-2 rounded-full bg-white/50" />
                  <div className="w-[70px] h-2 rounded-full bg-white/40" />
                </div>
              </div>
              <div style={{ padding: "20px 16px 0" }}>
                <p className="text-[15px] text-fg/70 leading-relaxed">
                  Identify opportunities with <strong className="text-fg">smart search and filters</strong>, helping you stay organized and find prospects <strong className="text-fg">quickly</strong>.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 3A: Categorization Card ═══════════════════ */}
      <section className="bg-[#F9F9F9] py-12 md:py-16">
        <div className="mx-auto px-6 md:px-12">
          <ScrollReveal>
          <div
            className="relative rounded-[48px] overflow-hidden"
            style={{
              height: "720px",
              background: "radial-gradient(87.68% 87.68% at 50% 50%, #f8f8f8 0%, #ebebeb 100%)",
            }}
          >
            {/* Decorative circular rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-black/[0.06] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-black/[0.04] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-black/[0.03] pointer-events-none" />

            {/* Center content — Label + Heading */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
              <span className="text-[22px] font-black leading-[22px] text-black/[0.31] mb-3">
                AI-TAGS
              </span>
              <h2 className="font-heading text-[56px] font-bold leading-[56px] tracking-tight text-black/[0.94] text-center">
                Categorization?<br />Done for you!
              </h2>
            </div>

            {/* Scattered colorful tags — rotated, with glow shadows, partially overflowing */}
            {/* Auto Connect — top-left (Design: rotate -2deg) */}
            <div
              className="absolute z-10"
              style={{ top: "60px", left: "100px", transform: "rotate(-2deg)" }}
            >
              <span
                className="inline-flex items-center gap-3 rounded-[80px] text-white/[0.87] font-bold"
                style={{
                  padding: "24px 38px",
                  fontSize: "36px",
                  background: "rgb(83, 253, 24)",
                  boxShadow: "rgb(204, 255, 0) 0px 3px 14px 2px inset, rgba(24, 216, 62, 0.31) -9px 16px 30px 0px",
                }}
              >
                <span>🔗</span> Auto Connect
              </span>
            </div>

            {/* AI Comments — top-right (Family: rotate 10deg) */}
            <div
              className="absolute z-10"
              style={{ top: "40px", right: "90px", transform: "rotate(10deg)" }}
            >
              <span
                className="inline-flex items-center gap-3 rounded-[100px] text-white/[0.87] font-bold"
                style={{
                  padding: "28px 43px",
                  fontSize: "42px",
                  background: "rgb(253, 188, 24)",
                  boxShadow: "rgb(255, 230, 0) 0px -3px 18px 2px inset, rgba(253, 188, 24, 0.31) -10px 18px 30px 0px",
                }}
              >
                <span>💬</span> AI Comments
              </span>
            </div>

            {/* Profile Visits — bottom-left (IT-Team: rotate 6deg) */}
            <div
              className="absolute z-10"
              style={{ bottom: "70px", left: "-30px", transform: "rotate(6deg)" }}
            >
              <span
                className="inline-flex items-center gap-3 rounded-[100px] text-white/[0.87] font-bold"
                style={{
                  padding: "32px 48px",
                  fontSize: "46px",
                  background: "rgb(253, 106, 24)",
                  boxShadow: "rgb(255, 198, 0) 0px -4px 20px 0px inset, rgba(245, 107, 25, 0.31) -13px 20px 30px 0px",
                }}
              >
                <span>👁</span> Profile Visits
              </span>
            </div>

            {/* Batch Processing — bottom-right (Work: rotate -8deg) */}
            <div
              className="absolute z-10"
              style={{ bottom: "50px", right: "-40px", transform: "rotate(-8deg)" }}
            >
              <span
                className="inline-flex items-center gap-3 rounded-[120px] text-white/[0.87] font-bold"
                style={{
                  padding: "32px 56px",
                  fontSize: "56px",
                  background: "rgb(24, 106, 253)",
                  boxShadow: "rgb(0, 255, 224) 0px -5px 35px 3px inset, rgba(10, 177, 239, 0.31) 0px 15px 30px 0px",
                }}
              >
                <span>⚡</span> Batch Processing
              </span>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════════ SECTION 3B: Organize (Two-column) ═══════════════════ */}
      <section className="bg-[#F9F9F9]" style={{ padding: "56px 48px" }}>
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-12 items-center">
          {/* Left — heading + chip tags */}
          <div className="md:w-[46%] flex flex-col" style={{ gap: "56px" }}>
            <ScrollReveal>
              <h2 className="font-heading text-[56px] font-bold leading-[56px] tracking-tight text-black/[0.94]">
                Organize all the things you do.
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="flex flex-wrap" style={{ gap: "16px" }}>
                {["Auto Connect", "Profile Visits", "AI Comments", "Batch Processing", "Invitation Accept", "Voice Training", "Smart Filters"].map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-[100px] text-[18px] font-normal text-black/50"
                    style={{ padding: "18px 36px", backgroundColor: "rgb(240, 240, 240)" }}
                  >
                    {tag}
                  </span>
                ))}
                <span className="inline-flex items-center text-[18px] font-normal italic text-black/50 px-4 py-4">
                  And so much more...
                </span>
              </div>
            </ScrollReveal>
          </div>

          {/* Right — notification mockup card matching Maily exactly */}
          <ScrollReveal delay={350} className="md:w-[54%]">
          <div className="relative overflow-hidden rounded-[46px]" style={{ height: "500px" }}>
            <div
              className="absolute top-0 bottom-0 rounded-[46px] overflow-hidden"
              style={{ left: "0", width: "130%" }}
            >
              {/* Blue gradient background */}
              <img
                src="/assets/organize-card-bg.png"
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Animated category tags — seesaw push-button, tucked behind card */}
              <span
                className="seesaw-a absolute z-10 flex items-center justify-center text-white font-bold"
                style={{
                  top: "46px",
                  left: "80px",
                  padding: "16px 32px 64px",
                  fontSize: "26px",
                  borderRadius: "32px",
                  background: "rgb(255, 76, 0)",
                  boxShadow: "rgb(255, 214, 0) 0px 5px 16px 0px inset",
                }}
              >
                Solopreneur
              </span>
              <span
                className="seesaw-b absolute z-10 flex items-center justify-center text-white font-bold"
                style={{
                  top: "35px",
                  left: "296px",
                  padding: "16px 32px 64px",
                  fontSize: "26px",
                  borderRadius: "32px",
                  background: "rgb(0, 10, 255)",
                  boxShadow: "rgb(0, 255, 255) 0px 5px 16px 0px inset",
                }}
              >
                Tech
              </span>

              {/* Notification row 1 — sits on top of tags */}
              <div
                className="absolute z-20 flex items-center gap-6 overflow-hidden"
                style={{
                  top: "108px",
                  left: "28px",
                  right: "-200px",
                  height: "234px",
                  borderRadius: "72px",
                  background: "linear-gradient(179deg, rgb(255,255,255) 0%, rgb(196,228,251) 100%)",
                  padding: "0 48px",
                }}
              >
                <div
                  className="flex-shrink-0 overflow-hidden"
                  style={{
                    width: "150px",
                    height: "150px",
                    borderRadius: "312px",
                    background: "linear-gradient(178.5deg, rgb(232, 240, 255) 0%, rgb(166, 199, 255) 100%)",
                    boxShadow: "rgba(0,0,0,0.1) 0px 5px 10px 0px, rgba(0,0,0,0.09) 0px 19px 19px 0px, rgba(0,0,0,0.05) 0px 39px 24px 0px, rgba(0,0,0,0.02) 0px 72px 29px 0px",
                  }}
                >
                  <img
                    src="/assets/avatar-memoji.png"
                    alt="Sarah K."
                    style={{ width: "150px", height: "150px", objectFit: "cover" }}
                  />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <p style={{ fontSize: "38px", fontWeight: 700, color: "rgba(0,0,0,0.83)", lineHeight: 1.2 }}>Sarah K.</p>
                  <p style={{ fontSize: "22px", fontWeight: 500, color: "rgba(0,0,0,0.83)" }}>New Connection Request</p>
                  <p style={{ fontSize: "20px", fontWeight: 400, color: "rgba(0,0,0,0.83)", lineHeight: 1.4, marginTop: "4px" }}>
                    Product Lead at Google has accepted your invite. You now have 2nd degree connections with 14 people at Google.
                  </p>
                </div>
              </div>

              {/* Notification row 2 */}
              <div
                className="absolute z-20 flex items-center gap-6 overflow-hidden"
                style={{
                  top: "363px",
                  left: "28px",
                  right: "-200px",
                  height: "234px",
                  borderRadius: "72px",
                  background: "linear-gradient(179deg, rgb(255,255,255) 0%, rgba(255,255,255,0.3) 100%)",
                  padding: "0 48px",
                }}
              >
                <div
                  className="flex-shrink-0 overflow-hidden"
                  style={{
                    width: "150px",
                    height: "150px",
                    borderRadius: "312px",
                    background: "linear-gradient(178.5deg, rgb(232, 240, 255) 0%, rgb(166, 199, 255) 100%)",
                    boxShadow: "rgba(0,0,0,0.1) 0px 5px 10px 0px, rgba(0,0,0,0.09) 0px 19px 19px 0px, rgba(0,0,0,0.05) 0px 39px 24px 0px, rgba(0,0,0,0.02) 0px 72px 29px 0px",
                  }}
                >
                  <img
                    src="/assets/avatar-memoji.png"
                    alt="Mike T."
                    style={{ width: "150px", height: "150px", objectFit: "cover" }}
                  />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <p style={{ fontSize: "38px", fontWeight: 700, color: "rgba(0,0,0,0.83)", lineHeight: 1.2 }}>Mike T.</p>
                  <p style={{ fontSize: "22px", fontWeight: 500, color: "rgba(0,0,0,0.83)" }}>AI Comment Posted</p>
                  <p style={{ fontSize: "20px", fontWeight: 400, color: "rgba(0,0,0,0.83)", lineHeight: 1.4, marginTop: "4px" }}>
                    Engaging comment sent on a post about startup culture. Response rate has increased 3x this week.
                  </p>
                </div>
              </div>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════════ SECTION 4: Testimonials ═══════════════════ */}
      <section id="testimonials" className="py-14 md:py-20 px-6 md:px-12 overflow-hidden">
        {/* Blue container with rounded corners */}
        <div
          className="relative flex flex-col items-center justify-center rounded-[48px] py-[97px] px-0 gap-14 overflow-visible max-w-[1313px] mx-auto"
        >
          {/* Blue gradient background image */}
          <div
            className="absolute inset-0 rounded-[48px]"
            style={{
              background: "radial-gradient(62.4% 80.1% at 52.5% 31.5%, rgb(29, 127, 255) 5.5%, rgb(142, 208, 242) 78.5%)",
            }}
          />

          {/* Testimonials badge — overlapping top edge */}
          <div className="absolute -top-[52px] left-1/2 -translate-x-1/2 z-10 flex items-center">
            {/* Icon circle */}
            <div className="relative w-[100px] h-[100px] rounded-full bg-white shadow-[0_5px_8px_rgba(0,0,0,0.08)] flex items-center justify-center z-10">
              {/* Gradient inner circle */}
              <div
                className="w-[68px] h-[68px] rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(rgb(176,224,254) 0%, rgb(25,133,253) 100%)" }}
              >
                <StarIcon size={28} className="text-white" />
              </div>
            </div>
            {/* Text pill */}
            <div className="bg-white rounded-r-full h-[73px] flex items-center pl-[24px] pr-[28px] -ml-[26px] shadow-[0_5px_8px_rgba(0,0,0,0.08)]">
              <span className="text-[26px] font-normal text-black/75 tracking-[-0.26px] whitespace-nowrap" style={{ fontFamily: "var(--font-body)" }}>
                Testimonials
              </span>
            </div>
          </div>

          {/* Heading */}
          <ScrollReveal>
            <h2 className="relative z-[1] font-heading text-[clamp(3rem,6vw,80px)] font-semibold text-white text-center leading-[1] tracking-tight">
              Why <span className="text-white/50">people</span>
              <br />love LICON.
            </h2>
          </ScrollReveal>

          {/* Marquee card rows — overflow visible, clipped by outer section */}
          <div className="relative z-[1] flex flex-col w-full overflow-visible">
            {/* Row 1 — scrolls left */}
            <div className="flex gap-5 marquee-left w-max py-[19px]">
              {[...Array(2)].map((_, dup) => (
                <div key={dup} className="flex gap-5">
                  <TestimonialCard
                    quote="LICON has completely transformed how I network on LinkedIn. The automation and smart filters save me hours every day."
                    name="Michael R."
                    initial="M"
                    color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  />
                  <TestimonialCard
                    quote="I can't imagine networking without it. The AI-powered engagement is instant, and the categorization makes life much easier."
                    name="Samantha C."
                    initial="S"
                    color="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
                  />
                  <TestimonialCard
                    quote="The best productivity tool for LinkedIn. It just works. I love the AI-generated comments and connection automation."
                    name="David L."
                    initial="D"
                    color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                  />
                </div>
              ))}
            </div>

            {/* Row 2 — scrolls right */}
            <div className="flex gap-5 marquee-right w-max py-[19px]">
              {[...Array(2)].map((_, dup) => (
                <div key={dup} className="flex gap-5">
                  <TestimonialCard
                    quote="Setting up took under a minute and the results were immediate. My connection rate doubled in the first week alone."
                    name="Rachel K."
                    initial="R"
                    color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                  />
                  <TestimonialCard
                    quote="Finally, a tool that feels genuinely smart. The voice training for AI comments means every interaction sounds like me."
                    name="James T."
                    initial="J"
                    color="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                  />
                  <TestimonialCard
                    quote="LICON handles the repetitive work so I can focus on real conversations. The batch processing alone is worth everything."
                    name="Priya N."
                    initial="P"
                    color="linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 5: CTA Banner ═══════════════════ */}
      <section className="bg-[#F9F9F9] py-24 md:py-32">
        <div className="mx-auto px-6" style={{ maxWidth: "1360px" }}>
          <ScrollReveal>
          <div
            className="relative rounded-[50px] overflow-hidden text-center"
            style={{ aspectRatio: "1313 / 456" }}
          >
            {/* Background image */}
            <img
              src="/assets/cta-bg.png"
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Overlay texture */}
            <img
              src="/assets/cta-overlay.png"
              alt=""
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />

            {/* Left decoration */}
            <img
              src="/assets/cta-decor-left.png"
              alt=""
              className="absolute pointer-events-none hidden md:block"
              style={{ left: "0", bottom: "0", width: "30%", maxWidth: "394px" }}
            />
            {/* Right decoration */}
            <img
              src="/assets/cta-decor-right.png"
              alt=""
              className="absolute pointer-events-none hidden md:block"
              style={{ right: "0", bottom: "0", width: "26%", maxWidth: "338px" }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 py-16 md:py-20">
              <h2
                className="font-heading font-bold text-center"
                style={{ fontSize: "clamp(2rem, 4.5vw, 56px)", lineHeight: 1, color: "rgba(0,0,0,0.94)" }}
              >
                The Best LinkedIn Tool<br />Ever Made
              </h2>
              <p
                className="mt-5 text-center max-w-lg mx-auto"
                style={{ fontSize: "18px", lineHeight: "1.51", color: "rgba(0,0,0,0.69)" }}
              >
                Discover how LICON helps professionals and teams stay connected, productive, and stress-free
              </p>
              <a
                href="#"
                className="mt-8 inline-flex items-center justify-center text-white font-semibold hover:opacity-90 transition-all"
                style={{
                  fontSize: "16px",
                  padding: "20px 48px",
                  borderRadius: "20px",
                  background: "linear-gradient(182deg, rgb(60,60,60) 0%, rgb(35,35,35) 100%)",
                }}
              >
                Try it first
              </a>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════════ SECTION 6: Works With Tools (Scattered/organic) ═══════════════════ */}
      <section className="bg-[#F9F9F9] pb-24 md:pb-32 border-t border-black/[0.05]">
        <div className="mx-auto px-6 pt-24 md:pt-32" style={{ maxWidth: "1360px" }}>
          <ScrollReveal>
          <div className="relative" style={{ height: "720px" }}>
            {/* Centered heading */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none px-4">
              <h2 className="font-heading font-bold tracking-tight text-center" style={{ fontSize: "clamp(2.5rem, 5.5vw, 80px)", lineHeight: 1 }}>
                <span style={{ color: "rgb(0,0,0)" }}>Works</span>{" "}
                <span style={{ color: "rgba(0,0,0,0.5)" }}>with your<br />favorite tools...</span>
              </h2>
            </div>

            {/* 0: Chrome — top-left (22%, 24px, 160px, -14deg) */}
            <div className="absolute" style={{ left: "22%", top: "24px", transform: "rotate(-14deg)" }}>
              <ToolCircle size={160}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#1A1A1A" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="4" fill="#1A1A1A" />
                  <path d="M12 8 L22 8" stroke="#1A1A1A" strokeWidth="1.5" />
                  <path d="M12 8 L7 16.5" stroke="#1A1A1A" strokeWidth="1.5" />
                  <path d="M17 16.5 L7 16.5" stroke="#1A1A1A" strokeWidth="1.5" />
                </svg>
              </ToolCircle>
            </div>

            {/* 1: LinkedIn — top-center (49%, 41px, 140px, -9deg) */}
            <div className="absolute" style={{ left: "49%", top: "41px", transform: "rotate(-9deg)" }}>
              <ToolCircle size={140}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="#1A1A1A">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </ToolCircle>
            </div>

            {/* 2: Google — top-right (72%, 70px, 140px, 13deg) */}
            <div className="absolute" style={{ left: "72%", top: "70px", transform: "rotate(13deg)" }}>
              <ToolCircle size={140}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#1A1A1A" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#1A1A1A" opacity="0.7" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#1A1A1A" opacity="0.5" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#1A1A1A" opacity="0.9" />
                </svg>
              </ToolCircle>
            </div>

            {/* 3: Notion — mid-left (8%, 218px, 120px, -14deg) */}
            <div className="absolute" style={{ left: "8%", top: "218px", transform: "rotate(-14deg)" }}>
              <ToolCircle size={120}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L18.29 2.17c-.467-.373-.7-.653-1.539-.56l-12.77.84c-.466.046-.56.28-.373.466l.852 1.29zm.793 2.686v13.89c0 .746.373 1.026 1.213.98l14.521-.84c.84-.046.933-.56.933-1.166V5.874c0-.606-.233-.933-.746-.886l-15.175.84c-.56.046-.746.326-.746.886zm14.335.653c.093.42 0 .84-.42.886l-.7.14v10.264c-.607.327-1.167.514-1.634.514-.746 0-.933-.234-1.493-.933l-4.573-7.182v6.952l1.446.327s0 .84-1.166.84l-3.22.187c-.093-.187 0-.653.327-.746l.84-.234V8.294L7.71 8.2c-.093-.42.14-1.026.793-1.073l3.46-.233 4.76 7.276V7.894l-1.213-.14c-.093-.514.28-.886.746-.933l3.33-.187z" fill="#1A1A1A" />
                </svg>
              </ToolCircle>
            </div>

            {/* 4: Slack — mid-right (80%, 305px, 120px, 16deg) */}
            <div className="absolute" style={{ left: "80%", top: "305px", transform: "rotate(16deg)" }}>
              <ToolCircle size={120}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="9" width="5" height="5" rx="2.5" fill="#1A1A1A" />
                  <rect x="9" y="2" width="5" height="5" rx="2.5" fill="#1A1A1A" opacity="0.7" />
                  <rect x="17" y="9" width="5" height="5" rx="2.5" fill="#1A1A1A" opacity="0.9" />
                  <rect x="9" y="17" width="5" height="5" rx="2.5" fill="#1A1A1A" opacity="0.5" />
                  <rect x="9" y="9" width="5" height="5" rx="1" fill="#1A1A1A" opacity="0.3" />
                </svg>
              </ToolCircle>
            </div>

            {/* 5: Zoom — bottom-left (13%, 461px, 120px, -7deg) */}
            <div className="absolute" style={{ left: "13%", top: "461px", transform: "rotate(-7deg)" }}>
              <ToolCircle size={120}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="#1A1A1A">
                  <path d="M4.585 6.836h9.558a2.75 2.75 0 012.75 2.75v4.835l3.32-2.325a.75.75 0 011.201.6v4.608a.75.75 0 01-1.2.6l-3.321-2.325v.607a2.75 2.75 0 01-2.75 2.75H4.585a2.75 2.75 0 01-2.75-2.75V9.586a2.75 2.75 0 012.75-2.75z" />
                </svg>
              </ToolCircle>
            </div>

            {/* 6: GitHub — bottom-right (69%, 495px, 160px, -16deg) */}
            <div className="absolute" style={{ left: "69%", top: "495px", transform: "rotate(-16deg)" }}>
              <ToolCircle size={160}>
                <svg width="46" height="46" fill="#1A1A1A" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </ToolCircle>
            </div>

            {/* 7: Figma — bottom-center (52%, 514px, 120px, -7deg) */}
            <div className="absolute" style={{ left: "52%", top: "514px", transform: "rotate(-7deg)" }}>
              <ToolCircle size={120}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="#1A1A1A">
                  <path d="M5 5.5A3.5 3.5 0 018.5 2H12v7H8.5A3.5 3.5 0 015 5.5zM12 2h3.5a3.5 3.5 0 110 7H12V2z" />
                  <path d="M12 12.5a3.5 3.5 0 113.5-3.5 3.5 3.5 0 01-3.5 3.5zm-7 4A3.5 3.5 0 018.5 13H12v3.5A3.5 3.5 0 015 16.5zM5 12.5A3.5 3.5 0 018.5 9H12v7H8.5A3.5 3.5 0 015 12.5z" opacity="0.7" />
                </svg>
              </ToolCircle>
            </div>

            {/* 8: HubSpot — bottom-left-center (31%, 517px, 160px, -6deg) */}
            <div className="absolute" style={{ left: "31%", top: "517px", transform: "rotate(-6deg)" }}>
              <ToolCircle size={160}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="#1A1A1A">
                  <path d="M17.002 8.737V6.665a2.089 2.089 0 001.2-1.884 2.11 2.11 0 00-2.11-2.11 2.11 2.11 0 00-2.11 2.11c0 .825.48 1.534 1.17 1.878v2.078a5.317 5.317 0 00-2.4 1.08l-6.37-4.956a2.032 2.032 0 00.06-.472A2.02 2.02 0 004.43 2.38a2.02 2.02 0 00-2.01 2.01 2.02 2.02 0 002.44 1.973l6.26 4.87a5.32 5.32 0 00-.62 2.49 5.34 5.34 0 00.72 2.68l-1.94 1.94a1.69 1.69 0 00-.49-.08 1.72 1.72 0 00-1.72 1.72 1.72 1.72 0 001.72 1.72 1.72 1.72 0 001.72-1.72c0-.17-.03-.34-.08-.49l1.9-1.9a5.32 5.32 0 003.38 1.22 5.34 5.34 0 005.34-5.34 5.35 5.35 0 00-3.75-5.1zm-.91 7.74a2.64 2.64 0 01-2.64-2.64 2.64 2.64 0 012.64-2.64 2.64 2.64 0 012.64 2.64 2.64 2.64 0 01-2.64 2.64z" />
                </svg>
              </ToolCircle>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════════ SECTION 7: FAQ (Two-column) ═══════════════════ */}
      <section style={{ padding: "56px 48px", background: "transparent" }}>
        <div className="mx-auto" style={{ maxWidth: "1360px" }}>
          <div className="flex flex-col md:flex-row" style={{ gap: "64px" }}>
            {/* Left column — heading + subtitle (34%) */}
            <div className="md:flex-shrink-0" style={{ width: "34%" }}>
              <ScrollReveal>
                <h2 className="font-heading font-bold leading-[1] tracking-tight" style={{ fontSize: "clamp(2rem, 4.5vw, 56px)", color: "rgba(0,0,0,0.94)" }}>
                  Frequently asked questions
                </h2>
                <p className="mt-6" style={{ fontSize: "17px", color: "rgba(0,0,0,0.5)", lineHeight: 1.6 }}>
                  Got questions? We&apos;ve got the answers to help you get started smoothly.
                </p>
              </ScrollReveal>
            </div>

            {/* Right column — accordion items */}
            <div className="flex-1">
              <ScrollReveal delay={150}>
              <div className="flex flex-col" style={{ gap: "16px" }}>
              {[
                {
                  q: "How does LICON automate LinkedIn connections?",
                  a: "LICON uses intelligent automation to send personalized connection requests from search results and company pages. It manages timing, limits, and personalization automatically.",
                },
                {
                  q: "Is my LinkedIn account safe?",
                  a: "Yes. LICON operates within LinkedIn's browser environment and includes built-in safety features like rate limiting and natural delays to protect your account.",
                },
                {
                  q: "What is AI-powered engagement?",
                  a: "LICON can generate contextual comments on your network's posts using AI, helping you maintain authentic engagement at scale.",
                },
                {
                  q: "Do I need to code?",
                  a: "Not at all. LICON is a Chrome extension with a simple side panel interface. Just install and start automating.",
                },
              ].map(({ q, a }) => (
                <details
                  key={q}
                  className="group cursor-pointer list-none"
                  style={{
                    borderRadius: "24px",
                    padding: "32px",
                    background: "rgba(245,245,245,0.7)",
                    boxShadow: "rgb(255,255,255) 0px 0px 68px 0px inset, rgba(0,0,0,0.06) 0px 1px 2px 0px, rgba(0,0,0,0.04) 0px 4px 8px 0px",
                    border: "1px solid rgba(0,0,0,0.04)",
                  }}
                >
                  <summary className="flex items-center select-none list-none [&::-webkit-details-marker]:hidden" style={{ gap: "24px" }}>
                    {/* Blue + SVG cross icon (26x26, #0C7DFF) */}
                    <svg className="flex-shrink-0 transition-transform group-open:rotate-45" width="26" height="26" viewBox="0 0 26 26" fill="#0C7DFF">
                      <path d="M12.7 25.08c-.47 0-.93-.19-1.27-.52a1.79 1.79 0 01-.52-1.27V1.79C10.91 1.32 11.1.86 11.43.52A1.79 1.79 0 0112.7 0c.48 0 .93.19 1.27.52.34.34.52.79.52 1.27v21.5c0 .47-.19.93-.52 1.27-.34.34-.79.52-1.27.52z" />
                      <path d="M1.95 14.33c-.47 0-.93-.19-1.27-.52A1.79 1.79 0 01.16 12.54c0-.48.19-.93.52-1.27.34-.34.79-.52 1.27-.52h21.5c.48 0 .93.19 1.27.52.34.34.52.79.52 1.27 0 .47-.19.93-.52 1.27-.34.34-.79.52-1.27.52H1.95z" />
                    </svg>
                    <span className="font-heading" style={{ fontSize: "22px", fontWeight: 500, color: "rgb(0,0,0)" }}>
                      {q}
                    </span>
                  </summary>
                  <p className="leading-relaxed" style={{ marginTop: "16px", paddingLeft: "50px", fontSize: "16px", color: "rgba(0,0,0,0.5)" }}>
                    {a}
                  </p>
                </details>
              ))}
              </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 8: Giant LICON + Footer ═══════════════════ */}
      <footer
        className="relative overflow-hidden"
        style={{
          minHeight: "100svh",
          background: "linear-gradient(to bottom, rgb(14,126,255) 0%, rgb(30,135,255) 40%, rgb(57,149,254) 100%)",
        }}
      >
        {/* Giant embossed LICON text — glossy blue glass effect */}
        <div className="flex items-center justify-center overflow-hidden" style={{ paddingTop: "60px", paddingBottom: "20px" }}>
          <span
            className="font-heading font-black select-none pointer-events-none leading-none bg-clip-text text-transparent"
            style={{
              fontSize: "clamp(180px, 28vw, 480px)",
              backgroundImage: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(240,250,255,0.95) 10%, rgba(200,230,255,0.85) 25%, rgba(140,200,255,0.7) 45%, rgba(120,190,255,0.55) 65%, rgba(100,180,255,0.4) 82%, rgba(90,175,255,0.3) 100%)",
              WebkitTextStroke: "1px rgba(255,255,255,0.5)",
            }}
          >
            LICON
          </span>
        </div>

        {/* Footer content */}
        <div className="max-w-6xl mx-auto px-6 pb-16 md:pb-20">
          <div className="flex flex-col md:flex-row md:justify-between gap-10">
            {/* Brand column — left */}
            <div>
              <p className="font-heading text-[40px] text-white font-normal mb-3">LICON</p>
              <p className="text-[16px] text-white/70 font-medium leading-relaxed max-w-[320px]">
                LinkedIn connection automation for modern professionals and teams.
              </p>
              <p className="text-[14px] text-white/50 mt-3">Built by <a href="https://atrey.dev" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors underline underline-offset-2">atrey.dev</a></p>
              <div className="flex gap-4 mt-6">
                <a
                  href="https://github.com/AnshumanAtrey/licon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition-colors"
                  aria-label="GitHub"
                >
                  <GitHubIcon size={24} />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition-colors"
                  aria-label="LinkedIn"
                >
                  <LinkedInIcon size={24} />
                </a>
              </div>
            </div>

            {/* Right columns */}
            <div className="flex gap-16 md:gap-20">
              {/* Legal column */}
              <div>
                <p className="text-[24px] text-white mb-5">Legal</p>
                <ul className="flex flex-col gap-3">
                  <li>
                    <a href="/privacy-policy" className="text-[16px] text-white/70 font-medium hover:text-white transition-colors">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="/changelog" className="text-[16px] text-white/70 font-medium hover:text-white transition-colors">
                      Changelog
                    </a>
                  </li>
                </ul>
              </div>

              {/* Menu column */}
              <div>
                <p className="text-[24px] text-white mb-5">Menu</p>
                <ul className="flex flex-col gap-3">
                  <li>
                    <a href="#" className="text-[16px] text-white/70 font-medium hover:text-white transition-colors">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="#features" className="text-[16px] text-white/70 font-medium hover:text-white transition-colors">
                      Features
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/AnshumanAtrey/licon"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[16px] text-white/70 font-medium hover:text-white transition-colors"
                    >
                      GitHub
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
