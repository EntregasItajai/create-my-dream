# Plano Freemium: Calculadoras Gratis + Premium com Login

## Resumo

Transformar o app em um modelo freemium onde:

- **Gratis**: Calculadora de frete e calculadora de custos (funcionam sem login)
- **Premium**: Controle de KM + Monitorar Manutencoes (requer login e liberacao manual)

O pagamento sera via PIX, com liberacao manual do acesso premium por voce (admin).

## O que precisa ser feito

### 1. Conectar Supabase (backend)

O app atualmente e 100% local (localStorage). Para ter login e controle de assinatura, precisamos de um backend. Vou usar o Lovable Cloud (Supabase integrado) para:

- Autenticacao (login com email e Google)
- Tabela de perfis de usuario
- Tabela de roles/assinaturas para controlar quem e premium

### 2. Sistema de Autenticacao

- Pagina de login com email/senha e Google
- Registro de novos usuarios
- Botao de login/logout no header do app

### 3. Controle de Acesso Premium

- Tabela `user_roles` no banco para marcar quem e premium
- Voce (admin) libera o acesso manualmente apos confirmar o PIX
- Os botoes "Controle de KM" e "Monitorar Manutencoes" aparecem com um cadeado para usuarios gratuitos
- Ao clicar no cadeado, aparece uma mensagem explicando como assinar (PIX + contato)

### 4. Fluxo do Usuario

```text
Usuario abre o app
  |
  +-- Calculadoras funcionam normalmente (sem login)
  |
  +-- Clica em "Controle de KM" ou "Monitorar Manutencoes"
       |
       +-- Nao logado? --> Tela de login
       |
       +-- Logado mas nao premium? --> Mensagem "Assine para acessar"
       |                               com instrucoes de PIX
       |
       +-- Logado e premium? --> Abre normalmente
```

### 5. Migracao de Dados

- Os dados que ja existem no localStorage continuam funcionando para as calculadoras
- Quando o usuario logar e for premium, os dados de KM e manutencao podem continuar no localStorage (vinculados ao navegador) -- sem custo extra de banco

## Detalhes Tecnicos

### Banco de Dados (Supabase)

**Tabela `profiles`:**

- `id` (uuid, referencia auth.users)
- `email` (text)
- `display_name` (text, opcional)
- `created_at` (timestamp)

**Tabela `user_roles`:**

- `id` (uuid)
- `user_id` (uuid, referencia auth.users)
- `role` (enum: 'admin', 'premium', 'user')
- RLS policies para seguranca

**Funcao `has_role`:** Security definer para verificar roles sem recursao RLS.

### Novos Arquivos

- `src/pages/Auth.tsx` -- pagina de login/registro
- `src/contexts/AuthContext.tsx` -- contexto de autenticacao
- `src/hooks/useSubscription.ts` -- hook para verificar se usuario e premium
- `src/components/PremiumGate.tsx` -- componente que envolve features premium (mostra cadeado ou conteudo)

### Arquivos Alterados

- `src/pages/Index.tsx` -- integrar verificacao premium nos botoes de KM e manutencao
- `src/components/Header.tsx` -- botao de login/logout e avatar do usuario
- `src/components/FreightCalculator.tsx` -- visual de cadeado nos botoes premium
- `src/App.tsx` -- adicionar rota /auth e AuthProvider

### Prerequisito

Sera necessario ativar o Lovable Cloud (Supabase) no projeto para ter o backend de autenticacao. Para login com Google, voce precisara configurar as credenciais OAuth no Google Cloud Console.  
  
OBS: o plano está bom, mas quero que até o usuário gratuíto faça login, pois quero saber quem e quantas pessoas estão usando o sistema  
preciso tbm que vc gere uma instrução completa das tabelas que precisam ser criadas no supabase para esse sistema que montamos com todas essas autalizações