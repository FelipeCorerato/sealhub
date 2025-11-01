export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-800 shadow-md">
        <span className="text-2xl font-bold text-white">V</span>
      </div>
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-neutral-800">VGSA</h1>
        <p className="text-xs text-neutral-600">Gestão de Selos</p>
      </div>
    </div>
  )
}

