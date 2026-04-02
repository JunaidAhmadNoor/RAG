import { App, Button, Card, Form, Input, Popconfirm, Space, Switch, Table, Typography } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useCallback, useEffect, useState } from 'react'
import api from '../api/client'

const AdminUsersPage = () => {
  const { message } = App.useApp()
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
      render: (_, record) => (
        <Switch checked={record.can_upload} onChange={(c) => onToggleUpload(record.username, c)} />
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
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
    <Card className="upload-card page-card">
      <Typography.Title level={3}>Team users</Typography.Title>
      <Typography.Paragraph type="secondary">
        Create users under your workspace. Toggle upload to let them add documents. Delete removes the user and their
        chats.
      </Typography.Paragraph>

      <Card size="small" title="Add user" className="inner-card" style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical" onFinish={onCreate} initialValues={{ can_upload: false }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Space wrap style={{ width: '100%' }} align="start">
              <Form.Item label="Username" name="username" rules={[{ required: true }]} style={{ minWidth: 200, flex: 1 }}>
                <Input placeholder="team_member" />
              </Form.Item>
              <Form.Item label="Password" name="password" rules={[{ required: true, min: 6 }]} style={{ minWidth: 200, flex: 1 }}>
                <Input.Password placeholder="••••••" />
              </Form.Item>
              <Form.Item label="Can upload documents" name="can_upload" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Space>
            <Button type="primary" htmlType="submit">
              Create user
            </Button>
          </Space>
        </Form>
      </Card>

      <Table
        rowKey="username"
        loading={loading}
        columns={columns}
        dataSource={users}
        pagination={false}
        scroll={{ x: true }}
      />
    </Card>
  )
}

export default AdminUsersPage
