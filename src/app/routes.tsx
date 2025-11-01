import { Routes, Route, Navigate } from 'react-router-dom'
import { ClientsPage } from '@/pages/clients/ClientsPage'
import { CampaignsPage } from '@/pages/campaigns/CampaignsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/clientes" replace />} />
      <Route path="/clientes" element={<ClientsPage />} />
      <Route path="/campanhas" element={<CampaignsPage />} />
    </Routes>
  )
}

