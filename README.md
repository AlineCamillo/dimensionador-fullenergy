# Dimensionador de Baterias LiFePO4 — FullEnergy

Sistema de dimensionamento técnico de baterias de lítio LiFePO4 para
aplicações industriais e de mobilidade elétrica (carrinhos de golfe,
plataformas elevatórias, lavadoras/secadoras de piso, empilhadeiras,
rebocadores, AGVs/EGVs, veículos especiais, entre outros).

Migração do dimensionador Streamlit (`app (2).py`) para uma aplicação
React + Vite + Tailwind (frontend) e FastAPI + SQLite (backend), preservando
integralmente as regras de cálculo já validadas pela Engenharia.

> Etapa atual: **backend de cálculo + API + frontend de Dimensionamento**
> (sem banco de dados ainda). Essas etapas serão adicionadas
> progressivamente conforme `Dimensionador_v2_Arquitetura.md`.

## Estrutura atual do projeto

```
dimensionador-fullenergy/
├── README.md
├── .gitignore
├── .env.example
├── backend/
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py                  # cria a aplicação FastAPI
│   │   ├── core/
│   │   │   └── constantes.py        # constantes/regras protegidas FullEnergy
│   │   ├── calculo/                  # camada pura de cálculo (sem I/O)
│   │   ├── schemas/
│   │   │   └── dimensionamento.py    # contratos de entrada/saída da API
│   │   ├── services/
│   │   │   └── dimensionamento_service.py  # orquestra calculo -> resposta
│   │   └── api/
│   │       └── routers/
│   │           └── dimensionamento.py  # POST /dimensionar
│   └── tests/                         # testes da camada de cálculo
└── frontend/
    ├── package.json
    ├── index.html
    ├── tailwind.config.js
    ├── vite.config.ts
    ├── .env.example
    └── src/
        ├── main.tsx / App.tsx / index.css
        ├── types/dimensionamento.ts      # espelha os schemas da API
        ├── api/                           # client.ts + dimensionamento.ts
        ├── hooks/useDimensionamento.ts    # integração com POST /dimensionar
        ├── components/
        │   ├── ui/                        # Card, Section, Input, Select, Button
        │   ├── layout/                     # Sidebar + Layout
        │   └── dimensionamento/            # seções da tela de Dimensionamento
        └── pages/                          # Dashboard, Dimensionamento, Cadastros,
                                             # Relatórios, Configurações
```

## Requisitos

- Python 3.10 ou superior
- pip

## Como executar o backend localmente

Todos os comandos abaixo devem ser executados a partir da pasta `backend/`.

### 1. Criar e ativar o ambiente virtual

**Windows (PowerShell):**

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
```

**Windows (cmd):**

```cmd
cd backend
python -m venv .venv
.venv\Scripts\activate.bat
```

**Linux / macOS:**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Instalar as dependências

```bash
pip install -r requirements.txt
```

### 3. Executar a API com uvicorn

```bash
uvicorn app.main:app --reload
```

A API ficará disponível em `http://127.0.0.1:8000`.

### 4. Acessar o endpoint de verificação `/health`

Abra no navegador ou use curl:

```bash
curl http://127.0.0.1:8000/health
```

Resposta esperada:

```json
{"status": "ok"}
```

A documentação interativa (Swagger UI) fica disponível em:
`http://127.0.0.1:8000/docs`

### 5. Testar o endpoint `POST /dimensionar`

A forma mais simples é pelo Swagger UI (`/docs`), usando o botão
**"Try it out"** no endpoint `POST /dimensionar`.

Alternativamente, via curl — exemplo de "projeto novo" (48V, motor de 3000W
AC, autonomia de 4h, fator de utilização de 40%, com validação de
controlador):

```bash
curl -X POST "http://127.0.0.1:8000/dimensionar" \
  -H "Content-Type: application/json" \
  -d '{
        "tensao": 48,
        "autonomia": 4.0,
        "fator": 40,
        "modo_selecao": "Automática",
        "itens_consumo": [
          {
            "descricao": "Motor tração",
            "tipo": "AC",
            "potencia": 3000,
            "corrente": 0,
            "uso_pct": 100,
            "eficiencia_pct": 90
          }
        ],
        "controlador": {
          "v_min": 50,
          "v_max": 58,
          "i_cont": 30,
          "i_pico": 50
        }
      }'
```

Exemplo de "retrofit" (chumbo 220Ah/80%/70% -> LiFePO4 95%/95%):

```bash
curl -X POST "http://127.0.0.1:8000/dimensionar" \
  -H "Content-Type: application/json" \
  -d '{
        "tensao": 48,
        "modo_selecao": "Automática",
        "retrofit": {
          "ah_chumbo": 220,
          "dod_chumbo": 80,
          "ef_chumbo": 70,
          "dod_lfp": 95,
          "ef_lfp": 95
        }
      }'
```

A resposta inclui `resumo`, `opcoes` (uma por célula do catálogo),
`comparativo`, `celula_selecionada` e, quando informado, `retrofit` e
`alertas_controlador`.

## Executar os testes da camada de cálculo

```bash
cd backend
python -m pytest tests/ -v
```

## Como executar o frontend localmente

O frontend (`frontend/`) é uma aplicação React + Vite + TypeScript +
TailwindCSS que consome a API FastAPI via `POST /dimensionar`. Ele **não**
contém nenhuma regra de cálculo — todo o processamento ocorre no backend.

### Requisitos

- Node.js 18 ou superior
- npm

### 1. Instalar as dependências

A partir da pasta `frontend/`:

```bash
cd frontend
npm install
```

### 2. Configurar a URL da API (opcional)

Por padrão, o frontend acessa `http://127.0.0.1:8000` (URL do backend em
desenvolvimento). Para alterar, copie `.env.example` para `.env` e ajuste
`VITE_API_BASE_URL`:

```bash
cp .env.example .env
```

### 3. Executar o backend (em outro terminal)

O frontend depende da API estar em execução (ver seção "Como executar o
backend localmente" acima):

```bash
cd backend
uvicorn app.main:app --reload
```

### 4. Executar o frontend em modo desenvolvimento

```bash
cd frontend
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173`. A página inicial é
a tela de **Dimensionamento**, com o menu lateral: Dashboard, Dimensionamento,
Cadastros, Relatórios e Configurações.

### 5. Gerar build de produção (opcional)

```bash
npm run build
npm run preview
```

## Próximas etapas

- Persistência (SQLite): catálogo de células, projetos, dimensionamentos e
  parâmetros do sistema.
- Geração de relatórios em PDF.
- Páginas Dashboard, Cadastros, Relatórios e Configurações (atualmente
  placeholders no frontend).
- Autenticação e perfis de usuário (parâmetros protegidos exigem perfil
  administrador).
