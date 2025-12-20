import { supabase } from "@/integrations/supabase/client";
import resgateSchema from "@/schemas/definitions/resgate_fauna.json";
import crimesSchema from "@/schemas/definitions/crimes_ambientais.json";

export async function uploadFormSchemas() {
  const schemas = [
    {
      path: "forms/resgate_fauna.json",
      data: resgateSchema,
      name: "Resgate de Fauna"
    },
    {
      path: "forms/crimes_ambientais.json", 
      data: crimesSchema,
      name: "Crimes Ambientais"
    }
  ];

  const results = [];

  for (const schema of schemas) {
    try {
      const blob = new Blob([JSON.stringify(schema.data, null, 2)], {
        type: "application/json"
      });

      const { data, error } = await supabase.storage
        .from("files")
        .upload(schema.path, blob, {
          contentType: "application/json",
          upsert: true
        });

      if (error) {
        console.error(`Erro ao fazer upload de ${schema.name}:`, error);
        results.push({ name: schema.name, success: false, error: error.message });
      } else {
        console.log(`Upload de ${schema.name} concluído:`, data);
        results.push({ name: schema.name, success: true, path: data.path });
      }
    } catch (err) {
      console.error(`Erro inesperado ao fazer upload de ${schema.name}:`, err);
      results.push({ name: schema.name, success: false, error: String(err) });
    }
  }

  return results;
}

// Função para obter URL pública dos schemas
export async function getSchemaUrls() {
  const paths = ["forms/resgate_fauna.json", "forms/crimes_ambientais.json"];
  
  const urls = paths.map(path => {
    const { data } = supabase.storage.from("files").getPublicUrl(path);
    return { path, url: data.publicUrl };
  });

  return urls;
}
