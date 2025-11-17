import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { PrivateRoute } from '@/components/PrivateRoute'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { EmailVerificationPage } from '@/pages/auth/EmailVerificationPage'
import { PendingAssociationPage } from '@/pages/auth/PendingAssociationPage'
import { ClientsPage } from '@/pages/clients/ClientsPage'
import { CampaignsPage } from '@/pages/campaigns/CampaignsPage'
import { OrganizationSettingsPage } from '@/pages/admin/OrganizationSettingsPage'

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
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/verificar-email" element={<EmailVerificationPage />} />
      <Route path="/aguardando-associacao" element={<PendingAssociationPage />} />
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
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <OrganizationSettingsPage />
          </PrivateRoute>
        }
      />
    </Routes>
  )
}

