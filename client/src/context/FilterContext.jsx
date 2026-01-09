import { createContext, useContext, useState, useEffect } from 'react';

const FilterContext = createContext(null);

export function FilterProvider({ children }) {
    // Global world selection
    const [selectedWorld, setSelectedWorld] = useState(() => {
        return localStorage.getItem('selectedWorld') || '';
    });

    // Global expansion filter
    const [selectedExpansion, setSelectedExpansion] = useState(() => {
        return localStorage.getItem('selectedExpansion') || 'All';
    });

    // Price display preference: 'server' or 'dcLowest'
    const [pricePreference, setPricePreference] = useState(() => {
        return localStorage.getItem('pricePreference') || 'server';
    });

    // Persist to localStorage
    useEffect(() => {
        if (selectedWorld) {
            localStorage.setItem('selectedWorld', selectedWorld);
        }
    }, [selectedWorld]);

    useEffect(() => {
        localStorage.setItem('selectedExpansion', selectedExpansion);
    }, [selectedExpansion]);

    useEffect(() => {
        localStorage.setItem('pricePreference', pricePreference);
    }, [pricePreference]);

    const value = {
        selectedWorld,
        setSelectedWorld,
        selectedExpansion,
        setSelectedExpansion,
        pricePreference,
        setPricePreference
    };

    return (
        <FilterContext.Provider value={value}>
            {children}
        </FilterContext.Provider>
    );
}

export function useFilters() {
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error('useFilters must be used within a FilterProvider');
    }
    return context;
}

export default FilterContext;
