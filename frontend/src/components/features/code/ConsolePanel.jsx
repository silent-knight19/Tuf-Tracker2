import PropTypes from 'prop-types';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

function ConsolePanel({ output, error, timedOut, isLoading, testCases }) {
  const hasOutput = output || error || timedOut;

  // Parse test results from output
  const parseTestResults = () => {
    if (!output || !testCases || testCases.length === 0) return null;

    const lines = output.trim().split('\n');
    const results = [];

    lines.forEach(line => {
      // Match patterns like "Test 1: value" or "Test 1: [1, 2]"
      const match = line.match(/^Test\s+(\d+):\s*(.+)$/i);
      if (match) {
        const testIndex = parseInt(match[1]) - 1;
        const actualOutput = match[2].trim();
        
        if (testIndex >= 0 && testIndex < testCases.length) {
          const testCase = testCases[testIndex];
          const expectedOutput = formatExpectedOutput(testCase.expectedOutput);
          const passed = compareOutputs(actualOutput, expectedOutput);
          
          results.push({
            testNumber: testIndex + 1,
            input: testCase.input,
            expected: expectedOutput,
            actual: actualOutput,
            passed
          });
        }
      }
    });

    return results.length > 0 ? results : null;
  };

  // Format expected output for comparison
  const formatExpectedOutput = (expected) => {
    if (expected === null || expected === undefined) return 'null';
    if (typeof expected === 'object') {
      return JSON.stringify(expected);
    }
    return String(expected);
  };

  // Compare actual and expected outputs (handles different formats)
  const compareOutputs = (actual, expected) => {
    // Normalize both strings for comparison
    const normalizeOutput = (str) => {
      return str
        .replace(/\s+/g, '') // Remove whitespace
        .replace(/'/g, '"')  // Normalize quotes
        .toLowerCase();
    };

    const normalizedActual = normalizeOutput(actual);
    const normalizedExpected = normalizeOutput(expected);

    // Direct comparison
    if (normalizedActual === normalizedExpected) return true;

    // Try parsing both as JSON and compare
    try {
      const parsedActual = JSON.parse(actual.replace(/'/g, '"'));
      const parsedExpected = typeof expected === 'string' 
        ? JSON.parse(expected.replace(/'/g, '"'))
        : expected;
      return JSON.stringify(parsedActual) === JSON.stringify(parsedExpected);
    } catch (e) {
      // If JSON parsing fails, do string comparison
      return normalizedActual === normalizedExpected;
    }
  };

  const testResults = parseTestResults();
  const passedCount = testResults?.filter(r => r.passed).length || 0;
  const totalCount = testResults?.length || 0;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-dark-800 bg-dark-900">
        <h3 className="text-sm font-semibold text-dark-300">Console</h3>
        <div className="flex items-center gap-2">
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-dark-400">
              <div className="w-3 h-3 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin"></div>
              Running...
            </div>
          )}
          {testResults && !isLoading && (
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold ${
              passedCount === totalCount
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : passedCount === 0
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
            }`}>
              {passedCount === totalCount ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <XCircle className="w-3 h-3" />
              )}
              {passedCount}/{totalCount} Passed
            </div>
          )}
        </div>
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
            <div className="text-red-400 font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Error
            </div>
            <pre className="whitespace-pre-wrap text-red-300 text-xs leading-relaxed bg-red-500/5 p-3 rounded border border-red-500/20">
              {error}
            </pre>
          </div>
        )}

        {/* Structured Test Results */}
        {testResults && testResults.length > 0 ? (
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.passed
                    ? 'bg-green-500/5 border-green-500/20'
                    : 'bg-red-500/5 border-red-500/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {result.passed ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`font-bold text-sm ${
                      result.passed ? 'text-green-400' : 'text-red-400'
                    }`}>
                      Test {result.testNumber}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    result.passed
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {result.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {result.input && (
                    <div className="flex">
                      <span className="text-dark-500 w-20 shrink-0">Input:</span>
                      <span className="text-dark-300">{typeof result.input === 'object' ? JSON.stringify(result.input) : result.input}</span>
                    </div>
                  )}
                  <div className="flex">
                    <span className="text-dark-500 w-20 shrink-0">Expected:</span>
                    <span className="text-dark-300">{result.expected}</span>
                  </div>
                  <div className="flex">
                    <span className="text-dark-500 w-20 shrink-0">Output:</span>
                    <span className={result.passed ? 'text-green-400' : 'text-red-400'}>
                      {result.actual}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : output ? (
          // Fallback to raw output if no structured test results
          <div>
            <div className="text-green-400 font-semibold mb-2">Output:</div>
            <pre className="whitespace-pre-wrap text-dark-100 leading-relaxed">
              {output}
            </pre>
          </div>
        ) : null}
      </div>
    </div>
  );
}

ConsolePanel.propTypes = {
  output: PropTypes.string,
  error: PropTypes.string,
  timedOut: PropTypes.bool,
  isLoading: PropTypes.bool,
  testCases: PropTypes.arrayOf(PropTypes.shape({
    input: PropTypes.any,
    expectedOutput: PropTypes.any
  }))
};

export default ConsolePanel;
