import { useState, useEffect, useCallback } from 'react';
import WorldSelector from '../components/WorldSelector';
import { expansions } from '../data/ffxivData';

export default function MaterialBrowserPage() {
    const [world, setWorld] = useState(() => {
        return localStorage.getItem('selectedWorld') || '';
    });
    const [selectedExpansions, setSelectedExpansions] = useState([]);
    const [sortBy, setSortBy] = useState('price');
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);

    useEffect(() => {
        if (world) {
            localStorage.setItem('selectedWorld', world);
        }
    }, [world]);

    const fetchMaterials = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const params = new URLSearchParams({
                expansion: 'All',
                sort: sortBy
            });

            let url = '/api/materials';
            if (world) {
                url = `/api/materials/${encodeURIComponent(world)}/prices`;
            }

            const response = await fetch(`${url}?${params}`);
            if (!response.ok) throw new Error('Failed to fetch materials');

            const data = await response.json();
            setMaterials(data.materials || []);
            if (world) {
                setLastUpdate(new Date());
            }
        } catch (err) {
            setError(err.message);
            setMaterials([]);
        } finally {
            setIsLoading(false);
        }
    }, [world, sortBy]);

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    const formatGil = (amount) => {
        if (!amount) return '—';
        if (amount >= 1000000) {
            return `${(amount / 1000000).toFixed(1)}M`;
        }
        if (amount >= 1000) {
            return `${(amount / 1000).toFixed(1)}K`;
        }
        return amount.toLocaleString();
    };

    // Color code by price (cheap = green, expensive = red)
    const getPriceColor = (price) => {
        if (!price) return 'text-gray-600';
        if (price < 500) return 'text-green-400';
        if (price < 2000) return 'text-yellow-400';
        if (price < 10000) return 'text-orange-400';
        return 'text-red-400';
    };

    const toggleExpansion = (value) => {
        if (value === 'All') {
            if (selectedExpansions.length === expansions.length - 1) {
                setSelectedExpansions([]);
            } else {
                setSelectedExpansions(expansions.filter(e => e.value !== 'All').map(e => e.value));
            }
        } else {
            if (selectedExpansions.includes(value)) {
                setSelectedExpansions(selectedExpansions.filter(e => e !== value));
            } else {
                setSelectedExpansions([...selectedExpansions, value]);
            }
        }
    };

    const allExpansionsSelected = selectedExpansions.length === 0;

    // Filter materials by expansion client-side
    const filteredMaterials = materials.filter(mat => {
        if (selectedExpansions.length === 0) return true;
        return selectedExpansions.includes(mat.expansion);
    });

    // Sort materials
    const sortedMaterials = [...filteredMaterials].sort((a, b) => {
        if (sortBy === 'price') {
            const aPrice = a.minPrice || 999999999;
            const bPrice = b.minPrice || 999999999;
            return aPrice - bPrice;
        }
        if (sortBy === 'name') {
            return a.name.localeCompare(b.name);
        }
        if (sortBy === 'usage') {
            return (b.usageCount || 0) - (a.usageCount || 0);
        }
        return 0;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-display font-semibold text-gold mb-2">
                    📦 Material Price Browser
                </h1>
                <p className="text-gray-400 text-sm">
                    Browse material prices by expansion. Find cheap deals to stockpile!
                </p>
            </div>

            {/* Filters Card */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
                <div className="lg:col-span-1">
                    <div className="card p-5 h-full">
                        <WorldSelector value={world} onChange={setWorld} />
                    </div>
                </div>

                <div className="lg:col-span-3">
                    <div className="card p-5">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                            Filters
                        </h3>

                        {/* Expansion Multi-Select */}
                        <div className="mb-4">
                            <label className="block text-xs text-gray-500 mb-2">Expansions</label>
                            <div className="flex gap-1.5 flex-wrap">
                                <button
                                    onClick={() => toggleExpansion('All')}
                                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all duration-150 uppercase
                                        ${allExpansionsSelected
                                            ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/50'
                                            : 'bg-black/20 text-gray-500 border border-gray-700/50 hover:border-gray-600'
                                        }`}
                                >
                                    All
                                </button>
                                {expansions.filter(e => e.value !== 'All').map(({ value }) => (
                                    <button
                                        key={value}
                                        onClick={() => toggleExpansion(value)}
                                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-all duration-150 uppercase
                                            ${selectedExpansions.includes(value) && !allExpansionsSelected
                                                ? `expansion-badge expansion-${value}`
                                                : 'bg-black/20 text-gray-500 border border-gray-700/50 hover:border-gray-600'
                                            }`}
                                    >
                                        {value}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sort By */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-2">Sort By</label>
                            <div className="flex gap-1.5 flex-wrap">
                                {[
                                    { value: 'price', label: 'Price (Lowest)' },
                                    { value: 'name', label: 'Name (A-Z)' },
                                    { value: 'usage', label: 'Usage (Most)' }
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setSortBy(opt.value)}
                                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-all duration-150
                                            ${sortBy === opt.value
                                                ? 'bg-gold/20 text-gold border border-gold/50'
                                                : 'bg-black/20 text-gray-500 border border-gray-700/50 hover:border-gray-600'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            {!world && (
                <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800/50 rounded text-blue-300 text-sm">
                    💡 Select a world to see current market prices.
                </div>
            )}

            {/* Header Row */}
            <div className="flex items-center justify-between mb-4">
                <div className="text-xs text-gray-500">
                    Showing <span className="text-gold">{sortedMaterials.length}</span> materials
                    {lastUpdate && (
                        <span className="ml-2">
                            • Updated: {lastUpdate.toLocaleTimeString()}
                        </span>
                    )}
                </div>
                {world && (
                    <div className="text-xs text-gray-500">
                        🟢 Cheap &lt;500 | 🟡 Mid &lt;2K | 🟠 Pricey &lt;10K | 🔴 Expensive
                    </div>
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
                    Loading materials... {world && '(fetching prices)'}
                </div>
            )}

            {/* Materials Table */}
            {!isLoading && sortedMaterials.length > 0 && (
                <div className="card overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-800/50">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase tracking-wide">Material</th>
                                <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide">Expansion</th>
                                {world && (
                                    <>
                                        <th className="text-right px-4 py-3 text-xs text-gray-400 uppercase tracking-wide">NQ Price</th>
                                        <th className="text-right px-4 py-3 text-xs text-gray-400 uppercase tracking-wide">HQ Price</th>
                                    </>
                                )}
                                <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide">Usage</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/30">
                            {sortedMaterials.map((mat) => (
                                <tr key={mat.itemId} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <span className="text-gray-100 font-medium">{mat.name}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase expansion-badge expansion-${mat.expansion}`}>
                                            {mat.expansion}
                                        </span>
                                    </td>
                                    {world && (
                                        <>
                                            <td className={`px-4 py-3 text-right font-medium ${getPriceColor(mat.nqPrice)}`}>
                                                {mat.nqPrice > 0 ? formatGil(mat.nqPrice) : '—'}
                                            </td>
                                            <td className={`px-4 py-3 text-right font-medium ${getPriceColor(mat.hqPrice)}`}>
                                                {mat.hqPrice > 0 ? formatGil(mat.hqPrice) : '—'}
                                            </td>
                                        </>
                                    )}
                                    <td className="px-4 py-3 text-center">
                                        <span className="text-xs text-gray-500">
                                            {mat.usageCount || 0} recipes
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {sortedMaterials.length === 0 && !isLoading && (
                <div className="card p-8 text-center text-gray-500">
                    No materials found for this expansion.
                </div>
            )}
        </div>
    );
}
