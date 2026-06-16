"""
Parametros e constantes institucionais do dimensionamento de baterias LiFePO4.

Estes valores sao as REGRAS PROTEGIDAS da FullEnergy (ver documento de
arquitetura). Nao devem ser alterados sem aprovacao da Engenharia. A futura
tabela `parametros_sistema` (banco de dados) apenas espelha estes valores
para exibicao/auditoria; a edicao de itens marcados como protegidos exige
perfil administrador.
"""

# Versao do algoritmo de calculo -- gravada em resultados_projeto para rastreabilidade.
# Incrementar sempre que houver alteracao nas regras de calculo ou no catalogo de celulas.
VERSAO_ALGORITMO = "1.1.0"

# Tensoes de referencia por celula LiFePO4 (V)
V_NOM = 3.2   # tensao nominal
V_MAX = 3.55  # tensao maxima (carga plena)
V_MIN = 2.6   # tensao minima (descarga)

# Numero de celulas em serie por tensao nominal do sistema (V -> S)
SERIE = {
    12: 4,
    24: 8,
    36: 12,
    48: 16,
    60: 20,
    72: 24,
}

# Margens de seguranca aplicadas sobre a corrente de datasheet das celulas
MARGEM_CONTINUA = 0.80  # 80% da corrente continua de datasheet
MARGEM_PICO = 0.90      # 90% da corrente de pico de datasheet

# Catalogo base: 11 celulas validadas com datasheet confirmado.
# Dimensoes (comprimento_mm, largura_mm, altura_mm) sao apenas para exibicao/PDF.
# Convencao prismaticas: comprimento=face larga (L), largura=espessura (T), altura=com terminal (H1).
# Cilindricas: comprimento=largura=diametro, altura=comprimento axial.
CELULAS_BASE = [
    {
        "fabricante": "CBAK", "ah": 15, "c_cont": 2.0, "c_pico": 6.0, "peso": 0.29,
        "ciclos": 2500,
        "condicao_ciclos": ">=2500 ciclos a 25C, 0.5C/0.5C, ate 80% SOH",
        "cont_datasheet": 30,
        "pico_datasheet": 90,
        "comprimento_mm": 33, "largura_mm": 33, "altura_mm": 140,
    },
    {
        "fabricante": "Great Power", "ah": 20, "c_cont": 0.5, "c_pico": 3.0, "peso": 0.37,
        "ciclos": 4000,
        "condicao_ciclos": ">=4000 ciclos a 25C (0.5C/0.5C, 80%); >=2000 a 25C (1C/1C, 80%); >=1500 a 45C (0.5C/0.5C, 80%)",
        "cont_datasheet": 10,
        "pico_datasheet": 60,
        "comprimento_mm": 40, "largura_mm": 40, "altura_mm": 136,
    },
    {
        "fabricante": "Gotion", "ah": 27, "c_cont": 4.0, "c_pico": 5.0, "peso": 0.596,
        "ciclos": 3000,
        "condicao_ciclos": ">=3000 ciclos a 25C/1C (80% SOH); >=1500 a 45C; >=800 a 55C",
        "cont_datasheet": 108,
        "pico_datasheet": 135,
        "comprimento_mm": 100, "largura_mm": 21, "altura_mm": 140,
    },
    {
        "fabricante": "Great Power", "ah": 50, "c_cont": 1.0, "c_pico": 2.0, "peso": 1.10,
        "ciclos": 3500,
        "condicao_ciclos": ">=3500 ciclos a 25C (1C/1C, 80%); >=1800 a 45C (80%)",
        "cont_datasheet": 50,
        "pico_datasheet": 100,
        "comprimento_mm": 148, "largura_mm": 40, "altura_mm": 96,
    },
    {
        "fabricante": "REPT", "ah": 104, "c_cont": 2.0, "c_pico": 5.0, "peso": 1.92,
        "ciclos": 2000,
        "condicao_ciclos": ">=2000 ciclos a 25C, 1C, ate 80% SOH",
        "cont_datasheet": 208,
        "pico_datasheet": 520,
        "comprimento_mm": 148, "largura_mm": 52, "altura_mm": 119,
    },
    {
        "fabricante": "CALB", "ah": 163, "c_cont": 1.0, "c_pico": 2.0, "peso": 3.19,
        "ciclos": 4000,
        "condicao_ciclos": ">=4000 ciclos (1C/1C, ate 80% da capacidade nominal)",
        "cont_datasheet": 163,
        "pico_datasheet": 326,
        "comprimento_mm": 174, "largura_mm": 36, "altura_mm": 220,
    },
    {
        "fabricante": "CALB", "ah": 230, "c_cont": 1.0, "c_pico": 3.0, "peso": 4.17,
        "ciclos": 4000,
        "condicao_ciclos": ">=4000 ciclos (1C/1C, ate 80% da capacidade nominal)",
        "cont_datasheet": 230,
        "pico_datasheet": 690,
        "comprimento_mm": 174, "largura_mm": 54, "altura_mm": 207,
    },
    {
        "fabricante": "EVE", "ah": 230, "c_cont": 1.0, "c_pico": 3.0, "peso": 4.11,
        "ciclos": 4000,
        "condicao_ciclos": "4000 ciclos @25C (80% SOH); 2000 ciclos @45C (80% SOH)",
        "cont_datasheet": 230,
        "pico_datasheet": 690,
        "comprimento_mm": 174, "largura_mm": 54, "altura_mm": 207,
    },
    {
        "fabricante": "XDLE", "ah": 230, "c_cont": 2.0, "c_pico": 3.0, "peso": 4.10,
        "ciclos": 4500,
        "condicao_ciclos": ">=4500 ciclos a 25C, 1C/1C, ate 70% da capacidade inicial",
        "cont_datasheet": 460,
        "pico_datasheet": 690,
        "comprimento_mm": 173, "largura_mm": 54, "altura_mm": 204,
    },
    {
        "fabricante": "EVE", "ah": 280, "c_cont": 1.0, "c_pico": 1.0, "peso": 5.49,
        "ciclos": 8000,
        "condicao_ciclos": "8000 ciclos @25C (70% SOH); 3000 ciclos @45C (70% SOH)",
        "cont_datasheet": 280,
        "pico_datasheet": 280,
        "comprimento_mm": 174, "largura_mm": 72, "altura_mm": 207,
    },
    {
        "fabricante": "XDLE", "ah": 280, "c_cont": 1.0, "c_pico": 3.0, "peso": 5.50,
        "ciclos": 1200,
        "condicao_ciclos": "Fade <=5% apos 1200 ciclos (25C, 300+-30kgf, SOC 20-50%) -- metrica diferente de 80% SOH",
        "cont_datasheet": 280,
        "pico_datasheet": 840,
        "comprimento_mm": 173, "largura_mm": 71, "altura_mm": 204,
    },
]


def _montar_celulas():
    """Deriva correntes com margem FullEnergy aplicada sobre valores de datasheet.
    Inclui campos de dimensoes fisicas (apenas para exibicao/PDF)."""
    celulas = []
    for c in CELULAS_BASE:
        cont = c["cont_datasheet"] * MARGEM_CONTINUA
        pico = c["pico_datasheet"] * MARGEM_PICO
        celulas.append({
            "fabricante": c["fabricante"],
            "ah": c["ah"],
            "c_cont": c["c_cont"],
            "c_pico": c["c_pico"],
            "cont_datasheet": c["cont_datasheet"],
            "pico_datasheet": c["pico_datasheet"],
            "cont": cont,
            "pico": pico,
            "cont_recomendado": cont,
            "pico_recomendado": pico,
            "peso": c["peso"],
            "ciclos": c["ciclos"],
            "condicao_ciclos": c["condicao_ciclos"],
            "comprimento_mm": c["comprimento_mm"],
            "largura_mm": c["largura_mm"],
            "altura_mm": c["altura_mm"],
        })
    return celulas


# Catalogo de celulas pronto para uso pelos modulos de calculo
CELULAS = _montar_celulas()
