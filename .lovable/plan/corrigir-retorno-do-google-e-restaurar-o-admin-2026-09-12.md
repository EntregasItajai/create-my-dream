# Corrigir retorno do Google e restaurar o Admin

## Objetivo
Fazer o login Google retornar para `https://calculadora.motoboy.online`, manter a sessão ativa e liberar o Painel Admin quando a conta tiver a função `admin`.

## Situação confirmada
- O aplicativo usa o endereço atual do navegador ao iniciar o login Google; não existe `localhost:3000` no código atual.
- A imagem mostra que, após a autenticação, o serviço de login está usando `http://localhost:3000` como destino alternativo.
- A rota `/admin` e a verificação da função `admin` continuam presentes no aplicativo.

## Alterações
1. Centralizar os endereços de retorno de login, cadastro e recuperação de senha, usando o domínio publicado quando o app estiver em produção.
2. Tratar o retorno do Google antes do redirecionamento interno, preservando o destino solicitado — inclusive `/admin`.
3. Exibir uma mensagem clara caso o serviço devolva um erro de callback, em vez de deixar o usuário preso na tela de login.
4. Manter a leitura atualizada da função do usuário após `SIGNED_IN` e `TOKEN_REFRESHED`, garantindo que o atalho e a página Admin apareçam após o login.
5. Validar em navegador limpo: início do Google, retorno ao domínio publicado, sessão persistente e proteção da página Admin.

## Configuração obrigatória no serviço de autenticação
A configuração externa também precisa ficar assim; o aplicativo não consegue alterá-la sozinho:

- **Site URL:** `https://calculadora.motoboy.online`
- **Redirect URLs:**
  - `https://calculadora.motoboy.online/**`
  - `https://id-preview--b4dd67c4-9c07-4309-939b-c0df22bb377c.lovable.app/**` (somente para testes no preview)
- Remover `http://localhost:3000` das URLs autorizadas.
- No Google Cloud, manter como URI autorizado do cliente OAuth: `https://etkfbliwhmqwfczghknh.supabase.co/auth/v1/callback`.

## Limite
O código pode impedir destinos incorretos e tratar o retorno, mas a remoção de `localhost:3000` deve ser feita no painel de autenticação pelo proprietário do projeto.
