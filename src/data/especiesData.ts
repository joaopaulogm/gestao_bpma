// Dados das espécies de fauna e flora para identificação
// Estruturado a partir do CSV de resumo de imagens

export interface EspecieData {
  nome_popular: string;
  nome_cientifico: string;
  tipo: 'fauna' | 'flora';
  grupo: string;
  qtd_imagens: number;
  folder_id?: string; // Google Drive folder ID for images
}

// Fauna - Aves
export const faunaAves: EspecieData[] = [
  { nome_popular: "Alma de Gato", nome_cientifico: "Piaya cayana", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Andorinha", nome_cientifico: "Tyrannus savana", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Anu Branco", nome_cientifico: "Guira guira", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Anu Preto", nome_cientifico: "Crotophaga ani", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Araçari Castanho", nome_cientifico: "Pteroglossus castanotis", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Arara Canindé", nome_cientifico: "Ara ararauna", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Arara Maracanã", nome_cientifico: "Primolius maracana", tipo: "fauna", grupo: "aves", qtd_imagens: 0 },
  { nome_popular: "Azulão", nome_cientifico: "Cyanocompsa brissonii", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Bacurau", nome_cientifico: "Nyctidromus albicollis", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Baiano", nome_cientifico: "Sporophila nigricollis", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Beija Flor", nome_cientifico: "Florisuga fusca", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Bem Te Vi", nome_cientifico: "Pitangus sulphuratus", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Bico de Lacre", nome_cientifico: "Estrilda astrild", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Bigodinho", nome_cientifico: "Sporophila lineola", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Biguá", nome_cientifico: "Phalacrocorax brasilianus", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Biguatinga", nome_cientifico: "Anhinga anhinga", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Caboclinho", nome_cientifico: "Sporophila pileata", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Canário Belga", nome_cientifico: "Serinus canaria", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Canário da Terra", nome_cientifico: "Sicalis flaveola", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Carcará", nome_cientifico: "Caracara plancus", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Cardeal do Nordeste", nome_cientifico: "Paroaria dominicana", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Coleiro", nome_cientifico: "Sporophila caerulescens", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Corrupião", nome_cientifico: "Icterus jamacaii", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Coruja Buraqueira", nome_cientifico: "Athene cunicularia", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Coruja Caburé", nome_cientifico: "Glaucidium brasilianum", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Coruja Orelhuda", nome_cientifico: "Pseudoscops clamator", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Coruja Preta", nome_cientifico: "Strix huhula", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Coruja Suindara", nome_cientifico: "Tyto furcata", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Corujinha da Mata", nome_cientifico: "Megascops choliba", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Curiango", nome_cientifico: "Nyctidromus albicollis", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Curicaca", nome_cientifico: "Theristicus caudatus", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Curió", nome_cientifico: "Oryzoborus angolensis", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Frango d'Água", nome_cientifico: "Gallinula galeata", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Garça Branca", nome_cientifico: "Ardea alba", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Garibaldi", nome_cientifico: "Chrysomus ruficapillus", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Gaturamo Verdadeiro", nome_cientifico: "Euphonia violacea", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Gavião Carijó", nome_cientifico: "Rupornis magnirostris", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Gavião Quiriquiri", nome_cientifico: "Falco sparverius", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Golinho", nome_cientifico: "Sporophila albogularis", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Gralha Cancã", nome_cientifico: "Cyanocorax cyanopogon", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Irerê", nome_cientifico: "Dendrocygna viduata", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "João de Barro", nome_cientifico: "Furnarius rufus", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Juruva", nome_cientifico: "Baryphthengus ruficapillus", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Maria Faceira", nome_cientifico: "Syrigma sibilatrix", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Maritaca", nome_cientifico: "Pionus maximiliani", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Martim Pescador", nome_cientifico: "Megaceryle torquata", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Mutum", nome_cientifico: "Crax fasciolata", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Papa Capim", nome_cientifico: "Sporophila nigricollis", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Papa Lagarta", nome_cientifico: "Coccyzus melacoryphus", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Papagaio do Mangue", nome_cientifico: "Amazona amazonica", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Papagaio Galego", nome_cientifico: "Alipiopsitta xanthops", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Papagaio Verdadeiro", nome_cientifico: "Amazona aestiva", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Patativa", nome_cientifico: "Sporophila plumbea", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Paturi", nome_cientifico: "Netta erythrophthalma", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Perdiz", nome_cientifico: "Rhynchotus rufescens", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Periquito do Encontro", nome_cientifico: "Brotogeris chiriri", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Periquito Maracanã", nome_cientifico: "Psittacara leucophthalmus", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Periquito Rei", nome_cientifico: "Eupsittula aurea", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Pintassilgo", nome_cientifico: "Carduelis carduelis", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Pomba do Bando", nome_cientifico: "Zenaida auriculata", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Pomba Verdadeira", nome_cientifico: "Patagioenas picazuro", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Quero Quero", nome_cientifico: "Vanellus chilensis", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Rolinha Roxa", nome_cientifico: "Columbina talpacoti", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Sabiá Barranco", nome_cientifico: "Turdus leucomelas", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Sabiá do Campo", nome_cientifico: "Mimus saturninus", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Sabiá Laranjeira", nome_cientifico: "Turdus rufiventris", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Saíra Amarela", nome_cientifico: "Tangara cayana", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Sanhaço Cinzento", nome_cientifico: "Thraupis sayaca", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Sanhaço Coqueiro", nome_cientifico: "Thraupis palmarum", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Seriema", nome_cientifico: "Cariama cristata", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Tesourinha", nome_cientifico: "Tyrannus savana", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Tiziu", nome_cientifico: "Volatinia jacarina", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Trinca Ferro", nome_cientifico: "Saltator maximus", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Tucano", nome_cientifico: "Ramphastos toco", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Tuim", nome_cientifico: "Forpus xanthopterygius", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Urubu", nome_cientifico: "Coragyps atratus", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Urutau", nome_cientifico: "Nyctibius griseus", tipo: "fauna", grupo: "aves", qtd_imagens: 3 },
  { nome_popular: "Xexéu", nome_cientifico: "Cacicus cela", tipo: "fauna", grupo: "aves", qtd_imagens: 2 },
];

// Fauna - Mamíferos
export const faunaMamiferos: EspecieData[] = [
  { nome_popular: "Anta", nome_cientifico: "Tapirus terrestris", tipo: "fauna", grupo: "mamiferos", qtd_imagens: 3 },
  { nome_popular: "Bicho preguiça", nome_cientifico: "Bradypus variegatus", tipo: "fauna", grupo: "mamiferos", qtd_imagens: 0 },
  { nome_popular: "Bugio/Guariba", nome_cientifico: "Alouatta guariba", tipo: "fauna", grupo: "mamiferos", qtd_imagens: 0 },
  { nome_popular: "Cachorro do mato", nome_cientifico: "Cerdocyon thous", tipo: "fauna", grupo: "mamiferos", qtd_imagens: 3 },
  { nome_popular: "Cachorro doméstico", nome_cientifico: "Canis lupus familiaris", tipo: "fauna", grupo: "mamiferos", qtd_imagens: 3 },
  { nome_popular: "Capivara", nome_cientifico: "Hydrochoerus hydrochaeris", tipo: "fauna", grupo: "mamiferos", qtd_imagens: 3 },
  { nome_popular: "Catitu", nome_cientifico: "Pecari tajacu", tipo: "fauna", grupo: "mamiferos", qtd_imagens: 3 },
  { nome_popular: "Cavalo", nome_cientifico: "Equus caballus", tipo: "fauna", grupo: "mamiferos", qtd_imagens: 3 },
  { nome_popular: "Cutia", nome_cientifico: "Dasyprocta leporina", tipo: "fauna", grupo: "mamiferos", qtd_imagens: 2 },
  { nome_popular: "Gato do mato pequeno", nome_cientifico: "Leopardus guttulus", tipo: "fauna", grupo: "mamiferos", qtd_imagens: 1 },
  { nome_popular: "Jaguatirica", nome_cientifico: "Leopardus pardalis", tipo: "fauna", grupo: "mamiferos", qtd_imagens: 2 },
  { nome_popular: "Lobo guará", nome_cientifico: "Chrysocyon brachyurus", tipo: "fauna", grupo: "mamiferos", qtd_imagens: 3 },
  { nome_popular: "Mico estrela", nome_cientifico: "Callithrix penicillata", tipo: "fauna", grupo: "mamiferos", qtd_imagens: 3 },
  { nome_popular: "Onça", nome_cientifico: "Panthera onca", tipo: "fauna", grupo: "mamiferos", qtd_imagens: 2 },
  { nome_popular: "Quati", nome_cientifico: "Nasua nasua", tipo: "fauna", grupo: "mamiferos", qtd_imagens: 3 },
  { nome_popular: "Sagui", nome_cientifico: "Callithrix jacchus", tipo: "fauna", grupo: "mamiferos", qtd_imagens: 3 },
  { nome_popular: "Sarué", nome_cientifico: "Didelphis albiventris", tipo: "fauna", grupo: "mamiferos", qtd_imagens: 3 },
  { nome_popular: "Sucuarana", nome_cientifico: "Puma concolor", tipo: "fauna", grupo: "mamiferos", qtd_imagens: 3 },
  { nome_popular: "Tamanduá bandeira", nome_cientifico: "Myrmecophaga tridactyla", tipo: "fauna", grupo: "mamiferos", qtd_imagens: 3 },
  { nome_popular: "Tamanduá mirim", nome_cientifico: "Tamandua tetradactyla", tipo: "fauna", grupo: "mamiferos", qtd_imagens: 3 },
  { nome_popular: "Tatu de rabo mole", nome_cientifico: "Cabassous unicinctus", tipo: "fauna", grupo: "mamiferos", qtd_imagens: 3 },
  { nome_popular: "Tatu galinha", nome_cientifico: "Dasypus novemcinctus", tipo: "fauna", grupo: "mamiferos", qtd_imagens: 3 },
  { nome_popular: "Tatu peba", nome_cientifico: "Euphractus sexcinctus", tipo: "fauna", grupo: "mamiferos", qtd_imagens: 2 },
  { nome_popular: "Veado campeiro", nome_cientifico: "Ozotoceros bezoarticus", tipo: "fauna", grupo: "mamiferos", qtd_imagens: 3 },
];

// Fauna - Répteis
export const faunaRepteis: EspecieData[] = [
  { nome_popular: "Cágado de barbicha", nome_cientifico: "Phrynops geoffroanus", tipo: "fauna", grupo: "repteis", qtd_imagens: 2 },
  { nome_popular: "Calango", nome_cientifico: "Cnemidophorus ocellifer", tipo: "fauna", grupo: "repteis", qtd_imagens: 3 },
  { nome_popular: "Cascavel", nome_cientifico: "Crotalus durissus", tipo: "fauna", grupo: "repteis", qtd_imagens: 3 },
  { nome_popular: "Cobra cega (Cecília)", nome_cientifico: "Gymnophiona", tipo: "fauna", grupo: "repteis", qtd_imagens: 1 },
  { nome_popular: "Cobra cipó", nome_cientifico: "Chironius bicarinatus", tipo: "fauna", grupo: "repteis", qtd_imagens: 1 },
  { nome_popular: "Cobra Coral Falsa", nome_cientifico: "Oxyrhopus guibei", tipo: "fauna", grupo: "repteis", qtd_imagens: 3 },
  { nome_popular: "Cobra Coral verdadeira", nome_cientifico: "Micrurus lemniscatus", tipo: "fauna", grupo: "repteis", qtd_imagens: 3 },
  { nome_popular: "Cobra d'água", nome_cientifico: "Liophis typhlus", tipo: "fauna", grupo: "repteis", qtd_imagens: 3 },
  { nome_popular: "Cobra dormideira", nome_cientifico: "Sibynomorphus mikanii", tipo: "fauna", grupo: "repteis", qtd_imagens: 3 },
  { nome_popular: "Geco leopardo (exótico)", nome_cientifico: "Eublepharis macularius", tipo: "fauna", grupo: "repteis", qtd_imagens: 1 },
  { nome_popular: "Jabuti", nome_cientifico: "Chelonoidis carbonaria", tipo: "fauna", grupo: "repteis", qtd_imagens: 3 },
  { nome_popular: "Jacaré do papo amarelo", nome_cientifico: "Caiman latirostris", tipo: "fauna", grupo: "repteis", qtd_imagens: 3 },
  { nome_popular: "Jacarétinga", nome_cientifico: "Caiman crocodilus", tipo: "fauna", grupo: "repteis", qtd_imagens: 3 },
  { nome_popular: "Jararaca cruzeira", nome_cientifico: "Bothrops neuwiedi", tipo: "fauna", grupo: "repteis", qtd_imagens: 3 },
  { nome_popular: "Jiboia", nome_cientifico: "Boa constrictor", tipo: "fauna", grupo: "repteis", qtd_imagens: 3 },
  { nome_popular: "Jiboia arco-íris", nome_cientifico: "Epicrates cenchria cenchria", tipo: "fauna", grupo: "repteis", qtd_imagens: 3 },
  { nome_popular: "Periquitamboia", nome_cientifico: "Corallus batesii", tipo: "fauna", grupo: "repteis", qtd_imagens: 1 },
  { nome_popular: "Serpente boipeba", nome_cientifico: "Xenodon merremii", tipo: "fauna", grupo: "repteis", qtd_imagens: 3 },
  { nome_popular: "Serpente caninana", nome_cientifico: "Spilotes pullatus", tipo: "fauna", grupo: "repteis", qtd_imagens: 2 },
  { nome_popular: "Tartaruga tigre d'água", nome_cientifico: "Trachemys dorbigni", tipo: "fauna", grupo: "repteis", qtd_imagens: 3 },
  { nome_popular: "Teiú", nome_cientifico: "Tupinambis merianae", tipo: "fauna", grupo: "repteis", qtd_imagens: 3 },
];

// Fauna - Peixes
export const faunaPeixes: EspecieData[] = [
  { nome_popular: "Acará azul", nome_cientifico: "Astronotus ocellatus", tipo: "fauna", grupo: "peixes", qtd_imagens: 1 },
  { nome_popular: "Apaiari", nome_cientifico: "Pterophyllum scalare", tipo: "fauna", grupo: "peixes", qtd_imagens: 1 },
  { nome_popular: "Cará", nome_cientifico: "Geophagus brasiliensis", tipo: "fauna", grupo: "peixes", qtd_imagens: 1 },
  { nome_popular: "Dourado", nome_cientifico: "Salminus brasiliensis", tipo: "fauna", grupo: "peixes", qtd_imagens: 1 },
  { nome_popular: "Lambari dos Arroios", nome_cientifico: "Bryconamericus iheringii", tipo: "fauna", grupo: "peixes", qtd_imagens: 1 },
  { nome_popular: "Matrinxã", nome_cientifico: "Brycon amazonicus", tipo: "fauna", grupo: "peixes", qtd_imagens: 1 },
  { nome_popular: "Molinésia", nome_cientifico: "Poecilia reticulata", tipo: "fauna", grupo: "peixes", qtd_imagens: 2 },
  { nome_popular: "Pacu", nome_cientifico: "Piaractus mesopotamicus", tipo: "fauna", grupo: "peixes", qtd_imagens: 1 },
  { nome_popular: "Piau", nome_cientifico: "Leporinus obtusidens", tipo: "fauna", grupo: "peixes", qtd_imagens: 1 },
  { nome_popular: "Pintado", nome_cientifico: "Pseudoplatystoma corruscans", tipo: "fauna", grupo: "peixes", qtd_imagens: 1 },
  { nome_popular: "Platys", nome_cientifico: "Xiphophorus maculatus", tipo: "fauna", grupo: "peixes", qtd_imagens: 1 },
  { nome_popular: "Tetra Olho de Fogo", nome_cientifico: "Moenkhausia sanctaefilomenae", tipo: "fauna", grupo: "peixes", qtd_imagens: 1 },
  { nome_popular: "Tilápia", nome_cientifico: "Oreochromis niloticus", tipo: "fauna", grupo: "peixes", qtd_imagens: 3 },
];

// Flora - Madeira de Lei (árvores com madeira nobre)
export const floraMadeiraDeLei: EspecieData[] = [
  { nome_popular: "Ipê-amarelo", nome_cientifico: "Handroanthus albus", tipo: "flora", grupo: "madeira_lei", qtd_imagens: 1 },
  { nome_popular: "Ipê-roxo", nome_cientifico: "Handroanthus impetiginosus", tipo: "flora", grupo: "madeira_lei", qtd_imagens: 3 },
  { nome_popular: "Ipê-branco", nome_cientifico: "Tabebuia roseoalba", tipo: "flora", grupo: "madeira_lei", qtd_imagens: 3 },
  { nome_popular: "Sucupira-branca", nome_cientifico: "Pterodon emarginatus", tipo: "flora", grupo: "madeira_lei", qtd_imagens: 3 },
  { nome_popular: "Sucupira-preta", nome_cientifico: "Bowdichia virgilioides", tipo: "flora", grupo: "madeira_lei", qtd_imagens: 3 },
  { nome_popular: "Jatobá", nome_cientifico: "Hymenaea stigonocarpa", tipo: "flora", grupo: "madeira_lei", qtd_imagens: 3 },
  { nome_popular: "Jatobá-da-mata", nome_cientifico: "Hymenaea courbaril", tipo: "flora", grupo: "madeira_lei", qtd_imagens: 3 },
  { nome_popular: "Pau-terra", nome_cientifico: "Qualea grandiflora", tipo: "flora", grupo: "madeira_lei", qtd_imagens: 3 },
  { nome_popular: "Copaíba", nome_cientifico: "Copaifera langsdorffii", tipo: "flora", grupo: "madeira_lei", qtd_imagens: 3 },
  { nome_popular: "Angico-vermelho", nome_cientifico: "Anadenanthera macrocarpa", tipo: "flora", grupo: "madeira_lei", qtd_imagens: 0 },
  { nome_popular: "Tamboril", nome_cientifico: "Enterolobium contortisiliquum", tipo: "flora", grupo: "madeira_lei", qtd_imagens: 3 },
  { nome_popular: "Caviúna", nome_cientifico: "Myroxylon peruiferum", tipo: "flora", grupo: "madeira_lei", qtd_imagens: 3 },
  { nome_popular: "Pau-ferro", nome_cientifico: "Libidibia ferrea", tipo: "flora", grupo: "madeira_lei", qtd_imagens: 3 },
  { nome_popular: "Jacarandá-do-cerrado", nome_cientifico: "Dalbergia miscolobium", tipo: "flora", grupo: "madeira_lei", qtd_imagens: 3 },
  { nome_popular: "Vinhático-do-cerrado", nome_cientifico: "Plathymenia reticulata", tipo: "flora", grupo: "madeira_lei", qtd_imagens: 3 },
  { nome_popular: "Pau-rei", nome_cientifico: "Centrolobium tomentosum", tipo: "flora", grupo: "madeira_lei", qtd_imagens: 3 },
  { nome_popular: "Ipê-amarelo-do-cerrado", nome_cientifico: "Handroanthus ochraceus", tipo: "flora", grupo: "madeira_lei", qtd_imagens: 3 },
  { nome_popular: "Ipê-amarelo-da-serra", nome_cientifico: "Handroanthus serratifolius", tipo: "flora", grupo: "madeira_lei", qtd_imagens: 3 },
  { nome_popular: "Ipê-rosa-grande", nome_cientifico: "Handroanthus heptaphyllus", tipo: "flora", grupo: "madeira_lei", qtd_imagens: 1 },
];

// Flora - Ornamental
export const floraOrnamental: EspecieData[] = [
  { nome_popular: "Ipê-verde", nome_cientifico: "Cybistax antisyphilitica", tipo: "flora", grupo: "ornamental", qtd_imagens: 3 },
  { nome_popular: "Jacarandá-mimoso", nome_cientifico: "Jacaranda mimosifolia", tipo: "flora", grupo: "ornamental", qtd_imagens: 0 },
  { nome_popular: "Pau-santo", nome_cientifico: "Kielmeyera coriacea", tipo: "flora", grupo: "ornamental", qtd_imagens: 3 },
  { nome_popular: "Canela-de-ema", nome_cientifico: "Vellozia squamata", tipo: "flora", grupo: "ornamental", qtd_imagens: 3 },
  { nome_popular: "Canela-de-ema-roxa", nome_cientifico: "Vellozia variabilis", tipo: "flora", grupo: "ornamental", qtd_imagens: 3 },
  { nome_popular: "Buriti", nome_cientifico: "Mauritia flexuosa", tipo: "flora", grupo: "ornamental", qtd_imagens: 3 },
  { nome_popular: "Macaúba", nome_cientifico: "Acrocomia aculeata", tipo: "flora", grupo: "ornamental", qtd_imagens: 3 },
  { nome_popular: "Guariroba", nome_cientifico: "Syagrus oleracea", tipo: "flora", grupo: "ornamental", qtd_imagens: 3 },
  { nome_popular: "Embaúba", nome_cientifico: "Cecropia pachystachya", tipo: "flora", grupo: "ornamental", qtd_imagens: 3 },
  { nome_popular: "Lobeira", nome_cientifico: "Solanum lycocarpum", tipo: "flora", grupo: "ornamental", qtd_imagens: 3 },
  { nome_popular: "Barbatimão", nome_cientifico: "Stryphnodendron adstringens", tipo: "flora", grupo: "ornamental", qtd_imagens: 3 },
  { nome_popular: "Lixeira", nome_cientifico: "Curatella americana", tipo: "flora", grupo: "ornamental", qtd_imagens: 3 },
  { nome_popular: "Arnica-do-campo", nome_cientifico: "Lychnophora ericoides", tipo: "flora", grupo: "ornamental", qtd_imagens: 3 },
  { nome_popular: "Cambará/Gomeira", nome_cientifico: "Vochysia thyrsoidea", tipo: "flora", grupo: "ornamental", qtd_imagens: 3 },
  { nome_popular: "Craibeira", nome_cientifico: "Tabebuia caraiba", tipo: "flora", grupo: "ornamental", qtd_imagens: 3 },
  { nome_popular: "Ipê-do-brejo", nome_cientifico: "Tabebuia aurea", tipo: "flora", grupo: "ornamental", qtd_imagens: 3 },
];

// Flora - Frutífera/Exótica
export const floraFrutiferaExotica: EspecieData[] = [
  { nome_popular: "Baru", nome_cientifico: "Dipteryx alata", tipo: "flora", grupo: "frutifera", qtd_imagens: 3 },
  { nome_popular: "Mangaba", nome_cientifico: "Hancornia speciosa", tipo: "flora", grupo: "frutifera", qtd_imagens: 3 },
  { nome_popular: "Araticum", nome_cientifico: "Annona crassiflora", tipo: "flora", grupo: "frutifera", qtd_imagens: 3 },
  { nome_popular: "Araticum-mirim", nome_cientifico: "Annona coriacea", tipo: "flora", grupo: "frutifera", qtd_imagens: 3 },
  { nome_popular: "Cagaita", nome_cientifico: "Eugenia dysenterica", tipo: "flora", grupo: "frutifera", qtd_imagens: 3 },
  { nome_popular: "Gabiroba", nome_cientifico: "Campomanesia pubescens", tipo: "flora", grupo: "frutifera", qtd_imagens: 3 },
  { nome_popular: "Guabiroba", nome_cientifico: "Campomanesia xanthocarpa", tipo: "flora", grupo: "frutifera", qtd_imagens: 1 },
  { nome_popular: "Murici", nome_cientifico: "Byrsonima crassifolia", tipo: "flora", grupo: "frutifera", qtd_imagens: 3 },
  { nome_popular: "Murici-do-campo", nome_cientifico: "Byrsonima verbascifolia", tipo: "flora", grupo: "frutifera", qtd_imagens: 3 },
  { nome_popular: "Jenipapo", nome_cientifico: "Genipa americana", tipo: "flora", grupo: "frutifera", qtd_imagens: 3 },
  { nome_popular: "Ingá", nome_cientifico: "Inga laurina", tipo: "flora", grupo: "frutifera", qtd_imagens: 3 },
  { nome_popular: "Ingá-do-brejo", nome_cientifico: "Inga edulis", tipo: "flora", grupo: "frutifera", qtd_imagens: 3 },
  { nome_popular: "Pitanga-do-cerrado", nome_cientifico: "Eugenia uniflora", tipo: "flora", grupo: "frutifera", qtd_imagens: 3 },
  { nome_popular: "Caju-do-cerrado", nome_cientifico: "Anacardium occidentale", tipo: "flora", grupo: "frutifera", qtd_imagens: 0 },
  { nome_popular: "Jambo-do-cerrado", nome_cientifico: "Syzygium malaccense", tipo: "flora", grupo: "frutifera", qtd_imagens: 3 },
  { nome_popular: "Bacupari-do-cerrado", nome_cientifico: "Salacia crassifolia", tipo: "flora", grupo: "frutifera", qtd_imagens: 3 },
  { nome_popular: "Pequi", nome_cientifico: "Caryocar brasiliense", tipo: "flora", grupo: "frutifera", qtd_imagens: 3 },
  { nome_popular: "Caqui-do-cerrado", nome_cientifico: "Diospyros hispida", tipo: "flora", grupo: "frutifera", qtd_imagens: 3 },
  { nome_popular: "Guavira", nome_cientifico: "Campomanesia adamantium", tipo: "flora", grupo: "frutifera", qtd_imagens: 3 },
  { nome_popular: "Marmelada-de-cachorro", nome_cientifico: "Alibertia edulis", tipo: "flora", grupo: "frutifera", qtd_imagens: 3 },
];

// Flora - Imune ao Corte (espécies protegidas)
export const floraImuneCorte: EspecieData[] = [
  { nome_popular: "Pequi", nome_cientifico: "Caryocar brasiliense", tipo: "flora", grupo: "imune_corte", qtd_imagens: 3 },
  { nome_popular: "Buriti", nome_cientifico: "Mauritia flexuosa", tipo: "flora", grupo: "imune_corte", qtd_imagens: 3 },
  { nome_popular: "Copaíba", nome_cientifico: "Copaifera langsdorffii", tipo: "flora", grupo: "imune_corte", qtd_imagens: 3 },
  { nome_popular: "Sucupira-branca", nome_cientifico: "Pterodon emarginatus", tipo: "flora", grupo: "imune_corte", qtd_imagens: 3 },
  { nome_popular: "Ipê-roxo", nome_cientifico: "Handroanthus impetiginosus", tipo: "flora", grupo: "imune_corte", qtd_imagens: 3 },
  { nome_popular: "Jatobá", nome_cientifico: "Hymenaea stigonocarpa", tipo: "flora", grupo: "imune_corte", qtd_imagens: 3 },
  { nome_popular: "Aroeira", nome_cientifico: "Myracrodruon urundeuva", tipo: "flora", grupo: "imune_corte", qtd_imagens: 3 },
  { nome_popular: "Gonçalo-Alves", nome_cientifico: "Astronium fraxinifolium", tipo: "flora", grupo: "imune_corte", qtd_imagens: 3 },
  { nome_popular: "Pau-Brasil", nome_cientifico: "Paubrasilia echinata", tipo: "flora", grupo: "imune_corte", qtd_imagens: 3 },
];

// Configuração dos grupos para exibição
export const gruposFauna = [
  { id: "aves", nome: "Aves", icon: "🐦", dados: faunaAves },
  { id: "mamiferos", nome: "Mamíferos", icon: "🦁", dados: faunaMamiferos },
  { id: "repteis", nome: "Répteis", icon: "🐍", dados: faunaRepteis },
  { id: "peixes", nome: "Peixes", icon: "🐟", dados: faunaPeixes },
];

export const gruposFlora = [
  { id: "madeira_lei", nome: "Madeira de Lei", icon: "🪵", dados: floraMadeiraDeLei },
  { id: "ornamental", nome: "Ornamental", icon: "🌺", dados: floraOrnamental },
  { id: "frutifera", nome: "Frutífera/Exótica", icon: "🍎", dados: floraFrutiferaExotica },
  { id: "imune_corte", nome: "Imune ao Corte", icon: "🛡️", dados: floraImuneCorte },
];

// Função para gerar URL de imagem placeholder baseado no nome científico
export const getPlaceholderImageUrl = (nomeCientifico: string): string => {
  const searchTerm = encodeURIComponent(nomeCientifico);
  return `https://source.unsplash.com/300x200/?${searchTerm}`;
};

// Função para gerar URL de imagem do Google Drive (quando disponível)
export const getGoogleDriveImageUrl = (folderId: string): string => {
  return `https://drive.google.com/uc?export=view&id=${folderId}`;
};
