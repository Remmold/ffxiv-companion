import { useState, useEffect, useCallback } from 'react';
import EorzeanClock from '../components/EorzeanClock';
import WorldSelector from '../components/WorldSelector';
import { collectables, scripColors } from '../data/collectables';
import { copyTeleportMacro } from '../utils/notifications';
import { getAlarms, toggleAlarm } from '../utils/alarms';
import { getFavorites, toggleFavorite } from '../utils/favorites';

const CLASS_ICONS = {
    Miner: '⛏️',
    Botanist: '🌿'
};

export default function CollectablesPage() {
    const [world, setWorld] = useState(() => {
        return localStorage.getItem('selectedWorld') || '';
    });
    const [scripFilter, setScripFilter] = useState('All');
    const [jobFilter, setJobFilter] = useState('All');
    const [levelFilter, setLevelFilter] = useState('All');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
    const [copiedItem, setCopiedItem] = useState(null);
    const [favorites, setFavorites] = useState(() => getFavorites());
    const [alarms, setAlarms] = useState(() => getAlarms());

    useEffect(() => {
        if (world) {
            localStorage.setItem('selectedWorld', world);
        }
    }, [world]);

    const handleCopyTeleport = async (aetheryte) => {
        const success = await copyTeleportMacro(aetheryte);
        if (success) {
            setCopiedItem(aetheryte);
            setTimeout(() => setCopiedItem(null), 2000);
        }
    };

    const handleToggleFavorite = useCallback((itemName) => {
        toggleFavorite(itemName);
        setFavorites(getFavorites());
    }, []);

    const handleToggleAlarm = useCallback((itemName) => {
        toggleAlarm(itemName);
        setAlarms(getAlarms());
    }, []);

    // Get unique levels for filter
    const levels = [...new Set(collectables.map(c => c.level))].sort((a, b) => b - a);

    // Enhance collectables with state
    const collectablesWithState = collectables.map(item => ({
        ...item,
        isFavorite: favorites.has(item.name),
        hasAlarm: alarms.has(item.name)
    }));

    // Filter collectables
    const filtered = collectablesWithState.filter(item => {
        if (scripFilter !== 'All' && item.scrip !== scripFilter) return false;
        if (jobFilter !== 'All' && item.job !== jobFilter) return false;
        if (levelFilter !== 'All' && item.level !== parseInt(levelFilter)) return false;
        return true;
    });

    // Sort by favorites first, then by value
    filtered.sort((a, b) => {
        if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
        if (b.value !== a.value) return b.value - a.value;
        return b.level - a.level;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-display font-semibold text-gold mb-2">
                    📦 Gatherer Collectables
                </h1>
                <p className="text-gray-400 text-sm">
                    Gather these items as collectables to earn Gatherer's Scrips for Folklore Books and gear.
                </p>
            </div>

            {/* Top Section - Clock & World */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-1">
                    <EorzeanClock />
                </div>

                <div className="lg:col-span-2 card p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <WorldSelector value={world} onChange={setWorld} />

                        {/* View Toggle */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-2">View Mode</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${viewMode === 'grid'
                                        ? 'bg-gold/20 text-gold border border-gold/30'
                                        : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                                        }`}
                                >
                                    📊 Grid
                                </button>
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${viewMode === 'table'
                                        ? 'bg-gold/20 text-gold border border-gold/30'
                                        : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                                        }`}
                                >
                                    📋 Table
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4 mb-6">
                <div className="flex flex-wrap gap-4">
                    {/* Scrip Type */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Scrip Type</label>
                        <div className="flex gap-1">
                            {['All', 'Purple', 'White'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setScripFilter(type)}
                                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${scripFilter === type
                                        ? type === 'Purple' ? 'bg-purple-700/50 text-purple-300 border border-purple-600'
                                            : type === 'White' ? 'bg-gray-300/20 text-gray-200 border border-gray-500'
                                                : 'bg-gold/20 text-gold border border-gold/30'
                                        : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Job */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Job</label>
                        <div className="flex gap-1">
                            {['All', 'Miner', 'Botanist'].map(job => (
                                <button
                                    key={job}
                                    onClick={() => setJobFilter(job)}
                                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${jobFilter === job
                                        ? 'bg-gold/20 text-gold border border-gold/30'
                                        : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                                        }`}
                                >
                                    {job !== 'All' && CLASS_ICONS[job]} {job}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Level */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Level</label>
                        <select
                            value={levelFilter}
                            onChange={(e) => setLevelFilter(e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200"
                        >
                            <option value="All">All Levels</option>
                            {levels.map(lvl => (
                                <option key={lvl} value={lvl}>Lv. {lvl}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                <span>
                    Showing <span className="text-gold">{filtered.length}</span> collectables
                </span>
                <span className="text-xs text-gray-600">
                    ★ = favorite • 🔔 = alarm • Click teleport to copy macro
                </span>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((item, idx) => {
                        const colors = scripColors[item.scrip];
                        return (
                            <div
                                key={idx}
                                className={`card p-4 ${colors.bg} border ${colors.border}`}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{CLASS_ICONS[item.job]}</span>
                                            <h3 className="font-semibold text-gray-100">{item.name}</h3>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-0.5">
                                            Lv. {item.level} {item.job}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleToggleFavorite(item.name)}
                                            className={`text-lg hover:scale-110 transition-transform ${item.isFavorite ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400'}`}
                                            title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                        >
                                            {item.isFavorite ? '★' : '☆'}
                                        </button>
                                        <button
                                            onClick={() => handleToggleAlarm(item.name)}
                                            className={`text-lg hover:scale-110 transition-transform ${item.hasAlarm ? 'text-blue-400' : 'text-gray-600 hover:text-blue-400'}`}
                                            title={item.hasAlarm ? 'Remove alarm' : 'Add alarm'}
                                        >
                                            {item.hasAlarm ? '🔔' : '🔕'}
                                        </button>
                                    </div>
                                </div>

                                {/* Scrip Value */}
                                <div className="mb-3 p-2 bg-black/30 rounded">
                                    <div className="text-xs text-gray-500 mb-1">Scrip Value (Max)</div>
                                    <div className={`text-2xl font-bold ${colors.text}`}>
                                        {item.value}
                                        <span className="text-xs text-gray-500 ml-1">{item.scrip}</span>
                                    </div>
                                </div>

                                {/* Collectability Thresholds */}
                                <div className="mb-3 text-xs">
                                    <div className="text-gray-500 mb-1">Collectability</div>
                                    <div className="flex gap-2">
                                        <span className="text-gray-400">Min: <span className="text-gray-200">{item.collectability.min}</span></span>
                                        <span className="text-yellow-400">Mid: <span className="text-yellow-200">{item.collectability.mid}</span></span>
                                        <span className="text-green-400">Max: <span className="text-green-200">{item.collectability.max}</span></span>
                                    </div>
                                </div>

                                {/* Location & Teleport */}
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-400">
                                        📍 {item.location}
                                    </div>
                                    <button
                                        onClick={() => handleCopyTeleport(item.aetheryte)}
                                        className="teleport-btn text-xs"
                                    >
                                        {copiedItem === item.aetheryte ? '✓ Copied!' : `📍 ${item.aetheryte}`}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && (
                <div className="card overflow-hidden">
                    <table className="w-full ffxiv-table">
                        <thead>
                            <tr>
                                <th className="text-left w-12"></th>
                                <th className="text-left">Item</th>
                                <th className="text-left">Scrip Value</th>
                                <th className="text-left">Location</th>
                                <th className="text-left">Collectability</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((item, idx) => {
                                const colors = scripColors[item.scrip];

                                return (
                                    <tr key={item.name}>
                                        {/* Favorite & Alarm */}
                                        <td className="text-center">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleToggleFavorite(item.name)}
                                                    className={`text-lg hover:scale-110 transition-transform ${item.isFavorite ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400'
                                                        }`}
                                                    title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                                >
                                                    {item.isFavorite ? '★' : '☆'}
                                                </button>
                                                <button
                                                    onClick={() => handleToggleAlarm(item.name)}
                                                    className={`text-lg hover:scale-110 transition-transform ${item.hasAlarm ? 'text-blue-400' : 'text-gray-600 hover:text-blue-400'
                                                        }`}
                                                    title={item.hasAlarm ? 'Remove alarm' : 'Add alarm'}
                                                >
                                                    {item.hasAlarm ? '🔔' : '🔕'}
                                                </button>
                                            </div>
                                        </td>

                                        {/* Item Info */}
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{CLASS_ICONS[item.job]}</span>
                                                <div>
                                                    <div className="font-semibold flex items-center gap-2 text-gray-100">
                                                        {item.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Lv. {item.level} {item.job}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Scrip Value */}
                                        <td>
                                            <div className={`text-lg font-bold ${colors.text}`}>
                                                {item.value}
                                                <span className="text-xs text-gray-500 ml-1">{item.scrip}</span>
                                            </div>
                                        </td>

                                        {/* Location */}
                                        <td>
                                            <div>
                                                <div className="text-gray-300 text-sm">{item.location}</div>
                                                <button
                                                    onClick={() => handleCopyTeleport(item.aetheryte)}
                                                    className="teleport-btn text-xs"
                                                >
                                                    {copiedItem === item.aetheryte ? '✓ Copied!' : `📍 ${item.aetheryte}`}
                                                </button>
                                            </div>
                                        </td>

                                        {/* Collectability */}
                                        <td>
                                            <div className="flex gap-2 text-xs">
                                                <span className="text-gray-400">Min: {item.collectability.min}</span>
                                                <span className="text-yellow-400">Mid: {item.collectability.mid}</span>
                                                <span className="text-green-400">Max: {item.collectability.max}</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {filtered.length === 0 && (
                <div className="card p-8 text-center text-gray-500">
                    No collectables match your filters.
                </div>
            )}
        </div>
    );
}
