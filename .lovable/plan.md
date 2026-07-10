## Conexão com GitHub

Eu (agente) não conecto o projeto ao GitHub diretamente — essa ação é feita por você pela interface do Lovable, não por comando meu no chat. O que existe são duas coisas diferentes:

### 1. Git Sync (o que você provavelmente quer)
Sincroniza o código do projeto Lovable com um repositório GitHub (two-way sync).

**Como ativar:**
1. No editor Lovable, abra o menu **+** (canto inferior esquerdo do chat)
2. Clique em **GitHub → Connect project**
3. Autorize o app do Lovable no GitHub
4. Escolha a conta/organização
5. Clique em **Create Repository**

Depois disso, tudo que eu alterar aqui vai para o GitHub automaticamente, e commits feitos no GitHub voltam para o Lovable.

### 2. Conector GitHub API (só se precisar chamar a API do GitHub dentro do app)
Serve para o app consumir dados do GitHub em runtime (ex.: listar issues, repos). Isso sim eu configuro via `standard_connectors--connect`, mas **não é o que sincroniza o código do projeto**.

---

### O que preciso confirmar

Me diga qual dos dois você quer:

- **(A)** Sincronizar o código deste projeto com um repositório GitHub (Git Sync) → você mesma faz pelo menu + do editor; eu só te oriento.
- **(B)** Fazer o app ler/gravar dados na API do GitHub em runtime → eu configuro o conector.

Se for (A) e você já tinha um repo conectado antes que parou de sincronizar, me avise que abro um plano específico de troubleshooting.
