# Corrigir login Google, senha e acesso ADM

## Diagnóstico confirmado pelas imagens
- O login Google foi concluído: a conta aparece em Authentication com provedor Google e o retorno contém uma sessão válida.
- O retorno está sendo enviado para `http://localhost:3000`, que não existe no computador do usuário. Por isso o navegador mostra “conexão recusada”.
- A conta exibida foi criada somente pelo Google. Ela não possui senha de e-mail cadastrada; por isso tentar entrar com e-mail e uma senha salva pelo navegador retorna `Invalid login credentials`.
- O Painel ADM só reaparecerá depois que essa mesma conta autenticar corretamente e tiver a função `admin` associada ao UID mostrado no cadastro.

## Correção
1. Ajustar a configuração de URLs da autenticação para usar `https://calculadora.motoboy.online` como endereço principal e aceitar os retornos `/` e `/auth`; remover `localhost:3000` da configuração de produção.
2. Manter o retorno do Google na origem real do aplicativo e tratar erros de callback de forma clara, sem deixar o usuário preso na tela de entrada.
3. Melhorar a mensagem de `Invalid login credentials`: para uma conta criada pelo Google, orientar a usar “Entrar com Google”, em vez de sugerir que o aplicativo está indisponível.
4. Adicionar recuperação de senha para contas realmente cadastradas por e-mail, incluindo a tela pública para definir uma nova senha após o link recebido.
5. Confirmar que a conta Google exibida possui a função `admin` em `user_roles`; se não possuir, orientar a associação segura ao UID existente, sem criar outro usuário.
6. Atualizar a identificação de função após o retorno do Google para o ícone do Painel ADM aparecer sem precisar sair e entrar novamente.

## Validação
- Entrar com Google no domínio publicado e confirmar que retorna ao aplicativo, nunca a localhost.
- Confirmar que a sessão permanece após atualizar a página.
- Confirmar que a conta administradora exibe o escudo e abre `/admin`.
- Confirmar que uma conta comum não acessa `/admin`.
- Testar login e recuperação de senha de uma conta criada por e-mail.

## Ajuste necessário no serviço de autenticação
A correção do retorno exige atualizar **Authentication → URL Configuration** no painel já mostrado nas imagens. O código sozinho não consegue substituir um endereço principal incorreto configurado nesse serviço.
