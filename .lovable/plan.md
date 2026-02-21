
## Controle Diario de Quilometragem

Adicionar uma funcionalidade de registro diario de quilometragem, onde o usuario pode anotar a km rodada por dia e acompanhar um historico mensal.

### Como vai funcionar

- Um botao **"Controle de KM"** (com icone de clipboard/lista) aparece abaixo dos botoes de calculo
- Ao clicar, abre um **Dialog** (modal) com:
  - Lista de registros do mes atual
  - Botao para adicionar novo registro
  - Totalizador do mes (km total rodada e custo total estimado)

### Formulario de novo registro

Cada registro tera 4 campos:
- **Data** -- pre-preenchida com a data de hoje
- **KM Inicial** -- opcional
- **KM Final** -- opcional
- **KM Rodado** -- calculado automaticamente se inicial e final forem preenchidos, ou digitado manualmente

Logica de preenchimento automatico:
- Se o usuario preencher KM Inicial e KM Final, o KM Rodado e calculado automaticamente (final - inicial)
- Se o usuario preencher apenas KM Rodado, funciona normalmente sem os outros campos
- Pelo menos o KM Rodado deve ter valor > 0 para salvar

### Tela do historico

- Lista os registros do mes ordenados por data
- Cada linha mostra: data, km inicial (se houver), km final (se houver), km rodado, custo estimado
- No rodape: totais do mes (km total e custo total)
- Seletor de mes/ano para navegar entre meses
- Botao para excluir registros individuais

### Armazenamento

- Os registros serao salvos no `localStorage` separados por veiculo
- Chave: `entregasItajai_controleKm_moto` e `entregasItajai_controleKm_carro`
- Cada registro: `{ id, data, kmInicial?, kmFinal?, kmRodado, custoEstimado }`
- O custo estimado e calculado no momento do registro usando os custos atuais (combustivel + manutencao + depreciacao)

---

### Detalhes tecnicos

**1. Novo componente `src/components/KmControlDialog.tsx`**
- Dialog (modal) com o formulario de registro e a lista de historico
- Props: `isOpen`, `onClose`, `vehicleType`, `settings` (para calcular custos)
- Usa o componente Dialog do shadcn/ui
- Formulario com inputs para data, km inicial, km final, km rodado
- useEffect para auto-calcular km rodado quando inicial e final mudam
- Lista de registros com scroll

**2. Novo arquivo `src/data/kmControl.ts`**
- Interface `KmRecord` com os campos do registro
- Funcoes para CRUD no localStorage: `loadKmRecords`, `saveKmRecord`, `deleteKmRecord`
- Funcao para calcular custo estimado de um registro dado os settings

**3. Atualizar `src/components/FreightCalculator.tsx`**
- Adicionar botao "CONTROLE DE KM" abaixo do botao "CALCULAR VALOR"
- Novo prop `onOpenKmControl`

**4. Atualizar `src/pages/Index.tsx`**
- Estado para controlar abertura do dialog de controle
- Renderizar o `KmControlDialog`
- Passar settings e vehicleType para o dialog

**Arquivos criados:**
- `src/components/KmControlDialog.tsx`
- `src/data/kmControl.ts`

**Arquivos alterados:**
- `src/components/FreightCalculator.tsx` -- novo botao
- `src/pages/Index.tsx` -- estado e renderizacao do dialog
