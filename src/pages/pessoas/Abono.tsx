import React, { useState, useMemo } from 'react';
import { Gift, ArrowLeft, Search, Calendar, Users, Filter, ChevronDown, Info, Building2, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface Militar {
  matricula: string;
  posto: string;
  nome: string;
}

interface MesAbono {
  mes: string;
  numero: number;
  militares: Militar[];
}

// Dados do calendário de abono 2026
const dadosAbono: MesAbono[] = [
  {
    mes: 'Janeiro',
    numero: 1,
    militares: [
      { matricula: '235989', posto: '1º SGT', nome: 'GILBERTO SILVANO RODRIGUES' },
      { matricula: '241334', posto: '1º SGT', nome: 'JESSE CLEITON SANTANA DE OLIVEIRA' },
      { matricula: '728632', posto: '1º SGT', nome: 'CASSIO BARBOSA NASCIMENTO' },
      { matricula: '73909X', posto: '2º SGT', nome: 'MARCUS VINICIUS RODRIGUES BARREIRA' },
      { matricula: '7315910', posto: '2º SGT', nome: 'RODRIGO MARTINS DO NASCIMENTO BARBOSA' },
      { matricula: '7315139', posto: '2º SGT', nome: 'ROGERIO XIMENES PORTELA' },
      { matricula: '7319126', posto: '2º SGT', nome: 'SAULO ELEUTERIO COSTA' },
      { matricula: '7325967', posto: '3º SGT', nome: 'LEANDRO MONTEIRO ZEIN SAMMOUR ESTEVES' },
      { matricula: '7361580', posto: 'CB', nome: 'RAFAEL FERNANDES PAZ' },
      { matricula: '7368968', posto: 'SD', nome: 'WILLIAN MOUTINHO TAVARES' },
      { matricula: '7383746', posto: 'SD', nome: 'CAMYLA TAVARES ALVES SOUZA' },
      { matricula: '7389612', posto: 'SD', nome: 'JOÃO VICTOR RODRIGUES SANTOS' },
      { matricula: '34278516', posto: 'SD', nome: 'EDUARDO FERREIRA NEVES RODRIGUES' },
    ],
  },
  {
    mes: 'Fevereiro',
    numero: 2,
    militares: [
      { matricula: '219487', posto: '1º SGT', nome: 'CLÁUDIO NERO FERNANDES DA NÓBREGA' },
      { matricula: '222925', posto: '1º SGT', nome: 'ROBERVAL PAULO DE CASTRO' },
      { matricula: '228915', posto: '1º SGT', nome: 'ISMAEL MOTTA' },
      { matricula: '73876X', posto: '2º SGT', nome: 'MAENDLI TENIS DA HORA JUNIOR' },
      { matricula: '739820', posto: '2º SGT', nome: 'AUCEMI DA SILVA LIMA' },
      { matricula: '73943X', posto: '2º SGT', nome: 'PAULO CELIO VIEIRA' },
      { matricula: '2149419', posto: '2º SGT', nome: 'GIL N HENRIQUE LOPES DOS SANTOS' },
      { matricula: '7316518', posto: '2º SGT', nome: 'RAFAEL TOLEDO RAMOS' },
      { matricula: '7329539', posto: '3º SGT', nome: 'JOAO PAULO GONCALVES MACIEL' },
      { matricula: '7360940', posto: 'CB', nome: 'VITOR SOUZA BARBOZA' },
      { matricula: '7381204', posto: 'SD', nome: 'GUSTAVO DE OLIVEIRA LEMOS' },
      { matricula: '7396082', posto: 'SD', nome: 'JOÃO FELIPE FERREIRA ZEIDAN' },
      { matricula: '34279741', posto: 'SD', nome: 'ROBSON SILVA FURTADO' },
      { matricula: '34284753', posto: 'SD', nome: 'GABRIEL RODRIGUES MARQUES DOS SANTOS' },
    ],
  },
  {
    mes: 'Março',
    numero: 3,
    militares: [
      { matricula: '21759X', posto: '1º SGT', nome: 'WELINGTON JEAN RICARDO CAMELO SOUSA' },
      { matricula: '232475', posto: '1º SGT', nome: 'ANDRE LUIZ BARBOSA CEZAR' },
      { matricula: '730289', posto: '1º SGT', nome: 'EVANIMAR JOSE MARQUES CARVALHO' },
      { matricula: '237388', posto: '2º SGT', nome: 'LEONARDO DE SALLES' },
      { matricula: '7322631', posto: '2º SGT', nome: 'BRICIO HERBERT ALVES TEIXEIRA' },
      { matricula: '7313993', posto: '2º SGT', nome: 'IGOR SANTOS NUNES' },
      { matricula: '7318553', posto: '2º SGT', nome: 'RAFAEL MARANHÃO COSTA E SILVA' },
      { matricula: '731812X', posto: '3º SGT', nome: 'NATAN MANOEL BARBOSA E SILVA DAS CHAGAS' },
      { matricula: '7356410', posto: 'CB', nome: 'RAFAEL ALVES COELHO' },
      { matricula: '7386486', posto: 'SD', nome: 'VINICIUS DE FREITAS BEZERRA' },
      { matricula: '34287507', posto: 'SD', nome: 'GABRIEL LARA DE ARAUJO' },
      { matricula: '34278729', posto: 'SD', nome: 'LUCAS DURAN DA SILVA' },
      { matricula: '34286756', posto: 'SD', nome: 'BRAYON PABLO DA SILVA BIANGULO' },
    ],
  },
  {
    mes: 'Abril',
    numero: 4,
    militares: [
      { matricula: '236411', posto: 'ST', nome: 'ISRAEL VITORINO SOARES VIEIRA' },
      { matricula: '237132', posto: '1º SGT', nome: 'LEONARDO CUNHA VILELA DIAS' },
      { matricula: '231975', posto: '1º SGT', nome: 'ALLAN BERNARDO DE PAIVA SOUZA LIMA' },
      { matricula: '730629', posto: '1º SGT', nome: 'RONALD DA SILVA TEIXEIRA' },
      { matricula: '740934', posto: '1º SGT', nome: 'CARLOS EDUARDO MEDEIROS' },
      { matricula: '741566', posto: '1º SGT', nome: 'PAULO EDUARDO DE PAIVA BRAGA' },
      { matricula: '1959573', posto: '1º SGT', nome: 'ALLAN ROGERIO FARIAS LOPES' },
      { matricula: '1955306', posto: '1º SGT', nome: 'CARLOS MASSAMI DE MACEDO ENDO' },
      { matricula: '731471X', posto: '2º SGT', nome: 'LUCAS ALVES MIRANDA' },
      { matricula: '732040X', posto: '2º SGT', nome: 'CARLOS HENRIQUE CRUZ DE QUEIROZ' },
      { matricula: '7358555', posto: 'CB', nome: 'PAULO HENRIQUE DA SILVA RIBEIRO' },
      { matricula: '7381735', posto: 'SD', nome: 'TIAGO RODRIGUES FERREIRA' },
      { matricula: '34291271', posto: 'SD', nome: 'MIKAEL PEREIRA DOS SANTOS' },
      { matricula: '34287655', posto: 'SD', nome: 'GUILHERME DILAN PEREIRA DA SILVA' },
      { matricula: '34281861', posto: 'SD', nome: 'MAIKY BARBOSA LOBO CANTUARIO' },
    ],
  },
  {
    mes: 'Maio',
    numero: 5,
    militares: [
      { matricula: '23267X', posto: '1º SGT', nome: 'ANTONIO DENIS MOURA DOS SANTOS' },
      { matricula: '240257', posto: '1º SGT', nome: 'UZIEL DE SA FERNANDES' },
      { matricula: '240613', posto: '1º SGT', nome: 'WALLACE VIDAL DE SOUZA' },
      { matricula: '738956', posto: '2º SGT', nome: 'MARCIO DA SILVA AVELAR' },
      { matricula: '738549', posto: '2º SGT', nome: 'MARCEL LARA FERNANDES' },
      { matricula: '2154250', posto: '2º SGT', nome: 'FERNANDO MIKHAIL DE ALBUQUERQUE PINHEIRO' },
      { matricula: '7318960', posto: '2º SGT', nome: 'DANIEL ANTONIO SIRQUEIRA DIAS' },
      { matricula: '7316771', posto: '2º SGT', nome: 'VITOR GABRIEL LIMA DANTAS' },
      { matricula: '7325770', posto: '3º SGT', nome: 'GUILHERME MILAGRE NETO GUIMARAES' },
      { matricula: '7359233', posto: 'CB', nome: 'LEONARDO BISPO LEMES' },
      { matricula: '7379536', posto: 'SD', nome: 'THIAGO QUEIROZ SANTOS' },
      { matricula: '7391994', posto: 'SD', nome: 'FELIPE NUNES SOARES' },
      { matricula: '34279091', posto: 'SD', nome: 'PAULO EDUARDO DUARTE MATEUS' },
      { matricula: '34280464', posto: 'SD', nome: 'JAIR CARVALHO FERNANDES PAIVA' },
    ],
  },
  {
    mes: 'Junho',
    numero: 6,
    militares: [
      { matricula: '213985', posto: 'ST', nome: 'ROBERTO PEREIRA GONCALVES' },
      { matricula: '217999', posto: 'ST', nome: 'ELTON NERI DA CONCEICAO' },
      { matricula: '221074', posto: '1º SGT', nome: 'MARCIO ALEXANDRE FONSECA ARAUJO' },
      { matricula: '736538', posto: '2º SGT', nome: 'DANIEL BORGES DAMASCENO' },
      { matricula: '731549X', posto: '2º SGT', nome: 'GREICY ERNESTINA DA SILVA' },
      { matricula: '7320582', posto: '2º SGT', nome: 'RODOLFO MEDEIROS DE PAULO PINHEIRO' },
      { matricula: '7315090', posto: '2º SGT', nome: 'THIAGO ALVES DA SILVA' },
      { matricula: '7313217', posto: '2º SGT', nome: 'THIAGO TEIXEIRA DE OLIVEIRA' },
      { matricula: '7323980', posto: '3º SGT', nome: 'KAYO HENRIQUE LASMAR BARBOSA VIEIRA' },
      { matricula: '735892X', posto: 'CB', nome: 'HIGOR GOMES PALHA BESSA' },
      { matricula: '7371209', posto: 'CB', nome: 'DANILO DA SILVA NASCIMENTO' },
      { matricula: '7387385', posto: 'SD', nome: 'BRUNO FERREIRA NUNES' },
      { matricula: '7389728', posto: 'SD', nome: 'SANDERSON MELO BRITO' },
      { matricula: '7387369', posto: 'SD', nome: 'LUCAS DE SOUSA SENA' },
      { matricula: '34283544', posto: 'SD', nome: 'JEFERSON FABRÍCIO SOUZA' },
    ],
  },
  {
    mes: 'Julho',
    numero: 7,
    militares: [
      { matricula: '237221', posto: '1º SGT', nome: 'LEONARDO MELO LEAL' },
      { matricula: '242624', posto: '1º SGT', nome: 'LEOMAR PEDRO DA SILVA' },
      { matricula: '229113', posto: '1º SGT', nome: 'EMERSON FRANCISCO DA SILVA' },
      { matricula: '737402', posto: '2º SGT', nome: 'FERNANDO APARECIDO DO NASCIMENTO' },
      { matricula: '1954695', posto: '2º SGT', nome: 'BRUNO LIMA DA CUNHA' },
      { matricula: '1963074', posto: '2º SGT', nome: 'GIULLIANO DE SOUZA CAMPOS' },
      { matricula: '1999176', posto: '2º SGT', nome: 'FÁBIO FRANCISCO LAGO PEREIRA' },
      { matricula: '215093X', posto: '2º SGT', nome: 'WESLEN COSTA DA SILVA' },
      { matricula: '7315902', posto: '2º SGT', nome: 'FERNANDA DOS SANTOS ECHAMENDE' },
      { matricula: '7313012', posto: '2º SGT', nome: 'MARCIA HINGREDY ATAIDES DE SOUZA' },
      { matricula: '7327013', posto: '3º SGT', nome: 'EVELIZE DE BRITO MACHADO' },
      { matricula: '7359969', posto: 'CB', nome: 'LUCAS PEIXOTO ARAÚJO' },
      { matricula: '7368844', posto: 'SD', nome: 'WANDERLEY FIDELIS DA SILVA JUNIOR' },
      { matricula: '34288481', posto: 'SD', nome: 'LEONARDO NASCIMENTO FREITAS' },
      { matricula: '32579527', posto: 'SD', nome: 'MAICON BARROZO DO NASCIMENTO' },
      { matricula: '34284788', posto: 'SD', nome: 'LUCAS GONÇALVES DE JESUS' },
      { matricula: '19294654', posto: 'SD', nome: 'CAIO ANDRÉ PACHECO PALHARES' },
    ],
  },
  {
    mes: 'Agosto',
    numero: 8,
    militares: [
      { matricula: '230790', posto: '1º SGT', nome: 'EDMILSON SILVA DOS SANTOS' },
      { matricula: '732397', posto: '1º SGT', nome: 'ANA PAULA ALVES RIBEIRO' },
      { matricula: '7314051', posto: '2º SGT', nome: 'FLÁVIO PEREIRA MACEDO' },
      { matricula: '7318561', posto: '2º SGT', nome: 'EDIMILSON MEIRA DOS SANTOS' },
      { matricula: '1955411', posto: '2º SGT', nome: 'PAULO ROBERTO BATISTA MACHADO' },
      { matricula: '1966774', posto: '2º SGT', nome: 'JORGE PEREIRA DE MELO' },
      { matricula: '2149621', posto: '2º SGT', nome: 'RAPHAEL VINICIUS DE OLIVEIRA FERREIRA' },
      { matricula: '7320604', posto: '2º SGT', nome: 'PAULO HENRIQUE DE MOURA CAMPOS' },
      { matricula: '7318545', posto: '3º SGT', nome: 'THIAGO DE OLIVEIRA CARVALHO' },
      { matricula: '7361173', posto: 'CB', nome: 'PEDRO HENRIQUE DA CRUZ SILVA' },
      { matricula: '7384637', posto: 'SD', nome: 'CIBELE CARMO DA SILVA' },
      { matricula: '34289437', posto: 'SD', nome: 'SUSAN HELLEN LIMA DOS SANTOS' },
      { matricula: '34281991', posto: 'SD', nome: 'EDERSON MESSIAS DE OLIVEIRA SILVA' },
      { matricula: '34280227', posto: 'SD', nome: 'GABRIEL JAYME AMANCIO DONINI' },
      { matricula: '34282653', posto: 'SD', nome: 'GUILHERME MALVEIRA DE MENEZES' },
    ],
  },
  {
    mes: 'Setembro',
    numero: 9,
    militares: [
      { matricula: '727660', posto: 'ST', nome: 'ADALBERTO ARAUJO' },
      { matricula: '229180', posto: '1º SGT', nome: 'WELLINGTON LUCAS DA MOTA' },
      { matricula: '242942', posto: '1º SGT', nome: 'MAURO FERNANDO CORREIA' },
      { matricula: '2153866', posto: '1º SGT', nome: 'RENATO PEREIRA RIBEIRO' },
      { matricula: '7322569', posto: '2º SGT', nome: 'WELITON WAGNER DOS SANTOS' },
      { matricula: '7317921', posto: '2º SGT', nome: 'WELYSSON ERICK MACHADO NUNES' },
      { matricula: '7318138', posto: '2º SGT', nome: 'FABRÍCIO BUENO MAGALHÃES' },
      { matricula: '7316054', posto: '2º SGT', nome: 'YURY RIBEIRO DE AQUINO' },
      { matricula: '195976X', posto: '2º SGT', nome: 'FLAVIO ALVES DE HOLANDA' },
      { matricula: '7314876', posto: '2º SGT', nome: 'JULIO CEZAR GABRIEL OGAWA' },
      { matricula: '7320213', posto: '3º SGT', nome: 'PEDRO HELIO CAETANO RIBAS' },
      { matricula: '7321422', posto: '3º SGT', nome: 'FILIPE XAVIER DE LIRA SILVA' },
      { matricula: '7355459', posto: 'CB', nome: 'ANA GABRIELA DE ARAUJO BARRETO' },
      { matricula: '7392834', posto: 'SD', nome: 'LUIS FERNANDO MOREIRA DE PAIVA' },
      { matricula: '739621X', posto: 'SD', nome: 'ARIADNE DE LIMA LUCAS' },
      { matricula: '34284672', posto: 'SD', nome: 'AMANDA FERREIRA MENDONÇA' },
      { matricula: '21071993', posto: 'SD', nome: 'VIVIANE LOPES ALBANIZA REBOUÇAS' },
      { matricula: '34280367', posto: 'SD', nome: 'PEDRO HENRIQUE ALVES DE SOUZA' },
    ],
  },
  {
    mes: 'Outubro',
    numero: 10,
    militares: [
      { matricula: '237485', posto: 'ST', nome: 'LUICIANO LUIZ DE ANDRADE' },
      { matricula: '221430', posto: '1º SGT', nome: 'GILMAR ALVES DOS SANTOS' },
      { matricula: '730858', posto: '1º SGT', nome: 'MARCELO FERREIRA DE MELO' },
      { matricula: '729396', posto: '1º SGT', nome: 'SÉRGIO FÁBIO DE ARAÚJO ANDRADE' },
      { matricula: '728039', posto: '1º SGT', nome: 'HERMANO ARAUJO DOS SANTOS' },
      { matricula: '7316844', posto: '2º SGT', nome: 'WESLEY COUTINHO DE LIMA' },
      { matricula: '7321317', posto: '2º SGT', nome: 'MARCILIO CARNEIRO ALVES VIEIRA' },
      { matricula: '7320191', posto: '2º SGT', nome: 'DENISSON DE SOUZA BRAGA' },
      { matricula: '7323859', posto: '2º SGT', nome: 'RENATO MARQUES ROSA' },
      { matricula: '2184583', posto: '2º SGT', nome: 'RONIE VON FONSECA DE SOUSA' },
      { matricula: '7316100', posto: '2º SGT', nome: 'DEIVID RODRIGUES FALCÃO DE BRITO' },
      { matricula: '7329350', posto: '3º SGT', nome: 'LEONARDO TEIXEIRA VIEIRA' },
      { matricula: '7330677', posto: '3º SGT', nome: 'BRUNO CABRAL DOS SANTOS' },
      { matricula: '734578X', posto: 'CB', nome: 'EDUARDO VICTOR DE MORAES FREITAS' },
      { matricula: '7383371', posto: 'SD', nome: 'LEANDRO RODRIGUES DE CASTRO' },
      { matricula: '7381956', posto: 'SD', nome: 'CARLOS ALBERTO HOTE MACHADO FILHO' },
      { matricula: '7384033', posto: 'SD', nome: 'RAMON LIRA DOS ANJOS' },
      { matricula: '7381565', posto: 'SD', nome: 'DEBORAH CRISTINA AZEVEDO GOMES' },
      { matricula: '7379544', posto: 'SD', nome: 'DIAN FRANCHESCO DE MOURA LUCCA' },
    ],
  },
  {
    mes: 'Novembro',
    numero: 11,
    militares: [
      { matricula: '239453', posto: 'ST', nome: 'RODNEI TAVARES BARBOSA' },
      { matricula: '244082', posto: '1º SGT', nome: 'LUIZ GERALDO REZENDE' },
      { matricula: '244007', posto: '1º SGT', nome: 'FABIO GONZAGA DE BRITO' },
      { matricula: '237442', posto: '1º SGT', nome: 'LIVIO ALESSANDRO GOMES ALVES' },
      { matricula: '728012', posto: '1º SGT', nome: 'PAULO ROBERTO FERREIRA BOMFIM' },
      { matricula: '740365', posto: '2º SGT', nome: 'WESLEY DE GODOY CADETE' },
      { matricula: '2149397', posto: '2º SGT', nome: 'LUIS EDUARDO SHIKASHO' },
      { matricula: '2151189', posto: '2º SGT', nome: 'EULER TAVARES DA COSTA' },
      { matricula: '2155990', posto: '2º SGT', nome: 'THIAGO ROBERTO CASTRO NUNES' },
      { matricula: '1998560', posto: '2º SGT', nome: 'BRENO DOS SANTOS SILVA' },
      { matricula: '1962477', posto: '2º SGT', nome: 'LUCAS ALVES COSTA DA SILVA' },
      { matricula: '7322143', posto: '3º SGT', nome: 'EDUARDO RIBEIRO PIMENTEL' },
      { matricula: '7329393', posto: '3º SGT', nome: 'DENIS DE SOUZA BONFIM' },
      { matricula: '7355297', posto: 'CB', nome: 'RENAN DE MELLO SANTOS SPAVIER' },
      { matricula: '7369964', posto: 'SD', nome: 'GUSTAVO RODRIGUES BARROSO VIDAL' },
      { matricula: '7371977', posto: 'SD', nome: 'MARÍLIA COSTA RIBEIRO' },
      { matricula: '7381905', posto: 'SD', nome: 'BRUNO VILELA DA SILVA' },
      { matricula: '7382677', posto: 'SD', nome: 'CRISTIANO RODRIGUES DA ROCHA' },
      { matricula: '7383738', posto: 'SD', nome: 'JOAO GUSMAO MELITO' },
    ],
  },
  {
    mes: 'Dezembro',
    numero: 12,
    militares: [], // Não há dados de dezembro no PDF
  },
];

const postoColors: Record<string, string> = {
  'ST': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  '1º SGT': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  '2º SGT': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  '3º SGT': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  'CB': 'bg-green-500/20 text-green-400 border-green-500/30',
  'SD': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const mesColors = [
  'from-blue-500/20 to-blue-600/10',
  'from-purple-500/20 to-purple-600/10',
  'from-pink-500/20 to-pink-600/10',
  'from-rose-500/20 to-rose-600/10',
  'from-orange-500/20 to-orange-600/10',
  'from-amber-500/20 to-amber-600/10',
  'from-yellow-500/20 to-yellow-600/10',
  'from-lime-500/20 to-lime-600/10',
  'from-green-500/20 to-green-600/10',
  'from-emerald-500/20 to-emerald-600/10',
  'from-teal-500/20 to-teal-600/10',
  'from-cyan-500/20 to-cyan-600/10',
];

const Abono: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMes, setSelectedMes] = useState<string>('todos');
  const [selectedPosto, setSelectedPosto] = useState<string>('todos');
  const [expandedMeses, setExpandedMeses] = useState<number[]>([]);

  const postos = useMemo(() => {
    const all = dadosAbono.flatMap(m => m.militares.map(mil => mil.posto));
    return ['todos', ...Array.from(new Set(all))];
  }, []);

  const filteredData = useMemo(() => {
    return dadosAbono
      .filter(mes => selectedMes === 'todos' || mes.numero.toString() === selectedMes)
      .map(mes => ({
        ...mes,
        militares: mes.militares.filter(mil => {
          const matchesSearch = 
            mil.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mil.matricula.includes(searchTerm);
          const matchesPosto = selectedPosto === 'todos' || mil.posto === selectedPosto;
          return matchesSearch && matchesPosto;
        }),
      }))
      .filter(mes => mes.militares.length > 0 || (selectedMes !== 'todos' && mes.numero.toString() === selectedMes));
  }, [searchTerm, selectedMes, selectedPosto]);

  const totalMilitares = useMemo(() => {
    return filteredData.reduce((acc, mes) => acc + mes.militares.length, 0);
  }, [filteredData]);

  const toggleMes = (numero: number) => {
    setExpandedMeses(prev => 
      prev.includes(numero) 
        ? prev.filter(n => n !== numero)
        : [...prev, numero]
    );
  };

  const expandAll = () => {
    setExpandedMeses(dadosAbono.map(m => m.numero));
  };

  const collapseAll = () => {
    setExpandedMeses([]);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link to="/secao-pessoas">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <Gift className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Abono de Ponto Anual</h1>
              <p className="text-sm text-muted-foreground">Calendário 2026 - BPMA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Regras de Abono */}
      <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="h-5 w-5 text-primary" />
            Regras do Abono de Ponto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Gift className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="font-medium text-foreground">Direito a 5 dias</p>
              <p className="text-sm text-muted-foreground">Cada policial tem direito a 5 dias de abono de ponto anual.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Building2 className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="font-medium text-foreground">Seções Administrativas (Expediente)</p>
              <p className="text-sm text-muted-foreground">Podem tirar os dias de forma avulsa, sem necessidade de dias consecutivos.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <CalendarDays className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="font-medium text-foreground">Policiais em Escala</p>
              <p className="text-sm text-muted-foreground">Devem tirar os 5 dias consecutivos ou dividir em blocos de <span className="font-semibold text-amber-500">3 + 2 dias</span>.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">2026</p>
                <p className="text-xs text-muted-foreground">Ano Vigente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{totalMilitares}</p>
                <p className="text-xs text-muted-foreground">Militares</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Filter className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{filteredData.length}</p>
                <p className="text-xs text-muted-foreground">Meses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Gift className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">5</p>
                <p className="text-xs text-muted-foreground">Dias de Abono</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 bg-card/80 backdrop-blur-sm border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>
            
            <Select value={selectedMes} onValueChange={setSelectedMes}>
              <SelectTrigger className="w-full md:w-[180px] bg-background/50">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os meses</SelectItem>
                {dadosAbono.map(mes => (
                  <SelectItem key={mes.numero} value={mes.numero.toString()}>
                    {mes.mes}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPosto} onValueChange={setSelectedPosto}>
              <SelectTrigger className="w-full md:w-[160px] bg-background/50">
                <Users className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Graduação" />
              </SelectTrigger>
              <SelectContent>
                {postos.map(posto => (
                  <SelectItem key={posto} value={posto}>
                    {posto === 'todos' ? 'Todas' : posto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={expandAll} className="text-xs">
                Expandir
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll} className="text-xs">
                Recolher
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <div className="space-y-4">
        {filteredData.length === 0 ? (
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                Nenhum militar encontrado
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Tente ajustar os filtros de busca
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredData.map((mes) => (
            <Collapsible
              key={mes.numero}
              open={expandedMeses.includes(mes.numero)}
              onOpenChange={() => toggleMes(mes.numero)}
            >
              <Card className={`bg-gradient-to-r ${mesColors[mes.numero - 1]} border-border/50 overflow-hidden`}>
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="p-4 cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-background/50 font-bold text-xl">
                          {String(mes.numero).padStart(2, '0')}
                        </div>
                        <div className="text-left">
                          <CardTitle className="text-lg">{mes.mes}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {mes.militares.length} militar{mes.militares.length !== 1 ? 'es' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="hidden md:flex gap-1">
                          {['ST', '1º SGT', '2º SGT', '3º SGT', 'CB', 'SD'].map(posto => {
                            const count = mes.militares.filter(m => m.posto === posto).length;
                            if (count === 0) return null;
                            return (
                              <Badge key={posto} variant="outline" className={`${postoColors[posto]} text-xs`}>
                                {posto}: {count}
                              </Badge>
                            );
                          })}
                        </div>
                        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${expandedMeses.includes(mes.numero) ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="p-4 pt-0">
                    {mes.militares.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhum abono programado para este mês
                      </p>
                    ) : (
                      <ScrollArea className="max-h-[400px]">
                        <div className="grid gap-2">
                          {mes.militares.map((militar, idx) => (
                            <div
                              key={militar.matricula}
                              className="flex items-center gap-4 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                            >
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs font-medium">
                                {idx + 1}
                              </div>
                              <Badge variant="outline" className={`${postoColors[militar.posto]} shrink-0`}>
                                {militar.posto}
                              </Badge>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">
                                  {militar.nome}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Mat. {militar.matricula}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))
        )}
      </div>
    </div>
  );
};

export default Abono;
