import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import sharp from "https://esm.sh/sharp@0.33.5";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

// Função simples para buscar imagens (DuckDuckGo Images – sem API key)
async function buscarImagem(query: string): Promise<string | null> {
  const url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  const html = await res.text();
  const match = html.match(/"image":"(https:[^"]+)"/);

  return match ? match[1] : null;
}

// Baixa imagem e converte para WEBP
async function baixarEConverter(url: string): Promise<Uint8Array> {
  const imgRes = await fetch(url);
  const buffer = await imgRes.arrayBuffer();

  const webp = await sharp(buffer)
    .resize(1200, 1200, { fit: "inside" })
    .webp({ quality: 80 })
    .toBuffer();

  return new Uint8Array(webp);
}

serve(async () => {
  const tabelas = [
    { nome: "fauna", bucket: "imagens-fauna" },
    { nome: "flora", bucket: "imagens-flora" }
  ];

  for (const tabela of tabelas) {
    const { data: registros } = await supabase
      .from(tabela.nome)
      .select("id, nome_cientifico, imagens")
      .or("imagens.is.null,imagens.eq.{}")
      .limit(20);

    if (!registros) continue;

    for (const item of registros) {
      if (!item.nome_cientifico) continue;

      const imagens: string[] = [];

      for (let i = 1; i <= 3; i++) {
        const imgUrl = await buscarImagem(item.nome_cientifico);
        if (!imgUrl) continue;

        const webp = await baixarEConverter(imgUrl);

        const fileName =
          item.nome_cientifico
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-") +
          `_foto00${i}.webp`;

        await supabase.storage
          .from(tabela.bucket)
          .upload(fileName, webp, {
            contentType: "image/webp",
            upsert: true
          });

        imagens.push(fileName);
      }

      if (imagens.length >= 3) {
        await supabase
          .from(tabela.nome)
          .update({ imagens })
          .eq("id", item.id);
      }
    }
  }

  return new Response(
    JSON.stringify({ status: "ok" }),
    { headers: { "Content-Type": "application/json" } }
  );
});
