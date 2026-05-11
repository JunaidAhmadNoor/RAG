import { App, Button, Card, Flex, Grid, Space, Typography, Upload, theme } from 'antd'
import { CloudUploadOutlined, FileTextOutlined, InboxOutlined, UploadOutlined } from '@ant-design/icons'
import { useState } from 'react'
import api from '../api/client'

const AdminUploadPage = () => {
  const { message } = App.useApp()
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const [fileList, setFileList] = useState([])
  const [loading, setLoading] = useState(false)

  const uploadFiles = async () => {
    if (fileList.length === 0) {
      message.warning('Choose at least one file')
      return
    }
    setLoading(true)
    try {
      for (const file of fileList) {
        const formData = new FormData()
        formData.append('file', file.originFileObj)
        await api.post('/api/documents/upload', formData)
      }
      message.success(`${fileList.length} file(s) uploaded and indexed.`)
      setFileList([])
    } catch (err) {
      message.error(err.response?.data?.detail || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }} className="page-stack">
      <Card
        className="page-hero"
        styles={{ body: { padding: screens.md ? 28 : 20 } }}
        style={{ borderColor: token.colorBorderSecondary }}
      >
        <Flex vertical gap={8}>
          <Flex align="center" gap={12}>
            <CloudUploadOutlined style={{ fontSize: 22, color: token.colorPrimary }} />
            <Typography.Title level={3} style={{ margin: 0 }}>
              Document upload
            </Typography.Title>
          </Flex>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0, maxWidth: 640 }}>
            Add knowledge to your workspace. Supported: txt, md, pdf, docx. Files are parsed, chunked, and indexed for
            chat.
          </Typography.Paragraph>
        </Flex>
      </Card>

      <Card className="glass-surface" style={{ borderColor: token.colorBorderSecondary }}>
        <Upload.Dragger
          multiple
          beforeUpload={() => false}
          fileList={fileList}
          onChange={({ fileList: next }) => setFileList(next)}
          style={{ background: token.colorFillQuaternary, borderRadius: token.borderRadiusLG }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ fontSize: 48, color: token.colorPrimary }} />
          </p>
          <p className="ant-upload-text" style={{ fontWeight: 600 }}>
            Drag and drop files here, or click to browse
          </p>
          <p className="ant-upload-hint">
            <FileTextOutlined style={{ marginRight: 6 }} />
            Files stay in your tenant and power the assistant&apos;s answers.
          </p>
        </Upload.Dragger>
        <Button
          type="primary"
          icon={<UploadOutlined />}
          loading={loading}
          onClick={uploadFiles}
          size="large"
          block
          style={{ marginTop: 20, fontWeight: 600 }}
        >
          Upload and index
        </Button>
      </Card>
    </Space>
  )
}

export default AdminUploadPage
