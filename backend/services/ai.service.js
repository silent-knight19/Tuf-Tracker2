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
- *CRITICAL*: For string problems, DO NOT assume only lowercase 'a'-'z'. Use a Map or int[128]/int[256] array to handle ALL ASCII characters (spaces, uppercase, symbols). Avoid 's.charAt(i) - \\'a\\''.`;

    try {
      // Multi-attempt validation: generate 5 candidates
      const NUM_CANDIDATES = 5;
      const candidates = [];
      
      console.log(`\n🔄 Generating ${NUM_CANDIDATES} solution candidates for validation...`);
      
      for (let i = 0; i < NUM_CANDIDATES; i++) {
        try {
          const text = await this.callCerebras(prompt, true);
          const candidate = this.parseJSON(text);
          
          if (candidate?.solution?.code) {
            candidates.push({
              ...candidate,
              candidateId: i + 1
            });
          }
        } catch (e) {
          console.warn(`Candidate ${i + 1} generation failed:`, e.message);
        }
      }
      
      if (candidates.length === 0) {
        throw new Error('All candidates failed to generate');
      }
      
      // If no examples, return first candidate
      if (!examples || examples.length === 0) {
        console.log('ℹ️  No examples provided, returning first candidate');
        return candidates[0];
      }
      
      // Validate each candidate
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
      console.log(`\n🏆 Selected Candidate ${bestCandidate.candidateId} with score ${bestCandidate.validationScore}/${bestCandidate.validationTotal}\n`);
      
      return bestCandidate;
      
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
    const prompt = `Generate problem description for: "${title}"

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
    let hints = [];
    let solution = providedSolution;

    if (!solution || !solution.code) {
      console.log('Step 1: Generating solution and hints...');
      const help = await this.generateSolutionOnly(title, description, difficulty, functionSignature, examples);
      hints = help.hints;
      solution = help.solution;
    } else {
      console.log('Using provided solution code.');
      // Still generate hints if not provided
      const help = await this.generateSolutionOnly(title, description, difficulty, functionSignature, examples);
      hints = help.hints;
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
    // STEP 3: Compute expected values by RUNNING the solution
    // ═══════════════════════════════════════════════════════════════
    let edgeCases = testInputs;
    if (testInputs.length > 0) {
      console.log('Step 3: Computing expected values by running solution...');
      try {
        edgeCases = await this.computeEdgeCaseOutputs(solution.code, testInputs, functionSignature);
        console.log(`✅ Computed expected values for ${edgeCases.filter(e => e.expected && e.expected !== 'ERROR').length}/${edgeCases.length} test cases`);
      } catch (e) {
        console.warn('⚠️ Computing expected values failed:', e.message);
        // Fallback: Test cases already contain AI-generated fallback from step 2
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
4. Include: 3 Basic, 4 Boundary (empty/single/K > unique/large values), 4 Edge, 4 Tricky cases.
5. Provide a highly accurate "expected" value according to problem rules. 
   - *CRITICAL*: If the task is impossible (e.g. K > unique elements), return EXACTLY what the problem specifies (usually -1). DO NOT use string "ERROR" if the return type is int.
   - This WILL BE USED if the backend code fails to execute. DO NOT leave it null.`;

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
    const prompt = `Analyze coding problem: "${title}"

Return JSON:
{
  "difficulty": "Easy|Medium|Hard",
  "topics": ["Array", "Hash Table"],
  "patterns": ["Two Pointers", "Sliding Window"],
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
    const prompt = `Generate study notes for: "${title}" (${difficulty})

Topics: ${topics?.join(', ') || 'General'}
Patterns: ${patterns?.join(', ') || 'General'}

Return JSON:
{
  "keyInsights": ["Insight 1", "Insight 2"],
  "approach": "How to approach this problem",
  "commonMistakes": ["Mistake 1"],
  "relatedProblems": ["Problem 1"],
  "practiceRecommendations": ["Recommendation 1"]
}`;

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
    const subject = pattern || topic;
    const prompt = `You are a world-class DSA instructor and competitive programming expert. Create EXTREMELY COMPREHENSIVE and DETAILED learning notes for mastering "${subject}" in coding interviews.

This is meant to be a COMPLETE TUTORIAL that someone can use to fully understand and master this concept. Be THOROUGH and EDUCATIONAL - write as if you're creating a premium course module.

Return a JSON object with this EXACT structure. EVERY field must be detailed and comprehensive:

{
  "title": "Learning: ${subject}",
  
  "overview": "Write a DETAILED 5-6 sentence overview that covers: (1) What ${subject} is and its formal definition, (2) The core principle or invariant that makes it work, (3) Why it's crucial for coding interviews and which companies love it, (4) How it compares to brute force approaches, (5) The key insight that distinguishes experts from beginners. This should read like an engaging introduction that hooks the reader and establishes foundational understanding.",
  
  "whenToUse": [
    "Signal 1: A specific scenario where this pattern is the primary candidate. Describe the signal and the underlying transformation it allows. Provide 2-3 lines of depth.",
    "Signal 2: Another common interview scenario with 2-3 lines of detailed explanation.",
    "Signal 3: A scenario involving specific data structure interactions (e.g., strings or linked lists). Provide 2-3 lines of depth.",
    "Signal 4: A scenario focusing on space optimization (e.g., reducing O(n) space to O(1)). Provide 2-3 lines of depth.",
    "Signal 5: An advanced scenario involving multi-pass or nested applications of the pattern. Provide 2-3 lines of depth.",
    "Signal 6: A niche or 'hidden' application of the pattern in less obvious problems. Provide 2-3 lines of depth.",
    "Signal 7: A scenario where this pattern is combined with another technique (e.g., sorting, hashing). Provide 2-3 lines of depth.",
    "Signal 8: Another scenario focusing on the time complexity advantage. Provide 2-3 lines of depth."
  ],
  
  "goldenRules": {
    "dataStructures": ["List 3-5 specific data structures (e.g., 'Sorted Array', 'String', 'Linked List') that strongly indicate ${subject} should be used. Each should be a single phrase without explanation."],
    "keywords": ["List 5-7 problem keywords/phrases (e.g., 'find a pair', 'contiguous subarray', 'in-place') that are 90% confidence signals for ${subject}. Single phrases only."],
    "operations": ["List 3-4 specific operations/constraints (e.g., 'O(1) space required', 'minimize time from O(n^2)', 'compare elements from both ends') that hint at ${subject}."],
    "constraints": ["List 2-3 constraint patterns (e.g., 'n <= 10^5', 'input is sorted') that almost guarantee ${subject} is optimal."]
  },
  
  "unconventionalUse": [
    "Unconventional Scenario 1: 2-3 lines explaining a case where ${subject} is applied WITHOUT the typical prerequisite (e.g., Two Pointers without sorting). Explain WHEN, WHY, and HOW this works.",
    "Unconventional Scenario 2: 2-3 lines on another advanced/edge case where the pattern is used non-traditionally.",
    "Unconventional Scenario 3: 2-3 lines on combining ${subject} with an unexpected technique or applying it to an unusual data structure."
  ],
  
  "complexity": {
    "time": "O(n) - Provide the typical time complexity with a brief explanation of why (e.g., 'O(n) because each element is visited at most once by each pointer, giving us 2n operations')",
    "space": "O(1) - Provide the typical space complexity with explanation (e.g., 'O(1) auxiliary space since we only use pointer variables regardless of input size')",
    "bestCase": "Describe the best-case scenario in detail: what input conditions lead to fastest execution, what the complexity becomes, and why. Example: 'Best case O(1) when the target pair is at the array edges - first comparison succeeds immediately'",
    "worstCase": "Describe the worst-case scenario in detail: what input conditions cause maximum work, and strategies to handle or mitigate this. Example: 'Worst case O(n) when target doesn't exist - both pointers traverse to meet at the middle, checking all possible pairs'"
  },
  
  "coreApproach": {
    "intuition": "Write a DETAILED 4-5 sentence explanation of the CORE INSIGHT that makes this technique work. Explain the 'aha!' moment that unlocks mastery. Why does this approach work? What mathematical or logical principle underlies it? How should someone THINK about problems to recognize when this applies? This should be the key conceptual breakthrough that transforms a confused beginner into someone who 'gets it'.",
    
    "steps": [
      "STEP 1 - Initialization: Provide a detailed explanation of how to set up the algorithm. What variables do you need? Where do pointers start and why? What invariants must be maintained? Example: 'Initialize two pointers: left at index 0 (smallest element) and right at index n-1 (largest element). The invariant is that our answer, if it exists, must lie within the range [left, right]. This works because...'",
      "STEP 2 - Loop Condition: Explain the main loop condition in detail. When do we continue? When do we stop? What does the condition represent conceptually? Include common variations.",
      "STEP 3 - Core Logic: Describe the main decision-making process inside the loop. How do we decide which pointer to move and why? What comparison do we make? Explain the reasoning behind each branch.",
      "STEP 4 - Pointer Movement: Explain how and why we move pointers. What does moving left pointer right achieve? What about moving right pointer left? Why does this converge to a solution?",
      "STEP 5 - Solution Detection: How do we know when we've found the answer? What condition signals success? How do we extract and return the result?",
      "STEP 6 - Termination Handling: What happens if no solution exists? How do we handle the case when pointers meet or cross? What should we return and why?"
    ],
    
    "edgeCases": [
      "Edge Case 1: 2-3 lines of deep technical explanation on how to handle specific boundary conditions (e.g., empty/single element) for ${subject}. Must be exactly 2-3 lines.",
      "Edge Case 2: 2-3 lines explaining another critical edge case and the logic to solve it. Must be exactly 2-3 lines.",
      "Edge Case 3: 2-3 lines on handling null or unexpected input types. Must be exactly 2-3 lines.",
      "Edge Case 4: 2-3 lines on duplicate handling or collision logic. Must be exactly 2-3 lines.",
      "Edge Case 5: 2-3 lines on negative values or underflow/overflow. Must be exactly 2-3 lines.",
      "Edge Case 6: 2-3 lines on large-scale performance or memory limits. Must be exactly 2-3 lines."
    ],
    
    "pseudocode": "// COMPREHENSIVE PSEUDOCODE TEMPLATE FOR ${subject}\\n// This template can be adapted for most ${subject} problems\\n\\nfunction solveTwoPointers(array, target):\\n    // STEP 1: Handle edge cases first\\n    if array is null or array.length < 2:\\n        return NO_SOLUTION\\n    \\n    // STEP 2: Initialize pointers\\n    // left starts at beginning, right at end\\n    left = 0\\n    right = array.length - 1\\n    \\n    // STEP 3: Main loop - continue while pointers haven't crossed\\n    while left < right:\\n        \\n        // STEP 4: Calculate current state\\n        currentValue = compute(array[left], array[right])\\n        \\n        // STEP 5: Check if solution found\\n        if currentValue == target:\\n            return [left, right]  // Found answer!\\n        \\n        // STEP 6: Decide which pointer to move\\n        else if currentValue < target:\\n            // Need larger value, move left pointer right\\n            left = left + 1\\n            // Optional: skip duplicates\\n            // while left < right and array[left] == array[left-1]:\\n            //     left = left + 1\\n        \\n        else:  // currentValue > target\\n            // Need smaller value, move right pointer left\\n            right = right - 1\\n            // Optional: skip duplicates\\n            // while left < right and array[right] == array[right+1]:\\n            //     right = right - 1\\n    \\n    // STEP 7: No solution found\\n    return NO_SOLUTION\\n\\n// TIME: O(n) - each element visited at most once\\n// SPACE: O(1) - only using pointer variables"
  },
  
  "exampleProblems": [
    {
      "name": "EASY: Real LeetCode-style Problem Title",
      "difficulty": "Easy",
      "companies": ["Google", "Amazon"],
      "description": "Standard easy-level problem description.",
      "intuition": "DETAILED EXPLANATION (3-4 sentences): Specifically explain HOW the ${subject} pattern is applied step-by-step to solve this specific problem. Why is it the optimal choice here?",
      "code": "// EASY PROBLEM - LINE-BY-LINE EXPLANATION\\n// Every single line must have a comment explaining:\\n// (1) WHAT it does, (2) WHY it's needed, (3) HOW it applies the ${subject} pattern.\\n// Example for Two Pointers:\\n// int left = 0;  // Initialize left pointer at start - we begin with smallest element in sorted array\\n// int right = n - 1;  // Initialize right pointer at end - we begin with largest element\\n// Complete compilable Java solution with EVERY LINE commented."
    },
    {
      "name": "MEDIUM: Real LeetCode-style Problem Title",
      "difficulty": "Medium",
      "companies": ["Meta", "Microsoft"],
      "description": "Standard medium-level problem description.",
      "intuition": "DETAILED EXPLANATION (3-4 sentences): Deep dive into HOW the ${subject} pattern handles the increased complexity of this medium problem. Explain the specific transformation or logic move.",
      "code": "// MEDIUM PROBLEM - LINE-BY-LINE EXPLANATION\\n// Every single line must have a comment explaining:\\n// (1) WHAT it does, (2) WHY it's needed, (3) HOW it applies the ${subject} pattern.\\n// Complete compilable Java solution with EVERY LINE commented."
    },
    {
      "name": "HARD: Real LeetCode-style Problem Title",
      "difficulty": "Hard",
      "companies": ["Apple", "Netflix"],
      "description": "Advanced hard-level problem description.",
      "intuition": "DETAILED EXPLANATION (4-5 sentences): Complex breakdown of HOW the ${subject} pattern is mastered here, perhaps in combination with other techniques or to handle extreme constraints.",
      "code": "// HARD PROBLEM - LINE-BY-LINE EXPLANATION\\n// Every single line must have a comment explaining:\\n// (1) WHAT it does, (2) WHY it's needed, (3) HOW it applies the ${subject} pattern.\\n// Complete compilable Java solution with EVERY LINE commented."
    }
  ],
  
  "commonMistakes": [
    "Mistake 1: 2-3 lines of detailed technical reasoning about a common error and its fix. Exactly 2-3 lines.",
    "Mistake 2: 2-3 lines regarding a frequent logical slip. Exactly 2-3 lines.",
    "Mistake 3: 2-3 lines on performance pitfalls. Exactly 2-3 lines.",
    "Mistake 4: 2-3 lines on implementation bugs. Exactly 2-3 lines.",
    "Mistake 5: 2-3 lines on communication or conceptual errors. Exactly 2-3 lines."
  ],
  
  "proTips": [
    "Pro Tip 1: 2-3 lines of elite-level advice for pattern recognition or speed. Exactly 2-3 lines.",
    "Pro Tip 2: 2-3 lines on advanced variant handling. Exactly 2-3 lines.",
    "Pro Tip 3: 2-3 lines on interview communication tactics. Exactly 2-3 lines.",
    "Pro Tip 4: 2-3 lines on space-time trade-off mastery. Exactly 2-3 lines.",
    "Pro Tip 5: 2-3 lines on combining this pattern with others. Exactly 2-3 lines."
  ]
}

CRITICAL: Generate REAL, DETAILED content for "${subject}". Every field must be COMPREHENSIVE and EDUCATIONAL. Do NOT use placeholder text or generic examples. The code must be COMPLETE and COMPILABLE Java. This should be thorough enough to serve as a complete self-study resource.`;

    try {
      const text = await this.callCerebras(prompt, true);
      const notes = this.parseJSON(text);
      
      if (!notes) {
        throw new Error('Failed to parse learning notes');
      }
      
      // Ensure all required fields exist with fallbacks
      return {
        title: notes.title || `Learning: ${subject}`,
        overview: notes.overview || `Overview of ${subject} pattern/topic.`,
        whenToUse: notes.whenToUse || [],
        complexity: notes.complexity || { time: 'O(n)', space: 'O(1)' },
        coreApproach: notes.coreApproach || { intuition: '', steps: [], edgeCases: [], pseudocode: '' },
        exampleProblems: notes.exampleProblems || [],
        commonMistakes: notes.commonMistakes || [],
        proTips: notes.proTips || []
      };
    } catch (e) {
      console.error('Learning notes generation failed:', e.message);
      return null;
    }
  }
}

module.exports = new AIService();
