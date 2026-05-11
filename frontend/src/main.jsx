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
          colorPrimary: '#7a98ff',
          colorInfo: '#87a8ff',
          colorSuccess: '#42d5a0',
          colorWarning: '#f5be4f',
          colorError: '#ff7f8f',
          borderRadius: 14,
          borderRadiusLG: 18,
          fontFamily: "'DM Sans', ui-sans-serif, system-ui, sans-serif",
          fontSizeHeading1: 42,
          lineHeightHeading1: 1.15,
          colorBgLayout: '#131d2d',
          colorBgContainer: '#202e44',
          colorBgElevated: '#273651',
          colorBorder: 'rgba(170, 191, 246, 0.24)',
          colorBorderSecondary: 'rgba(170, 191, 246, 0.14)',
          colorText: 'rgba(243, 248, 255, 0.98)',
          colorTextSecondary: 'rgba(203, 219, 245, 0.9)',
          colorTextTertiary: 'rgba(159, 179, 213, 0.86)',
          colorFillQuaternary: 'rgba(255, 255, 255, 0.07)',
          colorFillSecondary: 'rgba(255, 255, 255, 0.12)',
          controlHeightLG: 48,
          boxShadow: '0 10px 32px rgba(4, 8, 15, 0.28)',
          boxShadowSecondary: '0 20px 56px rgba(3, 6, 12, 0.42)',
        },
        components: {
          Layout: {
            headerBg: 'rgba(19, 29, 45, 0.78)',
            headerHeight: 64,
            headerPadding: '0 20px',
            bodyBg: 'transparent',
            siderBg: 'rgba(20, 30, 45, 0.9)',
            triggerBg: '#2f4261',
          },
          Menu: {
            darkItemBg: 'transparent',
            darkItemSelectedBg: 'rgba(122, 152, 255, 0.23)',
            darkItemHoverBg: 'rgba(122, 152, 255, 0.13)',
            horizontalItemSelectedColor: '#f3f7ff',
            itemBorderRadius: 10,
            itemMarginInline: 4,
            itemMarginBlock: 4,
          },
          Card: {
            colorBgContainer: '#202e44',
            colorBorderSecondary: 'rgba(170, 191, 246, 0.14)',
            headerBg: 'transparent',
          },
          Table: {
            headerBg: 'rgba(122, 152, 255, 0.14)',
            rowHoverBg: 'rgba(122, 152, 255, 0.11)',
            borderColor: 'rgba(170, 191, 246, 0.12)',
          },
          Button: {
            borderColorDisabled: 'rgba(164, 184, 235, 0.26)',
            primaryShadow: '0 10px 28px rgba(122, 152, 255, 0.44)',
            controlOutline: 'rgba(122, 152, 255, 0.45)',
          },
          Input: {
            activeBorderColor: '#98b0ff',
            hoverBorderColor: 'rgba(122, 152, 255, 0.55)',
          },
          Collapse: {
            headerBg: 'transparent',
            contentBg: 'transparent',
          },
          Drawer: {
            colorBgElevated: '#202e44',
          },
          Segmented: {
            itemSelectedBg: 'rgba(122, 152, 255, 0.22)',
            trackBg: 'rgba(255, 255, 255, 0.09)',
          },
          Upload: {
            colorFillAlter: 'rgba(255, 255, 255, 0.06)',
          },
          Tag: {
            defaultBg: 'rgba(122, 152, 255, 0.12)',
            defaultColor: '#d8e3ff',
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
