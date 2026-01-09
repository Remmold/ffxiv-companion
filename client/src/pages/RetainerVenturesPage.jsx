import { useState, useEffect, useCallback, useMemo } from 'react';
import WorldSelector from '../components/WorldSelector';
import { useFilters } from '../context/FilterContext';
import { expansions } from '../data/ffxivData';

// Category icons
const CATEGORY_ICONS = {
    'Hide': '🦎',
    'Fur': '🐻',
    'Bone': '🦴',
    'Fang': '🦷',
    'Wing': '🦇',
    'Sinew': '💪',
    'Horn': '🦏',
    'Shell': '🐚',
    'Whisker': '🐱',
    'Reagent': '⚗️',
    'Leaf': '🍃',
    'Flesh': '🥩',
    'Crystal': '💎',
    'Scale': '🐉',
    'Fleece': '🐑',
    'Leather': '👜'
};

// Expansion level ranges
const EXPANSION_LEVELS = {
    'All': { min: 1, max: 100 },
    'ARR': { min: 1, max: 50 },
    'HW': { min: 51, max: 60 },
    'SB': { min: 61, max: 70 },
    'ShB': { min: 71, max: 80 },
    'EW': { min: 81, max: 90 },
    'DT': { min: 91, max: 100 }
};

const formatGil = (amount) => {
    if (!amount && amount !== 0) return '—';
    if (amount === 0) return '—';
    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
        return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toLocaleString();
};

export default function RetainerVenturesPage() {
    const { selectedWorld, setSelectedWorld } = useFilters();
    const [selectedExpansion, setSelectedExpansion] = useState('All');
    const [ventures, setVentures] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [priceSort, setPriceSort] = useState('server'); // 'server' or 'dc'
    const [quality, setQuality] = useState('nq'); // 'nq', 'hq', or 'best'

    const fetchVentures = useCallback(async () => {
        if (!selectedWorld) {
            setVentures([]);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const { min, max } = EXPANSION_LEVELS[selectedExpansion] || { min: 1, max: 100 };
            const params = new URLSearchParams({
                minLevel: min.toString(),
                maxLevel: max.toString()
            });

            const response = await fetch(`/api/retainers/${encodeURIComponent(selectedWorld)}/ventures?${params}`);
            if (!response.ok) throw new Error('Failed to fetch ventures');

            const data = await response.json();
            setVentures(data.ventures || []);
            setLastUpdate(new Date());
        } catch (err) {
            setError(err.message);
            setVentures([]);
        } finally {
            setIsLoading(false);
        }
    }, [selectedWorld, selectedExpansion]);

    useEffect(() => {
        fetchVentures();
    }, [fetchVentures]);

    // Sort ventures based on selected price type and quality
    const sortedVentures = useMemo(() => {
        return [...ventures].sort((a, b) => {
            // Get price based on quality selection
            const getPrice = (v) => {
                if (quality === 'hq') return v.hqTotal || v.nqTotal || 0;
                if (quality === 'nq') return v.nqTotal || v.hqTotal || 0;
                // 'best' - use highest available
                return Math.max(v.nqTotal || 0, v.hqTotal || 0);
            };

            if (priceSort === 'dc') {
                return (b.dcTotalValue || 0) - (a.dcTotalValue || 0);
            }
            return getPrice(b) - getPrice(a);
        });
    }, [ventures, priceSort, quality]);

    return (
        <div className="px-4 py-6 ffxiv-page min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4" style={{ borderBottom: '1px solid rgba(255, 215, 0, 0.2)' }}>
                <div className="flex items-center gap-4">
                    <img src="/retainer.png" alt="Retainer Ventures" className="w-16 h-16 rounded-lg object-cover"
                        style={{ border: '2px solid rgba(255, 215, 0, 0.4)', boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)' }} />
                    <div>
                        <h1 className="text-3xl font-bold mb-1 ffxiv-title">
                            Retainer Ventures
                        </h1>
                        <p className="text-sm text-blue-200" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                            Combat retainer hunting missions sorted by material market value.
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="ffxiv-panel p-5 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* World Selector */}
                    <div>
                        <label className="block text-xs text-blue-300 font-bold uppercase mb-2">World (for prices)</label>
                        <WorldSelector value={selectedWorld} onChange={setSelectedWorld} />
                    </div>

                    {/* Expansion Filter */}
                    <div>
                        <label className="block text-xs text-blue-300 font-bold uppercase mb-2">Expansion / Level</label>
                        <div className="flex gap-1.5 flex-wrap">
                            {expansions.map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => setSelectedExpansion(value)}
                                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all uppercase
                                        ${selectedExpansion === value
                                            ? 'bg-gradient-to-r from-blue-900/80 to-blue-800/80 text-gold border border-gold shadow-[0_0_5px_rgba(255,215,0,0.3)]'
                                            : 'bg-black/40 text-gray-400 border border-transparent hover:bg-blue-900/40 hover:text-white'
                                        }`}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Sort */}
                    <div>
                        <label className="block text-xs text-blue-300 font-bold uppercase mb-2">Sort by Price</label>
                        <div className="flex gap-1.5">
                            <button
                                onClick={() => setPriceSort('server')}
                                className={`px-2.5 py-1 rounded text-xs font-bold transition-all
                                    ${priceSort === 'server'
                                        ? 'bg-gradient-to-r from-blue-900/80 to-blue-800/80 text-gold border border-gold shadow-[0_0_5px_rgba(255,215,0,0.3)]'
                                        : 'bg-black/40 text-gray-400 border border-transparent hover:bg-blue-900/40 hover:text-white'
                                    }`}
                            >
                                🏠 Server
                            </button>
                            <button
                                onClick={() => setPriceSort('dc')}
                                className={`px-2.5 py-1 rounded text-xs font-bold transition-all
                                    ${priceSort === 'dc'
                                        ? 'bg-gradient-to-r from-blue-900/80 to-blue-800/80 text-gold border border-gold shadow-[0_0_5px_rgba(255,215,0,0.3)]'
                                        : 'bg-black/40 text-gray-400 border border-transparent hover:bg-blue-900/40 hover:text-white'
                                    }`}
                            >
                                🌐 DC
                            </button>
                        </div>
                    </div>

                    {/* Quality Toggle */}
                    <div>
                        <label className="block text-xs text-blue-300 font-bold uppercase mb-2">Quality</label>
                        <div className="flex gap-1.5">
                            <button
                                onClick={() => setQuality('nq')}
                                className={`px-2.5 py-1 rounded text-xs font-bold transition-all
                                    ${quality === 'nq'
                                        ? 'bg-gray-700/50 text-gray-200 border border-gray-500'
                                        : 'bg-black/40 text-gray-500 border border-transparent hover:bg-gray-800/40'
                                    }`}
                            >
                                NQ
                            </button>
                            <button
                                onClick={() => setQuality('hq')}
                                className={`px-2.5 py-1 rounded text-xs font-bold transition-all
                                    ${quality === 'hq'
                                        ? 'bg-blue-900/50 text-blue-300 border border-blue-500'
                                        : 'bg-black/40 text-gray-500 border border-transparent hover:bg-blue-900/40'
                                    }`}
                            >
                                ✨ HQ
                            </button>
                            <button
                                onClick={() => setQuality('best')}
                                className={`px-2.5 py-1 rounded text-xs font-bold transition-all
                                    ${quality === 'best'
                                        ? 'bg-green-900/50 text-green-300 border border-green-500'
                                        : 'bg-black/40 text-gray-500 border border-transparent hover:bg-green-900/40'
                                    }`}
                            >
                                Best
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            {!selectedWorld && (
                <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded text-blue-300 text-sm flex items-center gap-2">
                    <span className="text-xl">💡</span> Select a world to see market prices and sort ventures by value.
                </div>
            )}

            {/* Header Row */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="text-xs text-gray-400 font-mono">
                    Showing <span className="text-gold font-bold">{ventures.length}</span> ventures
                    {lastUpdate && (
                        <span className="ml-2 opacity-70">• Updated: {lastUpdate.toLocaleTimeString()}</span>
                    )}
                </div>
                {selectedWorld && ventures.length > 0 && (
                    <div className="text-xs text-gray-400 italic">Sorted by value (highest first)</div>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-sm flex items-center gap-2">
                    <span className="text-xl">❌</span> <strong>Error:</strong> {error}
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="ffxiv-panel p-8 text-center text-blue-300 animate-pulse">
                    Loading ventures... (fetching market prices)
                </div>
            )}

            {/* Ventures List */}
            {!isLoading && selectedWorld && (
                <div className="space-y-3">
                    {sortedVentures.map((venture, idx) => {
                        const icon = CATEGORY_ICONS[venture.category] || '📦';
                        const rank = idx + 1;

                        return (
                            <div
                                key={venture.itemId}
                                className={`ffxiv-panel p-4 transition-all ${venture.hasPrice && venture.totalValue > 0
                                    ? rank <= 3
                                        ? '!border-gold/80 bg-gradient-to-r from-yellow-900/20 to-transparent shadow-[0_0_15px_rgba(255,215,0,0.15)]'
                                        : rank <= 10
                                            ? '!border-green-700/50 bg-gradient-to-r from-green-900/10 to-transparent'
                                            : ''
                                    : 'opacity-60 saturate-50'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        {/* Rank Badge */}
                                        {rank <= 10 && venture.hasPrice && (
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md border ${rank === 1 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                                                rank === 2 ? 'bg-gray-400/20 text-gray-300 border-gray-400/50' :
                                                    rank === 3 ? 'bg-orange-600/20 text-orange-400 border-orange-600/50' :
                                                        'bg-gray-700/30 text-gray-400 border-gray-600/30'
                                                }`}>
                                                {rank}
                                            </div>
                                        )}

                                        <span className="text-3xl filter drop-shadow-md">{icon}</span>

                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-100 flex items-center gap-2 text-lg">
                                                {venture.name}
                                                <span className="text-xs text-gray-500 bg-black/30 px-1.5 py-0.5 rounded border border-gray-700">×{venture.quantity}</span>
                                            </h3>
                                            <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                                                <span className="text-blue-300">Lv. {venture.level}</span>
                                                <span className="text-gray-600">•</span>
                                                <span className="capitalize text-gray-300">{venture.category}</span>
                                                <span className="text-gray-600">•</span>
                                                <span>1 hour</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price Display */}
                                    <div className="text-right min-w-[140px]">
                                        {venture.hasPrice ? (
                                            <>
                                                {/* Server Price */}
                                                <div className="text-xl font-bold text-green-400 drop-shadow-sm font-mono tracking-tight">
                                                    {formatGil(venture.totalValue)}
                                                    <span className="text-xs text-gray-500 ml-1 font-sans font-normal">gil</span>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    @ {formatGil(venture.unitPrice)} each
                                                </div>

                                                {/* DC Lowest Price */}
                                                {venture.hasDcPrice && venture.dcLowestWorld && (
                                                    <div className={`text-xs mt-1.5 px-2 py-0.5 rounded bg-black/20 inline-block border border-gray-800 ${venture.isCheapest ? 'text-green-500 border-green-900/30' : 'text-blue-400'}`}>
                                                        {venture.isCheapest ? (
                                                            <span>✓ Cheapest on DC</span>
                                                        ) : (
                                                            <span>
                                                                DC Low: {formatGil(venture.dcLowestPrice)}
                                                                <span className="text-gray-500 ml-1">({venture.dcLowestWorld})</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-gray-600 italic">No listings found</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {ventures.length === 0 && !isLoading && selectedWorld && (
                <div className="ffxiv-panel p-12 text-center text-gray-500 italic">
                    No ventures match your filters. Try adjusting the level or checking your connection.
                </div>
            )}
        </div>
    );
}
