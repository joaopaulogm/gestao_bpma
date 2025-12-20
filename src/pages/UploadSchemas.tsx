import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadFormSchemas, getSchemaUrls } from "@/scripts/uploadFormSchemas";
import { toast } from "sonner";
import { CheckCircle, XCircle, Upload, Link } from "lucide-react";
import SidebarLayout from "@/components/SidebarLayout";

export default function UploadSchemas() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Array<{ name: string; success: boolean; path?: string; error?: string }>>([]);
  const [urls, setUrls] = useState<Array<{ path: string; url: string }>>([]);

  const handleUpload = async () => {
    setLoading(true);
    try {
      const uploadResults = await uploadFormSchemas();
      setResults(uploadResults);
      
      const schemaUrls = await getSchemaUrls();
      setUrls(schemaUrls);
      
      const allSuccess = uploadResults.every(r => r.success);
      if (allSuccess) {
        toast.success("Schemas enviados com sucesso!");
      } else {
        toast.error("Alguns schemas falharam no upload");
      }
    } catch (error) {
      toast.error("Erro ao fazer upload dos schemas");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload de Schemas de Formulários
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Esta página faz upload dos arquivos JSON de definição dos formulários 
              para o bucket <code className="bg-muted px-1 rounded">files</code> do Supabase.
            </p>

            <div className="space-y-2">
              <h3 className="font-medium">Arquivos a serem enviados:</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                <li>forms/resgate_fauna.json - Schema do formulário de Resgate de Fauna</li>
                <li>forms/crimes_ambientais.json - Schema do formulário de Crimes Ambientais</li>
              </ul>
            </div>

            <Button onClick={handleUpload} disabled={loading}>
              {loading ? "Enviando..." : "Fazer Upload dos Schemas"}
            </Button>

            {results.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium">Resultados:</h3>
                {results.map((result, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">{result.name}</span>
                    {result.success && result.path && (
                      <span className="text-sm text-muted-foreground">- {result.path}</span>
                    )}
                    {result.error && (
                      <span className="text-sm text-red-500">- {result.error}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {urls.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  URLs dos Schemas:
                </h3>
                {urls.map((item, index) => (
                  <div key={index} className="p-3 rounded-lg bg-muted space-y-1">
                    <p className="text-sm font-medium">{item.path}</p>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline break-all"
                    >
                      {item.url}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
