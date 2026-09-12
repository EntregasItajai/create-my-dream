# Recuperar login e Painel ADM

## Objetivo
Restaurar o acesso ao aplicativo por e-mail/senha e Google, e garantir que a conta administradora volte a enxergar o atalho e acessar o Painel ADM.

## Diagnóstico confirmado
- O app está com três erros de compilação em `useMaintenanceStatus`: a função de status recebe parâmetros incompatíveis e o resultado é consultado com nomes incorretos (`vencido`/`proximo` em vez de `vencidos`/`proximos`). Isso impede o carregamento normal da aplicação, incluindo a tela de login.
- O provedor Google responde e redireciona para o Google, portanto ele está habilitado no serviço de autenticação.
- A rota `/admin` e o painel continuam no código. O atalho só aparece quando a consulta de cargos encontra a função `admin` para o usuário autenticado.
- A chave pública configurada no app atualmente é diferente da chave pública enviada anteriormente; será necessário garantir que URL, chave e credenciais Google pertençam ao mesmo projeto.

## Implementação
1. Corrigir o indicador de manutenção para primeiro carregar itens e trocas do usuário, calcular o status com os dados corretos e usar as propriedades plurais retornadas.
2. Fortalecer o estado de autenticação para validar o usuário atual, tratar falhas e concluir corretamente o retorno do Google.
3. Preservar o destino após autenticação e retornar o usuário ao aplicativo ou ao Painel ADM, conforme a origem.
4. Ajustar a consulta de cargos para atualizar após o login e distinguir claramente: conta autenticada sem cargo admin, falha de permissão e cargo admin confirmado.
5. Confirmar que o atalho do Painel ADM reaparece para a conta administradora e que `/admin` continua bloqueado para usuários comuns.
6. Remover da tela de login textos antigos sobre “Premium”, pois o aplicativo atual é gratuito com cadastro obrigatório.

## Validação
- Confirmar compilação sem erros.
- Testar cadastro/login por e-mail e senha.
- Testar o redirecionamento Google até o retorno autenticado ao app.
- Testar conta Admin: ícone visível e acesso a `/admin`.
- Testar usuário comum: calculadora disponível após login e Painel ADM indisponível.
- Testar usuário desconectado: qualquer uso da calculadora direciona para login.

## Dependência externa
As credenciais Google já foram informadas como segredos. Se o teste retornar erro de URL autorizada, será necessário conferir no Google Cloud se o URI autorizado é exatamente `https://etkfbliwhmqwfczghknh.supabase.co/auth/v1/callback`.
