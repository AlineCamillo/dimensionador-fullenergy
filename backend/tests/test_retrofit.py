"""
Testes do modulo de calculo de retrofit (chumbo -> LiFePO4).

Os valores de referencia usam os mesmos defaults da tela de retrofit do
app Streamlit atual (Tensao 48V, Capacidade 220Ah, DoD 80%, Eficiencia 70%
para o chumbo; DoD 95%, Eficiencia 95% para o LiFePO4).
"""

import pytest

from app.calculo.retrofit import calcular_retrofit


def test_retrofit_valores_padrao_da_tela():
    ah_real_chumbo, ah_lfp = calcular_retrofit(
        ah_chumbo=220.0,
        dod_chumbo=80.0,
        ef_chumbo=70.0,
        dod_lfp=95.0,
        ef_lfp=95.0,
    )

    # Ah real entregue pelo chumbo: 220 * 0.80 * 0.70
    assert ah_real_chumbo == pytest.approx(123.2)

    # Ah minimo em LiFePO4: 123.2 / (0.95 * 0.95)
    assert ah_lfp == pytest.approx(123.2 / 0.9025)
    assert ah_lfp == pytest.approx(136.5097, rel=1e-4)


def test_retrofit_dod_e_eficiencia_100_por_cento():
    # Quando o LiFePO4 tem DoD e eficiencia de 100%, ah_lfp == ah_real_chumbo
    ah_real_chumbo, ah_lfp = calcular_retrofit(
        ah_chumbo=100.0,
        dod_chumbo=50.0,
        ef_chumbo=80.0,
        dod_lfp=100.0,
        ef_lfp=100.0,
    )

    assert ah_real_chumbo == pytest.approx(40.0)  # 100 * 0.5 * 0.8
    assert ah_lfp == pytest.approx(40.0)
