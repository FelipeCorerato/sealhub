import { useOrganization } from '@/contexts/OrganizationContext'

export function Logo() {
  const { organization } = useOrganization()
  
  return (
    <div className="flex items-center gap-3">
      {/* Logo/Ícone */}
      {organization?.theme.logoUrl ? (
        <img 
          src={organization.theme.logoUrl} 
          alt={organization.name}
          className="h-14 w-14 object-contain rounded-lg"
        />
      ) : (
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-800 shadow-md">
        <span className="text-2xl font-bold text-white">V</span>
      </div>
      )}
      
      {/* Texto */}
      <div className="flex flex-col min-w-0 flex-1">
        <h1 className="text-xl font-bold text-neutral-800 whitespace-nowrap overflow-hidden text-ellipsis">
          {organization ? `VGSA - ${organization.tradeName || organization.name}` : 'VGSA'}
        </h1>
        <p className="text-xs text-neutral-600 whitespace-nowrap overflow-hidden text-ellipsis">
          Gestão de Selos
        </p>
      </div>
    </div>
  )
}

