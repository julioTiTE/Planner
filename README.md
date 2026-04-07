Meu Organizador
Aplicação web pessoal de planejamento e organização com calendário interativo, gerenciamento de eventos e sistema de autenticação completo.


Sobre o Projeto
Planner pessoal desenvolvido para organização de rotina e compromissos. Oferece uma interface de calendário interativa para criação e gerenciamento de eventos, com autenticação segura por JWT e fluxo completo de recuperação de senha.

Funcionalidades

Calendário Interativo — visualização mensal com criação e edição de eventos
Planner de Tarefas — organização de atividades por data
Autenticação Completa

Cadastro de usuário
Login com JWT
Recuperação de senha por e-mail
Reset de senha seguro


Tema Claro/Escuro — alternância entre temas com persistência
Keep-Alive automático — rota de cron para manter o servidor ativo em ambientes gratuitos


Tecnologias
CamadaTecnologiaFrontendNext.js 15 (App Router), React, TypeScriptEstilizaçãoTailwind CSS, shadcn/uiBackendNext.js API RoutesBanco de DadosPostgreSQL (Supabase)AutenticaçãoJWT (jsonwebtoken)DeployVercel

Como Rodar Localmente
Pré-requisitos

Node.js 18+
Conta no Supabase (ou PostgreSQL local)

Passos
bash# Clone o repositório
git clone https://github.com/julioTiTE/meu-organizador.git
cd meu-organizador

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.local.example .env.local
# Edite o .env.local com suas credenciais

# Inicie o servidor de desenvolvimento
npm run dev
Acesse http://localhost:3000

Variáveis de Ambiente
Crie um arquivo .env.local na raiz:
envDATABASE_URL=postgresql://usuario:senha@host:5432/nome_banco
JWT_SECRET=seu-jwt-secret-seguro

Estrutura do Projeto
src/
├── app/
│   ├── api/                  # Endpoints da API
│   │   ├── events/           # CRUD de eventos
│   │   ├── user-login/       # Autenticação
│   │   ├── register/         # Cadastro
│   │   ├── forgot-password/  # Recuperação de senha
│   │   ├── reset-password/   # Reset de senha
│   │   └── cron/keep-alive/  # Manutenção de uptime
│   ├── login/                # Página de login
│   ├── cadastro/             # Página de cadastro
│   ├── esqueci-senha/        # Recuperação de senha
│   └── reset-password/       # Reset de senha
└── components/
    ├── calendar.tsx          # Calendário principal
    ├── planner.tsx           # Planner de tarefas
    ├── login-form.tsx        # Formulário de login
    └── ui/                   # Componentes shadcn/ui
