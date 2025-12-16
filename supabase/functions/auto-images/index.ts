import { serve } from "https://deno.land/std@0.204.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  const processTable = async (
    table: "fauna" | "flora",
    dim: "dim_especies_fauna" | "dim_especies_flora",
    bucket: string
  ) => {
    const { data: registros } = await supabase
      .from(table)
      .select("id, nome_cientifico, imagens")
      .or("imagens.is.null,imagens.eq.{}")
      .limit(20)

    if (!registros) return

    for (const r of registros) {
      if (!r.nome_cientifico) continue

      // BUSCA SIMPLES DE IMAGEM (DuckDuckGo fallback)
      const searchUrl =
        `https://duckduckgo.com/?q=${encodeURIComponent(r.nome_cientifico)}&iax=images&ia=images`

      const imageUrl =
        `https://source.unsplash.com/800x600/?${encodeURIComponent(r.nome_cientifico)}`

      const imgResp = await fetch(imageUrl)
      if (!imgResp.ok) continue

      const buffer = await imgResp.arrayBuffer()

      const images: string[] = []

      for (let i = 1; i <= 3; i++) {
        const filename = `${r.nome_cientifico
          .toLowerCase()
          .replace(/\s+/g, "-")}_foto00${i}.webp`

        await supabase.storage
          .from(bucket)
          .upload(f
