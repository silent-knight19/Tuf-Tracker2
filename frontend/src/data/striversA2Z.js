// Strivers A2Z DSA Sheet - Complete Problem List
// Source: https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/

export const striversA2ZCategories = [
  {
    id: 'basics',
    name: 'Step 1: Learn the Basics',
    subcategories: [
      {
        id: 'basics-programming',
        name: '1.1 Things to Know in C++/Java/Python',
        problems: [
          { id: '001', title: 'User Input / Output', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/user-input-output/0', leetCodeUrl: null },
          { id: '002', title: 'Data Types', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/data-type-1666706751/1', leetCodeUrl: null },
          { id: '003', title: 'If Else statements', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/java-if-else-decision-making0924/0', leetCodeUrl: null },
          { id: '004', title: 'Switch Statement', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/java-switch-case-statement0923/0', leetCodeUrl: null },
          { id: '005', title: 'What are arrays, strings?', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/arrays-introduction/0', leetCodeUrl: null },
          { id: '006', title: 'For loops', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/for-loop-1/0', leetCodeUrl: null },
          { id: '007', title: 'While loops', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/while-loop/0', leetCodeUrl: null },
          { id: '008', title: 'Functions (Pass by Reference and Value)', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/pass-by-reference-and-value/1', leetCodeUrl: null },
        ]
      },
      {
        id: 'patterns',
        name: '1.2 Build-up Logical Thinking',
        problems: [
          { id: '009', title: 'Pattern 1: Rectangular Star Pattern', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/square-pattern/0', leetCodeUrl: null },
          { id: '010', title: 'Pattern 2: Right-Angled Triangle Pattern', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/triangle-pattern/1', leetCodeUrl: null },
          { id: '011', title: 'Pattern 3: Right-Angled Numbered Triangle', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/triangle-number/1', leetCodeUrl: null },
          { id: '012', title: 'Pattern 4: Right-Angled Numbered Triangle II', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/triangle-number-171/1', leetCodeUrl: null },
        ]
      },
      {
        id: 'stl',
        name: '1.3 Learn STL/Java-Collections',
        problems: [
          { id: '014', title: 'C++ STL: Vector, Set, Map basics', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/c-stl-vector-set-map/0', leetCodeUrl: null },
          { id: '015', title: 'Java Collections: ArrayList, HashMap basics', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/java-collections/0', leetCodeUrl: null },
        ]
      },
      {
        id: 'basic-maths',
        name: '1.4 Know Basic Maths',
        problems: [
          { id: '016', title: 'Count Digits', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/count-digits/0', leetCodeUrl: null },
          { id: '017', title: 'Reverse a Number', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/reverse-bits/0', leetCodeUrl: 'https://leetcode.com/problems/reverse-integer/' },
          { id: '018', title: 'Check Palindrome', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/palindrome-numbers/0', leetCodeUrl: 'https://leetcode.com/problems/palindrome-number/' },
          { id: '019', title: 'GCD or HCF', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/gcd-of-two-numbers/0', leetCodeUrl: null },
          { id: '020', title: 'Armstrong Numbers', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/armstrong-numbers/0', leetCodeUrl: null },
          { id: '021', title: 'Print all Divisors', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/sum-of-all-divisors-from-1-to-n/0', leetCodeUrl: null },
          { id: '022', title: 'Check for Prime', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/prime-number/0', leetCodeUrl: null },
        ]
      },
      {
        id: 'basic-recursion',
        name: '1.5 Learn Basic Recursion',
        problems: [
          { id: '023', title: 'Print name N times using recursion', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/print-n-to-1-without-loop/1', leetCodeUrl: null },
          { id: '024', title: 'Print 1 to N using recursion', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/print-pattern/1', leetCodeUrl: null },
          { id: '025', title: 'Print N to 1 using recursion', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/print-1-to-n-without-using-loops/1', leetCodeUrl: null },
          { id: '026', title: 'Sum of first N numbers', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/print-n-to-1-without-loop/1', leetCodeUrl: null },
          { id: '027', title: 'Factorial of N numbers', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/sum-of-first-n-numbers/1', leetCodeUrl: null },
          { id: '028', title: 'Reverse an array', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/find-all-factorial-numbers-less-than-or-equal-to-n/0', leetCodeUrl: null },
          { id: '029', title: 'Check if a string is palindrome or not', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/reverse-an-array/0', leetCodeUrl: null },
          { id: '030', title: 'Fibonacci Number', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/palindrome-string/0', leetCodeUrl: 'https://leetcode.com/problems/valid-palindrome/' },
        ]
      },
      {
        id: 'basic-hashing',
        name: '1.6 Learn Basic Hashing',
        problems: [
          { id: '031', title: 'Counting frequencies of array elements', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/frequency-of-array-elements/0', leetCodeUrl: null },
          { id: '032', title: 'Find the highest/lowest frequency element', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/frequency-of-array-elements/0', leetCodeUrl: null },
        ]
      }
    ]
  },
  {
    id: 'arrays',
    name: 'Step 2: Learn Important Sorting Techniques',
    subcategories: [
      {
        id: 'sorting-1',
        name: '2.1 Sorting-I',
        problems: [
          { id: '051', title: 'Selection Sort', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/selection-sort/1', leetCodeUrl: null },
          { id: '052', title: 'Bubble Sort', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/bubble-sort/1', leetCodeUrl: null },
          { id: '053', title: 'Insertion Sort', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/insertion-sort/1', leetCodeUrl: null },
        ]
      },
      {
        id: 'sorting-2',
        name: '2.2 Sorting-II',
        problems: [
          { id: '054', title: 'Merge Sort', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/merge-sort/1', leetCodeUrl: null },
          { id: '055', title: 'Recursive Bubble Sort', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/bubble-sort/1', leetCodeUrl: null },
          { id: '056', title: 'Recursive Insertion Sort', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/insertion-sort/1', leetCodeUrl: null },
          { id: '057', title: 'Quick Sort', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/quick-sort/1', leetCodeUrl: null },
        ]
      }
    ]
  },
  {
    id: 'array-problems',
    name: 'Step 3: Solve Problems on Arrays',
    subcategories: [
      {
        id: 'arrays-easy',
        name: '3.1 Easy',
        problems: [
          { id: '058', title: 'Largest Element in an Array', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/largest-element-in-array/0', leetCodeUrl: null },
          { id: '059', title: 'Second Largest Element in an Array', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/second-largest/0', leetCodeUrl: null },
          { id: '060', title: 'Check if array is sorted', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/check-if-array-is-sorted/0', leetCodeUrl: null },
          { id: '061', title: 'Remove duplicates from Sorted array', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/remove-duplicate-elements-from-sorted-array/1', leetCodeUrl: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/' },
          { id: '062', title: 'Left Rotate an array by one place', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/rotate-array-by-one-element/0', leetCodeUrl: null },
          { id: '063', title: 'Left rotate an array by D places', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/rotate-array-by-n-elements/0', leetCodeUrl: 'https://leetcode.com/problems/rotate-array/' },
          { id: '064', title: 'Move Zeros to end', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/move-all-zeroes-to-end-of-array/0', leetCodeUrl: 'https://leetcode.com/problems/move-zeroes/' },
          { id: '065', title: 'Linear Search', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/searching-a-number/0', leetCodeUrl: null },
          { id: '066', title: 'Find the Union', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/union-of-two-sorted-arrays/1', leetCodeUrl: null },
          { id: '067', title: 'Find missing number in an array', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/missing-number-in-array/0', leetCodeUrl: 'https://leetcode.com/problems/missing-number/' },
          { id: '068', title: 'Maximum Consecutive Ones', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/maximum-consecutive-ones/1', leetCodeUrl: 'https://leetcode.com/problems/max-consecutive-ones/' },
          { id: '069', title: 'Find the number that appears once', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/element-appearing-once/0', leetCodeUrl: 'https://leetcode.com/problems/single-number/' },
          { id: '070', title: 'Longest subarray with given sum K (positives)', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/longest-sub-array-with-sum-k/1', leetCodeUrl: null },
        ]
      },
      {
        id: 'arrays-medium',
        name: '3.2 Medium',
        problems: [
          { id: '071', title: '2Sum Problem', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/key-pair/0', leetCodeUrl: 'https://leetcode.com/problems/two-sum/' },
          { id: '072', title: 'Sort an array of 0s 1s 2s', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/sort-an-array-of-0s-1s-and-2s/0', leetCodeUrl: 'https://leetcode.com/problems/sort-colors/' },
          { id: '073', title: 'Majority Element (>n/2 times)', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/majority-element/0', leetCodeUrl: 'https://leetcode.com/problems/majority-element/' },
          { id: '074', title: 'Kadane’s Algorithm, maximum subarray sum', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/kadanes-algorithm/0', leetCodeUrl: 'https://leetcode.com/problems/maximum-subarray/' },
          { id: '075', title: 'Print subarray with maximum subarray sum', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/maximum-sub-array/0', leetCodeUrl: null },
          { id: '076', title: 'Stock Buy and Sell', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/stock-buy-and-sell/0', leetCodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
          { id: '077', title: 'Rearrange the array in alternating positive and negative items', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/array-of-alternate-ve-and-ve-nos/0', leetCodeUrl: 'https://leetcode.com/problems/rearrange-array-elements-by-sign/' },
          { id: '078', title: 'Next Permutation', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/next-permutation/0', leetCodeUrl: 'https://leetcode.com/problems/next-permutation/' },
          { id: '079', title: 'Leaders in an Array problem', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/leaders-in-an-array/0', leetCodeUrl: null },
          { id: '080', title: 'Longest Consecutive Sequence', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/longest-consecutive-subsequence/0', leetCodeUrl: 'https://leetcode.com/problems/longest-consecutive-sequence/' },
          { id: '081', title: 'Set Matrix Zeros', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/boolean-matrix-problem/1', leetCodeUrl: 'https://leetcode.com/problems/set-matrix-zeroes/' },
          { id: '082', title: 'Rotate Matrix by 90 degrees', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/rotate-by-90-degree/0', leetCodeUrl: 'https://leetcode.com/problems/rotate-image/' },
          { id: '083', title: 'Print the matrix in spiral manner', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/spirally-traversing-a-matrix/0', leetCodeUrl: 'https://leetcode.com/problems/spiral-matrix/' },
          { id: '084', title: 'Count subarrays with given sum', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/subarrays-with-sum-k/1', leetCodeUrl: 'https://leetcode.com/problems/subarray-sum-equals-k/' },
        ]
      },
      {
        id: 'arrays-hard',
        name: '3.3 Hard',
        problems: [
          { id: '085', title: 'Pascal’s Triangle', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/pascal-triangle/0', leetCodeUrl: 'https://leetcode.com/problems/pascals-triangle/' },
          { id: '086', title: 'Majority Element (n/3 times)', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/majority-vote/1', leetCodeUrl: 'https://leetcode.com/problems/majority-element-ii/' },
          { id: '087', title: '3-Sum Problem', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/triplet-sum-in-array/0', leetCodeUrl: 'https://leetcode.com/problems/3sum/' },
          { id: '088', title: '4-Sum Problem', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/find-all-four-sum-numbers/0', leetCodeUrl: 'https://leetcode.com/problems/4sum/' },
          { id: '089', title: 'Largest Subarray with 0 sum', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/largest-subarray-with-0-sum/1', leetCodeUrl: null },
          { id: '090', title: 'Count number of subarrays with given xor K', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/count-subarray-with-given-xor/1', leetCodeUrl: null },
          { id: '091', title: 'Merge Overlapping Subintervals', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/overlapping-intervals/0', leetCodeUrl: 'https://leetcode.com/problems/merge-intervals/' },
          { id: '092', title: 'Merge two sorted arrays without extra space', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/merge-two-sorted-arrays/0', leetCodeUrl: 'https://leetcode.com/problems/merge-sorted-array/' },
          { id: '093', title: 'Find the repeating and missing number', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/find-missing-and-repeating/0', leetCodeUrl: null },
          { id: '094', title: 'Count inversions in an array', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/inversion-of-array/0', leetCodeUrl: null },
          { id: '095', title: 'Reverse Pairs (Leetcode)', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/inversion-of-array/0', leetCodeUrl: 'https://leetcode.com/problems/reverse-pairs/' },
          { id: '096', title: 'Maximum product subarray', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/maximum-product-subarray/0', leetCodeUrl: 'https://leetcode.com/problems/maximum-product-subarray/' },
          { id: '097', title: 'Longest subarray with sum K (positives and negatives)', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/longest-sub-array-with-sum-k/1', leetCodeUrl: null },
        ]
      }
    ]
  },
  {
    id: 'binary-search',
    name: 'Step 4: Binary Search [1D, 2D Arrays, Search Space]',
    subcategories: [
      {
        id: 'bs-1d',
        name: '4.1 BS on 1D Arrays',
        problems: [
          { id: '097', title: 'Find x in sorted array', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/binary-search/1', leetCodeUrl: 'https://leetcode.com/problems/binary-search/' },
          { id: '098', title: 'Implement lower bound', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/floor-in-a-sorted-array/0', leetCodeUrl: null },
          { id: '099', title: 'Implement upper bound', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/ceil-in-a-sorted-array/0', leetCodeUrl: null },
          { id: '100', title: 'Search insert position', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/search-insert-position-of-k-in-a-sorted-array/1', leetCodeUrl: 'https://leetcode.com/problems/search-insert-position/' },
          { id: '101', title: 'Check if array is sorted', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/check-if-array-is-sorted/0', leetCodeUrl: null },
          { id: '102', title: 'First and last position in sorted array', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/first-and-last-occurrences-of-x/0', leetCodeUrl: 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/' },
          { id: '103', title: 'Count occurrences in sorted array', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/number-of-occurrence/0', leetCodeUrl: null },
          { id: '104', title: 'Find peak element', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/peak-element/1', leetCodeUrl: 'https://leetcode.com/problems/find-peak-element/' },
          { id: '105', title: 'Search in rotated sorted array', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/search-in-a-rotated-array/0', leetCodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
          { id: '106', title: 'Search in rotated sorted array with duplicates', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/search-in-a-rotated-array-ii/1', leetCodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array-ii/' },
          { id: '107', title: 'Find minimum element in rotated sorted array', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/minimum-number-in-a-sorted-rotated-array/0', leetCodeUrl: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/' },
          { id: '108', title: 'Find single element in sorted array', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/unique-element-in-sorted-array/1', leetCodeUrl: 'https://leetcode.com/problems/single-element-in-a-sorted-array/' },
          { id: '109', title: 'Find how many times array is rotated', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/rotation/0', leetCodeUrl: null },
        ]
      },
      {
        id: 'bs-2d',
        name: '4.2 BS on 2D Arrays',
        problems: [
          { id: '110', title: 'Row with maximum number of 1s', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/row-with-max-1s/0', leetCodeUrl: null },
          { id: '111', title: 'Search in sorted matrix', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/search-in-a-matrix/0', leetCodeUrl: 'https://leetcode.com/problems/search-a-2d-matrix/' },
          { id: '112', title: 'Search in row-wise sorted matrix', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/search-in-a-sorted-matrix/1', leetCodeUrl: null },
          { id: '113', title: 'Peak element in matrix', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/find-peak-element-in-matrix/1', leetCodeUrl: null },
          { id: '114', title: 'Matrix median', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/median-in-a-row-wise-sorted-matrix/0', leetCodeUrl: null },
        ]
      },
      {
        id: 'bs-search-space',
        name: '4.3 BS on Search Space',
        problems: [
          { id: '115', title: 'Square root of number', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/square-root/1', leetCodeUrl: 'https://leetcode.com/problems/sqrtx/' },
          { id: '116', title: 'Nth root of integer', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/nth-root-of-m/0', leetCodeUrl: null },
          { id: '117', title: 'Koko eating bananas', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/koko-eating-bananas/1', leetCodeUrl: 'https://leetcode.com/problems/koko-eating-bananas/' },
          { id: '118', title: 'Minimum days to make bouquets', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/minimum-days-to-make-m-bouquets/1', leetCodeUrl: null },
          { id: '119', title: 'Find smallest integer', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/find-the-smallest-integer/1', leetCodeUrl: null },
          { id: '120', title: 'Capacity to ship packages within D days', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/capacity-to-ship-packages-within-d-days/1', leetCodeUrl: 'https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/' },
          { id: '121', title: 'Aggressive cows', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/aggressive-cows/0', leetCodeUrl: null },
          { id: '122', title: 'Book allocation', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/allocate-minimum-number-of-pages/0', leetCodeUrl: null },
          { id: '123', title: 'Split array largest sum', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/split-array-largest-sum/1', leetCodeUrl: 'https://leetcode.com/problems/split-array-largest-sum/' },
          { id: '124', title: 'Kth missing number', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/kth-missing-element-in-sorted-array/0', leetCodeUrl: 'https://leetcode.com/problems/kth-missing-positive-number/' },
          { id: '125', title: 'Gas station', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/gas-station/1', leetCodeUrl: 'https://leetcode.com/problems/gas-station/' },
          { id: '126', title: 'Median of two sorted arrays', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/median-of-2-sorted-arrays-of-different-sizes/0', leetCodeUrl: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },
          { id: '127', title: 'Kth element of two sorted arrays', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/k-th-element-of-two-sorted-array/0', leetCodeUrl: null },
          { id: '128', title: 'Minimum Difference Element in Sorted Array', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/minimum-difference-element-in-sorted-array/1', leetCodeUrl: null },
        ]
      }
    ]
  },
  {
    id: 'strings',
    name: 'Step 5: Strings',
    subcategories: [
      {
        id: 'strings-easy',
        name: '5.1 Easy',
        problems: [
          { id: '128', title: 'Remove outermost Paranthesis', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/outermost-parenthesis/1', leetCodeUrl: 'https://leetcode.com/problems/remove-outermost-parentheses/' },
          { id: '129', title: 'Reverse words in a given string', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/reverse-words-in-a-given-string/0', leetCodeUrl: 'https://leetcode.com/problems/reverse-words-in-a-string/' },
          { id: '130', title: 'Largest odd number in string', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/largest-odd-number-in-string/1', leetCodeUrl: 'https://leetcode.com/problems/largest-odd-number-in-string/' },
          { id: '131', title: 'Longest Common Prefix', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/longest-common-prefix-in-an-array/0', leetCodeUrl: 'https://leetcode.com/problems/longest-common-prefix/' },
          { id: '132', title: 'Isomorphic String', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/isomorphic-strings/0', leetCodeUrl: 'https://leetcode.com/problems/isomorphic-strings/' },
          { id: '133', title: 'Rotate String', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/rotate-string/1', leetCodeUrl: 'https://leetcode.com/problems/rotate-string/' },
          { id: '134', title: 'Anagram', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/anagram/0', leetCodeUrl: 'https://leetcode.com/problems/valid-anagram/' },
        ]
      },
      {
        id: 'strings-medium',
        name: '5.2 Medium',
        problems: [
          { id: '135', title: 'Sorting the Sentence', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/sorting-the-sentence/1', leetCodeUrl: 'https://leetcode.com/problems/sorting-the-sentence/' },
          { id: '136', title: 'Roman Number to Integer and vice versa', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/roman-number-to-integer/0', leetCodeUrl: 'https://leetcode.com/problems/roman-to-integer/' },
          { id: '137', title: 'Implement ATOI/STRSTR', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/implement-atoi/1', leetCodeUrl: 'https://leetcode.com/problems/string-to-integer-atoi/' },
          { id: '138', title: 'Longest Palindromic Substring', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/longest-palindrome-in-a-string/0', leetCodeUrl: 'https://leetcode.com/problems/longest-palindromic-substring/' },
          { id: '139', title: 'Sum of Beauty of all substring', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/sum-of-beauty-of-all-substrings/1', leetCodeUrl: 'https://leetcode.com/problems/sum-of-beauty-of-all-substrings/' },
          { id: '140', title: 'Reverse Every Word in A String', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/reverse-each-word-in-a-given-string/1', leetCodeUrl: null },
          { id: '141', title: 'String to Integer (atoi)', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/implement-atoi/1', leetCodeUrl: 'https://leetcode.com/problems/string-to-integer-atoi/' },
          { id: '142', title: 'Longest Common Prefix', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/longest-common-prefix-in-an-array/0', leetCodeUrl: 'https://leetcode.com/problems/longest-common-prefix/' },
        ]
      }
    ]
  },
  {
    id: 'linked-list',
    name: 'Step 6: Learn LinkedList',
    subcategories: [
      {
        id: 'll-1d',
        name: '6.1 1D LinkedList',
        problems: [
          { id: '143', title: 'Introduction to LinkedList, learn about struct, and how is node represented', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/introduction-to-linked-list/1', leetCodeUrl: null },
          { id: '144', title: 'Inserting a new Node in LinkedList', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/linked-list-insertion/1', leetCodeUrl: null },
          { id: '145', title: 'Deleting a Node in LinkedList', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/delete-a-node-in-single-linked-list/1', leetCodeUrl: null },
          { id: '146', title: 'Find the length of the linkedlist [learn traversal]', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/count-nodes-of-linked-list/0', leetCodeUrl: null },
          { id: '147', title: 'Search an element in the LinkedList', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/search-in-linked-list/1', leetCodeUrl: null },
          { id: '148', title: 'Middle of a LinkedList [TortoiseHare Method]', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/finding-middle-element-in-a-linked-list/1', leetCodeUrl: 'https://leetcode.com/problems/middle-of-the-linked-list/' },
          { id: '149', title: 'Reverse a LinkedList [Iterative]', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/reverse-a-linked-list/1', leetCodeUrl: 'https://leetcode.com/problems/reverse-linked-list/' },
          { id: '150', title: 'Reverse a LinkedList [Recursive]', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/reverse-a-linked-list/1', leetCodeUrl: null },
          { id: '151', title: 'Detect a loop in LL', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/detect-loop-in-linked-list/1', leetCodeUrl: 'https://leetcode.com/problems/linked-list-cycle/' },
          { id: '152', title: 'Find the starting point in LL', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/remove-loop-in-linked-list/1', leetCodeUrl: 'https://leetcode.com/problems/linked-list-cycle-ii/' },
          { id: '153', title: 'Length of Loop in LL', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/find-length-of-loop/0', leetCodeUrl: null },
          { id: '154', title: 'Check if LL is palindrome or not', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/check-if-linked-list-is-pallindrome/1', leetCodeUrl: 'https://leetcode.com/problems/palindrome-linked-list/' },
          { id: '155', title: 'Segrregate odd and even nodes in LL', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/segregate-even-and-odd-nodes-in-a-linked-list/0', leetCodeUrl: 'https://leetcode.com/problems/odd-even-linked-list/' },
          { id: '156', title: 'Remove Nth node from the back of the LL', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/nth-node-from-end-of-linked-list/1', leetCodeUrl: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/' },
          { id: '157', title: 'Delete the middle node of LL', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/delete-middle-of-linked-list/1', leetCodeUrl: 'https://leetcode.com/problems/delete-the-middle-node-of-a-linked-list/' },
          { id: '158', title: 'Sort LL', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/sort-a-linked-list/1', leetCodeUrl: 'https://leetcode.com/problems/sort-list/' },
          { id: '159', title: 'Sort a LL of 0s 1s and 2s', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/given-a-linked-list-of-0s-1s-and-2s-sort-it/1', leetCodeUrl: null },
        ]
      },
      {
        id: 'll-2d',
        name: '6.2 Two Pointers in LinkedList',
        problems: [
          { id: '160', title: 'Find intersection point of Y LL', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/intersection-point-in-y-shapped-linked-lists/1', leetCodeUrl: 'https://leetcode.com/problems/intersection-of-two-linked-lists/' },
          { id: '161', title: 'Add 1 to a number represented by LL', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/add-1-to-a-number-represented-as-linked-list/1', leetCodeUrl: null },
          { id: '162', title: 'Add 2 numbers in LL', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/add-two-numbers-represented-by-linked-lists/1', leetCodeUrl: 'https://leetcode.com/problems/add-two-numbers/' },
          { id: '163', title: 'Delete all occurrences of a key in DLL', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/delete-all-occurrences-of-a-given-key-in-a-doubly-linked-list/1', leetCodeUrl: null },
          { id: '164', title: 'Find pairs with given sum in DLL', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/find-pairs-with-given-sum-in-doubly-linked-list/1', leetCodeUrl: null },
          { id: '165', title: 'Remove duplicates from Sorted DLL', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/remove-duplicates-from-a-sorted-doubly-linked-list/1', leetCodeUrl: null },
          { id: '166', title: 'Reverse LL in group of given size K', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/reverse-a-linked-list-in-groups-of-given-size/1', leetCodeUrl: 'https://leetcode.com/problems/reverse-nodes-in-k-group/' },
          { id: '167', title: 'Rotate a LL', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/rotate-a-linked-list/1', leetCodeUrl: 'https://leetcode.com/problems/rotate-list/' },
          { id: '168', title: 'Clone a Linked List with random and next pointer', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/clone-a-linked-list-with-next-and-random-pointer/1', leetCodeUrl: 'https://leetcode.com/problems/copy-list-with-random-pointer/' },
          { id: '169', title: 'Flatten a Multilevel Doubly Linked List', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/flattening-a-linked-list/1', leetCodeUrl: 'https://leetcode.com/problems/flatten-a-multilevel-doubly-linked-list/' },
          { id: '170', title: 'Copy List with Random Pointer', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/clone-a-linked-list-with-next-and-random-pointer/1', leetCodeUrl: 'https://leetcode.com/problems/copy-list-with-random-pointer/' },
          { id: '171', title: 'LRU Cache', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/lru-cache/1', leetCodeUrl: 'https://leetcode.com/problems/lru-cache/' },
          { id: '172', title: 'LFU Cache', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/lfu-cache/1', leetCodeUrl: 'https://leetcode.com/problems/lfu-cache/' },
          { id: '173', title: 'Design Linked List', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/design-linked-list/1', leetCodeUrl: 'https://leetcode.com/problems/design-linked-list/' },
        ]
      }
    ]
  },
  {
    id: 'recursion-backtracking',
    name: 'Step 7: Recursion [PatternWise]',
    subcategories: [
      {
        id: 'recursion-1',
        name: '7.1 Get a Strong Hold',
        problems: [
          { id: '187', title: 'Recursive Implementation of atoi()', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/implement-atoi/1', leetCodeUrl: 'https://leetcode.com/problems/string-to-integer-atoi/' },
          { id: '188', title: 'Pow(x, n)', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/power-of-numbers/0', leetCodeUrl: 'https://leetcode.com/problems/powx-n/' },
          { id: '189', title: 'Count Good numbers', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/good-numbers/0', leetCodeUrl: 'https://leetcode.com/problems/count-good-numbers/' },
          { id: '190', title: 'Sort a stack using recursion', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/sort-a-stack/1', leetCodeUrl: null },
          { id: '191', title: 'Reverse a stack using recursion', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/reverse-a-stack/1', leetCodeUrl: null },
          { id: '192', title: 'Generate all binary strings', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/generate-all-binary-strings/1', leetCodeUrl: null },
          { id: '193', title: 'Generate Paranthesis', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/generate-all-possible-parentheses/1', leetCodeUrl: 'https://leetcode.com/problems/generate-parentheses/' },
        ]
      },
      {
        id: 'recursion-subsequences',
        name: '7.2 Subsequences Pattern',
        problems: [
          { id: '194', title: 'Printing all subsequences/Power Set', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/power-set/0', leetCodeUrl: 'https://leetcode.com/problems/subsets/' },
          { id: '195', title: 'Print all the subsequences/Power Set', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/power-set/0', leetCodeUrl: 'https://leetcode.com/problems/subsets/' },
          { id: '196', title: 'Sum of all subsequences', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/sum-of-all-subsequences/1', leetCodeUrl: null },
          { id: '197', title: 'Check if there exists a subsequence with sum K', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/subsequence-with-sum-k/1', leetCodeUrl: null },
          { id: '198', title: 'Count all subsequences with sum K', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/subsequences-with-sum-k/1', leetCodeUrl: null },
          { id: '199', title: 'Combination Sum – 1', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/combination-sum/0', leetCodeUrl: 'https://leetcode.com/problems/combination-sum/' },
          { id: '200', title: 'Combination Sum – 2', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/combination-sum-part-2/0', leetCodeUrl: 'https://leetcode.com/problems/combination-sum-ii/' },
          { id: '201', title: 'Combination Sum III', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/combination-sum-iii/1', leetCodeUrl: 'https://leetcode.com/problems/combination-sum-iii/' },
          { id: '202', title: 'Letter Combinations of a Phone number', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/possible-words-from-phone-digits/0', leetCodeUrl: 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/' },
          { id: '203', title: 'Palindrome Partitioning', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/palindromic-patitioning/0', leetCodeUrl: 'https://leetcode.com/problems/palindrome-partitioning/' },
        ]
      },
      {
        id: 'recursion-hard',
        name: '7.3 Trying out all Combos / Hard Recursion',
        problems: [
          { id: '204', title: 'Word Search – 1', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/word-search/1', leetCodeUrl: 'https://leetcode.com/problems/word-search/' },
          { id: '205', title: 'Word Search – 2', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/word-boggle/0', leetCodeUrl: 'https://leetcode.com/problems/word-search-ii/' },
          { id: '206', title: 'N Queen', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/n-queen-problem/0', leetCodeUrl: 'https://leetcode.com/problems/n-queens/' },
          { id: '207', title: 'Sudoku Solver', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/solve-the-sudoku/0', leetCodeUrl: 'https://leetcode.com/problems/sudoku-solver/' },
          { id: '208', title: 'M Coloring Problem', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/m-coloring-problem/0', leetCodeUrl: null },
          { id: '209', title: 'Rat in a Maze', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/rat-in-a-maze-problem/1', leetCodeUrl: null },
          { id: '210', title: 'Permutation Sequence', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/permutation-sequence/1', leetCodeUrl: 'https://leetcode.com/problems/permutation-sequence/' },
          { id: '211', title: 'Beautiful Arrangement', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/beautiful-arrangement/1', leetCodeUrl: 'https://leetcode.com/problems/beautiful-arrangement/' },
        ]
      }
    ]
  },
  {
    id: 'bit-manipulation',
    name: 'Step 8: Bit Manipulation [Concepts & Problems]',
    subcategories: [
      {
        id: 'bit-learn',
        name: '8.1 Learn Bit Manipulation',
        problems: [
          { id: '211', title: 'Bit Manipulation', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/bit-manipulation/1', leetCodeUrl: null },
          { id: '212', title: 'Check for the ith bit', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/check-whether-k-th-bit-is-set-or-not/0', leetCodeUrl: null },
          { id: '213', title: 'Check for odd even', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/check-if-a-number-is-odd-or-even/0', leetCodeUrl: null },
          { id: '214', title: 'Check for the power of 2', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/power-of-2/0', leetCodeUrl: null },
          { id: '215', title: 'Set the rightmost unset bit', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/set-the-rightmost-unset-bit/1', leetCodeUrl: null },
          { id: '216', title: 'Swap two numbers without temporary variable', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/swap-two-numbers-without-using-temporary-variable/0', leetCodeUrl: null },
          { id: '217', title: 'Divide two numbers using bit manipulation', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/division-without-using-multiplication-division-and-mod-operator/1', leetCodeUrl: null },
          { id: '218', title: 'Count set bit from numbers 1 to n', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/count-set-bits-in-all-numbers-from-1-to-n/0', leetCodeUrl: null },
        ]
      },
      {
        id: 'bit-interview',
        name: '8.2 Interview Problems',
        problems: [
          { id: '219', title: 'Minimum bit flips', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/minimum-bit-flips/1', leetCodeUrl: null },
          { id: '220', title: 'Exceptionally odd', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/find-the-odd-occurence/0', leetCodeUrl: null },
          { id: '221', title: 'XOR of numbers from L to R', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/xor-of-a-given-range/1', leetCodeUrl: null },
        ]
      },
      {
        id: 'bit-advanced',
        name: '8.3 Advanced Maths',
        problems: [
          { id: '222', title: 'Prime factors of number', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/prime-factors-and-their-powers/0', leetCodeUrl: null },
          { id: '223', title: 'All divisors of number', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/all-divisors-of-a-natural-number/1', leetCodeUrl: null },
          { id: '224', title: 'Sieve of Eratosthenes', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/sieve-of-eratosthenes/0', leetCodeUrl: null },
          { id: '225', title: 'Prime factorization using Sieve', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/prime-factorization-using-sieve/1', leetCodeUrl: null },
          { id: '226', title: 'Fast Power', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/fast-power/1', leetCodeUrl: null },
          { id: '227', title: 'Count set bits in an integer', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/set-bits-count/0', leetCodeUrl: 'https://leetcode.com/problems/number-of-1-bits/' },
          { id: '228', title: 'Non Repeating Numbers', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/finding-the-numbers/0', leetCodeUrl: 'https://leetcode.com/problems/single-number-iii/' },
        ]
      }
    ]
  },
  {
    id: 'stack-queue',
    name: 'Step 9: Stack and Queues',
    subcategories: [
      {
        id: 'stack-learn',
        name: '9.1 Learning',
        problems: [
          { id: '227', title: 'Implement Stack using Arrays', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/implement-stack-using-array/1', leetCodeUrl: null },
          { id: '228', title: 'Implement Queue using Arrays', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/implement-queue-using-array/1', leetCodeUrl: null },
          { id: '229', title: 'Implement Stack using Queue (using single queue)', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/stack-using-two-queues/1', leetCodeUrl: 'https://leetcode.com/problems/implement-stack-using-queues/' },
          { id: '230', title: 'Implement Queue using Stack (0(H) pop)', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/queue-using-two-stacks/1', leetCodeUrl: 'https://leetcode.com/problems/implement-queue-using-stacks/' },
          { id: '231', title: 'Implement Stack using Linkedlist', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/implement-stack-using-linked-list/1', leetCodeUrl: null },
          { id: '232', title: 'Implement Queue using Linkedlist', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/implement-queue-using-linked-list/1', leetCodeUrl: null },
          { id: '233', title: 'Check for Balanced Parentheses', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/parenthesis-checker/0', leetCodeUrl: 'https://leetcode.com/problems/valid-parentheses/' },
          { id: '234', title: 'Implement Min Stack', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/get-minimum-element-from-stack/1', leetCodeUrl: 'https://leetcode.com/problems/min-stack/' },
          { id: '235', title: 'Infix to Postfix Conversion using Stack', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/infix-to-postfix/0', leetCodeUrl: null },
          { id: '236', title: 'Prefix to Infix Conversion', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/prefix-to-infix-conversion/1', leetCodeUrl: null },
          { id: '237', title: 'Prefix to Postfix Conversion', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/prefix-to-postfix-conversion/1', leetCodeUrl: null },
          { id: '238', title: 'Postfix to Prefix Conversion', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/postfix-to-prefix-conversion/1', leetCodeUrl: null },
          { id: '239', title: 'Postfix to Infix', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/postfix-to-infix-conversion/1', leetCodeUrl: null },
        ]
      },
      {
        id: 'stack-monotonic',
        name: '9.2 Monotonic Stack/Queue Problems [VVV. IMP]',
        problems: [
          { id: '256', title: 'Next Greater Element', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/next-larger-element/0', leetCodeUrl: 'https://leetcode.com/problems/next-greater-element-i/' },
          { id: '257', title: 'Next Greater Element 2', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/next-larger-element/0', leetCodeUrl: 'https://leetcode.com/problems/next-greater-element-ii/' },
          { id: '258', title: 'Next Smaller Element', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/immediate-smaller-element/0', leetCodeUrl: null },
          { id: '259', title: 'Number of NGEs to the right', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/number-of-nges-to-the-right/1', leetCodeUrl: null },
          { id: '260', title: 'Trapping Rainwater', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/trapping-rain-water/0', leetCodeUrl: 'https://leetcode.com/problems/trapping-rain-water/' },
          { id: '261', title: 'Sum of Subarray Minimum', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/sum-of-subarray-minimum/1', leetCodeUrl: 'https://leetcode.com/problems/sum-of-subarray-minimums/' },
          { id: '262', title: 'Asteroid Collision', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/asteroid-collision/1', leetCodeUrl: 'https://leetcode.com/problems/asteroid-collision/' },
          { id: '263', title: 'Sum of Subarray Ranges', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/sum-of-subarray-ranges/1', leetCodeUrl: 'https://leetcode.com/problems/sum-of-subarray-ranges/' },
          { id: '264', title: 'Remove K Digits', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/remove-k-digits/1', leetCodeUrl: 'https://leetcode.com/problems/remove-k-digits/' },
          { id: '265', title: 'Largest Rectangle in Histogram', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/maximum-rectangular-area-in-a-histogram/0', leetCodeUrl: 'https://leetcode.com/problems/largest-rectangle-in-histogram/' },
          { id: '266', title: 'Maximal Rectangles', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/max-rectangle/1', leetCodeUrl: 'https://leetcode.com/problems/maximal-rectangle/' },
          { id: '267', title: 'Sliding Window Maximum', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/sliding-window-maximum/1', leetCodeUrl: 'https://leetcode.com/problems/sliding-window-maximum/' },
          { id: '268', title: 'Online Stock Span', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/stock-span-problem/0', leetCodeUrl: 'https://leetcode.com/problems/online-stock-span/' },
          { id: '269', title: 'Celebrity Problem', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/the-celebrity-problem/1', leetCodeUrl: null },
          { id: '270', title: 'LRU Cache', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/lru-cache/1', leetCodeUrl: 'https://leetcode.com/problems/lru-cache/' },
          { id: '271', title: 'Next Greater Element 3', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/next-greater-element-iii/1', leetCodeUrl: 'https://leetcode.com/problems/next-greater-element-iii/' },
          { id: '272', title: 'Decode String', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/decode-string/1', leetCodeUrl: 'https://leetcode.com/problems/decode-string/' },
        ]
      }
    ]
  },
  {
    id: 'sliding-window',
    name: 'Step 10: Sliding Window & Two Pointers',
    subcategories: [
      {
        id: 'sw-concepts',
        name: '10.1 Sliding Window Concepts',
        problems: [
          { id: '271', title: 'Maximum Points You Can Obtain from Cards', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/maximum-points-you-can-obtain-from-cards/1', leetCodeUrl: 'https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards/' },
          { id: '272', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/longest-substring-without-repeating-characters/0', leetCodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
          { id: '273', title: 'Max Consecutive Ones III', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/max-consecutive-ones/1', leetCodeUrl: 'https://leetcode.com/problems/max-consecutive-ones-iii/' },
          { id: '274', title: 'Fruit Into Baskets', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/fruit-into-baskets/1', leetCodeUrl: 'https://leetcode.com/problems/fruit-into-baskets/' },
          { id: '275', title: 'Longest Repeating Character Replacement', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/longest-repeating-character-replacement/1', leetCodeUrl: 'https://leetcode.com/problems/longest-repeating-character-replacement/' },
          { id: '276', title: 'Binary Subarrays With Sum', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/binary-subarrays-with-sum/1', leetCodeUrl: 'https://leetcode.com/problems/binary-subarrays-with-sum/' },
          { id: '277', title: 'Count Number of Nice Subarrays', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/count-number-of-nice-subarrays/1', leetCodeUrl: 'https://leetcode.com/problems/count-number-of-nice-subarrays/' },
          { id: '278', title: 'Number of Substrings Containing All Three Characters', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/number-of-substrings-containing-all-three-characters/1', leetCodeUrl: 'https://leetcode.com/problems/number-of-substrings-containing-all-three-characters/' },
          { id: '279', title: 'Longest Substring with At Most K Distinct Characters', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/maximum-points-you-can-obtain-from-cards/1', leetCodeUrl: 'https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards/' },
          { id: '280', title: 'Count Subarrays With K Distinct Integers', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/smallest-window-in-a-string-containing-all-the-characters-of-another-string/0', leetCodeUrl: 'https://leetcode.com/problems/minimum-window-substring/' },
          { id: '281', title: 'Minimum Window Substring', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/minimum-window-subsequence/1', leetCodeUrl: 'https://leetcode.com/problems/minimum-window-subsequence/' },
          { id: '282', title: 'Subarrays with K Different Integers', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/subarrays-with-k-different-integers/1', leetCodeUrl: 'https://leetcode.com/problems/subarrays-with-k-different-integers/' },
        ]
      }
    ]
  },
  {
    id: 'heaps',
    name: 'Step 11: Heaps [Learning, Implementing, Interview]',
    subcategories: [
      {
        id: 'heap-learn',
        name: '11.1 Learning & Implementing',
        problems: [
          { id: '283', title: 'Introduction to Priority Queues using Binary Heaps', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/introduction-to-priority-queues-using-binary-heaps/1', leetCodeUrl: null },
          { id: '284', title: 'Min Heap and Max Heap Implementation', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/min-heap-and-max-heap-implementation/1', leetCodeUrl: null },
          { id: '285', title: 'Check if an Array Represents a Min-Heap', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/check-if-an-array-represents-a-min-heap/1', leetCodeUrl: null },
          { id: '286', title: 'Convert Min Heap to Max Heap', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/convert-min-heap-to-max-heap/1', leetCodeUrl: null },
          { id: '287', title: 'Kth Largest Element in an Array', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/kth-largest-element/0', leetCodeUrl: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
          { id: '288', title: 'Kth Smallest Element in an Array', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/kth-smallest-element/0', leetCodeUrl: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
          { id: '289', title: 'Sort K Sorted Array', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/nearly-sorted-algorithm/0', leetCodeUrl: null },
          { id: '290', title: 'Merge M Sorted Lists', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/merge-k-sorted-linked-lists/1', leetCodeUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/' },
        ]
      },
      {
        id: 'heap-problems',
        name: '11.2 Top K Elements / K Largest/Smallest Pattern',
        problems: [
          { id: '291', title: 'Top K Frequent Elements', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/top-k-frequent-elements/1', leetCodeUrl: 'https://leetcode.com/problems/top-k-frequent-elements/' },
          { id: '292', title: 'Top K Frequent Words', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/top-k-frequent-words/1', leetCodeUrl: 'https://leetcode.com/problems/top-k-frequent-words/' },
          { id: '293', title: 'K Closest Points to Origin', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/k-closest-points-to-origin/1', leetCodeUrl: 'https://leetcode.com/problems/k-closest-points-to-origin/' },
          { id: '294', title: 'Kth Largest Element in a Stream', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/kth-largest-element-in-a-stream/1', leetCodeUrl: 'https://leetcode.com/problems/kth-largest-element-in-a-stream/' },
          { id: '295', title: 'Reorganize String', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/reorganize-string/1', leetCodeUrl: 'https://leetcode.com/problems/reorganize-string/' },
          { id: '296', title: 'Task Scheduler', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/task-scheduler/1', leetCodeUrl: 'https://leetcode.com/problems/task-scheduler/' },
          { id: '297', title: 'Design Twitter', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/design-twitter/1', leetCodeUrl: 'https://leetcode.com/problems/design-twitter/' },
          { id: '298', title: 'Find Median from Data Stream', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/find-median-in-a-stream/0', leetCodeUrl: 'https://leetcode.com/problems/find-median-from-data-stream/' },
          { id: '299', title: 'Sliding Window Median', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/sliding-window-median/1', leetCodeUrl: 'https://leetcode.com/problems/sliding-window-median/' },
        ]
      }
    ]
  },
  {
    id: 'greedy',
    name: 'Step 12: Greedy Algorithms',
    subcategories: [
      {
        id: 'greedy-easy',
        name: '12.1 Easy Problems',
        problems: [
          { id: '300', title: 'Assign Cookies', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/assign-cookies/1', leetCodeUrl: 'https://leetcode.com/problems/assign-cookies/' },
          { id: '301', title: 'Lemonade Change', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/lemonade-change/1', leetCodeUrl: 'https://leetcode.com/problems/lemonade-change/' },
          { id: '302', title: 'Valid Parenthesis String', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/valid-parenthesis-string/1', leetCodeUrl: 'https://leetcode.com/problems/valid-parenthesis-string/' },
          { id: '303', title: 'Candy', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/candy/1', leetCodeUrl: 'https://leetcode.com/problems/candy/' },
        ]
      },
      {
        id: 'greedy-medium',
        name: '12.2 Medium/Hard Problems',
        problems: [
          { id: '304', title: 'Maximum Meetings in One Room', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/maximum-meetings-in-one-room/1', leetCodeUrl: null },
          { id: '305', title: 'Jump Game', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/jump-game/1', leetCodeUrl: 'https://leetcode.com/problems/jump-game/' },
          { id: '306', title: 'Jump Game II', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/minimum-number-of-jumps/0', leetCodeUrl: 'https://leetcode.com/problems/jump-game-ii/' },
          { id: '307', title: 'Minimum number of platforms required for a railway station', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/minimum-platforms/0', leetCodeUrl: null },
          { id: '308', title: 'Job Sequencing Problem', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/job-sequencing-problem/0', leetCodeUrl: null },
          { id: '309', title: 'Fractional Knapsack Problem', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/fractional-knapsack/0', leetCodeUrl: null },
          { id: '310', title: 'Minimum Cost to Cut a Board', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/minimum-cost-to-cut-a-board/1', leetCodeUrl: null },
          { id: '311', title: 'N meetings in one room', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/n-meetings-in-one-room/0', leetCodeUrl: null },
          { id: '312', title: 'Activity Selection (it is same as N meetings in one room)', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/activity-selection/0', leetCodeUrl: null },
          { id: '313', title: 'Gas Station', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/gas-station/1', leetCodeUrl: 'https://leetcode.com/problems/gas-station/' },
          { id: '314', title: 'Hand of Straights', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/hand-of-straights/1', leetCodeUrl: 'https://leetcode.com/problems/hand-of-straights/' },
          { id: '315', title: 'Minimum Cost to Hire K Workers', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/minimum-cost-to-hire-k-workers/1', leetCodeUrl: 'https://leetcode.com/problems/minimum-cost-to-hire-k-workers/' },
        ]
      }
    ]
  },
  {
    id: 'binary-trees',
    name: 'Step 13: Binary Trees',
    subcategories: [
      {
        id: 'bt-traversal',
        name: '13.1 Traversals',
        problems: [
          { id: '316', title: 'Introduction to Trees', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/introduction-to-trees/1', leetCodeUrl: null },
          { id: '317', title: 'Binary Tree Representation in C++', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/binary-tree-representation/1', leetCodeUrl: null },
          { id: '318', title: 'Binary Tree Representation in Java', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/binary-tree-representation/1', leetCodeUrl: null },
          { id: '319', title: 'Preorder Traversal of Binary Tree', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/preorder-traversal/1', leetCodeUrl: 'https://leetcode.com/problems/binary-tree-preorder-traversal/' },
          { id: '320', title: 'Inorder Traversal of Binary Tree', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/inorder-traversal/1', leetCodeUrl: 'https://leetcode.com/problems/binary-tree-inorder-traversal/' },
          { id: '321', title: 'Postorder Traversal of Binary Tree', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/postorder-traversal/1', leetCodeUrl: 'https://leetcode.com/problems/binary-tree-postorder-traversal/' },
          { id: '322', title: 'Level Order Traversal of Binary Tree', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/level-order-traversal/1', leetCodeUrl: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
          { id: '323', title: 'Iterative Preorder Traversal of Binary Tree', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/preorder-traversal/1', leetCodeUrl: 'https://leetcode.com/problems/binary-tree-preorder-traversal/' },
          { id: '324', title: 'Iterative Inorder Traversal of Binary Tree', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/inorder-traversal/1', leetCodeUrl: 'https://leetcode.com/problems/binary-tree-inorder-traversal/' },
          { id: '325', title: 'Iterative Postorder Traversal using 2 Stack', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/postorder-traversal/1', leetCodeUrl: 'https://leetcode.com/problems/binary-tree-postorder-traversal/' },
          { id: '326', title: 'Iterative Postorder Traversal using 1 Stack', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/postorder-traversal/1', leetCodeUrl: 'https://leetcode.com/problems/binary-tree-postorder-traversal/' },
        ]
      },
      {
        id: 'bt-medium',
        name: '13.2 Medium Problems',
        problems: [
          { id: '327', title: 'Height of a Binary Tree', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/height-of-binary-tree/1', leetCodeUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
          { id: '328', title: 'Diameter of Binary Tree', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/diameter-of-binary-tree/1', leetCodeUrl: 'https://leetcode.com/problems/diameter-of-binary-tree/' },
          { id: '329', title: 'Check if the Binary Tree is Balanced', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/check-for-balanced-tree/1', leetCodeUrl: 'https://leetcode.com/problems/balanced-binary-tree/' },
          { id: '330', title: 'Lowest Common Ancestor of a Binary Tree', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/lowest-common-ancestor-in-a-binary-tree/1', leetCodeUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/' },
          { id: '331', title: 'Check if two trees are identical', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/determine-if-two-trees-are-identical/1', leetCodeUrl: 'https://leetcode.com/problems/same-tree/' },
          { id: '332', title: 'Boundary Traversal of Binary Tree', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/boundary-traversal-of-binary-tree/1', leetCodeUrl: null },
          { id: '333', title: 'Zig Zag Traversal of Binary Tree', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/zigzag-tree-traversal/1', leetCodeUrl: 'https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/' },
          { id: '334', title: 'Vertical Order Traversal of Binary Tree', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/vertical-traversal-of-binary-tree/1', leetCodeUrl: 'https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/' },
          { id: '335', title: 'Top View of Binary Tree', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/top-view-of-binary-tree/1', leetCodeUrl: null },
          { id: '336', title: 'Bottom View of Binary Tree', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/bottom-view-of-binary-tree/1', leetCodeUrl: null },
          { id: '337', title: 'Right View of Binary Tree', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/right-view-of-binary-tree/1', leetCodeUrl: 'https://leetcode.com/problems/binary-tree-right-side-view/' },
          { id: '338', title: 'Left View of Binary Tree', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/left-view-of-binary-tree/1', leetCodeUrl: null },
          { id: '339', title: 'Symmetric Binary Tree', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/symmetric-tree/1', leetCodeUrl: 'https://leetcode.com/problems/symmetric-tree/' },
          { id: '340', title: 'Root to Node Path in Binary Tree', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/root-to-leaf-paths/1', leetCodeUrl: null },
          { id: '341', title: 'Max Width of Binary Tree', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/maximum-width-of-tree/1', leetCodeUrl: 'https://leetcode.com/problems/maximum-width-of-binary-tree/' },
        ]
      },
      {
        id: 'bt-hard',
        name: '13.3 Hard Problems',
        problems: [
          { id: '342', title: 'Flatten Binary Tree to LinkedList', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/flatten-binary-tree-to-linked-list/1', leetCodeUrl: 'https://leetcode.com/problems/flatten-binary-tree-to-linked-list/' },
          { id: '343', title: 'Children Sum Property in Binary Tree', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/children-sum-parent/1', leetCodeUrl: null },
          { id: '344', title: 'Count Total Nodes in a Complete Binary Tree', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/count-number-of-nodes-in-a-binary-tree/1', leetCodeUrl: 'https://leetcode.com/problems/count-complete-tree-nodes/' },
          { id: '345', title: 'Construct Binary Tree from Inorder and Preorder', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/construct-tree-1/1', leetCodeUrl: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/' },
          { id: '346', title: 'Construct Binary Tree from Inorder and Postorder', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/tree-from-postorder-and-inorder/1', leetCodeUrl: 'https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/' },
          { id: '347', title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/serialize-and-deserialize-a-binary-tree/1', leetCodeUrl: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/' },
          { id: '348', title: 'Morris Traversal of Binary Tree (Inorder)', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/morris-traversal/1', leetCodeUrl: null },
          { id: '349', title: 'Morris Traversal of Binary Tree (Preorder)', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/morris-traversal/1', leetCodeUrl: null },
          { id: '350', title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/maximum-path-sum/1', leetCodeUrl: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/' },
          { id: '351', title: 'Flatten Binary Tree to Linked List', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/flatten-binary-tree-to-linked-list/1', leetCodeUrl: 'https://leetcode.com/problems/flatten-binary-tree-to-linked-list/' },
          { id: '352', title: 'Populating Next Right Pointers in Each Node', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/connect-nodes-at-same-level/1', leetCodeUrl: 'https://leetcode.com/problems/populating-next-right-pointers-in-each-node/' },
          { id: '353', title: 'Vertical Order Traversal of Binary Tree', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/vertical-traversal-of-binary-tree/1', leetCodeUrl: 'https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/' },
          { id: '354', title: 'All Nodes Distance K in Binary Tree', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/nodes-at-given-distance-in-binary-tree/1', leetCodeUrl: 'https://leetcode.com/problems/all-nodes-distance-k-in-binary-tree/' },
        ]
      }
    ]
  },
  {
    id: 'bst',
    name: 'Step 14: Binary Search Trees',
    subcategories: [
      {
        id: 'bst-concepts',
        name: '14.1 Concepts',
        problems: [
          { id: '351', title: 'Introduction to Binary Search Tree', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/binary-search-trees/1', leetCodeUrl: null },
          { id: '352', title: 'Search in a Binary Search Tree', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/search-in-a-binary-search-tree/1', leetCodeUrl: 'https://leetcode.com/problems/search-in-a-binary-search-tree/' },
          { id: '353', title: 'Find Min/Max in BST', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/minimum-element-in-bst/1', leetCodeUrl: null },
        ]
      },
      {
        id: 'bst-problems',
        name: '14.2 Problems',
        problems: [
          { id: '354', title: 'Ceil in a Binary Search Tree', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/implementing-ceil-in-bst/1', leetCodeUrl: null },
          { id: '355', title: 'Floor in a Binary Search Tree', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/floor-in-bst/1', leetCodeUrl: null },
          { id: '356', title: 'Insert a given node in BST', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/insert-a-node-in-a-bst/1', leetCodeUrl: 'https://leetcode.com/problems/insert-into-a-binary-search-tree/' },
          { id: '357', title: 'Delete a Node in BST', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/delete-a-node-from-bst/1', leetCodeUrl: 'https://leetcode.com/problems/delete-node-in-a-bst/' },
          { id: '358', title: 'Kth Smallest/Largest Element in BST', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/kth-largest-element-in-bst/1', leetCodeUrl: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/' },
          { id: '359', title: 'Check if a tree is a BST or BT', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/check-for-bst/1', leetCodeUrl: 'https://leetcode.com/problems/validate-binary-search-tree/' },
          { id: '360', title: 'LCA of Two Nodes in BST', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/lowest-common-ancestor-in-a-bst/1', leetCodeUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/' },
          { id: '361', title: 'Construct BST from preorder traversal', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/construct-bst-from-preorder-traversal/1', leetCodeUrl: 'https://leetcode.com/problems/construct-binary-search-tree-from-preorder-traversal/' },
          { id: '362', title: 'Inorder Successor/Predecessor in BST', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/predecessor-and-successor/1', leetCodeUrl: null },
          { id: '363', title: 'Merge Two BSTs', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/merge-two-bst-s/1', leetCodeUrl: null },
          { id: '364', title: 'Two Sum in BST', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/find-a-pair-with-given-target-in-bst/1', leetCodeUrl: 'https://leetcode.com/problems/two-sum-iv-input-is-a-bst/' },
          { id: '365', title: 'Recover BST (Correct BST)', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/fixed-two-nodes-of-a-bst/1', leetCodeUrl: 'https://leetcode.com/problems/recover-binary-search-tree/' },
          { id: '366', title: 'Largest BST in Binary Tree', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/largest-bst/1', leetCodeUrl: null },
        ]
      }
    ]
  },
  {
    id: 'dynamic-programming',
    name: 'Step 15: Dynamic Programming',
    subcategories: [
      {
        id: 'dp-1d',
        name: '15.1 Introduction to DP',
        problems: [
          { id: '368', title: 'Dynamic Programming Introduction', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/introduction-to-dynamic-programming/1', leetCodeUrl: null },
          { id: '369', title: 'Climbing Stairs', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/count-ways-to-reach-the-nth-stair/0', leetCodeUrl: 'https://leetcode.com/problems/climbing-stairs/' },
          { id: '370', title: 'Frog Jump (Codestudio)', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/geeks-training/1', leetCodeUrl: null },
          { id: '371', title: 'Maximum sum of non-adjacent elements (House Robber)', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/stickler-theif/0', leetCodeUrl: 'https://leetcode.com/problems/house-robber/' },
          { id: '372', title: 'House Robber II', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/stickler-theif/0', leetCodeUrl: 'https://leetcode.com/problems/house-robber-ii/' },
          { id: '373', title: 'Ninjas Training / Geek Training', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/geeks-training/1', leetCodeUrl: null },
          { id: '374', title: 'Grid Unique Paths', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/number-of-paths/0', leetCodeUrl: 'https://leetcode.com/problems/unique-paths/' },
          { id: '375', title: 'Grid Unique Paths II (Obstacles)', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/number-of-paths-in-a-matrix-with-k-coins/0', leetCodeUrl: 'https://leetcode.com/problems/unique-paths-ii/' },
          { id: '376', title: 'Minimum Path Sum in Grid', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/path-in-matrix/0', leetCodeUrl: 'https://leetcode.com/problems/minimum-path-sum/' },
          { id: '377', title: 'Triangle Fixed Starting point Variable Ending point', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/triangle-path-sum/1', leetCodeUrl: 'https://leetcode.com/problems/triangle/' },
          { id: '378', title: 'Maximum Falling Path Sum (Variable Starting and Ending)', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/path-in-matrix/0', leetCodeUrl: 'https://leetcode.com/problems/minimum-falling-path-sum/' },
          { id: '379', title: 'Cherry Pickup II', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/cherry-pickup/1', leetCodeUrl: 'https://leetcode.com/problems/cherry-pickup-ii/' },
        ]
      },
      {
        id: 'dp-subsequences',
        name: '15.2 Subsequences / Subset DP',
        problems: [
          { id: '380', title: 'Subset Sum / Knapsack (Target Sum)', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/subset-sum-problem/0', leetCodeUrl: 'https://leetcode.com/problems/target-sum/' },
          { id: '381', title: 'Partition Equal Subset Sum', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/subset-sum-problem/0', leetCodeUrl: 'https://leetcode.com/problems/partition-equal-subset-sum/' },
          { id: '382', title: 'Partition Set Into 2 Subsets With Min Absolute Sum Diff', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/minimum-sum-partition/0', leetCodeUrl: null },
          { id: '383', title: 'Count Subsets with Sum K (DP - 17)', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/perfect-sum-problem/0', leetCodeUrl: null },
          { id: '384', title: 'Minimum Coins (Coin Change)', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/number-of-coins/0', leetCodeUrl: 'https://leetcode.com/problems/coin-change/' },
          { id: '385', title: 'Coin Change 2 (Count Ways)', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/coin-change/0', leetCodeUrl: 'https://leetcode.com/problems/coin-change-ii/' },
          { id: '386', title: 'Unbounded Knapsack', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/knapsack-with-duplicate-items/0', leetCodeUrl: null },
          { id: '387', title: 'Rod Cutting', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/rod-cutting/0', leetCodeUrl: 'https://leetcode.com/problems/minimum-cost-to-cut-a-stick/' },
          { id: '388', title: 'Longest Common Subsequence', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/longest-common-subsequence/0', leetCodeUrl: 'https://leetcode.com/problems/longest-common-subsequence/' },
          { id: '389', title: 'Longest Palindromic Subsequence', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/longest-palindromic-subsequence/0', leetCodeUrl: 'https://leetcode.com/problems/longest-palindromic-subsequence/' },
          { id: '390', title: 'Edit Distance', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/edit-distance/0', leetCodeUrl: 'https://leetcode.com/problems/edit-distance/' },
          { id: '391', title: 'Distinct Subsequences', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/distinct-occurrences/1', leetCodeUrl: 'https://leetcode.com/problems/distinct-subsequences/' },
          { id: '392', title: 'Wildcard Matching', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/wildcard-pattern-matching/1', leetCodeUrl: 'https://leetcode.com/problems/wildcard-matching/' },
          { id: '393', title: 'Regular Expression Matching', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/pattern-matching/1', leetCodeUrl: 'https://leetcode.com/problems/regular-expression-matching/' },
          { id: '394', title: 'Longest Increasing Subsequence', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/longest-increasing-subsequence/0', leetCodeUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/' },
          { id: '395', title: 'Printing Longest Increasing Subsequence', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/longest-increasing-subsequence/0', leetCodeUrl: null },
          { id: '396', title: 'Number of Longest Increasing Subsequences', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/number-of-longest-increasing-subsequence/1', leetCodeUrl: 'https://leetcode.com/problems/number-of-longest-increasing-subsequence/' },
          { id: '397', title: 'Matrix Chain Multiplication', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/matrix-chain-multiplication/0', leetCodeUrl: null },
          { id: '398', title: 'Burst Balloons', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/burst-balloons/1', leetCodeUrl: 'https://leetcode.com/problems/burst-balloons/' },
          { id: '399', title: 'Palindrome Partitioning II', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/palindromic-patitioning/0', leetCodeUrl: 'https://leetcode.com/problems/palindrome-partitioning-ii/' },
          { id: '400', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/stock-buy-and-sell/0', leetCodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
          { id: '401', title: 'Best Time to Buy and Sell Stock II', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/stock-buy-and-sell/0', leetCodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/' },
          { id: '402', title: 'Best Time to Buy and Sell Stock III', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/buy-maximum-stocks-if-i-stocks-can-be-bought-on-i-th-day/1', leetCodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/' },
          { id: '403', title: 'Best Time to Buy and Sell Stock IV', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/buy-maximum-stocks-if-i-stocks-can-be-bought-on-i-th-day/1', leetCodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/' },
          { id: '404', title: 'Best Time to Buy and Sell Stock with Cooldown', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/maximum-profit/0', leetCodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/' },
          { id: '405', title: 'Best Time to Buy and Sell Stock with Transaction Fee', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/maximum-profit/0', leetCodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/' },
          { id: '406', title: 'Word Break', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/word-break/0', leetCodeUrl: 'https://leetcode.com/problems/word-break/' },
          { id: '407', title: 'Word Break II', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/word-break-part-2/0', leetCodeUrl: 'https://leetcode.com/problems/word-break-ii/' },
          { id: '408', title: 'Minimum Insertions to Make String Palindrome', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/minimum-insertions-to-make-string-palindrome/1', leetCodeUrl: 'https://leetcode.com/problems/minimum-insertion-steps-to-make-a-string-palindrome/' },
          { id: '409', title: 'Minimum Insertions/Deletions to Convert String A to String B', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/minimum-deletitions1648/1', leetCodeUrl: 'https://leetcode.com/problems/minimum-ascii-delete-sum-for-two-strings/' },
          { id: '410', title: 'Shortest Common Supersequence', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/shortest-common-supersequence/0', leetCodeUrl: 'https://leetcode.com/problems/shortest-common-supersequence/' },
          { id: '411', title: 'Distinct Subsequences II', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/count-distinct-subsequences/1', leetCodeUrl: 'https://leetcode.com/problems/distinct-subsequences-ii/' },
          { id: '412', title: 'Interleaving String', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/interleaved-strings/1', leetCodeUrl: 'https://leetcode.com/problems/interleaving-string/' },
          { id: '413', title: 'Longest Increasing Subsequence (Binary Search)', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/longest-increasing-subsequence/0', leetCodeUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/' },
          { id: '414', title: 'Largest Divisible Subset', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/largest-divisible-subset/1', leetCodeUrl: 'https://leetcode.com/problems/largest-divisible-subset/' },
          { id: '415', title: 'Longest String Chain', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/longest-string-chain/1', leetCodeUrl: 'https://leetcode.com/problems/longest-string-chain/' },
          { id: '416', title: 'Longest Bitonic Subsequence', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/longest-bitonic-subsequence/0', leetCodeUrl: null },
          { id: '417', title: 'Maximum Sum Increasing Subsequence', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/maximum-sum-increasing-subsequence/0', leetCodeUrl: null },
          { id: '418', title: 'Russian Doll Envelopes', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/russian-doll-envelopes/1', leetCodeUrl: 'https://leetcode.com/problems/russian-doll-envelopes/' },
          { id: '419', title: 'Minimum Cost to Merge Stones', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/minimum-cost-to-merge-stones/1', leetCodeUrl: 'https://leetcode.com/problems/minimum-cost-to-merge-stones/' },
          { id: '420', title: 'Minimum Score of Triangulation', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/minimum-score-triangulation-of-polygon/1', leetCodeUrl: 'https://leetcode.com/problems/minimum-score-triangulation-of-polygon/' },
          { id: '421', title: 'Minimum Cost Tree From Leaf Values', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/minimum-cost-tree-from-leaf-values/1', leetCodeUrl: 'https://leetcode.com/problems/minimum-cost-tree-from-leaf-values/' },
          { id: '422', title: 'Scramble String', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/check-if-two-strings-are-k-anagrams/1', leetCodeUrl: 'https://leetcode.com/problems/scramble-string/' },
          { id: '423', title: 'Arithmetic Slices', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/arithmetic-number/0', leetCodeUrl: 'https://leetcode.com/problems/arithmetic-slices/' },
        ]
      }
    ]
  },
  {
    id: 'graphs',
    name: 'Step 16: Graphs',
    subcategories: [
      {
        id: 'graph-learning',
        name: '16.1 Learning / Basics',
        problems: [
          { id: '430', title: 'Graph and Types', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/graph-and-types/1', leetCodeUrl: null },
          { id: '431', title: 'Graph Representation (Adjacency Matrix / List)', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/print-adjacency-list/0', leetCodeUrl: null },
          { id: '432', title: 'Connected Components', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/number-of-provinces/1', leetCodeUrl: 'https://leetcode.com/problems/number-of-provinces/' },
          { id: '433', title: 'BFS (Breadth First Search)', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/bfs-traversal-of-graph/1', leetCodeUrl: null },
          { id: '434', title: 'DFS (Depth First Search)', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/1', leetCodeUrl: null },
          { id: '435', title: 'Number of Provinces', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/number-of-provinces/1', leetCodeUrl: 'https://leetcode.com/problems/number-of-provinces/' },
          { id: '436', title: 'Number of Islands', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/find-the-number-of-islands/1', leetCodeUrl: 'https://leetcode.com/problems/number-of-islands/' },
          { id: '437', title: 'Rotting Oranges', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/rotten-oranges/0', leetCodeUrl: 'https://leetcode.com/problems/rotting-oranges/' },
          { id: '438', title: 'Flood Fill', difficulty: 'Easy', gfgUrl: 'https://practice.geeksforgeeks.org/problems/flood-fill-algorithm/1', leetCodeUrl: 'https://leetcode.com/problems/flood-fill/' },
          { id: '439', title: 'Cycle Detection (Undirected Graph) BFS', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1', leetCodeUrl: null },
          { id: '440', title: 'Cycle Detection (Undirected Graph) DFS', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1', leetCodeUrl: null },
          { id: '441', title: 'Cycle Detection (Directed Graph) BFS (Kahn\'s Algorithm)', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1', leetCodeUrl: null },
          { id: '442', title: 'Cycle Detection (Directed Graph) DFS', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1', leetCodeUrl: null },
        ]
      },
      {
        id: 'graph-topo',
        name: '16.2 Topo Sort / Shortest Path / MST',
        problems: [
          { id: '443', title: 'Topological Sort (BFS - Kahn\'s Algorithm)', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/topological-sort/1', leetCodeUrl: null },
          { id: '444', title: 'Topological Sort (DFS)', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/topological-sort/1', leetCodeUrl: null },
          { id: '445', title: 'Course Schedule I (Possible to finish all courses)', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/prerequisite-tasks/1', leetCodeUrl: 'https://leetcode.com/problems/course-schedule/' },
          { id: '446', title: 'Course Schedule II (Find order to finish courses)', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/course-schedule/1', leetCodeUrl: 'https://leetcode.com/problems/course-schedule-ii/' },
          { id: '447', title: 'Alien Dictionary', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/alien-dictionary/1', leetCodeUrl: 'https://leetcode.com/problems/alien-dictionary/' },
          { id: '448', title: 'Shortest Path in UG with unit weights', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/shortest-path-in-undirected-graph/1', leetCodeUrl: null },
          { id: '449', title: 'Shortest Path in DAG', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/shortest-path-in-directed-acyclic-graph/1', leetCodeUrl: null },
          { id: '450', title: 'Dijkstra Algorithm (Priority Queue)', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1', leetCodeUrl: null },
          { id: '451', title: 'Bellman Ford Algorithm', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/distance-from-the-source-bellman-ford-algorithm/1', leetCodeUrl: null },
          { id: '452', title: 'Floyd Warshall Algorithm', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/implementing-floyd-warshall/0', leetCodeUrl: null },
          { id: '453', title: 'Minimum Spanning Tree (Prims Algorithm)', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/minimum-spanning-tree/1', leetCodeUrl: null },
          { id: '454', title: 'Minimum Spanning Tree (Kruskals Algorithm)', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/minimum-spanning-tree/1', leetCodeUrl: null },
          { id: '455', title: 'Cheapest Flights Within K Stops', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/cheapest-flights-within-k-stops/1', leetCodeUrl: 'https://leetcode.com/problems/cheapest-flights-within-k-stops/' },
          { id: '456', title: 'Network Delay Time', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/network-delay-time/1', leetCodeUrl: 'https://leetcode.com/problems/network-delay-time/' },
          { id: '457', title: 'Number of Ways to Arrive at Destination', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/number-of-ways-to-arrive-at-destination/1', leetCodeUrl: 'https://leetcode.com/problems/number-of-ways-to-arrive-at-destination/' },
          { id: '458', title: 'Minimum Multiplications to Reach End', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/minimum-multiplications-to-reach-end/1', leetCodeUrl: null },
          { id: '459', title: 'Word Ladder', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/word-ladder/1', leetCodeUrl: 'https://leetcode.com/problems/word-ladder/' },
          { id: '460', title: 'Word Ladder II', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/word-ladder-ii/1', leetCodeUrl: 'https://leetcode.com/problems/word-ladder-ii/' },
          { id: '461', title: 'Clone Graph', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/clone-graph/1', leetCodeUrl: 'https://leetcode.com/problems/clone-graph/' },
          { id: '462', title: 'Pacific Atlantic Water Flow', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/pacific-atlantic-water-flow/1', leetCodeUrl: 'https://leetcode.com/problems/pacific-atlantic-water-flow/' },
          { id: '463', title: 'Surrounded Regions', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/replace-os-with-xs/0', leetCodeUrl: 'https://leetcode.com/problems/surrounded-regions/' },
          { id: '464', title: 'Longest Increasing Path in Matrix', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/longest-increasing-path-in-a-matrix/1', leetCodeUrl: 'https://leetcode.com/problems/longest-increasing-path-in-a-matrix/' },
          { id: '465', title: 'Employee Importance', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/employee-importance/1', leetCodeUrl: 'https://leetcode.com/problems/employee-importance/' },
          { id: '466', title: 'Is Graph Bipartite?', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/bipartite-graph/1', leetCodeUrl: 'https://leetcode.com/problems/is-graph-bipartite/' },
          { id: '467', title: 'Keys and Rooms', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/keys-and-rooms/1', leetCodeUrl: 'https://leetcode.com/problems/keys-and-rooms/' },
          { id: '468', title: 'Regions Cut By Slashes', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/region-cut-by-slashes/1', leetCodeUrl: 'https://leetcode.com/problems/regions-cut-by-slashes/' },
          { id: '469', title: 'Time Needed to Inform All Employees', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/time-needed-to-inform-all-employees/1', leetCodeUrl: 'https://leetcode.com/problems/time-needed-to-inform-all-employees/' },
          { id: '470', title: 'Redundant Connection', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/redundant-connection/1', leetCodeUrl: 'https://leetcode.com/problems/redundant-connection/' },
          { id: '471', title: 'Most Stones Removed with Same Row or Column', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/remove-stones/1', leetCodeUrl: 'https://leetcode.com/problems/most-stones-removed-with-same-row-or-column/' },
          { id: '472', title: 'Accounts Merge', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/accounts-merge/1', leetCodeUrl: 'https://leetcode.com/problems/accounts-merge/' },
          { id: '473', title: 'Swim in Rising Water', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/swim-in-rising-water/1', leetCodeUrl: 'https://leetcode.com/problems/swim-in-rising-water/' },
          { id: '474', title: 'Reconstruct Itinerary', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/reconstruct-itinerary/1', leetCodeUrl: 'https://leetcode.com/problems/reconstruct-itinerary/' },
          { id: '475', title: 'Min Cost to Connect All Points', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/minimum-spanning-tree/1', leetCodeUrl: 'https://leetcode.com/problems/min-cost-to-connect-all-points/' },
          { id: '476', title: 'Critical Connections in a Network', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/critical-connections/1', leetCodeUrl: 'https://leetcode.com/problems/critical-connections-in-a-network/' },
          { id: '477', title: 'Find Critical and Pseudo-Critical Edges in MST', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/minimum-spanning-tree/1', leetCodeUrl: 'https://leetcode.com/problems/find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree/' },
          { id: '478', title: 'Course Schedule III', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/course-schedule/1', leetCodeUrl: 'https://leetcode.com/problems/course-schedule-iii/' },
          { id: '479', title: 'Bus Routes', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/bus-routes/1', leetCodeUrl: 'https://leetcode.com/problems/bus-routes/' },
          { id: '480', title: 'Robot Room Cleaner', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/robot-room-cleaner/1', leetCodeUrl: null },
          { id: '481', title: 'Make It Connected', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/connecting-the-graph/1', leetCodeUrl: null },
          { id: '482', title: 'Matrix Rank Transform', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/matrix-rank-transform/1', leetCodeUrl: 'https://leetcode.com/problems/rank-transform-of-a-matrix/' },
        ]
      }
    ]
  },
  {
    id: 'tries',
    name: 'Step 17: Tries',
    subcategories: [
      {
        id: 'trie-learning',
        name: '17.1 Learning / Basics',
        problems: [
          { id: '478', title: 'Implement Trie (Prefix Tree)', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/trie-insert-and-search/0', leetCodeUrl: 'https://leetcode.com/problems/implement-trie-prefix-tree/' },
          { id: '479', title: 'Implement Trie – 2 (Prefix Tree with count)', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/trie-insert-and-search/0', leetCodeUrl: null },
          { id: '480', title: 'Longest String with All Prefixes', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/longest-string-with-all-prefixes/1', leetCodeUrl: null },
          { id: '481', title: 'Number of Distinct Substrings in a String', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/count-of-distinct-substrings/1', leetCodeUrl: null },
          { id: '482', title: 'Maximum XOR of Two Numbers in an Array', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/maximum-xor-of-two-numbers-in-an-array/1', leetCodeUrl: 'https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/' },
          { id: '483', title: 'Maximum XOR With an Element From Array', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/maximum-xor-with-an-element-from-array/1', leetCodeUrl: 'https://leetcode.com/problems/maximum-xor-with-an-element-from-array/' },
          { id: '484', title: 'Word Search II', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/word-boggle/0', leetCodeUrl: 'https://leetcode.com/problems/word-search-ii/' },
        ]
      }
    ]
  },
  {
    id: 'strings-hard',
    name: 'Step 18: Strings [Hard Problems]',
    subcategories: [
      {
        id: 'strings-hard-section',
        name: '18.1 Hard String Problems',
        problems: [
          { id: '485', title: 'Minimum number of insertions to make parenthesis valid', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/minimum-number-of-insertions-to-make-string-palindrome/1', leetCodeUrl: null },
          { id: '486', title: 'Count and Say', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/count-and-say/1', leetCodeUrl: 'https://leetcode.com/problems/count-and-say/' },
          { id: '487', title: 'KMP or Z string matching algo', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/longest-prefix-suffix/0', leetCodeUrl: null },
          { id: '488', title: 'Longest Happy Prefix', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/longest-prefix-suffix/0', leetCodeUrl: 'https://leetcode.com/problems/longest-happy-prefix/' },
          { id: '489', title: 'Shortest Palindrome', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/minimum-characters-to-be-added-at-front-to-make-string-palindrome/1', leetCodeUrl: 'https://leetcode.com/problems/shortest-palindrome/' },
          { id: '490', title: 'Valid Parenthesis String', difficulty: 'Medium', gfgUrl: 'https://practice.geeksforgeeks.org/problems/valid-parenthesis-string/1', leetCodeUrl: 'https://leetcode.com/problems/valid-parenthesis-string/' },
          { id: '491', title: 'Edit Distance', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/edit-distance/0', leetCodeUrl: 'https://leetcode.com/problems/edit-distance/' },
          { id: '492', title: 'Word Wrap', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/word-wrap/0', leetCodeUrl: null },
          { id: '493', title: 'Palindrome Partitioning II', difficulty: 'Hard', gfgUrl: 'https://practice.geeksforgeeks.org/problems/palindromic-patitioning/0', leetCodeUrl: 'https://leetcode.com/problems/palindrome-partitioning-ii/' },
        ]
      }
    ]
  },
];

// Calculate totals
export const getStriversA2ZStats = () => {
  let total = 0;
  let easy = 0;
  let medium = 0;
  let hard = 0;

  striversA2ZCategories.forEach(category => {
    category.subcategories?.forEach(sub => {
      total += sub.problems.length;
      sub.problems.forEach(p => {
        if (p.difficulty === 'Easy') easy++;
        else if (p.difficulty === 'Medium') medium++;
        else if (p.difficulty === 'Hard') hard++;
      });
    });
  });

  return { total, easy, medium, hard, categories: striversA2ZCategories.length };
};

export const getProblemById = (id) => {
  for (const category of striversA2ZCategories) {
    for (const sub of category.subcategories || []) {
      const problem = sub.problems.find(p => p.id === id);
      if (problem) return { ...problem, category: category.name, subcategory: sub.name };
    }
  }
  return null;
};
