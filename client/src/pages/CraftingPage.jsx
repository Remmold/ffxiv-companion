import { useState, useEffect, useCallback, useMemo } from 'react';
import WorldSelector from '../components/WorldSelector';
import { useFilters } from '../context/FilterContext';
import { craftingClasses, expansions } from '../data/ffxivData';

// Constants
const CATEGORY_ICONS = {
    'Consumable': '🧪',
    'Materia': '💎',
    'Weapon': '⚔️',
    'Armor': '🛡️',
    'Accessory': '💍',
    'Material': '🧱',
    'Housing': '🏠'
};

const SCRIP_COLORS = {
    Purple: { bg: 'bg-purple-900/20', text: 'text-purple-400', border: 'border-purple-600/30', badge: 'bg-purple-700/50 text-purple-300' },
    Orange: { bg: 'bg-orange-900/20', text: 'text-orange-400', border: 'border-orange-600/30', badge: 'bg-orange-700/50 text-orange-300' }
};

const scripTypes = [
    { value: 'All', label: 'All', color: 'gold' },
    { value: 'Orange', label: 'Orange', color: 'orange' },
    { value: 'Purple', label: 'Purple', color: 'purple' }
];

// Shared utilities
const formatGil = (amount) => {
    if (!amount && amount !== 0) return '—';
    if (amount === 0) return '—';
    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
        return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toLocaleString();
};

// ============================================
// LEVEQUESTS TAB COMPONENT
// ============================================
// Expansion level ranges for filtering
const EXPANSION_LEVELS = {
    'All': { min: 1, max: 100 },
    'ARR': { min: 1, max: 50 },
    'HW': { min: 51, max: 60 },
    'SB': { min: 61, max: 70 },
    'ShB': { min: 71, max: 80 },
    'EW': { min: 81, max: 90 },
    'DT': { min: 91, max: 100 }
};

function LevequestsTab({ world, craftingClass, setCraftingClass }) {
    const [category, setCategory] = useState('All');
    const [selectedExpansion, setSelectedExpansion] = useState('All');
    const [recipes, setRecipes] = useState([]);
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [expandedRecipe, setExpandedRecipe] = useState(null);
    const [priceSort, setPriceSort] = useState('server'); // 'server' or 'dc'
    const [quality, setQuality] = useState('nq'); // 'nq', 'hq', or 'best'

    // Fetch categories on mount
    useEffect(() => {
        fetch('/api/crafting/categories')
            .then(res => res.json())
            .then(data => setCategories(['All', ...(data.categories || [])]))
            .catch(err => console.error('Failed to fetch categories:', err));
    }, []);

    const fetchRecipes = useCallback(async () => {
        if (!world) {
            try {
                const params = new URLSearchParams({ craftingClass, category });
                const response = await fetch(`/api/recipes?${params}`);
                if (!response.ok) throw new Error('Failed to fetch recipes');
                const data = await response.json();
                setRecipes(data.recipes || []);
            } catch (err) {
                setError(err.message);
            }
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const params = new URLSearchParams({ craftingClass, category });
            const response = await fetch(`/api/recipes/${encodeURIComponent(world)}/profit?${params}`);
            if (!response.ok) throw new Error('Failed to fetch recipe profits');
            const data = await response.json();
            setRecipes(data.recipes || []);
            setLastUpdate(new Date());
        } catch (err) {
            setError(err.message);
            setRecipes([]);
        } finally {
            setIsLoading(false);
        }
    }, [world, craftingClass, category]);

    // Filter recipes by expansion (level range)
    useEffect(() => {
        if (selectedExpansion === 'All') {
            setFilteredRecipes(recipes);
        } else {
            const { min, max } = EXPANSION_LEVELS[selectedExpansion] || { min: 1, max: 100 };
            setFilteredRecipes(recipes.filter(r => r.level >= min && r.level <= max));
        }
    }, [recipes, selectedExpansion]);

    useEffect(() => {
        fetchRecipes();
    }, [fetchRecipes]);

    const toggleExpand = (recipeId) => {
        setExpandedRecipe(expandedRecipe === recipeId ? null : recipeId);
    };

    // Sort recipes based on server or DC price and quality
    const sortedRecipes = useMemo(() => {
        return [...filteredRecipes].sort((a, b) => {
            // For recipes, we sort by profit which considers material costs
            // Quality affects the sell price of the output
            if (priceSort === 'dc') {
                return (b.dcPrice || 0) - (a.dcPrice || 0);
            }
            // Use hqProfit or nqProfit if available, otherwise fallback to profit
            if (quality === 'hq') {
                return (b.hqProfit || b.profit || 0) - (a.hqProfit || a.profit || 0);
            }
            return (b.profit || 0) - (a.profit || 0);
        });
    }, [filteredRecipes, priceSort, quality]);

    return (
        <>
            {/* Filters */}
            <div className="card p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Crafting Class */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-2">Crafting Class</label>
                        <select
                            value={craftingClass}
                            onChange={(e) => setCraftingClass(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200"
                        >
                            {craftingClasses.map(cls => (
                                <option key={cls.value} value={cls.value}>
                                    {cls.icon || ''} {cls.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-2">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat !== 'All' && CATEGORY_ICONS[cat]} {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Expansion */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-2">Expansion</label>
                        <select
                            value={selectedExpansion}
                            onChange={(e) => setSelectedExpansion(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200"
                        >
                            {expansions.map(exp => (
                                <option key={exp.value} value={exp.value}>
                                    {exp.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Price Sort */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-2">Sort by Price</label>
                        <div className="flex gap-1.5">
                            <button
                                onClick={() => setPriceSort('server')}
                                className={`px-2.5 py-1.5 rounded text-xs font-semibold transition-all flex-1
                                    ${priceSort === 'server'
                                        ? 'bg-gold/20 text-gold border border-gold/50'
                                        : 'bg-black/20 text-gray-500 border border-gray-700/50 hover:border-gray-600'
                                    }`}
                            >
                                🏠 Server
                            </button>
                            <button
                                onClick={() => setPriceSort('dc')}
                                className={`px-2.5 py-1.5 rounded text-xs font-semibold transition-all flex-1
                                    ${priceSort === 'dc'
                                        ? 'bg-gold/20 text-gold border border-gold/50'
                                        : 'bg-black/20 text-gray-500 border border-gray-700/50 hover:border-gray-600'
                                    }`}
                            >
                                🌐 DC
                            </button>
                        </div>
                    </div>

                    {/* Quality Toggle */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-2">Quality</label>
                        <div className="flex gap-1.5">
                            <button
                                onClick={() => setQuality('nq')}
                                className={`px-2.5 py-1.5 rounded text-xs font-semibold transition-all flex-1
                                    ${quality === 'nq'
                                        ? 'bg-gray-600/30 text-gray-200 border border-gray-500'
                                        : 'bg-black/20 text-gray-500 border border-gray-700/50 hover:border-gray-600'
                                    }`}
                            >
                                NQ
                            </button>
                            <button
                                onClick={() => setQuality('hq')}
                                className={`px-2.5 py-1.5 rounded text-xs font-semibold transition-all flex-1
                                    ${quality === 'hq'
                                        ? 'bg-blue-600/30 text-blue-300 border border-blue-500'
                                        : 'bg-black/20 text-gray-500 border border-gray-700/50 hover:border-gray-600'
                                    }`}
                            >
                                ✨ HQ
                            </button>
                        </div>
                    </div>
                </div>
            </div>


            {/* Info Banner */}
            {!world && (
                <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800/50 rounded text-blue-300 text-sm">
                    💡 Select a world to see profit calculations with current market prices.
                </div>
            )}

            {/* Header Row */}
            <div className="flex items-center justify-between mb-4">
                <div className="text-xs text-gray-500">
                    Showing <span className="text-gold">{sortedRecipes.length}</span> recipes
                    {lastUpdate && (
                        <span className="ml-2">• Updated: {lastUpdate.toLocaleTimeString()}</span>
                    )}
                </div>
                {world && sortedRecipes.length > 0 && (
                    <div className="text-xs text-gray-500">Sorted by {priceSort === 'dc' ? 'DC lowest' : 'server'} price</div>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-800/50 rounded text-red-400 text-sm">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="card p-8 text-center text-gray-500">
                    Calculating profits... (this may take a moment)
                </div>
            )}

            {/* Recipe Cards */}
            {!isLoading && (
                <div className="space-y-3">
                    {sortedRecipes.map((recipe) => {
                        const isExpanded = expandedRecipe === recipe.recipeId;
                        const hasPriceData = recipe.profit !== undefined;
                        const classInfo = craftingClasses.find(c => c.value === recipe.craftingClass);

                        return (
                            <div
                                key={recipe.recipeId}
                                className={`card p-4 transition-all cursor-pointer hover:border-gray-600 ${hasPriceData && recipe.isProfitable
                                    ? 'border-green-800/50 bg-green-900/10'
                                    : hasPriceData && !recipe.isProfitable
                                        ? 'border-red-800/30 bg-red-900/5'
                                        : ''
                                    }`}
                                onClick={() => toggleExpand(recipe.recipeId)}
                            >
                                {/* Main Row */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        <span className="text-2xl">{CATEGORY_ICONS[recipe.category] || '📦'}</span>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-100 flex items-center gap-2">
                                                {recipe.outputName}
                                                <span className="text-xs text-gray-500">×{recipe.outputQuantity}</span>
                                            </h3>
                                            <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                                                <span>{classInfo?.icon} {recipe.craftingClass}</span>
                                                <span>•</span>
                                                <span>Lv. {recipe.level}</span>
                                                <span>•</span>
                                                <span>{recipe.category}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Profit Display */}
                                    {hasPriceData && (
                                        <div className="text-right min-w-[140px]">
                                            <div className={`text-lg font-bold ${recipe.isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                                                {recipe.isProfitable ? '+' : ''}{formatGil(recipe.profit)}
                                                <span className="text-xs text-gray-500 ml-1">gil</span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                @ {formatGil(recipe.outputSellPrice)} each
                                            </div>
                                            {/* DC Lowest */}
                                            {recipe.dcSellPrice > 0 && recipe.dcSellWorld && (
                                                <div className={`text-xs mt-1 ${recipe.dcSellWorld === world ? 'text-green-500' : 'text-blue-400'}`}>
                                                    {recipe.dcSellWorld === world ? (
                                                        <span>✓ Cheapest on DC</span>
                                                    ) : (
                                                        <span>
                                                            DC: {formatGil(recipe.dcSellPrice)} ({recipe.dcSellWorld})
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="ml-3 text-gray-500">{isExpanded ? '▲' : '▼'}</div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && hasPriceData && (
                                    <div className="mt-4 pt-4 border-t border-gray-700/50">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Materials Breakdown */}
                                            <div>
                                                <h4 className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Materials Cost</h4>
                                                <div className="space-y-1">
                                                    {recipe.materials.map((mat, idx) => (
                                                        <div key={idx} className="flex justify-between text-sm">
                                                            <span className="text-gray-300">{mat.name} ×{mat.quantity}</span>
                                                            <span className="text-gray-400">{formatGil(mat.totalCost)} gil</span>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-between text-sm font-semibold pt-1 border-t border-gray-700/50">
                                                        <span className="text-gray-200">Total Cost</span>
                                                        <span className="text-red-400">-{formatGil(recipe.totalMaterialCost)} gil</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Output Value */}
                                            <div>
                                                <h4 className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Sale Value</h4>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-300">{recipe.outputName} ×{recipe.outputQuantity}</span>
                                                        <span className="text-gray-400">@ {formatGil(recipe.outputSellPrice)} each</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm font-semibold pt-1 border-t border-gray-700/50">
                                                        <span className="text-gray-200">Total Revenue</span>
                                                        <span className="text-green-400">+{formatGil(recipe.totalOutputValue)} gil</span>
                                                    </div>
                                                </div>

                                                <div className="mt-3 p-2 bg-black/30 rounded">
                                                    <div className="text-xs text-gray-500">Profit per Item</div>
                                                    <div className={`text-lg font-bold ${recipe.profitPerItem > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {recipe.profitPerItem > 0 ? '+' : ''}{formatGil(recipe.profitPerItem)} gil
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {recipes.length === 0 && !isLoading && (
                <div className="card p-8 text-center text-gray-500">No recipes match your filters.</div>
            )}
        </>
    );
}

// ============================================
// COLLECTABLES TAB COMPONENT
// ============================================
function CollectablesTab({ world, craftingClass, setCraftingClass }) {
    const [scripFilter, setScripFilter] = useState('All');
    const [selectedExpansions, setSelectedExpansions] = useState([]);
    const [collectables, setCollectables] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [expandedItem, setExpandedItem] = useState(null);
    const [expandedMaterial, setExpandedMaterial] = useState(null);
    const [priceSort, setPriceSort] = useState('server'); // 'server' or 'dc'
    const [quality, setQuality] = useState('nq'); // 'nq' or 'hq'

    const fetchCollectables = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const params = new URLSearchParams({
                craftingClass,
                scrip: scripFilter,
                expansion: 'All'
            });

            let url = '/api/crafting/collectables';
            if (world) {
                url = `/api/crafting/collectables/${encodeURIComponent(world)}/prices`;
            }

            const response = await fetch(`${url}?${params}`);
            if (!response.ok) throw new Error('Failed to fetch collectables');

            const data = await response.json();
            setCollectables(data.collectables || []);
            if (world) {
                setLastUpdate(new Date());
            }
        } catch (err) {
            setError(err.message);
            setCollectables([]);
        } finally {
            setIsLoading(false);
        }
    }, [world, craftingClass, scripFilter]);

    useEffect(() => {
        fetchCollectables();
    }, [fetchCollectables]);

    const toggleExpand = (itemId) => {
        setExpandedItem(expandedItem === itemId ? null : itemId);
        setExpandedMaterial(null);
    };

    const toggleMaterialExpand = (e, matId) => {
        e.stopPropagation();
        setExpandedMaterial(expandedMaterial === matId ? null : matId);
    };

    const toggleExpansion = (value) => {
        if (value === 'All') {
            if (selectedExpansions.length === expansions.length - 1) {
                setSelectedExpansions([]);
            } else {
                setSelectedExpansions(expansions.filter(e => e.value !== 'All').map(e => e.value));
            }
        } else {
            if (selectedExpansions.includes(value)) {
                setSelectedExpansions(selectedExpansions.filter(e => e !== value));
            } else {
                setSelectedExpansions([...selectedExpansions, value]);
            }
        }
    };

    const allExpansionsSelected = selectedExpansions.length === 0;

    const filteredCollectables = collectables.filter(item => {
        if (selectedExpansions.length === 0) return true;
        return selectedExpansions.includes(item.expansion);
    });

    // Sort collectables based on selected price type and quality
    const sortedCollectables = useMemo(() => {
        return [...filteredCollectables].sort((a, b) => {
            // For collectables, we sort by cost (lower is better)
            if (priceSort === 'dc') {
                return (a.dcTotalCost || 0) - (b.dcTotalCost || 0);
            }
            // Use HQ or NQ costs if available
            if (quality === 'hq') {
                return (a.hqTotalCost || a.totalCost || 0) - (b.hqTotalCost || b.totalCost || 0);
            }
            return (a.totalCost || 0) - (b.totalCost || 0);
        });
    }, [filteredCollectables, priceSort, quality]);

    return (
        <>
            {/* Filters Card */}
            <div className="card p-4 mb-6">
                {/* Crafting Class Toggle */}
                <div className="mb-4">
                    <label className="block text-xs text-gray-500 mb-2">Crafting Class</label>
                    <div className="flex gap-2 flex-wrap">
                        {craftingClasses.map(({ value, label, icon }) => (
                            <button
                                key={value}
                                onClick={() => setCraftingClass(value)}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-150 
                                    ${craftingClass === value
                                        ? 'bg-gold/20 text-gold border border-gold/50'
                                        : 'bg-black/20 text-gray-400 border border-gray-700/50 hover:border-gray-600'
                                    }`}
                            >
                                {icon && <span className="mr-1">{icon}</span>}
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Expansion Multi-Select */}
                <div className="mb-4">
                    <label className="block text-xs text-gray-500 mb-2">Expansions</label>
                    <div className="flex gap-1.5 flex-wrap">
                        <button
                            onClick={() => toggleExpansion('All')}
                            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all duration-150 uppercase
                                ${allExpansionsSelected
                                    ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/50'
                                    : 'bg-black/20 text-gray-500 border border-gray-700/50 hover:border-gray-600'
                                }`}
                        >
                            All
                        </button>
                        {expansions.filter(e => e.value !== 'All').map(({ value }) => (
                            <button
                                key={value}
                                onClick={() => toggleExpansion(value)}
                                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all duration-150 uppercase
                                    ${selectedExpansions.includes(value) && !allExpansionsSelected
                                        ? `expansion-badge expansion-${value}`
                                        : 'bg-black/20 text-gray-500 border border-gray-700/50 hover:border-gray-600'
                                    }`}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scrip Type Filter */}
                <div>
                    <label className="block text-xs text-gray-500 mb-2">Scrip Type</label>
                    <div className="flex gap-1.5 flex-wrap">
                        {scripTypes.map(({ value, label, color }) => (
                            <button
                                key={value}
                                onClick={() => setScripFilter(value)}
                                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all duration-150
                                    ${scripFilter === value
                                        ? color === 'orange'
                                            ? 'bg-orange-900/30 text-orange-400 border border-orange-600/50'
                                            : color === 'purple'
                                                ? 'bg-purple-900/30 text-purple-400 border border-purple-600/50'
                                                : 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/50'
                                        : 'bg-black/20 text-gray-500 border border-gray-700/50 hover:border-gray-600'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Price Sort */}
                <div>
                    <label className="block text-xs text-gray-500 mb-2">Sort by Price</label>
                    <div className="flex gap-1.5">
                        <button
                            onClick={() => setPriceSort('server')}
                            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all
                                ${priceSort === 'server'
                                    ? 'bg-gold/20 text-gold border border-gold/50'
                                    : 'bg-black/20 text-gray-500 border border-gray-700/50 hover:border-gray-600'
                                }`}
                        >
                            🏠 Server
                        </button>
                        <button
                            onClick={() => setPriceSort('dc')}
                            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all
                                ${priceSort === 'dc'
                                    ? 'bg-gold/20 text-gold border border-gold/50'
                                    : 'bg-black/20 text-gray-500 border border-gray-700/50 hover:border-gray-600'
                                }`}
                        >
                            🌐 DC
                        </button>
                    </div>
                </div>

                {/* Quality Toggle */}
                <div>
                    <label className="block text-xs text-gray-500 mb-2">Quality</label>
                    <div className="flex gap-1.5">
                        <button
                            onClick={() => setQuality('nq')}
                            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all
                                ${quality === 'nq'
                                    ? 'bg-gray-600/30 text-gray-200 border border-gray-500'
                                    : 'bg-black/20 text-gray-500 border border-gray-700/50 hover:border-gray-600'
                                }`}
                        >
                            NQ
                        </button>
                        <button
                            onClick={() => setQuality('hq')}
                            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all
                                ${quality === 'hq'
                                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500'
                                    : 'bg-black/20 text-gray-500 border border-gray-700/50 hover:border-gray-600'
                                }`}
                        >
                            ✨ HQ
                        </button>
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            {!world && (
                <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800/50 rounded text-blue-300 text-sm">
                    💡 Select a world to see material prices and craft vs buy comparison.
                </div>
            )}

            {/* Legend */}
            {world && (
                <div className="mb-4 flex gap-4 text-xs text-gray-500">
                    <span><span className="text-green-400">🔨 CRAFT</span> = Cheaper to craft</span>
                    <span><span className="text-blue-400">💰 BUY</span> = Cheaper to buy</span>
                    <span>Click material to see sub-materials</span>
                </div>
            )}

            {/* Header Row */}
            <div className="flex items-center justify-between mb-4">
                <div className="text-xs text-gray-500">
                    Showing <span className="text-gold">{sortedCollectables.length}</span> collectables
                    {lastUpdate && (<span className="ml-2">• Updated: {lastUpdate.toLocaleTimeString()}</span>)}
                </div>
                <div className="text-xs text-gray-500">
                    Sorted by {priceSort === 'dc' ? 'DC lowest' : 'server'} cost
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-800/50 rounded text-red-400 text-sm">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="card p-8 text-center text-gray-500">
                    Loading collectables... {world && '(calculating optimal costs)'}
                </div>
            )}

            {/* Collectables List */}
            {!isLoading && (
                <div className="space-y-3">
                    {sortedCollectables.map((item) => {
                        const colors = SCRIP_COLORS[item.scrip] || SCRIP_COLORS.Purple;
                        const isExpanded = expandedItem === item.itemId;
                        const hasCost = item.totalOptimalCost > 0;

                        return (
                            <div
                                key={item.itemId}
                                className={`card p-4 ${colors.bg} border ${colors.border} transition-all cursor-pointer hover:border-opacity-60`}
                                onClick={() => toggleExpand(item.itemId)}
                            >
                                {/* Main Row */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        <span className="text-2xl">{item.icon}</span>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-100 flex items-center gap-2 flex-wrap">
                                                {item.name}
                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${colors.badge}`}>
                                                    {item.scrip}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase expansion-badge expansion-${item.expansion}`}>
                                                    {item.expansion}
                                                </span>
                                            </h3>
                                            <div className="text-xs text-gray-400 mt-0.5">
                                                Lv. {item.level} {item.craftingClass}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <div className="text-xs text-gray-500">Scrips</div>
                                            <div className={`text-xl font-bold ${colors.text}`}>{item.value}</div>
                                        </div>

                                        {world && (
                                            <div className="text-center">
                                                <div className="text-xs text-gray-500">Optimal Cost</div>
                                                <div className={`text-xl font-bold ${hasCost ? 'text-yellow-400' : 'text-gray-600'}`}>
                                                    {hasCost ? formatGil(item.totalOptimalCost) : '—'}
                                                </div>
                                            </div>
                                        )}

                                        {world && hasCost && (
                                            <div className="text-center min-w-[80px]">
                                                <div className="text-xs text-gray-500">Gil/Scrip</div>
                                                <div className={`text-xl font-bold ${item.gilPerScrip < 100 ? 'text-green-400' :
                                                    item.gilPerScrip < 300 ? 'text-yellow-400' : 'text-red-400'
                                                    }`}>
                                                    {item.gilPerScrip.toFixed(0)}
                                                </div>
                                            </div>
                                        )}

                                        <div className="text-gray-500 ml-2">{isExpanded ? '▲' : '▼'}</div>
                                    </div>
                                </div>

                                {/* Expanded Material Breakdown */}
                                {isExpanded && (
                                    <div className="mt-4 pt-4 border-t border-gray-700/50" onClick={e => e.stopPropagation()}>
                                        <h4 className="text-xs text-gray-500 mb-3 uppercase tracking-wide">
                                            Materials (Optimal Strategy)
                                        </h4>
                                        <div className="space-y-2">
                                            {item.materials?.filter(m => !m.isCrystal).map((mat) => {
                                                const isCraft = mat.cheapestOption === 'craft';
                                                const isBuy = mat.cheapestOption === 'buy';
                                                const hasSubs = mat.subMaterials && mat.subMaterials.length > 0;
                                                const isMatExpanded = expandedMaterial === mat.itemId;

                                                return (
                                                    <div key={mat.itemId}>
                                                        <div
                                                            className={`flex items-center justify-between p-3 rounded cursor-pointer transition-all ${isCraft ? 'bg-green-900/20 border border-green-800/30' :
                                                                isBuy ? 'bg-blue-900/20 border border-blue-800/30' :
                                                                    'bg-black/20 border border-gray-800/30'
                                                                }`}
                                                            onClick={(e) => hasSubs && toggleMaterialExpand(e, mat.itemId)}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {hasSubs && (
                                                                    <span className="text-gray-500 text-xs">
                                                                        {isMatExpanded ? '▼' : '▶'}
                                                                    </span>
                                                                )}
                                                                <div>
                                                                    <span className="text-gray-200">{mat.quantity}× {mat.name}</span>
                                                                    {isCraft && (
                                                                        <span className="ml-2 text-xs text-green-400 font-semibold">🔨 CRAFT</span>
                                                                    )}
                                                                    {isBuy && (
                                                                        <span className="ml-2 text-xs text-blue-400 font-semibold">💰 BUY</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-sm">
                                                                {world && (
                                                                    <>
                                                                        <div className="text-right">
                                                                            <div className="text-xs text-gray-500">Buy</div>
                                                                            <div className={isBuy ? 'text-blue-400 font-semibold' : 'text-gray-400'}>
                                                                                {formatGil(mat.buyPrice)}
                                                                            </div>
                                                                        </div>
                                                                        {mat.craftCost !== null && (
                                                                            <div className="text-right">
                                                                                <div className="text-xs text-gray-500">Craft</div>
                                                                                <div className={isCraft ? 'text-green-400 font-semibold' : 'text-gray-400'}>
                                                                                    {formatGil(mat.craftCost)}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        <div className="text-right min-w-[60px]">
                                                                            <div className="text-xs text-gray-500">Total</div>
                                                                            <div className="text-yellow-400 font-semibold">
                                                                                {formatGil(mat.optimalCost)}
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Sub-materials */}
                                                        {isMatExpanded && hasSubs && (
                                                            <div className="ml-6 mt-1 pl-3 border-l-2 border-gray-700/50">
                                                                <div className="text-xs text-gray-500 mb-1">Sub-materials to craft:</div>
                                                                {mat.subMaterials.filter(s => !s.isCrystal).map((sub, idx) => (
                                                                    <div key={idx} className="flex justify-between text-xs py-1 text-gray-400">
                                                                        <span>{sub.quantity}× {sub.name}</span>
                                                                        <span className={sub.unitPrice > 0 ? 'text-yellow-400' : 'text-gray-600'}>
                                                                            {formatGil(sub.unitPrice)} each
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Crystals summary */}
                                        {item.materials?.some(m => m.isCrystal) && (
                                            <div className="mt-3 text-xs text-gray-500">
                                                + Crystals: {item.materials.filter(m => m.isCrystal).map(m => `${m.quantity}× ${m.name}`).join(', ')}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {filteredCollectables.length === 0 && !isLoading && (
                <div className="card p-8 text-center text-gray-500">No collectables match your filters.</div>
            )}
        </>
    );
}

// ============================================
// BULK REFINING TAB COMPONENT
// ============================================
const MATERIAL_CATEGORIES = [
    { value: 'All', label: 'All Materials', icon: '📦' },
    { value: 'Ingot', label: 'Ingots', icon: '🪨' },
    { value: 'Lumber', label: 'Lumber', icon: '🪵' },
    { value: 'Cloth', label: 'Cloth', icon: '🧵' },
    { value: 'Leather', label: 'Leather', icon: '🥾' },
    { value: 'Reagent', label: 'Reagents', icon: '⚗️' },
    { value: 'Consumable', label: 'Consumables', icon: '🧪' },
    { value: 'Food', label: 'Food', icon: '🍳' }
];

function BulkRefiningTab({ world, craftingClass, setCraftingClass }) {
    const [materialCategory, setMaterialCategory] = useState('All');
    const [selectedExpansion, setSelectedExpansion] = useState('All');
    const [materials, setMaterials] = useState([]);
    const [filteredMaterials, setFilteredMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [expandedItem, setExpandedItem] = useState(null);
    const [priceSort, setPriceSort] = useState('server'); // 'server' or 'dc'
    const [quality, setQuality] = useState('nq'); // 'nq' or 'hq'

    const fetchMaterials = useCallback(async () => {
        if (!world) {
            setMaterials([]);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const params = new URLSearchParams({
                category: materialCategory,
                craftingClass,
                limit: '200'
            });

            const response = await fetch(`/api/crafting/materials/${encodeURIComponent(world)}/profit?${params}`);
            if (!response.ok) throw new Error('Failed to fetch material profits');

            const data = await response.json();
            setMaterials(data.materials || []);
            setLastUpdate(new Date());
        } catch (err) {
            setError(err.message);
            setMaterials([]);
        } finally {
            setIsLoading(false);
        }
    }, [world, materialCategory, craftingClass]);

    // Filter materials by expansion (level range)
    useEffect(() => {
        if (selectedExpansion === 'All') {
            setFilteredMaterials(materials);
        } else {
            const { min, max } = EXPANSION_LEVELS[selectedExpansion] || { min: 1, max: 100 };
            setFilteredMaterials(materials.filter(m => m.level >= min && m.level <= max));
        }
    }, [materials, selectedExpansion]);

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    const toggleExpand = (itemId) => {
        setExpandedItem(expandedItem === itemId ? null : itemId);
    };

    // Sort materials based on selected price type and quality
    const sortedMaterials = useMemo(() => {
        return [...filteredMaterials].sort((a, b) => {
            if (priceSort === 'dc') {
                return (b.dcProfit || 0) - (a.dcProfit || 0);
            }
            // Use HQ or NQ profit if available
            if (quality === 'hq') {
                return (b.hqProfit || b.profit || 0) - (a.hqProfit || a.profit || 0);
            }
            return (b.profit || 0) - (a.profit || 0);
        });
    }, [filteredMaterials, priceSort, quality]);

    return (
        <>
            {/* Filters */}
            <div className="card p-4 mb-6">
                {/* Material Category */}
                <div className="mb-4">
                    <label className="block text-xs text-gray-500 mb-2">Material Type</label>
                    <div className="flex gap-2 flex-wrap">
                        {MATERIAL_CATEGORIES.map(({ value, label, icon }) => (
                            <button
                                key={value}
                                onClick={() => setMaterialCategory(value)}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${materialCategory === value
                                    ? 'bg-gold/20 text-gold border border-gold/30'
                                    : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                {icon} {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Expansion Filter */}
                <div className="mb-4">
                    <label className="block text-xs text-gray-500 mb-2">Expansion</label>
                    <div className="flex gap-2 flex-wrap">
                        {expansions.map(({ value, label }) => (
                            <button
                                key={value}
                                onClick={() => setSelectedExpansion(value)}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${selectedExpansion === value
                                    ? 'bg-gold/20 text-gold border border-gold/30'
                                    : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Crafting Class */}
                <div>
                    <label className="block text-xs text-gray-500 mb-2">Crafting Class</label>
                    <div className="flex gap-2 flex-wrap">
                        {craftingClasses.map(({ value, label, icon }) => (
                            <button
                                key={value}
                                onClick={() => setCraftingClass(value)}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${craftingClass === value
                                    ? 'bg-gold/20 text-gold border border-gold/30'
                                    : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                {icon && <span className="mr-1">{icon}</span>}
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Price Sort */}
                <div className="mt-4">
                    <label className="block text-xs text-gray-500 mb-2">Sort by Price</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPriceSort('server')}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${priceSort === 'server'
                                ? 'bg-gold/20 text-gold border border-gold/30'
                                : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            🏠 Server
                        </button>
                        <button
                            onClick={() => setPriceSort('dc')}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${priceSort === 'dc'
                                ? 'bg-gold/20 text-gold border border-gold/30'
                                : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            🌐 DC Lowest
                        </button>
                    </div>
                </div>

                {/* Quality Toggle */}
                <div className="mt-4">
                    <label className="block text-xs text-gray-500 mb-2">Quality</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setQuality('nq')}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${quality === 'nq'
                                ? 'bg-gray-600/30 text-gray-200 border border-gray-500'
                                : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            NQ
                        </button>
                        <button
                            onClick={() => setQuality('hq')}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${quality === 'hq'
                                ? 'bg-blue-600/30 text-blue-300 border border-blue-500'
                                : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            ✨ HQ
                        </button>
                    </div>
                </div>
            </div>


            {/* Info Banner */}
            {!world && (
                <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800/50 rounded text-blue-300 text-sm">
                    💡 Select a world to see bulk crafting profit calculations.
                </div>
            )}

            {/* Header Row */}
            <div className="flex items-center justify-between mb-4">
                <div className="text-xs text-gray-500">
                    Showing <span className="text-gold">{sortedMaterials.length}</span> profitable materials
                    {lastUpdate && (
                        <span className="ml-2">• Updated: {lastUpdate.toLocaleTimeString()}</span>
                    )}
                </div>
                <div className="text-xs text-gray-500">
                    Sorted by {priceSort === 'dc' ? 'DC lowest' : 'server'} price
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-800/50 rounded text-red-400 text-sm">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="card p-8 text-center text-gray-500">
                    Calculating profits... (this may take a moment)
                </div>
            )}

            {/* Materials List */}
            {!isLoading && world && (
                <div className="space-y-3">
                    {sortedMaterials.map((item) => {
                        const isExpanded = expandedItem === item.itemId;
                        const classInfo = craftingClasses.find(c => c.value === item.craftingClass);

                        return (
                            <div
                                key={item.itemId}
                                className={`card p-4 transition-all cursor-pointer hover:border-gray-600 ${item.isProfitable
                                    ? 'border-green-800/50 bg-green-900/10'
                                    : 'border-red-800/30 bg-red-900/5'
                                    }`}
                                onClick={() => toggleExpand(item.itemId)}
                            >
                                {/* Main Row */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        <span className="text-2xl">
                                            {MATERIAL_CATEGORIES.find(c => c.value === item.category)?.icon || '📦'}
                                        </span>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-100 flex items-center gap-2">
                                                {item.name}
                                                {item.yields > 1 && (
                                                    <span className="text-xs text-gray-500">×{item.yields}</span>
                                                )}
                                            </h3>
                                            <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                                                <span>{classInfo?.icon} {item.craftingClass}</span>
                                                <span>•</span>
                                                <span>Lv. {item.level}</span>
                                                <span>•</span>
                                                <span className="capitalize">{item.category}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Profit Display */}
                                    <div className="text-right min-w-[140px]">
                                        {/* Server Profit */}
                                        <div className={`text-lg font-bold ${item.isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                                            {item.isProfitable ? '+' : ''}{formatGil(item.profit)}
                                            <span className="text-xs text-gray-500 ml-1">gil</span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            @ {formatGil(item.sellPrice)} each
                                        </div>
                                        {/* DC Lowest */}
                                        {item.dcSellPrice > 0 && item.dcSellWorld && (
                                            <div className={`text-xs mt-1 ${item.dcSellWorld === world ? 'text-green-500' : 'text-blue-400'}`}>
                                                {item.dcSellWorld === world ? (
                                                    <span>✓ Cheapest on DC</span>
                                                ) : (
                                                    <span>
                                                        DC: {formatGil(item.dcSellPrice)} ({item.dcSellWorld})
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="ml-3 text-gray-500">{isExpanded ? '▲' : '▼'}</div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="mt-4 pt-4 border-t border-gray-700/50">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Ingredients */}
                                            <div>
                                                <h4 className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                                                    Materials Cost
                                                </h4>
                                                <div className="space-y-1">
                                                    {item.ingredients.map((ing, idx) => (
                                                        <div key={idx} className="flex justify-between text-sm">
                                                            <span className="text-gray-300">
                                                                {ing.name} ×{ing.quantity}
                                                            </span>
                                                            <span className="text-gray-400">
                                                                {formatGil(ing.totalCost)} gil
                                                            </span>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-between text-sm pt-1 border-t border-gray-700/50">
                                                        <span className="text-gray-400">Materials Subtotal</span>
                                                        <span className="text-gray-400">
                                                            {formatGil(item.totalMaterialCost)} gil
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Crystals */}
                                                {item.crystals && item.crystals.length > 0 && (
                                                    <>
                                                        <h4 className="text-xs text-gray-500 mb-2 mt-3 uppercase tracking-wide">
                                                            💎 Crystals
                                                        </h4>
                                                        <div className="space-y-1">
                                                            {item.crystals.map((crystal, idx) => (
                                                                <div key={idx} className="flex justify-between text-sm">
                                                                    <span className="text-purple-300">
                                                                        {crystal.name} ×{crystal.quantity}
                                                                    </span>
                                                                    <span className="text-purple-400">
                                                                        {formatGil(crystal.totalCost)} gil
                                                                    </span>
                                                                </div>
                                                            ))}
                                                            <div className="flex justify-between text-sm pt-1 border-t border-gray-700/50">
                                                                <span className="text-gray-400">Crystals Subtotal</span>
                                                                <span className="text-purple-400">
                                                                    {formatGil(item.totalCrystalCost)} gil
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}

                                                {/* Total Cost */}
                                                <div className="flex justify-between text-sm font-semibold pt-2 mt-2 border-t border-gray-600">
                                                    <span className="text-gray-200">Total Cost</span>
                                                    <span className="text-red-400">
                                                        -{formatGil(item.totalCost || item.totalMaterialCost)} gil
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Output Value */}
                                            <div>
                                                <h4 className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                                                    Sale Value
                                                </h4>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-300">
                                                            {item.name} ×{item.yields}
                                                        </span>
                                                        <span className="text-gray-400">
                                                            @ {formatGil(item.sellPrice)} each
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm font-semibold pt-1 border-t border-gray-700/50">
                                                        <span className="text-gray-200">Total Revenue</span>
                                                        <span className="text-green-400">
                                                            +{formatGil(item.totalOutputValue)} gil
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-3 p-2 bg-black/30 rounded">
                                                    <div className="text-xs text-gray-500">Profit per Craft</div>
                                                    <div className={`text-lg font-bold ${item.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {item.profit > 0 ? '+' : ''}{formatGil(item.profitPerCraft)} gil
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {materials.length === 0 && !isLoading && world && (
                <div className="card p-8 text-center text-gray-500">
                    No profitable materials found for the selected filters.
                </div>
            )}
        </>
    );
}

// ============================================
// MAIN CRAFTING PAGE
// ============================================

export default function CraftingPage() {
    const [activeTab, setActiveTab] = useState('leves');
    const { selectedWorld } = useFilters();
    const [craftingClass, setCraftingClass] = useState('All');

    return (
        <div className="px-4 py-6 ffxiv-page min-h-screen">
            {/* Header with tab toggle */}
            <div className="flex items-center justify-between mb-8 pb-4" style={{ borderBottom: '1px solid rgba(255, 215, 0, 0.2)' }}>
                <div className="flex items-center gap-4">
                    <img src="/crafter.png" alt="Crafting" className="w-16 h-16 rounded-lg object-cover"
                        style={{ border: '2px solid rgba(255, 215, 0, 0.4)', boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)' }} />
                    <div>
                        <h1 className="text-3xl font-bold mb-1 ffxiv-title">
                            Crafting Log
                        </h1>
                        <p className="text-sm text-blue-200" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                            Find profitable recipes and collectables
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('leves')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'leves'
                            ? 'bg-gradient-to-r from-blue-900/80 to-blue-800/80 text-gold border border-gold shadow-[0_0_10px_rgba(255,215,0,0.3)]'
                            : 'bg-black/40 text-blue-300 border border-transparent hover:bg-blue-900/40 hover:text-white'
                            }`}
                    >
                        <span>📜</span> Recipes
                    </button>
                    <button
                        onClick={() => setActiveTab('collectables')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'collectables'
                            ? 'bg-gradient-to-r from-blue-900/80 to-blue-800/80 text-gold border border-gold shadow-[0_0_10px_rgba(255,215,0,0.3)]'
                            : 'bg-black/40 text-blue-300 border border-transparent hover:bg-blue-900/40 hover:text-white'
                            }`}
                    >
                        <span>💎</span> Collectables
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="animate-fadeIn">
                {activeTab === 'leves' && (
                    <LevequestsTab
                        world={selectedWorld}
                        craftingClass={craftingClass}
                        setCraftingClass={setCraftingClass}
                    />
                )}
                {activeTab === 'collectables' && (
                    <CollectablesTab
                        world={selectedWorld}
                        craftingClass={craftingClass}
                        setCraftingClass={setCraftingClass}
                    />
                )}
            </div>
        </div>
    );
}
