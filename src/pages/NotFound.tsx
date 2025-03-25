
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-sm border border-gray-100">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Página não encontrada</h2>
        <p className="text-gray-600 mb-6">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default">
            <Link to="/" className="flex items-center gap-2">
              <Home size={16} />
              Ir para Home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="#" onClick={() => window.history.back()} className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Voltar
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
