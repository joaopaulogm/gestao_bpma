import React from 'react';
import Layout from '@/components/Layout';

const CrimesAmbientais: React.FC = () => {
  return (
    <Layout title="Ocorrências Crimes Ambientais" showBackButton>
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-background/85 backdrop-blur-xl border border-primary/10 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-foreground mb-4">Formulário de Crimes Ambientais</h2>
          <p className="text-muted-foreground">
            Este formulário está temporariamente indisponível devido a uma manutenção técnica.
            Por favor, tente novamente em alguns minutos.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default CrimesAmbientais;