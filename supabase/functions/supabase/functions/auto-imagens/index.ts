// supabase/functions/auto-imagens/index.ts
import { serve } from "https://deno.land/std@0.204.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import sharp from "https://esm.sh/sharp@0.33.4"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
)

// 🔍 Busca imagens no iNaturalist
async function buscarImagens(nomeCientifico: string, limite = 3): Promise<string[]> {
  const url = `https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(
    nomeCientifico
  )}&photos=true&per_page=${limite}`

  const res = await fetch(url)
  const json = await res.json()

  const urls: string[] = []

  for (const obs of json.results || []) {
    for (const photo of obs.photos || []) {
      if (photo.url) {
        urls.push(photo.url.replace("square", "original"))
        if (urls.length >= limite) return urls
      }
    }
  }

  return urls
}

// 🔄 Baixa e converte para WEBP
async function baixarEConverter(url: string): Promise<Uint8Array> {
  const res = await fetch(url)
  const buffer = new Uint8Array(await res.arrayBuffer())

  return await sharp(buffer)
    .webp({ quality: 80 })
    .toBuffer()
}

// 🚀 Processa fauna ou flora
async function processarTabela(
  tabela: "fauna" | "flora",
  bucket: string
) {
  const { data: registros } = await supabase
    .from(tabela)
    .select("id, nome_cientifico")
    .or("imagem_1.is.null,imagem_2.is.null,imagem_3.is.null")
    .not("nome_cientifico", "is", null)
    .limit(20)

  if (!registros) return

  for (const reg of registros) {
    const imagens = await buscarImagens(reg.nome_cientifico, 3)
    const caminhos: string[] = []

    for (let i = 0; i < imagens.length; i++) {
      const webp = await baixarEConverter(imagens[i])

      const nomeArquivo = `${reg.nome_cientifico
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")}_foto${i + 1}.webp`

      const { error } = await supabase.storage
        .from(bucket)
        .upload(nomeArquivo, webp, {
          contentType: "image/webp",
          upsert: true,
        })

      if (!error) {
        caminhos.push(nomeArquivo)
      }
    }

    await supabase
      .from(tabela)
      .update({
        imagem_1: caminhos[0] ?? null,
        imagem_2: caminhos[1] ?? null,
        imagem_3: caminhos[2] ?? null,
      })
      .eq("id", reg.id)
  }
}

// 🌐 Endpoint HTTP
serve(async (_req) => {
  await processarTabela("fauna", "imagens-fauna")
  await processarTabela("flora", "imagens-flora")

  return new Response(
    JSON.stringify({ status: "ok", message: "Imagens processadas" }),
    { headers: { "Content-Type": "application/json" } }
  )
})
