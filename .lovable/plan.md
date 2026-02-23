## Substituir rodape Instagram por area de banners

### O que muda

- Remover o componente `TextBanner` (Instagram) do rodape
- No lugar, criar uma area com **5 banners de anuncio**:
  - **3 banners grandes** empilhados (largura total, ~728x90 cada)
  - **2 banners pequenos** lado a lado (cada um ~50% da largura)
- Buscar banners da posicao `footer` na tabela do Supabase
- Se nao houver banners cadastrados, exibir os placeholders "Anuncie Aqui" com link pro WhatsApp

### Layout final do rodape (dentro do `<main>`)

```text
+-------------------------------+
|      Banner Grande 1          |
+-------------------------------+
|      Banner Grande 2          |
+-------------------------------+
|      Banner Grande 3          |
+-------------------------------+
| Banner Peq 1 | Banner Peq 2  |
+-------------------------------+
```

### Detalhes tecnicos

**Arquivo: `src/pages/Index.tsx**`

- Remover o import de `TextBanner`
- Substituir o bloco do banner horizontal + `TextBanner` por:
  - 3x `AdBanner` com largura total (width=728, height=90)
  - 1 `div` com `flex` e `gap` contendo 2x `AdBanner` menores (width=350, height=150)
- Usar `footerBanners` (posicao `footer`) para preencher os 5 slots; slots sem banner mostram placeholder

**Arquivo: `src/components/TextBanner.tsx**`

- Nenhuma alteracao (pode ser removido depois se nao for usado em outro lugar)

**Nenhuma alteracao** no `AdBanner.tsx` -- o componente ja suporta qualquer dimensao e fallback.  
E lá no topo onde tem "Entregas Itajaí" Calculadora de rota , trque o Calculadora de rota por "Visite nosso instagram' com o mesmo link do visite nosso instagram que está sendo retirado do rodapé