import { useState, useEffect, useCallback, useRef } from 'react';
import WorldSelector from '../components/WorldSelector';
import Filters from '../components/Filters';
import NodeTable from '../components/NodeTable';
import FolkloreGuide from '../components/FolkloreGuide';
import EorzeanClock from '../components/EorzeanClock';
import { fetchItemIcons } from '../utils/xivapi';
import { requestNotificationPermission, isNotificationsEnabled, showNodeNotification, setNotificationsPreference, copyTeleportMacro } from '../utils/notifications';
import { getAlarms, playAlarmSound } from '../utils/alarms';
import { timedNodeScrips } from '../data/timedNodeScrips';
import { formatET } from '../utils/eorzeanTime';
import { expansions } from '../data/ffxivData';
import { useFilters } from '../context/FilterContext';

const WEATHER_ICONS = {
    'Gales': '💨',
    'Rain': '🌧️',
    'Showers': '🌧️',
    'Clear': '☀️',
    'Fair': '🌤️',
    'Fog': '🌫️',
    'Clouds': '☁️',
    'Thunder': '⛈️',
    'Snow': '❄️'
};

// ============================================
// NODES TAB COMPONENT
// ============================================
function NodesTab({ world }) {
    const getStoredJSON = (key, fallback) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : fallback;
        } catch {
            return fallback;
        }
    };

    const [gatheringClass, setGatheringClass] = useState(() => {
        return localStorage.getItem('gathering-gold-filter-class') || 'All';
    });
    const [selectedExpansions, setSelectedExpansions] = useState(() => {
        return getStoredJSON('gathering-gold-filter-expansions', []);
    });
    const [selectedScripTypes, setSelectedScripTypes] = useState(() => {
        return getStoredJSON('gathering-gold-filter-scrip-types', []);
    });
    const [selectedNodeTypes, setSelectedNodeTypes] = useState(() => {
        return getStoredJSON('gathering-gold-filter-node-types', []);
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [allNodes, setAllNodes] = useState([]);
    const [nodes, setNodes] = useState([]);
    const [prices, setPrices] = useState({});
    const [icons, setIcons] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [notificationsEnabled, setNotificationsEnabled] = useState(isNotificationsEnabled());
    const [filterSoundEnabled, setFilterSoundEnabled] = useState(() => {
        return localStorage.getItem('gathering-gold-filter-sound-enabled') === 'true';
    });
    const [showGuide, setShowGuide] = useState(false);
    const [selectedGuideExpansion, setSelectedGuideExpansion] = useState('DT');
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem('nodesViewMode') || 'gold';
    });

    const previousActiveIdsRef = useRef(new Set());

    // Persistence Effects
    useEffect(() => {
        localStorage.setItem('nodesViewMode', viewMode);
    }, [viewMode]);

    useEffect(() => {
        localStorage.setItem('gathering-gold-filter-class', gatheringClass);
    }, [gatheringClass]);

    useEffect(() => {
        localStorage.setItem('gathering-gold-filter-expansions', JSON.stringify(selectedExpansions));
    }, [selectedExpansions]);

    useEffect(() => {
        localStorage.setItem('gathering-gold-filter-scrip-types', JSON.stringify(selectedScripTypes));
    }, [selectedScripTypes]);

    useEffect(() => {
        localStorage.setItem('gathering-gold-filter-node-types', JSON.stringify(selectedNodeTypes));
    }, [selectedNodeTypes]);

    useEffect(() => {
        localStorage.setItem('gathering-gold-filter-sound-enabled', filterSoundEnabled);
    }, [filterSoundEnabled]);

    const isNodeVisible = useCallback((node) => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (!node.itemName.toLowerCase().includes(query) &&
                !node.zone.toLowerCase().includes(query)) {
                return false;
            }
        }
        if (selectedExpansions.length > 0 && !selectedExpansions.includes(node.expansion)) {
            return false;
        }
        if (selectedNodeTypes.length > 0) {
            const matchesType = selectedNodeTypes.some(type => {
                if (type === 'Legendary') return node.isLegendary;
                if (type === 'Ephemeral') return node.isEphemeral;
                if (type === 'Collectable') return node.isCollectable;
                return false;
            });
            if (!matchesType) return false;
        }
        if (viewMode === 'scrip' && selectedScripTypes.length > 0) {
            const scripData = timedNodeScrips[node.itemId];
            if (!scripData || !selectedScripTypes.includes(scripData.scrip)) {
                return false;
            }
        }
        return true;
    }, [searchQuery, selectedExpansions, selectedNodeTypes, selectedScripTypes, viewMode]);

    useEffect(() => {
        const filtered = allNodes.filter(isNodeVisible);
        setNodes(filtered);
    }, [allNodes, isNodeVisible]);

    useEffect(() => {
        if (allNodes.length === 0) return;
        const currentActiveIds = new Set(allNodes.filter(n => n.isActive).map(n => n.itemId));
        if (previousActiveIdsRef.current.size === 0 && currentActiveIds.size > 0) {
            previousActiveIdsRef.current = currentActiveIds;
            return;
        }
        const newNodes = allNodes.filter(
            node => node.isActive && !previousActiveIdsRef.current.has(node.itemId)
        );
        if (newNodes.length > 0) {
            if (notificationsEnabled) {
                newNodes.forEach(node => showNodeNotification(node));
            }
            const alarms = getAlarms();
            const hasPersonalAlarm = newNodes.some(node => alarms.has(node.itemId));
            let shouldPlayCleanSound = false;
            if (filterSoundEnabled) {
                const hasVisibleSpawn = newNodes.some(node => isNodeVisible(node));
                if (hasVisibleSpawn && !hasPersonalAlarm) {
                    shouldPlayCleanSound = true;
                }
            }
            if (hasPersonalAlarm || shouldPlayCleanSound) {
                playAlarmSound();
            }
        }
        previousActiveIdsRef.current = currentActiveIds;
    }, [allNodes, notificationsEnabled, filterSoundEnabled, isNodeVisible]);

    const handleToggleNotifications = async () => {
        if (notificationsEnabled) {
            setNotificationsPreference(false);
            setNotificationsEnabled(false);
        } else {
            const granted = await requestNotificationPermission();
            if (granted) {
                setNotificationsPreference(true);
            }
            setNotificationsEnabled(granted);
        }
    };

    const fetchNodes = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const params = new URLSearchParams({
                lookAhead: '12',
                gatheringClass,
                expansion: 'All'
            });
            const response = await fetch(`/api/nodes?${params}`);
            if (!response.ok) throw new Error('Failed to fetch nodes');
            const data = await response.json();
            setAllNodes(data.nodes || []);
            setLastUpdate(new Date());
        } catch (err) {
            setError(err.message);
            setNodes([]);
        } finally {
            setIsLoading(false);
        }
    }, [gatheringClass]);

    const fetchPrices = useCallback(async () => {
        if (!world || nodes.length === 0) {
            setPrices({});
            return;
        }
        try {
            const itemIds = nodes.map(n => n.itemId).join(',');
            const response = await fetch(`/api/prices/${encodeURIComponent(world)}/${itemIds}`);
            if (!response.ok) throw new Error('Failed to fetch prices');
            const data = await response.json();
            setPrices(data.prices || {});
        } catch (err) {
            console.error('Price fetch error:', err);
        }
    }, [world, nodes]);

    const loadIcons = useCallback(async () => {
        if (nodes.length === 0) return;
        try {
            const itemIds = nodes.map(n => n.itemId);
            const iconMap = await fetchItemIcons(itemIds);
            const iconObj = {};
            iconMap.forEach((url, id) => {
                iconObj[id] = url;
            });
            setIcons(prev => ({ ...prev, ...iconObj }));
        } catch (err) {
            console.error('Icon fetch error:', err);
        }
    }, [nodes]);

    useEffect(() => {
        fetchNodes();
        const interval = setInterval(fetchNodes, 30000);
        return () => clearInterval(interval);
    }, [fetchNodes]);

    useEffect(() => {
        fetchPrices();
    }, [fetchPrices]);

    useEffect(() => {
        loadIcons();
    }, [loadIcons]);

    return (
        <>
            {/* Filters */}
            <div className="card p-4 mb-6">
                <Filters
                    gatheringClass={gatheringClass}
                    onGatheringClassChange={setGatheringClass}
                    selectedExpansions={selectedExpansions}
                    onExpansionsChange={setSelectedExpansions}
                    selectedScripTypes={selectedScripTypes}
                    onScripTypesChange={setSelectedScripTypes}
                    selectedNodeTypes={selectedNodeTypes}
                    onNodeTypesChange={setSelectedNodeTypes}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    viewMode={viewMode}
                />
            </div>

            {/* Header Row */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-display font-semibold text-gray-100 uppercase tracking-wide">
                        Active & Upcoming Nodes
                    </h2>
                    <button
                        onClick={() => setShowGuide(true)}
                        className="text-xs text-purple-400 hover:text-purple-300"
                    >
                        📚 Guide
                    </button>
                    <div className="flex rounded overflow-hidden border border-gray-700">
                        <button
                            onClick={() => setViewMode('gold')}
                            className={`px-3 py-1 text-xs font-medium transition-colors ${viewMode === 'gold'
                                ? 'bg-gold/30 text-gold border-r border-gold/30'
                                : 'bg-gray-800 text-gray-400 hover:text-gray-200 border-r border-gray-700'
                                }`}
                        >
                            💰 Gold
                        </button>
                        <button
                            onClick={() => setViewMode('scrip')}
                            className={`px-3 py-1 text-xs font-medium transition-colors ${viewMode === 'scrip'
                                ? 'bg-purple-700/30 text-purple-300'
                                : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            💜 Scrip
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setFilterSoundEnabled(!filterSoundEnabled)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${filterSoundEnabled
                            ? 'bg-purple-900/30 text-purple-400 border border-purple-700/50'
                            : 'bg-gray-800/50 text-gray-500 border border-gray-700/50 hover:text-gray-300'
                            }`}
                        title={filterSoundEnabled ? 'Sound enabled for filtered nodes' : 'Enable sound for filtered nodes'}
                    >
                        {filterSoundEnabled ? '🔊' : '🔇'}
                        <span className="hidden sm:inline">
                            {filterSoundEnabled ? 'Filter Sound On' : 'Filter Sound Off'}
                        </span>
                    </button>
                    <button
                        onClick={handleToggleNotifications}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${notificationsEnabled
                            ? 'bg-green-900/30 text-green-400 border border-green-700/50'
                            : 'bg-gray-800/50 text-gray-500 border border-gray-700/50 hover:text-gray-300'
                            }`}
                        title={notificationsEnabled ? 'Notifications enabled' : 'Enable notifications'}
                    >
                        {notificationsEnabled ? '🔔' : '🔕'}
                        <span className="hidden sm:inline">
                            {notificationsEnabled ? 'Alerts On' : 'Alerts Off'}
                        </span>
                    </button>
                    <div className="text-xs text-gray-500">
                        Next 4 ET hours • <span className="text-gold">{nodes.length}</span> nodes
                        {lastUpdate && (
                            <span className="ml-2 text-gray-600">
                                Updated: {lastUpdate.toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-800/50 rounded text-red-400 text-sm">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <NodeTable
                nodes={nodes}
                prices={prices}
                icons={icons}
                isLoading={isLoading}
                world={world}
                viewMode={viewMode}
                onOpenGuide={(exp) => {
                    setSelectedGuideExpansion(exp);
                    setShowGuide(true);
                }}
            />

            <FolkloreGuide
                isOpen={showGuide}
                onClose={() => setShowGuide(false)}
                defaultExpansion={selectedGuideExpansion}
            />
        </>
    );
}

// ============================================
// FISHING TAB COMPONENT
// ============================================
function FishingTab({ world }) {
    const [expansion, setExpansion] = useState('All');
    const [holes, setHoles] = useState([]);
    const [prices, setPrices] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [copiedItem, setCopiedItem] = useState(null);

    const handleCopyTeleport = async (aetheryte) => {
        const success = await copyTeleportMacro(aetheryte);
        if (success) {
            setCopiedItem(aetheryte);
            setTimeout(() => setCopiedItem(null), 2000);
        }
    };

    const fetchHoles = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const params = new URLSearchParams({
                lookAhead: '6',
                expansion
            });
            const response = await fetch(`/api/fishing?${params}`);
            if (!response.ok) throw new Error('Failed to fetch fishing holes');
            const data = await response.json();
            setHoles(data.holes || []);
            setLastUpdate(new Date());
        } catch (err) {
            setError(err.message);
            setHoles([]);
        } finally {
            setIsLoading(false);
        }
    }, [expansion]);

    const fetchPrices = useCallback(async () => {
        if (!world || holes.length === 0) {
            setPrices({});
            return;
        }
        try {
            const itemIds = holes.map(h => h.itemId).join(',');
            const response = await fetch(`/api/prices/${encodeURIComponent(world)}/${itemIds}`);
            if (!response.ok) throw new Error('Failed to fetch prices');
            const data = await response.json();
            setPrices(data.prices || {});
        } catch (err) {
            console.error('Price fetch error:', err);
        }
    }, [world, holes]);

    useEffect(() => {
        fetchHoles();
        const interval = setInterval(fetchHoles, 30000);
        return () => clearInterval(interval);
    }, [fetchHoles]);

    useEffect(() => {
        fetchPrices();
    }, [fetchPrices]);

    const formatTimeWindow = (start, end) => {
        return `${formatET(start)} - ${formatET(end)}`;
    };

    return (
        <>
            {/* Expansion Filter */}
            <div className="card p-4 mb-6">
                <label className="block text-xs text-gray-500 mb-2">Expansion</label>
                <div className="flex gap-2 flex-wrap">
                    {expansions.map(exp => (
                        <button
                            key={exp.value}
                            onClick={() => setExpansion(exp.value)}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${expansion === exp.value
                                ? 'bg-gold/20 text-gold border border-gold/30'
                                : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            {exp.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Header Row */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-semibold text-gray-100 uppercase tracking-wide">
                    🎣 Timed Fishing Holes
                </h2>
                <div className="text-xs text-gray-500">
                    Next 6 ET hours • <span className="text-gold">{holes.length}</span> spots
                    {lastUpdate && (
                        <span className="ml-2 text-gray-600">
                            Updated: {lastUpdate.toLocaleTimeString()}
                        </span>
                    )}
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-800/50 rounded text-red-400 text-sm">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {isLoading && holes.length === 0 && (
                <div className="card p-8 text-center text-gray-500">
                    Loading fishing holes...
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {holes.map((hole, idx) => {
                    const price = prices[hole.itemId];
                    const isActive = hole.isActive;

                    return (
                        <div
                            key={idx}
                            className={`card p-4 transition-all ${isActive
                                ? 'ring-2 ring-green-500/50 bg-green-900/10'
                                : ''
                                }`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-100 flex items-center gap-2">
                                        🐟 {hole.itemName}
                                        {isActive && (
                                            <span className="px-1.5 py-0.5 text-xs bg-green-600/30 text-green-400 rounded">
                                                ACTIVE
                                            </span>
                                        )}
                                    </h3>
                                    <div className="text-xs text-gray-400 mt-0.5">
                                        {hole.fishingHole} • {hole.zone}
                                    </div>
                                </div>
                                <span className="text-xs px-2 py-0.5 bg-gray-700/50 rounded text-gray-400">
                                    {hole.expansion}
                                </span>
                            </div>

                            <div className="mb-3 p-2 bg-black/30 rounded">
                                <div className="text-xs text-gray-500 mb-1">Spawn Window (ET)</div>
                                <div className="text-lg font-mono text-blue-400">
                                    {formatTimeWindow(hole.etSpawnStart, hole.etSpawnEnd)}
                                </div>
                                {!isActive && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        {Math.floor(hole.minutesUntilSpawn / 60)}h {hole.minutesUntilSpawn % 60}m until spawn
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                                <div>
                                    <span className="text-gray-500">Bait:</span>
                                    <div className="text-gray-200 mt-0.5">
                                        🪱 {hole.bait?.join(', ') || 'Unknown'}
                                    </div>
                                </div>
                                {hole.weather && (
                                    <div>
                                        <span className="text-gray-500">Weather:</span>
                                        <div className="text-yellow-400 mt-0.5">
                                            {hole.weather.map(w => `${WEATHER_ICONS[w] || '🌈'} ${w}`).join(', ')}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {world && price && (
                                <div className="mb-3 p-2 bg-gold/10 rounded border border-gold/20">
                                    <div className="text-xs text-gray-500 mb-1">Market Price</div>
                                    <div className="text-xl font-bold text-gold">
                                        {(price.hqPrice || price.nqPrice || 0).toLocaleString()}
                                        <span className="text-xs text-gray-400 ml-1">gil</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-400">
                                    📍 {hole.coordinates}
                                </div>
                                <button
                                    onClick={() => handleCopyTeleport(hole.nearestAetheryte)}
                                    className="teleport-btn text-xs"
                                >
                                    {copiedItem === hole.nearestAetheryte ? '✓ Copied!' : `📍 ${hole.nearestAetheryte}`}
                                </button>
                            </div>

                            {hole.notes && (
                                <div className="mt-2 text-xs text-gray-500 italic">
                                    💡 {hole.notes}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {holes.length === 0 && !isLoading && (
                <div className="card p-8 text-center text-gray-500">
                    No fishing holes available in the selected time window.
                </div>
            )}
        </>
    );
}

// ============================================
// MAIN GATHERING PAGE
// ============================================

export default function GatheringPage() {
    const [activeTab, setActiveTab] = useState('nodes');
    const { selectedWorld } = useFilters();

    return (
        <div className="px-4 py-6 ffxiv-page min-h-screen">
            {/* Header with tab toggle */}
            <div className="flex items-center justify-between mb-8 pb-4" style={{ borderBottom: '1px solid rgba(255, 215, 0, 0.2)' }}>
                <div className="flex items-center gap-4">
                    <img src="/miner.png" alt="Gathering" className="w-16 h-16 rounded-lg object-cover"
                        style={{ border: '2px solid rgba(255, 215, 0, 0.4)', boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)' }} />
                    <div>
                        <h1 className="text-3xl font-bold mb-1 ffxiv-title">
                            Gathering Log
                        </h1>
                        <p className="text-sm text-blue-200" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                            Track timed nodes and fishing spots for maximum profit
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('nodes')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'nodes'
                            ? 'bg-gradient-to-r from-blue-900/80 to-blue-800/80 text-gold border border-gold shadow-[0_0_10px_rgba(255,215,0,0.3)]'
                            : 'bg-black/40 text-blue-300 border border-transparent hover:bg-blue-900/40 hover:text-white'
                            }`}
                    >
                        <span>⛏️</span> Nodes
                    </button>
                    <button
                        onClick={() => setActiveTab('fishing')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'fishing'
                            ? 'bg-gradient-to-r from-blue-900/80 to-blue-800/80 text-gold border border-gold shadow-[0_0_10px_rgba(255,215,0,0.3)]'
                            : 'bg-black/40 text-blue-300 border border-transparent hover:bg-blue-900/40 hover:text-white'
                            }`}
                    >
                        <span>🎣</span> Fishing
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="animate-fadeIn">
                {activeTab === 'nodes' && <NodesTab world={selectedWorld} />}
                {activeTab === 'fishing' && <FishingTab world={selectedWorld} />}
            </div>
        </div>
    );
}
