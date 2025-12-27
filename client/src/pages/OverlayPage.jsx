import { useState, useEffect, useCallback } from 'react';
import { getAlarms, toggleAlarm, playAlarmSound } from '../utils/alarms';
import { worlds } from '../data/ffxivData';

// Calculate current Eorzean time
function getEorzeanTime() {
    const EORZEA_MULTIPLIER = 3600 / 175;
    const now = Date.now();
    const eorzeaMs = now * EORZEA_MULTIPLIER;
    const eorzeaDate = new Date(eorzeaMs);
    return {
        hours: eorzeaDate.getUTCHours(),
        minutes: eorzeaDate.getUTCMinutes()
    };
}

// Calculate minutes until next 2-hour ET mark
function getMinutesUntilNextSpawnWindow() {
    const et = getEorzeanTime();
    const currentMinutes = et.hours * 60 + et.minutes;
    const nextSpawnHour = Math.ceil(et.hours / 2) * 2;
    const nextSpawnMinutes = nextSpawnHour * 60;
    let minutesUntil = nextSpawnMinutes - currentMinutes;
    if (minutesUntil <= 0) minutesUntil += 120;
    const realMinutes = Math.round(minutesUntil * (175 / 3600) * 60 / 60);
    return { etMinutes: minutesUntil, realMinutes };
}

// Circular progress ring
function CountdownRing({ progress, size = 40 }) {
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress * circumference);

    return (
        <svg width={size} height={size} className="transform -rotate-90">
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#374151" strokeWidth={strokeWidth} />
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#fbbf24" strokeWidth={strokeWidth}
                strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000" />
        </svg>
    );
}

const CLASS_ICONS = { Miner: '⛏️', Botanist: '🌿', Fisher: '🎣' };
const MIN_GIL_OPTIONS = [0, 500, 1000, 2000, 5000, 10000];
const EXPANSION_OPTIONS = ['All', 'DT', 'EW', 'ShB', 'SB', 'HW', 'ARR'];

export default function OverlayPage() {
    // Read filters from localStorage
    const [world, setWorld] = useState(() => localStorage.getItem('overlay-world') || localStorage.getItem('selectedWorld') || 'Ragnarok');
    const [expansion, setExpansion] = useState(() => localStorage.getItem('overlay-expansion') || 'All');
    const [nodes, setNodes] = useState([]);
    const [prices, setPrices] = useState({});
    const [countdown, setCountdown] = useState({ etMinutes: 120, realMinutes: 6 });
    const [alarms, setAlarms] = useState(getAlarms());
    const [spawnAlarmEnabled, setSpawnAlarmEnabled] = useState(() => localStorage.getItem('spawn-window-alarm') === 'true');
    const [minGilThreshold, setMinGilThreshold] = useState(() => parseInt(localStorage.getItem('min-gil-alarm') || '0'));
    const [showSettings, setShowSettings] = useState(false);

    // Filter nodes by expansion
    const filteredNodes = expansion === 'All'
        ? nodes
        : nodes.filter(n => n.expansion === expansion);

    // Get nodes with prices
    const nodesWithData = filteredNodes.map(node => {
        const priceData = prices[node.itemId];
        const price = priceData?.minPrice || priceData?.nqPrice || 0;
        return { ...node, price };
    });

    const active = nodesWithData.filter(n => n.isActive && n.price > 0).sort((a, b) => b.price - a.price).slice(0, 2);
    // Upcoming: nodes spawning in the NEXT spawn window (within 2 ET hours = 120 ET minutes)
    // API returns minutesUntilSpawn in Eorzean Time minutes, not real minutes
    const upcomingThreshold = 120; // 2 ET hours = ~7 real minutes
    const upcoming = nodesWithData.filter(n => !n.isActive && n.price > 0 && n.minutesUntilSpawn <= upcomingThreshold).sort((a, b) => b.price - a.price).slice(0, 1);

    // Check if any active/upcoming node meets min gil threshold
    const hasValuableNode = [...active, ...upcoming].some(n => n.price >= minGilThreshold);

    // Update countdown
    useEffect(() => {
        const update = () => {
            const newCountdown = getMinutesUntilNextSpawnWindow();
            // Trigger alarm only if enabled AND has valuable node above threshold
            if (spawnAlarmEnabled &&
                countdown.realMinutes <= 1 &&
                newCountdown.realMinutes > 5 &&
                hasValuableNode) {
                playAlarmSound();
            }
            setCountdown(newCountdown);
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [spawnAlarmEnabled, countdown.realMinutes, hasValuableNode]);

    // Fetch nodes
    useEffect(() => {
        async function fetchNodes() {
            try {
                const response = await fetch('/api/nodes?lookAhead=12&gatheringClass=All&expansion=All');
                const data = await response.json();
                setNodes(data.nodes || []);
            } catch (err) {
                console.error('Failed to fetch nodes:', err);
            }
        }
        fetchNodes();
        const interval = setInterval(fetchNodes, 30000);
        return () => clearInterval(interval);
    }, []);

    // Fetch prices
    const fetchPrices = useCallback(async () => {
        if (!world || nodes.length === 0) return;
        try {
            const itemIds = [...new Set(nodes.map(n => n.itemId))].slice(0, 100);
            const response = await fetch(`/api/prices/${encodeURIComponent(world)}/${itemIds.join(',')}`);
            const data = await response.json();
            setPrices(data.prices || {});
        } catch (err) {
            console.error('Failed to fetch prices:', err);
        }
    }, [world, nodes]);

    useEffect(() => { fetchPrices(); }, [fetchPrices]);

    const formatGil = (amount) => {
        if (!amount) return '—';
        if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
        return amount.toLocaleString();
    };

    // Convert Eorzean minutes to real minutes (1 ET hour = 175 real seconds)
    const etToRealMinutes = (etMinutes) => {
        const realSeconds = etMinutes * (175 / 60);
        return Math.round(realSeconds / 60);
    };

    const handleTeleport = (aetheryte) => {
        navigator.clipboard.writeText(`/teleport ${aetheryte}`);
    };

    const handleToggleAlarm = (itemId) => {
        const isNowEnabled = toggleAlarm(itemId);
        if (isNowEnabled) playAlarmSound();
        setAlarms(getAlarms());
    };

    const handleMinGilChange = (value) => {
        setMinGilThreshold(value);
        localStorage.setItem('min-gil-alarm', value.toString());
    };

    const progress = countdown.etMinutes / 120;

    return (
        <div className="bg-gray-900 text-white p-1.5" style={{ minWidth: '260px', maxWidth: '300px' }}>
            {/* Draggable Title Bar (for Electron frameless window) */}
            <div
                className="flex items-center justify-between mb-1 py-1 cursor-move select-none"
                style={{ WebkitAppRegion: 'drag' }}
            >
                <span className="text-xs font-semibold text-gold">🌟 Gathering Gold</span>
                <span className="text-xs text-gray-500">{world}</span>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-1 pb-1 border-b border-gray-700" style={{ WebkitAppRegion: 'no-drag' }}>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <CountdownRing progress={progress} size={36} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-yellow-400">{countdown.realMinutes}m</span>
                        </div>
                    </div>
                    <span className="text-xs text-gray-400">Next spawn</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="text-sm hover:scale-110 transition-transform opacity-60 hover:opacity-100"
                        title="Settings"
                    >
                        ⚙️
                    </button>
                    <button
                        onClick={() => { setSpawnAlarmEnabled(!spawnAlarmEnabled); localStorage.setItem('spawn-window-alarm', (!spawnAlarmEnabled).toString()); }}
                        className={`text-xl ${spawnAlarmEnabled ? 'opacity-100' : 'opacity-40'}`}
                    >
                        {spawnAlarmEnabled ? '🔔' : '🔕'}
                    </button>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="mb-1.5 p-1.5 bg-gray-800 rounded border border-gray-700">
                    <div className="text-xs text-gray-400 mb-1">Server:</div>
                    <select
                        value={world}
                        onChange={(e) => { setWorld(e.target.value); localStorage.setItem('overlay-world', e.target.value); }}
                        className="w-full mb-2 text-xs px-1.5 py-1 rounded bg-gray-700 border border-gray-600 text-white"
                    >
                        {worlds.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                    <div className="text-xs text-gray-400 mb-1">Expansion:</div>
                    <div className="flex flex-wrap gap-1 mb-2">
                        {EXPANSION_OPTIONS.map(exp => (
                            <button
                                key={exp}
                                onClick={() => { setExpansion(exp); localStorage.setItem('overlay-expansion', exp); }}
                                className={`text-xs px-1.5 py-0.5 rounded ${expansion === exp ? 'bg-gold text-black font-semibold' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                {exp}
                            </button>
                        ))}
                    </div>
                    <div className="text-xs text-gray-400 mb-1">Min gil for alarm:</div>
                    <div className="flex flex-wrap gap-1">
                        {MIN_GIL_OPTIONS.map(val => (
                            <button
                                key={val}
                                onClick={() => handleMinGilChange(val)}
                                className={`text-xs px-1.5 py-0.5 rounded ${minGilThreshold === val ? 'bg-yellow-500 text-black' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                {val === 0 ? 'Any' : formatGil(val)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Active Nodes */}
            <div className="mb-1">
                <h3 className="text-xs font-semibold text-green-400 uppercase mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    Active
                </h3>
                {active.length === 0 ? (
                    <div className="text-xs text-gray-500">None active</div>
                ) : (
                    <div className="space-y-1">
                        {active.map(node => (
                            <div key={`${node.itemId}-${node.etSpawnStart}`}
                                className="bg-green-900/20 border border-green-800/30 rounded p-1.5 cursor-pointer"
                                onClick={() => handleTeleport(node.nearestAetheryte)}
                            >
                                <div className="flex items-center gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); handleToggleAlarm(node.itemId); }}
                                        className={`text-sm ${alarms.has(node.itemId) ? '' : 'opacity-40'}`}>
                                        {alarms.has(node.itemId) ? '🔔' : '🔕'}
                                    </button>
                                    <span className="text-sm">{CLASS_ICONS[node.gatheringClass]}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium text-gray-100 truncate">{node.itemName}</div>
                                        <div className="text-xs text-gray-400 truncate">{node.zone}</div>
                                        <div className="text-xs text-green-400 truncate">📍 {node.nearestAetheryte}</div>
                                    </div>
                                    <span className="text-sm font-bold text-green-400">{formatGil(node.price)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upcoming Nodes */}
            <div>
                <h3 className="text-xs font-semibold text-yellow-400 uppercase mb-1 flex items-center gap-1">
                    ⏰ Upcoming
                </h3>
                {upcoming.length === 0 ? (
                    <div className="text-xs text-gray-500">None upcoming</div>
                ) : (
                    <div className="space-y-1">
                        {upcoming.map(node => (
                            <div key={`${node.itemId}-${node.etSpawnStart}`}
                                className="bg-yellow-900/10 border border-yellow-800/20 rounded p-1.5 cursor-pointer"
                                onClick={() => handleTeleport(node.nearestAetheryte)}
                            >
                                <div className="flex items-center gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); handleToggleAlarm(node.itemId); }}
                                        className={`text-sm ${alarms.has(node.itemId) ? '' : 'opacity-40'}`}>
                                        {alarms.has(node.itemId) ? '🔔' : '🔕'}
                                    </button>
                                    <span className="text-sm">{CLASS_ICONS[node.gatheringClass]}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium text-gray-100 truncate">{node.itemName}</div>
                                        <div className="text-xs text-gray-400 truncate">{node.zone}</div>
                                        <div className="text-xs text-yellow-400 truncate">📍 {node.nearestAetheryte} • ~{etToRealMinutes(node.minutesUntilSpawn)}m</div>
                                    </div>
                                    <span className="text-sm font-bold text-yellow-400">{formatGil(node.price)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-1 text-center text-xs text-gray-600">Click to copy teleport</div>
        </div>
    );
}
