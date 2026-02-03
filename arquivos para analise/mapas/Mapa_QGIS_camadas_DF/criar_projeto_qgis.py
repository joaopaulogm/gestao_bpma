# -*- coding: utf-8 -*-
"""
Carrega automaticamente todas as camadas KML/KMZ desta pasta no QGIS e salva um projeto .qgz.

Como usar (no QGIS):
1) Coloque este arquivo .py na mesma pasta das camadas .kml/.kmz.
2) Abra o QGIS.
3) Menu: Plugins > Python Console > Show Editor.
4) No editor, abra este .py e clique em Run (ou execute pelo console com exec()).
5) O projeto será salvo como Mapa_DF_camadas.qgz na mesma pasta.

Observações:
- O CRS do projeto será EPSG:4326 (WGS 84), que é o padrão do KML.
- A camada "poligonal_do_DF" (se existir) será usada para ajustar a extensão do mapa.
"""

import os
import glob

from qgis.core import (
    QgsProject,
    QgsVectorLayer,
    QgsCoordinateReferenceSystem,
    QgsLayerTreeGroup
)

# Pasta do script (e das camadas)
PASTA = os.path.dirname(os.path.abspath(__file__))

# Arquivos KML/KMZ
arquivos = sorted(glob.glob(os.path.join(PASTA, "*.kml")) + glob.glob(os.path.join(PASTA, "*.kmz")))

# Ignorar repetidos por nome de arquivo (caso exista)
vistos = set()
arquivos_unicos = []
for fp in arquivos:
    nome = os.path.basename(fp).lower()
    if nome in vistos:
        continue
    vistos.add(nome)
    arquivos_unicos.append(fp)

# Projeto
proj = QgsProject.instance()
proj.clear()

# CRS do projeto: WGS84
crs = QgsCoordinateReferenceSystem("EPSG:4326")
proj.setCrs(crs)

root = proj.layerTreeRoot()

# Grupos sugeridos (organiza melhor no painel de camadas)
grupos = {
    "Limites": ["poligonal"],
    "Unidades de Conservacao": ["unidades_de_conserv", "parque", "floresta_nacional", "flona", "reserva", "estacoes_ecologicas", "reservas_biologicas", "arie", "apa", "resbio", "rppn"],
    "Hidrografia": ["bacia", "drenagem", "corpos_d", "corpos_dagua"],
    "Meio fisico": ["classes_de_solos"],
    "Risco": ["risco_de_perda"]
}

# Cria grupos no projeto
grupo_objs = {}
for nome_grupo in grupos.keys():
    grupo_objs[nome_grupo] = root.addGroup(nome_grupo)

def escolher_grupo(nome_arquivo: str) -> str:
    na = nome_arquivo.lower()
    for g, chaves in grupos.items():
        for k in chaves:
            if k in na:
                return g
    return "Outros"

# Grupo "Outros" se precisar
grupo_outros = root.addGroup("Outros")
grupo_objs["Outros"] = grupo_outros

camada_limite = None

# Carrega camadas
for fp in arquivos_unicos:
    nome = os.path.splitext(os.path.basename(fp))[0]

    # Provider OGR carrega KML e KMZ
    vlayer = QgsVectorLayer(fp, nome, "ogr")

    if not vlayer.isValid():
        print("Falha ao carregar:", fp)
        continue

    proj.addMapLayer(vlayer, addToLegend=False)

    g = escolher_grupo(os.path.basename(fp))
    grupo = grupo_objs.get(g, grupo_outros)
    grupo.addLayer(vlayer)

    if "poligonal_do_df" in os.path.basename(fp).lower():
        camada_limite = vlayer

# Ajusta a extensão do canvas se houver poligonal
try:
    from qgis.utils import iface
    if camada_limite is not None:
        iface.mapCanvas().setExtent(camada_limite.extent())
        iface.mapCanvas().refresh()
except Exception as e:
    # Se rodar fora do contexto do iface (por exemplo, processamento), ignora
    print("Aviso: nao foi possivel ajustar a extensao automaticamente:", e)

# Salva projeto
saida = os.path.join(PASTA, "Mapa_DF_camadas.qgz")
proj.write(saida)

print("OK. Projeto salvo em:", saida)
print("Camadas carregadas:", len([l for l in proj.mapLayers().values()]))
