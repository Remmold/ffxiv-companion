import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FilterProvider } from './context/FilterContext';
import Layout from './components/Layout';
import GatheringPage from './pages/GatheringPage';
import CraftingPage from './pages/CraftingPage';
import CollectablesPage from './pages/CollectablesPage';
import MaterialBrowserPage from './pages/MaterialBrowserPage';
import MarketDealsPage from './pages/MarketDealsPage';
import GearGuidePage from './pages/GearGuidePage';
import ChecklistPage from './pages/ChecklistPage';
import AlliedSocietiesPage from './pages/AlliedSocietiesPage';
import OverlayPage from './pages/OverlayPage';

export default function App() {
    return (
        <BrowserRouter>
            <FilterProvider>
                <Routes>
                    {/* Overlay route - no layout wrapper */}
                    <Route path="/overlay" element={<OverlayPage />} />

                    {/* Main app routes with Layout */}
                    <Route path="/*" element={
                        <Layout>
                            <Routes>
                                <Route path="/" element={<GatheringPage />} />
                                <Route path="/crafting" element={<CraftingPage />} />
                                <Route path="/collectables" element={<CollectablesPage />} />
                                <Route path="/materials" element={<MaterialBrowserPage />} />
                                <Route path="/deals" element={<MarketDealsPage />} />
                                <Route path="/gear" element={<GearGuidePage />} />
                                <Route path="/checklist" element={<ChecklistPage />} />
                                <Route path="/tribes" element={<AlliedSocietiesPage />} />
                            </Routes>
                        </Layout>
                    } />
                </Routes>
            </FilterProvider>
        </BrowserRouter>
    );
}
