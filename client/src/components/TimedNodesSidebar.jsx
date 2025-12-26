import { useState, useEffect, useCallback } from 'react';
import { useFilters } from '../context/FilterContext';
import { getAlarms, toggleAlarm, playAlarmSound } from '../utils/alarms';

const CLASS_ICONS = {
    Miner: '⛏️',
    Botanist: '🌿',
    Fisher: '🎣'
};

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

// Calculate minutes until next 2-hour ET mark (when nodes typically spawn)
function getMinutesUntilNextSpawnWindow() {
    const et = getEorzeanTime();
    const currentMinutes = et.hours * 60 + et.minutes;
    // Nodes spawn every 2 ET hours at :00
    const nextSpawnHour = Math.ceil(et.hours / 2) * 2;
    const nextSpawnMinutes = nextSpawnHour * 60;
    let minutesUntil = nextSpawnMinutes - currentMinutes;
    if (minutesUntil <= 0) minutesUntil += 120; // 2 hours = 120 minutes

    // Convert ET minutes to real minutes (1 ET minute ≈ 175/3600 real seconds = 2.92 real seconds)
    const realMinutes = Math.round(minutesUntil * (175 / 3600) * 60 / 60);
    return { etMinutes: minutesUntil, realMinutes };
}

// Circular progress component
function CountdownRing({ progress, size = 60 }) {
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress * circumference);

    return (
        <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#374151"
                strokeWidth={strokeWidth}
            />
            {/* Progress circle */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#fbbf24"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000"
            />
        </svg>
    );
}

export default function TimedNodesSidebar() {
    const { selectedWorld, selectedExpansion } = useFilters();
    const [nodes, setNodes] = useState([]);
    const [prices, setPrices] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [alarms, setAlarms] = useState(getAlarms());
    const [countdown, setCountdown] = useState({ etMinutes: 120, realMinutes: 6 });
    const [spawnAlarmEnabled, setSpawnAlarmEnabled] = useState(() => {
        return localStorage.getItem('spawn-window-alarm') === 'true';
    });

    // Toggle spawn window alarm
    const toggleSpawnAlarm = () => {
        const newValue = !spawnAlarmEnabled;
        setSpawnAlarmEnabled(newValue);
        localStorage.setItem('spawn-window-alarm', newValue.toString());
        if (newValue) {
            playAlarmSound(); // Test sound when enabling
        }
    };

    // Track if we should refresh nodes when countdown resets
    const [shouldRefresh, setShouldRefresh] = useState(false);

    // Update countdown every second and check for alarm + refresh
    useEffect(() => {
        const update = () => {
            const newCountdown = getMinutesUntilNextSpawnWindow();

            // Trigger alarm and refresh when countdown resets (goes from low to high = new spawn just started)
            // This happens when previous was < 1 min and now it's > 5 min (reset to ~6)
            if (countdown.realMinutes <= 1 && newCountdown.realMinutes > 5) {
                if (spawnAlarmEnabled) {
                    playAlarmSound();
                }
                // Trigger node refresh
                setShouldRefresh(true);
            }

            setCountdown(newCountdown);
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [spawnAlarmEnabled, countdown.realMinutes]);

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
            // Reset refresh flag after fetching
            if (shouldRefresh) {
                setShouldRefresh(false);
            }
        }
        fetchNodes();
        const interval = setInterval(fetchNodes, 30000);
        return () => clearInterval(interval);
    }, [shouldRefresh]);

    // Fetch prices
    const fetchPrices = useCallback(async () => {
        if (!selectedWorld || nodes.length === 0) return;

        setIsLoading(true);
        try {
            const itemIds = [...new Set(nodes.map(n => n.itemId))].slice(0, 100);
            const response = await fetch(`/api/prices/${encodeURIComponent(selectedWorld)}/${itemIds.join(',')}`);
            const data = await response.json();
            setPrices(data.prices || {});
        } catch (err) {
            console.error('Failed to fetch prices:', err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedWorld, nodes]);

    useEffect(() => {
        fetchPrices();
    }, [fetchPrices]);

    // Toggle alarm for a node
    const handleToggleAlarm = (itemId) => {
        const isNowEnabled = toggleAlarm(itemId);
        if (isNowEnabled) {
            playAlarmSound(); // Test sound when enabling
        }
        setAlarms(getAlarms());
    };

    // Filter and categorize nodes
    const getFilteredNodes = useCallback(() => {
        let filtered = nodes;

        if (selectedExpansion !== 'All') {
            filtered = filtered.filter(n => n.expansion === selectedExpansion);
        }

        const nodesWithData = filtered.map(node => {
            const priceData = prices[node.itemId];
            const price = priceData?.minPrice || priceData?.nqPrice || 0;
            return { ...node, price };
        });

        const active = nodesWithData
            .filter(n => n.isActive && n.price > 0)
            .sort((a, b) => b.price - a.price)
            .slice(0, 2);

        // Upcoming: nodes spawning in the NEXT spawn window (within 2 ET hours = 120 ET minutes)
        // API returns minutesUntilSpawn in Eorzean Time minutes, not real minutes
        const upcomingThreshold = 120; // 2 ET hours = ~7 real minutes
        const upcoming = nodesWithData
            .filter(n => !n.isActive && n.price > 0 && n.minutesUntilSpawn <= upcomingThreshold)
            .sort((a, b) => b.price - a.price) // Highest price first
            .slice(0, 2);

        return { active, upcoming };
    }, [nodes, prices, selectedExpansion]);

    const { active, upcoming } = getFilteredNodes();

    const formatGil = (amount) => {
        if (!amount) return '—';
        if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
        return amount.toLocaleString();
    };

    // Convert Eorzean minutes to real minutes (1 ET hour = 175 real seconds)
    const etToRealMinutes = (etMinutes) => {
        // 60 ET minutes = 175 real seconds, so 1 ET minute = 175/60 = 2.917 real seconds
        const realSeconds = etMinutes * (175 / 60);
        return Math.round(realSeconds / 60);
    };

    const handleTeleport = (aetheryte) => {
        navigator.clipboard.writeText(`/teleport ${aetheryte}`);
    };

    // Progress: 1.0 = just spawned, 0.0 = about to spawn
    const progress = countdown.etMinutes / 120;

    if (!selectedWorld) {
        return (
            <div className="text-xs text-gray-500 text-center p-2">
                Select a world to see prices
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Countdown Timer */}
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <CountdownRing progress={progress} size={50} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-yellow-400">
                                {countdown.realMinutes}m
                            </span>
                        </div>
                    </div>
                    <div className="text-left">
                        <div className="text-xs text-gray-400">Next spawn</div>
                        <div className="text-sm font-semibold text-yellow-400">
                            ~{countdown.realMinutes} min
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => window.open('/overlay', 'GatheringOverlay', 'width=320,height=400,toolbar=no,menubar=no,location=no')}
                        className="text-xl hover:scale-110 transition-transform opacity-60 hover:opacity-100"
                        title="Pop out as overlay"
                    >
                        ↗️
                    </button>
                    <button
                        onClick={toggleSpawnAlarm}
                        className={`text-2xl hover:scale-110 transition-transform ${spawnAlarmEnabled ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
                        title={spawnAlarmEnabled ? 'Disable spawn alarm' : 'Enable spawn alarm'}
                    >
                        {spawnAlarmEnabled ? '🔔' : '🔕'}
                    </button>
                </div>
            </div>

            {/* Active Nodes */}
            <div>
                <h3 className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Active Now
                </h3>
                {isLoading && active.length === 0 ? (
                    <div className="text-xs text-gray-500">Loading...</div>
                ) : active.length === 0 ? (
                    <div className="text-xs text-gray-500">No profitable nodes active</div>
                ) : (
                    <div className="space-y-2">
                        {active.map(node => (
                            <div key={`${node.itemId}-${node.etSpawnStart}`}
                                className="bg-green-900/20 border border-green-800/30 rounded p-2"
                            >
                                <div className="flex items-start gap-2">
                                    <button
                                        onClick={() => handleToggleAlarm(node.itemId)}
                                        className={`text-lg hover:scale-110 transition-transform ${alarms.has(node.itemId) ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
                                        title={alarms.has(node.itemId) ? 'Remove alarm' : 'Set alarm'}
                                    >
                                        {alarms.has(node.itemId) ? '🔔' : '🔕'}
                                    </button>
                                    <span className="text-lg">{CLASS_ICONS[node.gatheringClass]}</span>
                                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleTeleport(node.nearestAetheryte)}>
                                        <div className="font-medium text-sm text-gray-100 truncate">
                                            {node.itemName}
                                        </div>
                                        <div className="text-xs text-gray-400 truncate">
                                            {node.zone}
                                        </div>
                                        <div className="text-xs text-green-400 truncate">
                                            📍 {node.nearestAetheryte}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-green-400">
                                            {formatGil(node.price)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upcoming Nodes */}
            <div>
                <h3 className="text-xs font-semibold text-yellow-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <span className="text-yellow-400">⏰</span>
                    Coming Up
                </h3>
                {upcoming.length === 0 ? (
                    <div className="text-xs text-gray-500">No upcoming nodes</div>
                ) : (
                    <div className="space-y-2">
                        {upcoming.map(node => (
                            <div key={`${node.itemId}-${node.etSpawnStart}`}
                                className="bg-yellow-900/10 border border-yellow-800/20 rounded p-2"
                            >
                                <div className="flex items-start gap-2">
                                    <button
                                        onClick={() => toggleAlarm(node.itemId)}
                                        className={`text-lg hover:scale-110 transition-transform ${alarms.has(node.itemId) ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
                                        title={alarms.has(node.itemId) ? 'Remove alarm' : 'Set alarm'}
                                    >
                                        {alarms.has(node.itemId) ? '🔔' : '🔕'}
                                    </button>
                                    <span className="text-lg">{CLASS_ICONS[node.gatheringClass]}</span>
                                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleTeleport(node.nearestAetheryte)}>
                                        <div className="font-medium text-sm text-gray-100 truncate">
                                            {node.itemName}
                                        </div>
                                        <div className="text-xs text-gray-400 truncate">
                                            {node.zone}
                                        </div>
                                        <div className="text-xs text-yellow-400 truncate">
                                            📍 {node.nearestAetheryte} • ~{etToRealMinutes(node.minutesUntilSpawn)}m
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-yellow-400">
                                            {formatGil(node.price)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <p className="text-xs text-gray-600 text-center">
                🔔 = alarm • Click node for teleport
            </p>
        </div>
    );
}
