import { Link } from 'react-router-dom'

const FEATURES = [
  {
    icon: '💬',
    title: 'AI Tutor Chat',
    desc: 'Ask anything about your topic. Get concise, mentor-style explanations tailored to your level.',
  },
  {
    icon: '🧠',
    title: 'Smart Quizzes',
    desc: 'AI-generated MCQs that adapt to your weak areas. The more you quiz, the smarter it gets.',
  },
  {
    icon: '📊',
    title: 'Progress Review',
    desc: 'Track your accuracy, study streak, and weak areas. See exactly where to focus next.',
  },
  {
    icon: '📚',
    title: 'Your Materials',
    desc: 'Upload PDFs, paste notes, or add URLs. The AI learns from your specific study material.',
  },
]

const TOPICS = ['System Design', 'AWS', 'Databricks', 'Python', 'Machine Learning', 'Kubernetes']

export default function Landing() {
  return (
    <div style={styles.page}>
      {/* Nav */}
      <nav style={styles.nav}>
        <span style={styles.logo}>study<span style={styles.dot}>.</span>ai</span>
        <div style={styles.navLinks}>
          <Link to="/login" style={styles.loginLink}>Sign in</Link>
          <Link to="/register" style={styles.ctaBtn}>Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.badge}>AI-powered learning</div>
        <h1 style={styles.headline}>
          Your personal AI tutor<br />
          <span style={styles.headlineAccent}>for any technical topic</span>
        </h1>
        <p style={styles.subline}>
          Chat with an AI mentor, quiz yourself on weak areas, and track your progress —
          all personalized to your study materials.
        </p>
        <div style={styles.heroCtas}>
          <Link to="/register" style={styles.primaryBtn}>Start learning free</Link>
          <Link to="/login" style={styles.secondaryBtn}>Sign in</Link>
        </div>
        <div style={styles.topicPills}>
          {TOPICS.map(t => (
            <span key={t} style={styles.pill}>{t}</span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={styles.features}>
        <h2 style={styles.sectionTitle}>Everything you need to learn faster</h2>
        <div style={styles.featureGrid}>
          {FEATURES.map(f => (
            <div key={f.title} style={styles.featureCard}>
              <div style={styles.featureIcon}>{f.icon}</div>
              <div style={styles.featureTitle}>{f.title}</div>
              <div style={styles.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={styles.banner}>
        <h2 style={styles.bannerTitle}>Ready to study smarter?</h2>
        <p style={styles.bannerSub}>Free to use. No credit card required.</p>
        <Link to="/register" style={styles.primaryBtn}>Create your account</Link>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <span style={styles.logo}>study<span style={styles.dot}>.</span>ai</span>
        <span style={styles.footerText}>Built with FastAPI, React, and Groq</span>
      </footer>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh', overflowY: 'auto', background: 'var(--bg)',
    display: 'flex', flexDirection: 'column',
  },

  // Nav
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 40px', borderBottom: '1px solid var(--border)',
    background: 'var(--bg2)', position: 'sticky', top: 0, zIndex: 10,
  },
  logo: { fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--text)' },
  dot: { color: 'var(--accent)' },
  navLinks: { display: 'flex', alignItems: 'center', gap: '12px' },
  loginLink: { color: 'var(--muted)', textDecoration: 'none', fontSize: '14px', padding: '8px 12px' },

  // Hero
  hero: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textAlign: 'center', padding: '80px 40px 60px', gap: '24px',
  },
  badge: {
    background: 'var(--pill)', border: '1px solid var(--pill-border)',
    color: 'var(--accent2)', borderRadius: '20px', padding: '6px 16px', fontSize: '12px', fontWeight: 500,
  },
  headline: {
    fontSize: '52px', fontWeight: 700, lineHeight: 1.15,
    fontFamily: 'Syne, sans-serif', color: 'var(--text)', margin: 0,
  },
  headlineAccent: { color: 'var(--accent)' },
  subline: {
    fontSize: '16px', color: 'var(--muted)', lineHeight: 1.7,
    maxWidth: '560px', margin: 0,
  },
  heroCtas: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' },
  topicPills: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' },
  pill: {
    background: 'var(--bg3)', border: '1px solid var(--border2)',
    color: 'var(--muted)', borderRadius: '20px', padding: '5px 14px', fontSize: '12px',
  },

  // Buttons
  primaryBtn: {
    background: 'var(--accent)', color: '#fff', textDecoration: 'none',
    borderRadius: '10px', padding: '12px 24px', fontSize: '14px', fontWeight: 500,
    border: 'none', cursor: 'pointer', display: 'inline-block',
  },
  secondaryBtn: {
    background: 'transparent', color: 'var(--muted)', textDecoration: 'none',
    borderRadius: '10px', padding: '12px 24px', fontSize: '14px',
    border: '1px solid var(--border2)', display: 'inline-block',
  },
  ctaBtn: {
    background: 'var(--accent)', color: '#fff', textDecoration: 'none',
    borderRadius: '8px', padding: '8px 18px', fontSize: '13px', fontWeight: 500,
  },

  // Features
  features: { padding: '60px 40px', maxWidth: '1000px', margin: '0 auto', width: '100%' },
  sectionTitle: {
    fontSize: '28px', fontWeight: 700, fontFamily: 'Syne, sans-serif',
    color: 'var(--text)', textAlign: 'center', marginBottom: '36px',
  },
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' },
  featureCard: {
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: '14px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '10px',
  },
  featureIcon: { fontSize: '28px' },
  featureTitle: { fontSize: '16px', fontWeight: 600, color: 'var(--text)' },
  featureDesc: { fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6 },

  // Banner
  banner: {
    margin: '20px 40px 60px', background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: '16px', padding: '48px', textAlign: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
  },
  bannerTitle: { fontSize: '28px', fontWeight: 700, fontFamily: 'Syne, sans-serif', color: 'var(--text)' },
  bannerSub: { fontSize: '14px', color: 'var(--muted)' },

  // Footer
  footer: {
    padding: '24px 40px', borderTop: '1px solid var(--border)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: { fontSize: '12px', color: 'var(--muted2)' },
}
