'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const CLASSE_CAMPO =
  'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

interface CampoTextoProps {
  id: string
  name: string
  rotulo: string
  tipo?: 'text' | 'email'
  placeholder?: string
  autoComplete?: string
  defaultValue?: string
}

export function CampoTexto({
  id,
  name,
  rotulo,
  tipo = 'text',
  placeholder,
  autoComplete,
  defaultValue,
}: CampoTextoProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {rotulo} <span className="text-destructive">*</span>
      </label>
      <input
        id={id}
        name={name}
        type={tipo}
        required
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        className={CLASSE_CAMPO}
      />
    </div>
  )
}

interface CampoSenhaProps {
  id: string
  name: string
  rotulo: string
  placeholder?: string
  autoComplete?: string
}

// Campo de senha com o olhinho de mostrar/esconder, como na imagem de
// referência. Precisa ser client component por causa do estado do olho —
// por isso os campos ficam aqui e não direto na página (que é server
// component, pra poder usar server action no formulário).
export function CampoSenha({ id, name, rotulo, placeholder, autoComplete }: CampoSenhaProps) {
  const [visivel, setVisivel] = useState(false)

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {rotulo} <span className="text-destructive">*</span>
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visivel ? 'text' : 'password'}
          required
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`${CLASSE_CAMPO} pr-11`}
        />
        <button
          type="button"
          onClick={() => setVisivel((v) => !v)}
          aria-label={visivel ? 'Esconder senha' : 'Mostrar senha'}
          aria-pressed={visivel}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground"
        >
          {visivel ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
