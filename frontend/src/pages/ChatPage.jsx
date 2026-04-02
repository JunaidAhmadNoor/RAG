import {
  App,
  Avatar,
  Button,
  Drawer,
  Empty,
  Flex,
  Input,
  Layout,
  List,
  Spin,
  Tag,
  Typography,
  Grid,
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
        return [
          ...base,
          { role: 'assistant', text: data.answer, sources: data.sources || [] },
        ]
      })
      loadSessions()
    } catch (err) {
      message.error(err.response?.data?.detail || 'Message failed')
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Something went wrong. Try again.', error: true },
      ])
    } finally {
      setLoading(false)
    }
  }

  const sessionList = (
    <div className="chat-session-panel">
      <Button type="primary" icon={<PlusOutlined />} block onClick={startNewChat} className="chat-new-btn">
        New chat
      </Button>
      <Spin spinning={sessionsLoading}>
        <List
          className="chat-session-list"
          dataSource={sessions}
          locale={{ emptyText: 'No past chats yet' }}
          renderItem={(item) => (
            <List.Item
              className={
                item.session_id === currentSessionId ? 'chat-session-item is-active' : 'chat-session-item'
              }
              onClick={() => selectSession(item.session_id)}
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
          )}
        />
      </Spin>
    </div>
  )

  return (
    <Layout className="chat-shell">
      {screens.md ? (
        <Sider width={280} className="chat-sider" theme="dark">
          {sessionList}
        </Sider>
      ) : (
        <Drawer title="Chats" placement="left" width={300} open={historyOpen} onClose={() => setHistoryOpen(false)}>
          {sessionList}
        </Drawer>
      )}

      <Content className="chat-main">
        <Flex justify="space-between" align="center" className="chat-toolbar" wrap="wrap" gap={8}>
          <Flex gap={8} align="center">
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

        <div className="chat-messages">
          {loadingSession ? (
            <Flex justify="center" align="center" style={{ minHeight: 200 }}>
              <Spin />
            </Flex>
          ) : messages.length === 0 && !loading ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span>
                  <Text type="secondary">Pick a chat from the sidebar or start a new one.</Text>
                </span>
              }
            />
          ) : (
            <Flex vertical gap="middle">
              {messages.map((item, idx) => (
                <Flex
                  key={idx}
                  gap="middle"
                  align="flex-start"
                  justify={item.role === 'user' ? 'flex-end' : 'flex-start'}
                  className={`chat-row chat-row--${item.role}`}
                >
                  {item.role === 'assistant' && (
                    <Avatar
                      size={36}
                      icon={<RobotOutlined />}
                      className="chat-avatar chat-avatar--bot"
                    />
                  )}
                  <div className={`chat-bubble chat-bubble--${item.role}`}>
                    <Text strong className="chat-bubble-label">
                      {item.role === 'user' ? 'You' : 'Assistant'}
                    </Text>
                    <div className="chat-bubble-body">
                      <Typography.Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                        {item.role === 'assistant' ? getCleanAnswer(item.text) : item.text}
                      </Typography.Paragraph>
                      {item.role === 'assistant' && item.sources?.length > 0 && (
                        <div className="chat-sources">
                          <Tag color="purple">Sources</Tag>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {item.sources.join(' · ')}
                          </Text>
                        </div>
                      )}
                    </div>
                  </div>
                  {item.role === 'user' && (
                    <Avatar size={36} icon={<UserOutlined />} className="chat-avatar chat-avatar--user" />
                  )}
                </Flex>
              ))}
              {loading && (
                <Flex align="center" gap="small" className="chat-row chat-row--assistant">
                  <Avatar size={36} icon={<RobotOutlined />} className="chat-avatar chat-avatar--bot" />
                  <div className="chat-bubble chat-bubble--assistant">
                    <Spin size="small" /> <Text type="secondary">Thinking…</Text>
                  </div>
                </Flex>
              )}
              <div ref={listEndRef} />
            </Flex>
          )}
        </div>

        <div className="chat-composer">
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
            className="chat-input"
          />
          <Button
            type="primary"
            size="large"
            icon={<SendOutlined />}
            loading={loading}
            onClick={send}
            className="chat-send"
          >
            Send
          </Button>
        </div>
      </Content>
    </Layout>
  )
}

export default ChatPage
