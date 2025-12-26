import { useState, useEffect, useCallback } from 'react';
import { useFilters } from '../context/FilterContext';
import { fillerNodes } from '../data/fillerNodes';

const CLASS_ICONS = {
    Miner: '⛏️',
    Botanist: '🌿'
};

export default function FillerNodesSidebar() {
    const { selectedWorld, selectedExpansion } = useFilters();
    const [prices, setPrices] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Fetch prices for filler nodes
    const fetchPrices = useCallback(async () => {
        if (!selectedWorld) return;

        setIsLoading(true);
        try {
            const itemIds = fillerNodes.map(n => n.itemId);
            const response = await fetch(`/api/prices/${encodeURIComponent(selectedWorld)}/${itemIds.join(',')}`);
            const data = await response.json();
            setPrices(data.prices || {});
        } catch (err) {
            console.error('Failed to fetch prices:', err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedWorld]);

    useEffect(() => {
        fetchPrices();
        // Refresh every 5 minutes
        const interval = setInterval(fetchPrices, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchPrices]);

    // Filter and sort nodes
    const getFilteredNodes = useCallback(() => {
        let filtered = fillerNodes;

        // Filter by expansion
        if (selectedExpansion !== 'All') {
            filtered = filtered.filter(n => n.expansion === selectedExpansion);
        }

        // Add prices and sort by highest value
        return filtered
            .map(node => {
                const priceData = prices[node.itemId];
                const price = priceData?.minPrice || priceData?.nqPrice || 0;
                return { ...node, price };
            })
            .filter(n => n.price > 0)
            .sort((a, b) => b.price - a.price)
            .slice(0, 5);
    }, [prices, selectedExpansion]);

    const filteredNodes = getFilteredNodes();

    const formatGil = (amount) => {
        if (!amount) return '—';
        if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
        return amount.toLocaleString();
    };

    const handleTeleport = (aetheryte) => {
        navigator.clipboard.writeText(`/teleport ${aetheryte}`);
    };

    if (!selectedWorld) {
        return (
            <div className="text-xs text-gray-500 text-center p-2">
                Select a world to see prices
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                <span>🔄</span>
                Filler Nodes
            </h3>
            <p className="text-xs text-gray-500 mb-3">Always available, farm while waiting</p>

            {isLoading && filteredNodes.length === 0 ? (
                <div className="text-xs text-gray-500 text-center">Loading...</div>
            ) : filteredNodes.length === 0 ? (
                <div className="text-xs text-gray-500">No filler nodes for this expansion</div>
            ) : (
                <div className="space-y-2">
                    {filteredNodes.map(node => (
                        <div key={node.itemId}
                            className="bg-blue-900/10 border border-blue-800/20 rounded p-2 hover:border-blue-700/40 transition-colors cursor-pointer"
                            onClick={() => handleTeleport(node.aetheryte)}
                            title={`Click to copy: /teleport ${node.aetheryte}`}
                        >
                            <div className="flex items-start gap-2">
                                <span className="text-lg mt-0.5">{CLASS_ICONS[node.class]}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-gray-100 truncate">
                                        {node.name}
                                    </div>
                                    <div className="text-xs text-gray-400 truncate">
                                        {node.zone}
                                    </div>
                                    <div className="text-xs text-blue-400 truncate">
                                        📍 {node.aetheryte}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-blue-400">
                                        {formatGil(node.price)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Lv.{node.level}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <p className="text-xs text-gray-600 mt-3 text-center">
                Click to copy teleport
            </p>
        </div>
    );
}
