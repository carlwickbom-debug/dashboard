import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import './styles/main.css'
import './styles/design-system.css'
import './dashboards/energy/energy.css'
import './dashboards/rail/rail.css'
import './dashboards/traffic/traffic.css'
import './dashboards/datacenters/datacenters.css'
import './dashboards/aviation/aviation.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
