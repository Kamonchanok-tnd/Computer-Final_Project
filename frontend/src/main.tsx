import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DarkModeProvider } from './components/Darkmode/toggleDarkmode.tsx'
import '@fontsource/ibm-plex-sans-thai/400.css';
import '@fontsource/ibm-plex-sans-thai/500.css';
import '@fontsource/ibm-plex-sans-thai/700.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
   <DarkModeProvider>
      <App />
    </DarkModeProvider>
  </StrictMode>,
)
