import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { RAPUploader } from '@/components/rap/RAPUploader';
import { toast } from 'sonner';

const ProcessarRAP = () => {
  const navigate = useNavigate();

  const handleNavigateToForm = (formType: 'resgate_fauna' | 'crime_ambiental', data: any) => {
    // Store extracted data in sessionStorage for the form to use
    sessionStorage.setItem('rap_extracted_data', JSON.stringify(data));
    
    if (formType === 'resgate_fauna') {
      navigate('/secao-operacional/resgate-cadastro');
      toast.info('Dados do RAP carregados no formulário');
    } else {
      navigate('/secao-operacional/crimes-ambientais-cadastro');
      toast.info('Dados do RAP carregados no formulário');
    }
  };

  return (
    <Layout title="Processar RAP com IA" showBackButton>
      <div className="max-w-4xl mx-auto">
        <p className="text-muted-foreground mb-6">
          Extraia automaticamente os dados do Relatório de Atividade Policial para preencher formulários
        </p>

        <RAPUploader 
          onNavigateToForm={handleNavigateToForm}
        />

        {/* Instructions */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Como usar:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Cole o texto do RAP na aba "Texto" ou faça upload de fotos/scans do documento na aba "Imagens"</li>
            <li>Clique em "Extrair Dados do RAP" para processar com inteligência artificial</li>
            <li>Revise os dados extraídos e verifique a confiança da extração</li>
            <li>Clique em "Preencher Formulário" para ir diretamente ao formulário com os dados preenchidos</li>
            <li>Complete ou corrija os campos necessários antes de salvar</li>
          </ol>
          
          <div className="mt-4">
            <h4 className="font-medium mb-1">Tipos de formulário detectados:</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              <li><strong>Resgate de Fauna:</strong> Quando o RAP menciona resgate, captura ou atendimento a animais silvestres</li>
              <li><strong>Crime Ambiental:</strong> Quando há infrações ambientais (caça, desmatamento, poluição, etc.)</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProcessarRAP;
