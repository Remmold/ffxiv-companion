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
        <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-display font-semibold text-gold mb-2">
                    🤝 Allied Societies & Beast Tribes
                </h1>
                <p className="text-gray-400 text-sm">
                    Complete guide to all beast tribes with unlock prerequisites and teleport locations.
                </p>
            </div>

            {/* Quick Info Banner */}
            <div className="card p-4 mb-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-700/40">
                <div className="flex flex-wrap gap-6 text-sm">
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
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Type:</span>
                    <div className="flex gap-1">
                        {['all', 'Gatherer', 'Crafter', 'Combat'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${filterType === type
                                        ? 'bg-gold/20 text-gold border border-gold/30'
                                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 border border-transparent'
                                    }`}
                            >
                                {type === 'all' ? 'All Types' : type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Expansion Filter */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Expansion:</span>
                    <select
                        value={filterExpansion}
                        onChange={(e) => setFilterExpansion(e.target.value)}
                        className="select-field text-sm py-1.5"
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
                        <h2 className={`text-sm font-semibold uppercase tracking-wide mb-4 expansion-badge expansion-${exp} inline-block`}>
                            {expansionNames[exp]}
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {tribes.map(tribe => {
                                const isExpanded = expandedTribe === tribe.id;

                                return (
                                    <div
                                        key={tribe.id}
                                        className="card overflow-hidden transition-all"
                                    >
                                        {/* Tribe Header */}
                                        <div
                                            className="p-4 cursor-pointer hover:bg-gray-800/30 transition-colors"
                                            onClick={() => toggleTribe(tribe.id)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3">
                                                    <span className="text-2xl">{tribe.icon}</span>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-100 flex items-center gap-2">
                                                            {tribe.name}
                                                            <span className={`text-xs px-2 py-0.5 rounded border ${getTypeBadgeClass(tribe.type)}`}>
                                                                {tribe.type}
                                                            </span>
                                                        </h3>
                                                        <p className="text-sm text-gray-400 mt-0.5">
                                                            {tribe.location}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
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
                                                        className="teleport-btn text-xs"
                                                        title={`Teleport to ${tribe.aetheryte}`}
                                                    >
                                                        {copiedAetheryte === tribe.aetheryte ? '✓ Copied!' : `📍 ${tribe.aetheryte}`}
                                                    </button>
                                                    <span className="text-gray-400 text-lg">
                                                        {isExpanded ? '▼' : '▶'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Quick Info */}
                                            <div className="flex flex-wrap gap-3 mt-3 ml-9">
                                                <span className="text-xs text-gray-500">
                                                    <span className="text-gray-400">Level:</span> {tribe.unlockLevel}+ {tribe.unlockJob}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    <span className="text-gray-400">Allowance:</span> {tribe.weeklyAllowance ? `${tribe.weeklyAllowance}/week` : `${tribe.dailyAllowance}/day`}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Expanded Content */}
                                        {isExpanded && (
                                            <div className="border-t border-gray-700/50 p-4 bg-gray-900/30">
                                                {/* Prerequisites */}
                                                <div className="mb-4">
                                                    <h4 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                                                        <span>🔓</span> Unlock Prerequisites
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {tribe.prereqs.map((prereq, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/40 border border-gray-700/40"
                                                            >
                                                                <span className="text-lg">
                                                                    {prereq.type === 'msq' ? '📖' : prereq.type === 'job' ? '⚔️' : '❗'}
                                                                </span>
                                                                <div className="flex-1">
                                                                    <div className="font-medium text-gray-200 text-sm">
                                                                        {prereq.name}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                                        {prereq.description}
                                                                    </div>
                                                                    {prereq.location && (
                                                                        <div className="text-xs text-gray-400 mt-1">
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
                                                    <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                                                        <span>🎁</span> Rewards
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {tribe.rewards.map((reward, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="text-xs px-2 py-1 rounded bg-gray-800/60 text-gray-300 border border-gray-700/50"
                                                            >
                                                                {reward}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Tips */}
                                                {tribe.tips && (
                                                    <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-700/30">
                                                        <div className="text-xs text-blue-300">
                                                            💡 <span className="font-medium">Tip:</span> {tribe.tips}
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
                <div className="card p-8 text-center">
                    <p className="text-gray-400">No tribes match your current filters.</p>
                </div>
            )}
        </div>
    );
}
