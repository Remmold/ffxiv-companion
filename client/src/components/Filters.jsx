import { expansions, gatheringClasses } from '../data/ffxivData';

const scripTypes = [
    { value: 'Orange', label: 'Orange', color: 'orange' },
    { value: 'Purple', label: 'Purple', color: 'purple' },
    { value: 'White', label: 'White', color: 'gray' },
    { value: 'Reduction', label: 'Aetherial Reduction', color: 'cyan' }
];

const nodeTypes = [
    { value: 'Legendary', label: 'Legendary', icon: '🌟' },
    { value: 'Ephemeral', label: 'Ephemeral', icon: '⏳' },
    { value: 'Collectable', label: 'Collectable', icon: '📦' }
];

export default function Filters({
    gatheringClass,
    onGatheringClassChange,
    selectedExpansions = [],
    onExpansionsChange,
    selectedScripTypes = [],
    onScripTypesChange,
    selectedNodeTypes = [],
    onNodeTypesChange,
    searchQuery = '',
    onSearchChange,
    viewMode = 'gold'
}) {
    // Toggle expansion in multi-select
    const toggleExpansion = (value) => {
        if (value === 'All') {
            // Toggle all
            if (selectedExpansions.length === expansions.length - 1) {
                onExpansionsChange([]);
            } else {
                onExpansionsChange(expansions.filter(e => e.value !== 'All').map(e => e.value));
            }
        } else {
            if (selectedExpansions.includes(value)) {
                onExpansionsChange(selectedExpansions.filter(e => e !== value));
            } else {
                onExpansionsChange([...selectedExpansions, value]);
            }
        }
    };

    // Toggle scrip type in multi-select
    const toggleScripType = (value) => {
        if (selectedScripTypes.includes(value)) {
            onScripTypesChange(selectedScripTypes.filter(s => s !== value));
        } else {
            onScripTypesChange([...selectedScripTypes, value]);
        }
    };

    // Toggle node type in multi-select
    const toggleNodeType = (value) => {
        if (selectedNodeTypes.includes(value)) {
            onNodeTypesChange(selectedNodeTypes.filter(t => t !== value));
        } else {
            onNodeTypesChange([...selectedNodeTypes, value]);
        }
    };

    const allExpansionsSelected = selectedExpansions.length === expansions.length - 1 || selectedExpansions.length === 0;

    return (
        <div className="card p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                Filters
            </h3>

            {/* Search Input */}
            <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-2">Search</label>
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search item or zone..."
                        className="w-full bg-black/20 border border-gray-700/50 rounded px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs"
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            {/* Gathering Class Toggle */}
            <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-2">Gathering Class</label>
                <div className="flex gap-2 flex-wrap">
                    {gatheringClasses.map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => onGatheringClassChange(value)}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-150 
                ${gatheringClass === value
                                    ? value === 'Miner'
                                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                                        : value === 'Botanist'
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                            : 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/50'
                                    : 'bg-black/20 text-gray-400 border border-gray-700/50 hover:border-gray-600'
                                }`}
                        >
                            {value === 'Miner' && '⛏️ '}
                            {value === 'Botanist' && '🌿 '}
                            {label}
                        </button>
                    ))}
                </div>
            </div>


            {/* Note: Expansion filter is now global in the header */}


            {/* Node Type Multi-Select */}
            <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-2">Node Type</label>
                <div className="flex gap-1.5 flex-wrap">
                    {nodeTypes.map(({ value, label, icon }) => (
                        <button
                            key={value}
                            onClick={() => toggleNodeType(value)}
                            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all duration-150 flex items-center gap-1
                                ${selectedNodeTypes.includes(value)
                                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                                    : 'bg-black/20 text-gray-500 border border-gray-700/50 hover:border-gray-600'
                                }`}
                        >
                            <span>{icon}</span>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrip Type Filter - Only show in Scrip mode */}
            {viewMode === 'scrip' && (
                <div>
                    <label className="block text-xs text-gray-500 mb-2">Scrip Type</label>
                    <div className="flex gap-1.5 flex-wrap">
                        {scripTypes.map(({ value, label, color }) => (
                            <button
                                key={value}
                                onClick={() => toggleScripType(value)}
                                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all duration-150
                                    ${selectedScripTypes.includes(value) || selectedScripTypes.length === 0
                                        ? color === 'orange'
                                            ? 'bg-orange-900/30 text-orange-400 border border-orange-600/50'
                                            : color === 'purple'
                                                ? 'bg-purple-900/30 text-purple-400 border border-purple-600/50'
                                                : 'bg-gray-800/50 text-gray-300 border border-gray-500/50'
                                        : 'bg-black/20 text-gray-600 border border-gray-700/50 hover:border-gray-600'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
