/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import { FiltroCategoriaSabor } from '@/components/FiltroCategoriaSabor'
import { GradeSabores, type Sabor } from '@/components/GradeSabores'
import type { CategoriaSaborValor } from '@/lib/categorias-sabor'

export default function TelaSabores() {
  const [categoriaAtiva, setCategoriaAtiva] = useState<CategoriaSaborValor | null>(null)
  const [sabores, setSabores] = useState<Sabor[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    setCarregando(true)
    setErro(null)
    const query = categoriaAtiva ? `?categoria=${categoriaAtiva}` : ''
    fetch(`/api/sabores${query}`)
      .then((res) => {
        if (!res.ok) throw new Error('Não foi possível carregar os sabores')
        return res.json()
      })
      .then((dados: Sabor[]) => setSabores(dados))
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false))
  }, [categoriaAtiva])

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 p-4">
      <FiltroCategoriaSabor categoriaAtiva={categoriaAtiva} aoSelecionar={setCategoriaAtiva} />
      <GradeSabores sabores={sabores} carregando={carregando} erro={erro} />
    </div>
  )
}
