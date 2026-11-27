import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store, hydrateStore } from '@/app/store'
import { LanguageProvider } from '@/lib/i18n'
import './index.css'
import App from './App.jsx'

hydrateStore()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
