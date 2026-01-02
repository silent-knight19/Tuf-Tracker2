/**
 * AI Service - Optimized for Cerebras / Qwen 3 235B
 * 
 * All methods use Cerebras API exclusively.
 * No Gemini, no unsupported parameters.
 */

const { cerebrasClient, MODEL, generationConfig, rateLimiter } = require('../config/ai.config');

class AIService {

  // ═══════════════════════════════════════════════════════════════
  // CORE: Cerebras API Call
  // ═══════════════════════════════════════════════════════════════
  async callCerebras(prompt, jsonMode = true, retries = 2) {
    try {
      await rateLimiter.wait();
      
      console.log(`🤖 Cerebras: ${prompt.slice(0, 60)}...`);
      
      const options = {
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: generationConfig.temperature,
        top_p: generationConfig.top_p,
        max_tokens: generationConfig.max_tokens,
      };
      
      // Add JSON mode if requested
      if (jsonMode) {
        options.response_format = { type: 'json_object' };
      }
      
      // Timeout wrapper (30s)
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout after 30s')), 30000)
      );
      
      const response = await Promise.race([
        cerebrasClient.chat.completions.create(options),
        timeout
      ]);
      
      console.log('✅ Response received');
      return response.choices[0].message.content;
      
    } catch (error) {
      // Retry on rate limit or timeout
      if (retries > 0 && (error.status === 429 || error.message?.includes('Timeout'))) {
        console.warn(`⚠️ ${error.message}. Retrying...`);
        await new Promise(r => setTimeout(r, 2000));
        return this.callCerebras(prompt, jsonMode, retries - 1);
      }
      
      console.error('❌ Cerebras Error:', error.message);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // JSON Parser
  // ═══════════════════════════════════════════════════════════════
  parseJSON(text) {
    try {
      let clean = text.trim();
      if (clean.startsWith('```')) {
        clean = clean.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      return JSON.parse(clean.trim());
    } catch (e) {
      // Try to extract JSON from text
      const jsonMatch = text.match(/[\[{][\s\S]*[\]}]/);
      if (jsonMatch) {
        try { return JSON.parse(jsonMatch[0]); } catch {}
      }
      console.warn('JSON parse failed:', text.slice(0, 200));
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Generate 20 Test Cases (WITH computed expected values)
  // ═══════════════════════════════════════════════════════════════
  async generateTestCases(title, description, constraints = [], functionSignature = null) {
    const prompt = `Generate 20 test cases with CORRECT expected outputs for: "${title}"

Function Signature: ${functionSignature || 'public int solve(int[] nums)'}
Constraints: ${constraints.join('; ') || 'standard'}

CRITICAL: You MUST compute and provide the CORRECT expected output for each test case. DO NOT use null or placeholder values.

Return JSON:
{
  "testCases": [
    {"name": "Basic sum", "input": {"nums": [1,2,3], "target": 5}, "expected": [1,2], "category": "Basic"},
    {"name": "Empty array", "input": {"nums": [], "target": 0}, "expected": [], "category": "Boundary"}
  ]
}

REQUIREMENTS:
1. Generate EXACTLY 20 test cases
2. Each "expected" value MUST be the CORRECT computed output according to problem rules.
3. *CRITICAL*: If a return value for impossible cases is specified (e.g., return -1), use THAT. DO NOT hallucinate "ERROR" or "Exception" if the problem expects a numeric result like -1.
4. Include: 5 Basic, 5 Boundary (empty/single/min/max/K > length), 5 Edge (duplicates/negatives), 5 Tricky
5. Input parameter names must match the function signature, and expected values must match the return type.`;

    try {
      const text = await this.callCerebras(prompt, true);
      const data = this.parseJSON(text);
      const testCases = data?.testCases || data || [];
      
      // Filter out any with null expected values
      return testCases.filter(tc => tc.expected !== null && tc.expected !== undefined);
    } catch (e) {
      console.error('Test case generation failed:', e.message);
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Generate Solution & Hints (with detailed explanations)
  // ═══════════════════════════════════════════════════════════════
  async generateSolutionOnly(title, description, difficulty = 'Medium', functionSignature = null, examples = []) {
    const examplesContext = examples && examples.length > 0 
      ? `\n\nYou MUST verify your solution correctly solves these examples:\n${examples.slice(0, 3).map(tc => `Input: ${tc.input} → Expected: ${tc.output}`).join('\n')}`
      : '';
    
    const prompt = `Generate a CORRECT and ROBUST solution for: "${title}" (${difficulty})

Problem Description: ${description}

REQUIRED Function Signature: ${functionSignature || 'public int solve(int[] nums)'}${examplesContext}

Return JSON:
{
  "hints": [
    "Hint 1: Think about what data structure would help...",
    "Hint 2: Consider the time complexity trade-offs...",
    "Hint 3: What about edge cases like...",
    "Hint 4: How can you optimize...",
    "Hint 5: Don't forget to handle..."
  ],
  "solution": {
    "intuition": "DETAILED 2-3 sentence explanation of WHY this algorithmic pattern/approach was chosen for this specific problem and how it addresses the core constraints.",
    "approachSteps": [
      "Step 1: Focus on ...",
      "Step 2: Initialize ...",
      "Step 3: ...",
      "Step 4: ...",
      "Step 5: ...",
      "Step 6: ...",
      "Step 7: ...",
      "Step 8: ...",
      "Step 9: ...",
      "Step 10: Final return and ..."
    ],
    "timeComplexity": "O(n) - explain why",
    "spaceComplexity": "O(1) - explain why",
    "code": "// HEAVILY COMMENTED Java code\\n// Each section should have comments explaining what it does and WHY\\npublic ReturnType methodName(params) {\\n    // ... implementation ...\\n}"
  }
}

CRITICAL REQUIREMENTS FOR THE SOLUTION GUIDE:
1. Provide EXACTLY 8-10 granular, easy-to-follow steps in 'approachSteps'.
2. The 'approachSteps' must cover everything: from initialization to the core algorithm logic and final return.
3. The 'intuition' must justify the choice of data structures and patterns based on the problem's constraints.

CRITICAL REQUIREMENTS FOR CORRECTNESS:
1. The code MUST use EXACTLY this signature: ${functionSignature || 'public int solve(int[] nums)'}
2. The solution MUST correctly handle ALL edge cases: empty arrays, single elements, all same values, min/max values
3. If examples are provided above, your solution MUST produce the exact expected outputs for those inputs
4. MENTALLY TEST your solution on at least 3 different inputs before responding
5. The code must be complete, compilable Java with NO bugs
6. Include detailed comments explaining each step and WHY it works
7. The approach explanation must be DETAILED (not just 1 sentence)

COMMON MISTAKES TO AVOID:
- Off-by-one errors in loops
- Not handling empty or single-element inputs
- Integer overflow for large inputs
- Incorrect boundary conditions
- Not returning the correct type
- *CRITICAL*: FOR IMPOSSIBLE CASES (e.g., Target not found, K distinct IDs not possible), return EXACTLY what the problem description specifies (usually -1). DO NOT return 0 or throw an exception unless explicitly asked.
- *CRITICAL*: For string problems, DO NOT assume only lowercase 'a'-'z'. Use a Map or int[128]/int[256] array to handle ALL ASCII characters (spaces, uppercase, symbols). Avoid 's.charAt(i) - \\'a\\''.
- *CRITICAL AMBIGUITY*: If the problem involves 'cost' and 'K' (or similar limit), determines if K is a COUNT (number of items) or a BUDGET (sum of costs).
  - If tests/examples imply K is small but costs are large, K is likely COUNT.
  - If tests show K >= sum of costs, K is BUDGET.
  - *DEFAULT*: If ambiguous and costs are provided, assume K is BUDGET for 'upgrade' or 'purchase' problems.
- *CRITICAL*: For Probability problems, if input allows 0.0, HANDLE IT (Math.log(0) is Infinity). Throw 'IllegalArgumentException' if constraints are violated (e.g. prob <= 0 but constraint says > 0).
- *CRITICAL*: For Floating Point outputs, ROUND results to 5 decimal places (Math.round(val * 1e5) / 1e5.0) to match test expectations.`;

    try {
      // PROD: Use 3 candidates for Majority Voting (Optimal Balance of Cost vs Accuracy)
      const NUM_CANDIDATES = 3;
      
      console.log(`\n🔄 Generating ${NUM_CANDIDATES} solution candidates (PARALLEL) for verification...`);
      
      // 1. Launch all requests in parallel for speed
      const promises = Array(NUM_CANDIDATES).fill(null).map(async (_, idx) => {
        try {
          const text = await this.callCerebras(prompt, true);
          const candidate = this.parseJSON(text);
          if (candidate?.solution?.code) {
            return {
              ...candidate,
              candidateId: idx + 1
            };
          }
        } catch (e) {
          console.warn(`Candidate ${idx + 1} generation failed:`, e.message);
        }
        return null; // Failed
      });

      // 2. Wait for all
      const results = await Promise.all(promises);
      const candidates = results.filter(c => c !== null);
      
      if (candidates.length === 0) {
        throw new Error('All candidates failed to generate');
      }
      
      // If no examples, we can't score them, but we still return them for voting
      if (!examples || examples.length === 0) {
        console.log('ℹ️  No examples provided, returning candidates based on generation order');
        return {
          bestCandidate: candidates[0],
          allCandidates: candidates
        };
      }
      
      // 3. Validate each candidate
      console.log(`\n✅ Validating ${candidates.length} candidates against ${examples.length} examples...`);
      const validatedCandidates = [];
      
      for (const candidate of candidates) {
        const validation = await this.validateSolutionAgainstExamples(
          candidate.solution.code,
          examples,
          functionSignature
        );
        
        validatedCandidates.push({
          ...candidate,
          validationScore: validation.score,
          validationTotal: validation.total
        });
        
        console.log(`   Candidate ${candidate.candidateId}: ${validation.score}/${validation.total} examples passed`);
      }
      
      // Sort by score (descending)
      validatedCandidates.sort((a, b) => b.validationScore - a.validationScore);
      const bestCandidate = validatedCandidates[0];
      
      console.log(`\n🏆 Best Candidate: #${bestCandidate.candidateId} (Score: ${bestCandidate.validationScore}/${bestCandidate.validationTotal})`);
      
      // Return BOTH the best one and the full list for voting
      return {
        bestCandidate,
        allCandidates: validatedCandidates
      };
      
    } catch (e) {
      console.error('Solution generation failed:', e.message);
      throw e;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Generate Problem From Criteria
  // ═══════════════════════════════════════════════════════════════
  async generateProblemFromCriteria(pattern, topic, difficulty) {
    const prompt = `Create a UNIQUE and CHALLENGING coding interview problem.
    
Pattern: ${pattern || 'Any'}
Topic: ${topic || 'Any'}
Difficulty: ${difficulty}

STYLE & STRUCTURE REQUIREMENTS:
1. **INTERVIEW TONE**: Write in a professional, technical, and concise tone similar to LeetCode or a FAANG interview.
2. **STRUCTURED DESCRIPTION**:
   - **Scenario**: A brief 2-3 sentence technical context (e.g., "You are building a real-time data aggregator...").
   - **Task**: Explicitly state what the user needs to implement (e.g., "Implement a function that find the...").
   - **Format**: Use clear paragraphs and bullet points for readability.
3. **NO CLONES & NO REPETITION**: Strictly forbidden from generating standard problems (Two Sum, etc.). Invent a fresh logic using the ${pattern || 'Any'} pattern.
4. **DOMAIN**: Mix in niche industries (Logistics, Game Dev, Fintech, Space-Tech) to ensure variety.

Return JSON:
{
  "title": "Professional & Unique Title",
  "difficulty": "${difficulty}",
  "description": "Professional interview-style description with clear sections. Specify return values for edge/impossible cases.",
  "functionSignature": "public ReturnType methodName(Type param)",
  "examples": [{"input": "...", "output": "...", "explanation": "..."}],
  "constraints": ["1 <= n <= 10^5"]
}`;

    try {
      console.log('Generating problem from criteria...');
      const text = await this.callCerebras(prompt, true);
      const problem = this.parseJSON(text);
      
      if (!problem) throw new Error('Failed to parse problem');
      
      problem.pattern = pattern;
      problem.topic = topic;
      problem.hints = [];
      problem.solutions = { optimal: null };
      problem.edgeCases = [];
      
      return problem;
    } catch (e) {
      console.error('Problem generation failed:', e.message);
      throw new Error('Failed to generate problem: ' + e.message);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Generate Company Problem
  // ═══════════════════════════════════════════════════════════════
  async generateCompanyProblem(company, topic, pattern, difficulty) {
    const prompt = `Create a UNIQUE ${company}-style coding interview problem.
    
Company: ${company}
Topic: ${topic || 'Any'}
Pattern: ${pattern || 'Any'}
Difficulty: ${difficulty}

STYLE & STRUCTURE REQUIREMENTS:
1. **${company} VIBE**: Use the technical tone and keywords typical of ${company} (e.g., Amazon focuses on "Scalability" and "Customer Obsession", Google on "Algorithm Efficiency" and "Large Scale Systems").
2. **STRUCTURED DESCRIPTION**:
   - **Background**: 1 paragraph about a technical challenge at ${company}.
   - **Problem**: Clear implementation requirements.
   - **Edge Cases**: Hint at or explicitly mention specific performance or input constraints.
3. **NO REPETITION**: Create a brand NEW scenario that hasn't been seen in common ${company} prep lists.
4. **INDUSTRY**: Use realistic departments like "${company} Logistics", "${company} Cloud Data", etc.

Return JSON:
{
  "title": "Professional ${company}-style Title",
  "difficulty": "${difficulty}",
  "description": "Professional ${company} interview problem with clear technical requirements. Define return values for impossible cases.",
  "functionSignature": "public ReturnType methodName(Type param)",
  "examples": [{"input": "...", "output": "...", "explanation": "..."}],
  "constraints": ["1 <= n <= 10^5"]
}`;

    try {
      console.log(`Generating ${company} problem...`);
      const text = await this.callCerebras(prompt, true);
      const problem = this.parseJSON(text);
      
      if (!problem) throw new Error('Failed to parse problem');
      
      problem.company = company;
      problem.pattern = pattern;
      problem.topic = topic;
      problem.hints = [];
      problem.solutions = { optimal: null };
      problem.edgeCases = [];
      
      return problem;
    } catch (e) {
      console.error('Company problem generation failed:', e.message);
      throw new Error('Failed to generate company problem: ' + e.message);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Generate Problem Description
  // ═══════════════════════════════════════════════════════════════
  async generateProblemDescription(title, platform = 'LeetCode', difficulty = 'Medium', topics = [], patterns = []) {
    const prompt = `Generate a highly accurate problem description for: "${title}"
    
SEARCH REQUIREMENT:
1. Search your knowledge base for this problem on LeetCode, GeeksforGeeks (GfG), and other trusted platforms.
2. Ensure the "description" and "constraints" are EXACTLY as they appear on these platforms.
3. If this is a known problem, use the formal problem name and standard constraints.

Return JSON:
{
  "description": "Professional interview-style description (Scenario -> Task -> Clarity). Explicitly state return values for edge/impossible cases.",
  "functionSignature": "public ReturnType methodName(Type param)",
  "examples": [{"input": "...", "output": "...", "explanation": "..."}],
  "constraints": ["1 <= nums.length <= 10^5"]
}`;

    try {
      const text = await this.callCerebras(prompt, true);
      return this.parseJSON(text);
    } catch (e) {
      console.error('Description generation failed:', e.message);
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Generate Edge Case Inputs (for computeEdgeCaseOutputs)
  // ═══════════════════════════════════════════════════════════════
  async generateEdgeCaseInputs(title, description, examples = [], constraints = [], functionSignature = null) {
    const prompt = `Generate 15 test cases with CORRECT expected outputs for: "${title}"

Function Signature: ${functionSignature || 'public int solve(int[] nums)'}
Constraints: ${constraints.join('; ') || 'standard'}

CRITICAL: You MUST compute and provide the CORRECT expected output for each test case. DO NOT use null or placeholder values.

Return JSON:
{
  "inputs": [
    {"name": "Basic test", "input": {"nums": [1,2,3]}, "expected": 6, "category": "Basic"},
    {"name": "Empty array", "input": {"nums": []}, "expected": 0, "category": "Boundary"}
  ]
}

REQUIREMENTS:
1. Each "expected" value MUST be the CORRECT computed output
2. Include: Basic, Boundary (empty/single/min/max), Edge (duplicates/negatives), Tricky cases
3. Input parameter names must match the function signature`;

    try {
      const text = await this.callCerebras(prompt, true);
      const data = this.parseJSON(text);
      const inputs = data?.inputs || data || [];
      
      // Filter out any with null expected values
      return inputs.filter(tc => tc.expected !== null && tc.expected !== undefined);
    } catch (e) {
      console.error('Edge case input generation failed:', e.message);
      return [{ name: "Fallback", input: examples[0]?.input || {}, expected: null, category: "Fallback" }];
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Validate Solution Against Examples
  // ═══════════════════════════════════════════════════════════════
  async validateSolutionAgainstExamples(solutionCode, examples, functionSignature) {
    if (!examples || examples.length === 0) return { score: 0, total: 0 };
    
    const codeRunner = require('./codeRunner.service');
    
    // Extract method name
    let methodName = 'solve';
    if (functionSignature) {
      const match = functionSignature.match(/\s+(\w+)\s*\(/);
      if (match) methodName = match[1];
    }
    
    try {
      // Prepare test cases from examples
      const tests = examples.map(ex => {
        // Parse input string to args (e.g., "height = [1,8,6,2,5,4,8,3,7]" -> [[1,8,6,2,5,4,8,3,7]])
        let args = [];
        if (ex.input) {
          if (typeof ex.input === 'string') {
            // Extract array from string like "height = [1,2,3]"
            const match = ex.input.match(/\[(.*?)\]/);
            if (match) {
              const nums = match[1].split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
              args = [nums];
            }
          } else if (Array.isArray(ex.input)) {
            args = ex.input;
          } else {
            args = Object.values(ex.input);
          }
        }
        return { args, expected: ex.output };
      });
      
      const argsJson = JSON.stringify({ method: methodName, tests });
      const result = await codeRunner.runJava(solutionCode, argsJson);
      const stdout = result.stdout?.trim() || '';
      
      // Parse results and count matches
      const lines = stdout.split('\n');
      let passedCount = 0;
      
      tests.forEach((test, index) => {
        const testLabel = `Test ${index + 1}:`;
        const matchLine = lines.find(l => l.includes(testLabel));
        
        if (matchLine) {
          const parts = matchLine.split(testLabel);
          if (parts.length > 1) {
            const output = parts[1].trim();
            const expected = String(test.expected).trim();
            
            // Loose matching for errors
            const isOutputError = output.includes('ERROR') || output.includes('Exception');
            const isExpectedError = expected.includes('ERROR') || expected.includes('Exception');

            if (output === expected || (isOutputError && isExpectedError)) {
              passedCount++;
            }
          }
        }
      });
      
      return { score: passedCount, total: tests.length };
    } catch (e) {
      console.warn('Validation failed:', e.message);
      return { score: 0, total: examples.length };
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Generate Edge Cases (Legacy wrapper)
  // ═══════════════════════════════════════════════════════════════
  async generateEdgeCases(title, description, examples = [], constraints = [], functionSignature = null) {
    return this.generateEdgeCaseInputs(title, description, examples, constraints, functionSignature);
  }

  // ═══════════════════════════════════════════════════════════════
  // Compute Edge Case Outputs with MAJORITY VOTING
  // ═══════════════════════════════════════════════════════════════
  async computeEdgeCaseOutputsWithVoting(candidates, edgeCaseInputs, functionSignature) {
    if (!candidates || candidates.length === 0) return edgeCaseInputs;
    
    // Extract code from candidates
    const codes = candidates.map(c => c.solution.code);
    const codeRunner = require('./codeRunner.service');
    
    // Extract method name
    let methodName = 'solve';
    if (functionSignature) {
      const match = functionSignature.match(/\s+(\w+)\s*\(/);
      if (match) methodName = match[1];
    }
    
    console.log(`🗳️  Computing outputs using Majority Voting (N=${candidates.length}) for method: ${methodName}`);
    
    try {
      // 1. Prepare batch inputs ONCE
      const tests = edgeCaseInputs.map((tc) => ({
        args: tc.args || Object.values(tc.input || {}),
        expected: null
      }));
      const argsJson = JSON.stringify({ method: methodName, tests });
      
      // 2. Run ALL candidates in PARALLEL against the batch
      const runPromises = codes.map(async (code, idx) => {
        try {
          const result = await codeRunner.runJava(code, argsJson);
          return {
            id: idx + 1,
            stdout: result.stdout?.trim() || '',
            stderr: result.stderr?.trim() || ''
          };
        } catch (e) {
          console.warn(`Voting execution failed for Candidate ${idx + 1}:`, e.message);
          return null;
        }
      });
      
      const results = await Promise.all(runPromises);
      const validResults = results.filter(r => r !== null && !r.stderr);
      
      console.log(`   ${validResults.length}/${candidates.length} candidates executed successfully.`);

      if (validResults.length === 0) {
        console.warn('❌ All candidates failed execution. Using fallback values.');
        return edgeCaseInputs.map(tc => ({
          ...tc,
          expected: tc.expected || 'ERROR'
        }));
      }

      // 3. For each test case, collect votes
      // We parse the output of each candidate: "Test 1: Result", "Test 2: Result"
      
      return edgeCaseInputs.map((tc, testIdx) => {
        const testLabel = `Test ${testIdx + 1}:`;
        const votes = {}; // "OutputValue" -> count
        
        validResults.forEach(res => {
          const matchLine = res.stdout.split('\n').find(l => l.includes(testLabel));
          if (matchLine) {
            const parts = matchLine.split(testLabel);
            if (parts.length > 1) {
              const val = parts[1].trim();
              
              // Validate output (ignore Errors for voting unless everyone errors)
              const isValid = (val !== '' && !val.includes('ERROR') && !val.includes('Exception'));
              
              const key = isValid ? val : 'ERROR';
              votes[key] = (votes[key] || 0) + 1;
            }
          }
        });
        
        // 4. Find Winner
        let winner = null;
        let maxVotes = -1;
        
        Object.entries(votes).forEach(([val, count]) => {
          if (count > maxVotes) {
            maxVotes = count;
            winner = val;
          }
        });
        
        // LOGGING for debug
        // console.log(`   Test ${testIdx + 1} Votes:`, votes, '-> Winner:', winner);

        // Fallback if winner is ERROR or null
        const finalExpected = (winner && winner !== 'ERROR') ? winner : (tc.expected || 'ERROR');

        return {
          ...tc,
          expected: finalExpected,
          expectedOutput: finalExpected,
          consensus: maxVotes > 0 ? (maxVotes / validResults.length) : 0 // Confidence score
        };
      });

    } catch (e) {
      console.error('Majority voting failed:', e.message);
      return edgeCaseInputs;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Compute Edge Case Outputs (Run Java code)
  // ═══════════════════════════════════════════════════════════════
  async computeEdgeCaseOutputs(solutionCode, edgeCaseInputs, functionSignature) {
    const codeRunner = require('./codeRunner.service');
    
    // Extract method name
    let methodName = 'solve';
    if (functionSignature) {
      const match = functionSignature.match(/\s+(\w+)\s*\(/);
      if (match) methodName = match[1];
    }
    
    console.log(`Computing outputs for ${edgeCaseInputs.length} inputs in batch using: ${methodName}`);
    
    try {
      // 1. Prepare batched input
      const tests = edgeCaseInputs.map((tc, index) => ({
        args: tc.args || Object.values(tc.input || {}),
        expected: null
      }));
      
      const argsJson = JSON.stringify({ method: methodName, tests });
      
      // 2. Call runJava ONCE for all cases
      const result = await codeRunner.runJava(solutionCode, argsJson);
      const stdout = result.stdout?.trim() || '';
      const stderr = result.stderr?.trim() || '';
      
      if (stderr && !stdout) {
        console.warn(`Java Execution Error (Batch): ${stderr.substring(0, 100)}`);
      }

      // 3. Parse batched results: "Test 1: Result", "Test 2: Result", ...
      const lines = stdout.split('\n');
      return edgeCaseInputs.map((tc, index) => {
        const testLabel = `Test ${index + 1}:`;
        const matchLine = lines.find(l => l.includes(testLabel));
        
        let val = null;
        if (matchLine) {
          const parts = matchLine.split(testLabel);
          if (parts.length > 1) {
            val = parts[1].trim();
          }
        }

        // Use val if it exists and doesn't contain error markers
        // IMPORTANT: "0" is a valid value, so we check for null/undefined explicitly
        const isValid = (val !== null && val !== undefined && val !== '' && 
                        !val.includes('ERROR') && !val.includes('Exception'));
        const finalExpected = isValid ? val : (tc.expected || tc.expectedOutput || 'ERROR');
        
        return {
          ...tc,
          expected: finalExpected,
          expectedOutput: finalExpected
        };
      });
      
    } catch (e) {
      console.error('Batched computation failed:', e.message);
      return edgeCaseInputs.map(tc => ({
        ...tc,
        expected: tc.expected || 'ERROR',
        expectedOutput: tc.expectedOutput || tc.expected || 'ERROR'
      }));
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Generate Problem Help (CORRECT FLOW: Solution → Inputs → Compute)
  // ═══════════════════════════════════════════════════════════════
  async generateProblemHelp(title, description, difficulty, pattern = null, examples = [], constraints = [], functionSignature = null, mode = 'full', providedSolution = null, existingEdgeCases = null) {
    
    // ═══════════════════════════════════════════════════════════════
    // STEP 1: Get/Generate Solution and Hints
    // ═══════════════════════════════════════════════════════════════
    // ═══════════════════════════════════════════════════════════════
    // STEP 1: Get/Generate Solution and Hints
    // ═══════════════════════════════════════════════════════════════
    let hints = [];
    let solution = providedSolution;
    let allCandidates = [];

    if (!solution || !solution.code) {
      console.log('Step 1: Generating solution and hints...');
      const help = await this.generateSolutionOnly(title, description, difficulty, functionSignature, examples);
      
      // Handle new return structure (bestCandidate + allCandidates) or legacy single candidate
      if (help.bestCandidate) {
        hints = help.bestCandidate.hints;
        solution = help.bestCandidate.solution;
        allCandidates = help.allCandidates || [help.bestCandidate];
      } else {
        // Fallback for legacy behavior or failure
        hints = help.hints;
        solution = help.solution;
        allCandidates = [help]; 
      }
    } else {
      console.log('Using provided solution code.');
      // Still generate hints if not provided - this path typically doesn't trigger edge case generation
      // but if it does, we won't have multiple candidates unless we generate them.
      // For now, if solution is provided, voting is disabled (N=1).
      const help = await this.generateSolutionOnly(title, description, difficulty, functionSignature, examples);
      hints = help.hints || help.bestCandidate?.hints || [];
    }
    
    if (!solution?.code) {
      console.error('Failed to obtain solution code');
      return {
        hints: hints || [],
        solutions: { optimal: solution },
        edgeCases: existingEdgeCases || [],
      };
    }
    
    // ═══════════════════════════════════════════════════════════════
    // STEP 2: Generate Test INPUTS only (no expected values)
    // ═══════════════════════════════════════════════════════════════
    let testInputs = existingEdgeCases || [];
    if (testInputs.length === 0) {
      console.log('Step 2: Generating test inputs...');
      testInputs = await this.generateTestInputsOnly(title, functionSignature, constraints);
    }
    
    // ═══════════════════════════════════════════════════════════════
    // STEP 3: Compute expected values using MAJORITY VOTING
    // ═══════════════════════════════════════════════════════════════
    let edgeCases = testInputs;
    
    if (testInputs.length > 0) {
      console.log('Step 3: Computing expected values with Majority Voting...');
      try {
        // Use Voting if we have multiple candidates, otherwise falls back to single
        if (allCandidates.length > 1) {
           edgeCases = await this.computeEdgeCaseOutputsWithVoting(allCandidates, testInputs, functionSignature);
        } else {
           // Fallback to legacy single-execution if only 1 candidate available (e.g. providedSolution)
           edgeCases = await this.computeEdgeCaseOutputs(solution.code, testInputs, functionSignature);
        }
        
        console.log(`✅ Computed expected values for ${edgeCases.filter(e => e.expected && e.expected !== 'ERROR').length}/${edgeCases.length} test cases`);
      } catch (e) {
        console.warn('⚠️ Computing expected values failed:', e.message);
        edgeCases = testInputs;
      }
    }
    
    return {
      hints: hints || [],
      solutions: { optimal: solution },
      edgeCases: edgeCases || [],
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // Generate Test INPUTS only (no expected values - those come from running code)
  // ═══════════════════════════════════════════════════════════════
  async generateTestInputsOnly(title, functionSignature, constraints = []) {
    const prompt = `Generate 15 diverse test cases for: "${title}"

Function Signature: ${functionSignature || 'public int solve(int[] nums)'}

Return JSON with this structure:
{
  "inputs": [
    {
      "name": "Basic case", 
      "args": [ [1,2,3,4,5] ], 
      "expected": 15,
      "category": "Basic"
    }
  ]
}

CRITICAL RULES FOR "args":
1. The "args" array MUST contain the arguments in the EXACT ORDER of the function signature.
2. DO NOT add extra parameters that are not in the signature. 
   - Example: if signature is solve(int[] nums), DO NOT add a "length" argument. args should be [[1,2,3]].
3. DO NOT over-nest. 
   - solve(int[] nums) -> args: [[1,2,3]]
   - solve(int a, int b) -> args: [10, 20]
4. Include: 3 Basic, 4 Boundary, 4 Edge, 4 Tricky cases.
   - *CRITICAL PERFORMANCE RULE*: For numeric arguments that might dictate complexity (e.g., maxTime, K, target, capacity), KEEP VALUES REASONABLE (e.g., <= 10^5) unless the problem is purely mathematical.
   - Do NOT generate input values > 10^9 (avoids scalar types overflow).
   - **CONSTRAINT ADHERENCE**: 
       - If constraints say 1 <= x, NEVER generate x=0.
       - If constraints say 0 < x (strictly positive), NEVER generate x=0. This is common for probabilities, divisors, or dimensions.
       - If prob is a multiplier, 0 might cause -Infinity in log-space algorithms. AVOID IT unless explicitly tested as a valid edge case.
5. Provide a highly accurate "expected" value according to problem rules. 
   - *CRITICAL*: If the task is impossible (e.g. K > unique elements), return EXACTLY what the problem specifies (usually -1). DO NOT use string "ERROR" if the return type is int.
   - This WILL BE USED if the backend code fails to execute. DO NOT leave it null.
6. **STRICT DATA STRUCTURE RULES**:
   - **CRITICAL**: Check the Problem Description for exact tuple definitions (e.g., "edges are [u, v, w, t]").
   - If the input is a 2D array (e.g., int[][] edges, int[][] planes), the INNER array length must match the problem statement EXACTLY.
   - **Generic Weighted Graph**: [[u, v, w]] (length 3) - ONLY if no other data is specified.
     - **Custom Tuples**: If problem says edges are [u, v, time, energy], YOU MUST GENERATE 4 integers.
       - *CRITICAL*: Generating [u, v, w] (length 3) for a 4-value edge problem causes ArrayIndexOutOfBoundsException.
       - ALWAYS check constraints for \`edges[i].length\`.
     - **Coordinates**: [[r, c], [r, c]] (length 2)
     - **Time/Window definitions**: If problem says [u, v, cost, time], YOU MUST GENERATE 4 integers.
     - **Coordinates**: [[r, c], [r, c]] (length 2)
   - CHECK THE FUNCTION SIGNATURE AND EXAMPLES. Do not guess dimensions. If constraints say portals[i].length == 4, generate 4 values.
7. **GRAPH/TREE INDEXING**:
   - Unless explicitly stated otherwise, assume **0-BASED INDEXING** (nodes 0 to n-1).
   - *CRITICAL*: For input n=3, edges MUST use nodes {0, 1, 2}. Usage of node 3 is an ERROR (IndexOutOfBounds).
   - If the example uses 1-based indexing, ONLY THEN use 1-based. Otherwise default to 0-based.`;

    try {
      const text = await this.callCerebras(prompt, true);
      const data = this.parseJSON(text);
      let inputs = data?.inputs || data || [];
      
      return inputs.map(tc => ({
        ...tc,
        input: tc.input || (tc.args ? { args: tc.args } : {})
      }));
    } catch (e) {
      console.error('Test input generation failed:', e.message);
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Analyze Problem
  // ═══════════════════════════════════════════════════════════════
  async analyzeProblem(title, platform = 'LeetCode', url = '') {
    const prompt = `Analyze the coding problem: "${title}"

DATA SOURCE PRIORITY:
1. Reference LeetCode and GeeksforGeeks (GfG) for defining difficulty, topics, and algorithmic patterns.
2. For "companies", PRIORITIZE GeeksforGeeks (GfG) data. If GfG doesn't list companies, search other prominent free interview preparation websites.
3. Ensure the metadata is based on the most common versions of this problem.

Return JSON:
{
  "difficulty": "Easy|Medium|Hard",
  "topics": ["Array", "Hash Table"],
  "patterns": ["Two Pointers", "Sliding Window"],
  "companies": ["Google", "Amazon", "Microsoft"],
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(1)"
}`;

    try {
      const text = await this.callCerebras(prompt, true);
      return this.parseJSON(text);
    } catch (e) {
      console.error('Analysis failed:', e.message);
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Summarize Notes
  // ═══════════════════════════════════════════════════════════════
  async summarizeNotes(notes) {
    const prompt = `Summarize these coding notes concisely:

${notes}

Return JSON: {"summary": "Brief summary", "keyPoints": ["Point 1", "Point 2"]}`;

    try {
      const text = await this.callCerebras(prompt, true);
      return this.parseJSON(text);
    } catch (e) {
      return { summary: notes.slice(0, 200), keyPoints: [] };
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Detect Weaknesses
  // ═══════════════════════════════════════════════════════════════
  async detectWeaknesses(problemHistory) {
    if (!problemHistory?.length) return { weakTopics: [], weakPatterns: [], recommendations: [] };
    
    const prompt = `Analyze this problem history and identify weaknesses:

${JSON.stringify(problemHistory.slice(0, 20))}

Return JSON:
{
  "weakTopics": ["Topic1", "Topic2"],
  "weakPatterns": ["Pattern1"],
  "recommendations": ["Practice more X", "Review Y"]
}`;

    try {
      const text = await this.callCerebras(prompt, true);
      return this.parseJSON(text) || { weakTopics: [], weakPatterns: [], recommendations: [] };
    } catch (e) {
      return { weakTopics: [], weakPatterns: [], recommendations: [] };
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Suggest Related Problems
  // ═══════════════════════════════════════════════════════════════
  async suggestRelatedProblems(problemTitle, topics, patterns) {
    const prompt = `Suggest 5 similar LeetCode problems to: "${problemTitle}"
Topics: ${topics?.join(', ') || 'General'}
Patterns: ${patterns?.join(', ') || 'General'}

Return JSON: {"suggestions": [{"title": "Problem Name", "reason": "Why similar"}]}`;

    try {
      const text = await this.callCerebras(prompt, true);
      const data = this.parseJSON(text);
      return data?.suggestions || [];
    } catch (e) {
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Generate Study Notes
  // ═══════════════════════════════════════════════════════════════
  async generateStudyNotes(title, platform = 'LeetCode', url = '', difficulty = 'Medium', topics = [], patterns = []) {
    const prompt = `Generate comprehensive study notes for: "${title}" (${difficulty})

Topics: ${topics?.join(', ') || 'General'}
Patterns: ${patterns?.join(', ') || 'General'}

Return JSON exactly in this format:
{
  "keyInsights": ["Point-wise insight 1", "Point-wise insight 2"],
  "approach": ["Step 1 of high-level logic", "Step 2 of high-level logic"],
  "solutions": {
    "brute": {
      "explanation": ["Step 1...", "Step 2..."],
      "code": "// Heavily commented Java code",
      "complexity": "O(n^2) Time, O(1) Space"
    },
    "better": {
      "explanation": ["Step 1...", "Step 2..."],
      "code": "// Heavily commented Java code",
      "complexity": "O(n log n) Time, O(n) Space"
    },
    "optimal": {
      "explanation": ["Step 1...", "Step 2..."],
      "code": "// Heavily commented Java code",
      "complexity": "O(n) Time, O(1) Space"
    }
  },
  "commonMistakes": ["Mistake 1", "Mistake 2"],
  "relatedProblems": [
    {"title": "Two Sum (LeetCode) - brief reason why", "url": "https://leetcode.com/problems/two-sum"},
    {"title": "3Sum (LeetCode) - brief reason why", "url": "https://leetcode.com/problems/3sum"}
  ],
  "practiceRecommendations": ["Specific tip 1", "Specific tip 2"]
}

Rules:
1. Solutions must have heavily commented code (nearly every line explained).
2. ALL explanations (approach, solution.explanation) must be point-wise (arrays of strings).
3. "relatedProblems" must include valid URLs from LeetCode or GeeksforGeeks.
4. SEARCH REQUIREMENT: Cross-reference with LeetCode/GfG to ensure accuracy of complexity and related problems.
5. Do not include markdown code blocks inside the JSON strings.`;

    try {
      const text = await this.callCerebras(prompt, true);
      return this.parseJSON(text);
    } catch (e) {
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Generate Similar Problem
  // ═══════════════════════════════════════════════════════════════
  async generateSimilarProblem(originalTitle, difficulty, topics = [], patterns = []) {
    const prompt = `Create a NEW problem similar to: "${originalTitle}"
Difficulty: ${difficulty}
Topics: ${topics?.join(', ') || 'Any'}
Patterns: ${patterns?.join(', ') || 'Any'}

STYLE & DIVERSITY REQUIREMENTS:
1. **INTERVIEW TONE**: Use a professional, technical style (Scenario, Task, Constraints).
2. **VARY THE LOGIC**: Create a DIFFERENT algorithmic challenge. "Similar" means same patterns but a fresh implementation logic.
3. **UNIQUE SCENARIO**: Use a theme unrelated to "${originalTitle}". 
4. **ANTI-CLONE**: Strictly forbid generating any of the Top 500 common LeetCode problems.

Return JSON:
{
  "title": "Professional Unique Title",
  "difficulty": "${difficulty}",
  "description": "Professional interview problem description. Define return values for impossible cases.",
  "functionSignature": "public ReturnType method(Type param)",
  "examples": [{"input": "...", "output": "...", "explanation": "..."}],
  "constraints": ["1 <= n <= 10^5"]
}`;

    try {
      const text = await this.callCerebras(prompt, true);
      return this.parseJSON(text);
    } catch (e) {
      throw new Error('Failed to generate similar problem');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Generate Learning Notes (Comprehensive Study Material)
  // ═══════════════════════════════════════════════════════════════
  async generateLearningNotes(pattern, topic) {
    // Determine if this is a pattern or a topic (Data Structure/Algorithm)
    const isPattern = !!pattern;
    const subject = pattern || topic;

    // ═══════════════════════════════════════════════════════════════
    // PROMPT FOR PATTERNS (Algorithmic techniques like Two Pointers, Sliding Window)
    // ═══════════════════════════════════════════════════════════════
    const patternPrompt = `You are an EXCEPTIONAL computer science educator with 20+ years of experience teaching at top universities (MIT, Stanford, CMU) and training engineers at FAANG companies. Your students consistently praise you for making complex concepts crystal clear.

YOUR MISSION: Create the ULTIMATE learning resource for "${subject}" that will take a complete beginner with ZERO prior knowledge and transform them into someone who can confidently solve any ${subject} problem in a coding interview.

TEACHING PHILOSOPHY:
- Explain like you're talking to a smart friend who has never seen this before
- Use analogies and real-world examples to make abstract concepts concrete  
- Build understanding step-by-step, never assuming prior knowledge
- After reading this, even a first-year CS student should fully understand ${subject}
- Be GENEROUS with explanations - clarity trumps brevity

Return a JSON object with this structure. EVERY field must be EXCEPTIONALLY detailed:

{
  "title": "Mastering ${subject}",
  
  "overview": "Write a COMPREHENSIVE 8-10 sentence overview that a complete beginner can understand. Structure it as: (1) Start with a simple real-world analogy that captures the essence of ${subject} - something anyone can relate to. (2) Define what ${subject} actually is in plain English. (3) Explain the CORE INSIGHT - the 'aha!' moment that makes this technique click. (4) Describe WHAT PROBLEM this solves and WHY we need it. (5) Explain how it improves upon the naive/brute-force approach - with specific complexity improvements. (6) Mention which types of coding problems use this and how often it appears in interviews. (7) End with what mastery looks like - what will someone be able to do after learning this? Make this overview engaging, encouraging, and accessible. A complete beginner should finish reading this and think 'I understand why this matters and I'm excited to learn it!'",
  
  "whenToUse": [
    "🎯 GOLDEN RULE 1 (90% CONFIDENCE - If you see this, USE ${subject}): Describe the MOST RELIABLE signal that tells you to use ${subject}. Be extremely specific. Example format: 'When you see [EXACT PROBLEM PATTERN] combined with [SPECIFIC CONSTRAINT], you should immediately think ${subject}. This works because [DETAILED EXPLANATION]. Real example: [CITE A REAL LEETCODE PROBLEM]. The reason this is 90% reliable is [EXPLAIN THE MATHEMATICAL/LOGICAL GUARANTEE].' Write 4-5 lines minimum.",
    
    "🎯 GOLDEN RULE 2 (90% CONFIDENCE): Second most reliable signal. Same detailed format as above. Focus on a DIFFERENT trigger pattern. Include a different real problem example.",
    
    "🎯 GOLDEN RULE 3 (90% CONFIDENCE): Third golden rule focusing on CONSTRAINT-BASED recognition. When the problem CONSTRAINTS (time/space requirements) force you toward ${subject}. Explain how to read constraints and know ${subject} is required.",
    
    "Signal 4 (HIGH CONFIDENCE): A common interview scenario where ${subject} shines. Explain the problem type, why ${subject} is optimal, and name 2-3 real LeetCode problems that fit this pattern.",
    
    "Signal 5 (HIGH CONFIDENCE): Another strong signal focusing on the TIME COMPLEXITY benefit. Explain exactly how ${subject} reduces complexity from brute force. Include the before/after complexity analysis.",
    
    "Signal 6 (MEDIUM CONFIDENCE): A scenario involving specific data structures (arrays, strings, linked lists, trees). Explain which data structure properties make ${subject} applicable.",
    
    "Signal 7 (MEDIUM CONFIDENCE): A SPACE OPTIMIZATION scenario. When you need O(1) space or the problem has strict memory constraints.",
    
    "Signal 8 (MEDIUM CONFIDENCE): When ${subject} combines with another technique (like binary search, hashing, sorting). Explain the hybrid approach.",
    
    "Signal 9 (PATTERN RECOGNITION): Common KEYWORDS in problem statements that hint at ${subject}. List 5-7 keyword phrases and explain why each triggers this pattern.",
    
    "Signal 10 (ANTI-PATTERNS): When NOT to use ${subject}. Describe scenarios that LOOK like they need ${subject} but actually don't. This prevents common mistakes."
  ],
  
  "complexity": {
    "time": "Write the time complexity with a COMPLETE BEGINNER-FRIENDLY explanation. Format: 'O(?) - [Plain English explanation]. Here's why: [Step-by-step reasoning showing exactly why we get this complexity. Count the operations. Explain what 'visiting each element once' means. Use concrete examples with actual numbers to illustrate.]'",
    
    "space": "Write the space complexity with the same detailed explanation format. Explain what 'auxiliary space' means. Clarify what counts toward space complexity and what doesn't.",
    
    "bestCase": "Describe when ${subject} performs BEST. What input makes it fastest? What's the complexity? Give a concrete example with actual numbers showing why it's fast.",
    
    "worstCase": "Describe when ${subject} performs WORST. What causes maximum work? How to recognize problematic inputs? Any strategies to mitigate?"
  },
  
  "coreApproach": {
    "intuition": "Write a DETAILED 6-8 sentence explanation that gives the complete beginner an 'AHA!' moment. Start with: 'The key insight that makes ${subject} work is...' Then explain: (1) The fundamental principle/invariant. (2) Why this principle guarantees correctness. (3) How to THINK about problems to recognize when this applies. (4) A simple analogy that makes the concept click. (5) What distinguishes an expert's thinking from a beginner's. This should be the paragraph that transforms confusion into clarity.",
    
    "steps": [
      "STEP 1 - UNDERSTAND THE PROBLEM: Before coding, what should you identify? What information do you need? How do you reformulate the problem to fit ${subject}? What questions should you ask yourself? Provide a mental checklist.",
      
      "STEP 2 - INITIALIZATION: Explain EXACTLY how to set up your solution. What variables/pointers/data structures do you need? Where do they start and WHY? What INVARIANT will you maintain throughout? Write this so a beginner knows precisely what code to write first.",
      
      "STEP 3 - THE MAIN LOOP: What's the loop condition? When do we continue vs stop? Explain the MEANING of the loop condition - what does it represent conceptually? Include common variations.",
      
      "STEP 4 - CORE DECISION LOGIC: Inside the loop, what decisions do we make? How do we know which action to take? Explain the branching logic step-by-step. Why does each decision lead us closer to the answer?",
      
      "STEP 5 - STATE UPDATES: How do we move forward? What changes with each iteration? How does the solution space shrink? Explain why we're guaranteed to make progress and eventually terminate.",
      
      "STEP 6 - SOLUTION DETECTION: How do we know we found the answer? What condition signals success? How do we extract and return the result correctly?",
      
      "STEP 7 - HANDLE NO SOLUTION: What if there's no valid answer? How do we detect this? What should we return? Explain edge case handling."
    ],
    
    "edgeCases": [
      "EDGE CASE: Empty/Null Input - What happens with empty arrays, null values, or zero-length strings? How should your code handle this? ALWAYS check for this FIRST. Show the exact code check and explain why it prevents crashes.",
      
      "EDGE CASE: Single Element - How does ${subject} behave with just one element? Does your loop even execute? Make sure your code doesn't break on size=1 inputs.",
      
      "EDGE CASE: All Same Elements - When every element is identical. Does ${subject} handle duplicates correctly? This often reveals bugs in pointer movement logic.",
      
      "EDGE CASE: Already Solved - When the input is already the answer (sorted, at target, etc.). Make sure you don't do unnecessary work or miss the immediate solution.",
      
      "EDGE CASE: No Solution Exists - When it's impossible to find an answer. How do you detect and report this gracefully without infinite loops?",
      
      "EDGE CASE: Extreme Values - Negative numbers, zeros, very large numbers, integer overflow. How do these affect ${subject}? What precautions needed?"
    ],
    
    "pseudocode": "function solve${subject.replace(/[^a-zA-Z]/g, '')}(input):\\n    // ═══════════════════════════════════════════════════════════════\\n    // STEP 1: HANDLE EDGE CASES FIRST (Always do this!)\\n    // ═══════════════════════════════════════════════════════════════\\n    if input is null OR input is empty:\\n        return default_value  // Handle gracefully\\n    \\n    if input.length == 1:\\n        return handle_single_element()  // Special case\\n    \\n    // ═══════════════════════════════════════════════════════════════\\n    // STEP 2: INITIALIZE YOUR STATE\\n    // Explain what each variable represents and why it starts there\\n    // ═══════════════════════════════════════════════════════════════\\n    [Initialize pointers/variables with clear comments explaining WHY]\\n    \\n    // INVARIANT: [State what property must ALWAYS be true]\\n    \\n    // ═══════════════════════════════════════════════════════════════\\n    // STEP 3: MAIN LOOP\\n    // [Explain what this loop is searching for]\\n    // ═══════════════════════════════════════════════════════════════\\n    while [loop condition - explain what it means]:\\n        \\n        // Calculate current state\\n        current = [computation]\\n        \\n        // DECISION POINT: [Explain the branching logic]\\n        if current == target:\\n            // SUCCESS! We found the answer\\n            return [result]\\n        \\n        else if [condition for one direction]:\\n            // [Explain WHY we move this way]\\n            [move pointer/update state]\\n        \\n        else:\\n            // [Explain WHY we move the other way]\\n            [move pointer/update state]\\n    \\n    // ═══════════════════════════════════════════════════════════════\\n    // STEP 4: NO SOLUTION FOUND\\n    // ═══════════════════════════════════════════════════════════════\\n    return NO_SOLUTION\\n\\n// COMPLEXITY ANALYSIS:\\n// TIME: O(?) because [detailed explanation]\\n// SPACE: O(?) because [detailed explanation]"
  },
  
  "exampleProblems": [
    {
      "name": "[REAL FAMOUS LEETCODE PROBLEM - EASY LEVEL]",
      "difficulty": "Easy",
      "companies": ["Google", "Amazon", "Microsoft"],
      "description": "Write the FULL problem description as it would appear on LeetCode. Include: what the function should do, input format, output format, and examples. A reader should be able to solve this problem just from your description.",
      "intuition": "Write a DETAILED 5-6 sentence explanation of HOW to solve this specific problem using ${subject}. Walk through the thought process: (1) How do we recognize ${subject} applies here? (2) What's our strategy? (3) Walk through a small example step-by-step. (4) Why is this optimal? This should be detailed enough that a beginner could implement the solution after reading this.",
      "code": "// ═══════════════════════════════════════════════════════════════\\n// PROBLEM: [Problem Name]\\n// APPROACH: ${subject}\\n// TIME: O(?)  |  SPACE: O(?)\\n// ═══════════════════════════════════════════════════════════════\\n\\n/*\\n * STRATEGY EXPLANATION:\\n * [Write 3-4 sentences explaining the high-level approach]\\n * [Explain WHY we're using ${subject}]\\n * [Describe the invariant we maintain]\\n */\\n\\npublic ReturnType methodName(params) {\\n    // Step 1: Handle edge cases\\n    // [Comment explaining this check]\\n    if (edgeCase) {\\n        return defaultValue;\\n    }\\n    \\n    // Step 2: Initialize\\n    // [Comment explaining each variable's purpose]\\n    int pointer1 = 0;  // [Why start here?]\\n    int pointer2 = n-1; // [Why start here?]\\n    \\n    // Step 3: Main loop\\n    // [Comment explaining when/why we stop]\\n    while (condition) {\\n        \\n        // [Comment: What are we computing?]\\n        int current = compute();\\n        \\n        // [Comment: Explain the decision branching]\\n        if (foundAnswer) {\\n            // [Comment: Why is this our answer?]\\n            return answer;\\n        } else if (needToMoveLeft) {\\n            // [Comment: Why move this direction?]\\n            pointer1++;\\n        } else {\\n            // [Comment: Why move this direction?]\\n            pointer2--;\\n        }\\n    }\\n    \\n    // Step 4: No solution\\n    return noSolution;\\n}"
    },
    {
      "name": "[REAL FAMOUS LEETCODE PROBLEM - MEDIUM LEVEL]",
      "difficulty": "Medium",
      "companies": ["Meta", "Apple", "Bloomberg"],
      "description": "Full problem description for a MEDIUM difficulty problem that uses ${subject}.",
      "intuition": "Detailed 5-6 sentence explanation for this medium-level problem. Explain what makes it harder than the easy problem and how ${subject} handles the additional complexity.",
      "code": "// Same detailed commenting style as Easy, but showing MEDIUM-level techniques\\n// Show how ${subject} scales to harder problems\\n// Include any optimizations or tricks needed for MEDIUM difficulty"
    },
    {
      "name": "[REAL FAMOUS LEETCODE PROBLEM - HARD LEVEL]",
      "difficulty": "Hard",
      "companies": ["Apple", "Uber", "Airbnb"],
      "description": "Full problem description for a HARD difficulty problem that uses ${subject}.",
      "intuition": "Detailed 6-7 sentence explanation. Explain the TRICK or INSIGHT that makes this hard problem solvable. What's the 'aha!' moment? How does ${subject} combine with other techniques here?",
      "code": "// Same detailed commenting style\\n// Focus on the ADVANCED techniques: optimizations, combining patterns, handling corner cases\\n// Explain any non-obvious tricks"
    }
  ],
  
  "commonMistakes": [
    "❌ MISTAKE 1 - [Specific Error]: Describe a common bug that beginners make when implementing ${subject}. EXPLAIN: (1) What the bug looks like in code, (2) Why beginners make this mistake, (3) What happens when this bug runs, (4) How to FIX it. This should be detailed enough that someone can check their own code for this mistake.",
    
    "❌ MISTAKE 2 - [Another Common Error]: Same detailed format - focus on a different type of mistake (logical error, off-by-one, wrong initialization, etc.)",
    
    "❌ MISTAKE 3 - [Performance Mistake]: A mistake that causes TLE (Time Limit Exceeded) or MLE (Memory Limit Exceeded). Explain the inefficient pattern and the efficient alternative.",
    
    "❌ MISTAKE 4 - [Edge Case Miss]: A mistake related to not handling edge cases. Which edge case is commonly forgotten? What's the symptom?",
    
    "❌ MISTAKE 5 - [Conceptual Misunderstanding]: A mistake that shows someone doesn't truly understand ${subject}. They're applying it wrong or in wrong situations. Clarify the correct understanding."
  ],
  
  "proTips": [
    "💡 PRO TIP 1 - Pattern Recognition Speed: Share an expert tip for INSTANTLY recognizing when ${subject} applies. What do you look for in the first 10 seconds of reading a problem? This should feel like insider knowledge.",
    
    "💡 PRO TIP 2 - Interview Communication: How should you EXPLAIN your ${subject} approach to an interviewer? What vocabulary impresses them? What should you mention to show mastery?",
    
    "💡 PRO TIP 3 - Debugging Strategy: When your ${subject} solution isn't working, what's the fastest way to debug? What are the first things to check? Share a systematic debugging approach.",
    
    "💡 PRO TIP 4 - Optimization Tricks: Advanced optimizations for ${subject} that separate good solutions from great ones. Space-time trade-offs, early termination, etc.",
    
    "💡 PRO TIP 5 - Practice Roadmap: What problems should someone solve IN ORDER to master ${subject}? Give a specific progression from easy to hard with 5-7 problem recommendations."
  ]
}

CRITICAL REQUIREMENTS:
1. Write for a COMPLETE BEGINNER - assume they've never seen ${subject} before
2. Use REAL LeetCode problem names in examples (Two Sum, 3Sum, Container With Most Water, etc.)
3. Code must be COMPLETE, COMPILABLE Java that actually works
4. Every explanation should answer "WHY?" not just "WHAT"
5. Include concrete examples with actual numbers whenever possible
6. Be EXTREMELY DETAILED - length is not a concern, quality is
7. After reading this, someone should be able to solve ${subject} problems in interviews
8. **CRITICAL - NO MARKDOWN**: Do NOT use any markdown formatting like **bold**, *italics*, \`code\`, or ### headers in the text. Write in PLAIN TEXT only. The text will be displayed as-is without any markdown rendering.`;

    // ═══════════════════════════════════════════════════════════════
    // PROMPT FOR TOPICS (Data Structures/Algorithms like LinkedList, Trees, Heaps)
    // This returns a COMPLETELY DIFFERENT JSON structure than patterns
    // ═══════════════════════════════════════════════════════════════
    // ═══════════════════════════════════════════════════════════════
    // PROMPT FOR TOPICS (Data Structures/Algorithms like LinkedList, Trees, Heaps)
    // This returns a COMPLETELY DIFFERENT JSON structure than patterns
    // ═══════════════════════════════════════════════════════════════
    // ═══════════════════════════════════════════════════════════════
    // PROMPT FOR TOPICS (Data Structures/Algorithms like LinkedList, Trees, Heaps)
    // This returns a COMPLETELY DIFFERENT JSON structure than patterns
    // ═══════════════════════════════════════════════════════════════
    // ═══════════════════════════════════════════════════════════════
    // PROMPT FOR TOPICS (Data Structures/Algorithms like LinkedList, Trees, Heaps)
    // This returns a COMPLETELY DIFFERENT JSON structure than patterns
    // ═══════════════════════════════════════════════════════════════
    // ═══════════════════════════════════════════════════════════════
    // PROMPT FOR TOPICS (Data Structures/Algorithms like LinkedList, Trees, Heaps)
    // This returns a COMPLETELY DIFFERENT JSON structure than patterns
    // ═══════════════════════════════════════════════════════════════
    const topicPrompt = `You are a Friendly Computer Science Tutor explaining concepts to a student who has JUST started coding. Your goal is to make "${subject}" easy to understand with THE SIMPLEST POSSIBLE Java code.

PEDAGOGICAL STRATEGY (Beginner -> Expert Curve):
1. START SIMPLE (Beginner): Use "ELI5" (Explain Like I'm 5) analogies.
2. BUILD FOUNDATION (Intermediate): Explain "How" and "Why".
3. DEEP DIVE (Advanced): Logic walkthroughs.
4. MASTER (Expert): Complexity & Industry.

Return a JSON object with this EXACT structure. Content must be ELABORATE but the CODE MUST BE DEAD SIMPLE:

{
  "type": "topic",
  "title": "Mastering ${subject} in Java",
  
  "conceptFoundation": {
    "definition": "BEGINNER LEVEL: Write a clear, friendly 3-4 sentence definition. Avoid jargon initially.",
    
    "realWorldAnalogy": "BEGINNER LEVEL: Provide a vivid, elaborate real-world analogy. Don't just say 'Stack = Plates'. Explain the analogy details.",
    
    "whyItExists": "INTERMEDIATE LEVEL: Explain the 'Why'. What problem does this solve that an Array couldn't?",
    
    "visualDescription": "INTERMEDIATE LEVEL: Describe how it looks in memory. Paint a mental picture. ASCII art recommended."
  },
  
  "technicalAnatomy": {
    "components": [
      "NODE CLASS: Describe the Node structure simply.",
      "HEAD/ROOT: The entry point.",
      "SIZE/CAPACITY: Tracking data."
    ],
    
    "properties": [
      "Property 1",
      "Property 2",
      "Property 3"
    ],
    
    "javaClassBlueprint": "Write a VERY BASIC Java class for ${subject}. \nCRITICAL CODING RULES:\n1. Use 'int' for data if possible (easiest to understand).\n2. NO 'this.' keyword: Use distinct parameter names (e.g. 'val' instead of 'data') to avoid 'this.data = data'.\n3. NO 'throw new Exception': Use System.out.println('Error') and return -1 or null.\n4. NO complex Generics unless absolutely necessary.\n5. Write like a beginner: straightforward, line-by-line code."
  },
  
  "operations": [
    {
      "name": "Insertion",
      "explanation": "STEP-BY-STEP WALKTHROUGH: Walk through the logic like a story. 'First we make a box...'",
      "edgeCases": [
        "Empty structure",
        "Boundaries",
        "Duplicates"
      ],
      "code": "// ═══════════════════════════════════════════════════════════════\\n// BASIC INSERTION\\n// ═══════════════════════════════════════════════════════════════\\n\\n// ABSOLUTE BEGINNER CODE\\n// NO 'this.' -> use different names\\n// NO 'throw' -> use System.out.println\\n// Use simple if/else",
      "timeComplexity": { "best": "O(?)", "average": "O(?)", "worst": "O(?)" },
      "spaceComplexity": "O(?)"
    },
    {
      "name": "Deletion",
      "explanation": "STEP-BY-STEP WALKTHROUGH: Explain deletion logic carefully.",
      "edgeCases": [
        "Empty structure",
        "Deleting only item",
        "Deleting from middle"
      ],
      "code": "// ═══════════════════════════════════════════════════════════════\\n// BASIC DELETION\\n// ═══════════════════════════════════════════════════════════════\\n\\n// ABSOLUTE BEGINNER CODE\\n// NO 'this.' keyword\\n// NO Exceptions\\n// Print errors explicitly",
      "timeComplexity": { "best": "O(?)", "average": "O(?)", "worst": "O(?)" },
      "spaceComplexity": "O(?)"
    },
    {
      "name": "Search",
      "explanation": "How do we find things? Walk through the process.",
      "edgeCases": [
        "Not found",
        "Empty structure"
      ],
      "code": "// ═══════════════════════════════════════════════════════════════\\n// BASIC SEARCH\\n// ═══════════════════════════════════════════════════════════════\\n\\n// Simple traversal loop",
      "timeComplexity": { "best": "O(?)", "average": "O(?)", "worst": "O(?)" },
      "spaceComplexity": "O(?)"
    },
    {
      "name": "Traversal",
      "explanation": "How do we visit every item?",
      "edgeCases": [],
      "code": "// ═══════════════════════════════════════════════════════════════\\n// TRAVERSAL\\n// ═══════════════════════════════════════════════════════════════\\n\\n// Simple printing loop",
      "timeComplexity": { "best": "O(n)", "average": "O(n)", "worst": "O(n)" },
      "spaceComplexity": "O(?)"
    }
  ],
  
  "complexityTable": {
    "headers": ["Operation", "Best Case", "Average Case", "Worst Case", "Space"],
    "rows": [
      ["Access", "O(?)", "O(?)", "O(?)", "O(1)"],
      ["Search", "O(?)", "O(?)", "O(?)", "O(1)"],
      ["Insert", "O(?)", "O(?)", "O(?)", "O(1)"],
      ["Delete", "O(?)", "O(?)", "O(?)", "O(1)"]
    ],
    "explanation": "EXPERT LEVEL: Analyze the trade-offs."
  },
  
  "comparisonWithAlternatives": [
    {
      "structure": "Array",
      "comparison": "Compare ${subject} vs Array.",
      "useArrayWhen": "Scenario for Array",
      "use${subject.replace(/[^a-zA-Z]/g, '')}When": "Scenario for ${subject}"
    },
    {
      "structure": "Alternative DS",
      "comparison": "Compare vs another similar DS.",
      "useAlternativeWhen": "Scenario for alternative",
      "use${subject.replace(/[^a-zA-Z]/g, '')}When": "Scenario for ${subject}"
    }
  ],
  
  "industryApplications": [
    {
      "application": "Real World Use Case 1",
      "explanation": "EXPERT LEVEL: Explain exactly how ${subject} is used.",
      "companies": ["Company A", "Company B"]
    },
    {
      "application": "Real World Use Case 2",
      "explanation": "Explanation",
      "companies": ["Company C"]
    },
    {
      "application": "Real World Use Case 3",
      "explanation": "Explanation",
      "companies": ["Company D"]
    }
  ],
  
  "interviewProblems": [
    {
      "name": "Basic Problem (Easy)",
      "difficulty": "Easy",
      "leetcodeNumber": 1,
      "whyThisProblem": "Tests basic understanding"
    },
    {
      "name": "Logic Problem (Medium)",
      "difficulty": "Medium",
      "leetcodeNumber": 2,
      "whyThisProblem": "Tests core logic/edge cases"
    },
    {
      "name": "Complex Problem (Hard)",
      "difficulty": "Hard",
      "leetcodeNumber": 3,
      "whyThisProblem": "Tests mastery and optimization"
    }
  ],
  
  "commonMistakes": [
    {
      "mistake": "Mistake 1",
      "why": "Reason",
      "consequence": "Result",
      "fix": "Solution"
    },
    {
      "mistake": "Mistake 2",
      "why": "Reason",
      "consequence": "Result",
      "fix": "Solution"
    },
    {
      "mistake": "Mistake 3",
      "why": "Reason",
      "consequence": "Result",
      "fix": "Solution"
    }
  ],
  
  "proTips": [
    {
      "tip": "Tip 1",
      "content": "Advice"
    },
    {
      "tip": "Tip 2",
      "content": "Advice"
    },
    {
      "tip": "Tip 3",
      "content": "Advice"
    }
  ],
  
  "masteryChecklist": [
    "Can you implement from scratch?",
    "Can you explain complexity?",
    "Can you compare with alternatives?",
    "Can you solve 3 problems?",
    "Can you explain real-world usage?"
  ]
}

CRITICAL RULES:
1. "type" MUST be "topic".
2. CODE MUST BE "ABSOLUTE BEGINNER" STYLE.
   - NO 'this.variable' (Use distinct parameter names)
   - NO 'throw new Exception' (Use System.out.println)
   - Use 'int' where possible.
3. Content must range from BEGINNER to EXPERT.
4. Be ELABORATE and STORY-LIKE in explanations.
5. NO MARKDOWN formatting in text fields.`;

    // Choose the appropriate prompt
    const prompt = isPattern ? patternPrompt : topicPrompt;

    try {
      const text = await this.callCerebras(prompt, true);
      const notes = this.parseJSON(text);
      
      if (!notes) {
        throw new Error('Failed to parse learning notes');
      }
      
      // Helper function to strip markdown formatting from text
      const stripMarkdown = (text) => {
        if (typeof text !== 'string') return text;
        return text
          .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove **bold**
          .replace(/\*([^*]+)\*/g, '$1')       // Remove *italic*
          .replace(/__([^_]+)__/g, '$1')       // Remove __bold__
          .replace(/_([^_]+)_/g, '$1')         // Remove _italic_
          .replace(/`([^`]+)`/g, '$1')         // Remove `code`
          .replace(/#{1,6}\s+/g, '')           // Remove ### headers
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Remove [links](url)
      };
      
      // Apply to string arrays
      const stripArray = (arr) => Array.isArray(arr) ? arr.map(item => {
        if (typeof item === 'string') return stripMarkdown(item);
        if (typeof item === 'object' && item !== null) {
          // Recursively strip markdown from object values
          const cleaned = {};
          for (const key in item) {
            cleaned[key] = typeof item[key] === 'string' ? stripMarkdown(item[key]) : item[key];
          }
          return cleaned;
        }
        return item;
      }) : [];
      
      // ═══════════════════════════════════════════════════════════════
      // RETURN STRUCTURE FOR TOPICS (Data Structures/Algorithms)
      // ═══════════════════════════════════════════════════════════════
      if (!isPattern) {
        // Clean conceptFoundation
        const cleanConceptFoundation = notes.conceptFoundation ? {
          definition: stripMarkdown(notes.conceptFoundation.definition),
          realWorldAnalogy: stripMarkdown(notes.conceptFoundation.realWorldAnalogy),
          whyItExists: stripMarkdown(notes.conceptFoundation.whyItExists),
          visualDescription: stripMarkdown(notes.conceptFoundation.visualDescription)
        } : null;
        
        // Clean technicalAnatomy
        const cleanTechnicalAnatomy = notes.technicalAnatomy ? {
          components: stripArray(notes.technicalAnatomy.components),
          properties: stripArray(notes.technicalAnatomy.properties),
          javaClassBlueprint: notes.technicalAnatomy.javaClassBlueprint // Keep code as-is
        } : null;
        
        // Clean operations array
        const cleanOperations = Array.isArray(notes.operations) 
          ? notes.operations.map(op => ({
              name: stripMarkdown(op.name),
              explanation: stripMarkdown(op.explanation),
              edgeCases: stripArray(op.edgeCases),
              code: op.code, // Keep code as-is
              timeComplexity: op.timeComplexity,
              spaceComplexity: op.spaceComplexity
            }))
          : [];
        
        // Clean comparison array
        const cleanComparisons = Array.isArray(notes.comparisonWithAlternatives)
          ? notes.comparisonWithAlternatives.map(c => ({
              ...c,
              structure: stripMarkdown(c.structure),
              comparison: stripMarkdown(c.comparison)
            }))
          : [];
        
        // Clean industry applications
        const cleanIndustryApps = Array.isArray(notes.industryApplications)
          ? notes.industryApplications.map(app => ({
              application: stripMarkdown(app.application),
              explanation: stripMarkdown(app.explanation),
              companies: app.companies || []
            }))
          : [];
        
        // Clean interview problems
        const cleanInterviewProblems = Array.isArray(notes.interviewProblems)
          ? notes.interviewProblems.map(p => ({
              name: stripMarkdown(p.name),
              difficulty: p.difficulty,
              leetcodeNumber: p.leetcodeNumber,
              whyThisProblem: stripMarkdown(p.whyThisProblem)
            }))
          : [];
        
        // Clean common mistakes (now objects, not strings)
        const cleanMistakes = Array.isArray(notes.commonMistakes)
          ? notes.commonMistakes.map(m => {
              if (typeof m === 'string') return { mistake: stripMarkdown(m) };
              return {
                mistake: stripMarkdown(m.mistake),
                why: stripMarkdown(m.why),
                consequence: stripMarkdown(m.consequence),
                fix: stripMarkdown(m.fix)
              };
            })
          : [];
        
        // Clean pro tips (now objects, not strings)
        const cleanProTips = Array.isArray(notes.proTips)
          ? notes.proTips.map(t => {
              if (typeof t === 'string') return { tip: '', content: stripMarkdown(t) };
              return {
                tip: stripMarkdown(t.tip),
                content: stripMarkdown(t.content)
              };
            })
          : [];
        
        return {
          type: 'topic',
          title: stripMarkdown(notes.title) || `Mastering ${subject}`,
          conceptFoundation: cleanConceptFoundation,
          technicalAnatomy: cleanTechnicalAnatomy,
          operations: cleanOperations,
          complexityTable: notes.complexityTable || null,
          comparisonWithAlternatives: cleanComparisons,
          industryApplications: cleanIndustryApps,
          interviewProblems: cleanInterviewProblems,
          commonMistakes: cleanMistakes,
          proTips: cleanProTips,
          masteryChecklist: stripArray(notes.masteryChecklist)
        };
      }
      
      // ═══════════════════════════════════════════════════════════════
      // RETURN STRUCTURE FOR PATTERNS (Algorithmic techniques)
      // ═══════════════════════════════════════════════════════════════
      // Apply to complexity object
      const cleanComplexity = notes.complexity ? {
        time: stripMarkdown(notes.complexity.time),
        space: stripMarkdown(notes.complexity.space),
        bestCase: stripMarkdown(notes.complexity.bestCase),
        worstCase: stripMarkdown(notes.complexity.worstCase)
      } : { time: 'O(n)', space: 'O(1)' };
      
      // Apply to coreApproach object
      const cleanCoreApproach = notes.coreApproach ? {
        intuition: stripMarkdown(notes.coreApproach.intuition),
        steps: stripArray(notes.coreApproach.steps),
        edgeCases: stripArray(notes.coreApproach.edgeCases),
        pseudocode: notes.coreApproach.pseudocode // Keep pseudocode as-is (it's code)
      } : { intuition: '', steps: [], edgeCases: [], pseudocode: '' };
      
      // Apply to exampleProblems array
      const cleanExampleProblems = Array.isArray(notes.exampleProblems) 
        ? notes.exampleProblems.map(p => ({
            ...p,
            name: stripMarkdown(p.name),
            description: stripMarkdown(p.description),
            intuition: stripMarkdown(p.intuition),
            code: p.code // Keep code as-is
          }))
        : [];
      
      // Ensure all required fields exist with fallbacks and cleaned content
      return {
        type: 'pattern',
        title: stripMarkdown(notes.title) || `Mastering ${subject}`,
        overview: stripMarkdown(notes.overview) || `Overview of ${subject} pattern/topic.`,
        whenToUse: stripArray(notes.whenToUse),
        complexity: cleanComplexity,
        coreApproach: cleanCoreApproach,
        exampleProblems: cleanExampleProblems,
        commonMistakes: stripArray(notes.commonMistakes),
        proTips: stripArray(notes.proTips)
      };
    } catch (e) {
      console.error('Learning notes generation failed:', e.message);
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // ANALYZE USER CODE - Comprehensive code analysis with feedback
  // ═══════════════════════════════════════════════════════════════
  async analyzeUserCode(userCode, problemDescription, examples = [], constraints = [], optimalComplexity = null, executionFeedback = null) {
    const optimalInfo = optimalComplexity 
      ? `\n\nOPTIMAL SOLUTION COMPLEXITY (for reference):
- Time: ${optimalComplexity.time || 'Unknown'}
- Space: ${optimalComplexity.space || 'Unknown'}`
      : '';

    const executionInfo = executionFeedback
      ? `\n\nUSER'S EXECUTION RESULT:
- Status: ${executionFeedback.success ? 'PASSED' : 'FAILED'}
- Error/Output: ${executionFeedback.error || executionFeedback.output || 'No output'}`
      : `\n\nUSER'S EXECUTION RESULT: Not available (static analysis only)`;

    const prompt = `You are a Senior Software Engineer acting as a mentor. Analyze the following user-submitted code.
Your goal is to be genuinely helpful, pointing out mistakes constructively and guiding them toward better engineering practices.

PROBLEM DESCRIPTION:
${problemDescription}

EXAMPLES:
${examples.length > 0 ? examples.map((ex, i) => `Example ${i + 1}: ${JSON.stringify(ex)}`).join('\n') : 'None provided'}

CONSTRAINTS:
${constraints.length > 0 ? constraints.join('\n') : 'None provided'}
${optimalInfo}
${executionInfo}

USER'S CODE:
\`\`\`java
${userCode}
\`\`\`

Provide a comprehensive analysis in JSON format:

{
  "timeComplexity": {
    "value": "O(n)", 
    "explanation": "Brief explanation"
  },
  "spaceComplexity": {
    "value": "O(1)",
    "explanation": "Brief explanation"
  },
  "codeQuality": {
    "score": 8,
    "summary": "2-3 sentence assessment of readability, style, and best practices."
  },
  "keyInsights": [
    "Genuine positive observation (e.g., 'Good use of two-pointer technique')",
    "Another strength",
    "Recognition of clean code or logic"
  ],
  "improvementTips": [
    "Specific tip to reach 10/10 (only if score < 10)",
    "Another actionable step"
  ],
  "improvements": ${optimalComplexity || executionFeedback ? `null OR {
    "complexityMismatch": true,
    "suggestions": [
      {
        "issue": "Specific problem (e.g., Runtime Error, Logic Bug, Suboptimal O(n^2))",
        "impact": "Why this matters (e.g., 'Causes stack overflow on large inputs')",
        "fix": "Actionable advice or corrected code snippet. Be specific!"
      }
    ],
    "betterApproach": "Brief description of the optimal approach (if applicable)"
  }` : 'null'},
  "summary": "3-4 sentence helpful summary, like a mentor talking to a junior dev."
}

CRITICAL RULES:
1. **SCORING**: Be GENEROUS. Start from 10/10. Only deduct points for clear violations (bugs, very poor naming, dangerous code). 
2. **TIPS**: If score < 10, you MUST provide "improvementTips". These should be specific steps to get to 10/10.
3. **PRIORITY**: If "USER'S EXECUTION RESULT" is FAILED, score should automatically be low, and "improvements" must fix the error.
4. If code is optimal, clean, and passes, give it 10/10 and set "improvementTips" to null or empty array.
5. Return ONLY the JSON.`;

    try {
      console.log('🔍 Analyzing user code...');
      const text = await this.callCerebras(prompt, true);
      const analysis = this.parseJSON(text);
      
      if (!analysis) {
        throw new Error('Failed to parse code analysis');
      }
      
      return {
        timeComplexity: analysis.timeComplexity || { value: 'Unknown', explanation: 'Could not determine' },
        spaceComplexity: analysis.spaceComplexity || { value: 'Unknown', explanation: 'Could not determine' },
        codeQuality: analysis.codeQuality || { score: 5, summary: 'Analysis incomplete' },
        keyInsights: analysis.keyInsights || [],
        improvementTips: analysis.improvementTips || [],
        improvements: analysis.improvements || null,
        summary: analysis.summary || 'Analysis completed.'
      };
    } catch (e) {
      console.error('Code analysis failed:', e.message);
      throw e;
    }
  }
}

module.exports = new AIService();
