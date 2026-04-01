// Microsoft Interview Questions - 250+ Most Frequently Asked Problems
// Organized by topic categories for SDE freshers/interview preparation
// Sources: LeetCode Premium company tags, Interview experiences (2023-2025), GeeksforGeeks

export const microsoftInterviewCategories = [
  {
    id: 'arrays-hashing',
    name: 'Arrays & Hashing',
    problems: [
      { id: 'MS001', title: 'Two Sum', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/two-sum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/key-pair5616/1' },
      { id: 'MS002', title: 'Contains Duplicate', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/contains-duplicate/', gfgUrl: 'https://www.geeksforgeeks.org/problems/duplicates-in-an-array/1' },
      { id: 'MS003', title: 'Valid Anagram', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/valid-anagram/', gfgUrl: 'https://www.geeksforgeeks.org/problems/anagram/1' },
      { id: 'MS004', title: 'Group Anagrams', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/group-anagrams/', gfgUrl: 'https://www.geeksforgeeks.org/problems/k-anagrams-1/1' },
      { id: 'MS005', title: 'Top K Frequent Elements', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/top-k-frequent-elements/', gfgUrl: 'https://www.geeksforgeeks.org/problems/top-k-frequent-elements/1' },
      { id: 'MS006', title: 'Product of Array Except Self', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/product-of-array-except-self/', gfgUrl: 'https://www.geeksforgeeks.org/problems/product-array-puzzle/1' },
      { id: 'MS007', title: 'Longest Consecutive Sequence', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/longest-consecutive-sequence/', gfgUrl: 'https://www.geeksforgeeks.org/problems/longest-consecutive-subsequence/1' },
      { id: 'MS008', title: 'Kth Largest Element in Array', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', gfgUrl: 'https://www.geeksforgeeks.org/problems/kth-largest-element/1' },
      { id: 'MS009', title: 'First Missing Positive', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/first-missing-positive/', gfgUrl: 'https://www.geeksforgeeks.org/problems/first-missing-positive/1' },
      { id: 'MS010', title: 'Find All Duplicates in Array', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/find-all-duplicates-in-an-array/', gfgUrl: null },
      { id: 'MS011', title: 'Majority Element', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/majority-element/', gfgUrl: 'https://www.geeksforgeeks.org/problems/majority-element/1' },
      { id: 'MS012', title: 'Majority Element II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/majority-element-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/majority-vote/1' },
      { id: 'MS013', title: 'Subarray Sum Equals K', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/subarray-sum-equals-k/', gfgUrl: 'https://www.geeksforgeeks.org/problems/subarrays-with-sum-k/1' },
      { id: 'MS014', title: 'Maximum Subarray', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/maximum-subarray/', gfgUrl: 'https://www.geeksforgeeks.org/problems/kadanes-algorithm/1' },
      { id: 'MS015', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', gfgUrl: 'https://www.geeksforgeeks.org/problems/stock-buy-and-sell/1' },
      { id: 'MS016', title: 'Move Zeroes', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/move-zeroes/', gfgUrl: 'https://www.geeksforgeeks.org/problems/move-all-zeroes-to-end-of-array0751/1' },
      { id: 'MS017', title: 'Next Permutation', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/next-permutation/', gfgUrl: 'https://www.geeksforgeeks.org/problems/next-permutation5226/1' },
      { id: 'MS018', title: 'Set Matrix Zeroes', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/set-matrix-zeroes/', gfgUrl: 'https://www.geeksforgeeks.org/problems/boolean-matrix-problem/1' },
      { id: 'MS019', title: 'Spiral Matrix', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/spiral-matrix/', gfgUrl: 'https://www.geeksforgeeks.org/problems/spirally-traversing-a-matrix/1' },
      { id: 'MS020', title: 'Rotate Image', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/rotate-image/', gfgUrl: 'https://www.geeksforgeeks.org/problems/rotate-by-90-degree/1' },
      { id: 'MS021', title: 'Find the Duplicate Number', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/find-the-duplicate-number/', gfgUrl: 'https://www.geeksforgeeks.org/problems/find-duplicate-in-array/1' },
      { id: 'MS022', title: 'Find All Numbers Disappeared in Array', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/find-all-numbers-disappeared-in-an-array/', gfgUrl: null },
    ]
  },
  {
    id: 'two-pointers',
    name: 'Two Pointers',
    problems: [
      { id: 'MS023', title: '3Sum', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/3sum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/triplets-with-sum-with-given-range/1' },
      { id: 'MS024', title: '3Sum Closest', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/3sum-closest/', gfgUrl: 'https://www.geeksforgeeks.org/problems/three-sum-closest/1' },
      { id: 'MS025', title: 'Container With Most Water', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/container-with-most-water/', gfgUrl: 'https://www.geeksforgeeks.org/problems/container-with-most-water/1' },
      { id: 'MS026', title: 'Trapping Rain Water', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/trapping-rain-water/', gfgUrl: 'https://www.geeksforgeeks.org/problems/trapping-rain-water/1' },
      { id: 'MS027', title: 'Valid Palindrome', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/valid-palindrome/', gfgUrl: 'https://www.geeksforgeeks.org/problems/palindrome-string/1' },
      { id: 'MS028', title: 'Valid Palindrome II', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/valid-palindrome-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/valid-palindrome/1' },
      { id: 'MS029', title: 'Two Sum II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/', gfgUrl: 'https://www.geeksforgeeks.org/problems/pair-in-array-whose-sum-is-closest-to-x/1' },
      { id: 'MS030', title: 'Sort Colors', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/sort-colors/', gfgUrl: 'https://www.geeksforgeeks.org/problems/sort-an-array-of-0s-1s-and-2s/1' },
      { id: 'MS031', title: 'Remove Duplicates from Sorted Array', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/', gfgUrl: 'https://www.geeksforgeeks.org/problems/remove-duplicate-elements-from-sorted-array/1' },
      { id: 'MS032', title: '4Sum', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/4sum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/find-all-four-sum-numbers/1' },
      { id: 'MS033', title: 'Boats to Save People', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/boats-to-save-people/', gfgUrl: 'https://www.geeksforgeeks.org/problems/boats-to-save-people/1' },
      { id: 'MS034', title: 'Merge Sorted Array', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/merge-sorted-array/', gfgUrl: 'https://www.geeksforgeeks.org/problems/merge-two-sorted-arrays/1' },
      { id: 'MS035', title: 'Backspace String Compare', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/backspace-string-compare/', gfgUrl: 'https://www.geeksforgeeks.org/problems/backspace-string-compare/1' },
    ]
  },
  {
    id: 'sliding-window',
    name: 'Sliding Window',
    problems: [
      { id: 'MS036', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', gfgUrl: 'https://www.geeksforgeeks.org/problems/longest-distinct-characters-in-string/1' },
      { id: 'MS037', title: 'Longest Repeating Character Replacement', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/longest-repeating-character-replacement/', gfgUrl: null },
      { id: 'MS038', title: 'Permutation in String', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/permutation-in-string/', gfgUrl: 'https://www.geeksforgeeks.org/problems/check-if-two-strings-are-permutations-of-each-other/1' },
      { id: 'MS039', title: 'Minimum Window Substring', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/minimum-window-substring/', gfgUrl: 'https://www.geeksforgeeks.org/problems/smallest-window-in-a-string-containing-all-the-characters-of-another-string/1' },
      { id: 'MS040', title: 'Sliding Window Maximum', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/sliding-window-maximum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/maximum-of-all-subarrays-of-size-k/1' },
      { id: 'MS041', title: 'Max Consecutive Ones III', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/max-consecutive-ones-iii/', gfgUrl: null },
      { id: 'MS042', title: 'Fruit Into Baskets', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/fruit-into-baskets/', gfgUrl: 'https://www.geeksforgeeks.org/problems/fruit-into-baskets/1' },
      { id: 'MS043', title: 'Subarray Product Less Than K', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/subarray-product-less-than-k/', gfgUrl: 'https://www.geeksforgeeks.org/problems/count-subarray-with-k-product/1' },
      { id: 'MS044', title: 'Find All Anagrams in String', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/find-all-anagrams-in-a-string/', gfgUrl: 'https://www.geeksforgeeks.org/problems/count-occurences-of-anagrams/1' },
    ]
  },
  {
    id: 'stack-queue',
    name: 'Stack & Queue',
    problems: [
      { id: 'MS045', title: 'Valid Parentheses', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/valid-parentheses/', gfgUrl: 'https://www.geeksforgeeks.org/problems/parenthesis-checker/1' },
      { id: 'MS046', title: 'Min Stack', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/min-stack/', gfgUrl: 'https://www.geeksforgeeks.org/problems/get-minimum-element-from-stack/1' },
      { id: 'MS047', title: 'Evaluate Reverse Polish Notation', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/', gfgUrl: 'https://www.geeksforgeeks.org/problems/evaluate-the-expression/1' },
      { id: 'MS048', title: 'Generate Parentheses', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/generate-parentheses/', gfgUrl: 'https://www.geeksforgeeks.org/problems/generate-all-parentheses/1' },
      { id: 'MS049', title: 'Daily Temperatures', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/daily-temperatures/', gfgUrl: 'https://www.geeksforgeeks.org/problems/number-of-nges-to-the-right/1' },
      { id: 'MS050', title: 'Next Greater Element I', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/next-greater-element-i/', gfgUrl: 'https://www.geeksforgeeks.org/problems/next-larger-element/1' },
      { id: 'MS051', title: 'Next Greater Element II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/next-greater-element-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/next-greater-element/1' },
      { id: 'MS052', title: 'Largest Rectangle in Histogram', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/largest-rectangle-in-histogram/', gfgUrl: 'https://www.geeksforgeeks.org/problems/maximum-rectangular-area-in-a-histogram/1' },
      { id: 'MS053', title: 'Maximal Rectangle', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/maximal-rectangle/', gfgUrl: 'https://www.geeksforgeeks.org/problems/max-rectangle/1' },
      { id: 'MS054', title: 'Car Fleet', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/car-fleet/', gfgUrl: null },
      { id: 'MS055', title: 'Asteroid Collision', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/asteroid-collision/', gfgUrl: 'https://www.geeksforgeeks.org/problems/asteroid-collision/1' },
      { id: 'MS056', title: 'Remove K Digits', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/remove-k-digits/', gfgUrl: 'https://www.geeksforgeeks.org/problems/remove-k-digits/1' },
      { id: 'MS057', title: 'Decode String', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/decode-string/', gfgUrl: 'https://www.geeksforgeeks.org/problems/decode-the-string/1' },
      { id: 'MS058', title: 'Simplify Path', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/simplify-path/', gfgUrl: 'https://www.geeksforgeeks.org/problems/simplify-path/1' },
      { id: 'MS059', title: 'Stock Span Problem', difficulty: 'Medium', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/stock-span-problem-1587115621/1' },
    ]
  },
  {
    id: 'linked-list',
    name: 'Linked List',
    problems: [
      { id: 'MS060', title: 'Reverse Linked List', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/reverse-linked-list/', gfgUrl: 'https://www.geeksforgeeks.org/problems/reverse-a-linked-list/1' },
      { id: 'MS061', title: 'Merge Two Sorted Lists', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/', gfgUrl: 'https://www.geeksforgeeks.org/problems/merge-two-sorted-linked-lists/1' },
      { id: 'MS062', title: 'Linked List Cycle', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/linked-list-cycle/', gfgUrl: 'https://www.geeksforgeeks.org/problems/detect-loop-in-linked-list/1' },
      { id: 'MS063', title: 'Linked List Cycle II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/linked-list-cycle-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/find-the-first-node-of-loop-in-linked-list/1' },
      { id: 'MS064', title: 'Remove Nth Node From End of List', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', gfgUrl: 'https://www.geeksforgeeks.org/problems/remove-nth-node-from-end-of-list/1' },
      { id: 'MS065', title: 'Add Two Numbers', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/add-two-numbers/', gfgUrl: 'https://www.geeksforgeeks.org/problems/add-two-numbers-represented-by-linked-lists/1' },
      { id: 'MS066', title: 'Copy List with Random Pointer', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/copy-list-with-random-pointer/', gfgUrl: 'https://www.geeksforgeeks.org/problems/clone-a-linked-list-with-next-and-random-pointer/1' },
      { id: 'MS067', title: 'Flatten a Multilevel Doubly Linked List', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/flatten-a-multilevel-doubly-linked-list/', gfgUrl: 'https://www.geeksforgeeks.org/problems/flattening-a-linked-list/1' },
      { id: 'MS068', title: 'Rotate List', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/rotate-list/', gfgUrl: 'https://www.geeksforgeeks.org/problems/rotate-a-linked-list/1' },
      { id: 'MS069', title: 'Partition List', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/partition-list/', gfgUrl: 'https://www.geeksforgeeks.org/problems/partition-a-linked-list-around-a-given-value/1' },
      { id: 'MS070', title: 'LRU Cache', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/lru-cache/', gfgUrl: 'https://www.geeksforgeeks.org/problems/lru-cache/1' },
      { id: 'MS071', title: 'LFU Cache', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/lfu-cache/', gfgUrl: 'https://www.geeksforgeeks.org/problems/lfu-cache/1' },
      { id: 'MS072', title: 'Merge k Sorted Lists', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/', gfgUrl: 'https://www.geeksforgeeks.org/problems/merge-k-sorted-linked-lists/1' },
      { id: 'MS073', title: 'Reverse Nodes in k-Group', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/reverse-nodes-in-k-group/', gfgUrl: 'https://www.geeksforgeeks.org/problems/reverse-a-linked-list-in-groups-of-given-size/1' },
      { id: 'MS074', title: 'Design Linked List', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/design-linked-list/', gfgUrl: 'https://www.geeksforgeeks.org/problems/design-linked-list/1' },
      { id: 'MS075', title: 'Middle of the Linked List', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/middle-of-the-linked-list/', gfgUrl: 'https://www.geeksforgeeks.org/problems/finding-middle-element-in-a-linked-list/1' },
      { id: 'MS076', title: 'Palindrome Linked List', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/palindrome-linked-list/', gfgUrl: 'https://www.geeksforgeeks.org/problems/check-if-linked-list-is-pallindrome/1' },
      { id: 'MS077', title: 'Intersection of Two Linked Lists', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/intersection-of-two-linked-lists/', gfgUrl: 'https://www.geeksforgeeks.org/problems/intersection-point-in-y-shaped-linked-lists/1' },
      { id: 'MS078', title: 'Detect and Remove Loop', difficulty: 'Medium', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/remove-loop-in-linked-list/1' },
    ]
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    problems: [
      { id: 'MS079', title: 'Binary Search', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/binary-search/', gfgUrl: 'https://www.geeksforgeeks.org/problems/binary-search/1' },
      { id: 'MS080', title: 'Search in Rotated Sorted Array', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', gfgUrl: 'https://www.geeksforgeeks.org/problems/search-in-a-rotated-array/1' },
      { id: 'MS081', title: 'Search in Rotated Sorted Array II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/search-in-rotated-sorted-array/1' },
      { id: 'MS082', title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-element-in-a-sorted-and-rotated-array/1' },
      { id: 'MS083', title: 'Find Peak Element', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/find-peak-element/', gfgUrl: 'https://www.geeksforgeeks.org/problems/peak-element/1' },
      { id: 'MS084', title: 'Search a 2D Matrix', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/search-a-2d-matrix/', gfgUrl: 'https://www.geeksforgeeks.org/problems/search-in-a-matrix/1' },
      { id: 'MS085', title: 'Search a 2D Matrix II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/search-a-2d-matrix-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/search-in-a-matrix17292717/1' },
      { id: 'MS086', title: 'Koko Eating Bananas', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/koko-eating-bananas/', gfgUrl: 'https://www.geeksforgeeks.org/problems/koko-eating-bananas/1' },
      { id: 'MS087', title: 'Capacity To Ship Packages Within D Days', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/', gfgUrl: 'https://www.geeksforgeeks.org/problems/capacity-to-ship-packages-within-d-days/1' },
      { id: 'MS088', title: 'Median of Two Sorted Arrays', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/median-of-two-sorted-arrays/', gfgUrl: 'https://www.geeksforgeeks.org/problems/median-of-two-sorted-arrays/1' },
      { id: 'MS089', title: 'Split Array Largest Sum', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/split-array-largest-sum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/split-array-largest-sum/1' },
      { id: 'MS090', title: 'Find K Closest Elements', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/find-k-closest-elements/', gfgUrl: 'https://www.geeksforgeeks.org/problems/find-k-closest-elements/1' },
      { id: 'MS091', title: 'Time Based Key-Value Store', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/time-based-key-value-store/', gfgUrl: 'https://www.geeksforgeeks.org/problems/time-based-key-value-store/1' },
      { id: 'MS092', title: 'Single Element in a Sorted Array', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/single-element-in-a-sorted-array/', gfgUrl: 'https://www.geeksforgeeks.org/problems/find-the-element-that-appears-once-in-sorted-array/1' },
      { id: 'MS093', title: 'Sqrt(x)', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/sqrtx/', gfgUrl: 'https://www.geeksforgeeks.org/problems/square-root/1' },
    ]
  },
  {
    id: 'trees',
    name: 'Trees',
    problems: [
      { id: 'MS094', title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/maximum-depth-of-binary-tree/1' },
      { id: 'MS095', title: 'Same Tree', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/same-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/determine-if-two-trees-are-identical/1' },
      { id: 'MS096', title: 'Invert Binary Tree', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/invert-binary-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/mirror-tree/1' },
      { id: 'MS097', title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', gfgUrl: 'https://www.geeksforgeeks.org/problems/level-order-traversal/1' },
      { id: 'MS098', title: 'Binary Tree Zigzag Level Order Traversal', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/', gfgUrl: 'https://www.geeksforgeeks.org/problems/zigzag-tree-traversal/1' },
      { id: 'MS099', title: 'Binary Tree Right Side View', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/binary-tree-right-side-view/', gfgUrl: 'https://www.geeksforgeeks.org/problems/right-view-of-binary-tree/1' },
      { id: 'MS100', title: 'Top View of Binary Tree', difficulty: 'Medium', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/top-view-of-binary-tree/1' },
      { id: 'MS101', title: 'Bottom View of Binary Tree', difficulty: 'Medium', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/bottom-view-of-binary-tree/1' },
      { id: 'MS102', title: 'Vertical Order Traversal', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/vertical-traversal-of-binary-tree/1' },
      { id: 'MS103', title: 'Binary Tree Paths', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/binary-tree-paths/', gfgUrl: 'https://www.geeksforgeeks.org/problems/binary-tree-paths/1' },
      { id: 'MS104', title: 'Path Sum', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/path-sum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/root-to-leaf-path-sum/1' },
      { id: 'MS105', title: 'Path Sum II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/path-sum-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/paths-from-root-with-a-specified-sum/1' },
      { id: 'MS106', title: 'Path Sum III', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/path-sum-iii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/k-sum-paths/1' },
      { id: 'MS107', title: 'Subtree of Another Tree', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/subtree-of-another-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/check-if-subtree/1' },
      { id: 'MS108', title: 'Lowest Common Ancestor of Binary Tree', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/lowest-common-ancestor-in-a-binary-tree/1' },
      { id: 'MS109', title: 'Lowest Common Ancestor of BST', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/lowest-common-ancestor-in-a-bst/1' },
      { id: 'MS110', title: 'Diameter of Binary Tree', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/diameter-of-binary-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/diameter-of-binary-tree/1' },
      { id: 'MS111', title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/maximum-path-sum-from-any-node/1' },
      { id: 'MS112', title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/serialize-and-deserialize-a-binary-tree/1' },
      { id: 'MS113', title: 'Validate Binary Search Tree', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/validate-binary-search-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/check-for-bst/1' },
      { id: 'MS114', title: 'Kth Smallest Element in a BST', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/', gfgUrl: 'https://www.geeksforgeeks.org/problems/kth-largest-element-in-bst/1' },
      { id: 'MS115', title: 'Convert Sorted Array to BST', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/array-to-bst/1' },
      { id: 'MS116', title: 'Balance Unbalanced BST', difficulty: 'Medium', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/binary-tree-to-bst/1' },
    ]
  },
  {
    id: 'heap',
    name: 'Heap & Priority Queue',
    problems: [
      { id: 'MS117', title: 'Kth Largest Element in an Array', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', gfgUrl: 'https://www.geeksforgeeks.org/problems/kth-largest-element/1' },
      { id: 'MS118', title: 'Find Median from Data Stream', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/find-median-from-data-stream/', gfgUrl: 'https://www.geeksforgeeks.org/problems/find-median-in-a-stream/1' },
      { id: 'MS119', title: 'Merge k Sorted Lists', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/', gfgUrl: 'https://www.geeksforgeeks.org/problems/merge-k-sorted-linked-lists/1' },
      { id: 'MS120', title: 'Top K Frequent Elements', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/top-k-frequent-elements/', gfgUrl: 'https://www.geeksforgeeks.org/problems/top-k-frequent-elements/1' },
      { id: 'MS121', title: 'Task Scheduler', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/task-scheduler/', gfgUrl: 'https://www.geeksforgeeks.org/problems/task-scheduler/1' },
      { id: 'MS122', title: 'Design Twitter', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/design-twitter/', gfgUrl: 'https://www.geeksforgeeks.org/problems/design-twitter/1' },
      { id: 'MS123', title: 'Reorganize String', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/reorganize-string/', gfgUrl: 'https://www.geeksforgeeks.org/problems/reorganize-the-array/1' },
      { id: 'MS124', title: 'Minimum Cost to Connect Sticks', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/minimum-cost-to-connect-sticks/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-cost-of-ropes/1' },
      { id: 'MS125', title: 'Maximum Performance of a Team', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/maximum-performance-of-a-team/', gfgUrl: 'https://www.geeksforgeeks.org/problems/maximum-performance-of-a-team/1' },
      { id: 'MS126', title: 'Smallest Range Covering Elements from K Lists', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/', gfgUrl: 'https://www.geeksforgeeks.org/problems/find-smallest-range-containing-elements-from-k-lists/1' },
      { id: 'MS127', title: 'Sliding Window Maximum', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/sliding-window-maximum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/maximum-of-all-subarrays-of-size-k/1' },
      { id: 'MS128', title: 'Meeting Rooms II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/meeting-rooms-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-platforms/1' },
      { id: 'MS129', title: 'K Closest Points to Origin', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/k-closest-points-to-origin/', gfgUrl: 'https://www.geeksforgeeks.org/problems/k-closest-points-to-origin/1' },
      { id: 'MS130', title: 'Heap Sort Implementation', difficulty: 'Medium', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/heap-sort/1' },
    ]
  },
  {
    id: 'backtracking',
    name: 'Backtracking',
    problems: [
      { id: 'MS131', title: 'Subsets', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/subsets/', gfgUrl: 'https://www.geeksforgeeks.org/problems/subsets/1' },
      { id: 'MS132', title: 'Subsets II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/subsets-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/subsets-ii/1' },
      { id: 'MS133', title: 'Combinations', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/combinations/', gfgUrl: 'https://www.geeksforgeeks.org/problems/combinations/1' },
      { id: 'MS134', title: 'Combination Sum', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/combination-sum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/combination-sum/1' },
      { id: 'MS135', title: 'Combination Sum II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/combination-sum-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/combination-sum-ii/1' },
      { id: 'MS136', title: 'Combination Sum III', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/combination-sum-iii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/combination-sum-iii/1' },
      { id: 'MS137', title: 'Permutations', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/permutations/', gfgUrl: 'https://www.geeksforgeeks.org/problems/permutations-of-a-given-string/1' },
      { id: 'MS138', title: 'Permutations II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/permutations-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/permutations-ii/1' },
      { id: 'MS139', title: 'N-Queens', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/n-queens/', gfgUrl: 'https://www.geeksforgeeks.org/problems/n-queen-problem/1' },
      { id: 'MS140', title: 'N-Queens II', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/n-queens-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/n-queen-problem/1' },
      { id: 'MS141', title: 'Sudoku Solver', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/sudoku-solver/', gfgUrl: 'https://www.geeksforgeeks.org/problems/solve-the-sudoku/1' },
      { id: 'MS142', title: 'Word Search', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/word-search/', gfgUrl: 'https://www.geeksforgeeks.org/problems/word-search/1' },
      { id: 'MS143', title: 'Letter Combinations of Phone Number', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/', gfgUrl: 'https://www.geeksforgeeks.org/problems/letter-combinations-of-a-phone-number/1' },
      { id: 'MS144', title: 'Generate Parentheses', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/generate-parentheses/', gfgUrl: 'https://www.geeksforgeeks.org/problems/generate-all-parentheses/1' },
      { id: 'MS145', title: 'Palindrome Partitioning', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/palindrome-partitioning/', gfgUrl: 'https://www.geeksforgeeks.org/problems/palindromic-partitioning/1' },
      { id: 'MS146', title: 'Restore IP Addresses', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/restore-ip-addresses/', gfgUrl: 'https://www.geeksforgeeks.org/problems/generate-ip-addresses/1' },
      { id: 'MS147', title: 'Expression Add Operators', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/expression-add-operators/', gfgUrl: 'https://www.geeksforgeeks.org/problems/expression-add-operators/1' },
      { id: 'MS148', title: 'Partition to K Equal Sum Subsets', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/partition-to-k-equal-sum-subsets/', gfgUrl: 'https://www.geeksforgeeks.org/problems/partition-array-to-k-subsets/1' },
    ]
  },
  {
    id: 'tries',
    name: 'Tries',
    problems: [
      { id: 'MS149', title: 'Implement Trie (Prefix Tree)', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/implement-trie-prefix-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/trie-insert-and-search/1' },
      { id: 'MS150', title: 'Design Add and Search Words Data Structure', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/design-add-and-search-words-data-structure/', gfgUrl: 'https://www.geeksforgeeks.org/problems/design-add-and-search-words-data-structure/1' },
      { id: 'MS151', title: 'Word Search II', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/word-search-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/word-search-ii/1' },
      { id: 'MS152', title: 'Replace Words', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/replace-words/', gfgUrl: 'https://www.geeksforgeeks.org/problems/replace-words/1' },
      { id: 'MS153', title: 'Maximum XOR of Two Numbers in an Array', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/', gfgUrl: 'https://www.geeksforgeeks.org/problems/maximum-xor-of-two-numbers-in-an-array/1' },
      { id: 'MS154', title: 'Palindrome Pairs', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/palindrome-pairs/', gfgUrl: 'https://www.geeksforgeeks.org/problems/palindrome-pairs/1' },
      { id: 'MS155', title: 'Stream of Characters', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/stream-of-characters/', gfgUrl: 'https://www.geeksforgeeks.org/problems/stream-of-characters/1' },
    ]
  },
  {
    id: 'graphs',
    name: 'Graphs',
    problems: [
      { id: 'MS156', title: 'Number of Islands', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/number-of-islands/', gfgUrl: 'https://www.geeksforgeeks.org/problems/find-the-number-of-islands/1' },
      { id: 'MS157', title: 'Max Area of Island', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/max-area-of-island/', gfgUrl: 'https://www.geeksforgeeks.org/problems/find-number-of-islands/1' },
      { id: 'MS158', title: 'Clone Graph', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/clone-graph/', gfgUrl: 'https://www.geeksforgeeks.org/problems/clone-an-undirected-graph/1' },
      { id: 'MS159', title: 'Pacific Atlantic Water Flow', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/pacific-atlantic-water-flow/', gfgUrl: 'https://www.geeksforgeeks.org/problems/pacific-atlantic-water-flow/1' },
      { id: 'MS160', title: 'Course Schedule', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/course-schedule/', gfgUrl: 'https://www.geeksforgeeks.org/problems/course-schedule/1' },
      { id: 'MS161', title: 'Course Schedule II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/course-schedule-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/course-schedule/1' },
      { id: 'MS162', title: 'Alien Dictionary', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/alien-dictionary/', gfgUrl: 'https://www.geeksforgeeks.org/problems/alien-dictionary/1' },
      { id: 'MS163', title: 'Word Ladder', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/word-ladder/', gfgUrl: 'https://www.geeksforgeeks.org/problems/word-ladder/1' },
      { id: 'MS164', title: 'Word Ladder II', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/word-ladder-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/word-ladder-ii/1' },
      { id: 'MS165', title: 'Rotting Oranges', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/rotting-oranges/', gfgUrl: 'https://www.geeksforgeeks.org/problems/rotten-oranges2536/1' },
      { id: 'MS166', title: 'Surrounded Regions', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/surrounded-regions/', gfgUrl: 'https://www.geeksforgeeks.org/problems/replace-os-with-xs/1' },
      { id: 'MS167', title: 'Graph Valid Tree', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/graph-valid-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/graph-valid-tree/1' },
      { id: 'MS168', title: 'Redundant Connection', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/redundant-connection/', gfgUrl: 'https://www.geeksforgeeks.org/problems/redundant-connection/1' },
      { id: 'MS169', title: 'Network Delay Time', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/network-delay-time/', gfgUrl: 'https://www.geeksforgeeks.org/problems/network-delay-time/1' },
      { id: 'MS170', title: 'Cheapest Flights Within K Stops', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/cheapest-flights-within-k-stops/', gfgUrl: 'https://www.geeksforgeeks.org/problems/cheapest-flights-within-k-stops/1' },
      { id: 'MS171', title: 'Is Graph Bipartite', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/is-graph-bipartite/', gfgUrl: 'https://www.geeksforgeeks.org/problems/bipartite-graph/1' },
      { id: 'MS172', title: 'Keys and Rooms', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/keys-and-rooms/', gfgUrl: 'https://www.geeksforgeeks.org/problems/keys-and-rooms/1' },
      { id: 'MS173', title: 'Reconstruct Itinerary', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/reconstruct-itinerary/', gfgUrl: 'https://www.geeksforgeeks.org/problems/reconstruct-itinerary/1' },
      { id: 'MS174', title: 'Topological Sort', difficulty: 'Medium', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/topological-sort/1' },
      { id: 'MS175', title: 'Detect Cycle in Directed Graph', difficulty: 'Medium', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1' },
    ]
  },
  {
    id: '1d-dp',
    name: '1-D DP',
    problems: [
      { id: 'MS176', title: 'Climbing Stairs', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/climbing-stairs/', gfgUrl: 'https://www.geeksforgeeks.org/problems/count-ways-to-reach-the-nth-stair/1' },
      { id: 'MS177', title: 'House Robber', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/house-robber/', gfgUrl: 'https://www.geeksforgeeks.org/problems/stickler-theif/1' },
      { id: 'MS178', title: 'House Robber II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/house-robber-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/stickler-theif-1587115621/1' },
      { id: 'MS179', title: 'Maximum Subarray', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/maximum-subarray/', gfgUrl: 'https://www.geeksforgeeks.org/problems/max-sum-without-adjacents2430/1' },
      { id: 'MS180', title: 'Coin Change', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/coin-change/', gfgUrl: 'https://www.geeksforgeeks.org/problems/coin-change/1' },
      { id: 'MS181', title: 'Coin Change 2', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/coin-change-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/coin-change-number-of-ways/1' },
      { id: 'MS182', title: 'Minimum Cost For Tickets', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/minimum-cost-for-tickets/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-cost-for-tickets/1' },
      { id: 'MS183', title: 'Longest Increasing Subsequence', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/', gfgUrl: 'https://www.geeksforgeeks.org/problems/longest-increasing-subsequence/1' },
      { id: 'MS184', title: 'Number of LIS', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/number-of-longest-increasing-subsequence/', gfgUrl: 'https://www.geeksforgeeks.org/problems/number-of-longest-increasing-subsequence/1' },
      { id: 'MS185', title: 'Partition Equal Subset Sum', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/partition-equal-subset-sum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/subset-sum-problem2014/1' },
      { id: 'MS186', title: 'Combination Sum IV', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/combination-sum-iv/', gfgUrl: 'https://www.geeksforgeeks.org/problems/combination-sum-iv/1' },
      { id: 'MS187', title: 'Word Break', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/word-break/', gfgUrl: 'https://www.geeksforgeeks.org/problems/word-break/1' },
      { id: 'MS188', title: 'Decode Ways', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/decode-ways/', gfgUrl: 'https://www.geeksforgeeks.org/problems/total-decoding-messages/1' },
      { id: 'MS189', title: 'Palindromic Substrings', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/palindromic-substrings/', gfgUrl: 'https://www.geeksforgeeks.org/problems/count-palindrome-sub-strings-of-a-string/1' },
      { id: 'MS190', title: 'Longest Palindromic Substring', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/longest-palindromic-substring/', gfgUrl: 'https://www.geeksforgeeks.org/problems/longest-palindrome-in-a-string/1' },
      { id: 'MS191', title: 'Edit Distance', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/edit-distance/', gfgUrl: 'https://www.geeksforgeeks.org/problems/edit-distance/1' },
      { id: 'MS192', title: 'Delete and Earn', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/delete-and-earn/', gfgUrl: 'https://www.geeksforgeeks.org/problems/delete-and-earn/1' },
      { id: 'MS193', title: 'Fibonacci with Bottom-Up DP', difficulty: 'Easy', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/fibonacci-series-up-to-nth-term/1' },
    ]
  },
  {
    id: '2d-dp',
    name: '2-D DP',
    problems: [
      { id: 'MS194', title: 'Unique Paths', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/unique-paths/', gfgUrl: 'https://www.geeksforgeeks.org/problems/count-all-possible-paths-from-top-left-to-bottom-right/1' },
      { id: 'MS195', title: 'Unique Paths II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/unique-paths-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/count-all-possible-paths/1' },
      { id: 'MS196', title: 'Minimum Path Sum', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/minimum-path-sum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-cost-path/1' },
      { id: 'MS197', title: 'Triangle', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/triangle/', gfgUrl: 'https://www.geeksforgeeks.org/problems/triangle-sum-path-in-triangle/1' },
      { id: 'MS198', title: 'Dungeon Game', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/dungeon-game/', gfgUrl: 'https://www.geeksforgeeks.org/problems/dungeon-game/1' },
      { id: 'MS199', title: 'Longest Common Subsequence', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/longest-common-subsequence/', gfgUrl: 'https://www.geeksforgeeks.org/problems/longest-common-subsequence/1' },
      { id: 'MS200', title: 'Interleaving String', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/interleaving-string/', gfgUrl: 'https://www.geeksforgeeks.org/problems/interleaved-strings/1' },
      { id: 'MS201', title: 'Regular Expression Matching', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/regular-expression-matching/', gfgUrl: 'https://www.geeksforgeeks.org/problems/wildcard-string-matching/1' },
      { id: 'MS202', title: 'Wildcard Matching', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/wildcard-matching/', gfgUrl: 'https://www.geeksforgeeks.org/problems/wildcard-pattern-matching/1' },
      { id: 'MS203', title: 'Burst Balloons', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/burst-balloons/', gfgUrl: 'https://www.geeksforgeeks.org/problems/burst-balloons/1' },
      { id: 'MS204', title: 'Best Time to Buy and Sell Stock with Cooldown', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/', gfgUrl: 'https://www.geeksforgeeks.org/problems/stock-buy-and-sell/1' },
      { id: 'MS205', title: 'Best Time to Buy and Sell Stock III', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/buy-maximum-stocks-if-i-stocks-can-be-bought-on-i-th-day/1' },
      { id: 'MS206', title: 'Best Time to Buy and Sell Stock IV', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/', gfgUrl: 'https://www.geeksforgeeks.org/problems/stock-buy-and-sell-1587115621/1' },
      { id: 'MS207', title: 'Maximal Square', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/maximal-square/', gfgUrl: 'https://www.geeksforgeeks.org/problems/largest-square-formed-in-a-matrix/1' },
      { id: 'MS208', title: 'Maximum Rectangle', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/maximal-rectangle/', gfgUrl: 'https://www.geeksforgeeks.org/problems/max-rectangle/1' },
    ]
  },
  {
    id: 'greedy',
    name: 'Greedy',
    problems: [
      { id: 'MS209', title: 'Assign Cookies', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/assign-cookies/', gfgUrl: 'https://www.geeksforgeeks.org/problems/assign-cookies/1' },
      { id: 'MS210', title: 'Non-overlapping Intervals', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/non-overlapping-intervals/', gfgUrl: 'https://www.geeksforgeeks.org/problems/non-overlapping-intervals/1' },
      { id: 'MS211', title: 'Meeting Rooms', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/meeting-rooms/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-platforms/1' },
      { id: 'MS212', title: 'Meeting Rooms II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/meeting-rooms-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-platforms/1' },
      { id: 'MS213', title: 'Jump Game', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/jump-game/', gfgUrl: 'https://www.geeksforgeeks.org/problems/jump-game/1' },
      { id: 'MS214', title: 'Jump Game II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/jump-game-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-number-of-jumps/1' },
      { id: 'MS215', title: 'Gas Station', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/gas-station/', gfgUrl: 'https://www.geeksforgeeks.org/problems/circular-tour/1' },
      { id: 'MS216', title: 'Candy', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/candy/', gfgUrl: 'https://www.geeksforgeeks.org/problems/candy/1' },
      { id: 'MS217', title: 'Reconstruct Queue by Height', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/queue-reconstruction-by-height/', gfgUrl: 'https://www.geeksforgeeks.org/problems/queue-reconstruction-by-height/1' },
      { id: 'MS218', title: 'Partition Labels', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/partition-labels/', gfgUrl: 'https://www.geeksforgeeks.org/problems/partition-labels/1' },
      { id: 'MS219', title: 'Task Scheduler', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/task-scheduler/', gfgUrl: 'https://www.geeksforgeeks.org/problems/task-scheduler/1' },
      { id: 'MS220', title: 'Minimum Number of Arrows to Burst Balloons', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-number-of-arrows-to-burst-balloons/1' },
      { id: 'MS221', title: 'Remove K Digits', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/remove-k-digits/', gfgUrl: 'https://www.geeksforgeeks.org/problems/remove-k-digits/1' },
      { id: 'MS222', title: 'Monotone Increasing Digits', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/monotone-increasing-digits/', gfgUrl: 'https://www.geeksforgeeks.org/problems/monotone-increasing-digits/1' },
      { id: 'MS223', title: 'Broken Calculator', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/broken-calculator/', gfgUrl: 'https://www.geeksforgeeks.org/problems/broken-calculator/1' },
    ]
  },
  {
    id: 'intervals',
    name: 'Intervals',
    problems: [
      { id: 'MS224', title: 'Insert Interval', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/insert-interval/', gfgUrl: 'https://www.geeksforgeeks.org/problems/insert-interval/1' },
      { id: 'MS225', title: 'Merge Intervals', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/merge-intervals/', gfgUrl: 'https://www.geeksforgeeks.org/problems/overlapping-intervals/1' },
      { id: 'MS226', title: 'Non-overlapping Intervals', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/non-overlapping-intervals/', gfgUrl: 'https://www.geeksforgeeks.org/problems/non-overlapping-intervals/1' },
      { id: 'MS227', title: 'Meeting Rooms', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/meeting-rooms/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-platforms/1' },
      { id: 'MS228', title: 'Meeting Rooms II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/meeting-rooms-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-platforms/1' },
      { id: 'MS229', title: 'Minimum Interval to Include Each Query', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/minimum-interval-to-include-each-query/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-interval-to-include-each-query/1' },
    ]
  },
  {
    id: 'math-geometry',
    name: 'Math & Geometry',
    problems: [
      { id: 'MS230', title: 'Rotate Image', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/rotate-image/', gfgUrl: 'https://www.geeksforgeeks.org/problems/rotate-by-90-degree/1' },
      { id: 'MS231', title: 'Rotate Matrix 90 Degrees', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/rotate-image/', gfgUrl: 'https://www.geeksforgeeks.org/problems/rotate-by-90-degree/1' },
      { id: 'MS232', title: 'Spiral Matrix', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/spiral-matrix/', gfgUrl: 'https://www.geeksforgeeks.org/problems/spirally-traversing-a-matrix/1' },
      { id: 'MS233', title: 'Spiral Matrix II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/spiral-matrix-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/spiral-matrix/1' },
      { id: 'MS234', title: 'Set Matrix Zeroes', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/set-matrix-zeroes/', gfgUrl: 'https://www.geeksforgeeks.org/problems/boolean-matrix-problem/1' },
      { id: 'MS235', title: 'Happy Number', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/happy-number/', gfgUrl: 'https://www.geeksforgeeks.org/problems/happy-number/1' },
      { id: 'MS236', title: 'Plus One', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/plus-one/', gfgUrl: 'https://www.geeksforgeeks.org/problems/plus-one/1' },
      { id: 'MS237', title: 'Pow(x, n)', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/powx-n/', gfgUrl: 'https://www.geeksforgeeks.org/problems/power-of-numbers/1' },
      { id: 'MS238', title: 'Multiply Strings', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/multiply-strings/', gfgUrl: 'https://www.geeksforgeeks.org/problems/multiply-strings/1' },
      { id: 'MS239', title: 'Factorial Trailing Zeroes', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/factorial-trailing-zeroes/', gfgUrl: 'https://www.geeksforgeeks.org/problems/trailing-zeroes-in-factorial/1' },
      { id: 'MS240', title: 'Integer to English Words', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/integer-to-english-words/', gfgUrl: 'https://www.geeksforgeeks.org/problems/number-to-words/1' },
      { id: 'MS241', title: 'Basic Calculator', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/basic-calculator/', gfgUrl: 'https://www.geeksforgeeks.org/problems/expression-evaluation/1' },
      { id: 'MS242', title: 'Basic Calculator II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/basic-calculator-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/expression-evaluation/1' },
    ]
  },
  {
    id: 'bit-manipulation',
    name: 'Bit Manipulation',
    problems: [
      { id: 'MS243', title: 'Single Number', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/single-number/', gfgUrl: 'https://www.geeksforgeeks.org/problems/odd-occurrences-in-an-array/1' },
      { id: 'MS244', title: 'Number of 1 Bits', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/number-of-1-bits/', gfgUrl: 'https://www.geeksforgeeks.org/problems/set-bits-count/1' },
      { id: 'MS245', title: 'Counting Bits', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/counting-bits/', gfgUrl: 'https://www.geeksforgeeks.org/problems/count-total-set-bits/1' },
      { id: 'MS246', title: 'Missing Number', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/missing-number/', gfgUrl: 'https://www.geeksforgeeks.org/problems/missing-number-in-array/1' },
      { id: 'MS247', title: 'Reverse Bits', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/reverse-bits/', gfgUrl: 'https://www.geeksforgeeks.org/problems/reverse-bits/1' },
      { id: 'MS248', title: 'Single Number II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/single-number-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/find-element-odd-number-of-times/1' },
      { id: 'MS249', title: 'Single Number III', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/single-number-iii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/two-numbers-with-odd-occurrences/1' },
      { id: 'MS250', title: 'Maximum XOR of Two Numbers', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/', gfgUrl: 'https://www.geeksforgeeks.org/problems/maximum-xor-of-two-numbers-in-an-array/1' },
      { id: 'MS251', title: 'Bitwise AND of Numbers Range', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/bitwise-and-of-numbers-range/', gfgUrl: 'https://www.geeksforgeeks.org/problems/bitwise-and-of-numbers-range/1' },
      { id: 'MS252', title: 'String with Unique Characters', difficulty: 'Easy', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/unique-characters-in-a-string/1' },
    ]
  },
  {
    id: 'design',
    name: 'Design Problems',
    problems: [
      { id: 'MS253', title: 'Design HashSet', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/design-hashset/', gfgUrl: 'https://www.geeksforgeeks.org/problems/design-hashset/1' },
      { id: 'MS254', title: 'Design HashMap', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/design-hashmap/', gfgUrl: 'https://www.geeksforgeeks.org/problems/design-hashmap/1' },
      { id: 'MS255', title: 'Design Linked List', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/design-linked-list/', gfgUrl: 'https://www.geeksforgeeks.org/problems/design-linked-list/1' },
      { id: 'MS256', title: 'Design Circular Queue', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/design-circular-queue/', gfgUrl: 'https://www.geeksforgeeks.org/problems/circular-queue-implementation/1' },
      { id: 'MS257', title: 'Design Hit Counter', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/design-hit-counter/', gfgUrl: 'https://www.geeksforgeeks.org/problems/design-hit-counter/1' },
      { id: 'MS258', title: 'Insert Delete GetRandom O(1)', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/insert-delete-getrandom-o1/', gfgUrl: 'https://www.geeksforgeeks.org/problems/insert-delete-getrandom-o1/1' },
      { id: 'MS259', title: 'LRU Cache', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/lru-cache/', gfgUrl: 'https://www.geeksforgeeks.org/problems/lru-cache/1' },
      { id: 'MS260', title: 'LFU Cache', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/lfu-cache/', gfgUrl: 'https://www.geeksforgeeks.org/problems/lfu-cache/1' },
      { id: 'MS261', title: 'Time Based Key-Value Store', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/time-based-key-value-store/', gfgUrl: 'https://www.geeksforgeeks.org/problems/time-based-key-value-store/1' },
      { id: 'MS262', title: 'Design Browser History', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/design-browser-history/', gfgUrl: 'https://www.geeksforgeeks.org/problems/design-browser-history/1' },
      { id: 'MS263', title: 'Design Underground System', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/design-underground-system/', gfgUrl: 'https://www.geeksforgeeks.org/problems/design-underground-system/1' },
      { id: 'MS264', title: 'Design Parking System', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/design-parking-system/', gfgUrl: null },
      { id: 'MS265', title: 'All O one Data Structure', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/all-oone-data-structure/', gfgUrl: 'https://www.geeksforgeeks.org/problems/all-oone-data-structure/1' },
    ]
  },
];

// Calculate statistics for Microsoft questions
export const getMicrosoftInterviewStats = () => {
  let total = 0;
  let easy = 0;
  let medium = 0;
  let hard = 0;

  microsoftInterviewCategories.forEach(category => {
    total += category.problems.length;
    category.problems.forEach(problem => {
      switch (problem.difficulty) {
        case 'Easy':
          easy++;
          break;
        case 'Medium':
          medium++;
          break;
        case 'Hard':
          hard++;
          break;
      }
    });
  });

  return {
    total,
    easy,
    medium,
    hard,
    categories: microsoftInterviewCategories.length
  };
};

// Get problem by ID
export const getMicrosoftProblemById = (id) => {
  for (const category of microsoftInterviewCategories) {
    const problem = category.problems.find(p => p.id === id);
    if (problem) return { ...problem, category: category.name };
  }
  return null;
};
