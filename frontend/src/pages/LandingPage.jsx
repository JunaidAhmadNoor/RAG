import { Button, Typography } from 'antd'
import {
  CloudUploadOutlined,
  MessageOutlined,
  SafetyOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const { Title, Paragraph } = Typography

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
}

const stagger = {
  animate: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
}

const features = [
  {
    icon: <MessageOutlined />,
    title: 'Grounded answers',
    text: 'Ask questions and get responses cited from your own documents — not generic web fluff.',
  },
  {
    icon: <TeamOutlined />,
    title: 'Teams & roles',
    text: 'Admins manage workspaces; invite users and control who can upload.',
  },
  {
    icon: <CloudUploadOutlined />,
    title: 'Simple ingestion',
    text: 'Upload PDFs, Word files, and text. We chunk, embed, and keep sessions organized.',
  },
  {
    icon: <SafetyOutlined />,
    title: 'Tenant isolation',
    text: 'Each admin workspace stays separate — built for real multi-tenant use.',
  },
]

const LandingPage = () => {
  return (
    <div className="landing-root">
      <header className="landing-nav">
        <motion.div
          className="landing-nav-inner"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <span className="landing-logo">RAG Workspace</span>
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
        </motion.div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-glow" aria-hidden />
          <motion.div
            className="landing-hero-content"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
              <span className="landing-badge">Document intelligence</span>
            </motion.div>
            <motion.div variants={fadeUp} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
              <Title level={1} className="landing-title">
                Chat with your{' '}
                <span className="landing-title-accent">files</span>, not the internet.
              </Title>
            </motion.div>
            <motion.div variants={fadeUp} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
              <Paragraph className="landing-lead">
                A focused RAG assistant for teams: upload documents, keep conversations in threads, and let admins
                orchestrate users — with an optional platform console for oversight.
              </Paragraph>
            </motion.div>
            <motion.div
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
            </motion.div>
          </motion.div>

          <motion.div
            className="landing-hero-visual"
            initial={{ opacity: 0, scale: 0.92, rotateX: 8 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="landing-mock-card">
              <div className="landing-mock-header">
                <span className="landing-mock-dot" />
                <span className="landing-mock-dot" />
                <span className="landing-mock-dot" />
              </div>
              <div className="landing-mock-body">
                <motion.div
                  className="landing-mock-msg landing-mock-msg-user"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9, duration: 0.4 }}
                >
                  What does our policy say about travel?
                </motion.div>
                <motion.div
                  className="landing-mock-msg landing-mock-msg-bot"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.15, duration: 0.4 }}
                >
                  According to your uploaded handbook…
                  <span className="landing-mock-sources">Sources: employee-handbook.pdf</span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="landing-features">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
          >
            <Title level={2} className="landing-section-title">
              Built for real workflows
            </Title>
            <Paragraph type="secondary" className="landing-section-sub">
              Everything you need to run document Q&amp;A inside your organization.
            </Paragraph>
          </motion.div>
          <div className="landing-feature-grid">
            {features.map((f, i) => (
              <motion.article
                key={f.title}
                className="landing-feature-card"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className="landing-feature-icon">{f.icon}</div>
                <Title level={4}>{f.title}</Title>
                <Paragraph type="secondary">{f.text}</Paragraph>
              </motion.article>
            ))}
          </div>
        </section>

        <motion.section
          className="landing-cta-band"
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Title level={3} className="landing-cta-title">
            Ready to try it?
          </Title>
          <Paragraph type="secondary" className="landing-cta-text">
            Sign in or register an admin workspace in seconds.
          </Paragraph>
          <Link to="/login">
            <Button type="primary" size="large" className="landing-cta-button">
              Go to sign in
            </Button>
          </Link>
        </motion.section>
      </main>

      <footer className="landing-footer">
        <Paragraph type="secondary" style={{ margin: 0 }}>
          RAG Workspace — private document Q&amp;A for teams.
        </Paragraph>
      </footer>
    </div>
  )
}

export default LandingPage
