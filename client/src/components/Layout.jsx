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
    { path: '/tribes', label: 'Tribes', icon: '🤝' },
    { path: '/retainers', label: 'Retainers', icon: '🎯' },
    { path: '/exchanges', label: 'Exchanges', icon: '🔄' },
    { path: '/assistant', label: 'AI', icon: '🤖' }
];

export default function Layout({ children }) {
    const { selectedWorld, setSelectedWorld, selectedExpansion, setSelectedExpansion } = useFilters();

    return (
        <div className="min-h-screen flex flex-col ffxiv-page">
            {/* FFXIV Clear Blue Navigation */}
            <nav className="sticky top-0 z-50"
                style={{
                    background: 'linear-gradient(180deg, rgba(20, 40, 80, 0.98) 0%, rgba(13, 31, 60, 0.99) 100%)',
                    borderBottom: '1px solid rgba(74, 158, 255, 0.3)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
                }}>
                <div className="max-w-[1600px] mx-auto px-4 py-2">
                    <div className="flex items-center justify-between">
                        {/* Logo with Moogle */}
                        <div className="flex items-center gap-3">
                            <img src="/moogle.png" alt="" className="w-10 h-10 rounded-lg object-cover"
                                style={{ border: '1px solid rgba(255, 215, 0, 0.3)' }} />
                            <h1 className="text-xl font-bold hidden md:block"
                                style={{ color: '#ffd700', textShadow: '0 0 10px rgba(255, 215, 0, 0.3)' }}>
                                FFXIV Companion
                            </h1>
                            <EorzeanClock compact />
                        </div>

                        {/* Nav Links - FFXIV Style */}
                        <div className="flex-1 flex items-center gap-1 ml-4">
                            {navItems.map(item => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                            ? ''
                                            : ''
                                        }`
                                    }
                                    style={({ isActive }) => isActive ? {
                                        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 180, 0, 0.1))',
                                        border: '1px solid rgba(255, 215, 0, 0.4)',
                                        color: '#ffd700',
                                        boxShadow: '0 0 10px rgba(255, 215, 0, 0.2)'
                                    } : {
                                        background: 'transparent',
                                        border: '1px solid transparent',
                                        color: '#a8d4ff'
                                    }}
                                >
                                    <span>{item.icon}</span>
                                    <span className="hidden sm:inline">{item.label}</span>
                                </NavLink>
                            ))}
                            {/* External Links */}
                            <a
                                href="https://remmold.github.io/remmold-games/index.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                                style={{ color: '#a8d4ff', border: '1px solid transparent' }}
                                title="Back to Remmold Games"
                            >
                                <span>🏠</span>
                                <span className="hidden lg:inline">Home</span>
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Global Filters Bar */}
            <div className="sticky top-[52px] z-40"
                style={{
                    background: 'rgba(10, 22, 40, 0.95)',
                    borderBottom: '1px solid rgba(74, 158, 255, 0.2)'
                }}>
                <div className="max-w-[1600px] mx-auto px-4 py-2">
                    <div className="flex items-center justify-between gap-4">
                        {/* World Selector */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: '#a8d4ff' }}>World:</span>
                            <select
                                value={selectedWorld}
                                onChange={(e) => setSelectedWorld(e.target.value)}
                                className="rounded px-2 py-1 text-sm min-w-[140px]"
                                style={{
                                    background: 'rgba(10, 20, 40, 0.8)',
                                    border: '1px solid rgba(74, 158, 255, 0.3)',
                                    color: '#e0f0ff'
                                }}
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
                                    className="px-3 py-1 rounded text-xs font-medium transition-all"
                                    style={selectedExpansion === exp.value ? {
                                        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 180, 0, 0.1))',
                                        border: '1px solid rgba(255, 215, 0, 0.4)',
                                        color: '#ffd700'
                                    } : {
                                        background: 'transparent',
                                        border: '1px solid transparent',
                                        color: '#a8d4ff'
                                    }}
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
                <aside className="hidden lg:block w-64 flex-shrink-0 p-4 sticky top-[100px] h-[calc(100vh-100px)] overflow-y-auto"
                    style={{ borderRight: '1px solid rgba(74, 158, 255, 0.15)' }}>
                    <TimedNodesSidebar />
                </aside>

                {/* Page Content */}
                <main className="flex-1 min-w-0">
                    {children}
                </main>

                {/* Right Sidebar - Filler Nodes */}
                <aside className="hidden xl:block w-64 flex-shrink-0 p-4 sticky top-[100px] h-[calc(100vh-100px)] overflow-y-auto"
                    style={{ borderLeft: '1px solid rgba(74, 158, 255, 0.15)' }}>
                    <FillerNodesSidebar />
                </aside>
            </div>

            {/* Footer - FFXIV Themed */}
            <footer className="py-5"
                style={{
                    borderTop: '1px solid rgba(74, 158, 255, 0.2)',
                    background: 'rgba(10, 22, 40, 0.8)'
                }}>
                <div className="max-w-[1600px] mx-auto px-4 text-center text-xs">
                    <p className="mb-2">
                        <a href="https://remmold.github.io/remmold-games/index.html" target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded transition-all"
                            style={{
                                background: 'linear-gradient(135deg, rgba(74, 158, 255, 0.2), rgba(74, 158, 255, 0.1))',
                                border: '1px solid rgba(74, 158, 255, 0.3)',
                                color: '#a8d4ff'
                            }}>
                            🏠 Remmold Games
                        </a>
                    </p>
                    <p style={{ color: 'rgba(168, 212, 255, 0.6)' }}>
                        Prices from{' '}
                        <a href="https://universalis.app" target="_blank" rel="noopener noreferrer"
                            style={{ color: '#4a9eff' }}>Universalis</a>
                        {' '}• Icons from{' '}
                        <a href="https://xivapi.com" target="_blank" rel="noopener noreferrer"
                            style={{ color: '#4a9eff' }}>XIVAPI</a>
                        {' '}• Not affiliated with Square Enix
                    </p>
                    <p className="mt-1" style={{ color: 'rgba(168, 212, 255, 0.3)' }}>
                        FINAL FANTASY XIV © SQUARE ENIX CO., LTD.
                    </p>
                </div>
            </footer>
        </div>
    );
}
