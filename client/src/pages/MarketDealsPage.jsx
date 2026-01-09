import { useState, useEffect, useCallback } from 'react';
import { dataCenters, dcByRegion, regionOrder, expansions } from '../data/ffxivData';
import { useFilters } from '../context/FilterContext';

export default function MarketDealsPage() {
    const { selectedWorld } = useFilters();
    const [dataCenter, setDataCenter] = useState(() => {
        return localStorage.getItem('selectedDC') || 'Chaos';
    });
    const [tab, setTab] = useState('arbitrage');
    const [expansion, setExpansion] = useState('DT');
    const [minProfit, setMinProfit] = useState(1000);
    const [minDiscount, setMinDiscount] = useState(30);
    const [deals, setDeals] = useState(null);
    const [keyMaterials, setKeyMaterials] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Material Browser state
    const [materials, setMaterials] = useState([]);
    const [materialSortBy, setMaterialSortBy] = useState('price');
    const [selectedExpansions, setSelectedExpansions] = useState([]);

    useEffect(() => {
        if (dataCenter) {
            localStorage.setItem('selectedDC', dataCenter);
        }
    }, [dataCenter]);

    const fetchDeals = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const params = new URLSearchParams({
                minProfit: minProfit.toString(),
                minDiscount: minDiscount.toString(),
                expansion
            });

            const response = await fetch(`/api/deals/${encodeURIComponent(dataCenter)}?${params}`);
            if (!response.ok) throw new Error('Failed to fetch deals');

            const data = await response.json();
            setDeals(data);
        } catch (err) {
            setError(err.message);
            setDeals(null);
        } finally {
            setIsLoading(false);
        }
    }, [dataCenter, minProfit, minDiscount, expansion]);

    const fetchKeyMaterials = useCallback(async () => {
        if (!selectedWorld) return;

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`/api/deals/key-materials/${encodeURIComponent(selectedWorld)}`);
            if (!response.ok) throw new Error('Failed to fetch key materials');

            const data = await response.json();
            setKeyMaterials(data);
        } catch (err) {
            setError(err.message);
            setKeyMaterials(null);
        } finally {
            setIsLoading(false);
        }
    }, [selectedWorld]);

    const fetchMaterials = useCallback(async () => {
        if (!selectedWorld) return;

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`/api/materials/${encodeURIComponent(selectedWorld)}/prices?expansion=All&sort=${materialSortBy}`);
            if (!response.ok) throw new Error('Failed to fetch materials');

            const data = await response.json();
            setMaterials(data.materials || []);
        } catch (err) {
            setError(err.message);
            setMaterials([]);
        } finally {
            setIsLoading(false);
        }
    }, [selectedWorld, materialSortBy]);

    useEffect(() => {
        if (tab === 'keyMaterials') {
            fetchKeyMaterials();
        } else if (tab === 'materials') {
            fetchMaterials();
        } else {
            fetchDeals();
        }
    }, [tab, fetchDeals, fetchKeyMaterials, fetchMaterials]);

    const formatGil = (amount) => {
        if (!amount) return '—';
        if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
        return amount.toLocaleString();
    };

    const getDealBadge = (dealType, discountPct) => {
        if (dealType === 'crash') {
            return <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-900/50 text-red-400">CRASH -{discountPct}%</span>;
        } else if (dealType === 'cheap') {
            return <span className="px-2 py-0.5 rounded text-xs font-bold bg-orange-900/50 text-orange-400">CHEAP -{discountPct}%</span>;
        } else if (dealType === 'vendor_deal') {
            return <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-900/50 text-green-400">VENDOR DEAL</span>;
        }
        return null;
    };

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

    // Filter and sort materials
    const filteredMaterials = materials.filter(mat => {
        if (selectedExpansions.length === 0) return true;
        return selectedExpansions.includes(mat.expansion);
    });

    const sortedMaterials = [...filteredMaterials].sort((a, b) => {
        if (materialSortBy === 'price') {
            const aPrice = a.minPrice || 999999999;
            const bPrice = b.minPrice || 999999999;
            return aPrice - bPrice;
        }
        if (materialSortBy === 'name') {
            return a.name.localeCompare(b.name);
        }
        if (materialSortBy === 'usage') {
            return (b.usageCount || 0) - (a.usageCount || 0);
        }
        return 0;
    });

    return (
        <div className="px-4 py-6 ffxiv-page min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4" style={{ borderBottom: '1px solid rgba(255, 215, 0, 0.2)' }}>
                <div className="flex items-center gap-4">
                    <img src="/deals.png" alt="Market Deals" className="w-16 h-16 rounded-lg object-cover"
                        style={{ border: '2px solid rgba(255, 215, 0, 0.4)', boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)' }} />
                    <div>
                        <h1 className="text-3xl font-bold mb-1 ffxiv-title">
                            Market Deals
                        </h1>
                        <p className="text-sm text-blue-200" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                            Find arbitrage, crashes, key materials, and browse all material prices.
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                <button
                    onClick={() => setTab('arbitrage')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2 ${tab === 'arbitrage'
                        ? 'bg-gradient-to-r from-blue-900/80 to-blue-800/80 text-gold border border-gold shadow-[0_0_10px_rgba(255,215,0,0.3)]'
                        : 'bg-black/40 text-blue-300 border border-transparent hover:bg-blue-900/40 hover:text-white'
                        }`}
                >
                    <span>🔄</span> Arbitrage
                </button>
                <button
                    onClick={() => setTab('crashes')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2 ${tab === 'crashes'
                        ? 'bg-gradient-to-r from-blue-900/80 to-blue-800/80 text-gold border border-gold shadow-[0_0_10px_rgba(255,215,0,0.3)]'
                        : 'bg-black/40 text-blue-300 border border-transparent hover:bg-blue-900/40 hover:text-white'
                        }`}
                >
                    <span>📉</span> Crashes
                </button>
                <button
                    onClick={() => setTab('keyMaterials')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2 ${tab === 'keyMaterials'
                        ? 'bg-gradient-to-r from-blue-900/80 to-blue-800/80 text-gold border border-gold shadow-[0_0_10px_rgba(255,215,0,0.3)]'
                        : 'bg-black/40 text-blue-300 border border-transparent hover:bg-blue-900/40 hover:text-white'
                        }`}
                >
                    <span>⭐</span> Key Materials
                </button>
                <button
                    onClick={() => setTab('materials')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2 ${tab === 'materials'
                        ? 'bg-gradient-to-r from-blue-900/80 to-blue-800/80 text-gold border border-gold shadow-[0_0_10px_rgba(255,215,0,0.3)]'
                        : 'bg-black/40 text-blue-300 border border-transparent hover:bg-blue-900/40 hover:text-white'
                        }`}
                >
                    <span>🧱</span> All Materials
                </button>
            </div>

            {/* Filters Card - Different per tab */}
            {(tab === 'arbitrage' || tab === 'crashes') && (
                <div className="ffxiv-panel p-5 mb-6">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                        Settings
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Data Center */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-2">Data Center</label>
                            <select
                                value={dataCenter}
                                onChange={(e) => setDataCenter(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200"
                            >
                                {regionOrder.map(region => (
                                    <optgroup key={region} label={region}>
                                        {dcByRegion[region].map(dc => (
                                            <option key={dc} value={dc}>{dc}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>

                        {/* Expansion */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-2">Expansion</label>
                            <div className="flex gap-1.5 flex-wrap">
                                {expansions.filter(e => e.value !== 'All').slice(0, 4).map(({ value }) => (
                                    <button
                                        key={value}
                                        onClick={() => setExpansion(value)}
                                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-all duration-150 uppercase
                                            ${expansion === value
                                                ? `expansion-badge expansion-${value}`
                                                : 'bg-black/20 text-gray-500 border border-gray-700/50 hover:border-gray-600'
                                            }`}
                                    >
                                        {value}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Min Profit */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-2">Min Profit (gil)</label>
                            <input
                                type="number"
                                value={minProfit}
                                onChange={(e) => setMinProfit(parseInt(e.target.value) || 0)}
                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200"
                                min="0"
                                step="500"
                            />
                        </div>

                        {/* Min Discount */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-2">Min Discount (%)</label>
                            <input
                                type="number"
                                value={minDiscount}
                                onChange={(e) => setMinDiscount(parseInt(e.target.value) || 0)}
                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200"
                                min="0"
                                max="90"
                                step="5"
                            />
                        </div>
                    </div>
                </div>
            )}

            {tab === 'keyMaterials' && (
                <div className="ffxiv-panel p-4 mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">Showing prices for:</span>
                        <span className="text-yellow-400 font-medium">{selectedWorld || 'Select a world in the header'}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Key materials used in Master Recipes and high-level crafting. Shows vendor price comparisons where available.
                    </p>
                </div>
            )}

            {tab === 'materials' && (
                <div className="ffxiv-panel p-5 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-400">Prices for:</span>
                            <span className="text-blue-400 font-medium">{selectedWorld || 'Select a world in the header'}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                            🟢 &lt;500 | 🟡 &lt;2K | 🟠 &lt;10K | 🔴 Expensive
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {/* Expansion Filter */}
                        <div>
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
                                    { value: 'price', label: 'Price ↑' },
                                    { value: 'name', label: 'Name' },
                                    { value: 'usage', label: 'Usage ↓' }
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setMaterialSortBy(opt.value)}
                                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-all duration-150
                                            ${materialSortBy === opt.value
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
            )}

            {/* Info */}
            {(tab === 'arbitrage' || tab === 'crashes') && deals && (
                <div className="text-xs text-gray-500 mb-4">
                    Scanned {deals.itemsScanned} items across {deals.worlds?.length} worlds
                </div>
            )}

            {tab === 'materials' && sortedMaterials.length > 0 && (
                <div className="text-xs text-gray-500 mb-4">
                    Showing <span className="text-gold">{sortedMaterials.length}</span> materials
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-800/50 rounded text-red-400 text-sm">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Loading */}
            {isLoading && (
                <div className="ffxiv-panel p-8 text-center text-gray-500">
                    {tab === 'materials' ? `Loading materials for ${selectedWorld}...` :
                        tab === 'keyMaterials' ? `Fetching key material prices for ${selectedWorld}...` :
                            `Scanning ${dataCenter} for deals...`}
                </div>
            )}

            {/* Arbitrage Tab */}
            {!isLoading && tab === 'arbitrage' && (
                <div className="ffxiv-panel overflow-hidden">
                    {deals?.arbitrage?.length > 0 ? (
                        <table className="w-full">
                            <thead className="bg-gray-800/50">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase tracking-wide">Item</th>
                                    <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide">Buy</th>
                                    <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide">Sell</th>
                                    <th className="text-right px-4 py-3 text-xs text-gray-400 uppercase tracking-wide">Profit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/30">
                                {deals.arbitrage.map((deal) => (
                                    <tr key={deal.itemId} className="hover:bg-gray-800/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="text-gray-100 font-medium">{deal.name}</div>
                                            <div className="text-xs text-gray-500">{deal.expansion}</div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="text-green-400 font-medium">{formatGil(deal.buyPrice)}</div>
                                            <div className="text-xs text-gray-500">{deal.buyWorld}</div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="text-blue-400 font-medium">{formatGil(deal.sellPrice)}</div>
                                            <div className="text-xs text-gray-500">{deal.sellWorld}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="text-yellow-400 font-bold">{formatGil(deal.profit)}</div>
                                            <div className="text-xs text-green-400">+{deal.profitPct}%</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            No arbitrage opportunities found with current filters.
                        </div>
                    )}
                </div>
            )}

            {/* Crashes Tab */}
            {!isLoading && tab === 'crashes' && (
                <div className="ffxiv-panel overflow-hidden">
                    {deals?.crashes?.length > 0 ? (
                        <table className="w-full">
                            <thead className="bg-gray-800/50">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase tracking-wide">Item</th>
                                    <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide">World</th>
                                    <th className="text-right px-4 py-3 text-xs text-gray-400 uppercase tracking-wide">Current</th>
                                    <th className="text-right px-4 py-3 text-xs text-gray-400 uppercase tracking-wide">Average</th>
                                    <th className="text-right px-4 py-3 text-xs text-gray-400 uppercase tracking-wide">Discount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/30">
                                {deals.crashes.map((crash) => (
                                    <tr key={crash.itemId} className="hover:bg-gray-800/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="text-gray-100 font-medium">{crash.name}</div>
                                            <div className="text-xs text-gray-500">{crash.expansion}</div>
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-400">
                                            {crash.world}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="text-green-400 font-bold">{formatGil(crash.currentPrice)}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-400">
                                            {formatGil(crash.averagePrice)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${crash.discountPct >= 70 ? 'bg-red-900/50 text-red-400' :
                                                crash.discountPct >= 50 ? 'bg-orange-900/50 text-orange-400' :
                                                    'bg-yellow-900/50 text-yellow-400'
                                                }`}>
                                                -{crash.discountPct}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            No crash-priced items found with current filters.
                        </div>
                    )}
                </div>
            )}

            {/* Key Materials Tab */}
            {!isLoading && tab === 'keyMaterials' && (
                <div className="ffxiv-panel overflow-hidden">
                    {!selectedWorld ? (
                        <div className="p-8 text-center text-gray-500">
                            Select a world in the header to see key material prices.
                        </div>
                    ) : keyMaterials?.materials?.length > 0 ? (
                        <table className="w-full">
                            <thead className="bg-gray-800/50">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase tracking-wide">Material</th>
                                    <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide">Category</th>
                                    <th className="text-right px-4 py-3 text-xs text-gray-400 uppercase tracking-wide">NQ Price</th>
                                    <th className="text-right px-4 py-3 text-xs text-gray-400 uppercase tracking-wide">HQ Price</th>
                                    <th className="text-right px-4 py-3 text-xs text-gray-400 uppercase tracking-wide">Vendor</th>
                                    <th className="text-right px-4 py-3 text-xs text-gray-400 uppercase tracking-wide">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/30">
                                {keyMaterials.materials.map((mat) => (
                                    <tr key={mat.itemId} className={`hover:bg-gray-800/30 transition-colors ${mat.dealType ? 'bg-yellow-900/5' : ''}`}>
                                        <td className="px-4 py-3">
                                            <div className="text-gray-100 font-medium">{mat.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {mat.usedIn?.join(', ')}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                                                {mat.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="text-gray-200">{formatGil(mat.minPriceNQ)}</div>
                                            <div className="text-xs text-gray-500">avg: {formatGil(mat.avgPriceNQ)}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="text-blue-400">{formatGil(mat.minPriceHQ)}</div>
                                            <div className="text-xs text-gray-500">avg: {formatGil(mat.avgPriceHQ)}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {mat.vendorPrice ? (
                                                <>
                                                    <div className="text-yellow-400">{formatGil(mat.vendorPrice)}</div>
                                                    <div className="text-xs text-gray-500">{mat.vendorLocation}</div>
                                                </>
                                            ) : (
                                                <span className="text-gray-600">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {getDealBadge(mat.dealType, mat.discountPct)}
                                            {mat.listings > 0 && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {mat.listings} listings
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            No key materials data available.
                        </div>
                    )}
                </div>
            )}

            {/* All Materials Tab */}
            {!isLoading && tab === 'materials' && (
                <div className="ffxiv-panel overflow-hidden">
                    {!selectedWorld ? (
                        <div className="p-8 text-center text-gray-500">
                            Select a world in the header to see material prices.
                        </div>
                    ) : sortedMaterials.length > 0 ? (
                        <table className="w-full">
                            <thead className="bg-gray-800/50">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase tracking-wide">Material</th>
                                    <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide">Expansion</th>
                                    <th className="text-right px-4 py-3 text-xs text-gray-400 uppercase tracking-wide">NQ Price</th>
                                    <th className="text-right px-4 py-3 text-xs text-gray-400 uppercase tracking-wide">HQ Price</th>
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
                                        <td className={`px-4 py-3 text-right font-medium ${getPriceColor(mat.nqPrice)}`}>
                                            {mat.nqPrice > 0 ? formatGil(mat.nqPrice) : '—'}
                                        </td>
                                        <td className={`px-4 py-3 text-right font-medium ${getPriceColor(mat.hqPrice)}`}>
                                            {mat.hqPrice > 0 ? formatGil(mat.hqPrice) : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-xs text-gray-500">
                                                {mat.usageCount || 0} recipes
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            No materials found for this expansion.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
