import { useState } from 'react';
import { beastTribes, expansionNames, expansionOrder } from '../data/beastTribes';
import { copyTeleportMacro } from '../utils/notifications';

export default function AlliedSocietiesPage() {
    const [expandedTribe, setExpandedTribe] = useState(null);
    const [copiedAetheryte, setCopiedAetheryte] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [filterExpansion, setFilterExpansion] = useState('all');

    // Copy teleport macro
    const handleCopyTeleport = async (aetheryte) => {
        if (!aetheryte) return;
        const success = await copyTeleportMacro(aetheryte);
        if (success) {
            setCopiedAetheryte(aetheryte);
            setTimeout(() => setCopiedAetheryte(null), 2000);
        }
    };

    // Toggle tribe expansion
    const toggleTribe = (tribeId) => {
        setExpandedTribe(expandedTribe === tribeId ? null : tribeId);
    };

    // Filter tribes
    const filteredTribes = beastTribes.filter(tribe => {
        const typeMatch = filterType === 'all' ||
            tribe.type === filterType ||
            (filterType === 'Gatherer' && tribe.type === 'Gatherer/Crafter') ||
            (filterType === 'Crafter' && tribe.type === 'Gatherer/Crafter');
        const expansionMatch = filterExpansion === 'all' || tribe.expansion === filterExpansion;
        return typeMatch && expansionMatch;
    });

    // Group by expansion
    const byExpansion = filteredTribes.reduce((acc, tribe) => {
        if (!acc[tribe.expansion]) acc[tribe.expansion] = [];
        acc[tribe.expansion].push(tribe);
        return acc;
    }, {});

    // Type badge colors
    const getTypeBadgeClass = (type) => {
        switch (type) {
            case 'Gatherer':
                return 'bg-green-900/30 text-green-400 border-green-700/50';
            case 'Crafter':
                return 'bg-orange-900/30 text-orange-400 border-orange-700/50';
            case 'Gatherer/Crafter':
                return 'bg-amber-900/30 text-amber-400 border-amber-700/50';
            case 'Combat':
                return 'bg-red-900/30 text-red-400 border-red-700/50';
            default:
                return 'bg-gray-700/50 text-gray-300';
        }
    };

    return (
        <div className="px-4 py-6 ffxiv-page min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4" style={{ borderBottom: '1px solid rgba(255, 215, 0, 0.2)' }}>
                <div className="flex items-center gap-4">
                    <img src="/tribe.png" alt="Allied Societies" className="w-16 h-16 rounded-lg object-cover"
                        style={{ border: '2px solid rgba(255, 215, 0, 0.4)', boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)' }} />
                    <div>
                        <h1 className="text-3xl font-bold mb-1 ffxiv-title">
                            Allied Societies & Beast Tribes
                        </h1>
                        <p className="text-sm text-blue-200" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                            Complete guide to all beast tribes with unlock prerequisites and teleport locations.
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Info Banner */}
            <div className="ffxiv-panel p-4 mb-6 border-blue-700/40 relative overflow-hidden">
                <div className="flex flex-wrap gap-6 text-sm relative z-10">
                    <div>
                        <span className="text-gray-400">Daily Allowance:</span>
                        <span className="text-gold font-semibold ml-2">12 quests/day</span>
                    </div>
                    <div>
                        <span className="text-gray-400">Weekly (DT Alliance):</span>
                        <span className="text-gold font-semibold ml-2">12 quests/week</span>
                    </div>
                    <div>
                        <span className="text-gray-400">Shared Across:</span>
                        <span className="text-gray-300 ml-2">All tribes of the same reset type</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                {/* Type Filter */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-300 uppercase tracking-wide font-bold">Type:</span>
                    <div className="flex gap-1">
                        {['all', 'Gatherer', 'Crafter', 'Combat'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${filterType === type
                                    ? 'bg-gold/20 text-gold border border-gold/50 shadow-[0_0_5px_rgba(255,215,0,0.2)]'
                                    : 'bg-black/40 text-gray-400 hover:text-white hover:bg-blue-900/20 border border-transparent'
                                    }`}
                            >
                                {type === 'all' ? 'All Types' : type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Expansion Filter */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-300 uppercase tracking-wide font-bold">Expansion:</span>
                    <select
                        value={filterExpansion}
                        onChange={(e) => setFilterExpansion(e.target.value)}
                        className="bg-black/40 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 focus:border-gold focus:outline-none cursor-pointer"
                    >
                        <option value="all">All Expansions</option>
                        {expansionOrder.map(exp => (
                            <option key={exp} value={exp}>{expansionNames[exp]}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tribes by Expansion */}
            {expansionOrder.map(exp => {
                const tribes = byExpansion[exp];
                if (!tribes || tribes.length === 0) return null;

                return (
                    <div key={exp} className="mb-8">
                        <h2 className={`text-sm font-bold uppercase tracking-wide mb-4 expansion-badge expansion-${exp} inline-block px-3 py-1 rounded`}>
                            {expansionNames[exp]}
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {tribes.map(tribe => {
                                const isExpanded = expandedTribe === tribe.id;

                                return (
                                    <div
                                        key={tribe.id}
                                        className="ffxiv-panel p-0 overflow-hidden transition-all group hover:border-gold/50"
                                    >
                                        {/* Tribe Header */}
                                        <div
                                            className="p-5 cursor-pointer hover:bg-white/5 transition-colors"
                                            onClick={() => toggleTribe(tribe.id)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-4">
                                                    <span className="text-3xl filter drop-shadow-md">{tribe.icon}</span>
                                                    <div>
                                                        <h3 className="font-bold text-gray-100 flex items-center gap-2 text-lg">
                                                            {tribe.name}
                                                            <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${getTypeBadgeClass(tribe.type)}`}>
                                                                {tribe.type}
                                                            </span>
                                                        </h3>
                                                        <p className="text-sm text-blue-200 mt-0.5">
                                                            {tribe.location}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1 italic">
                                                            {tribe.description}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCopyTeleport(tribe.aetheryte);
                                                        }}
                                                        className="teleport-btn text-xs px-2 py-1"
                                                        title={`Teleport to ${tribe.aetheryte}`}
                                                    >
                                                        {copiedAetheryte === tribe.aetheryte ? '✓ Copied!' : `📍 ${tribe.aetheryte}`}
                                                    </button>
                                                    <span className="text-gold text-xl transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                                        ▼
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Quick Info */}
                                            <div className="flex flex-wrap gap-4 mt-3 ml-12 pl-1">
                                                <span className="text-xs text-gray-400 bg-black/30 px-2 py-1 rounded">
                                                    <span className="text-gray-500 uppercase font-bold mr-1">Level:</span> {tribe.unlockLevel}+ {tribe.unlockJob}
                                                </span>
                                                <span className="text-xs text-gray-400 bg-black/30 px-2 py-1 rounded">
                                                    <span className="text-gray-500 uppercase font-bold mr-1">Allowance:</span> {tribe.weeklyAllowance ? `${tribe.weeklyAllowance}/week` : `${tribe.dailyAllowance}/day`}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Expanded Content */}
                                        {isExpanded && (
                                            <div className="border-t border-gold/20 p-5 bg-black/20">
                                                {/* Prerequisites */}
                                                <div className="mb-5">
                                                    <h4 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2 uppercase tracking-wide">
                                                        <span>🔓</span> Unlock Prerequisites
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {tribe.prereqs.map((prereq, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex items-start gap-3 p-3 rounded-lg bg-black/20 border border-gray-700/30"
                                                            >
                                                                <span className="text-lg">
                                                                    {prereq.type === 'msq' ? '📖' : prereq.type === 'job' ? '⚔️' : '❗'}
                                                                </span>
                                                                <div className="flex-1">
                                                                    <div className="font-bold text-gray-200 text-sm">
                                                                        {prereq.name}
                                                                    </div>
                                                                    <div className="text-xs text-gray-400 mt-0.5">
                                                                        {prereq.description}
                                                                    </div>
                                                                    {prereq.location && (
                                                                        <div className="text-xs text-blue-300 mt-1">
                                                                            📍 {prereq.location}
                                                                            {prereq.npc && <span> • NPC: {prereq.npc}</span>}
                                                                            {prereq.coords && <span className="text-gray-500"> ({prereq.coords})</span>}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Rewards */}
                                                <div className="mb-4">
                                                    <h4 className="text-sm font-bold text-green-400 mb-2 flex items-center gap-2 uppercase tracking-wide">
                                                        <span>🎁</span> Rewards
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {tribe.rewards.map((reward, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="text-xs px-2 py-1 rounded bg-green-900/20 text-green-200 border border-green-700/30"
                                                            >
                                                                {reward}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Tips */}
                                                {tribe.tips && (
                                                    <div className="p-3 rounded-lg bg-blue-900/10 border border-blue-500/20">
                                                        <div className="text-xs text-blue-200">
                                                            💡 <span className="font-bold text-blue-400">Tip:</span> {tribe.tips}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {/* Empty State */}
            {Object.keys(byExpansion).length === 0 && (
                <div className="ffxiv-panel p-8 text-center">
                    <p className="text-gray-400">No tribes match your current filters.</p>
                </div>
            )}
        </div>
    );
}
