import PropTypes from 'prop-types';
import { Copy, Lightbulb } from 'lucide-react';

function EdgeCasesPanel({ edgeCases, onCopyInput, isLoading }) {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-dark-950 p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dark-400 text-sm">Generating edge cases...</p>
        </div>
      </div>
    );
  }

  if (!edgeCases || edgeCases.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-dark-950 p-8">
        <div className="text-center text-dark-500">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No edge cases generated yet</p>
          <p className="text-xs mt-1">Click "Generate Edge Cases" to get AI suggestions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 border-b border-dark-800 bg-dark-900">
        <h3 className="text-sm font-semibold text-dark-300">AI-Generated Edge Cases</h3>
        <p className="text-xs text-dark-500 mt-0.5">{edgeCases.length} test cases</p>
      </div>

      <div className="flex-1 overflow-auto p-4 bg-dark-950 space-y-3">
        {edgeCases.map((edgeCase, index) => (
          <div
            key={index}
            className="bg-dark-900 border border-dark-800 rounded-lg p-4 hover:border-dark-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-white text-sm">{edgeCase.name}</h4>
              <button
                onClick={() => onCopyInput(edgeCase.input)}
                className="px-2 py-1 text-xs bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-white rounded flex items-center gap-1.5 transition-colors"
                title="Copy input to stdin"
              >
                <Copy className="w-3 h-3" />
                Copy Input
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-dark-500 font-medium text-xs uppercase tracking-wider">Input:</span>
                <pre className="mt-1 p-2 bg-dark-950 rounded text-dark-100 font-mono text-xs overflow-x-auto">
                  {edgeCase.input}
                </pre>
              </div>

              <div>
                <span className="text-dark-500 font-medium text-xs uppercase tracking-wider">Expected Output:</span>
                <pre className="mt-1 p-2 bg-dark-950 rounded text-green-400 font-mono text-xs overflow-x-auto">
                  {edgeCase.expectedOutput}
                </pre>
              </div>

              {edgeCase.explanation && (
                <div>
                  <span className="text-dark-500 font-medium text-xs uppercase tracking-wider">Why this matters:</span>
                  <p className="mt-1 text-dark-300 text-xs leading-relaxed">
                    {edgeCase.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

EdgeCasesPanel.propTypes = {
  edgeCases: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      input: PropTypes.string.isRequired,
      expectedOutput: PropTypes.string.isRequired,
      explanation: PropTypes.string
    })
  ),
  onCopyInput: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

export default EdgeCasesPanel;
