import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import JsonViewer from './JsonViewer'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <JsonViewer />
  </StrictMode>,
)
