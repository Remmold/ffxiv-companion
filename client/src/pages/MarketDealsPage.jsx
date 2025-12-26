import { useState, useEffect, useCallback } from 'react';
import { dataCenters, dcByRegion, regionOrder, expansions } from '../data/ffxivData';

export default function MarketDealsPage() {
    const [dataCenter, setDataCenter] = useState(() => {
        return localStorage.getItem('selectedDC') || 'Chaos';
    });
    const [tab, setTab] = useState('arbitrage');
    const [expansion, setExpansion] = useState('DT');
    const [minProfit, setMinProfit] = useState(1000);
    const [minDiscount, setMinDiscount] = useState(30);
    const [deals, setDeals] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

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

    useEffect(() => {
        fetchDeals();
    }, [fetchDeals]);

    const formatGil = (amount) => {
        if (!amount) return '—';
        if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
        return amount.toLocaleString();
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-display font-semibold text-gold mb-2">
                    💰 Market Deals
                </h1>
                <p className="text-gray-400 text-sm">
                    Find cross-world arbitrage opportunities and crash-priced items in your data center.
                </p>
            </div>

            {/* Filters Card */}
            <div className="card p-5 mb-6">
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

                    {/* Min Profit (for arbitrage) */}
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

                    {/* Min Discount (for crashes) */}
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

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setTab('arbitrage')}
                    className={`px-4 py-2 rounded-t text-sm font-medium transition-colors ${tab === 'arbitrage'
                            ? 'bg-green-900/30 text-green-400 border-b-2 border-green-500'
                            : 'bg-gray-800/50 text-gray-400 hover:text-gray-200'
                        }`}
                >
                    🔄 Arbitrage ({deals?.arbitrage?.length || 0})
                </button>
                <button
                    onClick={() => setTab('crashes')}
                    className={`px-4 py-2 rounded-t text-sm font-medium transition-colors ${tab === 'crashes'
                            ? 'bg-red-900/30 text-red-400 border-b-2 border-red-500'
                            : 'bg-gray-800/50 text-gray-400 hover:text-gray-200'
                        }`}
                >
                    📉 Crashes ({deals?.crashes?.length || 0})
                </button>
            </div>

            {/* Info */}
            {deals && (
                <div className="text-xs text-gray-500 mb-4">
                    Scanned {deals.itemsScanned} items across {deals.worlds?.length} worlds
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
                <div className="card p-8 text-center text-gray-500">
                    Scanning {dataCenter} for deals...
                </div>
            )}

            {/* Arbitrage Tab */}
            {!isLoading && tab === 'arbitrage' && (
                <div className="card overflow-hidden">
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
                <div className="card overflow-hidden">
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
        </div>
    );
}
