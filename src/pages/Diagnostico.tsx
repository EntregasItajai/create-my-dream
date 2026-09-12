import { useMemo, useState } from 'react';

const PREFIXOS = ['entregasItajai', 'freightSettings'];
const TROCAS: Record<string, string> = {
  moto: 'entregasItajai_trocas_moto',
  carro: 'entregasItajai_trocas_carro',
};

interface TrocaBruta {
  item?: string;
  kmTroca?: number;
  data?: string;
  marca?: string;
}

const lerJson = (chave: string): unknown => {
  try {
    return JSON.parse(localStorage.getItem(chave) ?? '');
  } catch {
    return localStorage.getItem(chave);
  }
};

const Diagnostico = () => {
  const [copiado, setCopiado] = useState(false);
  const [verBruto, setVerBruto] = useState(false);

  const chaves = useMemo(
    () => Object.keys(localStorage).filter((k) => PREFIXOS.some((p) => k.startsWith(p))).sort(),
    []
  );

  const pacote = useMemo(
    () => JSON.stringify(Object.fromEntries(chaves.map((k) => [k, localStorage.getItem(k)])), null, 1),
    [chaves]
  );

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(pacote);
      setCopiado(true);
    } catch {
      setVerBruto(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-lg mx-auto space-y-4">
        <div>
          <h1 className="text-xl font-bold text-secondary">Diagnóstico de dados</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Mostra o que está guardado <strong>neste aparelho, neste navegador</strong>. Nada é
            apagado nem enviado.
          </p>
        </div>

        {Object.entries(TROCAS).map(([veiculo, chave]) => {
          const bruto = localStorage.getItem(chave);
          const lista = bruto ? lerJson(chave) : null;
          const registros = Array.isArray(lista) ? (lista as TrocaBruta[]) : [];

          return (
            <div key={veiculo} className="bg-card border border-border rounded-xl p-4">
              <h2 className="text-xs uppercase tracking-wider text-primary font-bold mb-3">
                Manutenções — {veiculo}
              </h2>

              {registros.length > 0 ? (
                <>
                  <p className="text-secondary font-bold mb-2">
                    {registros.length} registro(s) encontrado(s)
                  </p>
                  <div className="space-y-1">
                    {registros.map((t, i) => (
                      <div key={i} className="text-sm border-b border-border py-1.5">
                        <span className="font-semibold">{t.item || '?'}</span>
                        <span className="text-muted-foreground">
                          {' '}
                          — KM {t.kmTroca != null ? t.kmTroca.toLocaleString('pt-BR') : '?'}
                          {t.data ? ` · ${t.data}` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-yellow-500 font-bold text-sm">
                  {bruto === null ? 'Chave não existe neste aparelho' : 'Existe, mas está vazia'}
                </p>
              )}
            </div>
          );
        })}

        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-xs uppercase tracking-wider text-primary font-bold mb-3">
            Tudo que existe aqui
          </h2>
          {chaves.length > 0 ? (
            <table className="w-full text-sm">
              <tbody>
                {chaves.map((k) => {
                  const v = lerJson(k);
                  return (
                    <tr key={k} className="border-b border-border">
                      <td className="py-1.5 pr-2 text-muted-foreground break-all text-xs">{k}</td>
                      <td className="py-1.5 text-right font-bold whitespace-nowrap">
                        {Array.isArray(v)
                          ? `${v.length} reg.`
                          : `${(localStorage.getItem(k) ?? '').length} car.`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-yellow-500 font-bold text-sm">
              Nenhum dado do app neste navegador.
            </p>
          )}
        </div>

        <button
          onClick={copiar}
          className="w-full py-4 rounded-xl bg-secondary text-secondary-foreground font-bold"
        >
          {copiado ? 'Copiado!' : 'Copiar tudo para enviar'}
        </button>

        <button
          onClick={() => setVerBruto((v) => !v)}
          className="w-full py-3 rounded-xl bg-muted text-foreground font-bold text-sm"
        >
          {verBruto ? 'Ocultar' : 'Mostrar'} conteúdo bruto
        </button>

        {verBruto && (
          <textarea
            readOnly
            value={pacote}
            onFocus={(e) => e.currentTarget.select()}
            className="w-full h-48 bg-input border border-border rounded-lg p-3 text-xs font-mono"
          />
        )}
      </div>
    </div>
  );
};

export default Diagnostico;
