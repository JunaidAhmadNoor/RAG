import { App, Button, Card, Flex, Popconfirm, Table, Typography, theme } from 'antd'
import { DeleteOutlined, FolderOpenOutlined } from '@ant-design/icons'
import { useCallback, useEffect, useState } from 'react'
import api from '../api/client'

const AdminDocumentsPage = () => {
  const { message } = App.useApp()
  const { token } = theme.useToken()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/documents')
      setDocs(data.documents || [])
    } catch {
      message.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [message])

  useEffect(() => {
    load()
  }, [load])

  const onDelete = async (docId) => {
    try {
      await api.delete(`/api/documents/${docId}`)
      message.success('Document removed')
      load()
    } catch (err) {
      message.error(err.response?.data?.detail || 'Delete failed')
    }
  }

  const columns = [
    {
      title: 'File name',
      dataIndex: 'filename',
      key: 'filename',
      ellipsis: true,
    },
    {
      title: 'Uploaded by',
      dataIndex: 'uploaded_by',
      key: 'uploaded_by',
      responsive: ['md'],
    },
    {
      title: 'Chunks',
      dataIndex: 'chunks',
      key: 'chunks',
      width: 90,
    },
    {
      title: 'Uploaded',
      dataIndex: 'created_at',
      key: 'created_at',
      responsive: ['lg'],
      render: (v) => (v ? new Date(v).toLocaleString() : '—'),
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Popconfirm title="Delete this document from storage and the index?" onConfirm={() => onDelete(record.doc_id)}>
          <Button danger size="small" icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <Card style={{ borderColor: token.colorBorderSecondary, background: token.colorBgContainer }}>
      <Flex vertical gap={10} style={{ marginBottom: 20 }}>
        <Flex align="center" gap={12}>
          <FolderOpenOutlined style={{ fontSize: 22, color: token.colorPrimary }} />
          <Typography.Title level={3} style={{ margin: 0 }}>
            Documents
          </Typography.Title>
        </Flex>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0, maxWidth: 720 }}>
          Files in your workspace. Deleting removes the file, metadata, and vector index entries.
        </Typography.Paragraph>
      </Flex>
      <Table rowKey="doc_id" loading={loading} columns={columns} dataSource={docs} scroll={{ x: true }} />
    </Card>
  )
}

export default AdminDocumentsPage
