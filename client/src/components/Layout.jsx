import { NavLink } from 'react-router-dom';
import EorzeanClock from './EorzeanClock';
import WorldSelector from './WorldSelector';
import TimedNodesSidebar from './TimedNodesSidebar';
import FillerNodesSidebar from './FillerNodesSidebar';
import { useFilters } from '../context/FilterContext';
import { expansions, dataCenters, dcByRegion, regionOrder } from '../data/ffxivData';

const navItems = [
    { path: '/', label: 'Gathering', icon: '⛏️' },
    { path: '/crafting', label: 'Crafting', icon: '🔨' },
    { path: '/deals', label: 'Deals', icon: '💰' },
    { path: '/gear', label: 'Gear', icon: '⚙️' },
    { path: '/checklist', label: 'Checklist', icon: '📋' },
    { path: '/tribes', label: 'Tribes', icon: '🤝' }
];

export default function Layout({ children }) {
    const { selectedWorld, setSelectedWorld, selectedExpansion, setSelectedExpansion } = useFilters();

    return (
        <div className="min-h-screen flex flex-col">
            {/* Navigation */}
            <nav className="ffxiv-header sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-4 py-2">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">💰</span>
                                <h1 className="text-xl font-display font-semibold text-gold hidden md:block">
                                    FFXIV Companion
                                </h1>
                            </div>
                            <EorzeanClock compact />
                        </div>

                        {/* Nav Links - Fill remaining space equally */}
                        <div className="flex-1 flex items-center gap-1 ml-4">
                            {navItems.map(item => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                            ? 'bg-gold/20 text-gold border border-gold/30'
                                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                                        }`
                                    }
                                >
                                    <span>{item.icon}</span>
                                    <span className="hidden sm:inline">{item.label}</span>
                                </NavLink>
                            ))}
                            {/* Home Link */}
                            <a
                                href="https://remmold.github.io/remmold-games/index.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-colors"
                                title="Back to Remmold Games"
                            >
                                <span>🏠</span>
                                <span className="hidden lg:inline">Home</span>
                            </a>
                            {/* Download Desktop App */}
                            <a
                                href="https://github.com/Remmold/ffxiv-companion/releases/latest"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-colors"
                                title="Download Desktop Overlay App"
                            >
                                <span>💻</span>
                                <span className="hidden lg:inline">App</span>
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Global Filters Bar */}
            <div className="bg-gray-900/80 border-b border-gray-800/50 sticky top-[52px] z-40">
                <div className="max-w-[1600px] mx-auto px-4 py-2">
                    <div className="flex items-center justify-between gap-4">
                        {/* World Selector (compact) */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">World:</span>
                            <select
                                value={selectedWorld}
                                onChange={(e) => setSelectedWorld(e.target.value)}
                                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-200 min-w-[140px]"
                            >
                                <option value="">Select World</option>
                                {regionOrder.map(region => (
                                    dcByRegion[region].map(dc => (
                                        <optgroup key={dc} label={`${dc} (${region})`}>
                                            {dataCenters[dc].map(world => (
                                                <option key={world} value={world}>{world}</option>
                                            ))}
                                        </optgroup>
                                    ))
                                ))}
                            </select>
                        </div>

                        {/* Expansion Filter Buttons */}
                        <div className="flex items-center gap-1">
                            {expansions.map(exp => (
                                <button
                                    key={exp.value}
                                    onClick={() => setSelectedExpansion(exp.value)}
                                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${selectedExpansion === exp.value
                                        ? 'bg-gold/20 text-gold border border-gold/30'
                                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                                        }`}
                                >
                                    {exp.value === 'All' ? 'All' : exp.value}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content with Sidebars */}
            <div className="flex-1 flex">
                {/* Left Sidebar - Timed Nodes */}
                <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-gray-800/50 p-4 sticky top-[100px] h-[calc(100vh-100px)] overflow-y-auto">
                    <TimedNodesSidebar />
                </aside>

                {/* Page Content */}
                <main className="flex-1 min-w-0">
                    {children}
                </main>

                {/* Right Sidebar - Filler Nodes */}
                <aside className="hidden xl:block w-64 flex-shrink-0 border-l border-gray-800/50 p-4 sticky top-[100px] h-[calc(100vh-100px)] overflow-y-auto">
                    <FillerNodesSidebar />
                </aside>
            </div>

            {/* Footer */}
            <footer className="py-5 border-t border-gray-800/50">
                <div className="max-w-[1600px] mx-auto px-4 text-center text-xs text-gray-600">
                    <p className="mb-2">
                        <a href="https://remmold.github.io/remmold-games/index.html" target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors">
                            🏠 Remmold Games
                        </a>
                    </p>
                    <p>
                        Prices from{' '}
                        <a href="https://universalis.app" target="_blank" rel="noopener noreferrer"
                            className="text-blue-400 hover:underline">Universalis</a>
                        {' '}• Icons from{' '}
                        <a href="https://xivapi.com" target="_blank" rel="noopener noreferrer"
                            className="text-blue-400 hover:underline">XIVAPI</a>
                        {' '}• Not affiliated with Square Enix
                    </p>
                    <p className="mt-1 text-gray-700">
                        FINAL FANTASY XIV © SQUARE ENIX CO., LTD.
                    </p>
                </div>
            </footer>
        </div>
    );
}
