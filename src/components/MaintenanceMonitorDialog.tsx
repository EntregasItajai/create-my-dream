import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Wrench, Plus, Trash2, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Clock, List, Settings, RotateCcw, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { VehicleType } from '@/data/maintenanceItems';
import {
  ITENS_PADRAO,
  Troca,
  ItemPadrao,
  ItemStatus,
  loadKmAtual,
  saveKmAtual,
  loadTrocas,
  registrarTroca,
  deleteTroca,
  calcularStatusTodos,
  loadItensPadrao,
  saveItensPadrao,
  resetItensPadrao,
} from '@/data/maintenanceMonitor';
import { toast } from '@/hooks/use-toast';

interface MaintenanceMonitorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleType: VehicleType;
}

const formatKm = (v: number) => v.toLocaleString('pt-BR');
const formatCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatInputDisplay = (raw: string): string => {
  const num = raw.replace(/\D/g, '');
  if (!num) return '';
  return parseInt(num, 10).toLocaleString('pt-BR');
};

const handleKmInput = (value: string, setter: (v: string) => void) => {
  setter(value.replace(/\D/g, ''));
};

const STATUS_CONFIG = {
  vencido: { emoji: '🔴', label: 'VENCIDOS', color: 'text-destructive' },
  proximo: { emoji: '🟡', label: 'PRÓXIMOS (até 1k km)', color: 'text-yellow-500' },
  ok: { emoji: '🟢', label: 'OK', color: 'text-secondary' },
  livre: { emoji: '📋', label: 'LIVRES', color: 'text-muted-foreground' },
} as const;

export const MaintenanceMonitorDialog = ({ isOpen, onClose, vehicleType }: MaintenanceMonitorDialogProps) => {
  const [kmAtualRaw, setKmAtualRaw] = useState('');
  const [view, setView] = useState<'dashboard' | 'register' | 'history' | 'manage'>('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  // Register form state
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [itemLivre, setItemLivre] = useState('');
  const [kmTrocaRaw, setKmTrocaRaw] = useState('');
  const [marca, setMarca] = useState('');
  const [valor, setValor] = useState('');
  const [obs, setObs] = useState('');

  // Manage items state
  const [editableItems, setEditableItems] = useState<ItemPadrao[]>([]);
  const [newItemNome, setNewItemNome] = useState('');
  const [newItemKmRaw, setNewItemKmRaw] = useState('');

  // Expanded status sections
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ vencido: true, proximo: true });

  useEffect(() => {
    if (isOpen) {
      const km = loadKmAtual();
      setKmAtualRaw(km > 0 ? km.toString() : '');
      setView('dashboard');
      setRefreshKey(k => k + 1);
    }
  }, [isOpen, vehicleType]);

  const kmAtual = parseInt(kmAtualRaw, 10) || 0;

  const itensPadrao = useMemo(() => loadItensPadrao(vehicleType), [vehicleType, refreshKey]);

  const statusData = useMemo(
    () => calcularStatusTodos(vehicleType, kmAtual),
    [vehicleType, kmAtual, refreshKey]
  );

  const trocas = useMemo(() => loadTrocas(vehicleType), [vehicleType, refreshKey]);

  const handleSaveKm = () => {
    if (kmAtual > 0) {
      saveKmAtual(kmAtual);
      setRefreshKey(k => k + 1);
      toast({ title: 'KM Atualizado!', description: `${formatKm(kmAtual)} km salvo.` });
    }
  };

  const toggleItem = (nome: string) => {
    setSelectedItems(prev =>
      prev.includes(nome) ? prev.filter(n => n !== nome) : [...prev, nome]
    );
  };

  const handleRegister = () => {
    const kmTroca = parseInt(kmTrocaRaw, 10) || 0;
    if (kmTroca <= 0) {
      toast({ title: 'Erro', description: 'Informe o KM da troca.', variant: 'destructive' });
      return;
    }

    const items: { nome: string; kmIntervalo: number }[] = [];

    // Standard items
    for (const nome of selectedItems) {
      const found = itensPadrao.find(p => p.nome === nome);
      if (found) {
        items.push({ nome: found.nome, kmIntervalo: found.kmIntervalo });
      }
    }

    // Free item
    if (itemLivre.trim()) {
      items.push({ nome: itemLivre.trim(), kmIntervalo: 0 });
    }

    if (items.length === 0) {
      toast({ title: 'Erro', description: 'Selecione pelo menos um item.', variant: 'destructive' });
      return;
    }

    const valorNum = valor ? parseFloat(valor.replace(',', '.')) : undefined;

    for (const item of items) {
      registrarTroca({
        data: format(new Date(), 'yyyy-MM-dd'),
        kmTroca: kmTroca,
        item: item.nome,
        kmIntervalo: item.kmIntervalo,
        marca: marca || undefined,
        valor: valorNum,
        obs: obs || undefined,
      }, vehicleType);
    }

    toast({ title: 'Registrado!', description: `${items.length} troca(s) registrada(s) em ${formatKm(kmTroca)} km.` });
    resetForm();
    setRefreshKey(k => k + 1);
    setView('dashboard');
  };

  const handleDeleteTroca = (id: string) => {
    deleteTroca(id, vehicleType);
    setRefreshKey(k => k + 1);
    toast({ title: 'Removido', description: 'Registro excluído.' });
  };

  const resetForm = () => {
    setSelectedItems([]);
    setItemLivre('');
    setKmTrocaRaw('');
    setMarca('');
    setValor('');
    setObs('');
  };

  // Manage items handlers
  const openManageView = () => {
    setEditableItems([...itensPadrao]);
    setNewItemNome('');
    setNewItemKmRaw('');
    setView('manage');
  };

  const handleEditItemNome = (index: number, nome: string) => {
    setEditableItems(prev => prev.map((item, i) => i === index ? { ...item, nome } : item));
  };

  const handleEditItemKm = (index: number, raw: string) => {
    const clean = raw.replace(/\D/g, '');
    const km = parseInt(clean, 10) || 0;
    setEditableItems(prev => prev.map((item, i) => i === index ? { ...item, kmIntervalo: km } : item));
  };

  const handleDeleteItem = (index: number) => {
    setEditableItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddNewItem = () => {
    if (!newItemNome.trim()) return;
    const km = parseInt(newItemKmRaw.replace(/\D/g, ''), 10) || 0;
    setEditableItems(prev => [...prev, { nome: newItemNome.trim(), kmIntervalo: km }]);
    setNewItemNome('');
    setNewItemKmRaw('');
  };

  const handleSaveItems = () => {
    const valid = editableItems.filter(i => i.nome.trim());
    if (valid.length === 0) {
      toast({ title: 'Erro', description: 'Adicione pelo menos um item.', variant: 'destructive' });
      return;
    }
    saveItensPadrao(valid, vehicleType);
    setRefreshKey(k => k + 1);
    toast({ title: 'Salvo!', description: `${valid.length} itens salvos.` });
    setView('dashboard');
  };

  const handleResetItems = () => {
    resetItensPadrao(vehicleType);
    setEditableItems([...ITENS_PADRAO[vehicleType]]);
    setRefreshKey(k => k + 1);
    toast({ title: 'Restaurado!', description: 'Itens padrão restaurados.' });
  };

  const renderStatusBadge = (status: ItemStatus) => {
    const cfg = STATUS_CONFIG[status.status];
    return (
      <div key={status.item} className="bg-muted/50 rounded-lg p-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">{cfg.emoji} {status.item}</span>
          {status.status === 'vencido' && status.kmFaltam != null && (
            <span className="text-xs font-bold text-destructive">
              ATRASADO {formatKm(Math.abs(status.kmFaltam))} km
            </span>
          )}
          {status.status === 'proximo' && status.kmFaltam != null && (
            <span className="text-xs font-bold text-yellow-500">
              falta {formatKm(status.kmFaltam)} km
            </span>
          )}
          {status.status === 'ok' && status.kmFaltam != null && (
            <span className="text-xs text-muted-foreground">
              falta {formatKm(status.kmFaltam)} km
            </span>
          )}
        </div>
        {status.ultimaTroca && (
          <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
            <div>Última: {formatKm(status.ultimaTroca.kmTroca)} km ({format(new Date(status.ultimaTroca.data + 'T00:00:00'), 'dd/MM/yy')})</div>
            {status.kmProxima && <div>Próxima: {formatKm(status.kmProxima)} km</div>}
            {status.ultimaTroca.marca && <div>Marca: {status.ultimaTroca.marca}{status.ultimaTroca.valor ? ` ${formatCurrency(status.ultimaTroca.valor)}` : ''}</div>}
          </div>
        )}
        {!status.ultimaTroca && status.status === 'vencido' && (
          <div className="text-xs text-destructive mt-1">Nunca registrado</div>
        )}
      </div>
    );
  };

  const renderDashboard = () => {
    const groups = [
      { key: 'vencido', items: statusData.vencidos },
      { key: 'proximo', items: statusData.proximos },
      { key: 'ok', items: statusData.ok },
      { key: 'livre', items: statusData.livres },
    ] as const;

    return (
      <>
        {/* KM Atual */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="text-[10px] text-primary font-bold uppercase block mb-1">KM Atual</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={formatInputDisplay(kmAtualRaw)}
              onChange={(e) => handleKmInput(e.target.value, setKmAtualRaw)}
              className="w-full bg-input border border-border text-foreground text-center text-lg font-bold rounded-lg py-2 px-2 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
            />
          </div>
          <Button size="sm" className="mt-5" onClick={handleSaveKm}>ATUALIZAR</Button>
        </div>

        {/* Status summary */}
        {kmAtual > 0 && (
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
            <div className="bg-destructive/10 rounded-lg p-2">
              <div className="text-destructive text-lg">{statusData.vencidos.length}</div>
              <div className="text-destructive">🔴</div>
            </div>
            <div className="bg-yellow-500/10 rounded-lg p-2">
              <div className="text-yellow-500 text-lg">{statusData.proximos.length}</div>
              <div className="text-yellow-500">🟡</div>
            </div>
            <div className="bg-secondary/10 rounded-lg p-2">
              <div className="text-secondary text-lg">{statusData.ok.length}</div>
              <div className="text-secondary">🟢</div>
            </div>
            <div className="bg-muted rounded-lg p-2">
              <div className="text-muted-foreground text-lg">{statusData.livres.length}</div>
              <div className="text-muted-foreground">📋</div>
            </div>
          </div>
        )}

        {/* Expandable lists */}
        {kmAtual > 0 && (
          <ScrollArea className="flex-1 min-h-0 max-h-[35vh]">
            <div className="space-y-2">
              {groups.map(({ key, items }) => {
                if (items.length === 0) return null;
                const cfg = STATUS_CONFIG[key];
                return (
                  <Collapsible
                    key={key}
                    open={expanded[key] ?? false}
                    onOpenChange={(open) => setExpanded(prev => ({ ...prev, [key]: open }))}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full bg-muted/30 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-muted/50 transition-colors">
                      <span className={cfg.color}>
                        {cfg.emoji} {items.length} {cfg.label}
                      </span>
                      {expanded[key] ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 mt-1">
                      {items.map(renderStatusBadge)}
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button className="flex-1 gap-2" onClick={() => setView('register')}>
            <Plus className="w-4 h-4" /> REGISTRAR TROCA
          </Button>
          <Button variant="outline" className="flex-1 gap-2" onClick={() => setView('history')}>
            <List className="w-4 h-4" /> HISTÓRICO
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground" onClick={openManageView}>
          <Settings className="w-3.5 h-3.5" /> Gerenciar Itens
        </Button>
      </>
    );
  };

  const renderRegister = () => {
    return (
      <ScrollArea className="flex-1 min-h-0 max-h-[60vh]">
        <div className="space-y-3 px-1">
        {/* KM da Troca */}
        <div>
          <label className="text-[10px] text-primary font-bold uppercase block mb-1">KM da Troca</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Ex: 70.000"
            value={formatInputDisplay(kmTrocaRaw)}
            onChange={(e) => handleKmInput(e.target.value, setKmTrocaRaw)}
            className="w-full bg-input border border-border text-foreground text-center text-lg font-bold rounded-lg py-2 px-2 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-primary font-bold uppercase block mb-1">Itens ({itensPadrao.length})</label>
            {itensPadrao.map(item => {
              const itemStatus = statusData.todos.find(s => s.item === item.nome);
              const isVencido = itemStatus?.status === 'vencido';
              const isProximo = itemStatus?.status === 'proximo';
              const checked = selectedItems.includes(item.nome);
              return (
                <label
                  key={item.nome}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors text-sm ${
                    checked ? 'bg-primary/10 border border-primary/30' : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleItem(item.nome)}
                    className="accent-primary w-4 h-4"
                  />
                  <span className="flex-1 font-medium text-foreground">
                    {item.nome}
                    <span className="text-muted-foreground text-xs ml-1">
                      [{item.kmIntervalo > 0 ? `${formatKm(item.kmIntervalo)} km` : 'livre'}]
                    </span>
                  </span>
                  {isVencido && <span className="text-xs font-bold text-destructive">VENCIDO!</span>}
                  {isProximo && <span className="text-xs font-bold text-yellow-500">PRÓXIMO</span>}
                </label>
              );
            })}

            {/* Item livre */}
            <div className="mt-3">
              <label className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">+ Item Avulso</label>
              <input
                type="text"
                placeholder="Ex: Lâmpada farol"
                value={itemLivre}
                onChange={(e) => setItemLivre(e.target.value)}
                className="w-full bg-input border border-border text-foreground text-sm rounded-lg py-2 px-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
              />
            </div>
          </div>

        {/* Extra fields */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-muted-foreground font-medium uppercase block mb-1">Marca</label>
            <input
              type="text"
              placeholder="Ex: Pirelli"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              className="w-full bg-input border border-border text-foreground text-sm rounded-lg py-2 px-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground font-medium uppercase block mb-1">Valor R$</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full bg-input border border-border text-foreground text-sm rounded-lg py-2 px-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground font-medium uppercase block mb-1">Obs</label>
          <input
            type="text"
            placeholder="Observação (opcional)"
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            className="w-full bg-input border border-border text-foreground text-sm rounded-lg py-2 px-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => { resetForm(); setView('dashboard'); }}>Voltar</Button>
          <Button className="flex-1" onClick={handleRegister}>SALVAR</Button>
        </div>
        </div>
      </ScrollArea>
    );
  };

  const renderManage = () => {
    return (
      <>
        <div className="flex items-center justify-between">
          <label className="text-[10px] text-primary font-bold uppercase">Editar Itens ({editableItems.length})</label>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground" onClick={handleResetItems}>
            <RotateCcw className="w-3 h-3" /> Restaurar Padrão
          </Button>
        </div>

        <ScrollArea className="max-h-[45vh]">
          <div className="space-y-2 px-1">
            {editableItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2 bg-muted/30 rounded-lg p-2">
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={item.nome}
                    onChange={(e) => handleEditItemNome(index, e.target.value)}
                    className="w-full bg-input border border-border text-foreground text-sm rounded py-1 px-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    placeholder="Nome do item"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">KM intervalo:</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={item.kmIntervalo > 0 ? formatKm(item.kmIntervalo) : '0'}
                      onChange={(e) => handleEditItemKm(index, e.target.value)}
                      className="w-24 bg-input border border-border text-foreground text-sm text-center rounded py-1 px-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                      placeholder="0 = livre"
                    />
                    <span className="text-[10px] text-muted-foreground">km</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteItem(index)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}

            {/* Add new item */}
            <div className="border-2 border-dashed border-border rounded-lg p-2 space-y-1">
              <label className="text-[10px] text-primary font-bold uppercase block">+ Novo Item</label>
              <input
                type="text"
                value={newItemNome}
                onChange={(e) => setNewItemNome(e.target.value)}
                placeholder="Nome do item"
                className="w-full bg-input border border-border text-foreground text-sm rounded py-1 px-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground"
              />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatInputDisplay(newItemKmRaw)}
                  onChange={(e) => handleKmInput(e.target.value, setNewItemKmRaw)}
                  placeholder="KM intervalo (0 = livre)"
                  className="flex-1 bg-input border border-border text-foreground text-sm rounded py-1 px-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground"
                />
                <Button size="sm" className="h-7" onClick={handleAddNewItem} disabled={!newItemNome.trim()}>
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setView('dashboard')}>Cancelar</Button>
          <Button className="flex-1" onClick={handleSaveItems}>SALVAR ITENS</Button>
        </div>
      </>
    );
  };

  const renderHistory = () => {
    const sorted = [...trocas].sort((a, b) => b.kmTroca - a.kmTroca);
    return (
      <>
        <ScrollArea className="flex-1 min-h-0 max-h-[50vh]">
          {sorted.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">Nenhuma troca registrada.</p>
          ) : (
            <div className="space-y-2 px-1">
              {sorted.map(t => (
                <div key={t.id} className="flex items-start gap-3 bg-muted/50 rounded-lg p-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground">{t.item}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(t.data + 'T00:00:00'), 'dd/MM/yyyy')} · {formatKm(t.kmTroca)} km
                    </div>
                    {t.kmProxima && (
                      <div className="text-xs text-primary">Próxima: {formatKm(t.kmProxima)} km</div>
                    )}
                    {t.marca && <div className="text-xs text-muted-foreground">Marca: {t.marca}{t.valor ? ` · ${formatCurrency(t.valor)}` : ''}</div>}
                    {t.obs && <div className="text-xs text-muted-foreground italic">{t.obs}</div>}
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteTroca(t.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <Button variant="outline" className="w-full" onClick={() => setView('dashboard')}>Voltar</Button>
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); resetForm(); } }}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">
            🔧 Monitorar Manutenções — {vehicleType === 'moto' ? '🏍️ Moto' : '🚗 Carro'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-3 min-h-0">
          {view === 'dashboard' && renderDashboard()}
          {view === 'register' && renderRegister()}
          {view === 'history' && renderHistory()}
          {view === 'manage' && renderManage()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
