import { useState, useEffect } from 'react';
import {
    dailyItems,
    weeklyItems,
    customDeliveryNPCs,
    CUSTOM_DELIVERY_WEEKLY_CAP,
    getTimeUntilDailyReset,
    getTimeUntilWeeklyReset,
    getDailyKey,
    getWeeklyKey
} from '../data/checklistData';
import { copyTeleportMacro } from '../utils/notifications';

const STORAGE_KEY = 'gathering-gold-checklist';

// Load progress from localStorage
function loadProgress() {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        const dailyKey = getDailyKey();
        const weeklyKey = getWeeklyKey();

        // Reset daily items if new day
        if (data.dailyKey !== dailyKey) {
            data.dailyKey = dailyKey;
            data.daily = {};
            data.dailyCounters = {};
        }

        // Reset weekly items if new week
        if (data.weeklyKey !== weeklyKey) {
            data.weeklyKey = weeklyKey;
            data.weekly = {};
            data.weeklyCounters = {};
            data.customDeliveries = {};
            data.customDeliveryCount = 0;
        }

        return {
            dailyKey: data.dailyKey || dailyKey,
            weeklyKey: data.weeklyKey || weeklyKey,
            daily: data.daily || {},
            weekly: data.weekly || {},
            dailyCounters: data.dailyCounters || {},
            weeklyCounters: data.weeklyCounters || {},
            customDeliveries: data.customDeliveries || {},
            customDeliveryCount: data.customDeliveryCount || 0
        };
    } catch {
        return {
            dailyKey: getDailyKey(),
            weeklyKey: getWeeklyKey(),
            daily: {},
            weekly: {},
            dailyCounters: {},
            weeklyCounters: {},
            customDeliveries: {},
            customDeliveryCount: 0
        };
    }
}

// Save progress to localStorage
function saveProgress(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export default function ChecklistPage() {
    const [progress, setProgress] = useState(() => loadProgress());
    const [dailyTimer, setDailyTimer] = useState(getTimeUntilDailyReset());
    const [weeklyTimer, setWeeklyTimer] = useState(getTimeUntilWeeklyReset());
    const [activeTab, setActiveTab] = useState('all');
    const [copiedAetheryte, setCopiedAetheryte] = useState(null);
    const [expandedSections, setExpandedSections] = useState({ customDeliveries: false });

    // Update timers every minute
    useEffect(() => {
        const interval = setInterval(() => {
            const newDailyTimer = getTimeUntilDailyReset();
            const newWeeklyTimer = getTimeUntilWeeklyReset();

            setDailyTimer(newDailyTimer);
            setWeeklyTimer(newWeeklyTimer);

            // Check for resets and reload progress
            const currentProgress = loadProgress();
            if (currentProgress.dailyKey !== progress.dailyKey ||
                currentProgress.weeklyKey !== progress.weeklyKey) {
                setProgress(currentProgress);
            }
        }, 60000);
        return () => clearInterval(interval);
    }, [progress.dailyKey, progress.weeklyKey]);

    // Toggle item completion
    const handleToggle = (type, itemId, checked) => {
        const key = type === 'daily' ? 'daily' : 'weekly';
        const newProgress = {
            ...progress,
            [key]: {
                ...progress[key],
                [itemId]: checked
            }
        };
        setProgress(newProgress);
        saveProgress(newProgress);
    };

    // Update counter (for beast tribes, allied society, etc.)
    const handleCounterChange = (type, itemId, value) => {
        const key = type === 'daily' ? 'dailyCounters' : 'weeklyCounters';
        const newProgress = {
            ...progress,
            [key]: {
                ...progress[key],
                [itemId]: Math.max(0, value)
            }
        };
        setProgress(newProgress);
        saveProgress(newProgress);
    };

    // Toggle custom delivery NPC
    const handleCustomDeliveryToggle = (npcId, checked) => {
        const currentCount = Object.values(progress.customDeliveries).filter(Boolean).length;

        // Don't allow checking more if at cap
        if (checked && currentCount >= CUSTOM_DELIVERY_WEEKLY_CAP) {
            return;
        }

        const newProgress = {
            ...progress,
            customDeliveries: {
                ...progress.customDeliveries,
                [npcId]: checked
            },
            customDeliveryCount: checked ? currentCount + 1 : currentCount - 1
        };
        setProgress(newProgress);
        saveProgress(newProgress);
    };

    // Copy teleport macro
    const handleCopyTeleport = async (aetheryte) => {
        if (!aetheryte) return;
        const success = await copyTeleportMacro(aetheryte);
        if (success) {
            setCopiedAetheryte(aetheryte);
            setTimeout(() => setCopiedAetheryte(null), 2000);
        }
    };

    // Toggle section expansion
    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Reset functions
    const handleResetDaily = () => {
        const newProgress = {
            ...progress,
            daily: {},
            dailyCounters: {}
        };
        setProgress(newProgress);
        saveProgress(newProgress);
    };

    const handleResetWeekly = () => {
        const newProgress = {
            ...progress,
            weekly: {},
            weeklyCounters: {},
            customDeliveries: {},
            customDeliveryCount: 0
        };
        setProgress(newProgress);
        saveProgress(newProgress);
    };

    // Calculate progress
    const dailyCompleted = dailyItems.filter(item => progress.daily[item.id]).length;
    const dailyTotal = dailyItems.length;
    const dailyPercent = Math.round((dailyCompleted / dailyTotal) * 100);

    const weeklyCompleted = weeklyItems.filter(item => progress.weekly[item.id]).length;
    const customDeliveriesCompleted = Object.values(progress.customDeliveries).filter(Boolean).length;
    const weeklyTotal = weeklyItems.length + 1; // +1 for custom deliveries as a group
    const weeklyActualCompleted = weeklyCompleted + (customDeliveriesCompleted > 0 ? 1 : 0);
    const weeklyPercent = Math.round((weeklyActualCompleted / weeklyTotal) * 100);

    // Filter items based on active tab
    const showDaily = activeTab === 'all' || activeTab === 'daily';
    const showWeekly = activeTab === 'all' || activeTab === 'weekly';

    // Group custom deliveries by expansion
    const cdByExpansion = customDeliveryNPCs.reduce((acc, npc) => {
        if (!acc[npc.expansion]) acc[npc.expansion] = [];
        acc[npc.expansion].push(npc);
        return acc;
    }, {});
    const expansionOrder = ['DT', 'EW', 'ShB', 'SB', 'HW'];

    return (
        <div className="px-4 py-6 ffxiv-page min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4" style={{ borderBottom: '1px solid rgba(255, 215, 0, 0.2)' }}>
                <div className="flex items-center gap-4">
                    <img src="/checklist.png" alt="Checklist" className="w-16 h-16 rounded-lg object-cover"
                        style={{ border: '2px solid rgba(255, 215, 0, 0.4)', boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)' }} />
                    <div>
                        <h1 className="text-3xl font-bold mb-1 ffxiv-title">
                            Daily & Weekly Checklist
                        </h1>
                        <p className="text-sm text-blue-200" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                            Track your recurring FFXIV activities. Items reset automatically.
                        </p>
                    </div>
                </div>
            </div>

            {/* Reset Timers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Daily Reset */}
                <div className="ffxiv-panel p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-50 text-6xl pointer-events-none group-hover:opacity-20 transition-opacity">🌅</div>
                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <div className="text-sm text-gray-400 font-bold uppercase tracking-wider">Daily Reset</div>
                        <button
                            onClick={handleResetDaily}
                            className="text-xs text-blue-300 hover:text-red-400 transition-colors border border-blue-800/50 rounded px-2 py-1 bg-black/20"
                        >
                            Reset
                        </button>
                    </div>
                    <div className="text-4xl font-mono font-bold text-gold mb-2 relative z-10 drop-shadow-md">
                        {dailyTimer.hours}h {dailyTimer.minutes}m
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="flex-1 h-3 bg-black/50 rounded-full overflow-hidden border border-gray-700">
                            <div
                                className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 shadow-[0_0_10px_rgba(251,191,36,0.5)] transition-all"
                                style={{ width: `${dailyPercent}%` }}
                            />
                        </div>
                        <span className="text-sm text-gray-300 font-mono">{dailyCompleted}/{dailyTotal}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 italic relative z-10">Resets at 3:00 PM UTC</div>
                </div>

                {/* Weekly Reset */}
                <div className="ffxiv-panel p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-50 text-6xl pointer-events-none group-hover:opacity-20 transition-opacity">📅</div>
                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <div className="text-sm text-gray-400 font-bold uppercase tracking-wider">Weekly Reset</div>
                        <button
                            onClick={handleResetWeekly}
                            className="text-xs text-blue-300 hover:text-red-400 transition-colors border border-blue-800/50 rounded px-2 py-1 bg-black/20"
                        >
                            Reset
                        </button>
                    </div>
                    <div className="text-4xl font-mono font-bold text-gold mb-2 relative z-10 drop-shadow-md">
                        {weeklyTimer.days}d {weeklyTimer.hours}h {weeklyTimer.minutes}m
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="flex-1 h-3 bg-black/50 rounded-full overflow-hidden border border-gray-700">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all"
                                style={{ width: `${weeklyPercent}%` }}
                            />
                        </div>
                        <span className="text-sm text-gray-300 font-mono">{weeklyActualCompleted}/{weeklyTotal}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 italic relative z-10">Resets Tuesday 8:00 AM UTC</div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6">
                {['all', 'daily', 'weekly'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 uppercase tracking-widest ${activeTab === tab
                            ? 'bg-gradient-to-r from-blue-900/80 to-blue-800/80 text-gold border border-gold shadow-[0_0_10px_rgba(255,215,0,0.3)]'
                            : 'bg-black/40 text-gray-400 border border-transparent hover:bg-blue-900/40 hover:text-white'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Daily Items */}
            {showDaily && (
                <div className="mb-8">
                    <h2 className="text-lg font-display font-semibold text-amber-400 mb-4 flex items-center gap-2">
                        <span>🌅</span> Daily Tasks
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {dailyItems.map(item => {
                            const isCompleted = progress.daily[item.id];
                            const counter = progress.dailyCounters[item.id] || 0;

                            return (
                                <div
                                    key={item.id}
                                    className={`ffxiv-panel p-4 transition-all ${isCompleted
                                        ? 'bg-green-900/20 border-green-700/40'
                                        : 'hover:border-gray-600'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            <input
                                                type="checkbox"
                                                checked={isCompleted || false}
                                                onChange={(e) => handleToggle('daily', item.id, e.target.checked)}
                                                className="w-5 h-5 mt-0.5 rounded border-gray-600 bg-gray-800 text-gold focus:ring-gold cursor-pointer"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{item.icon}</span>
                                                    <h3 className={`font-semibold ${isCompleted ? 'text-green-400 line-through' : 'text-gray-100'
                                                        }`}>
                                                        {item.name}
                                                    </h3>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                                                <p className="text-xs text-gray-600 mt-0.5 italic">{item.note}</p>

                                                {/* Counter for items with allowances */}
                                                {item.hasCounter && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <button
                                                            onClick={() => handleCounterChange('daily', item.id, counter - 1)}
                                                            className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="text-sm text-gray-300 w-12 text-center">
                                                            {counter}/{item.maxCount}
                                                        </span>
                                                        <button
                                                            onClick={() => handleCounterChange('daily', item.id, Math.min(counter + 1, item.maxCount))}
                                                            className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {item.aetheryte && (
                                            <button
                                                onClick={() => handleCopyTeleport(item.aetheryte)}
                                                className="teleport-btn text-xs flex-shrink-0"
                                            >
                                                {copiedAetheryte === item.aetheryte ? '✓' : '📍'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Weekly Items */}
            {showWeekly && (
                <div className="mb-8">
                    <h2 className="text-lg font-display font-semibold text-blue-400 mb-4 flex items-center gap-2">
                        <span>📅</span> Weekly Tasks
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {weeklyItems.map(item => {
                            const isCompleted = progress.weekly[item.id];
                            const counter = progress.weeklyCounters[item.id] || 0;

                            return (
                                <div
                                    key={item.id}
                                    className={`ffxiv-panel p-4 transition-all ${isCompleted
                                        ? 'bg-green-900/20 border-green-700/40'
                                        : 'hover:border-gray-600'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            <input
                                                type="checkbox"
                                                checked={isCompleted || false}
                                                onChange={(e) => handleToggle('weekly', item.id, e.target.checked)}
                                                className="w-5 h-5 mt-0.5 rounded border-gray-600 bg-gray-800 text-gold focus:ring-gold cursor-pointer"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{item.icon}</span>
                                                    <h3 className={`font-semibold ${isCompleted ? 'text-green-400 line-through' : 'text-gray-100'
                                                        }`}>
                                                        {item.name}
                                                    </h3>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                                                <p className="text-xs text-gray-600 mt-0.5 italic">{item.note}</p>

                                                {/* Counter for items with allowances */}
                                                {item.hasCounter && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <button
                                                            onClick={() => handleCounterChange('weekly', item.id, counter - 1)}
                                                            className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="text-sm text-gray-300 w-12 text-center">
                                                            {counter}/{item.maxCount}
                                                        </span>
                                                        <button
                                                            onClick={() => handleCounterChange('weekly', item.id, Math.min(counter + 1, item.maxCount))}
                                                            className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {item.aetheryte && (
                                            <button
                                                onClick={() => handleCopyTeleport(item.aetheryte)}
                                                className="teleport-btn text-xs flex-shrink-0"
                                            >
                                                {copiedAetheryte === item.aetheryte ? '✓' : '📍'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Custom Deliveries Section */}
                    <div className="ffxiv-panel overflow-hidden">
                        <button
                            onClick={() => toggleSection('customDeliveries')}
                            className="w-full p-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-lg">📦</span>
                                <div className="text-left">
                                    <h3 className="font-semibold text-gray-100">Custom Deliveries</h3>
                                    <p className="text-xs text-gray-500">
                                        {customDeliveriesCompleted}/{CUSTOM_DELIVERY_WEEKLY_CAP} deliveries completed
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-pink-400 transition-all"
                                        style={{ width: `${(customDeliveriesCompleted / CUSTOM_DELIVERY_WEEKLY_CAP) * 100}%` }}
                                    />
                                </div>
                                <span className="text-gray-400 text-lg">
                                    {expandedSections.customDeliveries ? '▼' : '▶'}
                                </span>
                            </div>
                        </button>

                        {expandedSections.customDeliveries && (
                            <div className="border-t border-gray-700/50 p-4">
                                <p className="text-xs text-gray-500 mb-4">
                                    💡 12 deliveries shared across ALL NPCs per week. Pick your favorites!
                                </p>
                                {expansionOrder.map(exp => {
                                    const npcs = cdByExpansion[exp];
                                    if (!npcs) return null;

                                    const expName = {
                                        'DT': 'Dawntrail',
                                        'EW': 'Endwalker',
                                        'ShB': 'Shadowbringers',
                                        'SB': 'Stormblood',
                                        'HW': 'Heavensward'
                                    }[exp];

                                    return (
                                        <div key={exp} className="mb-4 last:mb-0">
                                            <h4 className={`text-xs font-semibold uppercase tracking-wide mb-2 expansion-badge expansion-${exp} inline-block`}>
                                                {expName}
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {npcs.map(npc => {
                                                    const isCompleted = progress.customDeliveries[npc.id];
                                                    const atCap = customDeliveriesCompleted >= CUSTOM_DELIVERY_WEEKLY_CAP && !isCompleted;

                                                    return (
                                                        <div
                                                            key={npc.id}
                                                            className={`p-3 rounded-lg border transition-all ${isCompleted
                                                                ? 'bg-green-900/20 border-green-700/40'
                                                                : atCap
                                                                    ? 'bg-gray-800/30 border-gray-700/30 opacity-50'
                                                                    : 'bg-gray-800/30 border-gray-700/50 hover:border-gray-600'
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isCompleted || false}
                                                                        onChange={(e) => handleCustomDeliveryToggle(npc.id, e.target.checked)}
                                                                        disabled={atCap}
                                                                        className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-gold focus:ring-gold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    />
                                                                    <div>
                                                                        <span className={`text-sm ${isCompleted ? 'text-green-400 line-through' : 'text-gray-200'
                                                                            }`}>
                                                                            {npc.name}
                                                                        </span>
                                                                        <div className="text-xs text-gray-500">
                                                                            {npc.location}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`text-xs px-2 py-0.5 rounded ${npc.scripType === 'Purple'
                                                                        ? 'bg-purple-900/30 text-purple-400'
                                                                        : npc.scripType === 'Orange'
                                                                            ? 'bg-orange-900/30 text-orange-400'
                                                                            : 'bg-gray-700/50 text-gray-300'
                                                                        }`}>
                                                                        {npc.scripType}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => handleCopyTeleport(npc.aetheryte)}
                                                                        className="teleport-btn text-xs"
                                                                    >
                                                                        {copiedAetheryte === npc.aetheryte ? '✓' : '📍'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
