import { useState, useEffect } from 'react';
import { folkloreGuides, generalTips } from '../data/folkloreGuide';
import { copyTeleportMacro } from '../utils/notifications';

export default function FolkloreGuide({ isOpen, onClose, defaultExpansion = 'DT' }) {
    const [selectedExpansion, setSelectedExpansion] = useState(defaultExpansion);
    const [copiedAetheryte, setCopiedAetheryte] = useState(null);

    // Update selected expansion when defaultExpansion changes
    useEffect(() => {
        if (isOpen && defaultExpansion) {
            setSelectedExpansion(defaultExpansion);
        }
    }, [isOpen, defaultExpansion]);

    const handleCopyTeleport = async (aetheryte) => {
        const success = await copyTeleportMacro(aetheryte);
        if (success) {
            setCopiedAetheryte(aetheryte);
            setTimeout(() => setCopiedAetheryte(null), 2000);
        }
    };

    if (!isOpen) return null;

    const guide = folkloreGuides[selectedExpansion];

    return (
        <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="card w-full max-w-4xl bg-gray-900">
                {/* Header */}
                <div className="ffxiv-header p-4 flex items-center justify-between">
                    <h2 className="text-xl font-display font-semibold text-gold">
                        📚 Folklore Book Guide
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-3xl leading-none px-2"
                    >
                        ×
                    </button>
                </div>

                {/* Expansion Tabs */}
                <div className="flex gap-2 p-4 bg-black/30 border-b border-gray-800/50">
                    {Object.entries(folkloreGuides).map(([key, data]) => (
                        <button
                            key={key}
                            onClick={() => setSelectedExpansion(key)}
                            className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${selectedExpansion === key
                                    ? `expansion-badge expansion-${key}`
                                    : 'bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                                }`}
                        >
                            {data.name}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6">
                    {guide && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column - Info & Vendors */}
                            <div>
                                {/* Level Requirement */}
                                <div className="mb-4 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                                    <span className="text-blue-400 font-semibold">📊 Level Required:</span>
                                    <span className="text-gray-100 ml-2 text-lg">{guide.levelReq}</span>
                                </div>

                                {/* How to Get */}
                                <div className="mb-4">
                                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-2">
                                        How to Unlock
                                    </h3>
                                    <p className="text-gray-300 leading-relaxed">{guide.howToGet}</p>
                                </div>

                                {/* Vendor Locations with Teleport */}
                                {guide.vendors && guide.vendors.length > 0 && (
                                    <div className="mb-4">
                                        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
                                            📍 Vendor Locations
                                        </h3>
                                        <div className="space-y-2">
                                            {guide.vendors.map((vendor, idx) => (
                                                <div
                                                    key={idx}
                                                    className="p-3 bg-black/40 rounded-lg border border-gray-700/50 flex items-center justify-between gap-3"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-gray-100">
                                                            {vendor.name}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {vendor.location} {vendor.coords}
                                                            {vendor.notes && <span className="text-yellow-500 ml-1">({vendor.notes})</span>}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleCopyTeleport(vendor.aetheryte)}
                                                        className="teleport-btn flex-shrink-0"
                                                        title={`Copy: ${vendor.aetheryte}`}
                                                    >
                                                        📍 {copiedAetheryte === vendor.aetheryte ? '✓ Copied!' : 'Teleport'}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* General Tips */}
                                <div className="p-4 bg-yellow-900/15 border border-yellow-700/30 rounded-lg">
                                    <h3 className="text-sm font-semibold text-yellow-400 mb-2">💡 Quick Tips</h3>
                                    <ul className="text-sm text-gray-300 space-y-1">
                                        {generalTips.map((tip, idx) => (
                                            <li key={idx}>• {tip}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Right Column - Books List */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
                                    Required Books ({guide.books.length})
                                </h3>
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                    {guide.books.map((book, idx) => (
                                        <div
                                            key={idx}
                                            className="p-4 bg-black/40 rounded-lg border border-gray-700/50"
                                        >
                                            <div className="font-semibold text-gray-100 mb-2 text-base">
                                                📖 {book.name}
                                            </div>
                                            <div className="text-sm text-gray-300 space-y-1">
                                                <div>
                                                    <span className="text-gold font-medium">Cost:</span> {book.cost}
                                                </div>
                                                <div>
                                                    <span className="text-blue-400 font-medium">Vendor:</span> {book.vendor}
                                                </div>
                                                {book.notes && (
                                                    <div className="text-gray-400 italic mt-1">{book.notes}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-black/30 border-t border-gray-800/50 text-center">
                    <button
                        onClick={onClose}
                        className="px-8 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
