"""Gera public/texturas/marmore.svg, a estampa da camisa branca (fundo do tema claro).

A estampa da camisa é um "mármore líquido": faixas que correm juntas, fazem voltas e
afinam em ponta. Aqui ela sai de um ruído distorcido por ele mesmo (domain warping): as
curvas de nível desse campo viram as faixas, e onde elas ficariam finas e apertadas demais
afinam até sumir. Depois o contorno é vetorizado em curvas, pra ficar nítido em qualquer tela.

Mesma SEMENTE, mesmo desenho. Pra testar outro, troque a SEMENTE e rode de novo.

Uso (precisa de numpy, scipy, scikit-image):
    python3 -m venv /tmp/venv && /tmp/venv/bin/pip install numpy scipy scikit-image
    /tmp/venv/bin/python scripts/textura-marmore.py
"""

from pathlib import Path

import numpy as np
from scipy.ndimage import gaussian_filter, map_coordinates, zoom
from skimage.measure import approximate_polygon, find_contours
from skimage.morphology import remove_small_holes, remove_small_objects

SEMENTE = 7
FAIXAS = 7  # quantas faixas por unidade do campo: mais = estampa mais densa
DISTORCAO = 0.12  # quanto o campo é torcido, em fração da largura
QUEBRA = 0.3  # quanto o limiar varia: mais = mais faixas terminando em ponta
APERTO = 80  # percentil da densidade a partir do qual as faixas afinam até sumir
COR = "#d6dae2"  # cinza-azulado da estampa; o fundo é o --fundo do tema claro

W, H = 1600, 1000  # viewBox, igual ao da estampa do tema escuro
S = 2  # o campo é calculado em meia resolução
M = 200  # margem, pra distorção não puxar a borda
w, h = (W + 2 * M) // S, (H + 2 * M) // S
rng = np.random.default_rng(SEMENTE)


def ruido(celulas):
    """Ruído suave: grade aleatória ampliada por spline cúbica, com média 0 e desvio 1."""
    gh, gw = int(h / w * celulas) + 4, celulas + 4
    z = zoom(rng.standard_normal((gh, gw)), (h / (gh - 3), w / (gw - 3)), order=3)[:h, :w]
    return (z - z.mean()) / z.std()


def fbm(celulas, oitavas=3):
    return sum(ruido(celulas * 2**i) * 0.5**i for i in range(oitavas)) / 1.75


yy, xx = np.mgrid[0:h, 0:w].astype(float)


def torce(f, dx, dy, quanto):
    return map_coordinates(f, [yy + dy * quanto, xx + dx * quanto], order=1, mode="mirror")


# Campo torcido duas vezes, e as faixas são as curvas de nível dele
quanto = w * DISTORCAO
qx, qy = fbm(2), fbm(2)
q2x = torce(fbm(3), qx, qy, quanto)
q2y = torce(fbm(3), qx, qy, quanto)
campo = torce(fbm(3), q2x, q2y, quanto)

limiar = 0.25 + QUEBRA * ruido(4)
gy, gx = np.gradient(campo)
densidade = gaussian_filter(np.hypot(gx, gy) * FAIXAS * np.pi, 6)
d0 = np.percentile(densidade, APERTO)
faixa = np.sin(campo * np.pi * FAIXAS) - limiar - np.clip((densidade - d0) / d0, 0, None) * 1.4
m = M // S
faixa = faixa[m:-m, m:-m]

# Sem farelo: pedacinhos e furinhos somem
mascara = remove_small_holes(remove_small_objects(faixa > 0, max_size=150), max_size=150)
suave = np.pad(gaussian_filter(mascara.astype(float), 1.6), 1, constant_values=0)  # fecha na borda


def caminho(contorno):
    """Contorno fechado -> curvas Bézier (Catmull-Rom), em coordenadas do viewBox."""
    p = approximate_polygon(contorno, tolerance=0.35)
    pts = [((x - 1) * S, (y - 1) * S) for y, x in p][:-1]
    n = len(pts)
    if n < 3:
        return ""
    d = f"M{pts[0][0]:.0f} {pts[0][1]:.0f}"
    for i in range(n):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f"C{c1[0]:.0f} {c1[1]:.0f} {c2[0]:.0f} {c2[1]:.0f} {p2[0]:.0f} {p2[1]:.0f}"
    return d + "Z"


partes = [caminho(c) for c in find_contours(suave, 0.5) if len(c) >= 8]
svg = (
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice">'
    f'<path fill="{COR}" fill-rule="evenodd" d="{"".join(partes)}"/></svg>\n'
)
destino = Path(__file__).resolve().parent.parent / "public" / "texturas" / "marmore.svg"
destino.write_text(svg)
print(f"{destino}: {len(svg) // 1024} KB, {len(partes)} contornos")
