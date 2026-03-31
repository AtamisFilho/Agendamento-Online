# Agendamento Online

Sistema de agendamento online para empresas de prestacao de servicos. Permite que clientes cadastrem-se e agendem horarios de forma rapida e intuitiva, com painel administrativo para o prestador gerenciar sua agenda.

## Funcionalidades

### Para o cliente
- Cadastro e login com e-mail/senha
- Fluxo de agendamento em 3 passos (servico > data/hora > confirmacao)
- Visualizacao e cancelamento de agendamentos
- Notificacoes por e-mail (confirmacao, lembrete, cancelamento)
- PWA — instalavel no celular como app nativo

### Para o prestador (dashboard)
- Visao geral com estatisticas (hoje, semana, pendentes, taxa de conclusao)
- Tabela de agendamentos com filtros e busca
- Gerenciamento de horarios disponiveis
- CRUD de servicos (nome, duracao, preco, cor)
- Diretorio de clientes com historico
- Configuracoes da empresa (prazos, lembretes, contato)

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend/Backend | Next.js 16 (App Router) + TypeScript |
| Estilo | Tailwind CSS v4 |
| Banco de dados | Supabase (PostgreSQL) |
| Autenticacao | Supabase Auth |
| Realtime | Supabase Realtime |
| E-mail | Resend |
| PWA | @ducanh2912/next-pwa |
| Validacao | Zod v4 + React Hook Form |
| Deploy | Vercel |

## Pre-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)
- Conta no [Resend](https://resend.com) (para e-mails)

## Setup

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/AtamisFilho/Agendamento-Online.git
cd Agendamento-Online
npm install
```

### 2. Configurar variaveis de ambiente

Copie o arquivo de exemplo e preencha com seus dados:

```bash
cp .env.example .env.local
```

Preencha as variaveis:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

RESEND_API_KEY=re_sua_api_key
EMAIL_FROM=noreply@seudominio.com

CRON_SECRET=um-segredo-aleatorio
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Configurar banco de dados (Supabase)

1. Crie um projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Acesse o **SQL Editor** e execute os arquivos na ordem:
   - `supabase/migrations/001_initial_schema.sql` — tabelas, triggers e enums
   - `supabase/migrations/002_rls_policies.sql` — politicas de seguranca (RLS)
   - `supabase/migrations/003_seed_data.sql` — servicos de exemplo

3. Crie um usuario prestador (provider) via Supabase Auth com o metadado:
   ```json
   { "full_name": "Seu Nome", "role": "provider" }
   ```

### 4. Executar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Estrutura do projeto

```
app/
  (auth)/          # Login, cadastro, recuperacao de senha
  (client)/        # Area do cliente (booking, appointments, profile)
  (provider)/      # Dashboard do prestador
  api/             # Route handlers (appointments, auth, cron)
components/
  ui/              # Componentes primitivos (Button, Input, Modal, etc.)
  auth/            # Formularios de autenticacao
  booking/         # Componentes do fluxo de agendamento
  appointments/    # Cards e modais de agendamento
  dashboard/       # Componentes do painel administrativo
  layout/          # Navegacao
lib/
  supabase/        # Clientes Supabase (browser + server)
  email/           # Envio de e-mails (Resend)
  hooks/           # React hooks (useUser, useServices, useSlots, etc.)
  validations/     # Schemas Zod
  utils/           # Helpers (cn, formatters)
supabase/
  migrations/      # SQL para criar o banco
types/             # TypeScript types
```

## Deploy (Vercel)

1. Importe o repositorio no [Vercel](https://vercel.com)
2. Configure as variaveis de ambiente (mesmas do `.env.local`)
3. O cron job de lembretes roda automaticamente a cada hora (`vercel.json`)

## Banco de dados

| Tabela | Descricao |
|---|---|
| `profiles` | Dados do usuario (nome, telefone, role) |
| `services` | Servicos da empresa (nome, duracao, preco) |
| `availability_slots` | Horarios disponiveis para agendamento |
| `appointments` | Agendamentos criados pelos clientes |
| `notification_log` | Registro de e-mails enviados |
| `company_settings` | Configuracoes da empresa (singleton) |

## Licenca

MIT
