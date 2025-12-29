const { model, rateLimiter } = require('../config/ai.config');

class AIService {
  // Analyze a problem using AI
  async analyzeProblem(title, platform = 'LeetCode', url = '') {
    try {
      await rateLimiter.checkAndWait();

      // Gemma 3 Optimized Prompt
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

EXAMPLE:
{
  "title": "Two Sum",
  "difficulty": "Easy",
  "topics": ["Array", "Hash Table"],
  "patterns": ["Hash Map / Hash Set"],
  "companies": ["Google", "Amazon", "Meta", "Apple", "Microsoft"],
  "platform": "LeetCode",
  "platformUrl": "https://leetcode.com/problems/two-sum"
}

ALLOWED PATTERNS (choose from this list only):
Two Pointers, Sliding Window, Fast & Slow Pointers, Prefix Sum, Kadane Pattern, Cyclic Sort, Hash Map / Hash Set, Binary Search, Binary Search on Answer, DFS, BFS, Tree BFS, Tree DFS, Graph Traversal, Topological Sort, Union Find, 0/1 Knapsack DP, Unbounded Knapsack DP, Subsequence DP, Partition DP / Subset DP, Grid DP, Subsets, Permutations, Combination Sum Variants, Monotonic Stack, Stack, Min Heap / Max Heap, Two Heaps Pattern, Linked List Patterns, Trie + String Matching

RULES:
1. Return ONLY valid JSON - no markdown, no extra text
2. Use standard CS topic names for topics
3. Include known companies that ask this problem
4. Start response with { and end with }

{`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Clean the response (remove markdown code blocks if present)
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.slice(7);
      }
      if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.slice(3);
      }
      if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.slice(0, -3);
      }

      const parsedData = JSON.parse(cleanedText.trim());

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
      
      // Fallback to basic analysis
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
      await rateLimiter.checkAndWait();

      // Gemma 3 Optimized Prompt
      const prompt = `You are a concise technical writer summarizing problem-solving notes.

TASK: Extract key takeaways from these notes in bullet point format.

NOTES:
${notes}

OUTPUT FORMAT:
• Main approach used
• Key insight or trick
• Complexity (if mentioned)
• Common pitfall to avoid

EXAMPLE OUTPUT:
• Used two pointers from both ends of sorted array
• Key insight: leverage sorted property to avoid nested loops
• O(n) time, O(1) space
• Don't forget to handle duplicates

RULES:
1. Maximum 4 bullet points
2. Use • symbol for bullets
3. Be concise - one line per point
4. Skip if not mentioned in notes

•`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error summarizing notes:', error);
      return 'Summary unavailable';
    }
  }

  // Detect weaknesses from problem history
  async detectWeaknesses(problemHistory) {
    try {
      await rateLimiter.checkAndWait();

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
          difficultyStats[problem.difficulty]++;
        }
      });

      // Gemma 3 Optimized Prompt
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

EXAMPLE:
{
  "weakTopics": ["Graph", "Tree", "Dynamic Programming"],
  "weakPatterns": ["DFS", "BFS", "Grid DP"],
  "recommendations": ["Practice more graph traversal problems", "Focus on tree recursion", "Start with easy DP problems"],
  "difficultyAdvice": "Good Medium practice, but increase Hard problems to 20%"
}

RULES:
1. Identify topics/patterns with ZERO or LOW counts as weak
2. Provide 3 actionable recommendations
3. Return ONLY valid JSON
4. Start with { and end with }

{`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) cleanedText = cleanedText.slice(7);
      if (cleanedText.startsWith('```')) cleanedText = cleanedText.slice(3);
      if (cleanedText.endsWith('```')) cleanedText = cleanedText.slice(0, -3);

      return JSON.parse(cleanedText.trim());
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
      await rateLimiter.checkAndWait();

      // Gemma 3 Optimized Prompt
      const prompt = `You are a LeetCode problem curator suggesting practice problems.

TASK: Suggest 5 related problems similar to "${problemTitle}".

CONTEXT:
- Topics: ${topics.join(', ') || 'General'}
- Patterns: ${patterns.join(', ') || 'General'}

OUTPUT FORMAT - JSON array with 5 objects:
[
  {"title": "Problem Name", "reason": "Brief similarity explanation", "difficulty": "Easy|Medium|Hard"}
]

EXAMPLE:
[
  {"title": "3Sum", "reason": "Uses same two-pointer approach", "difficulty": "Medium"},
  {"title": "Container With Most Water", "reason": "Similar array traversal pattern", "difficulty": "Medium"}
]

RULES:
1. Suggest real LeetCode problems only
2. Mix difficulties (1-2 Easy, 2-3 Medium, 1 Hard)
3. Keep reasons under 10 words
4. Return ONLY valid JSON array
5. Start with [ and end with ]

[`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) cleanedText = cleanedText.slice(7);
      if (cleanedText.startsWith('```')) cleanedText = cleanedText.slice(3);
      if (cleanedText.endsWith('```')) cleanedText = cleanedText.slice(0, -3);

      return JSON.parse(cleanedText.trim());
    } catch (error) {
      console.error('Error suggesting related problems:', error);
      return [];
    }
  }

  // Generate comprehensive study notes for a problem
  async generateStudyNotes(title, platform = 'LeetCode', url = '', difficulty = 'Medium', topics = [], patterns = []) {
    try {
      await rateLimiter.checkAndWait();

      // Gemma 3 Optimized Prompt
      const prompt = `You are an expert DSA tutor creating study notes for "${title}" (${difficulty}).

TASK: Create comprehensive study guide with solutions at different optimization levels.

OUTPUT FORMAT - JSON object:
{
  "understanding": "Clear explanation of what the problem asks (2-3 sentences)",
  "bruteForce": {
    "explanation": "Why this naive approach works",
    "code": "Clean Java code (no markdown)",
    "complexity": "O(n²) Time | O(1) Space"
  },
  "better": {
    "explanation": "Optimization insight or null",
    "code": "Improved Java code or null",
    "complexity": "O(n log n) Time | O(n) Space or null"
  },
  "optimal": {
    "explanation": "Key insight that makes this optimal",
    "code": "Best Java solution (no markdown)",
    "complexity": "O(n) Time | O(1) Space"
  },
  "takeaways": "- Key insight 1\\n- Key insight 2\\n- Common mistake to avoid"
}

CODE RULES:
1. Use class Solution { public returnType methodName(...) { } } format
2. 4-space indentation, proper Java syntax
3. NO markdown backticks - pure Java only
4. Use \\n for newlines in strings

CONTENT RULES:
1. Write naturally like explaining to a friend
2. Keep explanations clear and jargon-free
3. Use null for "better" if problem has only brute→optimal path
4. Escape special characters properly for valid JSON

Start response with { and end with }

{`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Clean up markdown code blocks if present
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) cleanedText = cleanedText.slice(7);
      if (cleanedText.startsWith('```')) cleanedText = cleanedText.slice(3);
      if (cleanedText.endsWith('```')) cleanedText = cleanedText.slice(0, -3);

      try {
        const parsedData = JSON.parse(cleanedText.trim());
        return parsedData;
      } catch (e) {
        console.error('Failed to parse AI response:', cleanedText);
        throw new Error('AI response was not valid JSON');
      }
    } catch (error) {
      console.error('Error generating study notes:', error);
      if (error.response) {
        console.error('AI API Error Details:', JSON.stringify(error.response, null, 2));
      }
      throw new Error(`Failed to generate study notes: ${error.message}`);
    }
  }

  // Generate comprehensive problem description with examples and constraints
  async generateProblemDescription(title, platform = 'LeetCode', difficulty = 'Medium', topics = [], patterns = []) {
    try {
      await rateLimiter.checkAndWait();

      // Gemma 3 Optimized Prompt
      const prompt = `You are a LeetCode problem author creating problem descriptions.

TASK: Create a complete problem description for "${title}" (${difficulty}).

OUTPUT FORMAT - JSON object:
{
  "description": "Clear problem statement (2-3 sentences)",
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
1. Create 2-3 realistic examples
2. Include 2-4 constraints matching difficulty
3. Function signature must be valid Java
4. Plain text only - no markdown in strings
5. Return ONLY valid JSON
6. Start with { end with }

{`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Clean up markdown code blocks if present
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) cleanedText = cleanedText.slice(7);
      if (cleanedText.startsWith('```')) cleanedText = cleanedText.slice(3);
      if (cleanedText.endsWith('```')) cleanedText = cleanedText.slice(0, -3);

      return JSON.parse(cleanedText.trim());
    } catch (error) {
      console.error('Error generating problem description:', error);
      throw new Error('Failed to generate problem description. Please try again.');
    }
  }
  // Generate a similar but new problem based on an existing one
  async generateSimilarProblem(originalTitle, difficulty, topics = [], patterns = []) {
    try {
      await rateLimiter.checkAndWait();

      // Gemma 3 Optimized Prompt
      const prompt = `You are a coding interview question designer creating variations.

TASK: Create a NEW problem testing the same concepts as "${originalTitle}" but with different context.

CONTEXT:
- Original: ${originalTitle} (${difficulty})
- Topics: ${topics.join(', ') || 'General'}
- Patterns: ${patterns.join(', ') || 'General'}

OUTPUT FORMAT - JSON object:
{
  "title": "Creative New Problem Title",
  "difficulty": "${difficulty}",
  "description": "Clear problem statement with new scenario",
  "functionSignature": "public returnType methodName(params)",
  "examples": [{"input": "param = value", "output": "result", "explanation": "why"}],
  "constraints": ["constraint1", "constraint2"],
  "hints": ["Think about...", "Consider using..."]
}

RULES:
1. DIFFERENT scenario/story from original (e.g., arrays→sensor data)
2. SAME underlying algorithm/pattern
3. Do NOT mention the original problem name
4. 2-3 examples, 2-4 constraints, 2 hints
5. Valid Java function signature
6. Return ONLY JSON - start with { end with }

{`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) cleanedText = cleanedText.slice(7);
      if (cleanedText.startsWith('```')) cleanedText = cleanedText.slice(3);
      if (cleanedText.endsWith('```')) cleanedText = cleanedText.slice(0, -3);

      return JSON.parse(cleanedText.trim());
    } catch (error) {
      console.error('Error generating similar problem:', error);
      throw new Error('Failed to generate similar problem');
    }
  }

  // Generate a new problem based on specific criteria (Pattern/Topic)
  async generateProblemFromCriteria(pattern, topic, difficulty) {
    try {
      await rateLimiter.checkAndWait();

      // Gemma 3 Optimized Prompt
      const prompt = `You are a competitive programming problem author.

TASK: Create a BRAND NEW coding problem based on these criteria.

CRITERIA:
- Pattern: ${pattern || 'Any'}
- Topic: ${topic || 'Any'}
- Difficulty: ${difficulty}

OUTPUT FORMAT - JSON object:
{
  "title": "Creative Problem Title",
  "difficulty": "${difficulty}",
  "description": "Clear problem statement with realistic scenario",
  "functionSignature": "public int solve(int[] nums)",
  "examples": [
    {"input": "nums = [1,2,3]", "output": "6", "explanation": "Sum of all elements"}
  ],
  "constraints": ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
  "hints": ["Hint about approach", "Hint about optimization"]
}

EXAMPLE (for Two Pointers + Array + Medium):
{
  "title": "Container With Most Water",
  "difficulty": "Medium",
  "description": "Given n non-negative integers representing heights, find two lines that together with the x-axis form a container that holds the most water.",
  "functionSignature": "public int maxArea(int[] height)",
  "examples": [{"input": "height = [1,8,6,2,5,4,8,3,7]", "output": "49", "explanation": "Lines at indices 1 and 8"}],
  "constraints": ["2 <= height.length <= 10^5", "0 <= height[i] <= 10^4"],
  "hints": ["Start from both ends", "Move the shorter line inward"]
}

RULES:
1. MUST use the specified pattern ${pattern ? `(${pattern})` : ''}
2. NOT a direct copy of famous LeetCode problems
3. Realistic scenario that makes sense
4. Valid Java function signature
5. Return ONLY JSON - start with { end with }

{`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Log the raw response for debugging
      console.log('Raw AI response length:', text.length);
      console.log('Raw AI response preview:', text.substring(0, 200));

      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) cleanedText = cleanedText.slice(7);
      if (cleanedText.startsWith('```')) cleanedText = cleanedText.slice(3);
      if (cleanedText.endsWith('```')) cleanedText = cleanedText.slice(0, -3);
      cleanedText = cleanedText.trim();

      // Additional validation
      if (!cleanedText || cleanedText.length < 10) {
        console.error('AI response too short or empty');
        throw new Error('AI response was empty or too short');
      }

      try {
        const parsed = JSON.parse(cleanedText);
        
        // Validate the structure
        if (!parsed.title || !parsed.description || !parsed.examples) {
          console.error('AI response missing required fields:', Object.keys(parsed));
          throw new Error('AI response missing required fields');
        }
        
        // Add the pattern and topic to the response so it's available for solutions
        parsed.pattern = pattern || null;
        parsed.topic = topic || null;
        
        return parsed;
      } catch (parseError) {
        console.error('JSON parse error:', parseError.message);
        console.error('Cleaned text that failed to parse:', cleanedText.substring(0, 500));
        throw parseError;
      }

    } catch (error) {
      console.error('Error generating problem from criteria:', error);
      throw new Error('Failed to generate problem from criteria: ' + error.message);
    }
  }
  // Generate hints and solutions for a problem
  async generateProblemHelp(title, description, difficulty, pattern = null) {
    try {
      await rateLimiter.checkAndWait();

      // Build pattern-specific requirements if a pattern is specified
      const patternRequirement = pattern 
        ? `\n\nCRITICAL REQUIREMENT: The OPTIMAL solution MUST use the "${pattern}" pattern/technique. This is mandatory.`
        : '';
      const patternHint = pattern ? `\nNote: Solve using "${pattern}" approach.` : '';

      // Gemma 3 Optimized Prompt
      const prompt = `You are a senior FAANG interviewer creating solution guides.

TASK: Provide hints and solutions for this problem.${patternRequirement}

PROBLEM:
- Title: "${title}"
- Difficulty: ${difficulty}${patternHint}
- Description: ${description}

OUTPUT FORMAT - JSON object:
{
  "hints": ["Hint 1 (subtle)", "Hint 2", "...", "Hint 10 (specific)"],
  "solutions": {
    "optimal": {
      "complexity": "O(n) Time | O(1) Space",
      "explanation": "Clear explanation of approach and intuition",
      "code": "class Solution { public int solve() { } }"
    },
    "better": {"complexity": "...", "explanation": "...", "code": "..."} or null,
    "brute": {"complexity": "...", "explanation": "...", "code": "..."} or null
  }
}

EXAMPLE:
{
  "hints": ["Think about the data structure", "What if you preprocessed?", "Consider a hash map"],
  "solutions": {
    "optimal": {
      "complexity": "O(n) Time | O(n) Space",
      "explanation": "Use a hash map to store seen values and check for complement in O(1).",
      "code": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[]{map.get(complement), i};\n            }\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}"
    },
    "brute": null
  }
}

RULES:
1. "optimal" is REQUIRED - always provide complete solution
2. 10 progressive hints (subtle to specific)
3. Clean Java code without markdown backticks
4. Use \\n for newlines in code strings
5. Return ONLY valid JSON - start with { end with }

{`;

      console.log('Generating problem help for:', title);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('Raw AI response length:', text.length);
      console.log('Raw AI response preview:', text.substring(0, 300));

      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) cleanedText = cleanedText.slice(7);
      if (cleanedText.startsWith('```')) cleanedText = cleanedText.slice(3);
      if (cleanedText.endsWith('```')) cleanedText = cleanedText.slice(0, -3);
      cleanedText = cleanedText.trim();

      // Try to find JSON object in the response
      const jsonStart = cleanedText.indexOf('{');
      const jsonEnd = cleanedText.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
      }

      const parsed = JSON.parse(cleanedText);
      
      // Validate that optimal solution exists
      if (!parsed.solutions || !parsed.solutions.optimal) {
        console.error('AI response missing optimal solution:', JSON.stringify(parsed.solutions, null, 2));
        throw new Error('AI did not return optimal solution');
      }
      
      console.log('Successfully parsed problem help with optimal solution');
      return parsed;
    } catch (error) {
      console.error('Error generating problem help:', error);
      throw new Error('Failed to generate problem help: ' + error.message);
    }
  }

  // Generate a company-specific problem
  async generateCompanyProblem(company, topic, pattern, difficulty) {
    try {
      await rateLimiter.checkAndWait();

      // Gemma 3 Optimized Prompt
      const prompt = `You are a technical interviewer at ${company} creating interview problems.

TASK: Create a realistic ${company}-style coding interview problem.

CRITERIA:
- Company: ${company}
- Topic: ${topic || 'Any'}
- Pattern: ${pattern || 'Any'}
- Difficulty: ${difficulty}

COMPANY CONTEXT:
- Google: Search, indexing, distributed systems, scale
- Amazon: E-commerce, logistics, cloud, optimization
- Meta: Social graphs, feeds, real-time systems
- Microsoft: Enterprise, productivity, infrastructure
- Uber: Maps, routing, matching, real-time

OUTPUT FORMAT - JSON object:
{
  "title": "${company}-Style Problem Title",
  "difficulty": "${difficulty}",
  "description": "Problem with ${company}-relevant scenario",
  "functionSignature": "public returnType methodName(params)",
  "examples": [{"input": "param = value", "output": "result", "explanation": "why"}],
  "constraints": ["constraint1", "constraint2"],
  "hints": ["Hint 1", "Hint 2"],
  "companyContext": "Why ${company} cares about this"
}

RULES:
1. Scenario MUST relate to ${company}'s domain
2. Solvable in 45 minutes
3. 2-3 examples, 2-4 constraints
4. Valid Java function signature
5. Return ONLY JSON - start with { end with }

{`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) cleanedText = cleanedText.slice(7);
      if (cleanedText.startsWith('```')) cleanedText = cleanedText.slice(3);
      if (cleanedText.endsWith('```')) cleanedText = cleanedText.slice(0, -3);

      return JSON.parse(cleanedText.trim());
    } catch (error) {
      console.error('Error generating company problem:', error);
      throw new Error('Failed to generate company problem');
    }
  }

  // Generate edge cases for a problem
  async generateEdgeCases(title, description, examples = [], constraints = [], functionSignature = null) {
    try {
      await rateLimiter.checkAndWait();

      // Build context from provided information
      const descriptionText = description ? `\nProblem Description: ${typeof description === 'string' ? description : description.description || ''}` : '';
      const constraintsText = constraints?.length > 0 ? `\nConstraints:\n${constraints.map(c => `- ${c}`).join('\n')}` : '';
      const examplesText = examples?.length > 0 ? `\nExamples:\n${examples.map((ex, i) => `Example ${i+1}: Input: ${JSON.stringify(ex.input)}, Output: ${JSON.stringify(ex.output)}`).join('\n')}` : '';

      // HIGH-QUALITY EDGE CASE GENERATION WITH ANSWER VERIFICATION
      const prompt = `You are an expert competitive programmer and test case designer.

PROBLEM TO TEST:
Title: "${title}"
${functionSignature ? `Function: ${functionSignature}` : ''}
${descriptionText}
${constraintsText}
${examplesText}

YOUR TASK: Generate 15 HIGH-QUALITY test cases that thoroughly test this problem.

STEP 1 - UNDERSTAND THE PROBLEM:
- Read the problem description carefully
- Identify the INPUT format and types
- Identify the OUTPUT format and expected behavior
- Note any edge cases mentioned in constraints

STEP 2 - COMPUTE EXPECTED OUTPUT CORRECTLY:
For EACH test case you generate:
1. Write down the input
2. MANUALLY TRACE through the algorithm step-by-step
3. Compute the EXACT expected output
4. VERIFY your answer makes sense
5. If you cannot compute the answer with 100% confidence, set expectedOutput to null

REQUIRED TEST CATEGORIES (generate at least 2 from each):

1. BOUNDARY TESTS:
   - Empty input ([], "", 0)
   - Single element [x]
   - Two elements [x, y]
   - Maximum constraint values

2. EDGE CASES:
   - All same values [5,5,5,5]
   - Sorted ascending [1,2,3,4,5]
   - Sorted descending [5,4,3,2,1]
   - Alternating pattern [1,10,1,10]

3. CORNER CASES:
   - Result is 0 or empty
   - Result equals input
   - Minimum valid output
   - Maximum valid output

4. STRESS TESTS:
   - Values at constraint limits
   - Large numbers near overflow
   - Negative numbers if allowed

OUTPUT FORMAT - JSON array:
[
  {
    "name": "empty_input",
    "input": [[], 10],
    "expectedOutput": 0,
    "explanation": "No elements to process",
    "category": "boundary",
    "verification": "Empty array returns 0"
  }
]

CRITICAL RULES:
1. COMPUTE expectedOutput BY HAND - trace through the logic step by step
2. If unsure of the answer, set expectedOutput to null and explain why in verification
3. Match input format EXACTLY to the function signature
4. Keep test cases MINIMAL but MEANINGFUL
5. Each test should catch a DIFFERENT bug type
6. NO duplicate or trivially similar tests

BAD EXAMPLES (DO NOT DO THIS):
- Setting expectedOutput without computing: {"input": [[1,2,3]], "expectedOutput": 6} ❌
- Guessing the answer: {"expectedOutput": "probably 5"} ❌
- Ignoring constraints: capacity=5 but saying 10 packages fit ❌

GOOD EXAMPLES:
- Traced computation: "1+2+3=6, within capacity 10, so output is 3 packages" ✓
- Admitting uncertainty: {"expectedOutput": null, "verification": "Ambiguous if we can skip"} ✓

Generate exactly 15 high-quality test cases. Start with [ and end with ]

[`;




      console.log('Generating 25 quality edge cases for:', title);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('Raw AI response length:', text.length);
      console.log('Raw AI response (first 500 chars):', text.substring(0, 500));

      let cleanedText = text.trim();
      
      // Remove markdown code blocks
      if (cleanedText.startsWith('```json')) cleanedText = cleanedText.slice(7);
      if (cleanedText.startsWith('```')) cleanedText = cleanedText.slice(3);
      if (cleanedText.endsWith('```')) cleanedText = cleanedText.slice(0, -3);
      cleanedText = cleanedText.trim();

      // Try to find JSON array in the response
      const jsonStart = cleanedText.indexOf('[');
      const jsonEnd = cleanedText.lastIndexOf(']');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
      }

      // Fix common JSON issues
      cleanedText = cleanedText.replace(/,\s*]/g, ']').replace(/,\s*}/g, '}');

      let parsed = JSON.parse(cleanedText);
      console.log('First attempt generated', parsed.length, 'edge cases');
      
      // If we got fewer than 10, try to generate more
      if (parsed.length < 10) {
        console.log('Generating additional edge cases...');
        const remaining = 15 - parsed.length;
        const supplementPrompt = `Generate ${remaining} MORE test cases for: "${title}"
${functionSignature ? `Function: ${functionSignature}` : ''}
Description: ${typeof description === 'string' ? description : description?.description || ''}

IMPORTANT: For each test case:
1. COMPUTE the expected output step-by-step
2. Show your work in the "verification" field
3. If unsure, set expectedOutput to null

Focus on:
- Boundary conditions (empty, single, two elements)
- Edge cases (all same values, sorted, reversed)
- Corner cases (result is 0, max value, min value)

Format: [{"name": "test", "input": [args], "expectedOutput": computed_value_or_null, "explanation": "what this tests", "category": "boundary|edge|corner", "verification": "how I computed the answer"}]

[`;

        try {
          await rateLimiter.checkAndWait();
          const supplementResult = await model.generateContent(supplementPrompt);
          let supplementText = supplementResult.response.text().trim();
          
          // Clean markdown
          if (supplementText.startsWith('```json')) supplementText = supplementText.slice(7);
          if (supplementText.startsWith('```')) supplementText = supplementText.slice(3);
          if (supplementText.endsWith('```')) supplementText = supplementText.slice(0, -3);
          supplementText = supplementText.trim();
          
          const suppJsonStart = supplementText.indexOf('[');
          const suppJsonEnd = supplementText.lastIndexOf(']');
          if (suppJsonStart !== -1 && suppJsonEnd !== -1) {
            supplementText = supplementText.substring(suppJsonStart, suppJsonEnd + 1);
          }
          supplementText = supplementText.replace(/,\s*]/g, ']').replace(/,\s*}/g, '}');
          
          const supplementParsed = JSON.parse(supplementText);
          parsed = [...parsed, ...supplementParsed];
          console.log('After supplementing, total edge cases:', parsed.length);
        } catch (suppError) {
          console.warn('Failed to generate supplemental edge cases:', suppError.message);
        }
      }
      
      console.log(`Successfully generated ${parsed.length} quality edge cases!`);
      return parsed;
      
    } catch (error) {
      console.error('Error generating edge cases:', error.message);
      console.log('Retrying with simpler prompt...');
      
      // Retry with a simpler prompt for edge cases
      try {
        const simplePrompt = `Generate 10 test cases for: "${title}"
${functionSignature ? `Function: ${functionSignature}` : ''}
${description ? `Description: ${typeof description === 'string' ? description : description.description || ''}` : ''}

For EACH test case:
1. Write the input
2. MANUALLY compute the expected output step-by-step
3. If you can't compute with certainty, use null

Required tests:
- Empty input
- Single element
- Two elements
- All same values
- Sorted ascending
- Sorted descending

Format: [{"name": "test", "input": [args], "expectedOutput": value_or_null, "explanation": "what this tests", "verification": "computation steps"}]

[`;

        const retryResult = await model.generateContent(simplePrompt);
        const retryText = retryResult.response.text().trim();
        
        let cleanedRetry = retryText;
        if (cleanedRetry.startsWith('```json')) cleanedRetry = cleanedRetry.slice(7);
        else if (cleanedRetry.startsWith('```')) cleanedRetry = cleanedRetry.slice(3);
        if (cleanedRetry.endsWith('```')) cleanedRetry = cleanedRetry.slice(0, -3);
        cleanedRetry = cleanedRetry.trim();
        
        const jsonStart = cleanedRetry.indexOf('[');
        const jsonEnd = cleanedRetry.lastIndexOf(']');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          cleanedRetry = cleanedRetry.substring(jsonStart, jsonEnd + 1);
        }
        
        cleanedRetry = cleanedRetry.replace(/,\s*]/g, ']').replace(/,\s*}/g, '}');
        const retryParsed = JSON.parse(cleanedRetry);
        console.log('Retry succeeded! Generated', retryParsed.length, 'edge cases');
        return retryParsed;
      } catch (retryError) {
        console.error('Retry also failed:', retryError.message);
        console.log('Returning fallback edge cases');
        return [
          { name: "empty_input", input: [], expectedOutput: null, explanation: "Test empty input", category: "boundary" },
          { name: "single_element", input: [[1]], expectedOutput: null, explanation: "Single element test", category: "edge" },
          { name: "two_elements", input: [[1, 2]], expectedOutput: null, explanation: "Two elements test", category: "edge" },
          { name: "simple_case", input: [[1, 2, 3]], expectedOutput: null, explanation: "Simple test case", category: "typical" },
          { name: "negative_numbers", input: [[-1, -2, -3]], expectedOutput: null, explanation: "Negative numbers", category: "special" }
        ];
      }
    }
  }
  // Generate comprehensive learning notes for a pattern/topic
  async generateLearningNotes(pattern, topic) {
    try {
      await rateLimiter.checkAndWait();

      const subject = pattern && topic 
        ? `the "${pattern}" pattern applied to "${topic}" problems`
        : pattern 
          ? `the "${pattern}" pattern`
          : `"${topic}" problems`;

      // Gemma 3 Optimized Prompt
      const prompt = `You are an expert DSA tutor creating comprehensive study notes.

TASK: Create detailed learning notes for: ${subject}

OUTPUT FORMAT - JSON object:
{
  "title": "Learning Notes Title",
  "overview": "3-4 paragraph explanation: what it is, why important, real-world analogies, vs similar approaches",
  "whenToUse": [
    "Signal 1: Problem keywords to look for",
    "Signal 2: Data structure hints (sorted array, linked list)",
    "Signal 3: Constraint patterns (O(n) time required)",
    "Signal 4: Problem types (pairs, subarrays, palindromes)",
    "...8-10 signals total..."
  ],
  "coreApproach": {
    "intuition": "2-3 paragraphs explaining WHY this works with analogies",
    "steps": ["Step 1: Do X because Y", "Step 2: Then Z", "...5-7 steps..."],
    "pseudocode": "Pseudocode with line-by-line comments",
    "edgeCases": ["Edge 1: how to handle", "Edge 2", "Edge 3"]
  },
  "complexity": {
    "time": "O(n) - because we visit each element once",
    "space": "O(1) - only using pointers",
    "bestCase": "When...",
    "worstCase": "When..."
  },
  "exampleProblems": [
    {
      "name": "Two Sum",
      "difficulty": "Easy",
      "companies": ["Google", "Amazon"],
      "description": "Given array nums and target...",
      "intuition": "Why this pattern applies",
      "approach": "Step-by-step solution",
      "code": "// Teaching-style comments explaining WHY\\n// Initialize map to store values\\nMap<Integer, Integer> map = new HashMap<>();\\n// Iterate through array\\nfor (int i = 0; i < nums.length; i++) {\\n    // Check if complement exists\\n    if (map.containsKey(target - nums[i])) {\\n        return new int[]{map.get(target - nums[i]), i};\\n    }\\n    map.put(nums[i], i);\\n}"
    }
  ],
  "commonMistakes": ["Mistake 1: Description and how to avoid", "Mistake 2", "Mistake 3", "Mistake 4"],
  "proTips": ["Tip 1: Expert advice", "Tip 2: Interview insight", "Tip 3: FAANG expectation", "Tip 4: Memory trick", "Tip 5: Debug technique"],
  "relatedPatterns": ["Pattern 1", "Pattern 2", "Pattern 3"],
  "practiceProblems": [
    {"name": "Problem Name", "difficulty": "Easy", "companies": ["Amazon"]},
    {"name": "Problem 2", "difficulty": "Medium", "companies": ["Google"]},
    {"name": "Problem 3", "difficulty": "Hard", "companies": ["Meta"]}
  ]
}

RULES:
1. MUST include 3 exampleProblems: 1 Easy, 1 Medium, 1 Hard
2. Medium/Hard must have company tags
3. Code comments explain WHY not just WHAT
4. Clean Java code - no markdown backticks
5. 8-10 whenToUse signals
6. Use \\\\n for newlines in code strings
7. Return ONLY valid JSON - start with { end with }

{`;


      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Clean markdown code blocks
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) cleanedText = cleanedText.slice(7);
      if (cleanedText.startsWith('```')) cleanedText = cleanedText.slice(3);
      if (cleanedText.endsWith('```')) cleanedText = cleanedText.slice(0, -3);

      return JSON.parse(cleanedText.trim());
    } catch (error) {
      console.error('Error generating learning notes:', error);
      throw new Error('Failed to generate learning notes: ' + error.message);
    }
  }
}

module.exports = new AIService();
