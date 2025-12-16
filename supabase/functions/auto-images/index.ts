import { serve } from "https://deno.land/std@0.204.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function toSlug(s: string) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Converte bytes -> webp usando o runtime do Supabase (ImageMagick via WASM não é garantido).
// Então aqui a gente salva como WEBP APENAS se a fonte já vier WEBP.
// Para conversão de verdade, você já está fazendo localmente (python) e subindo webp.
async function baixarBytes(url: string): Promise<Uint8Array | null> {
  try {
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!r.ok) return null;
    const ab = await r.arrayBuffer();
    return new Uint8Array(ab);
  } catch {
    return null;
  }
}

// Busca 3 URLs simples (fallback) - você pode trocar por iNaturalist/Wikimedia depois
function gerarUrlsBusca(nomeCientifico: string) {
  const q = encodeURIComponent(nomeCientifico);
  return [
    `https://source.unsplash.com/1200x900/?${q}`,
    `https://source.unsplash.com/1200x900/?${q},animal`,
    `https://source.unsplash.com/1200x900/?${q},nature`,
  ];
}

async function processarTabela(
  table: "fauna" | "flora",
  bucket: "imagens-fauna" | "imagens-flora"
) {
  const { data: registros, error } = await supabase
    .from(table)
    .select("id, nome_cientifico, imagens")
    .or("imagens.is.null,imagens.eq.{}")
    .limit(20);

  if (error || !registros) return { table, ok: false, error: error?.message ?? null };

  let atualizados = 0;

  for (const r of registros) {
    const nomeCientifico = (r.nome_cientifico || "").trim();
    if (!nomeCientifico) continue;

    const slug = toSlug(nomeCientifico);
    const imagens: string[] = [];

    const urls = gerarUrlsBusca(nomeCientifico);

    for (let i = 0; i < 3; i++) {
      const url = urls[i];
      const bytes = await baixarBytes(url);
      if (!bytes) continue;

      // Nome do arquivo em webp (mesmo que a fonte não seja webp).
      // Observação: isso não converte o conteúdo. Para conversão real, use seu pipeline local.
      const filename = `${slug}_foto00${i + 1}.webp`;

      const up = await supabase.storage
        .from(bucket)
        .upload(filename, bytes, {
          contentType: "image/webp",
          upsert: true,
        });

      if (!up.error) imagens.push(filename);
    }

    if (imagens.length >= 3) {
      const upd = await supabase
        .from(table)
        .update({ imagens })
        .eq("id", r.id);

      if (!upd.error) atualizados++;
    }
  }

  return { table, ok: true, atualizados };
}

serve(async () => {
  const fauna = await processarTabela("fauna", "imagens-fauna");
  const flora = await processarTabela("flora", "imagens-flora");

  return new Response(JSON.stringify({ fauna, flora }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
