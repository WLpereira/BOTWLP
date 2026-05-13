# BOTWLP - SaaS Privado WhatsApp (Sem Cadastro Publico)

Projeto estruturado para operar como SaaS fechado:

- Sem tela de cadastro publico.
- Sem API publica de registro.
- Apenas ADMIN MASTER cria usuarios.
- Cliente entra somente com credenciais criadas pelo admin.

## Stack

- Next.js 16 (App Router)
- Supabase Auth + Postgres + RLS
- API routes privadas para gestao administrativa

## Fluxo implementado

1. ADMIN MASTER faz login.
2. ADMIN cria usuario cliente.
3. Sistema gera senha temporaria.
4. Cliente recebe acesso (email + senha temporaria).
5. Cliente faz login.
6. Sistema obriga troca de senha no primeiro acesso.
7. Cliente usa plataforma e conecta WhatsApp via QR Code (ponto de integracao pronto).

## Estrutura principal

- `src/app/login` - login (sem cadastro)
- `src/app/change-password` - troca obrigatoria de senha
- `src/app/admin` - dashboard e gestao completa
- `src/app/client` - painel cliente
- `src/app/api/admin/users` - criar/editar/excluir/reset/bloquear usuario
- `src/app/api/admin/plans` - gestao de planos
- `src/middleware.ts` - protecao de rotas
- `supabase/schema.sql` - schema + RLS

## Configuracao Supabase (passo a passo)

1. No Supabase Dashboard, abra `Authentication > Providers > Email`.
2. Desative `Enable email signups` para impedir cadastro publico.
3. Em `SQL Editor`, execute o conteudo de `supabase/schema.sql`.
4. Em `Project Settings > API`, copie:
	- `Project URL`
	- `anon public key`
	- `service_role key`
5. Copie `.env.example` para `.env.local` e preencha as variaveis.

Exemplo de conexao que voce enviou:

`postgresql://postgres.okptydeqazovijnxfmgx:[YOUR-PASSWORD]@aws-1-us-west-1.pooler.supabase.com:6543/postgres`

Obs: essa string e para conexao SQL direta. O app usa principalmente as chaves de API do Supabase.

## Criar primeiro ADMIN MASTER

1. No Supabase Dashboard, crie um usuario em `Authentication > Users` (email/senha).
2. Pegue o `id` desse usuario.
3. Rode no SQL Editor:

```sql
insert into public.users (id, name, email, role, active, must_change_password)
values (
  'UUID_DO_USUARIO_AUTH',
  'Admin Master',
  'admin@seudominio.com',
  'ADMIN_MASTER',
  true,
  false
)
on conflict (id) do update
set role = 'ADMIN_MASTER', active = true, must_change_password = false;
```

## Rodar local

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Deploy no Render

1. Suba este projeto para GitHub.
2. No Render, crie `New > Web Service` apontando para o repo.
3. Configure:
	- Build Command: `npm install && npm run build`
	- Start Command: `npm run start`
4. Adicione env vars:
	- `NEXT_PUBLIC_SUPABASE_URL`
	- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
	- `SUPABASE_SERVICE_ROLE_KEY`
5. Deploy.

Arquivo `render.yaml` ja incluso como referencia.

## Observacoes de seguranca

- `SUPABASE_SERVICE_ROLE_KEY` nunca deve ir para o frontend.
- APIs administrativas validam role `ADMIN_MASTER` no servidor.
- RLS protege acesso por usuario e por role.
- Usuarios bloqueados (`active = false`) nao acessam.
