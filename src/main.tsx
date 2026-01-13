import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { HabitProvider } from './context/HabitContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HabitProvider>
      <App />
    </HabitProvider>
  </StrictMode>,
)
