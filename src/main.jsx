import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' /* Importante: Reset primero */
import './styles/variables.css'
import './styles/app.css'
import './styles/theme-toggle.css'
import './styles/habits.css'
import './styles/voice.css'
import './styles/calendar.css'
import './styles/zen.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
