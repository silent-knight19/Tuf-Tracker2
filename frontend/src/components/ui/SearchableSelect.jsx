import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

const SearchableSelect = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Search...", 
  label = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Filter options based on search term
  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option);
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {label && <label className="block text-sm font-medium text-dark-300 mb-2">{label}</label>}
      
      <div 
        className="relative group"
        onClick={() => setIsOpen(true)}
      >
        <div className={`
          w-full bg-dark-950 border rounded-lg px-4 py-3 text-white 
          flex items-center justify-between cursor-text transition-colors
          ${isOpen ? 'border-brand-orange ring-1 ring-brand-orange' : 'border-dark-700 hover:border-dark-600'}
        `}>
          {isOpen ? (
            <input
              autoFocus
              type="text"
              className="bg-transparent border-none outline-none w-full text-white placeholder-dark-500"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className={value ? "text-white" : "text-dark-500"}>
              {value || placeholder}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-dark-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-dark-900 border border-dark-700 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className="w-full text-left px-4 py-2 text-sm text-dark-200 hover:bg-dark-800 hover:text-white flex items-center justify-between group"
              >
                <span>{option}</span>
                {value === option && <Check className="w-4 h-4 text-brand-orange" />}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-dark-500 text-center">
              No matches found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
