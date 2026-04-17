import {
  Button,
  Card,
  Col,
  Collapse,
  Flex,
  FloatButton,
  Grid,
  Layout,
  Row,
  Space,
  Tag,
  theme,
  Typography,
} from 'antd'
import {
  ApiOutlined,
  ArrowUpOutlined,
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
import { useMemo } from 'react'

const { Header, Content, Footer } = Layout
const { Title, Paragraph, Text } = Typography

const fadeUp = {
  initial: { opacity: 0, y: 26 },
  animate: { opacity: 1, y: 0 },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
}

const viewFade = (reduce) => ({
  initial: { opacity: 0, y: reduce ? 0 : 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-48px' },
  transition: { duration: reduce ? 0.01 : 0.5, ease: [0.22, 1, 0.36, 1] },
})

const features = [
  {
    icon: <MessageOutlined />,
    title: 'Grounded answers',
    text: 'Replies cite your uploads — not generic web copy.',
  },
  {
    icon: <TeamOutlined />,
    title: 'Teams & roles',
    text: 'Admins run workspaces, invite users, and control uploads.',
  },
  {
    icon: <CloudUploadOutlined />,
    title: 'Simple ingestion',
    text: 'PDF, Word, Markdown, and text — chunked, embedded, ready.',
  },
  {
    icon: <SafetyOutlined />,
    title: 'Tenant isolation',
    text: 'Each admin workspace stays separate for real multi-tenant use.',
  },
]

const stats = [
  { value: 'Multi-format', label: 'PDF · DOCX · TXT' },
  { value: 'Threads', label: 'Per-user chat history' },
  { value: 'RAG + LLM', label: 'Ollama-ready' },
  { value: 'Platform', label: 'Super admin oversight' },
]

const steps = [
  {
    n: '01',
    title: 'Upload',
    text: 'Drop files into your workspace. Parsing and indexing run automatically.',
    icon: <CloudUploadOutlined />,
  },
  {
    n: '02',
    title: 'Ask',
    text: 'Natural language queries — retrieval first, then the model answers.',
    icon: <FileSearchOutlined />,
  },
  {
    n: '03',
    title: 'Verify',
    text: 'See which documents grounded the reply. Continue in the same thread.',
    icon: <BookOutlined />,
  },
]

const useCases = [
  {
    title: 'HR & policy',
    text: 'Handbooks and FAQs — answered with citations from your PDFs.',
    icon: <TeamOutlined />,
  },
  {
    title: 'Compliance',
    text: 'Contracts and clauses without folder archaeology.',
    icon: <SafetyOutlined />,
  },
  {
    title: 'Ops & knowledge',
    text: 'Runbooks and specs — new hires ask the assistant first.',
    icon: <ThunderboltOutlined />,
  },
]

const faqItems = [
  {
    key: '1',
    label: 'Who can sign up?',
    children: (
      <Paragraph type="secondary" style={{ margin: 0, maxWidth: 640 }}>
        Public registration creates an <Text strong>admin</Text> workspace. That admin adds team users and can allow
        uploads. A separate <Text strong>super admin</Text> oversees admins when your deployment enables it.
      </Paragraph>
    ),
  },
  {
    key: '2',
    label: 'Where do documents live?',
    children: (
      <Paragraph type="secondary" style={{ margin: 0, maxWidth: 640 }}>
        Files are stored and indexed per tenant. Chats only see what you or your admin uploaded for that workspace.
      </Paragraph>
    ),
  },
  {
    key: '3',
    label: 'Can I use my own LLM?',
    children: (
      <Paragraph type="secondary" style={{ margin: 0, maxWidth: 640 }}>
        Yes — <Text strong>Ollama</Text> for self-hosted models and <Text strong>OpenAI</Text>-compatible APIs. Configure
        the backend to match your stack.
      </Paragraph>
    ),
  },
  {
    key: '4',
    label: 'Is this a replacement for Google?',
    children: (
      <Paragraph type="secondary" style={{ margin: 0, maxWidth: 640 }}>
        No — it answers from <em>your</em> curated library with traceable sources, alongside normal search tools.
      </Paragraph>
    ),
  },
]

const LandingPage = () => {
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const reduce = useReducedMotion()

  const shell = useMemo(
    () => ({
      minHeight: '100vh',
      background: token.colorBgLayout,
      position: 'relative',
      overflowX: 'hidden',
    }),
    [token.colorBgLayout],
  )

  const gridBg = useMemo(
    () => ({
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
      backgroundImage: `linear-gradient(${token.colorBorderSecondary} 1px, transparent 1px), linear-gradient(90deg, ${token.colorBorderSecondary} 1px, transparent 1px)`,
      backgroundSize: '44px 44px',
      maskImage: 'radial-gradient(ellipse 85% 55% at 50% 0%, black 15%, transparent 72%)',
      WebkitMaskImage: 'radial-gradient(ellipse 85% 55% at 50% 0%, black 15%, transparent 72%)',
    }),
    [token.colorBorderSecondary],
  )

  const heroGlow = useMemo(
    () => ({
      position: 'absolute',
      left: '-10%',
      right: '-10%',
      top: '-30%',
      height: 440,
      background: `radial-gradient(ellipse at 28% 18%, ${token.colorPrimary}55, transparent 58%)`,
      pointerEvents: 'none',
      opacity: 0.85,
    }),
    [token.colorPrimary],
  )

  const accentText = useMemo(
    () => ({
      background: `linear-gradient(100deg, ${token.colorPrimary}, ${token.colorInfo}, ${token.colorPrimary})`,
      backgroundSize: '200% auto',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      display: 'inline-block',
    }),
    [token.colorInfo, token.colorPrimary],
  )

  const mockCard = {
    borderRadius: token.borderRadiusLG,
    border: `1px solid ${token.colorBorder}`,
    background: token.colorBgElevated,
    boxShadow: token.boxShadowSecondary,
    overflow: 'hidden',
  }

  return (
    <Layout style={shell}>
      <div style={gridBg} aria-hidden />

      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          width: '100%',
          paddingInline: screens.md ? 32 : 16,
          background: `${token.colorBgLayout}cc`,
          backdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
          lineHeight: '64px',
        }}
      >
        <Motion.div
          initial={{ opacity: 0, y: reduce ? 0 : -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0.01 : 0.4 }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'space-between' }}
        >
          <Text
            strong
            style={{
              fontSize: screens.md ? 18 : 16,
              letterSpacing: '-0.02em',
              background: `linear-gradient(120deg, ${token.colorPrimary}, ${token.colorInfo})`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            RAG Workspace
          </Text>
          <Space size={screens.md ? 12 : 8} wrap>
            <Link to="/login">
              <Button type="text" size={screens.md ? 'middle' : 'small'}>
                Sign in
              </Button>
            </Link>
            <Link to="/login">
              <Button type="primary" size={screens.md ? 'middle' : 'middle'}>
                Get started
              </Button>
            </Link>
          </Space>
        </Motion.div>
      </Header>

      <Content style={{ position: 'relative', zIndex: 1, paddingBottom: 48 }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', paddingInline: screens.md ? 32 : 16 }}>
          {/* Hero */}
          <section style={{ position: 'relative', paddingTop: screens.md ? 56 : 36, paddingBottom: 48 }}>
            {!reduce && (
              <>
                <Motion.div
                  style={{
                    position: 'absolute',
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    right: '6%',
                    top: '8%',
                    background: `${token.colorPrimary}40`,
                    filter: 'blur(48px)',
                    zIndex: 0,
                  }}
                  animate={{ y: [0, -12, 0], opacity: [0.35, 0.55, 0.35] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  aria-hidden
                />
                <Motion.div
                  style={{
                    position: 'absolute',
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    left: '2%',
                    bottom: '10%',
                    background: `${token.colorInfo}33`,
                    filter: 'blur(40px)',
                    zIndex: 0,
                  }}
                  animate={{ y: [0, 14, 0], opacity: [0.22, 0.42, 0.22] }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                  aria-hidden
                />
              </>
            )}
            <div style={heroGlow} aria-hidden />

            <Row gutter={[screens.md ? 48 : 24, 40]} align="middle">
              <Col xs={24} lg={13}>
                <Motion.div variants={stagger} initial="initial" animate="animate">
                  <Motion.div variants={fadeUp} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                    <Tag
                      icon={<RocketOutlined />}
                      color="purple"
                      style={{
                        marginBottom: 16,
                        padding: '6px 12px',
                        borderRadius: 999,
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        border: `1px solid ${token.colorPrimary}55`,
                        background: `${token.colorPrimary}22`,
                      }}
                    >
                      Document intelligence
                    </Tag>
                  </Motion.div>
                  <Motion.div variants={fadeUp} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                    <Title level={1} style={{ marginBottom: 16, fontWeight: 700, letterSpacing: '-0.03em' }}>
                      Chat with your{' '}
                      <Motion.span
                        style={accentText}
                        animate={reduce ? {} : { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                      >
                        files
                      </Motion.span>
                      , not the internet.
                    </Title>
                  </Motion.div>
                  <Motion.div variants={fadeUp} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                    <Paragraph type="secondary" style={{ fontSize: screens.md ? 17 : 15, maxWidth: 520, marginBottom: 0 }}>
                      Upload knowledge, keep threads per user, and let admins orchestrate access — with an optional
                      platform console for oversight.
                    </Paragraph>
                  </Motion.div>
                  <Motion.div variants={fadeUp} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                    <Flex gap={12} wrap="wrap" style={{ marginTop: 28 }}>
                      <Link to="/login">
                        <Button type="primary" size="large" style={{ minWidth: 140, fontWeight: 600 }}>
                          Open app
                        </Button>
                      </Link>
                      <Link to="/login">
                        <Button size="large" ghost style={{ minWidth: 160, fontWeight: 600 }}>
                          Create admin
                        </Button>
                      </Link>
                    </Flex>
                  </Motion.div>
                  <Motion.div variants={fadeUp} transition={{ duration: 0.45, delay: 0.12 }}>
                    <Flex align="center" gap={10} style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${token.colorBorderSecondary}`, maxWidth: 520 }}>
                      <ApiOutlined style={{ fontSize: 18, color: token.colorPrimary }} />
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        FastAPI · React · Chroma · JWT auth
                      </Text>
                    </Flex>
                  </Motion.div>
                </Motion.div>
              </Col>
              <Col xs={24} lg={11}>
                <Motion.div
                  initial={{ opacity: 0, scale: reduce ? 1 : 0.94, rotateX: reduce ? 0 : 6 }}
                  animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                  transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={reduce ? {} : { y: -6, transition: { duration: 0.35 } }}
                  style={{ perspective: 1200 }}
                >
                  <div style={mockCard}>
                    <Flex
                      align="center"
                      gap={8}
                      style={{
                        padding: '12px 14px',
                        borderBottom: `1px solid ${token.colorBorderSecondary}`,
                        background: token.colorFillSecondary,
                      }}
                    >
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: token.colorBorder }} />
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: token.colorBorder }} />
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: token.colorBorder }} />
                      <Text type="secondary" style={{ marginLeft: 'auto', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Workspace chat
                      </Text>
                    </Flex>
                    <Flex vertical gap={12} style={{ padding: 20, minHeight: 200 }}>
                      <Motion.div
                        style={{
                          alignSelf: 'flex-end',
                          maxWidth: '88%',
                          padding: '12px 14px',
                          borderRadius: token.borderRadiusLG,
                          background: `linear-gradient(135deg, ${token.colorPrimary}55, ${token.colorPrimary}22)`,
                          border: `1px solid ${token.colorPrimary}44`,
                          fontSize: 14,
                          lineHeight: 1.45,
                        }}
                        initial={{ opacity: 0, x: 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.75, duration: 0.4 }}
                      >
                        What does our policy say about travel?
                      </Motion.div>
                      <Motion.div
                        style={{
                          alignSelf: 'flex-start',
                          maxWidth: '88%',
                          padding: '12px 14px',
                          borderRadius: token.borderRadiusLG,
                          background: token.colorFillQuaternary,
                          border: `1px solid ${token.colorBorderSecondary}`,
                          fontSize: 14,
                          lineHeight: 1.45,
                        }}
                        initial={{ opacity: 0, x: -18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1, duration: 0.4 }}
                      >
                        According to your uploaded handbook…
                        <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 11 }}>
                          Sources: employee-handbook.pdf
                        </Text>
                      </Motion.div>
                      <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.35, duration: 0.28 }}
                        style={{
                          alignSelf: 'flex-start',
                          display: 'flex',
                          gap: 4,
                          padding: '10px 14px',
                          borderRadius: token.borderRadiusLG,
                          background: token.colorFillQuaternary,
                          border: `1px solid ${token.colorBorderSecondary}`,
                        }}
                      >
                        {[0, 1, 2].map((i) => (
                          <Motion.span
                            key={i}
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: `${token.colorPrimary}aa`,
                            }}
                            animate={reduce ? {} : { y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.12 }}
                          />
                        ))}
                      </Motion.div>
                    </Flex>
                  </div>
                </Motion.div>
              </Col>
            </Row>
          </section>

          {/* Stats strip */}
          <Motion.section {...viewFade(reduce)} style={{ marginBottom: 48 }}>
            <Row
              gutter={[1, 1]}
              style={{
                borderRadius: token.borderRadiusLG,
                overflow: 'hidden',
                border: `1px solid ${token.colorBorder}`,
                background: token.colorBorder,
              }}
            >
              {stats.map((s, i) => (
                <Col xs={12} md={6} key={s.label}>
                  <Motion.div
                    {...viewFade(reduce)}
                    transition={{ duration: reduce ? 0.01 : 0.45, delay: reduce ? 0 : i * 0.05 }}
                    style={{
                      padding: screens.md ? '22px 16px' : '18px 12px',
                      textAlign: 'center',
                      background: token.colorBgElevated,
                      height: '100%',
                    }}
                  >
                    <Text strong style={{ display: 'block', marginBottom: 6, letterSpacing: '-0.02em' }}>
                      {s.value}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.35 }}>
                      {s.label}
                    </Text>
                  </Motion.div>
                </Col>
              ))}
            </Row>
          </Motion.section>

          {/* Features */}
          <section style={{ marginBottom: 56 }}>
            <Motion.div {...viewFade(reduce)} style={{ textAlign: 'center', marginBottom: 32 }}>
              <Title level={2} style={{ marginBottom: 8 }}>
                Built for real workflows
              </Title>
              <Paragraph type="secondary" style={{ maxWidth: 520, margin: '0 auto' }}>
                Document Q&amp;A inside your organization — without duct-taping five tools together.
              </Paragraph>
            </Motion.div>
            <Row gutter={[20, 20]}>
              {features.map((f, i) => (
                <Col xs={24} sm={12} xl={6} key={f.title}>
                  <Motion.div
                    initial={{ opacity: 0, y: reduce ? 0 : 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-20px' }}
                    transition={{ duration: 0.48, delay: reduce ? 0 : i * 0.06 }}
                    whileHover={reduce ? {} : { y: -4 }}
                    style={{ height: '100%' }}
                  >
                    <Card
                      hoverable
                      styles={{ body: { padding: screens.md ? 24 : 20 } }}
                      style={{ height: '100%', borderColor: token.colorBorder }}
                    >
                      <Motion.div
                        whileHover={reduce ? {} : { rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.4 }}
                        style={{
                          width: 48,
                          height: 48,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: token.borderRadius,
                          marginBottom: 14,
                          fontSize: 22,
                          color: token.colorPrimary,
                          background: `${token.colorPrimary}18`,
                          border: `1px solid ${token.colorPrimary}33`,
                        }}
                      >
                        {f.icon}
                      </Motion.div>
                      <Title level={4} style={{ marginTop: 0 }}>
                        {f.title}
                      </Title>
                      <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                        {f.text}
                      </Paragraph>
                    </Card>
                  </Motion.div>
                </Col>
              ))}
            </Row>
          </section>

          {/* How it works */}
          <section style={{ marginBottom: 56 }}>
            <Motion.div {...viewFade(reduce)} style={{ textAlign: 'center', marginBottom: 32 }}>
              <Title level={2} style={{ marginBottom: 8 }}>
                How it works
              </Title>
              <Paragraph type="secondary" style={{ margin: '0 auto', maxWidth: 440 }}>
                Three steps from files to trustworthy answers.
              </Paragraph>
            </Motion.div>
            <Row gutter={[20, 20]}>
              {steps.map((step, i) => (
                <Col xs={24} md={8} key={step.n}>
                  <Motion.div
                    initial={{ opacity: 0, y: reduce ? 0 : 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-24px' }}
                    transition={{ duration: 0.5, delay: reduce ? 0 : i * 0.1 }}
                  >
                    <Card styles={{ body: { padding: screens.md ? 26 : 22 } }} style={{ height: '100%', borderColor: token.colorBorder }}>
                      <Flex vertical gap={10}>
                        <Flex
                          align="center"
                          justify="center"
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: token.borderRadius,
                            fontSize: 20,
                            color: token.colorPrimary,
                            background: `${token.colorPrimary}1f`,
                            border: `1px solid ${token.colorPrimary}40`,
                          }}
                        >
                          {step.icon}
                        </Flex>
                        <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em' }}>
                          {step.n}
                        </Text>
                        <Title level={4} style={{ margin: 0 }}>
                          {step.title}
                        </Title>
                        <Paragraph type="secondary" style={{ margin: 0, fontSize: 14 }}>
                          {step.text}
                        </Paragraph>
                      </Flex>
                    </Card>
                  </Motion.div>
                </Col>
              ))}
            </Row>
          </section>

          {/* Use cases */}
          <section style={{ marginBottom: 56 }}>
            <Motion.div {...viewFade(reduce)} style={{ textAlign: 'center', marginBottom: 32 }}>
              <Title level={2} style={{ marginBottom: 8 }}>
                Use cases
              </Title>
              <Paragraph type="secondary" style={{ margin: '0 auto', maxWidth: 480 }}>
                One stack — many teams. Shape the workspace around your documents.
              </Paragraph>
            </Motion.div>
            <Row gutter={[20, 20]}>
              {useCases.map((u, i) => (
                <Col xs={24} md={8} key={u.title}>
                  <Motion.div
                    initial={{ opacity: 0, x: reduce ? 0 : i % 2 === 0 ? -22 : 22 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-20px' }}
                    transition={{ duration: 0.5, delay: reduce ? 0 : i * 0.08 }}
                    whileHover={reduce ? {} : { borderColor: `${token.colorPrimary}66` }}
                    style={{ height: '100%' }}
                  >
                    <Card variant="borderless" style={{ height: '100%', background: token.colorFillQuaternary, border: `1px solid ${token.colorBorder}` }}>
                      <div style={{ fontSize: 24, color: token.colorPrimary, marginBottom: 12 }}>{u.icon}</div>
                      <Title level={4} style={{ marginTop: 0 }}>
                        {u.title}
                      </Title>
                      <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                        {u.text}
                      </Paragraph>
                    </Card>
                  </Motion.div>
                </Col>
              ))}
            </Row>
          </section>

          {/* Quote */}
          <Motion.section {...viewFade(reduce)} style={{ marginBottom: 56 }}>
            <Card
              style={{
                textAlign: 'center',
                borderColor: token.colorBorder,
                background: `linear-gradient(165deg, ${token.colorPrimary}14, ${token.colorBgElevated})`,
              }}
            >
              <NodeIndexOutlined style={{ fontSize: 28, color: `${token.colorPrimary}88`, marginBottom: 12 }} />
              <blockquote style={{ margin: '0 0 12px', border: 'none', padding: 0, fontSize: screens.md ? 20 : 17, fontStyle: 'italic', fontWeight: 500, lineHeight: 1.5 }}>
                &ldquo;The best internal assistants don&apos;t guess — they{' '}
                <span style={{ color: token.colorPrimary }}>show their homework</span>.&rdquo;
              </blockquote>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Design principle behind RAG Workspace
              </Text>
            </Card>
          </Motion.section>

          {/* FAQ */}
          <section style={{ marginBottom: 56, maxWidth: 720, marginInline: 'auto' }}>
            <Motion.div {...viewFade(reduce)} style={{ textAlign: 'center', marginBottom: 24 }}>
              <Title level={2} style={{ marginBottom: 8 }}>
                Questions
              </Title>
              <Paragraph type="secondary">Quick answers before you sign in.</Paragraph>
            </Motion.div>
            <Motion.div initial={{ opacity: 0, y: reduce ? 0 : 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
              <Collapse items={faqItems} bordered={false} expandIconPosition="end" style={{ background: 'transparent' }} />
            </Motion.div>
          </section>

          {/* CTA */}
          <Motion.section
            initial={{ opacity: 0, scale: reduce ? 1 : 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card
              style={{
                textAlign: 'center',
                borderColor: `${token.colorPrimary}55`,
                background: `linear-gradient(145deg, ${token.colorPrimary}28, ${token.colorBgElevated})`,
                boxShadow: `0 0 0 1px ${token.colorBorderSecondary} inset, ${token.boxShadowSecondary}`,
              }}
            >
              <Motion.div
                animate={reduce ? {} : { scale: [1, 1.04, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ display: 'inline-block' }}
              >
                <ThunderboltOutlined style={{ fontSize: 32, color: token.colorPrimary, marginBottom: 8 }} />
              </Motion.div>
              <Title level={3} style={{ marginBottom: 8 }}>
                Ready to try it?
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: 20 }}>
                Create an admin workspace or sign in. Your documents stay under your control.
              </Paragraph>
              <Flex gap={12} justify="center" wrap="wrap">
                <Link to="/login">
                  <Button type="primary" size="large" style={{ minWidth: 160, fontWeight: 600 }}>
                    Go to sign in
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="large" ghost style={{ minWidth: 168, fontWeight: 600 }}>
                    Register as admin
                  </Button>
                </Link>
              </Flex>
            </Card>
          </Motion.section>
        </div>
      </Content>

      <Footer style={{ background: 'transparent', borderTop: `1px solid ${token.colorBorderSecondary}`, padding: screens.md ? '40px 32px 28px' : '32px 16px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <Row gutter={[28, 28]}>
            <Col xs={24} sm={10}>
              <Text
                strong
                style={{
                  display: 'block',
                  marginBottom: 8,
                  background: `linear-gradient(120deg, ${token.colorPrimary}, ${token.colorInfo})`,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                RAG Workspace
              </Text>
              <Paragraph type="secondary" style={{ margin: 0, maxWidth: 300, fontSize: 13 }}>
                Private document Q&amp;A for teams — grounded, traceable, tenant-aware.
              </Paragraph>
            </Col>
            <Col xs={12} sm={7}>
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
                Product
              </Text>
              <Flex vertical gap={8}>
                <Link to="/login">
                  <Text style={{ color: token.colorTextSecondary }}>Sign in</Text>
                </Link>
                <Link to="/login">
                  <Text style={{ color: token.colorTextSecondary }}>Get started</Text>
                </Link>
              </Flex>
            </Col>
            <Col xs={12} sm={7}>
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
                Stack
              </Text>
              <Flex vertical gap={6}>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  FastAPI
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  React · Vite
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Chroma · MongoDB
                </Text>
              </Flex>
            </Col>
          </Row>
          <Paragraph type="secondary" style={{ textAlign: 'center', margin: '24px 0 0', fontSize: 12 }}>
            © {new Date().getFullYear()} RAG Workspace — demo / self-hosted friendly.
          </Paragraph>
        </div>
      </Footer>

      <FloatButton.BackTop
        duration={400}
        icon={<ArrowUpOutlined />}
        tooltip="Back to top"
        style={{ right: screens.md ? 28 : 16, bottom: screens.md ? 28 : 16 }}
      />
    </Layout>
  )
}

export default LandingPage
