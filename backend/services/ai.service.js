const { model, rateLimiter } = require('../config/ai.config');

class AIService {
  // Analyze a problem using AI
  async analyzeProblem(title, platform = 'LeetCode', url = '') {
    try {
      await rateLimiter.checkAndWait();

      const prompt = `
Analyze the following DSA problem and provide structured information:

Title: ${title}
Platform: ${platform}
URL: ${url || 'N/A'}

Provide a JSON response with the following fields:
{
  "title": "exact problem title",
  "difficulty": "Easy" | "Medium" | "Hard",
  "topics": ["topic1", "topic2", ...], // Array of relevant topics (e.g., Array, String, Tree, Graph, etc.)
  "patterns": ["pattern1", "pattern2", ...], // Array of algorithmic patterns (e.g., Two Pointers, Sliding Window, DFS, BFS, DP, etc.)
  "companies": ["company1", "company2", ...], // Array of major tech companies known to ask this problem
  "platform": "${platform}",
  "platformUrl": "${url || 'N/A'}"
}

IMPORTANT:
- Difficulty must be exactly one of: Easy, Medium, Hard
- Topics should be standard CS terms: Array, String, Hash Table, Linked List, Tree, Graph, Stack, Queue, Heap, Dynamic Programming, etc.
- Patterns MUST be chosen from this strict list: Two Pointers, Sliding Window, Fast & Slow Pointers, Prefix Sum, Kadane Pattern, Cyclic Sort, Hash Map / Hash Set, Binary Search, Binary Search on Answer, DFS, BFS, Tree BFS, Tree DFS, Graph Traversal, Topological Sort, Union Find, 0/1 Knapsack DP, Unbounded Knapsack DP, Subsequence DP, Partition DP / Subset DP, Grid DP, Subsets, Permutations, Combination Sum Variants, Monotonic Stack, Stack, Min Heap / Max Heap, Two Heaps Pattern, Linked List Patterns, Trie + String Matching.
- Companies: Include major tech companies known to ask this problem in interviews (e.g., Google, Amazon, Meta, Microsoft, Apple, Netflix, Bloomberg, Uber, LinkedIn, Adobe, etc.). If this is a well-known LeetCode problem, you likely know which companies ask it. If unsure, provide your best educated guess based on the problem type and difficulty, or return an empty array [].
- Return ONLY valid JSON, no markdown or extra text.
`;

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

      const prompt = `
Summarize the following problem-solving notes into key takeaways:

${notes}

Provide a concise summary (max 3-4 bullet points) highlighting:
1. Main approach/algorithm used
2. Key insights or tricks
3. Time/space complexity if mentioned
4. Common mistakes to avoid

Format as bullet points with • symbol.
`;

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

      const prompt = `
Analyze this problem-solving history and identify weaknesses:

Topics solved:
${Object.entries(topicCounts).map(([topic, count]) => `- ${topic}: ${count}`).join('\n')}

Patterns used:
${Object.entries(patternCounts).map(([pattern, count]) => `- ${pattern}: ${count}`).join('\n')}

Difficulty distribution:
- Easy: ${difficultyStats.Easy}
- Medium: ${difficultyStats.Medium}
- Hard: ${difficultyStats.Hard}

Provide:
1. Top 3 weak topics (under-practiced)
2. Top 3 weak patterns (under-practiced)
3. Recommended focus areas
4. Difficulty distribution analysis

Format as JSON:
{
  "weakTopics": ["topic1", "topic2", "topic3"],
  "weakPatterns": ["pattern1", "pattern2", "pattern3"],
  "recommendations": ["rec1", "rec2", "rec3"],
  "difficultyAdvice": "string"
}
`;

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

      const prompt = `
Given a problem "${problemTitle}" with topics [${topics.join(', ')}] and patterns [${patterns.join(', ')}], suggest 5 related problems that use similar concepts.

Return as JSON array:
[
  {
    "title": "Problem Title",
    "reason": "Why it's related",
    "difficulty": "Easy|Medium|Hard"
  }
]
`;

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

      const prompt = `
You are an expert DSA tutor providing a comprehensive study guide for "${title}" (${difficulty}) on ${platform}.

CRITICAL: Return a valid JSON object, but the CONTENT inside must be clean and natural like ChatGPT responses.

{
  "understanding": "Natural conversational explanation here",
  "bruteForce": {
    "explanation": "Natural conversational explanation",
    "code": "Clean Java code WITHOUT any backticks or markdown",
    "complexity": "Complexity analysis as natural text"
  },
  "better": {
    "explanation": "Natural explanation or null",
    "code": "Clean Java code or null",
    "complexity": "Complexity analysis or null"
  },
  "optimal": {
    "explanation": "Natural conversational explanation with detailed walkthrough",
    "code": "Clean Java code WITHOUT any backticks",
    "complexity": "Complexity analysis"
  },
  "takeaways": "Natural bullet points with dashes or asterisks"
}

ABSOLUTE RULES FOR CONTENT FORMATTING:

1. You MUST use proper JSON escaping for special characters.
2. You MUST use \n for newlines within strings.
3. Do NOT use actual line breaks inside string values, as this invalidates JSON.
4. NO markdown backticks anywhere in the code - just plain Java
5. NO markdown formatting (no **, ###, \`, etc.) in explanations
6. Write explanations like you're talking to a friend - natural paragraphs
7. Code must be clean Java with proper indentation using spaces
8. Use "null" for better approach if not applicable

CODE FORMATTING (CRITICAL):
- Standard Java structure: public class Solution { ... }
- 4 spaces for indentation
- Proper spacing around operators and braces
- NO markdown, NO backticks, NO language tags
- Just pure, clean, runnable Java code

EXPLANATION STYLE:
- Write in conversational ChatGPT tone
- Use natural paragraphs and line breaks (escaped as \n)
- Be friendly and clear
- Avoid technical jargon unless necessary

The JSON structure is ONLY for parsing - the content inside should read like natural ChatGPT output.
`;

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

      const prompt = `
You are creating a LeetCode-style problem description for "${title}" (${difficulty}).

Return ONLY a valid JSON object with this exact structure:

{
  "statement": "The problem statement in plain text. Use natural language without markdown formatting.",
  "examples": [
    {
      "input": "x = 121",
      "output": "true",
      "explanation": "Brief explanation of why this output is correct"
    }
  ],
  "constraints": [
    "-2^31 <= x <= 2^31 - 1",
    "Other constraint here"
  ],
  "functionSignature": "public int solve(int x)",
  "followUp": "Optional follow-up question or null if none"
}

IMPORTANT:
- Create 2-3 realistic examples with input, output, and explanation
- Include 2-4 relevant constraints based on the problem type
- Use plain text only - NO markdown formatting, NO bold, NO code backticks in the JSON strings
- The statement should be clear and concise (1-2 sentences)
- Make it feel like an actual LeetCode problem
- Ensure valid JSON with proper escaping
- Topics: ${topics.join(', ') || 'General'}
- Patterns: ${patterns.join(', ') || 'General'}
`;

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

      const prompt = `
You are an expert coding interview question creator.
Your task is to create a BRAND NEW coding problem that tests the same core concepts as "${originalTitle}" (${difficulty}), but with a completely different story and context.

Input Context:
- Original Problem: ${originalTitle}
- Difficulty: ${difficulty}
- Core Topics: ${topics.join(', ')}
- Core Patterns: ${patterns.join(', ')}

Instructions:
1. Create a unique problem title (do not use "${originalTitle}" or similar names).
2. Write a clear problem statement with a new scenario (e.g., if original was about arrays, make this about sensor data or stock prices, but keeping the underlying logic similar).
3. Provide 2-3 examples with input/output.
4. List constraints appropriate for the difficulty.
5. Do NOT mention the original problem name in the output.

Return ONLY a valid JSON object with this structure:
{
  "title": "New Problem Title",
  "difficulty": "${difficulty}",
  "description": "Full problem description in markdown format. Use code blocks for examples if needed.",
  "examples": [
    {
      "input": "x = [1, 2, 3]",
      "output": "6",
      "explanation": "Explanation here"
    }
  ],
  "constraints": [
    "1 <= n <= 10^5",
    "Time complexity should be O(n)"
  ],
  "hints": ["Hint 1", "Hint 2"]
}
`;

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

      const prompt = `
You are an expert coding interview question creator.
Your task is to create a BRAND NEW coding problem based on the following criteria:

Criteria:
- Pattern: ${pattern || 'Any'}
- Topic: ${topic || 'Any'}
- Difficulty: ${difficulty}

Instructions:
1. Create a unique problem title.
2. The problem MUST strictly use the "${pattern}" pattern (if specified) and involve the "${topic}" topic (if specified).
3. Write a clear problem statement with a realistic scenario.
4. Provide 2-3 examples with input/output.
5. List constraints appropriate for the ${difficulty} difficulty.
6. Ensure the problem is NOT a direct copy of a famous LeetCode problem, but a variation or a new application of the pattern.

CRITICAL: You MUST return ONLY valid JSON. No extra text before or after. No markdown formatting.

Return this exact structure:
{
  "title": "New Problem Title",
  "difficulty": "${difficulty}",
  "description": "Full problem description in markdown format. Use code blocks for examples if needed.",
  "functionSignature": "public int solve(int[] nums)",
  "examples": [
    {
      "input": "nums = [1, 2, 3]",
      "output": "6",
      "explanation": "Explanation here"
    }
  ],
  "constraints": [
    "1 <= n <= 10^5",
    "Time complexity should be O(n)"
  ],
  "hints": ["Hint 1", "Hint 2"]
}

CRITICAL RULES:
1. Include "functionSignature" field with the EXACT Java method signature.
2. Examples should show inputs in the format: "paramName = value".
3. ONLY return valid JSON.
`;

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
  async generateProblemHelp(title, description, difficulty) {
    try {
      await rateLimiter.checkAndWait();

      const prompt = `
You are an expert DSA tutor.
I need help with this coding problem:
Title: "${title}"
Difficulty: ${difficulty}
Description: ${description}

Provide the following in a valid JSON format:
1. "hints": An array of 10 progressive hints. Start with very subtle conceptual hints and get progressively more specific about the algorithm/data structure.
2. "solutions": An object containing "brute", "better", and "optimal" approaches.
   - Each approach should have:
     - "complexity": Time and Space complexity (e.g., "O(N) Time | O(1) Space")
     - "explanation": A clear, concise explanation of the logic.
     - "code": Clean Java code for the solution.

JSON Structure:
{
  "hints": ["Hint 1", "Hint 2", ...],
  "solutions": {
    "brute": { "complexity": "...", "explanation": "...", "code": "..." },
    "better": { "complexity": "...", "explanation": "...", "code": "..." }, // Use null if no distinct better approach
    "optimal": { "complexity": "...", "explanation": "...", "code": "..." }
  }
}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) cleanedText = cleanedText.slice(7);
      if (cleanedText.startsWith('```')) cleanedText = cleanedText.slice(3);
      if (cleanedText.endsWith('```')) cleanedText = cleanedText.slice(0, -3);

      return JSON.parse(cleanedText.trim());
    } catch (error) {
      console.error('Error generating problem help:', error);
      throw new Error('Failed to generate problem help');
    }
  }

  // Generate a company-specific problem
  async generateCompanyProblem(company, topic, pattern, difficulty) {
    try {
      await rateLimiter.checkAndWait();

      const prompt = `
You are an expert technical interviewer at ${company}.
Your task is to create a realistic coding interview problem that ${company} would actually ask.

Criteria:
- Company: ${company} (The problem style must match this company's interview culture)
- Topic: ${topic || 'Any'}
- Pattern: ${pattern || 'Any'}
- Difficulty: ${difficulty}

Instructions:
1. Create a unique problem title that sounds like a real ${company} interview question.
2. The problem scenario should reflect real-world systems or challenges relevant to ${company} (e.g., if Google -> Search/Indexing/Distributed Systems context; if Amazon -> E-commerce/Logistics/Scaling; if Uber -> Maps/Routing).
3. Write a clear problem statement.
4. Provide 2-3 examples with input/output.
5. List constraints appropriate for the difficulty.
6. Ensure the problem is solvable within 45 minutes.

Return ONLY a valid JSON object with this structure:
{
  "title": "Problem Title",
  "difficulty": "${difficulty}",
  "description": "Full problem description in markdown format. Use code blocks for examples if needed.",
  "examples": [
    {
      "input": "x = [1, 2, 3]",
      "output": "6",
      "explanation": "Explanation here"
    }
  ],
  "constraints": [
    "1 <= n <= 10^5",
    "Time complexity should be O(n)"
  ],
  "hints": ["Hint 1", "Hint 2"],
  "companyContext": "Brief note on why this is relevant to ${company}"
}
`;

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

      // Simplified prompt but comprehensive edge cases
      const prompt = `Generate 5-8 comprehensive edge test cases for: "${title}"

${functionSignature ? `Function signature: ${functionSignature}` : ''}

Return ONLY valid JSON (no other text):
[
  {
    "name": "descriptive test name",
    "input": [arg1, arg2],
    "expectedOutput": "expected output",
    "explanation": "why this edge case is important"
  }
]

Focus on:
- Boundary conditions (min/max values, empty inputs)
- Special cases (zero, negative, null)
- Large inputs (performance testing)
- Corner cases that break naive solutions

Rules:
- Input MUST be a JSON array with all function arguments IN ORDER
- Keep explanations under 60 characters
- Avoid special characters in strings (use simple quotes)
- No trailing commas
- Ensure valid JSON syntax
`;

      console.log('Generating edge cases for:', title);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('Raw AI response (first 500 chars):', text.substring(0, 500));
      console.log('Raw AI response (last 200 chars):', text.substring(Math.max(0, text.length - 200)));

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

      console.log('Cleaned text to parse:', cleanedText.substring(0, 300));

      const parsed = JSON.parse(cleanedText);
      console.log('Successfully parsed', parsed.length, 'edge cases');
      return parsed;
      
    } catch (error) {
      console.error('Error generating edge cases:', error.message);
      console.error('Stack:', error.stack);
      throw new Error('Failed to generate edge cases');
    }
  }
}

module.exports = new AIService();
