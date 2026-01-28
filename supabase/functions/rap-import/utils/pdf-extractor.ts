// Extrator de texto de PDF

export async function extractTextFromPDF(pdfBase64: string): Promise<string> {
  try {
    // Converter base64 para Uint8Array
    const pdfBytes = Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0));
    
    // Decodificar o PDF e tentar extrair texto diretamente
    const text = await extractTextFromPDFBytes(pdfBytes);
    
    return text;
  } catch (error) {
    console.error("Erro ao extrair texto do PDF:", error);
    throw error;
  }
}

async function extractTextFromPDFBytes(pdfBytes: Uint8Array): Promise<string> {
  // Converter para string para buscar padrões de texto
  const pdfString = new TextDecoder("utf-8", { fatal: false }).decode(pdfBytes);
  
  // Extrair streams de texto do PDF
  // PDFs armazenam texto em streams, vamos tentar extrair
  const textMatches: string[] = [];
  
  // Buscar por padrões de texto no PDF
  // Formato: (texto) ou [texto]
  const textPattern = /\((.*?)\)|\[(.*?)\]/g;
  let match;
  
  while ((match = textPattern.exec(pdfString)) !== null) {
    const text = match[1] || match[2];
    if (text && text.length > 2 && !text.match(/^[\x00-\x1F]*$/)) {
      // Filtrar caracteres de controle
      textMatches.push(text);
    }
  }
  
  // Também tentar buscar por streams de texto
  const streamPattern = /stream\s*([\s\S]*?)\s*endstream/gi;
  while ((match = streamPattern.exec(pdfString)) !== null) {
    const streamContent = match[1];
    // Tentar decodificar o stream
    try {
      const decoded = new TextDecoder("utf-8", { fatal: false }).decode(
        Uint8Array.from(streamContent.split("").map((c) => c.charCodeAt(0)))
      );
      if (decoded && decoded.length > 10) {
        textMatches.push(decoded);
      }
    } catch (_e) {
      // Ignorar erros de decodificação
    }
  }
  
  // Combinar todos os textos encontrados
  let fullText = textMatches.join(" ");
  
  // Se não encontrou texto suficiente, tentar usar biblioteca externa
  if (fullText.trim().length < 50) {
    try {
      // Tentar usar uma biblioteca de PDF via import dinâmico
      fullText = await tryPDFJSLibrary(pdfBytes);
    } catch (error) {
      console.warn("Não foi possível usar biblioteca externa:", error);
    }
  }
  
  return fullText.trim();
}

async function tryPDFJSLibrary(_pdfBytes: Uint8Array): Promise<string> {
  // Tentar usar pdfjs-dist via esm.sh
  try {
    // Nota: Em produção, você pode querer usar uma biblioteca mais robusta
    // ou fazer uma chamada para uma API externa de extração de PDF
    
    // Por enquanto, retornar string vazia
    // Implementação futura pode usar:
    // const pdfjs = await import("https://esm.sh/pdfjs-dist@3.0.279");
    // const loadingTask = pdfjs.getDocument({ data: pdfBytes });
    // const pdf = await loadingTask.promise;
    // ... extrair texto de cada página
    
    return "";
  } catch (error) {
    console.warn("Erro ao usar biblioteca PDF:", error);
    return "";
  }
}
