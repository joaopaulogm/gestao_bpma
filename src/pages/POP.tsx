import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bird, 
  TreeDeciduous, 
  ChevronLeft, 
  ChevronRight,
  Home,
  Shield,
  Leaf,
  Droplets,
  Building2,
  FileWarning,
  Cat,
  Bug
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";
import { roteiroGeral, faunaPops, crimesPops, passeriformesPop } from "@/data/popData";

type Screen = 
  | "home" 
  | "fauna" 
  | "fauna-aves" 
  | "fauna-mamiferos" 
  | "fauna-repteis"
  | "crimes"
  | "crimes-fauna"
  | "crimes-flora"
  | "crimes-poluicao"
  | "crimes-ordenamento"
  | "crimes-administracao"
  | "crimes-fauna-subtipo"
  | "crimes-flora-subtipo"
  | "crimes-poluicao-subtipo"
  | "crimes-ordenamento-subtipo"
  | "crimes-administracao-subtipo";

interface PopSectionProps {
  titulo: string;
  itens: string[];
}

const PopSection = ({ titulo, itens }: PopSectionProps) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-primary mb-3 border-l-4 border-primary pl-3">
      {titulo}
    </h3>
    <ul className="space-y-2 pl-4">
      {itens.map((item, index) => (
        <li key={index} className="text-foreground/90 leading-relaxed">
          {item}
        </li>
      ))}
    </ul>
  </div>
);

const POP = () => {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedSubtipo, setSelectedSubtipo] = useState<string | null>(null);

  const getBreadcrumbs = () => {
    const crumbs: { label: string; screen?: Screen }[] = [{ label: "Início", screen: "home" }];
    
    if (screen.startsWith("fauna")) {
      crumbs.push({ label: "Resgate/Manejo de Fauna", screen: "fauna" });
      if (screen === "fauna-aves") crumbs.push({ label: "Aves" });
      if (screen === "fauna-mamiferos") crumbs.push({ label: "Mamíferos" });
      if (screen === "fauna-repteis") crumbs.push({ label: "Répteis" });
    }
    
    if (screen.startsWith("crimes")) {
      crumbs.push({ label: "Crimes Ambientais", screen: "crimes" });
      if (screen.includes("fauna")) {
        crumbs.push({ label: "Crime contra a Fauna", screen: "crimes-fauna" });
        if (screen === "crimes-fauna-subtipo" && selectedSubtipo) {
          const subtipo = crimesPops.fauna.subtipos.find(s => s.id === selectedSubtipo);
          if (subtipo) crumbs.push({ label: subtipo.nome });
        }
      }
      if (screen.includes("flora")) {
        crumbs.push({ label: "Crime contra a Flora", screen: "crimes-flora" });
        if (screen === "crimes-flora-subtipo" && selectedSubtipo) {
          const subtipo = crimesPops.flora.subtipos.find(s => s.id === selectedSubtipo);
          if (subtipo) crumbs.push({ label: subtipo.nome });
        }
      }
      if (screen.includes("poluicao")) {
        crumbs.push({ label: "Crime de Poluição", screen: "crimes-poluicao" });
        if (screen === "crimes-poluicao-subtipo" && selectedSubtipo) {
          const subtipo = crimesPops.poluicao.subtipos.find(s => s.id === selectedSubtipo);
          if (subtipo) crumbs.push({ label: subtipo.nome });
        }
      }
      if (screen.includes("ordenamento")) {
        crumbs.push({ label: "Crime contra Ordenamento", screen: "crimes-ordenamento" });
        if (screen === "crimes-ordenamento-subtipo" && selectedSubtipo) {
          const subtipo = crimesPops.ordenamento.subtipos.find(s => s.id === selectedSubtipo);
          if (subtipo) crumbs.push({ label: subtipo.nome });
        }
      }
      if (screen.includes("administracao")) {
        crumbs.push({ label: "Crime contra Administração", screen: "crimes-administracao" });
        if (screen === "crimes-administracao-subtipo" && selectedSubtipo) {
          const subtipo = crimesPops.administracao.subtipos.find(s => s.id === selectedSubtipo);
          if (subtipo) crumbs.push({ label: subtipo.nome });
        }
      }
    }
    
    return crumbs;
  };

  const renderBreadcrumb = () => {
    const crumbs = getBreadcrumbs();
    if (crumbs.length <= 1) return null;
    
    return (
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          {crumbs.map((crumb, index) => (
            <BreadcrumbItem key={index}>
              {index < crumbs.length - 1 ? (
                <>
                  <BreadcrumbLink 
                    onClick={() => crumb.screen && setScreen(crumb.screen)}
                    className="cursor-pointer hover:text-primary"
                  >
                    {crumb.label}
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              ) : (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    );
  };

  const renderBackButton = (targetScreen: Screen, label: string = "Voltar") => (
    <Button 
      variant="outline" 
      onClick={() => setScreen(targetScreen)}
      className="mb-4"
    >
      <ChevronLeft className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );

  const renderRoteiroGeral = () => (
    <Card className="mb-6 bg-secondary/30 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-primary flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {roteiroGeral.titulo}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {roteiroGeral.secoes.map((secao, index) => (
          <PopSection key={index} titulo={secao.titulo} itens={secao.itens} />
        ))}
      </CardContent>
    </Card>
  );

  const renderHomeScreen = () => (
    <div className="min-h-screen flex flex-col">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-4">
          Procedimento Operacional Padrão para o Policiamento Ostensivo Ambiental
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Ferramenta de consulta rápida de Procedimentos Operacionais Padrão para policiais militares ambientais em serviço.
        </p>
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row gap-6 justify-center items-center max-w-4xl mx-auto w-full">
        <Card 
          className="w-full md:w-1/2 cursor-pointer hover:shadow-xl hover:border-primary/50 transition-all duration-300 bg-gradient-to-br from-background to-secondary/20"
          onClick={() => setScreen("fauna")}
        >
          <CardContent className="flex flex-col items-center justify-center p-8 md:p-12">
            <div className="p-6 rounded-full bg-primary/10 mb-6">
              <Bird className="h-16 w-16 md:h-20 md:w-20 text-primary" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-center text-foreground mb-2">
              Resgate/Manejo de Fauna
            </h2>
            <p className="text-muted-foreground text-center text-sm">
              Procedimentos para resgate de aves, mamíferos e répteis
            </p>
            <ChevronRight className="h-6 w-6 text-primary mt-4" />
          </CardContent>
        </Card>

        <Card 
          className="w-full md:w-1/2 cursor-pointer hover:shadow-xl hover:border-primary/50 transition-all duration-300 bg-gradient-to-br from-background to-secondary/20"
          onClick={() => setScreen("crimes")}
        >
          <CardContent className="flex flex-col items-center justify-center p-8 md:p-12">
            <div className="p-6 rounded-full bg-destructive/10 mb-6">
              <FileWarning className="h-16 w-16 md:h-20 md:w-20 text-destructive" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-center text-foreground mb-2">
              Crimes Ambientais
            </h2>
            <p className="text-muted-foreground text-center text-sm">
              Procedimentos para crimes contra fauna, flora, poluição e outros
            </p>
            <ChevronRight className="h-6 w-6 text-destructive mt-4" />
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" onClick={() => navigate("/")}>
          <Home className="h-4 w-4 mr-2" />
          Voltar ao Sistema
        </Button>
      </div>
    </div>
  );

  const renderFaunaScreen = () => (
    <div>
      {renderBackButton("home")}
      {renderBreadcrumb()}
      
      <h1 className="text-2xl font-bold text-primary mb-4">Resgate/Manejo de Fauna</h1>
      <p className="text-muted-foreground mb-6">
        Escolha o grupo de animal para ver o POP específico.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
          onClick={() => setScreen("fauna-aves")}
        >
          <CardContent className="flex flex-col items-center p-8">
            <Bird className="h-16 w-16 text-primary mb-4" />
            <h3 className="text-lg font-semibold">Aves</h3>
            <ChevronRight className="h-5 w-5 text-primary mt-2" />
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
          onClick={() => setScreen("fauna-mamiferos")}
        >
          <CardContent className="flex flex-col items-center p-8">
            <Cat className="h-16 w-16 text-primary mb-4" />
            <h3 className="text-lg font-semibold">Mamíferos</h3>
            <ChevronRight className="h-5 w-5 text-primary mt-2" />
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
          onClick={() => setScreen("fauna-repteis")}
        >
          <CardContent className="flex flex-col items-center p-8">
            <Bug className="h-16 w-16 text-primary mb-4" />
            <h3 className="text-lg font-semibold">Répteis</h3>
            <ChevronRight className="h-5 w-5 text-primary mt-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderFaunaPop = (tipo: "aves" | "mamiferos" | "repteis") => {
    const pop = faunaPops[tipo];
    return (
      <div>
        {renderBackButton("fauna")}
        {renderBreadcrumb()}

        <h1 className="text-2xl font-bold text-primary mb-2">{pop.titulo}</h1>
        <p className="text-sm text-muted-foreground mb-4">{pop.baseOperacional}</p>
        
        <Card className="mb-6 bg-accent/10 border-accent/30">
          <CardContent className="pt-4">
            <p className="font-medium">
              <span className="text-accent font-semibold">Situação típica: </span>
              {pop.situacaoTipica}
            </p>
          </CardContent>
        </Card>

        {renderRoteiroGeral()}

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Passo a passo específico</CardTitle>
          </CardHeader>
          <CardContent>
            {pop.secoes.map((secao, index) => (
              <PopSection key={index} titulo={secao.titulo} itens={secao.itens} />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCrimesScreen = () => (
    <div>
      {renderBackButton("home")}
      {renderBreadcrumb()}
      
      <h1 className="text-2xl font-bold text-primary mb-4">Crimes Ambientais</h1>
      <p className="text-muted-foreground mb-6">
        Escolha o tipo principal de crime ambiental para ver o POP.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
          onClick={() => setScreen("crimes-fauna")}
        >
          <CardContent className="flex flex-col items-center p-6">
            <Bird className="h-12 w-12 text-primary mb-3" />
            <h3 className="text-base font-semibold text-center">Crime contra a Fauna</h3>
            <ChevronRight className="h-5 w-5 text-primary mt-2" />
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
          onClick={() => setScreen("crimes-flora")}
        >
          <CardContent className="flex flex-col items-center p-6">
            <TreeDeciduous className="h-12 w-12 text-primary mb-3" />
            <h3 className="text-base font-semibold text-center">Crime contra a Flora</h3>
            <ChevronRight className="h-5 w-5 text-primary mt-2" />
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
          onClick={() => setScreen("crimes-poluicao")}
        >
          <CardContent className="flex flex-col items-center p-6">
            <Droplets className="h-12 w-12 text-primary mb-3" />
            <h3 className="text-base font-semibold text-center">Crime de Poluição e Outros</h3>
            <ChevronRight className="h-5 w-5 text-primary mt-2" />
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
          onClick={() => setScreen("crimes-ordenamento")}
        >
          <CardContent className="flex flex-col items-center p-6">
            <Building2 className="h-12 w-12 text-primary mb-3" />
            <h3 className="text-base font-semibold text-center">Crime contra Ordenamento Territorial</h3>
            <ChevronRight className="h-5 w-5 text-primary mt-2" />
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
          onClick={() => setScreen("crimes-administracao")}
        >
          <CardContent className="flex flex-col items-center p-6">
            <FileWarning className="h-12 w-12 text-primary mb-3" />
            <h3 className="text-base font-semibold text-center">Crime contra Administração Ambiental</h3>
            <ChevronRight className="h-5 w-5 text-primary mt-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCrimeSubtipos = (tipo: keyof typeof crimesPops) => {
    const crime = crimesPops[tipo];
    const targetScreen = `crimes-${tipo}-subtipo` as Screen;
    const backScreen = "crimes" as Screen;
    
    return (
      <div>
        {renderBackButton(backScreen)}
        {renderBreadcrumb()}
        
        <h1 className="text-2xl font-bold text-primary mb-2">{crime.titulo}</h1>
        <p className="text-sm text-muted-foreground mb-6">{crime.baseLegal}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {crime.subtipos.map((subtipo) => (
            <Card 
              key={subtipo.id}
              className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
              onClick={() => {
                setSelectedSubtipo(subtipo.id);
                setScreen(targetScreen);
              }}
            >
              <CardContent className="flex items-center justify-between p-4">
                <span className="font-medium">{subtipo.nome}</span>
                <ChevronRight className="h-5 w-5 text-primary" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderCrimePop = (tipo: keyof typeof crimesPops) => {
    const crime = crimesPops[tipo];
    const subtipo = crime.subtipos.find(s => s.id === selectedSubtipo);
    const backScreen = `crimes-${tipo}` as Screen;
    
    // Special case for passeriformes
    const isPasseriformes = selectedSubtipo === "passeriformes" && tipo === "fauna";
    const popData = isPasseriformes ? passeriformesPop : crime;

    return (
      <div>
        {renderBackButton(backScreen)}
        {renderBreadcrumb()}

        <h1 className="text-2xl font-bold text-primary mb-2">
          POP: {subtipo?.nome || crime.titulo}
        </h1>
        <p className="text-sm text-muted-foreground mb-4">
          {isPasseriformes ? passeriformesPop.baseLegal : crime.baseLegal}
        </p>
        
        <Card className="mb-6 bg-accent/10 border-accent/30">
          <CardContent className="pt-4">
            <p className="font-medium">
              <span className="text-accent font-semibold">Situação típica: </span>
              {isPasseriformes ? passeriformesPop.situacaoTipica : crime.situacaoTipica}
            </p>
          </CardContent>
        </Card>

        {renderRoteiroGeral()}

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Passo a passo</CardTitle>
          </CardHeader>
          <CardContent>
            {(isPasseriformes ? passeriformesPop.secoes : crime.secoes).map((secao, index) => (
              <PopSection key={index} titulo={secao.titulo} itens={secao.itens} />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderContent = () => {
    switch (screen) {
      case "home":
        return renderHomeScreen();
      case "fauna":
        return renderFaunaScreen();
      case "fauna-aves":
        return renderFaunaPop("aves");
      case "fauna-mamiferos":
        return renderFaunaPop("mamiferos");
      case "fauna-repteis":
        return renderFaunaPop("repteis");
      case "crimes":
        return renderCrimesScreen();
      case "crimes-fauna":
        return renderCrimeSubtipos("fauna");
      case "crimes-flora":
        return renderCrimeSubtipos("flora");
      case "crimes-poluicao":
        return renderCrimeSubtipos("poluicao");
      case "crimes-ordenamento":
        return renderCrimeSubtipos("ordenamento");
      case "crimes-administracao":
        return renderCrimeSubtipos("administracao");
      case "crimes-fauna-subtipo":
        return renderCrimePop("fauna");
      case "crimes-flora-subtipo":
        return renderCrimePop("flora");
      case "crimes-poluicao-subtipo":
        return renderCrimePop("poluicao");
      case "crimes-ordenamento-subtipo":
        return renderCrimePop("ordenamento");
      case "crimes-administracao-subtipo":
        return renderCrimePop("administracao");
      default:
        return renderHomeScreen();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <ScrollArea className="h-screen">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          {renderContent()}
        </div>
      </ScrollArea>
    </div>
  );
};

export default POP;
