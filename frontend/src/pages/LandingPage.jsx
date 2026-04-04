import { Button, Collapse, Typography } from 'antd'
import {
  ApiOutlined,
  BookOutlined,
  CloudUploadOutlined,
  FileSearchOutlined,
  MessageOutlined,
  NodeIndexOutlined,
  RocketOutlined,
  SafetyOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { motion as Motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'

const { Title, Paragraph, Text } = Typography

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
}

const stagger = {
  animate: {
    transition: { staggerChildren: 0.1, delayChildren: 0.12 },
  },
}

const viewFade = (reduce) => ({
  initial: { opacity: 0, y: reduce ? 0 : 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: reduce ? 0.01 : 0.55, ease: [0.22, 1, 0.36, 1] },
})

const features = [
  {
    icon: <MessageOutlined />,
    title: 'Grounded answers',
    text: 'Responses tied to your uploads with clear source lines — not generic web copy.',
  },
  {
    icon: <TeamOutlined />,
    title: 'Teams & roles',
    text: 'Admins run workspaces; invite users and control who can upload documents.',
  },
  {
    icon: <CloudUploadOutlined />,
    title: 'Simple ingestion',
    text: 'PDF, Word, Markdown, and plain text. Chunked, embedded, and ready to query.',
  },
  {
    icon: <SafetyOutlined />,
    title: 'Tenant isolation',
    text: 'Each admin workspace is separate — built for real multi-tenant scenarios.',
  },
]

const stats = [
  { value: 'Multi-format', label: 'PDF · DOCX · TXT' },
  { value: 'Chat threads', label: 'Session history per user' },
  { value: 'RAG + LLM', label: 'Ollama' },
  { value: 'Platform admin', label: 'Optional super admin console' },
]

const steps = [
  {
    n: '01',
    title: 'Upload',
    text: 'Drop files into your workspace. They are parsed, chunked, and indexed automatically.',
    icon: <CloudUploadOutlined />,
  },
  {
    n: '02',
    title: 'Ask',
    text: 'Use natural language. Retrieval finds the right passages before the model answers.',
    icon: <FileSearchOutlined />,
  },
  {
    n: '03',
    title: 'Verify',
    text: 'See which documents grounded the reply. Open threads and continue the conversation.',
    icon: <BookOutlined />,
  },
]

const useCases = [
  {
    title: 'HR & policy',
    text: 'Handbooks, PTO rules, and internal FAQs — answered with citations from your own PDFs.',
    icon: <TeamOutlined />,
  },
  {
    title: 'Compliance & legal',
    text: 'Contracts and clauses without hunting folders. Keep answers scoped to approved files.',
    icon: <SafetyOutlined />,
  },
  {
    title: 'Ops & knowledge',
    text: 'Runbooks, specs, and wikis. New hires ask the assistant instead of pinging seniors.',
    icon: <ThunderboltOutlined />,
  },
]

const faqItems = [
  {
    key: '1',
    label: 'Who can sign up?',
    children: (
      <Paragraph type="secondary" style={{ margin: 0, maxWidth: 640 }}>
        Public registration creates an <strong>admin</strong> workspace. That admin can add team users and optionally
        allow uploads. A separate <strong>super admin</strong> can oversee admins when enabled by your deployment.
      </Paragraph>
    ),
  },
  {
    key: '2',
    label: 'Where do my documents live?',
    children: (
      <Paragraph type="secondary" style={{ margin: 0, maxWidth: 640 }}>
        Files are stored and indexed for your tenant. Chats reference only what you (or your admin) have uploaded for
        that workspace.
      </Paragraph>
    ),
  },
  {
    key: '3',
    label: 'Can I use my own LLM?',
    children: (
      <Paragraph type="secondary" style={{ margin: 0, maxWidth: 640 }}>
        Yes. The stack supports <strong>Ollama</strong> for self-hosted models and <strong>OpenAI</strong>-compatible
        APIs — configure your backend environment to match your setup.
      </Paragraph>
    ),
  },
  {
    key: '4',
    label: 'Is this a replacement for Google?',
    children: (
      <Paragraph type="secondary" style={{ margin: 0, maxWidth: 640 }}>
        No — it complements search by answering from <em>your</em> curated documents, with traceability to sources.
      </Paragraph>
    ),
  },
]

const LandingPage = () => {
  const reduce = useReducedMotion()

  return (
    <div className="landing-root">
      <div className="landing-bg-grid" aria-hidden />

      <header className="landing-nav">
        <Motion.div
          className="landing-nav-inner"
          initial={{ opacity: 0, y: reduce ? 0 : -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0.01 : 0.45 }}
        >
          <Motion.span
            className="landing-logo"
            whileHover={reduce ? {} : { scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            RAG Workspace
          </Motion.span>
          <div className="landing-nav-actions">
            <Link to="/login">
              <Button type="text" className="landing-nav-link">
                Sign in
              </Button>
            </Link>
            <Link to="/login">
              <Button type="primary" className="landing-cta-nav">
                Get started
              </Button>
            </Link>
          </div>
        </Motion.div>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          {!reduce && (
            <>
              <Motion.div
                className="landing-orb landing-orb--a"
                animate={{ y: [0, -14, 0], opacity: [0.35, 0.55, 0.35] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden
              />
              <Motion.div
                className="landing-orb landing-orb--b"
                animate={{ y: [0, 10, 0], opacity: [0.25, 0.45, 0.25] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                aria-hidden
              />
            </>
          )}
          <div className="landing-hero-glow" aria-hidden />
          <Motion.div
            className="landing-hero-content"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            <Motion.div variants={fadeUp} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
              <span className="landing-badge">
                <RocketOutlined style={{ marginRight: 6 }} />
                Document intelligence
              </span>
            </Motion.div>
            <Motion.div variants={fadeUp} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
              <Title level={1} className="landing-title">
                Chat with your{' '}
                <Motion.span
                  className="landing-title-accent landing-title-accent--animated"
                  animate={
                    reduce
                      ? {}
                      : {
                          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                        }
                  }
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                >
                  files
                </Motion.span>
                , not the internet.
              </Title>
            </Motion.div>
            <Motion.div variants={fadeUp} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
              <Paragraph className="landing-lead">
                A focused RAG assistant for teams: upload documents, keep conversations in threads, and let admins
                orchestrate users — with an optional platform console for oversight.
              </Paragraph>
            </Motion.div>
            <Motion.div
              className="landing-hero-buttons"
              variants={fadeUp}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link to="/login">
                <Button type="primary" size="large" className="landing-hero-primary">
                  Open app
                </Button>
              </Link>
              <Link to="/login">
                <Button size="large" ghost className="landing-hero-secondary">
                  Create admin account
                </Button>
              </Link>
            </Motion.div>
            <Motion.div
              className="landing-hero-trust"
              variants={fadeUp}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <ApiOutlined className="landing-trust-icon" />
              <Text type="secondary" className="landing-trust-text">
                FastAPI · React · Chroma · JWT auth
              </Text>
            </Motion.div>
          </Motion.div>

          <Motion.div
            className="landing-hero-visual"
            initial={{ opacity: 0, scale: reduce ? 1 : 0.92, rotateX: reduce ? 0 : 8 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 0.75, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            whileHover={reduce ? {} : { y: -6, transition: { duration: 0.35 } }}
          >
            <div className="landing-mock-card">
              <div className="landing-mock-header">
                <span className="landing-mock-dot" />
                <span className="landing-mock-dot" />
                <span className="landing-mock-dot" />
                <span className="landing-mock-title">Workspace chat</span>
              </div>
              <div className="landing-mock-body">
                <Motion.div
                  className="landing-mock-msg landing-mock-msg-user"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.85, duration: 0.45 }}
                >
                  What does our policy say about travel?
                </Motion.div>
                <Motion.div
                  className="landing-mock-msg landing-mock-msg-bot"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1, duration: 0.45 }}
                >
                  According to your uploaded handbook…
                  <span className="landing-mock-sources">Sources: employee-handbook.pdf</span>
                </Motion.div>
                <Motion.div
                  className="landing-mock-typing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.45, duration: 0.3 }}
                >
                  <span className="landing-mock-typing-dot" />
                  <span className="landing-mock-typing-dot" />
                  <span className="landing-mock-typing-dot" />
                </Motion.div>
              </div>
            </div>
          </Motion.div>
        </section>

        <section className="landing-stats">
          <div className="landing-stats-inner">
            {stats.map((s, i) => (
              <Motion.div
                key={s.label}
                className="landing-stat-cell"
                {...viewFade(reduce)}
                transition={{ duration: reduce ? 0.01 : 0.5, delay: reduce ? 0 : i * 0.06 }}
              >
                <div className="landing-stat-value">{s.value}</div>
                <div className="landing-stat-label">{s.label}</div>
              </Motion.div>
            ))}
          </div>
        </section>

        <section className="landing-features">
          <Motion.div {...viewFade(reduce)}>
            <Title level={2} className="landing-section-title">
              Built for real workflows
            </Title>
            <Paragraph type="secondary" className="landing-section-sub">
              Everything you need to run document Q&amp;A inside your organization — without duct-taping five tools
              together.
            </Paragraph>
          </Motion.div>
          <div className="landing-feature-grid">
            {features.map((f, i) => (
              <Motion.article
                key={f.title}
                className="landing-feature-card"
                initial={{ opacity: 0, y: reduce ? 0 : 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-24px' }}
                transition={{ duration: 0.5, delay: reduce ? 0 : i * 0.07 }}
                whileHover={reduce ? {} : { y: -6, scale: 1.02 }}
              >
                <Motion.div
                  className="landing-feature-icon-wrap"
                  whileHover={reduce ? {} : { rotate: [0, -6, 6, 0] }}
                  transition={{ duration: 0.45 }}
                >
                  {f.icon}
                </Motion.div>
                <Title level={4}>{f.title}</Title>
                <Paragraph type="secondary">{f.text}</Paragraph>
              </Motion.article>
            ))}
          </div>
        </section>

        <section className="landing-how">
          <Motion.div {...viewFade(reduce)}>
            <Title level={2} className="landing-section-title">
              How it works
            </Title>
            <Paragraph type="secondary" className="landing-section-sub">
              Three steps from files to trustworthy answers.
            </Paragraph>
          </Motion.div>
          <div className="landing-steps">
            {steps.map((step, i) => (
              <Motion.div
                key={step.n}
                className="landing-step"
                initial={{ opacity: 0, y: reduce ? 0 : 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.55, delay: reduce ? 0 : i * 0.12 }}
              >
                <div className="landing-step-connector" aria-hidden={i === steps.length - 1} />
                <Motion.div
                  className="landing-step-icon"
                  whileInView={reduce ? {} : { scale: [0.85, 1] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: reduce ? 0 : 0.1 + i * 0.1 }}
                >
                  {step.icon}
                </Motion.div>
                <Text className="landing-step-num">{step.n}</Text>
                <Title level={4} className="landing-step-title">
                  {step.title}
                </Title>
                <Paragraph type="secondary" className="landing-step-text">
                  {step.text}
                </Paragraph>
              </Motion.div>
            ))}
          </div>
        </section>

        <section className="landing-usecases">
          <Motion.div {...viewFade(reduce)}>
            <Title level={2} className="landing-section-title">
              Use cases
            </Title>
            <Paragraph type="secondary" className="landing-section-sub">
              One stack — many teams. Shape the workspace around your documents.
            </Paragraph>
          </Motion.div>
          <div className="landing-use-grid">
            {useCases.map((u, i) => (
              <Motion.div
                key={u.title}
                className="landing-use-card"
                initial={{ opacity: 0, x: reduce ? 0 : i % 2 === 0 ? -28 : 28 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.55, delay: reduce ? 0 : i * 0.1 }}
                whileHover={reduce ? {} : { borderColor: 'rgba(139, 124, 255, 0.45)' }}
              >
                <div className="landing-use-icon">{u.icon}</div>
                <Title level={4}>{u.title}</Title>
                <Paragraph type="secondary">{u.text}</Paragraph>
              </Motion.div>
            ))}
          </div>
        </section>

        <Motion.section className="landing-quote" {...viewFade(reduce)}>
          <NodeIndexOutlined className="landing-quote-icon" />
          <blockquote className="landing-quote-text">
            &ldquo;The best internal assistants don&apos;t guess — they{' '}
            <span className="landing-quote-highlight">show their homework</span>.&rdquo;
          </blockquote>
          <Text type="secondary" className="landing-quote-by">
            Design principle behind RAG Workspace
          </Text>
        </Motion.section>

        <section className="landing-faq">
          <Motion.div {...viewFade(reduce)}>
            <Title level={2} className="landing-section-title">
              Questions
            </Title>
            <Paragraph type="secondary" className="landing-section-sub">
              Quick answers before you sign in.
            </Paragraph>
          </Motion.div>
          <Motion.div
            className="landing-faq-inner"
            initial={{ opacity: 0, y: reduce ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Collapse items={faqItems} bordered={false} className="landing-collapse" />
          </Motion.div>
        </section>

        <Motion.section
          className="landing-cta-band"
          initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <Motion.div
            animate={reduce ? {} : { scale: [1, 1.02, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ display: 'inline-block' }}
          >
            <ThunderboltOutlined className="landing-cta-icon" />
          </Motion.div>
          <Title level={3} className="landing-cta-title">
            Ready to try it?
          </Title>
          <Paragraph type="secondary" className="landing-cta-text">
            Create an admin workspace or sign in. Your documents stay under your control.
          </Paragraph>
          <div className="landing-cta-row">
            <Link to="/login">
              <Button type="primary" size="large" className="landing-cta-button">
                Go to sign in
              </Button>
            </Link>
            <Link to="/login">
              <Button size="large" ghost className="landing-cta-button-secondary">
                Register as admin
              </Button>
            </Link>
          </div>
        </Motion.section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-grid">
          <div>
            <div className="landing-footer-brand">RAG Workspace</div>
            <Paragraph type="secondary" className="landing-footer-desc">
              Private document Q&amp;A for teams — grounded, traceable, tenant-aware.
            </Paragraph>
          </div>
          <div>
            <div className="landing-footer-heading">Product</div>
            <Link to="/login" className="landing-footer-link">
              Sign in
            </Link>
            <Link to="/login" className="landing-footer-link">
              Get started
            </Link>
          </div>
          <div>
            <div className="landing-footer-heading">Stack</div>
            <span className="landing-footer-muted">FastAPI</span>
            <span className="landing-footer-muted">React · Vite</span>
            <span className="landing-footer-muted">Chroma · MongoDB</span>
          </div>
        </div>
        <Paragraph type="secondary" className="landing-footer-copy">
          © {new Date().getFullYear()} RAG Workspace — demo / self-hosted friendly.
        </Paragraph>
      </footer>
    </div>
  )
}

export default LandingPage
