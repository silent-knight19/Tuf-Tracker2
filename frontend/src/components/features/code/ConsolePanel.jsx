import PropTypes from 'prop-types';

function ConsolePanel({ output, error, timedOut, isLoading }) {
  const hasOutput = output || error || timedOut;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-dark-800 bg-dark-900">
        <h3 className="text-sm font-semibold text-dark-300">Console</h3>
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-dark-400">
            <div className="w-3 h-3 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin"></div>
            Running...
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4 bg-dark-950 font-mono text-sm">
        {!hasOutput && !isLoading && (
          <p className="text-dark-500 italic">Run your code to see output here</p>
        )}

        {timedOut && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400">
            <strong>⏱ Execution Timeout</strong>
            <p className="text-xs mt-1">Code execution exceeded the time limit (2-3 seconds)</p>
          </div>
        )}

        {error && (
          <div className="mb-4">
            <div className="text-red-400 font-semibold mb-2">Error:</div>
            <pre className="whitespace-pre-wrap text-red-300 text-xs leading-relaxed">
              {error}
            </pre>
          </div>
        )}

        {output && (
          <div>
            <div className="text-green-400 font-semibold mb-2">Output:</div>
            <pre className="whitespace-pre-wrap text-dark-100 leading-relaxed">
              {output}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

ConsolePanel.propTypes = {
  output: PropTypes.string,
  error: PropTypes.string,
  timedOut: PropTypes.bool,
  isLoading: PropTypes.bool
};

export default ConsolePanel;
