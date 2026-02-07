import { useState, useRef, useEffect } from 'react';
import { useThemeStore } from '../../../store';

/**
 * Custom Select dropdown with keyboard navigation & theme support
 */
const CustomSelect = ({ value, onChange, options, placeholder, icon, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownRef = useRef(null);
    const { theme } = useThemeStore();
    const isDark = theme === 'dark';

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                setIsOpen(true);
                setHighlightedIndex(0);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0) {
                    handleSelect(options[highlightedIndex].value);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                break;
            default:
                break;
        }
    };

    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
    };

    const selectedOption = options.find((opt) => opt.value === value);

    return (
        <div ref={dropdownRef} className="relative w-full">
            {label && (
                <label className="block text-[0.7rem] uppercase tracking-wider text-text-muted font-semibold mb-2">
                    {label}
                </label>
            )}

            {/* Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                className={`
                    w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-sm
                    transition-all duration-200 ease-in-out bg-transparent text-text
                    border-border hover:border-primary/40
                    focus:outline-none
                    ${isOpen ? 'ring-2 ring-primary/30 border-primary/50' : ''}
                `}
            >
                <span className={`flex items-center gap-2 truncate ${!selectedOption ? 'text-text-muted' : ''}`}>
                    {icon && <span className="text-text-muted shrink-0">{icon}</span>}
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-4 h-4 shrink-0 text-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            <div
                className={`
                    absolute z-50 w-full mt-1.5 rounded-xl shadow-lg overflow-hidden
                    transition-all duration-200 ease-in-out origin-top
                    bg-surface border border-border
                    ${isOpen
                        ? 'opacity-100 scale-y-100 max-h-60 visible'
                        : 'opacity-0 scale-y-95 max-h-0 invisible pointer-events-none'
                    }
                `}
            >
                <div className="overflow-y-auto max-h-60">
                    {options.map((option, index) => {
                        const isSelected = value === option.value;
                        const isHighlighted = highlightedIndex === index;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option.value)}
                                onMouseEnter={() => setHighlightedIndex(index)}
                                className={`
                                    w-full px-3 py-2.5 text-left text-sm transition-colors duration-150
                                    ${isSelected
                                        ? 'bg-primary text-white font-medium'
                                        : isHighlighted
                                            ? (isDark ? 'bg-surface-hover text-text' : 'bg-surface-alt text-text')
                                            : 'text-text-secondary hover:bg-surface-alt'
                                    }
                                `}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CustomSelect;
