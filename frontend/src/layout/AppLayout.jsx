import { Button, Drawer, Grid, Layout, Menu, Typography } from 'antd'
import {
  CrownOutlined,
  FileAddOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuOutlined,
  MessageOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { authStore } from '../store/authStore'

const { Header, Content } = Layout

const AppLayout = ({ children, fullBleed = false, variant = 'default' }) => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const screens = Grid.useBreakpoint()
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
      label: <Link to="/superadmin">Platform console</Link>,
    },
  ]

  const items = variant === 'superadmin' ? superItems : defaultItems
  const brandTitle = variant === 'superadmin' ? 'Platform admin' : 'RAG Assistant'
  const shellClass =
    fullBleed && variant !== 'superadmin'
      ? 'app-shell app-shell--fill'
      : variant === 'superadmin'
        ? 'app-shell app-shell--super'
        : 'app-shell'

  const menuProps = {
    mode: 'horizontal',
    selectedKeys: [pathname],
    items,
    className: 'top-menu',
    onClick: () => setDrawerOpen(false),
  }

  return (
    <Layout className={shellClass}>
      <Header className="app-header">
        {!screens.md && (
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="nav-trigger"
          />
        )}
        <Typography.Title level={4} className="app-brand">
          {brandTitle}
        </Typography.Title>
        {screens.md ? (
          <Menu {...menuProps} style={{ flex: 1 }} />
        ) : (
          <span style={{ flex: 1 }} />
        )}
        <div className="header-right">
          <Typography.Text className="header-user" ellipsis>
            {username || 'User'}
          </Typography.Text>
          <Button
            icon={<LogoutOutlined />}
            title="Logout"
            onClick={() => {
              logout()
              navigate('/login')
            }}
          >
            {screens.sm ? 'Logout' : null}
          </Button>
        </div>
      </Header>
      <Drawer
        title="Navigate"
        placement="left"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={280}
        className="nav-drawer"
      >
        <Menu mode="inline" selectedKeys={[pathname]} items={items} onClick={() => setDrawerOpen(false)} />
      </Drawer>
      <Content className={fullBleed ? 'page-content page-content--bleed' : 'page-content'}>{children}</Content>
    </Layout>
  )
}

export default AppLayout
