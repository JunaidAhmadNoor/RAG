import { App, Button, Card, Form, Input, Segmented, Typography } from 'antd'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authStore } from '../store/authStore'

const LoginPage = () => {
  const { message } = App.useApp()
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

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <div style={{ marginBottom: 12 }}>
          <Link to="/">← Back to home</Link>
        </div>
        <Typography.Title level={2}>RAG Knowledge Chat</Typography.Title>
        <Typography.Paragraph type="secondary">
          Sign up creates an <strong>admin</strong> account. Admins add team users and can grant upload permission.
        </Typography.Paragraph>
        <Segmented
          block
          value={mode}
          onChange={setMode}
          options={[
            { label: 'Login', value: 'login' },
            { label: 'Register (admin)', value: 'register' },
          ]}
          style={{ marginBottom: 16 }}
        />
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Username" name="username" rules={[{ required: true }]}>
            <Input placeholder="Enter username" size="large" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, min: 6 }]}>
            <Input.Password placeholder="Enter password" size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading} size="large">
            {mode === 'register' ? 'Create admin account' : 'Sign in'}
          </Button>
        </Form>
      </Card>
    </div>
  )
}

export default LoginPage
