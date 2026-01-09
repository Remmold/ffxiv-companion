import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FilterProvider } from './context/FilterContext';
import Layout from './components/Layout';
import GatheringPage from './pages/GatheringPage';
import CraftingPage from './pages/CraftingPage';
import MarketDealsPage from './pages/MarketDealsPage';
import GearGuidePage from './pages/GearGuidePage';
import ChecklistPage from './pages/ChecklistPage';
import AlliedSocietiesPage from './pages/AlliedSocietiesPage';
import RetainerVenturesPage from './pages/RetainerVenturesPage';
import ExchangesPage from './pages/ExchangesPage';
import OverlayPage from './pages/OverlayPage';
import AssistantPage from './pages/AssistantPage';
import AssistantChat from './components/AssistantChat';

export default function App() {
    return (
        <BrowserRouter>
            <FilterProvider>
                <Routes>
                    {/* Overlay route - no layout wrapper */}
                    <Route path="/overlay" element={<OverlayPage />} />

                    {/* Assistant page - full screen, no layout */}
                    <Route path="/assistant" element={<AssistantPage />} />

                    {/* Main app routes with Layout */}
                    <Route path="/*" element={
                        <Layout>
                            <Routes>
                                <Route path="/" element={<GatheringPage />} />
                                <Route path="/crafting" element={<CraftingPage />} />
                                <Route path="/deals" element={<MarketDealsPage />} />
                                <Route path="/gear" element={<GearGuidePage />} />
                                <Route path="/checklist" element={<ChecklistPage />} />
                                <Route path="/tribes" element={<AlliedSocietiesPage />} />
                                <Route path="/retainers" element={<RetainerVenturesPage />} />
                                <Route path="/exchanges" element={<ExchangesPage />} />
                            </Routes>
                        </Layout>
                    } />
                </Routes>
            </FilterProvider>
            <AssistantChat />
        </BrowserRouter>
    );
}

