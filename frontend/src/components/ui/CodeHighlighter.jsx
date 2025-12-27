import { useMemo } from 'react';

// Simple Java syntax highlighter for learning notes
function CodeHighlighter({ code }) {
  const highlightedCode = useMemo(() => {
    if (!code) return null;
    
    // Java keywords
    const keywords = /\b(public|private|protected|class|interface|extends|implements|static|final|void|int|long|double|float|boolean|char|byte|short|String|new|return|if|else|for|while|do|switch|case|break|continue|default|try|catch|finally|throw|throws|null|true|false|this|super|import|package|abstract|synchronized|volatile|transient|native|strictfp|instanceof|enum|assert)\b/g;
    
    // Split code into lines for processing
    const lines = code.split('\n');
    
    return lines.map((line, lineIndex) => {
      // Check if line is a comment
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('//')) {
        return (
          <div key={lineIndex} className="code-line">
            <span className="text-green-400 italic">{line}</span>
          </div>
        );
      }
      
      // Check for multi-line comment parts
      if (trimmedLine.startsWith('*') || trimmedLine.startsWith('/*') || trimmedLine.endsWith('*/')) {
        return (
          <div key={lineIndex} className="code-line">
            <span className="text-green-400 italic">{line}</span>
          </div>
        );
      }
      
      // Process regular code
      let parts = [];
      let lastIndex = 0;
      let partIndex = 0;
      
      // Find strings first
      const stringRegex = /"([^"\\]|\\.)*"/g;
      let stringMatch;
      let protectedRanges = [];
      
      while ((stringMatch = stringRegex.exec(line)) !== null) {
        protectedRanges.push({
          start: stringMatch.index,
          end: stringMatch.index + stringMatch[0].length,
          content: stringMatch[0],
          type: 'string'
        });
      }
      
      // Find numbers
      const numberRegex = /\b(\d+\.?\d*[fFdDlL]?)\b/g;
      let numberMatch;
      while ((numberMatch = numberRegex.exec(line)) !== null) {
        const isInString = protectedRanges.some(r => 
          numberMatch.index >= r.start && numberMatch.index < r.end
        );
        if (!isInString) {
          protectedRanges.push({
            start: numberMatch.index,
            end: numberMatch.index + numberMatch[0].length,
            content: numberMatch[0],
            type: 'number'
          });
        }
      }
      
      // Sort protected ranges
      protectedRanges.sort((a, b) => a.start - b.start);
      
      // Build the line with highlighting
      let currentIndex = 0;
      
      for (const range of protectedRanges) {
        // Add text before this range
        if (range.start > currentIndex) {
          const textBefore = line.slice(currentIndex, range.start);
          parts.push(...highlightKeywords(textBefore, partIndex));
          partIndex += 10;
        }
        
        // Add the protected range with its styling
        if (range.type === 'string') {
          parts.push(
            <span key={`s-${partIndex++}`} className="text-amber-300">{range.content}</span>
          );
        } else if (range.type === 'number') {
          parts.push(
            <span key={`n-${partIndex++}`} className="text-purple-400">{range.content}</span>
          );
        }
        
        currentIndex = range.end;
      }
      
      // Add remaining text
      if (currentIndex < line.length) {
        parts.push(...highlightKeywords(line.slice(currentIndex), partIndex));
      }
      
      return (
        <div key={lineIndex} className="code-line">
          {parts.length > 0 ? parts : <span>&nbsp;</span>}
        </div>
      );
    });
    
    function highlightKeywords(text, startIndex) {
      const result = [];
      let lastIdx = 0;
      let match;
      let idx = startIndex;
      
      const keywordRegex = /\b(public|private|protected|class|interface|extends|implements|static|final|void|int|long|double|float|boolean|char|byte|short|String|new|return|if|else|for|while|do|switch|case|break|continue|default|try|catch|finally|throw|throws|null|true|false|this|super|import|package|abstract|synchronized|volatile|transient|native|strictfp|instanceof|enum|assert)\b/g;
      
      while ((match = keywordRegex.exec(text)) !== null) {
        // Add text before keyword
        if (match.index > lastIdx) {
          result.push(
            <span key={`t-${idx++}`} className="text-dark-200">{text.slice(lastIdx, match.index)}</span>
          );
        }
        
        // Add keyword with color
        const keyword = match[0];
        let colorClass = 'text-pink-400'; // Default for keywords
        
        if (['int', 'long', 'double', 'float', 'boolean', 'char', 'byte', 'short', 'String', 'void'].includes(keyword)) {
          colorClass = 'text-cyan-400'; // Types
        } else if (['true', 'false', 'null'].includes(keyword)) {
          colorClass = 'text-purple-400'; // Literals
        } else if (['return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'default'].includes(keyword)) {
          colorClass = 'text-pink-400'; // Control flow
        } else if (['new', 'this', 'super', 'instanceof'].includes(keyword)) {
          colorClass = 'text-yellow-400'; // Special
        }
        
        result.push(
          <span key={`k-${idx++}`} className={`${colorClass} font-medium`}>{keyword}</span>
        );
        
        lastIdx = match.index + keyword.length;
      }
      
      // Add remaining text
      if (lastIdx < text.length) {
        // Check for method calls (word followed by parenthesis)
        const remainingText = text.slice(lastIdx);
        const methodRegex = /(\w+)(\s*\()/g;
        let methodMatch;
        let methodLastIdx = 0;
        
        while ((methodMatch = methodRegex.exec(remainingText)) !== null) {
          if (methodMatch.index > methodLastIdx) {
            result.push(
              <span key={`r-${idx++}`} className="text-dark-200">{remainingText.slice(methodLastIdx, methodMatch.index)}</span>
            );
          }
          result.push(
            <span key={`m-${idx++}`} className="text-blue-400">{methodMatch[1]}</span>
          );
          result.push(
            <span key={`p-${idx++}`} className="text-dark-200">{methodMatch[2]}</span>
          );
          methodLastIdx = methodMatch.index + methodMatch[0].length;
        }
        
        if (methodLastIdx < remainingText.length) {
          result.push(
            <span key={`e-${idx++}`} className="text-dark-200">{remainingText.slice(methodLastIdx)}</span>
          );
        }
      }
      
      return result;
    }
  }, [code]);

  return (
    <pre className="bg-dark-950 border border-dark-700 rounded-lg p-4 text-sm overflow-x-auto font-mono leading-relaxed">
      {highlightedCode}
    </pre>
  );
}

export default CodeHighlighter;
