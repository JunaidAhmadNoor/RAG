import { Avatar, Button, Divider, Drawer, Flex, Grid, Layout, Menu, Space, Tag, theme, Tooltip, Typography } from 'antd'
import {
  CrownOutlined,
  FileAddOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuOutlined,
  MessageOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { authStore } from '../store/authStore'

const { Header, Content } = Layout

const AppLayout = ({ children, fullBleed = false, variant = 'default' }) => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const screens = Grid.useBreakpoint()
  const { token } = theme.useToken()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { role, username, canUpload, logout } = authStore()

  const defaultItems = [
    { key: '/chat', icon: <MessageOutlined />, label: <Link to="/chat">Chat</Link> },
    ...(canUpload || role === 'admin'
      ? [{ key: '/admin/upload', icon: <FileAddOutlined />, label: <Link to="/admin/upload">Upload</Link> }]
      : []),
    ...(role === 'admin'
      ? [
          { key: '/admin/users', icon: <TeamOutlined />, label: <Link to="/admin/users">Team</Link> },
          {
            key: '/admin/documents',
            icon: <FileTextOutlined />,
            label: <Link to="/admin/documents">Documents</Link>,
          },
        ]
      : []),
  ]

  const superItems = [
    {
      key: '/superadmin',
      icon: <CrownOutlined />,
      label: <Link to="/superadmin">Platform</Link>,
    },
  ]

  const items = variant === 'superadmin' ? superItems : defaultItems
  const brandTitle = variant === 'superadmin' ? 'Platform console' : 'RAG Workspace'
  const contentMax = variant === 'superadmin' ? 1200 : 1040

  const shellStyle = useMemo(() => {
    const base = {
      minHeight: '100vh',
      background: 'transparent',
      display: 'flex',
      flexDirection: 'column',
    }
    if (fullBleed && variant !== 'superadmin') {
      return { ...base, height: '100vh', maxHeight: '100vh', overflow: 'hidden' }
    }
    return base
  }, [fullBleed, variant])

  const headerBarStyle = useMemo(
    () => ({
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: 64,
      padding: 0,
      lineHeight: 'normal',
      display: 'flex',
      alignItems: 'center',
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
      background: token.Layout?.headerBg || token.colorBgElevated,
      backdropFilter: 'blur(18px)',
      boxShadow: '0 10px 28px rgba(3, 7, 13, 0.24)',
    }),
    [token],
  )

  const menuProps = {
    mode: 'horizontal',
    selectedKeys: [pathname],
    items,
    theme: 'dark',
    style: {
      flex: '0 1 auto',
      minWidth: 0,
      borderBottom: 'none',
      background: 'transparent',
      lineHeight: '62px',
      justifyContent: 'center',
    },
    onClick: () => setDrawerOpen(false),
  }

  const innerPadding = screens.lg ? 32 : screens.md ? 24 : 14

  const brandDesktop = (
    <Space align="center" size={8} style={{ flexShrink: 0 }}>
      {variant === 'superadmin' ? (
        <Tag icon={<CrownOutlined />} color="gold" style={{ margin: 0 }}>
          Super
        </Tag>
      ) : null}
      <Typography.Text
        strong
        style={{
          fontSize: 16,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: token.colorText,
          whiteSpace: 'nowrap',
        }}
      >
        {brandTitle}
      </Typography.Text>
    </Space>
  )

  const brandMobile = (
    <Flex align="center" gap={8} style={{ flex: 1, minWidth: 0 }}>
      {variant === 'superadmin' ? (
        <Tag icon={<CrownOutlined />} color="gold" style={{ margin: 0, flexShrink: 0 }}>
          Super
        </Tag>
      ) : null}
      <Typography.Text
        strong
        ellipsis={{ tooltip: brandTitle }}
        style={{
          fontSize: 15,
          letterSpacing: '-0.02em',
          color: token.colorText,
          flex: 1,
          minWidth: 0,
        }}
      >
        {brandTitle}
      </Typography.Text>
    </Flex>
  )

  const userRail = (
    <Flex align="center" gap={12} style={{ flexShrink: 0 }}>
      {screens.md ? <Divider type="vertical" style={{ height: 28, margin: 0, borderColor: token.colorBorder }} /> : null}
      <Space size={10} align="center">
        <Tooltip title={username || 'User'}>
          <Avatar size={36} icon={<UserOutlined />} style={{ background: token.colorPrimary }} />
        </Tooltip>
        {screens.sm ? (
          <Typography.Text ellipsis style={{ maxWidth: screens.md ? 220 : 140, color: token.colorTextSecondary, fontSize: 13 }}>
            {username || 'User'}
          </Typography.Text>
        ) : null}
      </Space>
      <Button
        type="default"
        icon={<LogoutOutlined />}
        onClick={() => {
          logout()
          navigate('/login')
        }}
        style={{
          borderColor: token.colorBorder,
          background: token.colorFillQuaternary,
          borderRadius: 999,
        }}
      >
        {screens.sm ? 'Logout' : ''}
      </Button>
    </Flex>
  )

  return (
    <Layout className={fullBleed && variant !== 'superadmin' ? 'app-shell--fill' : undefined} style={shellStyle}>
      <Header style={headerBarStyle}>
        <Flex
          align="center"
          justify={screens.md ? 'space-between' : 'flex-start'}
          style={{
            width: '100%',
            maxWidth: contentMax,
            margin: '0 auto',
            paddingInline: innerPadding,
            height: '100%',
            gap: screens.md ? 20 : 10,
          }}
        >
          {!screens.md && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              style={{ flexShrink: 0 }}
            />
          )}

          {screens.md ? (
            <>
              {brandDesktop}
              <div
                style={{
                  flex: 1,
                  minWidth: 24,
                  display: 'flex',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <Menu {...menuProps} />
              </div>
              {userRail}
            </>
          ) : (
            <>
              {brandMobile}
              <Flex style={{ marginLeft: 'auto', flexShrink: 0 }} align="center" gap={8}>
                <Tooltip title={username || 'User'}>
                  <Avatar size="small" icon={<UserOutlined />} style={{ background: token.colorPrimary }} />
                </Tooltip>
                <Button
                  type="default"
                  size="small"
                  icon={<LogoutOutlined />}
                  onClick={() => {
                    logout()
                    navigate('/login')
                  }}
                />
              </Flex>
            </>
          )}
        </Flex>
      </Header>
      <Drawer
        title="Navigate"
        placement="left"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={280}
        styles={{ body: { paddingTop: 8 } }}
      >
        <Menu mode="inline" selectedKeys={[pathname]} items={items} onClick={() => setDrawerOpen(false)} />
      </Drawer>
      <Content
        className={fullBleed ? 'page-content--bleed' : undefined}
        style={
          fullBleed
            ? undefined
            : {
                maxWidth: contentMax,
                width: '100%',
                margin: '0 auto',
                padding: screens.md ? 24 : 16,
                paddingTop: screens.md ? 26 : 16,
              }
        }
      >
        {children}
      </Content>
    </Layout>
  )
}

export default AppLayout
