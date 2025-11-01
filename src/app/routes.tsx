import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { PrivateRoute } from '@/components/PrivateRoute'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ClientsPage } from '@/pages/clients/ClientsPage'
import { CampaignsPage } from '@/pages/campaigns/CampaignsPage'

function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  return (
    <Navigate to={isAuthenticated ? '/clientes' : '/login'} replace />
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/clientes"
        element={
          <PrivateRoute>
            <ClientsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/campanhas"
        element={
          <PrivateRoute>
            <CampaignsPage />
          </PrivateRoute>
        }
      />
    </Routes>
  )
}

