**🚀 TRANSFORME A CALCULADORA EM APP NACIONAL: MOTO + CARRO UBER/99**

Adicione seletor **"🏍️ Moto | 🚗 Carro"** que troca **TODOS** os defaults (manutenção, consumo, depreciação, docs/IPVA). Serve motoristas moto, Uber carro, entregadores carro, viajantes.

## **🎯 CARRO PADRÃO: HB20/Onix 1.0 (70% Uber Brasil)**

**Consumo real cidade app**: 11 km/l  
**Km/ano padrão**: 30.000  
**Preço/km sugerido**: **R$ 1,40/km** (cobre + 23% margem)

## **📋 ITENS MANUTENÇÃO CARRO (14 itens defaults)**

```
text
```

`1. "Óleo motor sintético (4L)" | R$ 200 | 10.000 km`  
`2. "Filtro óleo" | R$ 50 | 10.000 km`  
`3. "Filtro ar" | R$ 70 | 20.000 km`  
`4. "Filtro combustível" | R$ 90 | 30.000 km`  
`5. "Velas ignição (jogo 4)" | R$ 140 | 30.000 km`  
`6. "Correia dentada + tensor" | R$ 550 | 60.000 km`  
`7. "Pneu dianteiro 185/65R15" | R$ 380 | 35.000 km`  
`8. "Pneu traseiro 185/65R15" | R$ 380 | 35.000 km`  
`9. "Pastilha freio dianteira" | R$ 200 | 25.000 km`  
`10. "Pastilha freio traseira" | R$ 180 | 30.000 km`  
`11. "Fluido freio" | R$ 70 | 30.000 km`  
`12. "Amortecedores dianteiros (par)" | R$ 650 | 50.000 km`  
`13. "Alinhamento + balanceamento" | R$ 140 | 10.000 km`  
`14. "Revisão preventiva completa" | R$ 650 | 10.000 km`  


**Manutenção carro**: **R$ 0,1754/km** (auto)

## **📋 ITENS MOTO (teus dados finais)**

```
text
```

`1. "Óleo motor sintético (1L)" | R$ 115 | 4.000 km`  
`2. "Filtro óleo" | R$ 40 | 4.000 km`  
`3. "Filtro ar" | R$ 80 | 15.000 km`  
`4. "Filtro combustível" | R$ 70 | 20.000 km`  
`5. "Vela ignição" | R$ 60 | 15.000 km`  
`6. "Kit relação (Yamaha)" | R$ 400 | 20.000 km`  
`7. "Pneu dianteiro 80/100-18" | R$ 260 | 18.000 km`  
`8. "Pneu traseiro 100/90-18" | R$ 320 | 18.000 km`  
`9. "Pastilha freio dianteira" | R$ 120 | 15.000 km`  
`10. "Lona freio traseira" | R$ 140 | 20.000 km`  
`11. "Fluido freio" | R$ 80 | 24.000 km`  
`12. "Buchas balança + MO" | R$ 200 | 30.000 km`  
`13. "Rolamentos roda (par)" | R$ 220 | 40.000 km`  
`14. "Revisão preventiva" | R$ 400 | 5.000 km`  


## **⚙️ CONFIGS COMPLETAS POR VEÍCULO**


| **Config**            | **MOTO** | **CARRO** |
| --------------------- | -------- | --------- |
| Gasolina R$/L         | **6,70** | **6,70**  |
| Consumo km/L          | **37**   | **11**    |
| Depreciação R$/km     | **0,05** | **0,18**  |
| Km/ano                | 30.000   | 30.000    |
| Licenciamento/ano     | **150**  | **200**   |
| Seguro/coop/mês       | **90**   | **150**   |
| **IPVA/ano**          | **0**    | **1.600** |
| **Preço/km sugerido** | **0,50** | **1,40**  |
| Valor hora            | 50,00    | 50,00     |
| Valor mínimo          | 15,00    | 25,00     |


## **💰 CUSTOS REAIS CALCULADOS**

**MOTO**: R$ 0,486/km → cobra **0,50** (margem 3%)  
**CARRO**: R$ **1,084/km** → cobra **1,40** (margem 23%)

## **💾 LOCALSTORAGE (separado)**

```
text
```

`entregasItajai_veiculoAtivo ("moto"|"carro")`  
`entregasItajai_itensManutencao_moto`  
`entregasItajai_itensManutencao_carro  `  
`freightSettings_moto`  
`freightSettings_carro`  


## **🎨 INTERFACE**

```
text
```

`HEADER: [🏍️ MOTO] [🚗 CARRO]  ← Toggle ativo destacado`  
  
`CONFIGS TOPO:`  
`┌── Veículo ativo: 🏍️ MOTO ──┐`  
`│ Gasolina: 6,70 │ Consumo: 37 │ etc.`  
`│ [Restaurar defaults MOTO] │ [Restaurar defaults CARRO]`  
`└────────────────────────────────┘`  
  
`MANUTENÇÃO DETALHADA (14 itens do veículo ativo)`  


**Resultado rota**: `"Cálculo 🏍️ MOTO"` ou `"Cálculo 🚗 HB20/ONIX"`

## **🧮 LÓGICA TÉCNICA (Lovable seguir)**

```
typescript
```

`type VehicleType = 'moto' | 'carro';`  
  
`const ITENS_DEFAULTS: Record<VehicleType, Item[]> = {`  
  `moto: [teus 14 itens acima],`  
  `carro: [14 itens carro acima]`  
`};`  
  
`const DEFAULT_SETTINGS: Record<VehicleType, Settings> = {`  
  `moto: { gasolina: 6.7, consumo: 37, depreciacao: 0.05, ... },`  
  `carro: { gasolina: 6.7, consumo: 11, depreciacao: 0.18, ... }`  
`};`  
  
`function loadAll(vehicle: VehicleType) {`  
  `// Carrega itens + settings do veículo ativo do localStorage`  
  `// Persiste separado por veículo`  
`}`  


**Fluxo**:

1. Abre → último veículo (default moto)
2. Troca carro → **recarrega tudo** carro
3. Personaliza → salva **só carro**
4. Volta moto → moto intacta

## **🎯 RESULTADO ESPERADO**

```
text
```

`CARRO 100km: Custo R$ 108,45 | Cobra R$ 140 | Lucro R$ 31,55`  
`MOTO 100km: Custo R$ 48,64  | Cobra R$ 50  | Lucro R$ 1,36`  


**IMPLEMENTE EXATAMENTE ASSIM**. App vira **ferramenta #1 motoristas Brasil**!

---

**Pronto**. Valores **100% realistas** (IPVA SC incluso carro). 