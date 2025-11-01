import { Sidebar } from '@/components/Sidebar'
import { Construction } from 'lucide-react'

export function CampaignsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center p-6">
          <div className="text-center">
            <Construction className="mx-auto h-16 w-16 text-[#D97B35]" />
            <h2 className="mt-4 text-2xl font-bold text-neutral-800">
              Campanhas
            </h2>
            <p className="mt-2 text-neutral-600">
              Esta funcionalidade estará disponível em breve.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

