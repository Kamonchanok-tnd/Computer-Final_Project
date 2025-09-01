import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DarkModeProvider } from './components/Darkmode/toggleDarkmode.tsx'
import '@fontsource/ibm-plex-sans-thai/400.css';
import '@fontsource/ibm-plex-sans-thai/500.css';
import '@fontsource/ibm-plex-sans-thai/700.css';
import { UserProvider } from './layout/HeaderLayout/UserContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
   <DarkModeProvider>
      <App />
    </DarkModeProvider>
    </UserProvider>
  </StrictMode>,
)
