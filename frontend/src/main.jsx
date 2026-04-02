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
          colorPrimary: '#8b7cff',
          borderRadius: 10,
          fontFamily: "'DM Sans', Inter, 'Segoe UI', Roboto, sans-serif",
        },
      }}
    >
      <AntApp>
        <App />
      </AntApp>
    </ConfigProvider>
  </StrictMode>,
)
