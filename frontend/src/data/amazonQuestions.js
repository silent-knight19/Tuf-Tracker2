// Amazon Interview Questions - 250+ Most Frequently Asked Problems
// Organized by topic categories for SDE freshers/interview preparation
// Sources: LeetCode Premium company tags, Interview experiences (2023-2025), GeeksforGeeks

export const amazonInterviewCategories = [
  {
    id: 'arrays-hashing',
    name: 'Arrays & Hashing',
    problems: [
      { id: 'A001', title: 'Two Sum', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/two-sum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/key-pair5616/1' },
      { id: 'A002', title: 'Contains Duplicate', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/contains-duplicate/', gfgUrl: 'https://www.geeksforgeeks.org/problems/duplicates-in-an-array/1' },
      { id: 'A003', title: 'Valid Anagram', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/valid-anagram/', gfgUrl: 'https://www.geeksforgeeks.org/problems/anagram/1' },
      { id: 'A004', title: 'Group Anagrams', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/group-anagrams/', gfgUrl: 'https://www.geeksforgeeks.org/problems/k-anagrams-1/1' },
      { id: 'A005', title: 'Top K Frequent Elements', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/top-k-frequent-elements/', gfgUrl: 'https://www.geeksforgeeks.org/problems/top-k-frequent-elements/1' },
      { id: 'A006', title: 'Product of Array Except Self', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/product-of-array-except-self/', gfgUrl: 'https://www.geeksforgeeks.org/problems/product-array-puzzle/1' },
      { id: 'A007', title: 'Longest Consecutive Sequence', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/longest-consecutive-sequence/', gfgUrl: 'https://www.geeksforgeeks.org/problems/longest-consecutive-subsequence/1' },
      { id: 'A008', title: 'K Largest Elements', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', gfgUrl: 'https://www.geeksforgeeks.org/problems/k-largest-elements/1' },
      { id: 'A009', title: 'Kth Largest Element in Array', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', gfgUrl: 'https://www.geeksforgeeks.org/problems/kth-largest-element/1' },
      { id: 'A010', title: 'Majority Element', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/majority-element/', gfgUrl: 'https://www.geeksforgeeks.org/problems/majority-element/1' },
      { id: 'A011', title: 'Majority Element II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/majority-element-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/majority-vote/1' },
      { id: 'A012', title: 'Find All Duplicates in Array', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/find-all-duplicates-in-an-array/', gfgUrl: null },
      { id: 'A013', title: 'First Missing Positive', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/first-missing-positive/', gfgUrl: 'https://www.geeksforgeeks.org/problems/first-missing-positive/1' },
      { id: 'A014', title: 'Subarray Sum Equals K', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/subarray-sum-equals-k/', gfgUrl: 'https://www.geeksforgeeks.org/problems/subarrays-with-sum-k/1' },
      { id: 'A015', title: 'Continuous Subarray Sum', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/continuous-subarray-sum/', gfgUrl: null },
      { id: 'A016', title: 'Contiguous Array', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/contiguous-array/', gfgUrl: null },
      { id: 'A017', title: 'Find Pivot Index', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/find-pivot-index/', gfgUrl: 'https://www.geeksforgeeks.org/problems/equilibrium-point/1' },
      { id: 'A018', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', gfgUrl: 'https://www.geeksforgeeks.org/problems/stock-buy-and-sell/1' },
      { id: 'A019', title: 'Best Time to Buy and Sell Stock II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/stock-buy-and-sell-1587115621/1' },
      { id: 'A020', title: 'Maximum Subarray', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/maximum-subarray/', gfgUrl: 'https://www.geeksforgeeks.org/problems/max-sum-without-adjacents2430/1' },
    ]
  },
  {
    id: 'two-pointers',
    name: 'Two Pointers',
    problems: [
      { id: 'A021', title: '3Sum', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/3sum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/triplets-with-sum-with-given-range/1' },
      { id: 'A022', title: '3Sum Closest', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/3sum-closest/', gfgUrl: 'https://www.geeksforgeeks.org/problems/three-sum-closest/1' },
      { id: 'A023', title: 'Container With Most Water', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/container-with-most-water/', gfgUrl: 'https://www.geeksforgeeks.org/problems/container-with-most-water/1' },
      { id: 'A024', title: 'Trapping Rain Water', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/trapping-rain-water/', gfgUrl: 'https://www.geeksforgeeks.org/problems/trapping-rain-water/1' },
      { id: 'A025', title: 'Valid Palindrome', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/valid-palindrome/', gfgUrl: 'https://www.geeksforgeeks.org/problems/palindrome-string/1' },
      { id: 'A026', title: 'Valid Palindrome II', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/valid-palindrome-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/valid-palindrome/1' },
      { id: 'A027', title: 'Two Sum II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/', gfgUrl: 'https://www.geeksforgeeks.org/problems/pair-in-array-whose-sum-is-closest-to-x/1' },
      { id: 'A028', title: 'Sort Colors', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/sort-colors/', gfgUrl: 'https://www.geeksforgeeks.org/problems/sort-an-array-of-0s-1s-and-2s/1' },
      { id: 'A029', title: 'Remove Duplicates from Sorted Array', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/', gfgUrl: 'https://www.geeksforgeeks.org/problems/remove-duplicate-elements-from-sorted-array/1' },
      { id: 'A030', title: 'Remove Duplicates from Sorted Array II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/', gfgUrl: null },
      { id: 'A031', title: '4Sum', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/4sum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/find-all-four-sum-numbers/1' },
      { id: 'A032', title: 'Boats to Save People', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/boats-to-save-people/', gfgUrl: 'https://www.geeksforgeeks.org/problems/boats-to-save-people/1' },
      { id: 'A033', title: 'Merge Sorted Array', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/merge-sorted-array/', gfgUrl: 'https://www.geeksforgeeks.org/problems/merge-two-sorted-arrays/1' },
      { id: 'A034', title: 'Backspace String Compare', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/backspace-string-compare/', gfgUrl: 'https://www.geeksforgeeks.org/problems/backspace-string-compare/1' },
      { id: 'A035', title: 'Move Zeroes', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/move-zeroes/', gfgUrl: 'https://www.geeksforgeeks.org/problems/move-all-zeroes-to-end-of-array/1' },
    ]
  },
  {
    id: 'sliding-window',
    name: 'Sliding Window',
    problems: [
      { id: 'A036', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', gfgUrl: 'https://www.geeksforgeeks.org/problems/longest-distinct-characters-in-string/1' },
      { id: 'A037', title: 'Longest Repeating Character Replacement', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/longest-repeating-character-replacement/', gfgUrl: null },
      { id: 'A038', title: 'Permutation in String', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/permutation-in-string/', gfgUrl: 'https://www.geeksforgeeks.org/problems/check-if-two-strings-are-permutations-of-each-other/1' },
      { id: 'A039', title: 'Minimum Window Substring', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/minimum-window-substring/', gfgUrl: 'https://www.geeksforgeeks.org/problems/smallest-window-in-a-string-containing-all-the-characters-of-another-string/1' },
      { id: 'A040', title: 'Sliding Window Maximum', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/sliding-window-maximum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/maximum-of-all-subarrays-of-size-k/1' },
      { id: 'A041', title: 'Max Consecutive Ones III', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/max-consecutive-ones-iii/', gfgUrl: null },
      { id: 'A042', title: 'Fruit Into Baskets', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/fruit-into-baskets/', gfgUrl: 'https://www.geeksforgeeks.org/problems/fruit-into-baskets/1' },
      { id: 'A043', title: 'Subarray Product Less Than K', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/subarray-product-less-than-k/', gfgUrl: 'https://www.geeksforgeeks.org/problems/count-subarray-with-k-product/1' },
      { id: 'A044', title: 'Repeated DNA Sequences', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/repeated-dna-sequences/', gfgUrl: 'https://www.geeksforgeeks.org/problems/repeated-dna-sequences/1' },
    ]
  },
  {
    id: 'stack-queue',
    name: 'Stack & Queue',
    problems: [
      { id: 'A045', title: 'Valid Parentheses', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/valid-parentheses/', gfgUrl: 'https://www.geeksforgeeks.org/problems/parenthesis-checker/1' },
      { id: 'A046', title: 'Min Stack', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/min-stack/', gfgUrl: 'https://www.geeksforgeeks.org/problems/get-minimum-element-from-stack/1' },
      { id: 'A047', title: 'Evaluate Reverse Polish Notation', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/', gfgUrl: 'https://www.geeksforgeeks.org/problems/evaluate-the-expression/1' },
      { id: 'A048', title: 'Generate Parentheses', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/generate-parentheses/', gfgUrl: 'https://www.geeksforgeeks.org/problems/generate-all-parentheses/1' },
      { id: 'A049', title: 'Daily Temperatures', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/daily-temperatures/', gfgUrl: 'https://www.geeksforgeeks.org/problems/number-of-nges-to-the-right/1' },
      { id: 'A050', title: 'Next Greater Element I', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/next-greater-element-i/', gfgUrl: 'https://www.geeksforgeeks.org/problems/next-larger-element/1' },
      { id: 'A051', title: 'Next Greater Element II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/next-greater-element-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/next-greater-element/1' },
      { id: 'A052', title: 'Largest Rectangle in Histogram', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/largest-rectangle-in-histogram/', gfgUrl: 'https://www.geeksforgeeks.org/problems/maximum-rectangular-area-in-a-histogram/1' },
      { id: 'A053', title: 'Maximal Rectangle', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/maximal-rectangle/', gfgUrl: 'https://www.geeksforgeeks.org/problems/max-rectangle/1' },
      { id: 'A054', title: 'Car Fleet', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/car-fleet/', gfgUrl: null },
      { id: 'A055', title: 'Asteroid Collision', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/asteroid-collision/', gfgUrl: 'https://www.geeksforgeeks.org/problems/asteroid-collision/1' },
      { id: 'A056', title: 'Remove K Digits', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/remove-k-digits/', gfgUrl: 'https://www.geeksforgeeks.org/problems/remove-k-digits/1' },
      { id: 'A057', title: 'Decode String', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/decode-string/', gfgUrl: 'https://www.geeksforgeeks.org/problems/decode-the-string/1' },
      { id: 'A058', title: 'Basic Calculator II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/basic-calculator-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/expression-evaluation/1' },
      { id: 'A059', title: 'Simplify Path', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/simplify-path/', gfgUrl: 'https://www.geeksforgeeks.org/problems/simplify-path/1' },
      { id: 'A060', title: 'Stock Span Problem', difficulty: 'Medium', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/stock-span-problem/1' },
    ]
  },
  {
    id: 'linked-list',
    name: 'Linked List',
    problems: [
      { id: 'A061', title: 'Reverse Linked List', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/reverse-linked-list/', gfgUrl: 'https://www.geeksforgeeks.org/problems/reverse-a-linked-list/1' },
      { id: 'A062', title: 'Merge Two Sorted Lists', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/', gfgUrl: 'https://www.geeksforgeeks.org/problems/merge-two-sorted-linked-lists/1' },
      { id: 'A063', title: 'Linked List Cycle', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/linked-list-cycle/', gfgUrl: 'https://www.geeksforgeeks.org/problems/detect-loop-in-linked-list/1' },
      { id: 'A064', title: 'Linked List Cycle II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/linked-list-cycle-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/find-the-first-node-of-loop-in-linked-list/1' },
      { id: 'A065', title: 'Remove Nth Node From End of List', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', gfgUrl: 'https://www.geeksforgeeks.org/problems/remove-nth-node-from-end-of-list/1' },
      { id: 'A066', title: 'Add Two Numbers', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/add-two-numbers/', gfgUrl: 'https://www.geeksforgeeks.org/problems/add-two-numbers-represented-by-linked-lists/1' },
      { id: 'A067', title: 'Copy List with Random Pointer', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/copy-list-with-random-pointer/', gfgUrl: 'https://www.geeksforgeeks.org/problems/clone-a-linked-list-with-next-and-random-pointer/1' },
      { id: 'A068', title: 'Flatten a Multilevel Doubly Linked List', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/flatten-a-multilevel-doubly-linked-list/', gfgUrl: 'https://www.geeksforgeeks.org/problems/flattening-a-linked-list/1' },
      { id: 'A069', title: 'Rotate List', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/rotate-list/', gfgUrl: 'https://www.geeksforgeeks.org/problems/rotate-a-linked-list/1' },
      { id: 'A070', title: 'Partition List', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/partition-list/', gfgUrl: 'https://www.geeksforgeeks.org/problems/partition-a-linked-list-around-a-given-value/1' },
      { id: 'A071', title: 'LRU Cache', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/lru-cache/', gfgUrl: 'https://www.geeksforgeeks.org/problems/lru-cache/1' },
      { id: 'A072', title: 'LFU Cache', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/lfu-cache/', gfgUrl: 'https://www.geeksforgeeks.org/problems/lfu-cache/1' },
      { id: 'A073', title: 'Merge k Sorted Lists', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/', gfgUrl: 'https://www.geeksforgeeks.org/problems/merge-k-sorted-linked-lists/1' },
      { id: 'A074', title: 'Reverse Nodes in k-Group', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/reverse-nodes-in-k-group/', gfgUrl: 'https://www.geeksforgeeks.org/problems/reverse-a-linked-list-in-groups-of-given-size/1' },
      { id: 'A075', title: 'Design HashMap', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/design-hashmap/', gfgUrl: 'https://www.geeksforgeeks.org/problems/design-hashmap/1' },
      { id: 'A076', title: 'Middle of the Linked List', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/middle-of-the-linked-list/', gfgUrl: 'https://www.geeksforgeeks.org/problems/finding-middle-element-in-a-linked-list/1' },
      { id: 'A077', title: 'Palindrome Linked List', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/palindrome-linked-list/', gfgUrl: 'https://www.geeksforgeeks.org/problems/check-if-linked-list-is-pallindrome/1' },
      { id: 'A078', title: 'Odd Even Linked List', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/odd-even-linked-list/', gfgUrl: 'https://www.geeksforgeeks.org/problems/segregate-even-and-odd-nodes-in-a-linked-list/1' },
    ]
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    problems: [
      { id: 'A079', title: 'Binary Search', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/binary-search/', gfgUrl: 'https://www.geeksforgeeks.org/problems/binary-search/1' },
      { id: 'A080', title: 'Search in Rotated Sorted Array', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', gfgUrl: 'https://www.geeksforgeeks.org/problems/search-in-a-rotated-array/1' },
      { id: 'A081', title: 'Search in Rotated Sorted Array II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/search-in-rotated-sorted-array/1' },
      { id: 'A082', title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-element-in-a-sorted-and-rotated-array/1' },
      { id: 'A083', title: 'Find Peak Element', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/find-peak-element/', gfgUrl: 'https://www.geeksforgeeks.org/problems/peak-element/1' },
      { id: 'A084', title: 'Search a 2D Matrix', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/search-a-2d-matrix/', gfgUrl: 'https://www.geeksforgeeks.org/problems/search-in-a-matrix/1' },
      { id: 'A085', title: 'Search a 2D Matrix II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/search-a-2d-matrix-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/search-in-a-matrix17292717/1' },
      { id: 'A086', title: 'Koko Eating Bananas', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/koko-eating-bananas/', gfgUrl: 'https://www.geeksforgeeks.org/problems/koko-eating-bananas/1' },
      { id: 'A087', title: 'Capacity To Ship Packages Within D Days', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/', gfgUrl: 'https://www.geeksforgeeks.org/problems/capacity-to-ship-packages-within-d-days/1' },
      { id: 'A088', title: 'Median of Two Sorted Arrays', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/median-of-two-sorted-arrays/', gfgUrl: 'https://www.geeksforgeeks.org/problems/median-of-two-sorted-arrays/1' },
      { id: 'A089', title: 'Split Array Largest Sum', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/split-array-largest-sum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/split-array-largest-sum/1' },
      { id: 'A090', title: 'Find K Closest Elements', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/find-k-closest-elements/', gfgUrl: 'https://www.geeksforgeeks.org/problems/find-k-closest-elements/1' },
      { id: 'A091', title: 'Time Based Key-Value Store', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/time-based-key-value-store/', gfgUrl: 'https://www.geeksforgeeks.org/problems/time-based-key-value-store/1' },
      { id: 'A092', title: 'Single Element in a Sorted Array', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/single-element-in-a-sorted-array/', gfgUrl: 'https://www.geeksforgeeks.org/problems/find-the-element-that-appears-once-in-sorted-array/1' },
      { id: 'A093', title: 'Sqrt(x)', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/sqrtx/', gfgUrl: 'https://www.geeksforgeeks.org/problems/square-root/1' },
    ]
  },
  {
    id: 'trees',
    name: 'Trees',
    problems: [
      { id: 'A094', title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/maximum-depth-of-binary-tree/1' },
      { id: 'A095', title: 'Same Tree', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/same-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/determine-if-two-trees-are-identical/1' },
      { id: 'A096', title: 'Invert Binary Tree', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/invert-binary-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/mirror-tree/1' },
      { id: 'A097', title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', gfgUrl: 'https://www.geeksforgeeks.org/problems/level-order-traversal/1' },
      { id: 'A098', title: 'Binary Tree Zigzag Level Order Traversal', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/', gfgUrl: 'https://www.geeksforgeeks.org/problems/zigzag-tree-traversal/1' },
      { id: 'A099', title: 'Binary Tree Right Side View', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/binary-tree-right-side-view/', gfgUrl: 'https://www.geeksforgeeks.org/problems/right-view-of-binary-tree/1' },
      { id: 'A100', title: 'Binary Tree Left Side View', difficulty: 'Easy', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/left-view-of-binary-tree/1' },
      { id: 'A101', title: 'Top View of Binary Tree', difficulty: 'Medium', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/top-view-of-binary-tree/1' },
      { id: 'A102', title: 'Bottom View of Binary Tree', difficulty: 'Medium', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/bottom-view-of-binary-tree/1' },
      { id: 'A103', title: 'Vertical Order Traversal', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/vertical-traversal-of-binary-tree/1' },
      { id: 'A104', title: 'Binary Tree Paths', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/binary-tree-paths/', gfgUrl: 'https://www.geeksforgeeks.org/problems/binary-tree-paths/1' },
      { id: 'A105', title: 'Path Sum', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/path-sum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/root-to-leaf-path-sum/1' },
      { id: 'A106', title: 'Path Sum II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/path-sum-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/paths-from-root-with-a-specified-sum/1' },
      { id: 'A107', title: 'Path Sum III', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/path-sum-iii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/k-sum-paths/1' },
      { id: 'A108', title: 'Subtree of Another Tree', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/subtree-of-another-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/check-if-subtree/1' },
      { id: 'A109', title: 'Lowest Common Ancestor of Binary Tree', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/lowest-common-ancestor-in-a-binary-tree/1' },
      { id: 'A110', title: 'Lowest Common Ancestor of BST', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/lowest-common-ancestor-in-a-bst/1' },
      { id: 'A111', title: 'Diameter of Binary Tree', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/diameter-of-binary-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/diameter-of-binary-tree/1' },
      { id: 'A112', title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/maximum-path-sum-from-any-node/1' },
      { id: 'A113', title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/serialize-and-deserialize-a-binary-tree/1' },
      { id: 'A114', title: 'Validate Binary Search Tree', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/validate-binary-search-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/check-for-bst/1' },
      { id: 'A115', title: 'Kth Smallest Element in a BST', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/', gfgUrl: 'https://www.geeksforgeeks.org/problems/kth-largest-element-in-bst/1' },
      { id: 'A116', title: 'Convert Sorted Array to BST', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/array-to-bst/1' },
      { id: 'A117', title: 'Binary Tree to DLL', difficulty: 'Medium', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/binary-tree-to-dll/1' },
      { id: 'A118', title: 'Construct Binary Tree from Preorder and Inorder', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/', gfgUrl: 'https://www.geeksforgeeks.org/problems/construct-tree-1/1' },
      { id: 'A119', title: 'Construct Binary Tree from Inorder and Postorder', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/', gfgUrl: 'https://www.geeksforgeeks.org/problems/tree-from-postorder-and-inorder/1' },
      { id: 'A120', title: 'Populating Next Right Pointers in Each Node', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/populating-next-right-pointers-in-each-node/', gfgUrl: 'https://www.geeksforgeeks.org/problems/populate-inorder-successor-for-all-nodes/1' },
      { id: 'A121', title: 'Boundary of Binary Tree', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/boundary-of-binary-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/boundary-traversal-of-binary-tree/1' },
    ]
  },
  {
    id: 'heap',
    name: 'Heap & Priority Queue',
    problems: [
      { id: 'A122', title: 'Kth Largest Element in an Array', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', gfgUrl: 'https://www.geeksforgeeks.org/problems/kth-largest-element/1' },
      { id: 'A123', title: 'Find Median from Data Stream', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/find-median-from-data-stream/', gfgUrl: 'https://www.geeksforgeeks.org/problems/find-median-in-a-stream/1' },
      { id: 'A124', title: 'Merge k Sorted Lists', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/', gfgUrl: 'https://www.geeksforgeeks.org/problems/merge-k-sorted-linked-lists/1' },
      { id: 'A125', title: 'Top K Frequent Elements', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/top-k-frequent-elements/', gfgUrl: 'https://www.geeksforgeeks.org/problems/top-k-frequent-elements/1' },
      { id: 'A126', title: 'Task Scheduler', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/task-scheduler/', gfgUrl: 'https://www.geeksforgeeks.org/problems/task-scheduler/1' },
      { id: 'A127', title: 'Design Twitter', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/design-twitter/', gfgUrl: 'https://www.geeksforgeeks.org/problems/design-twitter/1' },
      { id: 'A128', title: 'Reorganize String', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/reorganize-string/', gfgUrl: 'https://www.geeksforgeeks.org/problems/reorganize-the-array/1' },
      { id: 'A129', title: 'Minimum Cost to Connect Sticks', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/minimum-cost-to-connect-sticks/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-cost-of-ropes/1' },
      { id: 'A130', title: 'Maximum Performance of a Team', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/maximum-performance-of-a-team/', gfgUrl: 'https://www.geeksforgeeks.org/problems/maximum-performance-of-a-team/1' },
      { id: 'A131', title: 'Smallest Range Covering Elements from K Lists', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/', gfgUrl: 'https://www.geeksforgeeks.org/problems/find-smallest-range-containing-elements-from-k-lists/1' },
      { id: 'A132', title: 'Sliding Window Maximum', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/sliding-window-maximum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/maximum-of-all-subarrays-of-size-k/1' },
      { id: 'A133', title: 'Meeting Rooms II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/meeting-rooms-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-platforms/1' },
      { id: 'A134', title: 'Minimum Number of Arrows to Burst Balloons', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-platforms/1' },
    ]
  },
  {
    id: 'backtracking',
    name: 'Backtracking',
    problems: [
      { id: 'A135', title: 'Subsets', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/subsets/', gfgUrl: 'https://www.geeksforgeeks.org/problems/subsets/1' },
      { id: 'A136', title: 'Subsets II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/subsets-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/subsets-ii/1' },
      { id: 'A137', title: 'Combinations', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/combinations/', gfgUrl: 'https://www.geeksforgeeks.org/problems/combinations/1' },
      { id: 'A138', title: 'Combination Sum', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/combination-sum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/combination-sum/1' },
      { id: 'A139', title: 'Combination Sum II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/combination-sum-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/combination-sum-ii/1' },
      { id: 'A140', title: 'Combination Sum III', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/combination-sum-iii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/combination-sum-iii/1' },
      { id: 'A141', title: 'Permutations', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/permutations/', gfgUrl: 'https://www.geeksforgeeks.org/problems/permutations-of-a-given-string/1' },
      { id: 'A142', title: 'Permutations II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/permutations-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/permutations-ii/1' },
      { id: 'A143', title: 'N-Queens', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/n-queens/', gfgUrl: 'https://www.geeksforgeeks.org/problems/n-queen-problem/1' },
      { id: 'A144', title: 'N-Queens II', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/n-queens-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/n-queen-problem/1' },
      { id: 'A145', title: 'Sudoku Solver', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/sudoku-solver/', gfgUrl: 'https://www.geeksforgeeks.org/problems/solve-the-sudoku/1' },
      { id: 'A146', title: 'Word Search', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/word-search/', gfgUrl: 'https://www.geeksforgeeks.org/problems/word-search/1' },
      { id: 'A147', title: 'Letter Combinations of Phone Number', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/', gfgUrl: 'https://www.geeksforgeeks.org/problems/letter-combinations-of-a-phone-number/1' },
      { id: 'A148', title: 'Generate Parentheses', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/generate-parentheses/', gfgUrl: 'https://www.geeksforgeeks.org/problems/generate-all-parentheses/1' },
      { id: 'A149', title: 'Palindrome Partitioning', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/palindrome-partitioning/', gfgUrl: 'https://www.geeksforgeeks.org/problems/palindromic-partitioning/1' },
      { id: 'A150', title: 'Restore IP Addresses', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/restore-ip-addresses/', gfgUrl: 'https://www.geeksforgeeks.org/problems/generate-ip-addresses/1' },
      { id: 'A151', title: 'Expression Add Operators', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/expression-add-operators/', gfgUrl: 'https://www.geeksforgeeks.org/problems/expression-add-operators/1' },
      { id: 'A152', title: 'Partition to K Equal Sum Subsets', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/partition-to-k-equal-sum-subsets/', gfgUrl: 'https://www.geeksforgeeks.org/problems/partition-array-to-k-subsets/1' },
    ]
  },
  {
    id: 'tries',
    name: 'Tries',
    problems: [
      { id: 'A153', title: 'Implement Trie (Prefix Tree)', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/implement-trie-prefix-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/trie-insert-and-search/1' },
      { id: 'A154', title: 'Design Add and Search Words Data Structure', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/design-add-and-search-words-data-structure/', gfgUrl: 'https://www.geeksforgeeks.org/problems/design-add-and-search-words-data-structure/1' },
      { id: 'A155', title: 'Word Search II', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/word-search-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/word-search-ii/1' },
      { id: 'A156', title: 'Replace Words', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/replace-words/', gfgUrl: 'https://www.geeksforgeeks.org/problems/replace-words/1' },
      { id: 'A157', title: 'Maximum XOR of Two Numbers in an Array', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/', gfgUrl: 'https://www.geeksforgeeks.org/problems/maximum-xor-of-two-numbers-in-an-array/1' },
      { id: 'A158', title: 'Palindrome Pairs', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/palindrome-pairs/', gfgUrl: 'https://www.geeksforgeeks.org/problems/palindrome-pairs/1' },
      { id: 'A159', title: 'Stream of Characters', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/stream-of-characters/', gfgUrl: 'https://www.geeksforgeeks.org/problems/stream-of-characters/1' },
    ]
  },
  {
    id: 'graphs',
    name: 'Graphs',
    problems: [
      { id: 'A160', title: 'Number of Islands', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/number-of-islands/', gfgUrl: 'https://www.geeksforgeeks.org/problems/find-the-number-of-islands/1' },
      { id: 'A161', title: 'Max Area of Island', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/max-area-of-island/', gfgUrl: 'https://www.geeksforgeeks.org/problems/find-number-of-islands/1' },
      { id: 'A162', title: 'Clone Graph', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/clone-graph/', gfgUrl: 'https://www.geeksforgeeks.org/problems/clone-an-undirected-graph/1' },
      { id: 'A163', title: 'Pacific Atlantic Water Flow', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/pacific-atlantic-water-flow/', gfgUrl: 'https://www.geeksforgeeks.org/problems/pacific-atlantic-water-flow/1' },
      { id: 'A164', title: 'Course Schedule', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/course-schedule/', gfgUrl: 'https://www.geeksforgeeks.org/problems/course-schedule/1' },
      { id: 'A165', title: 'Course Schedule II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/course-schedule-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/course-schedule/1' },
      { id: 'A166', title: 'Alien Dictionary', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/alien-dictionary/', gfgUrl: 'https://www.geeksforgeeks.org/problems/alien-dictionary/1' },
      { id: 'A167', title: 'Word Ladder', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/word-ladder/', gfgUrl: 'https://www.geeksforgeeks.org/problems/word-ladder/1' },
      { id: 'A168', title: 'Word Ladder II', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/word-ladder-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/word-ladder-ii/1' },
      { id: 'A169', title: 'Rotting Oranges', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/rotting-oranges/', gfgUrl: 'https://www.geeksforgeeks.org/problems/rotten-oranges/1' },
      { id: 'A170', title: 'Surrounded Regions', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/surrounded-regions/', gfgUrl: 'https://www.geeksforgeeks.org/problems/replace-os-with-xs/1' },
      { id: 'A171', title: 'Graph Valid Tree', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/graph-valid-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/graph-valid-tree/1' },
      { id: 'A172', title: 'Redundant Connection', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/redundant-connection/', gfgUrl: 'https://www.geeksforgeeks.org/problems/redundant-connection/1' },
      { id: 'A173', title: 'Network Delay Time', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/network-delay-time/', gfgUrl: 'https://www.geeksforgeeks.org/problems/network-delay-time/1' },
      { id: 'A174', title: 'Cheapest Flights Within K Stops', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/cheapest-flights-within-k-stops/', gfgUrl: 'https://www.geeksforgeeks.org/problems/cheapest-flights-within-k-stops/1' },
      { id: 'A175', title: 'Is Graph Bipartite', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/is-graph-bipartite/', gfgUrl: 'https://www.geeksforgeeks.org/problems/bipartite-graph/1' },
      { id: 'A176', title: 'Keys and Rooms', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/keys-and-rooms/', gfgUrl: 'https://www.geeksforgeeks.org/problems/keys-and-rooms/1' },
      { id: 'A177', title: 'Reconstruct Itinerary', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/reconstruct-itinerary/', gfgUrl: 'https://www.geeksforgeeks.org/problems/reconstruct-itinerary/1' },
    ]
  },
  {
    id: 'advanced-graphs',
    name: 'Advanced Graphs',
    problems: [
      { id: 'A178', title: 'Swim in Rising Water', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/swim-in-rising-water/', gfgUrl: 'https://www.geeksforgeeks.org/problems/swim-in-rising-water/1' },
      { id: 'A179', title: 'Find Critical and Pseudo-Critical Edges in MST', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/critical-connections-in-a-network/1' },
      { id: 'A180', title: 'Minimum Obstacle Removal to Reach Corner', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/minimum-obstacle-removal-to-reach-corner/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-obstacle-removal-to-reach-corner/1' },
      { id: 'A181', title: 'Last Day Where You Can Still Cross', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/last-day-where-you-can-still-cross/', gfgUrl: 'https://www.geeksforgeeks.org/problems/last-day-where-you-can-still-cross/1' },
      { id: 'A182', title: 'Trapping Rain Water II', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/trapping-rain-water-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/trapping-rain-water-ii/1' },
      { id: 'A183', title: 'Minimum Cost to Make at Least One Valid Path', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/minimum-cost-to-make-at-least-one-valid-path-in-a-grid/', gfgUrl: null },
    ]
  },
  {
    id: '1d-dp',
    name: '1-D DP',
    problems: [
      { id: 'A184', title: 'Climbing Stairs', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/climbing-stairs/', gfgUrl: 'https://www.geeksforgeeks.org/problems/count-ways-to-reach-the-nth-stair/1' },
      { id: 'A185', title: 'House Robber', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/house-robber/', gfgUrl: 'https://www.geeksforgeeks.org/problems/stickler-theif/1' },
      { id: 'A186', title: 'House Robber II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/house-robber-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/stickler-theif-1587115621/1' },
      { id: 'A187', title: 'Maximum Subarray', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/maximum-subarray/', gfgUrl: 'https://www.geeksforgeeks.org/problems/max-sum-without-adjacents2430/1' },
      { id: 'A188', title: 'Coin Change', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/coin-change/', gfgUrl: 'https://www.geeksforgeeks.org/problems/coin-change/1' },
      { id: 'A189', title: 'Coin Change 2', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/coin-change-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/coin-change-number-of-ways/1' },
      { id: 'A190', title: 'Minimum Cost For Tickets', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/minimum-cost-for-tickets/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-cost-for-tickets/1' },
      { id: 'A191', title: 'Longest Increasing Subsequence', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/', gfgUrl: 'https://www.geeksforgeeks.org/problems/longest-increasing-subsequence/1' },
      { id: 'A192', title: 'Number of LIS', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/number-of-longest-increasing-subsequence/', gfgUrl: 'https://www.geeksforgeeks.org/problems/number-of-longest-increasing-subsequence/1' },
      { id: 'A193', title: 'Partition Equal Subset Sum', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/partition-equal-subset-sum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/subset-sum-problem2014/1' },
      { id: 'A194', title: 'Combination Sum IV', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/combination-sum-iv/', gfgUrl: 'https://www.geeksforgeeks.org/problems/combination-sum-iv/1' },
      { id: 'A195', title: 'Word Break', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/word-break/', gfgUrl: 'https://www.geeksforgeeks.org/problems/word-break/1' },
      { id: 'A196', title: 'Decode Ways', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/decode-ways/', gfgUrl: 'https://www.geeksforgeeks.org/problems/total-decoding-messages/1' },
      { id: 'A197', title: 'Palindromic Substrings', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/palindromic-substrings/', gfgUrl: 'https://www.geeksforgeeks.org/problems/count-palindrome-sub-strings-of-a-string/1' },
      { id: 'A198', title: 'Longest Palindromic Substring', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/longest-palindromic-substring/', gfgUrl: 'https://www.geeksforgeeks.org/problems/longest-palindrome-in-a-string/1' },
      { id: 'A199', title: 'Edit Distance', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/edit-distance/', gfgUrl: 'https://www.geeksforgeeks.org/problems/edit-distance/1' },
      { id: 'A200', title: 'Delete and Earn', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/delete-and-earn/', gfgUrl: 'https://www.geeksforgeeks.org/problems/delete-and-earn/1' },
    ]
  },
  {
    id: '2d-dp',
    name: '2-D DP',
    problems: [
      { id: 'A201', title: 'Unique Paths', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/unique-paths/', gfgUrl: 'https://www.geeksforgeeks.org/problems/count-all-possible-paths-from-top-left-to-bottom-right/1' },
      { id: 'A202', title: 'Unique Paths II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/unique-paths-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/count-all-possible-paths/1' },
      { id: 'A203', title: 'Minimum Path Sum', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/minimum-path-sum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-cost-path/1' },
      { id: 'A204', title: 'Triangle', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/triangle/', gfgUrl: 'https://www.geeksforgeeks.org/problems/triangle-sum-path-in-triangle/1' },
      { id: 'A205', title: 'Dungeon Game', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/dungeon-game/', gfgUrl: 'https://www.geeksforgeeks.org/problems/dungeon-game/1' },
      { id: 'A206', title: 'Longest Common Subsequence', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/longest-common-subsequence/', gfgUrl: 'https://www.geeksforgeeks.org/problems/longest-common-subsequence/1' },
      { id: 'A207', title: 'Interleaving String', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/interleaving-string/', gfgUrl: 'https://www.geeksforgeeks.org/problems/interleaved-strings/1' },
      { id: 'A208', title: 'Regular Expression Matching', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/regular-expression-matching/', gfgUrl: 'https://www.geeksforgeeks.org/problems/wildcard-string-matching/1' },
      { id: 'A209', title: 'Wildcard Matching', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/wildcard-matching/', gfgUrl: 'https://www.geeksforgeeks.org/problems/wildcard-pattern-matching/1' },
      { id: 'A210', title: 'Burst Balloons', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/burst-balloons/', gfgUrl: 'https://www.geeksforgeeks.org/problems/burst-balloons/1' },
      { id: 'A211', title: 'Best Time to Buy and Sell Stock with Cooldown', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/', gfgUrl: 'https://www.geeksforgeeks.org/problems/stock-buy-and-sell/1' },
      { id: 'A212', title: 'Best Time to Buy and Sell Stock III', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/buy-maximum-stocks-if-i-stocks-can-be-bought-on-i-th-day/1' },
      { id: 'A213', title: 'Best Time to Buy and Sell Stock IV', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/', gfgUrl: 'https://www.geeksforgeeks.org/problems/stock-buy-and-sell-1587115621/1' },
      { id: 'A214', title: 'Maximal Square', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/maximal-square/', gfgUrl: 'https://www.geeksforgeeks.org/problems/largest-square-formed-in-a-matrix/1' },
      { id: 'A215', title: 'Maximum Rectangle', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/maximal-rectangle/', gfgUrl: 'https://www.geeksforgeeks.org/problems/max-rectangle/1' },
    ]
  },
  {
    id: 'greedy',
    name: 'Greedy',
    problems: [
      { id: 'A216', title: 'Assign Cookies', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/assign-cookies/', gfgUrl: 'https://www.geeksforgeeks.org/problems/assign-cookies/1' },
      { id: 'A217', title: 'Non-overlapping Intervals', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/non-overlapping-intervals/', gfgUrl: 'https://www.geeksforgeeks.org/problems/non-overlapping-intervals/1' },
      { id: 'A218', title: 'Meeting Rooms', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/meeting-rooms/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-platforms/1' },
      { id: 'A219', title: 'Meeting Rooms II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/meeting-rooms-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-platforms/1' },
      { id: 'A220', title: 'Jump Game', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/jump-game/', gfgUrl: 'https://www.geeksforgeeks.org/problems/jump-game/1' },
      { id: 'A221', title: 'Jump Game II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/jump-game-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-number-of-jumps/1' },
      { id: 'A222', title: 'Gas Station', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/gas-station/', gfgUrl: 'https://www.geeksforgeeks.org/problems/circular-tour/1' },
      { id: 'A223', title: 'Candy', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/candy/', gfgUrl: 'https://www.geeksforgeeks.org/problems/candy/1' },
      { id: 'A224', title: 'Reconstruct Queue by Height', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/queue-reconstruction-by-height/', gfgUrl: 'https://www.geeksforgeeks.org/problems/queue-reconstruction-by-height/1' },
      { id: 'A225', title: 'Partition Labels', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/partition-labels/', gfgUrl: 'https://www.geeksforgeeks.org/problems/partition-labels/1' },
      { id: 'A226', title: 'Task Scheduler', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/task-scheduler/', gfgUrl: 'https://www.geeksforgeeks.org/problems/task-scheduler/1' },
      { id: 'A227', title: 'Minimum Number of Arrows to Burst Balloons', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-number-of-arrows-to-burst-balloons/1' },
      { id: 'A228', title: 'Remove K Digits', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/remove-k-digits/', gfgUrl: 'https://www.geeksforgeeks.org/problems/remove-k-digits/1' },
      { id: 'A229', title: 'Monotone Increasing Digits', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/monotone-increasing-digits/', gfgUrl: 'https://www.geeksforgeeks.org/problems/monotone-increasing-digits/1' },
      { id: 'A230', title: 'Broken Calculator', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/broken-calculator/', gfgUrl: 'https://www.geeksforgeeks.org/problems/broken-calculator/1' },
    ]
  },
  {
    id: 'intervals',
    name: 'Intervals',
    problems: [
      { id: 'A231', title: 'Insert Interval', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/insert-interval/', gfgUrl: 'https://www.geeksforgeeks.org/problems/insert-interval/1' },
      { id: 'A232', title: 'Merge Intervals', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/merge-intervals/', gfgUrl: 'https://www.geeksforgeeks.org/problems/overlapping-intervals/1' },
      { id: 'A233', title: 'Non-overlapping Intervals', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/non-overlapping-intervals/', gfgUrl: 'https://www.geeksforgeeks.org/problems/non-overlapping-intervals/1' },
      { id: 'A234', title: 'Meeting Rooms', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/meeting-rooms/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-platforms/1' },
      { id: 'A235', title: 'Meeting Rooms II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/meeting-rooms-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-platforms/1' },
      { id: 'A236', title: 'Minimum Interval to Include Each Query', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/minimum-interval-to-include-each-query/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-interval-to-include-each-query/1' },
    ]
  },
  {
    id: 'math-geometry',
    name: 'Math & Geometry',
    problems: [
      { id: 'A237', title: 'Rotate Image', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/rotate-image/', gfgUrl: 'https://www.geeksforgeeks.org/problems/rotate-by-90-degree/1' },
      { id: 'A238', title: 'Spiral Matrix', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/spiral-matrix/', gfgUrl: 'https://www.geeksforgeeks.org/problems/spirally-traversing-a-matrix/1' },
      { id: 'A239', title: 'Spiral Matrix II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/spiral-matrix-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/spiral-matrix/1' },
      { id: 'A240', title: 'Set Matrix Zeroes', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/set-matrix-zeroes/', gfgUrl: 'https://www.geeksforgeeks.org/problems/boolean-matrix-problem/1' },
      { id: 'A241', title: 'Happy Number', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/happy-number/', gfgUrl: 'https://www.geeksforgeeks.org/problems/happy-number/1' },
      { id: 'A242', title: 'Plus One', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/plus-one/', gfgUrl: 'https://www.geeksforgeeks.org/problems/plus-one/1' },
      { id: 'A243', title: 'Pow(x, n)', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/powx-n/', gfgUrl: 'https://www.geeksforgeeks.org/problems/power-of-numbers/1' },
      { id: 'A244', title: 'Multiply Strings', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/multiply-strings/', gfgUrl: 'https://www.geeksforgeeks.org/problems/multiply-strings/1' },
      { id: 'A245', title: 'Factorial Trailing Zeroes', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/factorial-trailing-zeroes/', gfgUrl: 'https://www.geeksforgeeks.org/problems/trailing-zeroes-in-factorial/1' },
      { id: 'A246', title: 'Integer to English Words', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/integer-to-english-words/', gfgUrl: 'https://www.geeksforgeeks.org/problems/number-to-words/1' },
    ]
  },
  {
    id: 'bit-manipulation',
    name: 'Bit Manipulation',
    problems: [
      { id: 'A247', title: 'Single Number', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/single-number/', gfgUrl: 'https://www.geeksforgeeks.org/problems/odd-occurrences-in-an-array/1' },
      { id: 'A248', title: 'Number of 1 Bits', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/number-of-1-bits/', gfgUrl: 'https://www.geeksforgeeks.org/problems/set-bits-count/1' },
      { id: 'A249', title: 'Counting Bits', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/counting-bits/', gfgUrl: 'https://www.geeksforgeeks.org/problems/count-total-set-bits/1' },
      { id: 'A250', title: 'Missing Number', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/missing-number/', gfgUrl: 'https://www.geeksforgeeks.org/problems/missing-number-in-array/1' },
      { id: 'A251', title: 'Reverse Bits', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/reverse-bits/', gfgUrl: 'https://www.geeksforgeeks.org/problems/reverse-bits/1' },
      { id: 'A252', title: 'Single Number II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/single-number-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/find-element-odd-number-of-times/1' },
      { id: 'A253', title: 'Single Number III', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/single-number-iii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/two-numbers-with-odd-occurrences/1' },
      { id: 'A254', title: 'Maximum XOR of Two Numbers', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/', gfgUrl: 'https://www.geeksforgeeks.org/problems/maximum-xor-of-two-numbers-in-an-array/1' },
    ]
  },
  {
    id: 'design',
    name: 'Design Problems',
    problems: [
      { id: 'A255', title: 'Design HashSet', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/design-hashset/', gfgUrl: 'https://www.geeksforgeeks.org/problems/design-hashset/1' },
      { id: 'A256', title: 'Design HashMap', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/design-hashmap/', gfgUrl: 'https://www.geeksforgeeks.org/problems/design-hashmap/1' },
      { id: 'A257', title: 'Design Linked List', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/design-linked-list/', gfgUrl: 'https://www.geeksforgeeks.org/problems/design-linked-list/1' },
      { id: 'A258', title: 'Design Circular Queue', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/design-circular-queue/', gfgUrl: 'https://www.geeksforgeeks.org/problems/circular-queue-implementation/1' },
      { id: 'A259', title: 'Design Hit Counter', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/design-hit-counter/', gfgUrl: 'https://www.geeksforgeeks.org/problems/design-hit-counter/1' },
      { id: 'A260', title: 'Insert Delete GetRandom O(1)', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/insert-delete-getrandom-o1/', gfgUrl: 'https://www.geeksforgeeks.org/problems/insert-delete-getrandom-o1/1' },
      { id: 'A261', title: 'LRU Cache', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/lru-cache/', gfgUrl: 'https://www.geeksforgeeks.org/problems/lru-cache/1' },
      { id: 'A262', title: 'LFU Cache', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/lfu-cache/', gfgUrl: 'https://www.geeksforgeeks.org/problems/lfu-cache/1' },
      { id: 'A263', title: 'Time Based Key-Value Store', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/time-based-key-value-store/', gfgUrl: 'https://www.geeksforgeeks.org/problems/time-based-key-value-store/1' },
      { id: 'A264', title: 'Design Browser History', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/design-browser-history/', gfgUrl: 'https://www.geeksforgeeks.org/problems/design-browser-history/1' },
      { id: 'A265', title: 'Design Underground System', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/design-underground-system/', gfgUrl: 'https://www.geeksforgeeks.org/problems/design-underground-system/1' },
      { id: 'A266', title: 'Design Parking System', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/design-parking-system/', gfgUrl: null },
    ]
  },
];

// Calculate statistics for Amazon questions
export const getAmazonInterviewStats = () => {
  let total = 0;
  let easy = 0;
  let medium = 0;
  let hard = 0;

  amazonInterviewCategories.forEach(category => {
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
    categories: amazonInterviewCategories.length
  };
};

// Get problem by ID
export const getAmazonProblemById = (id) => {
  for (const category of amazonInterviewCategories) {
    const problem = category.problems.find(p => p.id === id);
    if (problem) return { ...problem, category: category.name };
  }
  return null;
};
