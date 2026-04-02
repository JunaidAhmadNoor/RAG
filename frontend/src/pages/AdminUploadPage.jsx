import { App, Button, Card, Typography, Upload } from 'antd'
import { InboxOutlined, UploadOutlined } from '@ant-design/icons'
import { useState } from 'react'
import api from '../api/client'

const AdminUploadPage = () => {
  const { message } = App.useApp()
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
    <Card className="upload-card page-card">
      <Typography.Title level={3}>Document upload</Typography.Title>
      <Typography.Paragraph type="secondary">
        Upload one or multiple files. Supported: txt, md, pdf, docx.
      </Typography.Paragraph>

      <Upload.Dragger
        multiple
        beforeUpload={() => false}
        fileList={fileList}
        onChange={({ fileList: next }) => setFileList(next)}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Drag and drop files here, or click to browse</p>
        <p className="ant-upload-hint">Files are indexed for chat in your workspace.</p>
      </Upload.Dragger>

      <Button type="primary" icon={<UploadOutlined />} loading={loading} onClick={uploadFiles} style={{ marginTop: 16 }} size="large" block>
        Upload and index
      </Button>
    </Card>
  )
}

export default AdminUploadPage
