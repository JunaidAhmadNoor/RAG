import { App, Button, Card, Col, Flex, Form, Grid, Input, Popconfirm, Row, Space, Switch, Table, Typography, theme } from 'antd'
import { DeleteOutlined, TeamOutlined, UserAddOutlined } from '@ant-design/icons'
import { useCallback, useEffect, useState } from 'react'
import api from '../api/client'

const AdminUsersPage = () => {
  const { message } = App.useApp()
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/admin/users')
      setUsers(data || [])
    } catch {
      message.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [message])

  useEffect(() => {
    load()
  }, [load])

  const onCreate = async (values) => {
    try {
      await api.post('/api/admin/users', {
        username: values.username,
        password: values.password,
        can_upload: values.can_upload ?? false,
      })
      form.resetFields()
      message.success('User created')
      load()
    } catch (err) {
      message.error(err.response?.data?.detail || 'Create failed')
    }
  }

  const onToggleUpload = async (username, checked) => {
    try {
      await api.patch(`/api/admin/users/${encodeURIComponent(username)}`, {
        can_upload: checked,
      })
      message.success(checked ? 'Upload permission enabled' : 'Upload permission revoked')
      load()
    } catch (err) {
      message.error(err.response?.data?.detail || 'Update failed')
    }
  }

  const onDelete = async (username) => {
    try {
      await api.delete(`/api/admin/users/${encodeURIComponent(username)}`)
      message.success('User removed')
      load()
    } catch (err) {
      message.error(err.response?.data?.detail || 'Delete failed')
    }
  }

  const columns = [
    { title: 'Username', dataIndex: 'username', key: 'username', ellipsis: true },
    {
      title: 'Can upload',
      dataIndex: 'can_upload',
      key: 'can_upload',
      render: (_, record) => <Switch checked={record.can_upload} onChange={(c) => onToggleUpload(record.username, c)} />,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      responsive: ['md'],
      render: (v) => (v ? new Date(v).toLocaleString() : '—'),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Popconfirm
          title="Delete this user?"
          description="Their chat history will be removed. This cannot be undone."
          onConfirm={() => onDelete(record.username)}
          okText="Delete"
          okButtonProps={{ danger: true }}
        >
          <Button danger size="small" icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }} className="page-stack">
      <Card className="page-hero" style={{ borderColor: token.colorBorderSecondary }} styles={{ body: { padding: screens.md ? 28 : 20 } }}>
        <Flex vertical gap={8}>
          <Flex align="center" gap={12} wrap="wrap">
            <TeamOutlined style={{ fontSize: 22, color: token.colorPrimary }} />
            <Typography.Title level={3} style={{ margin: 0 }}>
              Team users
            </Typography.Title>
          </Flex>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0, maxWidth: 720 }}>
            Create users under your workspace. Toggle upload to let them add documents. Delete removes the user and
            their chats.
          </Typography.Paragraph>
        </Flex>
      </Card>

      <Card
        className="glass-surface"
        size="small"
        title={
          <Space>
            <UserAddOutlined />
            <span>Add user</span>
          </Space>
        }
        style={{ borderColor: token.colorBorderSecondary }}
      >
        <Form form={form} layout="vertical" onFinish={onCreate} initialValues={{ can_upload: false }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={10}>
              <Form.Item label="Username" name="username" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <Input placeholder="team_member" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={10}>
              <Form.Item label="Password" name="password" rules={[{ required: true, min: 6 }]} style={{ marginBottom: 0 }}>
                <Input.Password placeholder="••••••" />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item label="Can upload" name="can_upload" valuePropName="checked" style={{ marginBottom: 0 }}>
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Button type="primary" htmlType="submit" style={{ marginTop: 16 }}>
            Create user
          </Button>
        </Form>
      </Card>

      <Card className="glass-surface" style={{ borderColor: token.colorBorderSecondary }}>
        <Table rowKey="username" loading={loading} columns={columns} dataSource={users} pagination={false} scroll={{ x: true }} />
      </Card>
    </Space>
  )
}

export default AdminUsersPage
