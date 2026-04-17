import { App, Button, Card, Col, Divider, Flex, Form, Grid, Input, Row, Segmented, Space, theme, Typography } from 'antd'
import { LockOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons'
import { motion as Motion } from 'framer-motion'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authStore } from '../store/authStore'

const LoginPage = () => {
  const { message } = App.useApp()
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login, register } = authStore()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      if (mode === 'register') {
        await register({ username: values.username, password: values.password })
        await login(values.username, values.password)
        message.success('Admin account ready — welcome!')
      } else {
        await login(values.username, values.password)
        message.success('Signed in')
      }
      const r = authStore.getState().role
      navigate(r === 'superadmin' ? '/superadmin' : '/chat')
    } catch (err) {
      message.error(err.response?.data?.detail || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const panelRadius = token.borderRadiusLG * 1.1

  return (
    <Row style={{ minHeight: '100vh' }} wrap={false}>
      {screens.md && (
        <Col md={11} lg={12} xl={13} style={{ position: 'relative', overflow: 'hidden' }}>
          <Flex
            vertical
            justify="space-between"
            style={{
              minHeight: '100vh',
              padding: 40,
              background: `linear-gradient(145deg, ${token.colorPrimary}35 0%, ${token.colorBgLayout} 55%, ${token.colorBgElevated} 100%)`,
              borderRight: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <div>
              <Motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Typography.Title level={3} style={{ marginBottom: 8, letterSpacing: '-0.02em' }}>
                  RAG Workspace
                </Typography.Title>
                <Typography.Paragraph type="secondary" style={{ maxWidth: 380, fontSize: 15 }}>
                  Admins upload documents and manage team access. Users chat with grounded answers from your own files —
                  with optional super-admin oversight.
                </Typography.Paragraph>
              </Motion.div>
            </div>
            <Motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              style={{
                borderRadius: panelRadius,
                padding: 24,
                border: `1px solid ${token.colorBorder}`,
                background: token.colorBgContainer,
                boxShadow: token.boxShadowSecondary,
              }}
            >
              <Flex align="center" gap={12} style={{ marginBottom: 12 }}>
                <SafetyCertificateOutlined style={{ fontSize: 22, color: token.colorPrimary }} />
                <Typography.Text strong>Enterprise-friendly roles</Typography.Text>
              </Flex>
              <Typography.Paragraph type="secondary" style={{ margin: 0, fontSize: 14 }}>
                Register creates an admin workspace. Admins invite users and can grant upload permission. Super admins
                review tenants from the platform console.
              </Typography.Paragraph>
            </Motion.div>
          </Flex>
        </Col>
      )}
      <Col xs={24} md={13} lg={12} xl={11}>
        <Flex align="center" justify="center" style={{ minHeight: '100vh', padding: screens.md ? 32 : 16 }}>
          <Card
            variant="borderless"
            style={{
              width: '100%',
              maxWidth: 440,
              borderRadius: panelRadius,
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorderSecondary}`,
              boxShadow: screens.md ? token.boxShadowSecondary : undefined,
            }}
            styles={{ body: { padding: screens.md ? 32 : 22 } }}
          >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div>
                <Link to="/" style={{ fontSize: 13, color: token.colorPrimary }}>
                  ← Back to home
                </Link>
              </div>
              <div>
                <Typography.Title level={2} style={{ marginBottom: 8 }}>
                  {mode === 'register' ? 'Create admin workspace' : 'Welcome back'}
                </Typography.Title>
                <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  Sign up creates an <Typography.Text strong>admin</Typography.Text> account. Admins add team users and
                  can grant upload permission.
                </Typography.Paragraph>
              </div>
              <Segmented
                block
                value={mode}
                onChange={setMode}
                options={[
                  { label: 'Login', value: 'login' },
                  { label: 'Register (admin)', value: 'register' },
                ]}
              />
              <Form layout="vertical" onFinish={onFinish} requiredMark="optional" size="large">
                <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Enter a username' }]}>
                  <Input prefix={<UserOutlined style={{ color: token.colorTextTertiary }} />} placeholder="you@team" autoComplete="username" />
                </Form.Item>
                <Form.Item label="Password" name="password" rules={[{ required: true, min: 6, message: 'Min 6 characters' }]}>
                  <Input.Password prefix={<LockOutlined style={{ color: token.colorTextTertiary }} />} placeholder="••••••••" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
                </Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading} size="large" style={{ fontWeight: 600, marginTop: 4 }}>
                  {mode === 'register' ? 'Create admin account' : 'Sign in'}
                </Button>
              </Form>
              {!screens.md && (
                <>
                  <Divider plain style={{ margin: '8px 0' }} />
                  <Typography.Paragraph type="secondary" style={{ margin: 0, fontSize: 13, textAlign: 'center' }}>
                    Need the full pitch?{' '}
                    <Link to="/">
                      <Typography.Link>View landing</Typography.Link>
                    </Link>
                  </Typography.Paragraph>
                </>
              )}
            </Space>
          </Card>
        </Flex>
      </Col>
    </Row>
  )
}

export default LoginPage
