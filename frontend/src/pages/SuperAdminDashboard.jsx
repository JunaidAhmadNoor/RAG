import {
  App,
  Button,
  Card,
  Drawer,
  Form,
  Input,
  Modal,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd'
import { PlusOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import api from '../api/client'

const { Title, Paragraph, Text } = Typography

const SuperAdminDashboard = () => {
  const { message } = App.useApp()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [teamUsers, setTeamUsers] = useState([])
  const [teamLoading, setTeamLoading] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [form] = Form.useForm()

  const loadAdmins = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/superadmin/admins')
      setAdmins(Array.isArray(data) ? data : [])
    } catch {
      message.error('Failed to load admins')
    } finally {
      setLoading(false)
    }
  }, [message])

  useEffect(() => {
    loadAdmins()
  }, [loadAdmins])

  const totals = useMemo(() => {
    const team = admins.reduce((s, a) => s + (a.team_user_count || 0), 0)
    const docs = admins.reduce((s, a) => s + (a.document_count || 0), 0)
    return { admins: admins.length, team, docs }
  }, [admins])

  const openTeamDrawer = async (record) => {
    setSelectedAdmin(record)
    setDrawerOpen(true)
    setTeamLoading(true)
    setTeamUsers([])
    try {
      const { data } = await api.get(`/api/superadmin/admins/${encodeURIComponent(record.username)}/users`)
      setTeamUsers(Array.isArray(data) ? data : [])
    } catch {
      message.error('Failed to load team users')
    } finally {
      setTeamLoading(false)
    }
  }

  const toggleActive = async (record, checked) => {
    try {
      await api.patch(`/api/superadmin/admins/${encodeURIComponent(record.username)}/active`, {
        is_active: checked,
      })
      message.success(checked ? 'Admin activated' : 'Admin suspended')
      loadAdmins()
    } catch (err) {
      message.error(err.response?.data?.detail || 'Update failed')
    }
  }

  const onCreateAdmin = async (values) => {
    setCreateLoading(true)
    try {
      await api.post('/api/superadmin/admins', {
        username: values.username,
        password: values.password,
      })
      message.success('Admin created')
      form.resetFields()
      setCreateOpen(false)
      loadAdmins()
    } catch (err) {
      message.error(err.response?.data?.detail || 'Create failed')
    } finally {
      setCreateLoading(false)
    }
  }

  const columns = [
    {
      title: 'Admin',
      dataIndex: 'username',
      key: 'username',
      render: (v) => (
        <Space>
          <UserOutlined />
          <Text strong>{v}</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      key: 'is_active',
      width: 120,
      render: (_, r) => (r.is_active !== false ? <Tag color="green">Active</Tag> : <Tag color="red">Suspended</Tag>),
    },
    {
      title: 'Team users',
      dataIndex: 'team_user_count',
      key: 'team_user_count',
      width: 110,
    },
    {
      title: 'Documents',
      dataIndex: 'document_count',
      key: 'document_count',
      width: 110,
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
      width: 280,
      render: (_, record) => (
        <Space wrap>
          <Button type="link" icon={<TeamOutlined />} onClick={() => openTeamDrawer(record)}>
            View team
          </Button>
          <Space size="small">
            <Text type="secondary">Active</Text>
            <Switch checked={record.is_active !== false} onChange={(c) => toggleActive(record, c)} />
          </Space>
        </Space>
      ),
    },
  ]

  return (
    <div className="superadmin-page">
      <div className="superadmin-header">
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>
            Platform overview
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Manage admin accounts, inspect team users (read-only), and suspend access. Team users cannot be deleted
            from this console.
          </Paragraph>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setCreateOpen(true)}>
          New admin
        </Button>
      </div>

      <Space wrap size="large" className="superadmin-stats">
        <Card size="small" className="superadmin-stat-card">
          <Statistic title="Admins" value={totals.admins} />
        </Card>
        <Card size="small" className="superadmin-stat-card">
          <Statistic title="Team users (all workspaces)" value={totals.team} />
        </Card>
        <Card size="small" className="superadmin-stat-card">
          <Statistic title="Indexed documents (all)" value={totals.docs} />
        </Card>
      </Space>

      <Card className="page-card superadmin-table-card">
        <Table
          rowKey="username"
          loading={loading}
          columns={columns}
          dataSource={admins}
          pagination={{ pageSize: 8 }}
          scroll={{ x: true }}
        />
      </Card>

      <Drawer
        title={selectedAdmin ? `Team — ${selectedAdmin.username}` : 'Team'}
        width={400}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Paragraph type="secondary" style={{ marginTop: 0 }}>
          Read-only list. Deleting users is reserved for each workspace admin.
        </Paragraph>
        <Table
          size="small"
          loading={teamLoading}
          rowKey="username"
          pagination={false}
          dataSource={teamUsers}
          columns={[
            { title: 'Username', dataIndex: 'username', key: 'u' },
            {
              title: 'Can upload',
              dataIndex: 'can_upload',
              key: 'cu',
              render: (v) => (v ? 'Yes' : 'No'),
            },
            {
              title: 'Joined',
              dataIndex: 'created_at',
              key: 'ca',
              render: (v) => (v ? new Date(v).toLocaleDateString() : '—'),
            },
          ]}
        />
      </Drawer>

      <Modal
        title="Create admin workspace"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onCreateAdmin}>
          <Form.Item label="Username" name="username" rules={[{ required: true, min: 3 }]}>
            <Input placeholder="new_admin" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={createLoading} block>
            Create admin
          </Button>
        </Form>
      </Modal>
    </div>
  )
}

export default SuperAdminDashboard
