import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App as AntApp, ConfigProvider, theme } from 'antd'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#6b8cff',
          colorInfo: '#7c9dff',
          colorSuccess: '#3dd68c',
          colorWarning: '#f0b429',
          colorError: '#f87171',
          borderRadius: 12,
          borderRadiusLG: 16,
          fontFamily: "'DM Sans', ui-sans-serif, system-ui, sans-serif",
          fontSizeHeading1: 38,
          lineHeightHeading1: 1.15,
          colorBgLayout: '#1a2432',
          colorBgContainer: '#242f42',
          colorBgElevated: '#2d3a50',
          colorBorder: 'rgba(255, 255, 255, 0.11)',
          colorBorderSecondary: 'rgba(255, 255, 255, 0.07)',
          colorText: 'rgba(248, 250, 252, 0.96)',
          colorTextSecondary: 'rgba(203, 213, 225, 0.88)',
          colorTextTertiary: 'rgba(148, 163, 184, 0.85)',
          colorFillQuaternary: 'rgba(255, 255, 255, 0.06)',
          colorFillSecondary: 'rgba(255, 255, 255, 0.1)',
          controlHeightLG: 48,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.28)',
          boxShadowSecondary: '0 12px 40px rgba(0, 0, 0, 0.38)',
        },
        components: {
          Layout: {
            headerBg: '#1f2b3d',
            headerHeight: 64,
            headerPadding: '0 20px',
            bodyBg: 'transparent',
            siderBg: '#1c2636',
            triggerBg: '#263447',
          },
          Menu: {
            darkItemBg: 'transparent',
            darkItemSelectedBg: 'rgba(107, 140, 255, 0.22)',
            darkItemHoverBg: 'rgba(107, 140, 255, 0.12)',
            horizontalItemSelectedColor: '#e8edff',
            itemBorderRadius: 8,
            itemMarginInline: 4,
            itemMarginBlock: 4,
          },
          Card: {
            colorBgContainer: '#242f42',
            colorBorderSecondary: 'rgba(255, 255, 255, 0.08)',
            headerBg: 'transparent',
          },
          Table: {
            headerBg: 'rgba(255, 255, 255, 0.06)',
            rowHoverBg: 'rgba(107, 140, 255, 0.1)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          },
          Button: {
            primaryShadow: '0 8px 24px rgba(107, 140, 255, 0.35)',
            controlOutline: 'rgba(107, 140, 255, 0.45)',
          },
          Input: {
            activeBorderColor: '#8ba3ff',
            hoverBorderColor: 'rgba(107, 140, 255, 0.45)',
          },
          Collapse: {
            headerBg: 'transparent',
            contentBg: 'transparent',
          },
          Drawer: {
            colorBgElevated: '#242f42',
          },
          Segmented: {
            itemSelectedBg: 'rgba(107, 140, 255, 0.22)',
            trackBg: 'rgba(255, 255, 255, 0.08)',
          },
          Upload: {
            colorFillAlter: 'rgba(255, 255, 255, 0.05)',
          },
        },
      }}
    >
      <AntApp>
        <App />
      </AntApp>
    </ConfigProvider>
  </StrictMode>,
)
