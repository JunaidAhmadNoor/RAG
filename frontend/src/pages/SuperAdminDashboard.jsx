import {
  App,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Flex,
  Form,
  Grid,
  Input,
  List,
  Modal,
  Row,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Typography,
  theme,
} from 'antd'
import { CrownOutlined, PlusOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import api from '../api/client'

const { Title, Paragraph, Text } = Typography

const SuperAdminDashboard = () => {
  const { message } = App.useApp()
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md
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

  const tableColumns = [
    {
      title: 'Admin',
      dataIndex: 'username',
      key: 'username',
      width: 220,
      ellipsis: true,
      render: (v) => (
        <Flex align="center" gap={8} style={{ maxWidth: '100%', minWidth: 0 }}>
          <UserOutlined style={{ flexShrink: 0 }} />
          <Text strong ellipsis style={{ flex: 1, minWidth: 0 }}>
            {v}
          </Text>
        </Flex>
      ),
    },
    {
      title: 'Status',
      key: 'is_active',
      width: 110,
      render: (_, r) => (r.is_active !== false ? <Tag color="green">Active</Tag> : <Tag color="red">Suspended</Tag>),
    },
    {
      title: 'Team',
      dataIndex: 'team_user_count',
      key: 'team_user_count',
      width: 88,
    },
    {
      title: 'Docs',
      dataIndex: 'document_count',
      key: 'document_count',
      width: 80,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      ellipsis: true,
      render: (v) => (v ? new Date(v).toLocaleString() : '—'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space wrap size={[8, 8]}>
          <Button type="link" icon={<TeamOutlined />} onClick={() => openTeamDrawer(record)} style={{ padding: 0 }}>
            Team
          </Button>
          <Flex align="center" gap={6} wrap="nowrap">
            <Text type="secondary">On</Text>
            <Switch size="small" checked={record.is_active !== false} onChange={(c) => toggleActive(record, c)} />
          </Flex>
        </Space>
      ),
    },
  ]

  const adminCards = (
    <List
      loading={loading}
      dataSource={admins}
      locale={{ emptyText: 'No admins yet' }}
      split={false}
      renderItem={(record) => (
        <List.Item key={record.username} style={{ padding: '0 0 12px', border: 'none' }}>
          <Card size="small" style={{ width: '100%', borderColor: token.colorBorderSecondary }} styles={{ body: { padding: 14 } }}>
            <Flex vertical gap={12}>
              <Flex justify="space-between" align="flex-start" gap={10}>
                <Text strong ellipsis style={{ flex: 1, minWidth: 0, fontSize: 15 }}>
                  {record.username}
                </Text>
                {record.is_active !== false ? <Tag color="green">Active</Tag> : <Tag color="red">Suspended</Tag>}
              </Flex>
              <Row gutter={[10, 10]}>
                <Col span={12}>
                  <Card size="small" type="inner" styles={{ body: { padding: '8px 10px' } }}>
                    <Statistic title="Team users" value={record.team_user_count ?? 0} valueStyle={{ fontSize: 18 }} />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" type="inner" styles={{ body: { padding: '8px 10px' } }}>
                    <Statistic title="Documents" value={record.document_count ?? 0} valueStyle={{ fontSize: 18 }} />
                  </Card>
                </Col>
              </Row>
              {record.created_at ? (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Created {new Date(record.created_at).toLocaleString()}
                </Text>
              ) : null}
              <Button block type="primary" ghost icon={<TeamOutlined />} onClick={() => openTeamDrawer(record)}>
                View team
              </Button>
              <Flex justify="space-between" align="center" wrap="nowrap" gap={12}>
                <Text type="secondary">Workspace active</Text>
                <Switch checked={record.is_active !== false} onChange={(c) => toggleActive(record, c)} />
              </Flex>
            </Flex>
          </Card>
        </List.Item>
      )}
    />
  )

  const teamDrawerContent = isMobile ? (
    <List
      loading={teamLoading}
      dataSource={teamUsers}
      locale={{ emptyText: 'No team users' }}
      split={false}
      renderItem={(u) => (
        <List.Item key={u.username} style={{ padding: '0 0 10px', border: 'none' }}>
          <Card size="small" style={{ width: '100%' }} styles={{ body: { padding: 12 } }}>
            <Descriptions column={1} size="small" styles={{ label: { width: 100 } }}>
              <Descriptions.Item label="Username">
                <Text ellipsis>{u.username}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Can upload">{u.can_upload ? 'Yes' : 'No'}</Descriptions.Item>
              <Descriptions.Item label="Joined">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </List.Item>
      )}
    />
  ) : (
    <Table
      size="small"
      loading={teamLoading}
      rowKey="username"
      pagination={false}
      dataSource={teamUsers}
      scroll={{ x: 420 }}
      columns={[
        { title: 'Username', dataIndex: 'username', key: 'u', ellipsis: true },
        {
          title: 'Can upload',
          dataIndex: 'can_upload',
          key: 'cu',
          width: 100,
          render: (v) => (v ? 'Yes' : 'No'),
        },
        {
          title: 'Joined',
          dataIndex: 'created_at',
          key: 'ca',
          width: 120,
          render: (v) => (v ? new Date(v).toLocaleDateString() : '—'),
        },
      ]}
    />
  )

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }} className="page-stack">
      <Card
        className="page-hero"
        style={{
          borderColor: token.colorBorderSecondary,
        }}
        styles={{ body: { padding: screens.md ? 28 : 16 } }}
      >
        <Flex justify="space-between" align="flex-start" gap={16} wrap="wrap">
          <Space align="start" size={14} wrap>
            <Flex
              align="center"
              justify="center"
              style={{
                width: 48,
                height: 48,
                borderRadius: token.borderRadiusLG,
                background: `${token.colorWarning}22`,
                border: `1px solid ${token.colorWarning}44`,
                flexShrink: 0,
              }}
            >
              <CrownOutlined style={{ fontSize: 22, color: token.colorWarning }} />
            </Flex>
            <div style={{ minWidth: 0 }}>
              <Title level={isMobile ? 4 : 3} style={{ marginBottom: 6 }}>
                Platform overview
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: 0, maxWidth: 640 }}>
                Manage admin accounts, inspect team users (read-only), and suspend access. Team users cannot be deleted
                from this console.
              </Paragraph>
            </div>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setCreateOpen(true)} style={{ fontWeight: 600 }} block={isMobile}>
            New admin
          </Button>
        </Flex>
      </Card>

      <Row gutter={[12, 12]}>
        <Col xs={24} sm={8}>
          <Card size="small" className="metric-card" style={{ borderColor: token.colorBorderSecondary }}>
            <Statistic title="Admins" value={totals.admins} valueStyle={{ color: token.colorText }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" className="metric-card" style={{ borderColor: token.colorBorderSecondary }}>
            <Statistic
              title={isMobile ? 'Team users (all)' : 'Team users (all workspaces)'}
              value={totals.team}
              valueStyle={{ color: token.colorText }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" className="metric-card" style={{ borderColor: token.colorBorderSecondary }}>
            <Statistic title={isMobile ? 'Documents (all)' : 'Indexed documents (all)'} value={totals.docs} valueStyle={{ color: token.colorText }} />
          </Card>
        </Col>
      </Row>

      <Card className="glass-surface" style={{ borderColor: token.colorBorderSecondary }} styles={{ body: isMobile ? { padding: 12 } : undefined }}>
        {isMobile ? (
          adminCards
        ) : (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <Table
              rowKey="username"
              loading={loading}
              columns={tableColumns}
              dataSource={admins}
              pagination={{ pageSize: 8, showSizeChanger: false }}
              scroll={{ x: 960 }}
              tableLayout="fixed"
            />
          </div>
        )}
      </Card>

      <Drawer
        title={selectedAdmin ? `Team — ${selectedAdmin.username}` : 'Team'}
        width={screens.md ? 420 : '100%'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{ body: { paddingTop: 8 } }}
      >
        <Paragraph type="secondary" style={{ marginTop: 0 }}>
          Read-only list. Deleting users is reserved for each workspace admin.
        </Paragraph>
        {teamDrawerContent}
      </Drawer>

      <Modal title="Create admin workspace" open={createOpen} onCancel={() => setCreateOpen(false)} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={onCreateAdmin}>
          <Form.Item label="Username" name="username" rules={[{ required: true, min: 3 }]}>
            <Input placeholder="new_admin" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={createLoading} block size="large" style={{ fontWeight: 600 }}>
            Create admin
          </Button>
        </Form>
      </Modal>
    </Space>
  )
}

export default SuperAdminDashboard
