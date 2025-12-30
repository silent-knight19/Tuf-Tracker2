const { cerebrasClient, models, rateLimiter } = require('../config/ai.config');

class AIService {
  
  // Helper to make Cerebras API calls with Retry Logic
  async callCerebras(prompt, modelType = 'fast', jsonMode = true, retries = 3) {
    try {
      await rateLimiter.checkAndWait();
      
      const model = modelType === 'complex' ? models.cerebras.complex : models.cerebras.fast;
      
      const response = await cerebrasClient.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: model,
        response_format: jsonMode ? { type: "json_object" } : undefined,
        temperature: 0.7,
        max_tokens: 8192,
        top_p: 1
      });

      return response.choices[0].message.content;
    } catch (error) {
      if (retries > 0 && (error.status === 429 || error.message?.includes('429') || error.code === 429)) {
        const waitTime = 2000 * (4 - retries); // 2s, 4s, 6s...
        console.warn(`⚠️ Cerebras 429 Rate Limit. Retrying in ${waitTime}ms... (${retries} left)`);
        await new Promise(r => setTimeout(r, waitTime));
        return this.callCerebras(prompt, modelType, jsonMode, retries - 1);
      }
      
      console.error(`Cerebras API Error (${modelType}):`, error);
      throw error;
    }
  }

  // Analyze a problem using AI
  async analyzeProblem(title, platform = 'LeetCode', url = '') {
    try {
      const prompt = `You are a senior competitive programming expert who analyzes DSA problems.
TASK: Analyze this problem and extract structured metadata.

Problem Title: "${title}"
Platform: ${platform}
URL: ${url || 'N/A'}

OUTPUT FORMAT - Return a JSON object with these exact fields:
{
  "title": "exact problem title",
  "difficulty": "Easy" | "Medium" | "Hard",
  "topics": ["Array", "String", "Tree", etc.],
  "patterns": ["Two Pointers", "Sliding Window", "DFS", etc.],
  "companies": ["Google", "Amazon", "Meta", etc.],
  "platform": "${platform}",
  "platformUrl": "${url || 'N/A'}"
}

ALLOWED PATTERNS (choose from this list only):
Two Pointers, Sliding Window, Fast & Slow Pointers, Prefix Sum, Kadane Pattern, Cyclic Sort, Hash Map / Hash Set, Binary Search, Binary Search on Answer, DFS, BFS, Tree BFS, Tree DFS, Graph Traversal, Topological Sort, Union Find, 0/1 Knapsack DP, Unbounded Knapsack DP, Subsequence DP, Partition DP / Subset DP, Grid DP, Subsets, Permutations, Combination Sum Variants, Monotonic Stack, Stack, Min Heap / Max Heap, Two Heaps Pattern, Linked List Patterns, Trie + String Matching

RULES:
1. Return ONLY valid JSON - no markdown, no extra text
2. Use standard CS topic names for topics
3. Include known companies that ask this problem`;

      const text = await this.callCerebras(prompt, 'fast', true);
      const parsedData = this.parseJSONSafe(text);

      return {
        title: parsedData.title || title,
        difficulty: parsedData.difficulty || 'Medium',
        topics: Array.isArray(parsedData.topics) ? parsedData.topics : [],
        patterns: Array.isArray(parsedData.patterns) ? parsedData.patterns : [],
        companies: parsedData.companies || [],
        platform: parsedData.platform || platform,
        platformUrl: parsedData.platformUrl || url
      };
    } catch (error) {
      console.error('Error analyzing problem with AI:', error);
      return {
        title,
        difficulty: 'Medium',
        topics: ['Unknown'],
        patterns: ['Unknown'],
        companies: [],
        platform,
        platformUrl: url,
        error: 'AI analysis failed, using default values'
      };
    }
  }

  // Summarize user notes
  async summarizeNotes(notes) {
    try {
      const prompt = `You are a concise technical writer summarizing problem-solving notes.
TASK: Extract key takeaways from these notes in bullet point format.

NOTES:
${notes}

OUTPUT FORMAT:
• Main approach used
• Key insight or trick
• Complexity (if mentioned)
• Common pitfall to avoid

RULES:
1. Maximum 4 bullet points
2. Use • symbol for bullets
3. Be concise - one line per point
4. Skip if not mentioned in notes`;

      // Not JSON mode
      const text = await this.callCerebras(prompt, 'fast', false);
      return text.trim();
    } catch (error) {
      console.error('Error summarizing notes:', error);
      return 'Summary unavailable';
    }
  }

  // Detect weaknesses from problem history
  async detectWeaknesses(problemHistory) {
    try {
      const topicCounts = {};
      const patternCounts = {};
      const difficultyStats = { Easy: 0, Medium: 0, Hard: 0 };

      problemHistory.forEach(problem => {
        problem.topics?.forEach(topic => {
          topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        });
        problem.patterns?.forEach(pattern => {
          patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
        });
        if (problem.difficulty) {
          difficultyStats[problem.difficulty] = (difficultyStats[problem.difficulty] || 0) + 1;
        }
      });

      const prompt = `You are a DSA coach analyzing a student's practice history to identify gaps.
TASK: Identify weak areas based on this practice data.

PRACTICE DATA:
Topics solved: ${Object.entries(topicCounts).map(([topic, count]) => `${topic}(${count})`).join(', ') || 'None'}
Patterns used: ${Object.entries(patternCounts).map(([pattern, count]) => `${pattern}(${count})`).join(', ') || 'None'}
Difficulty: Easy=${difficultyStats.Easy}, Medium=${difficultyStats.Medium}, Hard=${difficultyStats.Hard}

OUTPUT FORMAT - JSON object:
{
  "weakTopics": ["topic1", "topic2", "topic3"],
  "weakPatterns": ["pattern1", "pattern2", "pattern3"],
  "recommendations": ["action1", "action2", "action3"],
  "difficultyAdvice": "One sentence advice"
}

RULES:
1. Identify topics/patterns with ZERO or LOW counts as weak
2. Provide 3 actionable recommendations
3. Return ONLY valid JSON`;

      const text = await this.callCerebras(prompt, 'complex', true); // Reasoning needed
      return this.parseJSONSafe(text);
    } catch (error) {
      console.error('Error detecting weaknesses:', error);
      return {
        weakTopics: [],
        weakPatterns: [],
        recommendations: [],
        difficultyAdvice: 'Unable to analyze'
      };
    }
  }

  // Suggest related problems
  async suggestRelatedProblems(problemTitle, topics, patterns) {
    try {
      const prompt = `You are a LeetCode problem curator suggesting practice problems.
TASK: Suggest 5 related problems similar to "${problemTitle}".

CONTEXT:
- Topics: ${topics.join(', ') || 'General'}
- Patterns: ${patterns.join(', ') || 'General'}

OUTPUT FORMAT - JSON array with 5 objects:
[
  {"title": "Problem Name", "reason": "Brief similarity explanation", "difficulty": "Easy|Medium|Hard"}
]

RULES:
1. Suggest real LeetCode problems only
2. Mix difficulties (1-2 Easy, 2-3 Medium, 1 Hard)
3. Keep reasons under 10 words
4. Return ONLY valid JSON array`;

      const text = await this.callCerebras(prompt, 'fast', true);
      return this.parseJSONSafe(text);
    } catch (error) {
      console.error('Error suggesting related problems:', error);
      return [];
    }
  }

  // Generate comprehensive study notes for a problem
  async generateStudyNotes(title, platform = 'LeetCode', url = '', difficulty = 'Medium', topics = [], patterns = []) {
    try {
      const prompt = `You are an expert DSA tutor creating comprehensive study notes for "${title}" (${difficulty}).
TASK: Create a DETAILED study guide with structured, point-wise explanations. Avoid long dense paragraphs.

OUTPUT FORMAT - JSON object:
{
  "understanding": "<3-5 bullet points explaining: 1. What the problem asks, 2. Key constraints, 3. Input/Output example breakdown, 4. Useful analogy. Format as: '• Point 1\\n• Point 2...'>",
  "bruteForce": {
    "explanation": "<Numbered list explaining the naive approach:\\n1. Start by...\\n2. Then check...\\n3. This works because...\\n4. However, it is slow due to...>",
    "code": "Clean Java code with detailed comments explaining each step",
    "complexity": "O(n²) Time - explain why | O(1) Space - explain why"
  },
  "better": {
    "explanation": "<Numbered list explaining optimization:\\n1. We can improve by...\\n2. Instead of X, we do Y...\\n3. This reduces work because...>",
    "code": "Improved Java code with detailed comments, or null",
    "complexity": "O(n log n) Time | O(n) Space, or null"
  },
  "optimal": {
    "explanation": "<Numbered list explaining the optimal strategy:\\n1. Key Insight: ...\\n2. Step 1: ...\\n3. Step 2: ...\\n4. Why this covers all cases...>",
    "code": "Best Java solution with comprehensive comments explaining WHY each line is there",
    "complexity": "O(n) Time - explain why | O(1) Space - explain why"
  },
  "takeaways": "- 💡 Key insight 1: ...\\n- 💡 Key insight 2: ...\\n- ⚠️ Common mistake: ...\\n- 🚀 Interview tip: ..."
}

CODE RULES:
1. Use class Solution { public returnType methodName(...) { } } format
2. 4-space indentation, proper Java syntax
3. NO markdown backticks - pure Java only
4. Use \\n for newlines in strings.
5. **CRITICAL**: Code must be a SINGLE STRING. DO NOT return an array of strings.
6. ADD DETAILED COMMENTS explaining the logic and reasoning for each step.

CONTENT RULES:
1. **STRICTLY USE LISTS/BULLET POINTS**. Do not write long paragraphs.
2. Structure every explanation as a numbered list (1., 2., 3.).
3. Make it easy to scan and read quickly.
4. Use emojis (💡, ⚠️, 🚀) to highlight key points in takeaways.
5. Escape special characters properly for valid JSON.
`;

      const text = await this.callCerebras(prompt, 'complex', true); // Needs deep reasoning
      return this.parseJSONSafe(text);
    } catch (error) {
      console.error('Error generating study notes:', error);
      throw new Error(`Failed to generate study notes: ${error.message}`);
    }
  }

  // Generate comprehensive problem description with examples and constraints
  async generateProblemDescription(title, platform = 'LeetCode', difficulty = 'Medium', topics = [], patterns = []) {
    try {
      const prompt = `You are a LeetCode problem author creating problem descriptions.
TASK: Create a complete and DETAILED problem description for "${title}" (${difficulty}).

OUTPUT FORMAT - JSON object:
{
  "statement": "Full problem statement. MUST include the complete paragraph explaining the problem scenario, rules, and objectives. Do NOT summarize. Write it exactly as it would appear on LeetCode.",
  "examples": [
    {"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "nums[0] + nums[1] = 9"}
  ],
  "constraints": ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"],
  "functionSignature": "public int[] twoSum(int[] nums, int target)",
  "followUp": "Can you solve it in O(n) time?" or null
}

CONTEXT:
- Topics: ${topics.join(', ') || 'General'}
- Patterns: ${patterns.join(', ') || 'General'}

RULES:
1. "statement" field MUST be the full text. NO 1-sentence summaries.
2. Create 2-3 realistic examples with inputs/outputs/explanations.
3. Include 2-4 appropriate constraints.
4. Function signature must be valid Java
5. Plain text only - no markdown in strings
6. Return ONLY valid JSON`;

      const text = await this.callCerebras(prompt, 'fast', true);
      return this.parseJSONSafe(text);
    } catch (error) {
      console.error('Error generating problem description:', error);
      throw new Error('Failed to generate problem description.');
    }
  }

  // Generate a similar but new problem based on an existing one (Problem Definition ONLY)
  async generateSimilarProblem(originalTitle, difficulty, topics = [], patterns = []) {
    try {
      const prompt = `You are a coding interview question designer.
TASK: Create a NEW problem similar to "${originalTitle}".

CONTEXT:
- Original: ${originalTitle} (${difficulty})
- Topics: ${topics.join(', ') || 'General'}
- Patterns: ${patterns.join(', ') || 'General'}
- Timestamp: ${Date.now()}
- Creative Theme: ${['Space Exploration', 'Deep Sea Biology', 'Medieval Fantasy', 'Cyberpunk', 'Kitchen Logic'].sort(() => 0.5 - Math.random())[0]}

OUTPUT FORMAT - JSON object:
{
  "title": "Creative New Problem Title",
  "difficulty": "${difficulty}",
  "description": "Clear problem statement with new scenario",
  "functionSignature": "public returnType methodName(params)",
  "examples": [
    {"input": "val", "output": "res", "explanation": "Step-by-step walkthough: 1. Start with... 2. Then... 3. Result..."}
  ],
  "constraints": ["const1", "const2"]
}

RULES:
1. DIFFERENT scenario from original.
2. SAME underlying pattern.
3. MAKE IT UNIQUE. Do not repeat common examples.
4. Provide 3-4 Examples. Each explanation must be CONCISE (2-3 lines max).
5. Valid Java code (no markdown).
6. Return ONLY JSON.`;

      console.log('Generating similar problem definition with Cerebras:', originalTitle);
      const text = await this.callCerebras(prompt, 'fast', true);
      const parsedProblem = this.parseJSONSafe(text);

      // Initialize empty arrays for the frontend to fetch later
      parsedProblem.hints = [];
      parsedProblem.solutions = { optimal: null, better: null, brute: null };
      parsedProblem.edgeCases = [];
      
      return parsedProblem;
    } catch (error) {
      console.error('Error generating similar problem:', error);
      throw new Error('Failed to generate similar problem');
    }
  }

  // Generate a new problem based on specific criteria (Problem Definition ONLY)
  async generateProblemFromCriteria(pattern, topic, difficulty) {
    try {
      const prompt = `You are a FAANG Technical Interview Question Designer.

TASK: Create a BRAND NEW interview-style coding problem.

CRITERIA:
- Pattern: ${pattern || 'Any algorithmic pattern'}
- Topic: ${topic || 'Any data structure topic'}
- Difficulty: ${difficulty}
- RandomSeed: ${Math.random().toString(36).substring(7)}

DESCRIPTION STYLE (CRITICAL - Follow This Format):
Write the description EXACTLY like real FAANG interview questions:
1. Start with a relatable SCENARIO (company context, real-world application)
2. Clearly define the TASK in the second paragraph
3. Use professional language, no academic tone
4. Include edge cases implicitly in the description
5. Make it feel like a conversation with an interviewer

EXAMPLE STYLE (from real interviews):
"You are given a log of website visits as an array of timestamps. Each timestamp represents when a user accessed the site. Your team wants to identify the peak traffic window - the shortest contiguous period where at least K users visited the site. This data will help your infrastructure team allocate server resources efficiently.

Given an integer array visits sorted in ascending order and an integer k, return the minimum length of a contiguous subarray that contains at least k elements. If no such subarray exists, return -1."

OUTPUT FORMAT - JSON object:
{
  "title": "Creative Interview Problem Title (no generic names like 'Array Problem')",
  "difficulty": "${difficulty}",
  "description": "A 2-3 paragraph interview-style problem description as shown above. First paragraph sets the BUSINESS SCENARIO. Second paragraph defines the TECHNICAL TASK. Write it conversationally as an interviewer would explain it.",
  "functionSignature": "public ReturnType methodName(Type1 param1, Type2 param2)",
  "examples": [
    {"input": "param1 = [value1, value2], param2 = value", "output": "expectedResult", "explanation": "Brief walkthrough of how to get this output (2-3 lines max)"}
  ],
  "constraints": ["1 <= param1.length <= 10^5", "Other realistic constraints..."]
}

RULES:
1. MUST demonstrate ${pattern ? `the "${pattern}" pattern` : 'a clear algorithmic pattern'}.
2. The SCENARIO must be realistic (tech company, finance, logistics, social media, etc.).
3. Avoid academic/textbook problem formats. No "Given an array..." as the opener.
4. Examples should have clear, realistic inputs with brief explanations.
5. Include 3-4 examples covering normal cases and edge cases.
6. Constraints should be realistic for ${difficulty} level.
7. Function signature must be valid Java with meaningful parameter names.
8. Return ONLY valid JSON, no markdown.`;

      console.log('Generating interview-style problem definition from criteria with Cerebras...');
      const text = await this.callCerebras(prompt, 'fast', true);
      const parsedProblem = this.parseJSONSafe(text);
      
      // Add criteria metadata
      parsedProblem.pattern = pattern || null;
      parsedProblem.topic = topic || null;
      
      // Initialize empty arrays
      parsedProblem.hints = [];
      parsedProblem.solutions = { optimal: null, better: null, brute: null };
      parsedProblem.edgeCases = [];
      
      return parsedProblem;

    } catch (error) {
      console.error('Error generating problem from criteria:', error);
      throw new Error('Failed to generate problem from criteria: ' + error.message);
    }
  }

  // Generate hints, solutions, AND edge cases for a problem (SEQUENTIAL-ISH Strategy)
  // Generate hints, solutions, AND edge cases for a problem (SEQUENTIAL-ISH Strategy)
  async generateProblemHelp(title, description, difficulty, pattern = null, examples = [], constraints = [], functionSignature = null, mode = 'full', providedSolution = null, existingEdgeCases = null) {
    try {
      const patternRequirement = pattern 
        ? `\n\n**MANDATORY**: The optimal solution MUST use the "${pattern}" pattern/technique. This is NON-NEGOTIABLE. If someone selected "${pattern}" to practice, the solution MUST demonstrate "${pattern}" as the primary solving strategy.`
        : '';
        
      const problemContext = `
Title: "${title}"
Difficulty: ${difficulty}
Description: ${typeof description === 'string' ? description : description.description || ''}
Function: ${functionSignature || 'N/A'}
Constraints: ${constraints?.join(', ')}
Examples: ${JSON.stringify(examples)}
`;

      const result = {
        hints: [],
        edgeCases: [],
        solutions: { optimal: null, better: null, brute: null }
      };

      // --- STEP 1: GENERATE EDGE CASES (Gemini) ---
      let edgeCaseInputs = [];
      
      if (existingEdgeCases && existingEdgeCases.length > 0) {
        console.log('Using EXISTING edge cases provided in request...');
        edgeCaseInputs = existingEdgeCases.map(ec => ({
            name: ec.name,
            input: ec.input,
            category: ec.category
        }));
      } else {
        console.log('Step 1: Generating Edge Cases (Gemini 3.0)...');
        try {
          edgeCaseInputs = await this.generateEdgeCaseInputs(title, description, examples, constraints, functionSignature);
        } catch (e) {
          console.error('Failed to generate edge cases first:', e);
        }
      }

      // If mode is ONLY edge cases, we stop here (unless we have a solution to run)
      if (mode === 'edge_cases_only') {
         console.log('Mode is edge_cases_only. Skipping solution generation.');
         
         // If we have a provided solution (from frontend), use it to compute outputs!
         if (providedSolution && edgeCaseInputs.length > 0) {
            console.log('Using PROVIDED solution to compute edge case outputs...');
            try {
              result.edgeCases = await this.computeEdgeCaseOutputs(providedSolution, edgeCaseInputs, functionSignature);
            } catch (e) {
              console.error('Failed to compute outputs with provided solution:', e);
              // Fallback to inputs only
               result.edgeCases = edgeCaseInputs.map(ec => ({...ec, expectedOutput: null}));
            }
         } else {
            // No solution to run, just return inputs
            result.edgeCases = edgeCaseInputs.map(ec => ({...ec, expectedOutput: null}));
         }
         return result;
      }

      // Format edge cases for the prompt
      const edgeCasesContext = edgeCaseInputs.length > 0 
        ? `\n\nCRITICAL: Your solution MUST handle the following specific edge cases correctly. We have already generated these inputs, and we will TEST your code against them:\n${JSON.stringify(edgeCaseInputs.slice(0, 5))} (and ${edgeCaseInputs.length - 5} more similar cases).`
        : '';

      // --- STEP 2: GENERATE HINTS AND SOLUTIONS (Cerebras) ---
      const hintPromise = (async () => {
        console.log('Step 2a: Generating Hints...');
        const hintPrompt = `You are an expert coding tutor.
TASK: Generate 10 progressive, high-quality hints for this problem.${pattern ? `\nIMPORTANT: Hints should guide toward solving with the "${pattern}" technique.` : ''}
${problemContext}
RULE:
- Hints should go from vague to specific.
- Last hint should almost reveal the solution.
- Return VALID JSON.
OUTPUT: JSON { "hints": ["Hint 1", ..., "Hint 10"] }`;

        const hintText = await this.callCerebras(hintPrompt, 'complex', false);
        return this.parseJSONSafe(hintText);
      })();

      const solutionPromise = (async () => {
        console.log('Step 2b: Generating Solutions (Context Aware)...');
        const solPrompt = `You are a FAANG Interviewer.${patternRequirement}

TASK: Provide the OPTIMAL solution for this problem.
${problemContext}
${edgeCasesContext}

${pattern ? `CRITICAL: The user specifically selected "${pattern}" to practice. Your solution MUST use "${pattern}" as the primary technique. Do NOT use HashMap, HashSet, sorting, or any other approach if "${pattern}" can solve it.` : ''}

OUTPUT FORMAT: JSON
{
  "solutions": {
    "optimal": { 
      "patternUsed": "${pattern || 'Best approach'}",
      "timeComplexity": "O(N) - explain why",
      "spaceComplexity": "O(1) or O(N) - explain why",
      "intuition": "Explain how ${pattern || 'this technique'} applies to this problem.",
      "approachSteps": [
        "1. First, we... (explain why this step is needed)",
        "2. Then, we... (explain the logic)",
        "3. Next, we... (continue step-by-step)",
        "4. Continue for 5-8 total steps with clear reasoning"
      ],
      "code": "java code with VERBOSE step-by-step comments explaining WHY each line is there" 
    },
    "better": null,
    "brute": null
  }
}
RULES:
1. CODE MUST BE A SINGLE STRING containing valid Java code with \\n for newlines.
2. CODE must have detailed comments explaining the thought process, not just WHAT but WHY.
3. approachSteps must be 5-8 NUMBERED steps with clear reasoning for each.
4. The solution MUST use ${pattern ? `"${pattern}"` : 'the best approach'} as the primary technique.
5. Ensure the code handles the Edge Cases mentioned above (null checks, empty inputs, bounds, etc).`;
        const solText = await this.callCerebras(solPrompt, 'complex', false);
        return this.parseJSONSafe(solText);
      })();

      // Wait for Hints & Solutions
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Hints/Solutions generation timed out')), 45000)
      );

      try {
        const [hintResult, solResult] = await Promise.race([
          Promise.all([hintPromise, solutionPromise]),
          timeoutPromise
        ]);
        result.hints = hintResult?.hints || [];
        result.solutions = solResult?.solutions || result.solutions;
      } catch (parallelErr) {
        console.error('Parallel hint/solution generation failed:', parallelErr.message);
        // Try to salvage
        try { if (await hintPromise) result.hints = (await hintPromise).hints; } catch {}
        try { if (await solutionPromise) result.solutions = (await solutionPromise).solutions; } catch {}
      }

      const solutionCode = result.solutions?.optimal?.code || null;

      // --- STEP 3: COMPUTE OUTPUTS ---
      try {
        if (solutionCode && edgeCaseInputs.length > 0) {
          console.log(`Step 3: Computing expected outputs for ${edgeCaseInputs.length} edge cases...`);
          result.edgeCases = await this.computeEdgeCaseOutputs(solutionCode, edgeCaseInputs, functionSignature);
        } else if (edgeCaseInputs.length > 0) {
           // We have inputs but no solution code to run them? Return them as is with null expected
           console.warn('No solution code to compute outputs, returning inputs only.');
           result.edgeCases = edgeCaseInputs.map(ec => ({...ec, expectedOutput: null}));
        } else {
           // Fallback: No inputs generated first? Try generating everything (old way fallback)
           console.warn('Edge case generation failed initially, trying fallback generation...');
           result.edgeCases = await this.generateEdgeCases(title, description, examples, constraints, functionSignature);
        }
      } catch (e) { console.error('Edge case output computation failed', e); }

      return result;

    } catch (error) {
      console.error('Error generating problem help:', error);
      throw new Error('Failed to generate problem help: ' + error.message);
    }
  }

  // Generate a company-specific problem (Problem Definition ONLY)
  async generateCompanyProblem(company, topic, pattern, difficulty) {
    try {
      const companyDomains = {
        'Google': ['Search Ranking', 'YouTube Recommendations', 'Maps Navigation', 'Cloud Infrastructure', 'Ads Optimization'],
        'Amazon': ['Warehouse Logistics', 'Prime Delivery', 'Product Recommendations', 'AWS Resource Management', 'Inventory'],
        'Meta': ['News Feed Ranking', 'Friend Suggestions', 'Content Moderation', 'Messenger', 'Instagram Stories'],
        'Apple': ['App Store', 'iCloud Sync', 'Music Recommendations', 'Privacy Features', 'Device Performance'],
        'Microsoft': ['Office 365', 'Azure Cloud', 'Teams Collaboration', 'Windows Updates', 'LinkedIn'],
        'Netflix': ['Content Recommendations', 'Video Streaming', 'A/B Testing', 'Personalization', 'Bandwidth Optimization'],
        'Uber': ['Ride Matching', 'Surge Pricing', 'Driver Allocation', 'Route Optimization', 'ETA Prediction'],
        'default': ['User Analytics', 'System Scaling', 'Data Processing', 'API Design', 'Performance Optimization']
      };
      
      const domains = companyDomains[company] || companyDomains['default'];
      const selectedDomain = domains[Math.floor(Math.random() * domains.length)];

      const prompt = `You are a Senior Technical Interviewer at ${company}.

TASK: Create an AUTHENTIC ${company} interview-style coding problem.

CRITERIA:
- Company: ${company}
- Domain Context: ${selectedDomain}
- Topic: ${topic || 'Any'}
- Pattern: ${pattern || 'Any'}
- Difficulty: ${difficulty}
- SessionID: ${Date.now()}

DESCRIPTION STYLE (CRITICAL - Authentic ${company} Interview Format):
Write the description EXACTLY like ${company} would present in a real interview:
1. Start with: "At ${company}, we..." or "Your team at ${company}..." to set company context
2. Describe a REAL problem ${company} engineers face in ${selectedDomain}
3. Frame it as helping the candidate understand the business value
4. The technical task should flow naturally from the business scenario
5. Sound like an actual interviewer explaining the problem conversationally

EXAMPLE ${company} STYLE:
"At ${company}, your team works on ${selectedDomain}. Recently, users have reported issues with [specific problem]. Your tech lead has asked you to build a solution that [specific task]. This will help us [business value].

Given [input parameters], return [expected output]. You can assume [any assumptions]."

OUTPUT FORMAT - JSON object:
{
  "title": "Creative ${company}-Specific Problem Title",
  "difficulty": "${difficulty}",
  "description": "A 2-3 paragraph ${company} interview-style problem description. First paragraph introduces the ${company} business context. Second paragraph explains the technical challenge. Third paragraph (optional) provides any clarifications.",
  "functionSignature": "public ReturnType methodName(Type1 param1, Type2 param2)",
  "examples": [
    {"input": "param1 = [realistic values], param2 = value", "output": "expectedResult", "explanation": "Brief 2-3 line walkthrough"}
  ],
  "constraints": ["Realistic constraints for ${difficulty} level"],
  "companyContext": "Brief explanation of why ${company} specifically cares about this type of problem"
}

RULES:
1. Scenario MUST authentically relate to ${company}'s actual business domain.
2. ${pattern ? `MUST use the "${pattern}" pattern` : 'Use appropriate algorithmic patterns'}.
3. Sound like a real ${company} interviewer, not an academic problem setter.
4. Provide 3-4 examples with brief, clear explanations.
5. Include realistic constraints for ${difficulty} level.
6. Function signature must be valid Java with meaningful names.
7. Return ONLY valid JSON, no markdown.`;

      console.log('Generating company-specific interview problem with Cerebras:', company);
      const text = await this.callCerebras(prompt, 'fast', true);
      const parsedProblem = this.parseJSONSafe(text);

      // Initialize empty arrays
      parsedProblem.hints = [];
      parsedProblem.solutions = { optimal: null, better: null, brute: null };
      parsedProblem.edgeCases = [];

      return parsedProblem;
    } catch (error) {
      console.error('Error generating company problem:', error);
      throw new Error('Failed to generate company problem');
    }
  }

  // Generate edge cases for a problem (Legacy Wrapper -> Uses Gemini now)
  async generateEdgeCases(title, description, examples = [], constraints = [], functionSignature = null) {
    try {
      console.log('Legacy generateEdgeCases called. Redirecting to Gemini 3.0 generation...');
      // STRICTLY use Gemini for edge cases as per user request
      const inputs = await this.generateEdgeCaseInputs(title, description, examples, constraints, functionSignature);
      
      // Since we don't have solution code here to compute outputs, return inputs with null expectedOutput
      // This is better than hallucinated outputs from Cerebras.
      return inputs.map(input => ({
        ...input,
        expectedOutput: null
      }));

    } catch (error) {
      console.error('Error generating edge cases (Legacy):', error.message);
      return [];
    }
  }

  // Generate edge case INPUTS ONLY (no expected output - will be computed)
  async generateEdgeCaseInputs(title, description, examples = [], constraints = [], functionSignature = null) {
    try {
      const examplesText = examples?.length > 0 
        ? `Examples: ${examples.map((ex, i) => `Input: ${JSON.stringify(ex.input)}`).join(', ')}`
        : '';

      const prompt = `You are an expert software tester. Generate 15 UNIQUE and COMPREHENSIVE test inputs for this coding problem.
      
Problem: ${title}
Function Signature: ${functionSignature || 'solve'}
${examplesText}

REQUIREMENTS:
1.  **Quantity**: Exactly 15 unique test inputs.
2.  **Completeness**: Cover ALL categories:
    *   **Happy Path**: Standard valid inputs.
    *   **Boundary Conditions**: Minimum/Maximum values (as per constraints), Empty inputs, Single elements.
    *   **Edge Cases**: Duplicates, Negative numbers, Sorted/Reverse sorted, All same elements.
    *   **Tricky Cases**: Logic intersections, inputs that might cause overflow or TLE if not handled.
3.  **Format**: Return ONLY a valid JSON array of objects.
4.  **Structure**: Each object MUST have:
    *   \`name\`: Descriptive name (e.g., "Max Value Input", "Empty Array").
    *   \`input\`: The input arguments matching the function signature.
    *   \`category\`: One of "Happy Path", "Boundary", "Edge Case", "Tricky".

JSON FORMAT EXAMPLE:
[
  {"name": "Basic Case", "input": {"nums": [1, 2], "target": 3}, "category": "Happy Path"},
  {"name": "Empty Array", "input": {"nums": [], "target": 0}, "category": "Boundary"}
]

Constraints (Respect these strictly):
${constraints.join('\n')}

DO NOT include expected outputs. DO NOT include markdown code blocks. RETURN RAW JSON ONLY.`;

      console.log('Generating 15 edge case inputs using Gemini 3.0 Flash...');
      
      const { geminiEdgeCaseModel } = require('../config/ai.config');
      
      // Add timeout to prevent infinite spinning - 30 second max
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Gemini API timeout after 30s')), 30000)
      );
      
      const result = await Promise.race([
        geminiEdgeCaseModel.generateContent(prompt),
        timeoutPromise
      ]);
      
      let text = result.response.text();
      
      // Clean up Markdown code blocks if present (Gemini loves to add them)
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      const parsed = this.parseJSONSafe(text);
      
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`Generated ${parsed.length} edge case inputs.`);
        return parsed.filter(c => c && c.input !== undefined);
      }
      
      console.warn('Failed to parse Gemini response or empty array. Raw text:', text.substring(0, 500));
      // Fallback: Return at least one valid input from examples to prevent total failure
      return [{ name: "Example Input", input: examples[0]?.input || {}, category: "Fallback" }];

    } catch (error) {
      console.error('Error generating edge case inputs (Gemini):', error.message);
      // Fallback
      return [{ name: "Example Input", input: examples[0]?.input || {}, category: "Fallback (Error)" }];
    }
  }

  // Compute expected outputs by running solution code (SEQUENTIAL)
  async computeEdgeCaseOutputs(solutionCode, edgeCaseInputs, functionSignature) {
    const codeRunnerService = require('./codeRunner.service');
    
    // Extract method name from function signature
    let methodName = 'solve';
    if (functionSignature) {
      const match = functionSignature.match(/\s+([a-zA-Z0-9_]+)\s*\(/);
      if (match && match[1]) methodName = match[1];
    }

    console.log(`Computing outputs for ${edgeCaseInputs.length} inputs using method: ${methodName} (SEQUENTIAL)`);

    // Wrap solution code in class Solution if not already wrapped
    let wrappedCode = solutionCode;
    if (!solutionCode.includes('class Solution')) {
      wrappedCode = `class Solution {\n${solutionCode}\n}`;
    }

    // Run computations SEQUENTIALLY to prevent OOM on Render Free Tier
    // Running 15 parallel compilations (15 * 128MB) would instantly crash the 512MB server
    const computedCases = [];
    console.log('Starting sequential execution of edge cases...');
    
    for (let i = 0; i < edgeCaseInputs.length; i++) {
        // Increase timeout to 60s (Compile 25s + Run 10s + buffer)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 60000)
        );

        try {
            const testCase = edgeCaseInputs[i];
            const stdin = JSON.stringify({
              method: methodName,
              tests: [{ args: Object.values(testCase.input), expected: null }]
            });

            const result = await Promise.race([
              codeRunnerService.runJava(wrappedCode, stdin),
              timeoutPromise
            ]);
            
            // Parse output
            let expectedOutput = null;
            if (result.stdout) {
              const outputMatch = result.stdout.match(/Test \d+:\s*(.+)/);
              if (outputMatch) {
                const rawOutput = outputMatch[1].trim();
                try {
                  expectedOutput = JSON.parse(rawOutput.replace(/\[/g, '[').replace(/\]/g, ']'));
                } catch {
                  if (rawOutput === 'true') expectedOutput = true;
                  else if (rawOutput === 'false') expectedOutput = false;
                  else if (!isNaN(rawOutput)) expectedOutput = Number(rawOutput);
                  else expectedOutput = rawOutput;
                }
              }
            }
            
            console.log(`[Compute ${i+1}/${edgeCaseInputs.length}] => ${JSON.stringify(expectedOutput)}`);
            
            computedCases.push({
              name: testCase.name || `Test ${i + 1}`,
              input: testCase.input,
              expectedOutput: expectedOutput, // Will be null if parsing failed/timeout
              explanation: `Computed by running the optimal solution.`,
              category: testCase.category || 'Computed'
            });

        } catch (err) {
            console.error(`Failed to compute output for test ${i+1}:`, err.message);
            // Don't add failed cases
        }
    }
    
    // Filter out cases where computation failed or returned null
    const validCases = computedCases.filter(c => c.expectedOutput !== null);
    console.log(`Successfully computed ${validCases.length}/${edgeCaseInputs.length} expected outputs.`);
    
    return validCases.length > 0 ? validCases : computedCases;
  }

  // Generate comprehensive learning notes for a pattern/topic
  async generateLearningNotes(pattern, topic) {
    try {
      const subject = pattern && topic 
        ? `the "${pattern}" pattern applied to "${topic}" problems`
        : pattern 
          ? `the "${pattern}" pattern`
          : `"${topic}" problems`;

      const prompt = `You are a World-Class DSA Coach.

TASK: Generate a complete study guide for: ${subject}.

INSTRUCTIONS (READ CAREFULLY):
1. Generate REAL, SPECIFIC content for ${subject}. Do NOT echo these instructions back.
2. For "whenToUse" - write actual keywords, scenarios, and signals that indicate when to use ${subject}. Examples: "sorted array", "find pair", "O(n) instead of O(n^2)", etc.
3. For "steps" - write 8-10 actual implementation steps with specific details.
4. For "exampleProblems" - pick REAL LeetCode problems like "Two Sum", "3Sum", "Container With Most Water" etc.
5. For "code" - write COMPLETE working Java code with detailed comments.
6. NO MARKDOWN formatting. No **bold** or *italic*.
7. Code must be a SINGLE STRING with \\\\n for newlines.

OUTPUT: Return ONLY a valid JSON object with this structure (replace placeholders with REAL content):

{
  "title": "Mastering ${subject}",
  "overview": "<300+ words explaining what ${subject} is, why it works, and a memorable analogy>",
  "whenToUse": [
    "<First point: A comprehensive checklist of ALL keywords/signals that indicate ${subject}. E.g. 'sorted array', 'find pair with sum', 'opposite ends', etc.>",
    "<Scenario 1>",
    "<Scenario 2>",
    "<Scenario 3>",
    "<Signal 1>",
    "<Signal 2>",
    "<Signal 3>",
    "<Signal 4>",
    "<Anti-pattern 1: When NOT to use>",
    "<Anti-pattern 2>"
  ],
  "complexity": {
    "time": "<O(?) with explanation specific to ${subject}>",
    "space": "<O(?) with explanation>",
    "bestCase": "<description>",
    "worstCase": "<description>"
  },
  "coreApproach": {
    "intuition": "<Multi-paragraph explanation with a specific analogy for ${subject}>",
    "steps": ["<Step 1 with why>", "<Step 2>", "...", "<Step 8-10>"],
    "pseudocode": "<Python-style pseudocode specific to ${subject}>",
    "edgeCases": ["<Edge case 1 with handling>", "<Edge case 2>", "..."]
  },
  "exampleProblems": [
    {
      "name": "<Real LeetCode problem 1 - Easy level>",
      "difficulty": "Easy",
      "companies": ["<Company1>", "<Company2>"],
      "description": "<Full problem statement>",
      "intuition": "<Why this pattern is perfect for this problem>",
      "approach": "<DETAILED step-by-step explanation: 1. First we... 2. Then we... 3. This works because... Include WHY each step is needed>",
      "code": "<Complete Java code with detailed comments explaining each line>"
    },
    {
      "name": "<Real LeetCode problem 2 - Medium level>",
      "difficulty": "Medium",
      "companies": ["<Company1>", "<Company2>"],
      "description": "<Full problem statement>",
      "intuition": "<The twist that makes this harder than problem 1>",
      "approach": "<DETAILED step-by-step explanation of the solution logic. Walk through an example input.>",
      "code": "<Complete Java code with detailed comments>"
    },
    {
      "name": "<Real LeetCode problem 3 - Medium/Hard level>",
      "difficulty": "Hard",
      "companies": ["<Company1>", "<Company2>"],
      "description": "<Full problem statement>",
      "intuition": "<Why this is the most challenging variation>",
      "approach": "<DETAILED step-by-step explanation. Explain how to adapt the pattern for this complex case.>",
      "code": "<Complete Java code with detailed comments>"
    }
  ],
  "commonMistakes": [
    "<Mistake 1: description -> Fix: solution>",
    "<Mistake 2>",
    "<Mistake 3>",
    "<Mistake 4>",
    "<Mistake 5>"
  ],
  "proTips": [
    "<Tip 1>",
    "<Tip 2>",
    "<Tip 3>",
    "<Tip 4>",
    "<Tip 5>"
  ]
}

CRITICAL: Replace ALL <placeholders> with REAL content about ${subject}. Do NOT return the angle brackets or placeholder text.`;

      console.log('Generating detailed learning notes with Cerebras (Llama-3.3-70b)...');
      const text = await this.callCerebras(prompt, 'complex', true); // Heavy reasoning
      return this.parseJSONSafe(text);
    } catch (error) {
      console.error('Error generating learning notes:', error);
      throw new Error('Failed to generate learning notes');
    }
  }

  // ============================================================
  // NEW: Generate 20 Test Cases using Cerebras ONLY
  // ============================================================
  async generateTestCases(title, description, constraints = [], functionSignature = null) {
    try {
      const prompt = `You are an expert software tester. Generate exactly 20 HIGH-QUALITY test cases for this coding problem.

Problem: ${title}
Description: ${typeof description === 'string' ? description : description?.description || ''}
Function Signature: ${functionSignature || 'solve(...)'}
Constraints: ${constraints.join(', ') || 'Standard constraints'}

REQUIREMENTS:
1. Generate EXACTLY 20 unique test cases
2. Cover ALL categories:
   - Happy Path (5 cases): Standard valid inputs
   - Boundary (5 cases): Min/Max values, empty inputs, single elements
   - Edge Cases (5 cases): Duplicates, negatives, sorted/reverse, all same
   - Tricky (5 cases): Logic edge cases, potential overflow, corner cases

OUTPUT FORMAT - JSON array:
[
  {"name": "Basic Case 1", "input": {"nums": [1,2,3], "target": 5}, "expected": 2, "category": "Happy Path"},
  {"name": "Empty Array", "input": {"nums": [], "target": 0}, "expected": -1, "category": "Boundary"}
]

RULES:
1. Input should match function parameters
2. Expected should be the correct output for each input
3. Use realistic values based on constraints
4. Return ONLY valid JSON array, no markdown`;

      console.log('Generating 20 test cases with Cerebras...');
      const text = await this.callCerebras(prompt, 'complex', true);
      const parsed = this.parseJSONSafe(text);
      
      if (Array.isArray(parsed)) {
        console.log(`Generated ${parsed.length} test cases.`);
        return parsed;
      }
      
      return [];
    } catch (error) {
      console.error('Error generating test cases:', error);
      return [];
    }
  }

  // ============================================================
  // NEW: Generate Solution & Hints using Cerebras ONLY
  // ============================================================
  async generateSolutionOnly(title, description, difficulty = 'Medium', functionSignature = null, testCases = []) {
    try {
      const testCaseContext = testCases.length > 0 
        ? `\n\nTest Cases to handle:\n${JSON.stringify(testCases.slice(0, 5), null, 2)}`
        : '';

      const prompt = `You are a FAANG Senior Engineer providing interview coaching.

TASK: Generate hints and an optimal solution for this problem.

Problem: "${title}"
Difficulty: ${difficulty}
Description: ${typeof description === 'string' ? description : description?.description || ''}
Function Signature: ${functionSignature || 'N/A'}
${testCaseContext}

OUTPUT FORMAT - JSON object:
{
  "hints": [
    "Hint 1: Start by thinking about...",
    "Hint 2: Consider using...",
    "Hint 3: The key insight is...",
    "Hint 4: For optimization...",
    "Hint 5: Edge case to watch..."
  ],
  "solution": {
    "approach": "Brief 2-3 sentence description of the approach",
    "timeComplexity": "O(n) - explanation",
    "spaceComplexity": "O(1) - explanation",
    "code": "public class Solution {\\n    public int methodName(int[] nums) {\\n        // Complete working Java code\\n    }\\n}"
  }
}

RULES:
1. Generate 5 progressive hints (vague to specific)
2. Solution code must be complete, working Java
3. Code must handle all edge cases
4. Use \\n for newlines in code
5. Return ONLY valid JSON`;

      console.log('Generating solution with Cerebras...');
      const text = await this.callCerebras(prompt, 'complex', true);
      return this.parseJSONSafe(text);
    } catch (error) {
      console.error('Error generating solution:', error);
      throw new Error('Failed to generate solution');
    }
  }

  // Helper for safe JSON parsing
  parseJSONSafe(text) {
    let clean = text.trim();
    if (clean.startsWith('```json')) clean = clean.slice(7);
    if (clean.startsWith('```')) clean = clean.slice(3);
    if (clean.endsWith('```')) clean = clean.slice(0, -3);
    clean = clean.trim();

    // Check for Array first
    const startArr = clean.indexOf('[');
    const endArr = clean.lastIndexOf(']');
    
    // Check for Object
    const startObj = clean.indexOf('{');
    const endObj = clean.lastIndexOf('}');

    // If it looks like an array (and array starts before object or no object exists)
    if (startArr !== -1 && endArr !== -1 && (startObj === -1 || startArr < startObj)) {
      return JSON.parse(clean.substring(startArr, endArr + 1));
    }

    // Otherwise treat as Object
    if (startObj !== -1 && endObj !== -1) {
      return JSON.parse(clean.substring(startObj, endObj + 1));
    }

    // Fallback: try parsing the whole thing
    return JSON.parse(clean);
  }
}

module.exports = new AIService();
