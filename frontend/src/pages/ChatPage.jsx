import {
  App,
  Avatar,
  Button,
  Card,
  Drawer,
  Empty,
  Flex,
  Grid,
  Input,
  Layout,
  List,
  Spin,
  Tag,
  theme,
  Typography,
} from 'antd'
import {
  DeleteOutlined,
  MenuOutlined,
  PlusOutlined,
  RobotOutlined,
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useCallback, useEffect, useRef, useState } from 'react'
import api from '../api/client'

dayjs.extend(relativeTime)

const { Sider, Content } = Layout
const { Text } = Typography

const WELCOME_TEXT =
  'Ask questions about your workspace documents. I answer from your indexed files and cite sources when relevant.'

const ChatPage = () => {
  const { message } = App.useApp()
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const listEndRef = useRef(null)
  const [sessions, setSessions] = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingSession, setLoadingSession] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  const scrollToBottom = () => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getCleanAnswer = (text) => {
    if (!text) return ''
    const marker = '\n\nCitations:'
    const idx = text.indexOf(marker)
    return idx >= 0 ? text.slice(0, idx).trim() : text
  }

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true)
    try {
      const { data } = await api.get('/api/chat/sessions')
      setSessions(Array.isArray(data) ? data : [])
    } catch {
      message.error('Could not load chat history')
    } finally {
      setSessionsLoading(false)
    }
  }, [message])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const applyServerMessages = (doc) => {
    const rows = []
    for (const m of doc?.messages || []) {
      if (m.role === 'user') {
        rows.push({ role: 'user', text: m.content })
      } else {
        rows.push({
          role: 'assistant',
          text: m.content,
          sources: m.sources || [],
        })
      }
    }
    setMessages(rows)
  }

  const selectSession = async (sessionId) => {
    setHistoryOpen(false)
    setLoadingSession(true)
    try {
      const { data } = await api.get(`/api/chat/sessions/${encodeURIComponent(sessionId)}`)
      setCurrentSessionId(sessionId)
      applyServerMessages(data)
      if (!data?.messages?.length) {
        setMessages([{ role: 'assistant', text: WELCOME_TEXT, local: true }])
      }
    } catch {
      message.error('Could not open this chat')
    } finally {
      setLoadingSession(false)
    }
  }

  const startNewChat = async () => {
    setHistoryOpen(false)
    try {
      const { data } = await api.post('/api/chat/sessions')
      setCurrentSessionId(data.session_id)
      setMessages([{ role: 'assistant', text: WELCOME_TEXT, local: true }])
      await loadSessions()
    } catch {
      message.error('Could not start a new chat')
    }
  }

  const deleteSession = async (sessionId, e) => {
    e?.stopPropagation?.()
    try {
      await api.delete(`/api/chat/sessions/${encodeURIComponent(sessionId)}`)
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null)
        setMessages([])
      }
      message.success('Chat removed')
      loadSessions()
    } catch {
      message.error('Could not delete chat')
    }
  }

  const send = async () => {
    const text = question.trim()
    if (!text) return
    setQuestion('')
    setMessages((prev) => {
      const base = prev.filter((m) => !m.local)
      return [...base, { role: 'user', text }]
    })
    setLoading(true)
    try {
      const { data } = await api.post('/api/chat', {
        message: text,
        top_k: 4,
        session_id: currentSessionId || undefined,
      })
      if (data.session_id && !currentSessionId) {
        setCurrentSessionId(data.session_id)
      }
      setMessages((prev) => {
        const base = prev.filter((m) => !m.local)
        return [...base, { role: 'assistant', text: data.answer, sources: data.sources || [] }]
      })
      loadSessions()
    } catch (err) {
      message.error(err.response?.data?.detail || 'Message failed')
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Something went wrong. Try again.', error: true }])
    } finally {
      setLoading(false)
    }
  }

  const sessionList = (
    <Flex vertical gap={10} style={{ height: '100%', minHeight: 0, padding: screens.md ? 12 : 8 }}>
      <Button type="primary" icon={<PlusOutlined />} block onClick={startNewChat} size="large">
        New chat
      </Button>
      <Spin spinning={sessionsLoading} style={{ flex: 1, minHeight: 0 }}>
        <List
          dataSource={sessions}
          locale={{ emptyText: 'No past chats yet' }}
          style={{ maxHeight: screens.md ? 'calc(100vh - 200px)' : 'auto', overflowY: 'auto' }}
          renderItem={(item) => {
            const active = item.session_id === currentSessionId
            return (
              <List.Item
                key={item.session_id}
                onClick={() => selectSession(item.session_id)}
                style={{
                  cursor: 'pointer',
                  padding: '10px 12px',
                  marginBottom: 8,
                  borderRadius: token.borderRadius,
                  border: `1px solid ${active ? `${token.colorPrimary}55` : token.colorBorderSecondary}`,
                  background: active ? `${token.colorPrimary}22` : token.colorFillQuaternary,
                }}
                actions={[
                  <Button
                    key="del"
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => deleteSession(item.session_id, e)}
                    aria-label="Delete chat"
                  />,
                ]}
              >
                <List.Item.Meta
                  title={<Text ellipsis>{item.title || 'Chat'}</Text>}
                  description={
                    item.updated_at ? (
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {dayjs(item.updated_at).fromNow()}
                      </Text>
                    ) : null
                  }
                />
              </List.Item>
            )
          }}
        />
      </Spin>
    </Flex>
  )

  const bubbleBase = {
    maxWidth: !screens.md ? 'calc(100% - 52px)' : 720,
    padding: '12px 16px',
    borderRadius: token.borderRadiusLG,
    border: `1px solid ${token.colorBorderSecondary}`,
  }

  return (
    <Layout
      style={{
        flex: 1,
        minHeight: 0,
        background: 'transparent',
        overflow: 'hidden',
      }}
    >
      {screens.md ? (
        <Sider
          width={280}
          theme="dark"
          style={{
            borderRight: `1px solid ${token.colorBorderSecondary}`,
            overflow: 'hidden',
          }}
        >
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>{sessionList}</div>
        </Sider>
      ) : (
        <Drawer title="Chats" placement="left" width={320} open={historyOpen} onClose={() => setHistoryOpen(false)} styles={{ body: { padding: 0 } }}>
          {sessionList}
        </Drawer>
      )}

      <Content
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          overflow: 'hidden',
          background: `${token.colorBgLayout}66`,
          padding: screens.md ? '16px 24px 24px' : '12px 14px 16px',
        }}
      >
        <Flex justify="space-between" align="center" wrap="wrap" gap={10} style={{ flexShrink: 0, marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
          <Flex gap={10} align="center" wrap="wrap">
            {!screens.md && (
              <Button icon={<MenuOutlined />} onClick={() => setHistoryOpen(true)}>
                Chats
              </Button>
            )}
            <Typography.Title level={4} style={{ margin: 0 }}>
              Document assistant
            </Typography.Title>
          </Flex>
          <Button type="primary" ghost icon={<PlusOutlined />} onClick={startNewChat}>
            New chat
          </Button>
        </Flex>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '8px 2px 16px',
          }}
        >
          {loadingSession ? (
            <Flex justify="center" align="center" style={{ minHeight: 200 }}>
              <Spin />
            </Flex>
          ) : messages.length === 0 && !loading ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<Text type="secondary">Pick a chat from the sidebar or start a new one.</Text>}
            />
          ) : (
            <Flex vertical gap={16}>
              {messages.map((item, idx) => (
                <Flex
                  key={idx}
                  gap={12}
                  align="flex-start"
                  justify={item.role === 'user' ? 'flex-end' : 'flex-start'}
                  style={{ width: '100%', flexDirection: item.role === 'user' ? 'row-reverse' : 'row' }}
                >
                  {item.role === 'assistant' && (
                    <Avatar
                      size={36}
                      icon={<RobotOutlined />}
                      style={{
                        flexShrink: 0,
                        background: `linear-gradient(145deg, ${token.colorPrimary}, ${token.colorInfo})`,
                      }}
                    />
                  )}
                  <div
                    style={{
                      ...bubbleBase,
                      background:
                        item.role === 'user'
                          ? `linear-gradient(135deg, ${token.colorPrimary}55, ${token.colorPrimary}18)`
                          : token.colorFillQuaternary,
                      borderColor: item.role === 'user' ? `${token.colorPrimary}44` : token.colorBorderSecondary,
                    }}
                  >
                    <Text strong style={{ display: 'block', fontSize: 11, opacity: 0.75, marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      {item.role === 'user' ? 'You' : 'Assistant'}
                    </Text>
                    <Typography.Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap', fontSize: 15, lineHeight: 1.55 }}>
                      {item.role === 'assistant' ? getCleanAnswer(item.text) : item.text}
                    </Typography.Paragraph>
                    {item.role === 'assistant' && item.sources?.length > 0 && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${token.colorBorderSecondary}` }}>
                        <Tag color="purple">Sources</Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.sources.join(' · ')}
                        </Text>
                      </div>
                    )}
                  </div>
                  {item.role === 'user' && (
                    <Avatar size={36} icon={<UserOutlined />} style={{ flexShrink: 0, background: token.colorFillSecondary }} />
                  )}
                </Flex>
              ))}
              {loading && (
                <Flex align="center" gap={12}>
                    <Avatar size={36} icon={<RobotOutlined />} style={{ background: `linear-gradient(145deg, ${token.colorPrimary}, ${token.colorInfo})` }} />
                  <Card size="small" styles={{ body: { padding: '10px 14px' } }} style={{ borderColor: token.colorBorderSecondary }}>
                    <Spin size="small" /> <Text type="secondary"> Thinking…</Text>
                  </Card>
                </Flex>
              )}
              <div ref={listEndRef} />
            </Flex>
          )}
        </div>

        <Flex
          gap={10}
          align="flex-end"
          wrap={!screens.md ? 'wrap' : 'nowrap'}
          style={{
            flexShrink: 0,
            paddingTop: 12,
            borderTop: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Input.TextArea
            autoSize={{ minRows: 1, maxRows: 6 }}
            placeholder="Message your documents… (Enter to send, Shift+Enter for newline)"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            disabled={loading}
            style={{ flex: 1, minWidth: 0, fontSize: 15 }}
          />
          <Button
            type="primary"
            size="large"
            icon={<SendOutlined />}
            loading={loading}
            onClick={send}
            style={{ flexShrink: 0, width: !screens.md ? '100%' : 'auto' }}
          >
            Send
          </Button>
        </Flex>
      </Content>
    </Layout>
  )
}

export default ChatPage
