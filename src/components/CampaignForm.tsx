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
        <label className="mb-4 block text-base font-semibold text-neutral-700">
          Instruções de manuseio
        </label>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {instructionItems.map((item) => {
            const Icon = item.icon
            const isChecked = instructions[item.key]
            return (
              <label
                key={item.key}
                htmlFor={item.key}
                className={`group relative flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 p-5 transition-all hover:border-neutral-300 hover:shadow-md ${
                  isChecked
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-sm'
                    : 'border-neutral-200 bg-white'
                }`}
              >
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full transition-transform group-hover:scale-105 ${item.bgColor}`}
                >
                  <Icon className="h-9 w-9 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={item.key}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      onInstructionChange(item.key, checked === true)
                    }
                    className="data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)]"
                  />
                  <span
                    className={`text-sm font-medium ${
                      isChecked ? 'text-neutral-800' : 'text-neutral-700'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )
}

