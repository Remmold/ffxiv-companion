import { useState, useCallback } from 'react';
import { etMinutesToRealTime, formatET } from '../utils/eorzeanTime';
import { getFavorites, toggleFavorite } from '../utils/favorites';
import { getAlarms, toggleAlarm } from '../utils/alarms';
import { copyTeleportMacro } from '../utils/notifications';
import { timedNodeScrips, scripColors } from '../data/timedNodeScrips';
import { getItemUsage, getUsagePriorityColor } from '../data/materialUsages';

// Default yield for timed nodes
const DEFAULT_YIELD = 20;

// Fallback icons for gathering classes
const CLASS_ICONS = {
    Miner: '⛏️',
    Botanist: '🌿'
};

export default function NodeTable({ nodes, prices, icons = {}, isLoading, world, viewMode = 'gold', onOpenGuide }) {
    const [favorites, setFavorites] = useState(() => getFavorites());
    const [alarms, setAlarms] = useState(() => getAlarms());
    const [copiedId, setCopiedId] = useState(null);

    const handleToggleFavorite = useCallback((itemId) => {
        toggleFavorite(itemId);
        setFavorites(getFavorites());
    }, []);

    const handleToggleAlarm = useCallback((itemId) => {
        toggleAlarm(itemId);
        setAlarms(getAlarms());
    }, []);

    const handleCopyTeleport = useCallback(async (node) => {
        const success = await copyTeleportMacro(node.nearestAetheryte);
        if (success) {
            setCopiedId(node.itemId);
            setTimeout(() => setCopiedId(null), 2000);
        }
    }, []);

    if (!world) {
        return (
            <div className="card p-8 text-center">
                <div className="text-4xl mb-4 opacity-60">🌍</div>
                <h3 className="text-xl font-display text-gray-300 mb-2">Select a World</h3>
                <p className="text-gray-500 text-sm">Choose your server to see market prices</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="card p-8 text-center">
                <div className="animate-spin text-3xl mb-4">⟳</div>
                <p className="text-gray-400">Loading nodes...</p>
            </div>
        );
    }

    if (!nodes || nodes.length === 0) {
        return (
            <div className="card p-8 text-center">
                <div className="text-4xl mb-4 opacity-60">🔍</div>
                <h3 className="text-xl font-display text-gray-300 mb-2">No Active Nodes</h3>
                <p className="text-gray-500 text-sm">No nodes spawning within the next 4 Eorzean hours</p>
            </div>
        );
    }

    // Calculate estimated values
    const nodesWithValue = nodes.map(node => {
        const priceData = prices[node.itemId] || {};
        const bestPrice = Math.max(priceData.hqPrice || 0, priceData.nqPrice || 0);
        const estimatedValue = bestPrice * DEFAULT_YIELD;
        const isFavorite = favorites.has(node.itemId);

        // Calculate gil/hour
        const gathersPerHour = 10;
        const gilPerHour = bestPrice > 0 ? Math.round(estimatedValue * gathersPerHour / 20) : 0;

        // Get scrip data for this node
        const scripData = timedNodeScrips[node.itemId] || null;
        const scripValue = scripData?.value || 0;
        const scripType = scripData?.scrip || '';
        const scripsPerHour = scripValue * gathersPerHour;

        // Get usage data for this item
        const usageData = getItemUsage(node.itemName);

        return {
            ...node,
            priceData,
            bestPrice,
            estimatedValue,
            gilPerHour,
            isFavorite,
            hasAlarm: alarms.has(node.itemId),
            scripData,
            scripValue,
            scripType,
            scripsPerHour,
            usageData
        };
    });

    // Sort: Favorites first, then Active nodes, then by value
    nodesWithValue.sort((a, b) => {
        // First: Favorites at top
        if (a.isFavorite !== b.isFavorite) {
            return a.isFavorite ? -1 : 1;
        }
        // Second: Active nodes come before upcoming
        if (a.isActive !== b.isActive) {
            return a.isActive ? -1 : 1;
        }
        // Third: Sort by value based on mode
        if (viewMode === 'scrip') {
            return b.scripsPerHour - a.scripsPerHour;
        }
        return b.estimatedValue - a.estimatedValue;
    });

    // Leader is the highest value ACTIVE node based on mode
    const activeNodes = nodesWithValue.filter(n => n.isActive);
    const leaderId = activeNodes.length > 0
        ? activeNodes[0]?.itemId
        : nodesWithValue[0]?.itemId;

    const isScripMode = viewMode === 'scrip';

    return (
        <div className="card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full ffxiv-table">
                    <thead>
                        <tr>
                            <th className="text-left w-8"></th>
                            <th className="text-left">Item</th>
                            <th className="text-left">{isScripMode ? 'Scrip Value' : 'Price (Gil)'}</th>
                            <th className="text-left">{isScripMode ? 'Scrip Type' : 'Est. Value'}</th>
                            <th className="text-left">{isScripMode ? 'Scrip/Hr' : 'Gil/Hr'}</th>
                            <th className="text-left">Location</th>
                            <th className="text-left">Spawn</th>
                            <th className="text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {nodesWithValue.map((node) => {
                            const isLeader = node.itemId === leaderId && (
                                isScripMode ? node.scripsPerHour > 0 : node.estimatedValue > 0
                            );
                            const iconUrl = icons[node.itemId];
                            const scripTypeColor = node.scripData ? scripColors[node.scripType] : null;

                            return (
                                <tr
                                    key={`${node.itemId}-${node.etSpawnStart}`}
                                    className={isLeader ? (isScripMode ? 'bg-purple-900/20' : 'profit-leader') : ''}
                                >
                                    {/* Favorite Star & Alarm Bell */}
                                    <td className="text-center">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleToggleFavorite(node.itemId)}
                                                className={`text-lg hover:scale-110 transition-transform ${node.isFavorite ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400'
                                                    }`}
                                                title={node.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                            >
                                                {node.isFavorite ? '★' : '☆'}
                                            </button>
                                            <button
                                                onClick={() => handleToggleAlarm(node.itemId)}
                                                className={`text-lg hover:scale-110 transition-transform ${node.hasAlarm ? 'text-blue-400' : 'text-gray-600 hover:text-blue-400'
                                                    }`}
                                                title={node.hasAlarm ? 'Remove alarm' : 'Add alarm (plays sound when node spawns)'}
                                            >
                                                {node.hasAlarm ? '🔔' : '🔕'}
                                            </button>
                                        </div>
                                    </td>

                                    {/* Item Name */}
                                    <td>
                                        <div className="flex items-center gap-3">
                                            {/* Item Icon */}
                                            <div className="w-10 h-10 flex-shrink-0 rounded bg-black/30 flex items-center justify-center overflow-hidden">
                                                {iconUrl ? (
                                                    <img
                                                        src={iconUrl}
                                                        alt={node.itemName}
                                                        className="w-full h-full object-contain"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <span className="text-lg opacity-60">
                                                        {CLASS_ICONS[node.gatheringClass]}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`font-medium ${isLeader ? (isScripMode ? 'text-purple-300' : 'text-gold-bright') : 'text-gray-100'}`}>
                                                        {node.itemName}
                                                    </span>
                                                    {isLeader && (
                                                        <span className={isScripMode ? 'px-1.5 py-0.5 text-xs rounded bg-purple-700/50 text-purple-300 border border-purple-600' : 'profit-badge'}>
                                                            👑 {isScripMode ? 'Best Scrip' : 'Profit Leader'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {/* Class badge */}
                                                    <span className={`class-badge ${node.gatheringClass === 'Miner' ? 'class-miner' : 'class-botanist'}`}>
                                                        {CLASS_ICONS[node.gatheringClass]} {node.gatheringClass}
                                                    </span>

                                                    {/* Level Badge */}
                                                    {node.level && (
                                                        <span className="px-2 py-0.5 text-xs rounded border border-gray-700 bg-gray-800/80 text-gray-300 font-mono">
                                                            Lv {node.level}
                                                        </span>
                                                    )}

                                                    {/* Type Badges */}
                                                    {node.isLegendary && (
                                                        <span className="px-2 py-0.5 text-xs rounded border border-yellow-600/30 bg-yellow-900/20 text-yellow-500 flex items-center gap-1 font-medium">
                                                            <span>🌟</span> Legendary
                                                        </span>
                                                    )}
                                                    {node.isEphemeral && (
                                                        <span className="px-2 py-0.5 text-xs rounded border border-cyan-600/30 bg-cyan-900/20 text-cyan-400 flex items-center gap-1 font-medium">
                                                            <span>⏳</span> Ephemeral
                                                        </span>
                                                    )}

                                                    {/* Expansion badge - clickable to open guide */}
                                                    <button
                                                        onClick={() => onOpenGuide?.(node.expansion)}
                                                        className={`expansion-badge expansion-${node.expansion} hover:brightness-125 transition-all cursor-pointer`}
                                                        title={`How to unlock ${node.expansion} nodes`}
                                                    >
                                                        {node.expansion} 📖
                                                    </button>

                                                    {/* Usage badge */}
                                                    {node.usageData && (
                                                        <span
                                                            className={`px-2 py-0.5 text-xs rounded border ${getUsagePriorityColor(node.usageData.priority)}`}
                                                            title={node.usageData.detail}
                                                        >
                                                            {node.usageData.tags[0]}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Price / Scrip Value */}
                                    <td>
                                        {isScripMode ? (
                                            node.scripValue > 0 ? (
                                                <div className={`text-lg font-bold ${scripTypeColor?.text || 'text-purple-400'}`}>
                                                    {node.scripValue}
                                                </div>
                                            ) : (
                                                <span className="text-gray-600 text-sm italic">No scrip</span>
                                            )
                                        ) : (
                                            node.priceData.hqPrice || node.priceData.nqPrice ? (
                                                <div className="space-y-0.5">
                                                    {node.priceData.hqPrice > 0 && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-green-400 font-medium">HQ</span>
                                                            <span className="gil-amount gil-hq">
                                                                {node.priceData.hqPrice.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {node.priceData.nqPrice > 0 && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-500 font-medium">NQ</span>
                                                            <span className="gil-amount gil-nq">
                                                                {node.priceData.nqPrice.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-600 text-sm italic">No data</span>
                                            )
                                        )}
                                    </td>

                                    {/* Est. Value / Scrip Type */}
                                    <td>
                                        {isScripMode ? (
                                            node.scripType ? (
                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${scripTypeColor?.text || ''} ${scripTypeColor?.bg || ''}`}>
                                                    {node.scripType}
                                                </span>
                                            ) : (
                                                <span className="text-gray-600">—</span>
                                            )
                                        ) : (
                                            node.estimatedValue > 0 ? (
                                                <div>
                                                    <span className={`gil-amount text-lg ${isLeader ? 'text-gold-bright' : 'text-gray-100'}`}>
                                                        {node.estimatedValue.toLocaleString()}
                                                    </span>
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                        × {DEFAULT_YIELD} yield
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-600">—</span>
                                            )
                                        )}
                                    </td>

                                    {/* Gil/Hour or Scrip/Hour */}
                                    <td>
                                        {isScripMode ? (
                                            node.scripsPerHour > 0 ? (
                                                <div className={`font-mono font-semibold ${isLeader ? 'text-purple-300' : 'text-purple-400'}`}>
                                                    {node.scripsPerHour.toLocaleString()}
                                                    <span className="text-xs text-gray-500 font-normal">/hr</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-600">—</span>
                                            )
                                        ) : (
                                            node.gilPerHour > 0 ? (
                                                <div className={`font-mono font-semibold ${isLeader ? 'text-gold-bright' : 'text-green-400'}`}>
                                                    {node.gilPerHour >= 1000
                                                        ? `${(node.gilPerHour / 1000).toFixed(1)}k`
                                                        : node.gilPerHour.toLocaleString()}
                                                    <span className="text-xs text-gray-500 font-normal">/hr</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-600">—</span>
                                            )
                                        )}
                                    </td>

                                    {/* Location */}
                                    <td>
                                        <div>
                                            <div className="text-gray-100 font-medium">{node.zone}</div>
                                            <div className="text-xs text-gray-600 mb-1">{node.coordinates}</div>
                                            <button
                                                onClick={() => handleCopyTeleport(node)}
                                                className="teleport-btn"
                                                title="Click to copy teleport macro"
                                            >
                                                📍 {node.nearestAetheryte}
                                                {copiedId === node.itemId && (
                                                    <span className="text-green-400">✓</span>
                                                )}
                                            </button>
                                        </div>
                                    </td>

                                    {/* Spawn Time */}
                                    <td>
                                        <div>
                                            <div className="text-gray-100 font-mono text-sm">
                                                {formatET(node.etSpawnStart)} - {formatET(node.etSpawnEnd)}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                Slot {node.slot}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Status */}
                                    <td>
                                        {node.isActive ? (
                                            <span className="badge-active">
                                                ● Active Now
                                            </span>
                                        ) : (
                                            <div>
                                                <span className="badge-upcoming">
                                                    ○ Upcoming
                                                </span>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    in {etMinutesToRealTime(node.minutesUntilSpawn)}
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Table footer */}
            <div className="px-4 py-3 bg-black/20 border-t border-gray-800/50 text-xs text-gray-500 flex items-center justify-between">
                <div>
                    <span className="text-gold">Est. Value</span> = Best price × {DEFAULT_YIELD} yield •
                    Prices from <span className="text-blue-400">Universalis</span> (5min cache)
                </div>
                <div className="text-gray-600">
                    ★ = favorite • Click location to copy teleport
                </div>
            </div>
        </div>
    );
}
