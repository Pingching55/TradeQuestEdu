import React, { useState, useRef } from 'react';
import { TradeEntry, TradeResult, TradeType } from '../types';
import { Plus, TrendingUp, TrendingDown, Image as ImageIcon, X } from 'lucide-react';

interface TradeJournalProps {
  entries: TradeEntry[];
  onAddEntry: (entry: TradeEntry) => void;
  onDeleteEntry: (id: string) => void;
}

const TradeJournal: React.FC<TradeJournalProps> = ({ entries, onAddEntry, onDeleteEntry }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTrade, setNewTrade] = useState<Partial<TradeEntry>>({
    type: TradeType.LONG,
    result: TradeResult.WIN
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wins = entries.filter(e => e.result === TradeResult.WIN).length;
  const losses = entries.filter(e => e.result === TradeResult.LOSS).length;
  const winRate = entries.length > 0 ? Math.round((wins / entries.length) * 100) : 0;
  const totalPnL = entries.reduce((acc, curr) => {
    // Determine sign based on WIN/LOSS if PnL is positive in input
    // Assuming user inputs absolute value or correct sign. Let's simplify: 
    // If Result is LOSS, ensure PnL is subtracted.
    const val = Math.abs(curr.pnl);
    return curr.result === TradeResult.WIN ? acc + val : curr.result === TradeResult.LOSS ? acc - val : acc;
  }, 0);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewTrade(prev => ({ ...prev, screenshotUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTrade.pair && newTrade.pnl !== undefined) {
      onAddEntry({
        id: Date.now().toString(),
        entryDate: Date.now(),
        pair: newTrade.pair.toUpperCase(),
        type: newTrade.type as TradeType,
        result: newTrade.result as TradeResult,
        pnl: Math.abs(newTrade.pnl), // Store absolute, handle sign in UI
        notes: newTrade.notes || '',
        screenshotUrl: newTrade.screenshotUrl
      });
      setIsModalOpen(false);
      setNewTrade({ type: TradeType.LONG, result: TradeResult.WIN }); // Reset
    }
  };

  return (
    <div className="pb-24 px-4 pt-6 h-full">
      {/* Stats Header */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-surface p-4 rounded-2xl border border-slate-700">
          <p className="text-slate-400 text-xs uppercase tracking-wider">Win Rate</p>
          <p className={`text-2xl font-bold ${winRate >= 50 ? 'text-win' : 'text-loss'}`}>{winRate}%</p>
        </div>
        <div className="bg-surface p-4 rounded-2xl border border-slate-700">
          <p className="text-slate-400 text-xs uppercase tracking-wider">Net PnL</p>
          <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-win' : 'text-loss'}`}>
            {totalPnL >= 0 ? '+' : '-'}${Math.abs(totalPnL)}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Recent Trades</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-transform active:scale-95"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Trade List */}
      <div className="space-y-4">
        {entries.length === 0 && (
          <div className="text-center py-10 text-slate-500">
            <p>No trades recorded yet.</p>
            <p className="text-sm">Tap + to log your first trade.</p>
          </div>
        )}
        {[...entries].reverse().map((trade) => (
          <div key={trade.id} className="bg-surface border border-slate-700 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden">
            {/* Status Strip */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
              trade.result === TradeResult.WIN ? 'bg-win' : trade.result === TradeResult.LOSS ? 'bg-loss' : 'bg-slate-500'
            }`}></div>
            
            <div className="flex justify-between items-center pl-2">
              <div>
                <h3 className="font-bold text-lg text-white">{trade.pair}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className={`font-bold ${trade.type === TradeType.LONG ? 'text-win' : 'text-loss'}`}>
                    {trade.type}
                  </span>
                  <span>•</span>
                  <span>{new Date(trade.entryDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-lg ${
                   trade.result === TradeResult.WIN ? 'text-win' : trade.result === TradeResult.LOSS ? 'text-loss' : 'text-slate-400'
                }`}>
                  {trade.result === TradeResult.WIN ? '+' : trade.result === TradeResult.LOSS ? '-' : ''}${trade.pnl}
                </p>
                <p className="text-[10px] uppercase font-bold text-slate-500">{trade.result}</p>
              </div>
            </div>

            {trade.notes && (
              <p className="text-sm text-slate-300 bg-slate-800/50 p-2 rounded-lg pl-3 border-l-2 border-slate-600 italic">
                "{trade.notes}"
              </p>
            )}

            {trade.screenshotUrl && (
              <div className="mt-2 rounded-lg overflow-hidden h-32 w-full relative">
                <img src={trade.screenshotUrl} alt="Chart" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
              </div>
            )}
            
            <button 
                onClick={() => onDeleteEntry(trade.id)}
                className="self-end text-xs text-slate-500 hover:text-loss mt-2"
            >
                Delete Entry
            </button>
          </div>
        ))}
      </div>

      {/* Add Trade Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface w-full max-w-md rounded-3xl p-6 border border-slate-700 shadow-2xl relative animate-slide-up">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold text-white mb-6">Log New Trade</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Pair</label>
                  <input 
                    type="text" 
                    placeholder="EURUSD" 
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary uppercase"
                    value={newTrade.pair || ''}
                    onChange={e => setNewTrade({...newTrade, pair: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">PnL ($)</label>
                  <input 
                    type="number" 
                    placeholder="100" 
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                    value={newTrade.pnl || ''}
                    onChange={e => setNewTrade({...newTrade, pnl: Number(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-700">
                  <button
                    type="button"
                    className={`flex-1 rounded-lg text-sm font-bold py-2 transition-colors ${newTrade.type === TradeType.LONG ? 'bg-win text-white' : 'text-slate-400'}`}
                    onClick={() => setNewTrade({...newTrade, type: TradeType.LONG})}
                  >
                    Long
                  </button>
                  <button
                    type="button"
                    className={`flex-1 rounded-lg text-sm font-bold py-2 transition-colors ${newTrade.type === TradeType.SHORT ? 'bg-loss text-white' : 'text-slate-400'}`}
                    onClick={() => setNewTrade({...newTrade, type: TradeType.SHORT})}
                  >
                    Short
                  </button>
                </div>
                
                <select 
                  className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-sm focus:outline-none focus:border-primary"
                  value={newTrade.result}
                  onChange={e => setNewTrade({...newTrade, result: e.target.value as TradeResult})}
                >
                  <option value={TradeResult.WIN}>Win</option>
                  <option value={TradeResult.LOSS}>Loss</option>
                  <option value={TradeResult.BE}>Break Even</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Notes</label>
                <textarea 
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-primary resize-none"
                  placeholder="Why did you take this trade?"
                  value={newTrade.notes || ''}
                  onChange={e => setNewTrade({...newTrade, notes: e.target.value})}
                ></textarea>
              </div>

              <div>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload}
                  className="hidden" 
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-600 rounded-xl p-3 text-slate-400 hover:text-white hover:border-slate-400 transition-colors"
                >
                  <ImageIcon size={18} />
                  <span className="text-sm">{newTrade.screenshotUrl ? 'Image Added' : 'Upload Chart Screenshot'}</span>
                </button>
              </div>

              <button 
                type="submit" 
                className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg mt-4 transition-colors"
              >
                Save Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeJournal;