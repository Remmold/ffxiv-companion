import { useState, useEffect, useCallback } from 'react';
import WorldSelector from '../components/WorldSelector';
import { dohGear, dolGear, scripGear, gearMaterials } from '../data/bisGear';

const SLOT_ICONS = {
    'Main Hand': '🔨',
    'Off Hand': '🛠️',
    'Head': '🎩',
    'Body': '👔',
    'Hands': '🧤',
    'Legs': '👖',
    'Feet': '👢',
    'Earrings': '💎',
    'Necklace': '📿',
    'Bracelet': '⌚',
    'Ring': '💍'
};

export default function GearGuidePage() {
    const [world, setWorld] = useState(() => localStorage.getItem('selectedWorld') || '');
    const [gearType, setGearType] = useState('dol'); // 'doh' or 'dol'
    const [expandedSlot, setExpandedSlot] = useState(null);
    const [prices, setPrices] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const gear = gearType === 'doh' ? dohGear : dolGear;

    // Calculate total materials needed
    const totalMaterials = {};
    gear.slots.forEach(slot => {
        const qty = slot.qty || 1;
        slot.materials.forEach(mat => {
            totalMaterials[mat.name] = (totalMaterials[mat.name] || 0) + (mat.qty * qty);
        });
    });

    useEffect(() => {
        if (world) {
            localStorage.setItem('selectedWorld', world);
        }
    }, [world]);

    const formatGil = (amount) => {
        if (!amount) return '—';
        if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
        return amount.toLocaleString();
    };

    // Calculate total cost
    const totalCost = Object.entries(totalMaterials).reduce((sum, [name, qty]) => {
        const price = prices[name] || 0;
        return sum + (price * qty);
    }, 0);

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-display font-semibold text-gold mb-2">
                    ⚙️ BiS Gear Guide
                </h1>
                <p className="text-gray-400 text-sm">
                    Best in Slot gear for Dawntrail (Level 100). Shows materials needed to craft each piece.
                </p>
            </div>

            {/* Gear Type Toggle */}
            <div className="card p-5 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                            Gear Type
                        </h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setGearType('dol')}
                                className={`px-4 py-2 rounded text-sm font-medium transition-all ${gearType === 'dol'
                                        ? 'bg-green-900/30 text-green-400 border border-green-600/50'
                                        : 'bg-black/20 text-gray-400 border border-gray-700/50 hover:border-gray-600'
                                    }`}
                            >
                                🌿 Gatherer (DoL)
                            </button>
                            <button
                                onClick={() => setGearType('doh')}
                                className={`px-4 py-2 rounded text-sm font-medium transition-all ${gearType === 'doh'
                                        ? 'bg-orange-900/30 text-orange-400 border border-orange-600/50'
                                        : 'bg-black/20 text-gray-400 border border-gray-700/50 hover:border-gray-600'
                                    }`}
                            >
                                🔨 Crafter (DoH)
                            </button>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-gray-500">Current BiS</div>
                        <div className="text-xl font-bold text-gold">{gear.name}</div>
                        <div className="text-xs text-gray-400">i{gear.ilvl} {gear.type}</div>
                    </div>
                </div>
            </div>

            {/* Scrip Alternative Note */}
            <div className="mb-6 p-4 bg-purple-900/20 border border-purple-800/50 rounded text-purple-300 text-sm">
                <strong>💜 Budget Option:</strong> {scripGear[gearType].name} (i{scripGear[gearType].ilvl}) -
                Free with {scripGear[gearType].cost}. {scripGear[gearType].note}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gear Slots */}
                <div className="lg:col-span-2 space-y-3">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                        Gear Slots
                    </h3>
                    {gear.slots.map((slot, idx) => {
                        const isExpanded = expandedSlot === idx;
                        const slotQty = slot.qty || 1;

                        return (
                            <div
                                key={idx}
                                className="card p-4 cursor-pointer hover:border-gold/30 transition-all"
                                onClick={() => setExpandedSlot(isExpanded ? null : idx)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{SLOT_ICONS[slot.slot] || '📦'}</span>
                                        <div>
                                            <div className="font-medium text-gray-100">
                                                {slot.name.replace('{Job}', '')}
                                                {slotQty > 1 && <span className="text-gray-500 ml-1">×{slotQty}</span>}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {slot.slot}
                                                {slot.perJob && ' • Per job'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right text-xs">
                                            <div className="text-gray-400">
                                                {gearType === 'doh'
                                                    ? `+${slot.stats.craftsmanship} Craft / +${slot.stats.control} Ctrl`
                                                    : `+${slot.stats.gathering} Gath / +${slot.stats.perception} Perc`
                                                }
                                            </div>
                                            <div className="text-purple-400">
                                                +{gearType === 'doh' ? slot.stats.cp : slot.stats.gp} {gearType === 'doh' ? 'CP' : 'GP'}
                                            </div>
                                        </div>
                                        <span className="text-gray-500">{isExpanded ? '▲' : '▼'}</span>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="mt-4 pt-4 border-t border-gray-700/50">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-xs text-gray-500 mb-2">Materials</div>
                                                {slot.materials.map((mat, i) => (
                                                    <div key={i} className="text-sm text-gray-300 py-1">
                                                        {mat.qty * slotQty}× {mat.name}
                                                    </div>
                                                ))}
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 mb-2">Recommended Melds</div>
                                                {slot.melds.map((meld, i) => (
                                                    <div key={i} className="text-sm text-blue-400 py-1">
                                                        {meld}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Materials Summary */}
                <div>
                    <div className="card p-4 sticky top-20">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                            Total Materials Needed
                        </h3>
                        <div className="space-y-2">
                            {Object.entries(totalMaterials)
                                .sort((a, b) => b[1] - a[1])
                                .map(([name, qty]) => {
                                    const matInfo = gearMaterials[name];
                                    return (
                                        <div key={name} className="flex justify-between text-sm py-1 border-b border-gray-800/50">
                                            <div>
                                                <span className="text-gray-200">{name}</span>
                                                {matInfo?.timed && (
                                                    <span className="ml-1 text-yellow-500 text-xs">⏰</span>
                                                )}
                                            </div>
                                            <span className="text-gold font-medium">{qty}</span>
                                        </div>
                                    );
                                })}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-700">
                            <div className="text-xs text-gray-500 mb-1">Note</div>
                            <div className="text-xs text-gray-400">
                                These are processed materials. You'll also need to gather/buy the base materials to craft these.
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-700">
                            <div className="text-xs text-gray-500 mb-1">⏰ = Timed Node Material</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
