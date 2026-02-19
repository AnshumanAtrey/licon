import Image from "next/image";
import ScrollReveal from "../scroll-reveal";

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

/* ── Content Card (neumorphic Maily-style) ── */
function PolicyCard({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <ScrollReveal delay={delay}>
      <div
        className="relative overflow-hidden"
        style={{
          borderRadius: "50px",
          padding: "40px",
          width: "100%",
          maxWidth: "700px",
          margin: "0 auto",
          border: "1px solid rgba(255,255,255,1)",
          boxShadow:
            "rgba(0,0,0,0.1) 0px 0.84px 0.84px 0px, rgba(0,0,0,0.09) 0px 1.69px 1.69px 0px, rgba(0,0,0,0.05) 0px 4.21px 2.53px 0px, rgba(0,0,0,0.01) 0px 7.58px 3.37px 0px",
          background: "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(245,245,245,0.7) 100%)",
        }}
      >
        <h3
          className="font-heading"
          style={{
            fontSize: "32px",
            fontWeight: 700,
            color: "rgba(0,0,0,0.94)",
            lineHeight: "32px",
            marginBottom: "32px",
          }}
        >
          {title}
        </h3>
        <div
          className="flex flex-col"
          style={{
            gap: "24px",
            fontSize: "18px",
            fontWeight: 400,
            color: "rgba(0,0,0,0.69)",
            lineHeight: "27px",
          }}
        >
          {children}
        </div>
      </div>
    </ScrollReveal>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen text-fg font-body" style={{ background: "#F9F9F9" }}>
      {/* ═══════════════════ NAV ═══════════════════ */}
      <nav className="relative z-50 flex justify-center pt-5 px-4">
        <div className="flex items-center gap-1 bg-white/80 backdrop-blur-xl rounded-full px-2.5 py-2 shadow-lg shadow-black/[0.04] border border-white/60">
          <a href="/" className="flex items-center gap-2 pl-2 pr-4">
            <Image
              src="/assets/icons/icon48.png"
              alt="LICON"
              width={28}
              height={28}
            />
          </a>
          <a
            href="/#features"
            className="hidden sm:inline-block px-4 py-2.5 text-[16px] font-medium text-fg hover:text-fg/70 transition-colors rounded-full"
          >
            Features
          </a>
          <a
            href="/#stats"
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
          <a
            href="/"
            className="bg-fg text-white px-10 py-3 rounded-[15px] text-[16px] font-semibold hover:bg-fg/85 transition-colors ml-1"
          >
            Add to Chrome
          </a>
        </div>
      </nav>

      {/* ═══════════════════ HEADER ═══════════════════ */}
      <header className="flex flex-col items-center text-center px-6 pt-16 pb-8" style={{ gap: "24px" }}>
        {/* Badge */}
        <ScrollReveal>
          <div
            className="inline-flex items-center justify-center"
            style={{
              backgroundColor: "rgb(255,255,255)",
              borderRadius: "100px",
              boxShadow: "rgba(0,0,0,0.07) 0px 5.38px 9.14px 0px",
              padding: "14px 28px",
            }}
          >
            <span style={{ fontSize: "18px", color: "rgba(0,0,0,0.69)" }}>
              Privacy Policy
            </span>
          </div>
        </ScrollReveal>

        {/* Heading */}
        <ScrollReveal delay={100}>
          <h1
            className="font-heading"
            style={{
              fontSize: "56px",
              fontWeight: 700,
              color: "rgba(0,0,0,0.94)",
              lineHeight: "56px",
            }}
          >
            Our Privacy Policy
          </h1>
        </ScrollReveal>

        {/* Subtitle */}
        <ScrollReveal delay={200}>
          <p
            style={{
              fontSize: "18px",
              color: "rgba(0,0,0,0.69)",
              lineHeight: "27px",
              maxWidth: "480px",
            }}
          >
            By using LICON, you agree to the collection and use of information
            in accordance with this Privacy Policy.
          </p>
        </ScrollReveal>

        {/* Last updated badge */}
        <ScrollReveal delay={300}>
          <div
            className="inline-flex items-center justify-center"
            style={{
              backgroundColor: "rgb(240,240,240)",
              borderRadius: "100px",
              padding: "18px 36px",
            }}
          >
            <span style={{ fontSize: "18px", color: "rgba(0,0,0,0.5)" }}>
              Last updated: 19 Feb 2026
            </span>
          </div>
        </ScrollReveal>

        {/* Divider */}
        <div
          style={{
            width: "200px",
            height: "1px",
            backgroundColor: "rgb(217,217,217)",
            marginTop: "16px",
          }}
        />
      </header>

      {/* ═══════════════════ CONTENT CARDS ═══════════════════ */}
      <main
        className="flex flex-col items-center px-6 pb-24"
        style={{ gap: "40px" }}
      >
        {/* 1. Information We Collect */}
        <PolicyCard title="Information We Collect">
          <p>
            LICON collects minimal data to provide and improve the extension.
            This includes:
          </p>
          <p>
            Personal Information: Your name and LinkedIn profile details as
            visible on your LinkedIn page when using the extension.
          </p>
          <p>
            Usage Data: Information about how you interact with the extension,
            including features used, connection requests sent, and engagement
            actions taken.
          </p>
          <p>
            Configuration Data: Your extension settings, preferences, and
            automation rules stored locally in your browser.
          </p>
        </PolicyCard>

        {/* 2. How We Use Your Information */}
        <PolicyCard title="How We Use Your Information" delay={50}>
          <p>
            We use the data we collect to provide and maintain the extension,
            send connection requests and engagement actions on your behalf, and
            improve the user experience.
          </p>
          <p>
            Your LinkedIn activity data is processed locally in your browser and
            is not transmitted to external servers unless you explicitly enable
            AI-powered features that require API calls.
          </p>
          <p>
            We do not sell, rent, or share your personal information with third
            parties for marketing purposes.
          </p>
        </PolicyCard>

        {/* 3. Data Sharing and Disclosure */}
        <PolicyCard title="Data Sharing and Disclosure" delay={100}>
          <p>
            LICON operates primarily as a client-side Chrome extension. Your
            data stays in your browser.
          </p>
          <p>
            If you enable AI engagement features, comment text may be sent to
            your configured LLM provider (e.g., OpenAI, Anthropic) to generate
            responses. No other personal data is included in these requests.
          </p>
          <p>
            We may disclose information when required by law or in response to
            legal requests.
          </p>
        </PolicyCard>

        {/* 4. Data Retention */}
        <PolicyCard title="Data Retention" delay={150}>
          <p>
            All extension data is stored locally in your browser using Chrome&apos;s
            storage APIs. We do not maintain external databases of your
            information.
          </p>
          <p>
            When you uninstall the extension, all locally stored data is
            automatically removed from your browser.
          </p>
        </PolicyCard>

        {/* 5. Your Data Protection Rights */}
        <PolicyCard title="Your Data Protection Rights" delay={200}>
          <p>
            You have full control over your data. You can access, update, or
            delete your extension settings and stored data at any time through
            the extension&apos;s side panel.
          </p>
          <p>
            You can disable any automation features individually, revoke AI
            engagement permissions, or uninstall the extension entirely to
            remove all data.
          </p>
          <p>
            If you have questions about your data, please contact us using the
            information below.
          </p>
        </PolicyCard>

        {/* 6. Changes to This Privacy Policy */}
        <PolicyCard title="Changes to This Privacy Policy" delay={250}>
          <p>
            This Privacy Policy may be updated from time to time. Changes will
            be reflected on this page with an updated revision date.
          </p>
          <p>
            We encourage you to review this Privacy Policy periodically to stay
            informed about how we protect your information.
          </p>
        </PolicyCard>

        {/* 7. Contact Us */}
        <PolicyCard title="Contact Us" delay={300}>
          <p>
            If you have questions or concerns about this Privacy Policy, please
            contact us at:
          </p>
          <p>
            Email:{" "}
            <a
              href="mailto:support@licon.dev"
              className="text-accent hover:underline"
            >
              support@licon.dev
            </a>
          </p>
          <p>
            GitHub:{" "}
            <a
              href="https://github.com/AnshumanAtrey/licon"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              github.com/AnshumanAtrey/licon
            </a>
          </p>
        </PolicyCard>
      </main>

      {/* ═══════════════════ CTA BANNER ═══════════════════ */}
      <section className="px-6 pb-24" style={{ maxWidth: "1360px", margin: "0 auto" }}>
        <ScrollReveal>
          <div
            className="relative rounded-[50px] overflow-hidden text-center"
            style={{ aspectRatio: "1313 / 456" }}
          >
            <img
              src="/assets/cta-bg.png"
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <img
              src="/assets/cta-overlay.png"
              alt=""
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
            <img
              src="/assets/cta-decor-left.png"
              alt=""
              className="absolute pointer-events-none hidden md:block"
              style={{ left: "0", bottom: "0", width: "30%", maxWidth: "394px" }}
            />
            <img
              src="/assets/cta-decor-right.png"
              alt=""
              className="absolute pointer-events-none hidden md:block"
              style={{ right: "0", bottom: "0", width: "26%", maxWidth: "338px" }}
            />
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
                Discover how LICON helps professionals and teams stay connected,
                productive, and stress-free
              </p>
              <a
                href="/"
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
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(to bottom, rgba(13,126,255,0) 0%, rgba(13,126,255,0.12) 18%, rgb(14,126,255) 48%, rgb(57,149,254) 100%)",
        }}
      >
        <div
          className="flex items-center justify-center overflow-hidden"
          style={{ paddingTop: "60px", paddingBottom: "20px" }}
        >
          <span
            className="font-heading font-black select-none pointer-events-none leading-none"
            style={{
              fontSize: "clamp(180px, 26vw, 420px)",
              background: "linear-gradient(180deg, rgba(160,210,255,0.85) 0%, rgba(80,165,255,0.7) 30%, rgba(50,140,255,0.55) 60%, rgba(30,120,255,0.4) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              WebkitTextStroke: "1px rgba(120,190,255,0.4)",
              filter: "drop-shadow(-1px -1px 0px rgba(200,230,255,0.6)) drop-shadow(1px 2px 2px rgba(40,110,255,0.2))",
            }}
          >
            LICON
          </span>
        </div>

        <div className="max-w-6xl mx-auto px-6 pb-16 md:pb-20">
          <div className="flex flex-col md:flex-row md:justify-between gap-10">
            <div>
              <p className="font-heading text-[40px] text-white font-normal mb-3">LICON</p>
              <p className="text-[16px] text-white/70 font-medium leading-relaxed max-w-[320px]">
                LinkedIn connection automation for modern professionals and teams.
              </p>
              <p className="text-[14px] text-white/50 mt-3">Built by <a href="https://atrey.dev" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors underline underline-offset-2">atrey.dev</a></p>
              <div className="flex gap-4 mt-6">
                <a href="https://github.com/AnshumanAtrey/licon" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors" aria-label="GitHub">
                  <GitHubIcon size={24} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors" aria-label="LinkedIn">
                  <LinkedInIcon size={24} />
                </a>
              </div>
            </div>

            <div className="flex gap-16 md:gap-20">
              <div>
                <p className="text-[24px] text-white mb-5">Legal</p>
                <ul className="flex flex-col gap-3">
                  <li><a href="/privacy-policy" className="text-[16px] text-white/70 font-medium hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="/changelog" className="text-[16px] text-white/70 font-medium hover:text-white transition-colors">Changelog</a></li>
                </ul>
              </div>
              <div>
                <p className="text-[24px] text-white mb-5">Menu</p>
                <ul className="flex flex-col gap-3">
                  <li><a href="/" className="text-[16px] text-white/70 font-medium hover:text-white transition-colors">Home</a></li>
                  <li><a href="/#features" className="text-[16px] text-white/70 font-medium hover:text-white transition-colors">Features</a></li>
                  <li><a href="https://github.com/AnshumanAtrey/licon" target="_blank" rel="noopener noreferrer" className="text-[16px] text-white/70 font-medium hover:text-white transition-colors">GitHub</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
