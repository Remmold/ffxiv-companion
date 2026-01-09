import { useState, useEffect, useMemo } from 'react';
import { useFilters } from '../context/FilterContext';

const CURRENCY_TYPES = ['All', 'Orange Scrip', 'Purple Scrip', 'White Scrip', 'Mathematics', 'Poetics'];

const CURRENCY_COLORS = {
    'Orange Scrip': 'text-orange-400',
    'Purple Scrip': 'text-purple-400',
    'White Scrip': 'text-gray-300',
    'Mathematics': 'text-blue-400',
    'Poetics': 'text-indigo-400',
};

const CURRENCY_ICONS = {
    'Orange Scrip': '🟠',
    'Purple Scrip': '🟣',
    'White Scrip': '⚪',
    'Mathematics': '📐',
    'Poetics': '📖',
};

export default function ExchangesPage() {
    const { selectedWorld } = useFilters();
    const [exchanges, setExchanges] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedCurrency, setSelectedCurrency] = useState('All');
    const [sortBy, setSortBy] = useState('gilPerCurrency');
    const [quality, setQuality] = useState('nq'); // 'nq' or 'hq'

    useEffect(() => {
        if (!selectedWorld) return;

        async function fetchExchanges() {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/exchanges/${encodeURIComponent(selectedWorld)}`);
                if (!response.ok) throw new Error('Failed to fetch exchanges');
                const data = await response.json();
                setExchanges(data.exchanges || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }

        fetchExchanges();
    }, [selectedWorld]);

    const formatGil = (amount) => {
        if (!amount) return '—';
        if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
        return amount.toLocaleString();
    };

    // Filter and sort with quality consideration
    const filteredExchanges = useMemo(() => {
        return exchanges
            .filter(e => selectedCurrency === 'All' || e.currencyType === selectedCurrency)
            .sort((a, b) => {
                // Get price based on quality selection
                const getPrice = (item) => {
                    if (quality === 'hq') return item.hqPrice || item.serverPrice || 0;
                    return item.nqPrice || item.serverPrice || 0;
                };

                if (sortBy === 'gilPerCurrency') {
                    // Calculate gil per currency based on quality
                    const aRatio = getPrice(a) / (a.currencyCost || 1);
                    const bRatio = getPrice(b) / (b.currencyCost || 1);
                    return bRatio - aRatio;
                }
                if (sortBy === 'serverPrice') return getPrice(b) - getPrice(a);
                if (sortBy === 'dcPrice') return (b.dcPrice || 0) - (a.dcPrice || 0);
                if (sortBy === 'cost') return a.currencyCost - b.currencyCost;
                return 0;
            });
    }, [exchanges, selectedCurrency, sortBy, quality]);

    return (
        <div className="px-4 py-6 ffxiv-page min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4" style={{ borderBottom: '1px solid rgba(255, 215, 0, 0.2)' }}>
                <div className="flex items-center gap-4">
                    <img src="/exchange.png" alt="Currency Exchanges" className="w-16 h-16 rounded-lg object-cover"
                        style={{ border: '2px solid rgba(255, 215, 0, 0.4)', boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)' }} />
                    <div>
                        <h1 className="text-3xl font-bold mb-1 ffxiv-title">
                            Currency Exchanges
                        </h1>
                        <p className="text-sm text-blue-200" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                            Find the best items to buy with scrips and tomestones for maximum gil profit.
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="ffxiv-panel p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Currency Type */}
                    <div>
                        <label className="block text-xs text-blue-300 font-bold uppercase mb-2">Currency Type</label>
                        <div className="flex gap-2 flex-wrap">
                            {CURRENCY_TYPES.map(type => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedCurrency(type)}
                                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all transition-transform hover:scale-105
                                        ${selectedCurrency === type
                                            ? 'bg-gradient-to-r from-blue-900/80 to-blue-800/80 text-gold border border-gold shadow-[0_0_5px_rgba(255,215,0,0.3)]'
                                            : 'bg-black/40 text-gray-400 border border-transparent hover:bg-blue-900/40 hover:text-white'
                                        }`}
                                >
                                    {type !== 'All' && <span className="mr-1">{CURRENCY_ICONS[type]}</span>} {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sort By */}
                    <div>
                        <label className="block text-xs text-blue-300 font-bold uppercase mb-2">Sort By</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full bg-black/40 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 hover:border-gold/50 focus:border-gold focus:outline-none cursor-pointer transition-colors"
                        >
                            <option value="gilPerCurrency" className="bg-slate-900">Gil per Currency (Profit Ratio)</option>
                            <option value="serverPrice" className="bg-slate-900">Server Price (Total Gil)</option>
                            <option value="dcPrice" className="bg-slate-900">DC Lowest Price</option>
                            <option value="cost" className="bg-slate-900">Currency Cost (Cheapest Item)</option>
                        </select>
                    </div>

                    {/* Quality Toggle */}
                    <div>
                        <label className="block text-xs text-blue-300 font-bold uppercase mb-2">Item Quality Price</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setQuality('nq')}
                                className={`px-4 py-2 rounded text-xs font-bold transition-all flex-1
                                    ${quality === 'nq'
                                        ? 'bg-gray-700/50 text-gray-200 border border-gray-500'
                                        : 'bg-black/40 text-gray-500 border border-transparent hover:bg-gray-800/40'
                                    }`}
                            >
                                Normal Quality (NQ)
                            </button>
                            <button
                                onClick={() => setQuality('hq')}
                                className={`px-4 py-2 rounded text-xs font-bold transition-all flex-1
                                    ${quality === 'hq'
                                        ? 'bg-blue-900/50 text-blue-300 border border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                                        : 'bg-black/40 text-gray-500 border border-transparent hover:bg-blue-900/40'
                                    }`}
                            >
                                ✨ High Quality (HQ)
                            </button>
                        </div>
                    </div>
                </div>
            </div>


            {/* Loading/Error States */}
            {isLoading && (
                <div className="ffxiv-panel p-12 text-center">
                    <div className="animate-spin w-10 h-10 border-4 border-gold border-t-transparent rounded-full mx-auto mb-4 opacity-80"></div>
                    <p className="text-blue-300 animate-pulse">Fetching market prices from universalis...</p>
                </div>
            )}

            {error && (
                <div className="ffxiv-panel p-8 text-center border-red-500/50 bg-red-900/10">
                    <p className="text-red-400 font-bold">Error loading data</p>
                    <p className="text-red-300 text-sm mt-2">{error}</p>
                </div>
            )}

            {!selectedWorld && !isLoading && (
                <div className="ffxiv-panel p-12 text-center text-gray-400 border-dashed border-gray-700">
                    <p className="text-lg">Please select a world to see exchange prices.</p>
                </div>
            )}

            {/* Results */}
            {!isLoading && !error && selectedWorld && (
                <div className="space-y-4">
                    {filteredExchanges.length === 0 ? (
                        <div className="ffxiv-panel p-12 text-center text-gray-500">
                            <p>No exchanges found for the selected filter.</p>
                        </div>
                    ) : (
                        filteredExchanges.map((exchange, idx) => (
                            <div
                                key={`${exchange.itemId}-${idx}`}
                                className="ffxiv-panel p-5 hover:border-gold/50 transition-all hover:bg-white/5 group"
                            >
                                <div className="flex items-center justify-between gap-6">
                                    {/* Left: Item info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-4 mb-1">
                                            <div className="text-4xl filter drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                                {CURRENCY_ICONS[exchange.currencyType]}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-100 truncate group-hover:text-gold transition-colors">
                                                    {exchange.itemName}
                                                </h3>
                                                <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                                                    <span className={`font-medium ${CURRENCY_COLORS[exchange.currencyType]}`}>
                                                        {exchange.currencyType}
                                                    </span>
                                                    <span className="text-gray-600">•</span>
                                                    <span className="text-gray-300">Cost: <span className="text-white font-mono">{exchange.currencyCost}</span></span>
                                                    <span className="text-gray-600">•</span>
                                                    <span className="text-gray-500 italic">{exchange.category}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Prices and ratio */}
                                    <div className="text-right flex-shrink-0">
                                        {exchange.hasPrice ? (
                                            <>
                                                <div className="text-2xl font-bold text-green-400 font-mono tracking-tight drop-shadow-md">
                                                    {formatGil(exchange.serverPrice)} <span className="text-sm font-sans text-gray-500 font-normal">gil</span>
                                                </div>
                                                <div className="text-sm text-blue-300 font-medium mt-1 bg-blue-900/20 px-2 py-0.5 rounded inline-block border border-blue-500/20">
                                                    {exchange.gilPerCurrency.toFixed(1)} gil / {exchange.currencyType.split(' ')[0]}
                                                </div>
                                                {exchange.dcPrice > 0 && exchange.dcWorld && (
                                                    <div className={`text-xs mt-2 ${exchange.dcWorld === selectedWorld ? 'text-green-500' : 'text-gray-500'}`}>
                                                        {exchange.dcWorld === selectedWorld ? (
                                                            <span className="flex items-center justify-end gap-1">✓ Cheapest on DC</span>
                                                        ) : (
                                                            <span>DC Low: {formatGil(exchange.dcPrice)} ({exchange.dcWorld})</span>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-gray-500 text-sm italic">No current listings</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Summary */}
            {!isLoading && filteredExchanges.length > 0 && (
                <div className="mt-8 text-center text-sm text-gray-500 font-mono">
                    Showing {filteredExchanges.length} exchange item{filteredExchanges.length !== 1 ? 's' : ''}
                    {selectedCurrency !== 'All' && ` for ${selectedCurrency}`}
                </div>
            )}
        </div>
    );
}
