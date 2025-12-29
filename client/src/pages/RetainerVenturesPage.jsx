import { useState, useEffect, useCallback } from 'react';
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
    const { world, setWorld } = useFilters();
    const [selectedExpansion, setSelectedExpansion] = useState('All');
    const [ventures, setVentures] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);

    const fetchVentures = useCallback(async () => {
        if (!world) {
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

            const response = await fetch(`/api/retainers/${encodeURIComponent(world)}/ventures?${params}`);
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
    }, [world, selectedExpansion]);

    useEffect(() => {
        fetchVentures();
    }, [fetchVentures]);

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gold mb-2">
                    🎯 Retainer Ventures
                </h1>
                <p className="text-gray-400">
                    Combat retainer hunting missions sorted by material market value
                </p>
            </div>

            {/* Filters */}
            <div className="card p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* World Selector */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-2">World (for prices)</label>
                        <WorldSelector value={world} onChange={setWorld} />
                    </div>

                    {/* Expansion Filter */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-2">Expansion / Level</label>
                        <div className="flex gap-1.5 flex-wrap">
                            {expansions.map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => setSelectedExpansion(value)}
                                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all uppercase
                                        ${selectedExpansion === value
                                            ? 'bg-gold/20 text-gold border border-gold/50'
                                            : 'bg-black/20 text-gray-500 border border-gray-700/50 hover:border-gray-600'
                                        }`}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            {!world && (
                <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800/50 rounded text-blue-300 text-sm">
                    💡 Select a world to see market prices and sort ventures by value.
                </div>
            )}

            {/* Header Row */}
            <div className="flex items-center justify-between mb-4">
                <div className="text-xs text-gray-500">
                    Showing <span className="text-gold">{ventures.length}</span> ventures
                    {lastUpdate && (
                        <span className="ml-2">• Updated: {lastUpdate.toLocaleTimeString()}</span>
                    )}
                </div>
                {world && ventures.length > 0 && (
                    <div className="text-xs text-gray-500">Sorted by value (highest first)</div>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-800/50 rounded text-red-400 text-sm">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="card p-8 text-center text-gray-500">
                    Loading ventures... (fetching market prices)
                </div>
            )}

            {/* Ventures List */}
            {!isLoading && world && (
                <div className="space-y-3">
                    {ventures.map((venture, idx) => {
                        const icon = CATEGORY_ICONS[venture.category] || '📦';
                        const rank = idx + 1;

                        return (
                            <div
                                key={venture.itemId}
                                className={`card p-4 transition-all ${venture.hasPrice && venture.totalValue > 0
                                        ? rank <= 3
                                            ? 'border-gold/50 bg-gold/5'
                                            : rank <= 10
                                                ? 'border-green-800/50 bg-green-900/10'
                                                : ''
                                        : 'opacity-60'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        {/* Rank Badge */}
                                        {rank <= 10 && venture.hasPrice && (
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${rank === 1 ? 'bg-yellow-500/30 text-yellow-400' :
                                                    rank === 2 ? 'bg-gray-400/30 text-gray-300' :
                                                        rank === 3 ? 'bg-orange-600/30 text-orange-400' :
                                                            'bg-gray-700/50 text-gray-400'
                                                }`}>
                                                {rank}
                                            </div>
                                        )}

                                        <span className="text-2xl">{icon}</span>

                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-100 flex items-center gap-2">
                                                {venture.name}
                                                <span className="text-xs text-gray-500">×{venture.quantity}</span>
                                            </h3>
                                            <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                                                <span>Lv. {venture.level}</span>
                                                <span>•</span>
                                                <span className="capitalize">{venture.category}</span>
                                                <span>•</span>
                                                <span>1 hour</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price Display */}
                                    <div className="text-right">
                                        {venture.hasPrice ? (
                                            <>
                                                <div className="text-xl font-bold text-green-400">
                                                    {formatGil(venture.totalValue)}
                                                    <span className="text-xs text-gray-500 ml-1">gil</span>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    @ {formatGil(venture.unitPrice)} each
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-gray-600">No listings</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {ventures.length === 0 && !isLoading && world && (
                <div className="card p-8 text-center text-gray-500">
                    No ventures match your filters.
                </div>
            )}
        </div>
    );
}
