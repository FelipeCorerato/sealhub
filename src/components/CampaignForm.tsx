import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Wine, AlertTriangle, Flower2, MoveUp } from 'lucide-react'
import type { CampaignInstructions } from '@/types'

interface CampaignFormProps {
  name: string
  sender: string
  observation: string
  instructions: CampaignInstructions
  onNameChange: (value: string) => void
  onSenderChange: (value: string) => void
  onObservationChange: (value: string) => void
  onInstructionChange: (key: keyof CampaignInstructions, value: boolean) => void
}

const instructionItems = [
  {
    key: 'fragile' as const,
    label: 'Frágil',
    icon: Wine,
    color: 'text-amber-800',
    bgColor: 'bg-amber-900',
  },
  {
    key: 'attention' as const,
    label: 'Atenção',
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-900',
  },
  {
    key: 'handleWithCare' as const,
    label: 'Manusear com Cuidado',
    icon: Flower2,
    color: 'text-pink-600',
    bgColor: 'bg-pink-900',
  },
  {
    key: 'thisWayUp' as const,
    label: 'Este Lado Para Cima',
    icon: MoveUp,
    color: 'text-neutral-700',
    bgColor: 'bg-neutral-800',
  },
]

export function CampaignForm({
  name,
  sender,
  observation,
  instructions,
  onNameChange,
  onSenderChange,
  onObservationChange,
  onInstructionChange,
}: CampaignFormProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-800">
        Informações Sobre a Campanha
      </h3>

      {/* Nome da Campanha */}
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700">
          Nome da Campanha *
        </label>
        <Input
          type="text"
          placeholder="Ex: Dia das mães 2025"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="text-base"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Remetente */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Remetente *
          </label>
          <Textarea
            value={sender}
            onChange={(e) => onSenderChange(e.target.value)}
            rows={4}
            className="resize-none text-sm"
          />
        </div>

        {/* Observação */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Observação *
          </label>
          <Input
            type="text"
            placeholder="A/C Gestor"
            value={observation}
            onChange={(e) => onObservationChange(e.target.value)}
            className="text-base"
          />
        </div>
      </div>

      {/* Instruções de manuseio */}
      <div>
        <label className="mb-3 block text-sm font-medium text-neutral-700">
          Instruções de manuseio
        </label>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {instructionItems.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.key}
                className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50"
              >
                <Checkbox
                  id={item.key}
                  checked={instructions[item.key]}
                  onCheckedChange={(checked) =>
                    onInstructionChange(item.key, checked === true)
                  }
                  className="data-[state=checked]:bg-(--color-primary) data-[state=checked]:border-(--color-primary)"
                />
                <label
                  htmlFor={item.key}
                  className="flex flex-1 cursor-pointer items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${item.bgColor}`}
                  >
                    <Icon className={`h-5 w-5 text-white`} />
                  </div>
                  <span className="text-neutral-700">{item.label}</span>
                </label>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

