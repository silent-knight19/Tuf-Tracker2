const { cerebrasClient, models, rateLimiter } = require('../config/ai.config');

class AIService {
  
  // Helper to make Cerebras API calls
  async callCerebras(prompt, modelType = 'fast', jsonMode = true) {
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

  // Generate hints, solutions, AND edge cases for a problem (PARALLEL Strategy)
  async generateProblemHelp(title, description, difficulty, pattern = null, examples = [], constraints = [], functionSignature = null) {
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

      // --- STEP 1 & 2: GENERATE HINTS AND SOLUTIONS IN PARALLEL ---
      const hintPromise = (async () => {
        console.log('Generating Hints...');
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
        console.log('Generating Solutions...');
        const solPrompt = `You are a FAANG Interviewer.${patternRequirement}

TASK: Provide the OPTIMAL solution for this problem.
${problemContext}

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
4. The solution MUST use ${pattern ? `"${pattern}"` : 'the best approach'} as the primary technique.`;
        const solText = await this.callCerebras(solPrompt, 'complex', false);
        return this.parseJSONSafe(solText);
      })();

      // Wait for both in parallel with 45-second timeout
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
        // Try to salvage whichever completed
        try {
          const hintJson = await Promise.race([hintPromise, Promise.resolve(null)]);
          if (hintJson?.hints) result.hints = hintJson.hints;
        } catch {}
        try {
          const solJson = await Promise.race([solutionPromise, Promise.resolve(null)]);
          if (solJson?.solutions) result.solutions = solJson.solutions;
        } catch {}
      }

      const solutionCode = result.solutions?.optimal?.code || null;

      // --- STEP 3: GENERATE EDGE CASES WITH COMPUTED OUTPUTS ---
      try {
        console.log('Generating Edge Cases...');
        const edgeCaseInputs = await this.generateEdgeCaseInputs(title, description, examples, constraints, functionSignature);
        
        if (solutionCode && edgeCaseInputs.length > 0) {
          console.log(`Computing expected outputs for ${edgeCaseInputs.length} edge cases...`);
          result.edgeCases = await this.computeEdgeCaseOutputs(solutionCode, edgeCaseInputs, functionSignature);
        } else {
          // Fallback: use AI-generated edge cases if no solution code available
          console.warn('No solution code available, using AI-generated edge cases...');
          result.edgeCases = await this.generateEdgeCases(title, description, examples, constraints, functionSignature);
        }
      } catch (e) { console.error('Edge case generation failed', e); }

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

  // Generate edge cases for a problem
  async generateEdgeCases(title, description, examples = [], constraints = [], functionSignature = null) {
    try {
      const descriptionText = description ? `\nProblem Description: ${typeof description === 'string' ? description : description.description || ''}` : '';
      const constraintsText = constraints?.length > 0 ? `\nConstraints:\n${constraints.map(c => `- ${c}`).join('\n')}` : '';
      const examplesText = examples?.length > 0 ? `\nExamples:\n${examples.map((ex, i) => `Example ${i+1}: Input: ${JSON.stringify(ex.input)}, Output: ${JSON.stringify(ex.output || ex.expectedOutput)}`).join('\n')}` : '';
      
      const categories = [
        "Happy Path (Basic valid inputs)",
        "Boundary Conditions (Min/Max/Empty constraints)",
        "Edge Cases (Duplicates, negative numbers, sorted/reverse orders)",
        "Corner Cases (Tricky logic intersections)",
        "Stress Test (Small inputs that mimic large scale logic)"
      ];

      console.log(`Generating 25 edge cases in 5 parallel batches (Qwen-3-235b)...`);

      // Helper to generate for a single category
      const fetchCategory = async (category) => {
        const prompt = `Generate 5 test cases for "${category}".

Problem: ${title}
Function: ${functionSignature || 'solve'}
${examplesText}

Return ONLY a valid JSON array. No commentary. Example format:
[{"name":"test","input":{"nums":[1,2],"target":3},"expectedOutput":[0,1],"explanation":"reason","category":"${category}"}]
`;
        try {
          // Qwen-3 has issues with JSON mode, use text mode instead
          const text = await this.callCerebras(prompt, 'complex', false);
          console.log(`[EdgeCase ${category}] Raw Response Length: ${text?.length || 0}`);
          const parsed = this.parseJSONSafe(text);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log(`[EdgeCase ${category}] Parsed ${parsed.length} cases.`);
            return parsed;
          }
          console.warn(`[EdgeCase ${category}] Parsed 0 cases. Raw:`, text?.slice(0, 200));
          return [];
        } catch (e) {
          console.error(`[EdgeCase ${category}] FAIL:`, e.message);
          return [];
        }
      };

      // Run batches in PARALLEL for faster response
      const batchResults = await Promise.all(categories.map(cat => fetchCategory(cat)));
      let allCases = batchResults.flat();
      
      // Filter out invalid ones
      allCases = allCases.filter(c => c && c.input !== undefined && c.expectedOutput !== undefined);

      // Fallback if total is low
      if (allCases.length < 5) {
         console.warn('Batch generation failed. Running fallback...');
         allCases.push(
            { name: "Simple Case", input: examples[0]?.input || [1,2], expectedOutput: examples[0]?.output || 3, explanation: "Fallback", category: "Basic" }
         );
      }

      console.log(`Successfully generated ${allCases.length} edge cases.`);
      return allCases;

    } catch (error) {
      console.error('Error generating edge cases:', error.message);
      return [];
    }
  }

  // Generate edge case INPUTS ONLY (no expected output - will be computed)
  async generateEdgeCaseInputs(title, description, examples = [], constraints = [], functionSignature = null) {
    try {
      const examplesText = examples?.length > 0 
        ? `Examples: ${examples.map((ex, i) => `Input: ${JSON.stringify(ex.input)}`).join(', ')}`
        : '';

      const prompt = `Generate 15 unique test inputs for this problem. Do NOT include expected outputs.

Problem: ${title}
Function: ${functionSignature || 'solve'}
${examplesText}

RULES:
1. Generate diverse inputs covering: basic, boundary (empty, single element, max size), edge cases (duplicates, negative).
2. Input format must match the function signature.
3. Return ONLY a JSON array. No commentary.

Format: [{"name":"TestName","input":{...},"category":"Category"}]
`;

      console.log('Generating 15 edge case inputs (no expected outputs)...');
      const text = await this.callCerebras(prompt, 'complex', false);
      const parsed = this.parseJSONSafe(text);
      
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`Generated ${parsed.length} edge case inputs.`);
        return parsed.filter(c => c && c.input !== undefined);
      }
      
      console.warn('Failed to generate inputs, using example as fallback.');
      return [{ name: "Example Input", input: examples[0]?.input || {}, category: "Basic" }];

    } catch (error) {
      console.error('Error generating edge case inputs:', error.message);
      return [];
    }
  }

  // Compute expected outputs by running solution code (PARALLEL)
  async computeEdgeCaseOutputs(solutionCode, edgeCaseInputs, functionSignature) {
    const codeRunnerService = require('./codeRunner.service');
    
    // Extract method name from function signature
    let methodName = 'solve';
    if (functionSignature) {
      const match = functionSignature.match(/\s+([a-zA-Z0-9_]+)\s*\(/);
      if (match && match[1]) methodName = match[1];
    }

    console.log(`Computing outputs for ${edgeCaseInputs.length} inputs using method: ${methodName} (PARALLEL)`);

    // Wrap solution code in class Solution if not already wrapped
    let wrappedCode = solutionCode;
    if (!solutionCode.includes('class Solution')) {
      wrappedCode = `class Solution {\n${solutionCode}\n}`;
    }

    // Helper function to compute output for a single test case with timeout
    const computeOne = async (testCase, index) => {
      try {
        const stdin = JSON.stringify({
          method: methodName,
          tests: [{ args: Object.values(testCase.input), expected: null }]
        });

        // Timeout: 10 seconds per test case
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        );
        
        const result = await Promise.race([
          codeRunnerService.runJava(wrappedCode, stdin),
          timeoutPromise
        ]);
        
        // Parse output to extract the computed value
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
        
        console.log(`[Compute ${index+1}/${edgeCaseInputs.length}] => ${JSON.stringify(expectedOutput)}`);
        
        return {
          name: testCase.name || `Test ${index + 1}`,
          input: testCase.input,
          expectedOutput: expectedOutput,
          explanation: `Computed by running the optimal solution.`,
          category: testCase.category || 'Computed'
        };
        
      } catch (err) {
        console.error(`Failed to compute output for test ${index+1}:`, err.message);
        return {
          name: testCase.name || `Test ${index + 1}`,
          input: testCase.input,
          expectedOutput: null,
          explanation: `Could not compute: ${err.message}`,
          category: testCase.category || 'Error'
        };
      }
    };

    // Run all computations in PARALLEL
    const computedCases = await Promise.all(
      edgeCaseInputs.map((testCase, i) => computeOne(testCase, i))
    );
    
    // Filter out cases with null outputs
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
