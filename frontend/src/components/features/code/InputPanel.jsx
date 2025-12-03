import PropTypes from 'prop-types';
import { X } from 'lucide-react';

function InputPanel({ value, onChange }) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-dark-800 bg-dark-900">
        <h3 className="text-sm font-semibold text-dark-300">Custom Input (stdin)</h3>
        {value && (
          <button
            onClick={() => onChange('')}
            className="text-xs text-dark-500 hover:text-dark-300 transition-colors flex items-center gap-1"
            title="Clear input"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4 bg-dark-950">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter custom input here (e.g., test data for stdin)&#10;&#10;Example:&#10;5&#10;1 2 3 4 5"
          className="w-full h-full bg-dark-900 border border-dark-800 rounded-lg p-3 text-sm font-mono text-dark-100 placeholder-dark-600 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 resize-none"
        />
      </div>
    </div>
  );
}

InputPanel.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export default InputPanel;
