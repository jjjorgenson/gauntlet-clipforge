/**
 * Dropdown Component - Select Dropdown with Keyboard Navigation
 * 
 * A fully accessible dropdown component with keyboard navigation,
 * click outside to close, and smooth animations.
 */

import React, { useState, useRef, useEffect } from 'react';

// Dropdown item interface
export interface DropdownItem {
  value: string;
  label: string;
  disabled?: boolean;
}

// Dropdown props interface
export interface DropdownProps {
  items: DropdownItem[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  items,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Find selected item
  const selectedItem = items.find(item => item.value === value);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          const nextIndex = Math.min(focusedIndex + 1, items.length - 1);
          setFocusedIndex(nextIndex);
        }
        break;
      
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(items.length - 1);
        } else {
          const prevIndex = Math.max(focusedIndex - 1, 0);
          setFocusedIndex(prevIndex);
        }
        break;
      
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          const selectedItem = items[focusedIndex];
          if (!selectedItem.disabled) {
            onChange(selectedItem.value);
            setIsOpen(false);
            setFocusedIndex(-1);
          }
        } else if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        }
        break;
      
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        buttonRef.current?.focus();
        break;
    }
  };

  // Handle item click
  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled) {
      onChange(item.value);
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setFocusedIndex(-1);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Button */}
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-left bg-gray-800 border border-gray-600 rounded-md
          text-white placeholder-gray-400
          hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
        `}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={placeholder}
      >
        <span className={selectedItem ? 'text-white' : 'text-gray-400'}>
          {selectedItem ? selectedItem.label : placeholder}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg"
          role="listbox"
          aria-label="Options"
        >
          <div className="py-1 max-h-60 overflow-auto">
            {items.map((item, index) => (
              <div
                key={item.value}
                onClick={() => handleItemClick(item)}
                className={`
                  px-3 py-2 cursor-pointer transition-colors duration-150
                  ${index === focusedIndex ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}
                  ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                role="option"
                aria-selected={item.value === value}
                aria-disabled={item.disabled}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Export default
export default Dropdown;
