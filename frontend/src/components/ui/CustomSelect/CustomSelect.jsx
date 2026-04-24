import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useThemeStore } from '../../../store';

/**
 * Custom Select dropdown with keyboard navigation & theme support
 */
const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder,
  icon,
  label,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, direction: 'down' });
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const updateCoords = () => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const dropdownMaxHeight = 240;
      const spaceBelow = window.innerHeight - rect.bottom;
      const shouldOpenUp = spaceBelow < dropdownMaxHeight && rect.top > dropdownMaxHeight;

      setCoords({
        top: shouldOpenUp ? rect.top : rect.bottom,
        left: rect.left,
        width: rect.width,
        direction: shouldOpenUp ? 'up' : 'down',
      });
    }
  };

  const toggleOpen = () => {
    if (!disabled) {
      if (!isOpen) {
        updateCoords();
      }
      setIsOpen(!isOpen);
    }
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('resize', updateCoords);
      window.addEventListener('scroll', updateCoords, true);
    }
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        updateCoords();
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
    <div
      ref={dropdownRef}
      className={`relative w-full ${isOpen ? 'z-[100]' : 'z-10'} ${className}`}
    >
      {label && (
        <label className="block text-[0.7rem] uppercase tracking-wider text-text-muted font-semibold mb-2 ">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={toggleOpen}
        onKeyDown={(e) => !disabled && handleKeyDown(e)}
        className={`
                    w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-sm
                    transition-all duration-200 ease-in-out bg-transparent text-text
                    border-border hover:border-primary/40
                    focus:outline-none 
                    ${isOpen ? 'ring-2 ring-primary/30 border-primary/50' : ''}
                    ${disabled ? 'opacity-50 cursor-not-allowed grayscale-[0.5]' : ''}
                `}
      >
        <span
          className={`flex items-center gap-2 truncate ${!selectedOption ? 'text-text-muted' : ''}`}
        >
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

      {/* Dropdown via Portal */}
      {isOpen &&
        coords.width > 0 &&
        createPortal(
          <div
            className={`
                        fixed z-[9999] rounded-xl shadow-2xl overflow-hidden
                        transition-opacity duration-200 ease-in-out animate-in fade-in zoom-in-95
                        bg-surface border border-border 
                        ${coords.direction === 'up' ? 'origin-bottom mb-1.5' : 'origin-top mt-1.5'}
                        ${isDark ? 'dark' : ''}
                    `}
            style={{
              top: coords.direction === 'up' ? 'auto' : coords.top,
              bottom: coords.direction === 'up' ? window.innerHeight - coords.top : 'auto',
              left: coords.left,
              width: coords.width,
              maxHeight: '240px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-y-auto max-h-[240px] scrollbar-hide">
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
                                        ${
                                          isSelected
                                            ? 'bg-primary text-white font-medium'
                                            : isHighlighted
                                              ? isDark
                                                ? 'bg-surface-hover text-text'
                                                : 'bg-surface-alt text-text'
                                              : 'text-text-secondary hover:bg-surface-alt'
                                        }
                                    `}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default CustomSelect;
