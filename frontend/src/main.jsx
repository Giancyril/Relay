import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { SoundEffectsProvider } from './context/SoundEffectsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SoundEffectsProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </SoundEffectsProvider>
  </StrictMode>,
)
