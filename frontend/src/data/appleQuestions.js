// Apple Interview Questions - 250+ Most Frequently Asked Problems
// Organized by topic categories for SDE freshers/interview preparation
// Sources: LeetCode Premium company tags, Interview experiences (2023-2025), GeeksforGeeks

export const appleInterviewCategories = [
  {
    id: 'arrays-hashing',
    name: 'Arrays & Hashing',
    problems: [
      { id: 'AP001', title: 'Two Sum', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/two-sum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/key-pair5616/1' },
      { id: 'AP002', title: 'Contains Duplicate', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/contains-duplicate/', gfgUrl: 'https://www.geeksforgeeks.org/problems/duplicates-in-an-array/1' },
      { id: 'AP003', title: 'Valid Anagram', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/valid-anagram/', gfgUrl: 'https://www.geeksforgeeks.org/problems/anagram/1' },
      { id: 'AP004', title: 'Group Anagrams', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/group-anagrams/', gfgUrl: 'https://www.geeksforgeeks.org/problems/k-anagrams-1/1' },
      { id: 'AP005', title: 'Top K Frequent Elements', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/top-k-frequent-elements/', gfgUrl: 'https://www.geeksforgeeks.org/problems/top-k-frequent-elements/1' },
      { id: 'AP006', title: 'Product of Array Except Self', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/product-of-array-except-self/', gfgUrl: 'https://www.geeksforgeeks.org/problems/product-array-puzzle/1' },
      { id: 'AP007', title: 'Longest Consecutive Sequence', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/longest-consecutive-sequence/', gfgUrl: 'https://www.geeksforgeeks.org/problems/longest-consecutive-subsequence/1' },
      { id: 'AP008', title: 'Kth Largest Element in Array', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', gfgUrl: 'https://www.geeksforgeeks.org/problems/kth-largest-element/1' },
      { id: 'AP009', title: 'First Missing Positive', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/first-missing-positive/', gfgUrl: 'https://www.geeksforgeeks.org/problems/first-missing-positive/1' },
      { id: 'AP010', title: 'Find All Duplicates in Array', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/find-all-duplicates-in-an-array/', gfgUrl: null },
      { id: 'AP011', title: 'Majority Element', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/majority-element/', gfgUrl: 'https://www.geeksforgeeks.org/problems/majority-element/1' },
      { id: 'AP012', title: 'Majority Element II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/majority-element-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/majority-vote/1' },
      { id: 'AP013', title: 'Subarray Sum Equals K', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/subarray-sum-equals-k/', gfgUrl: 'https://www.geeksforgeeks.org/problems/subarrays-with-sum-k/1' },
      { id: 'AP014', title: 'Find Subarray with Given Sum', difficulty: 'Medium', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/subarray-with-given-sum-1587115621/1' },
      { id: 'AP015', title: 'Contiguous Array', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/contiguous-array/', gfgUrl: null },
      { id: 'AP016', title: 'Maximum Subarray', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/maximum-subarray/', gfgUrl: 'https://www.geeksforgeeks.org/problems/kadanes-algorithm/1' },
      { id: 'AP017', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', gfgUrl: 'https://www.geeksforgeeks.org/problems/stock-buy-and-sell/1' },
      { id: 'AP018', title: 'Best Time to Buy and Sell Stock II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/stock-buy-and-sell-1587115621/1' },
      { id: 'AP019', title: 'Move Zeroes', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/move-zeroes/', gfgUrl: 'https://www.geeksforgeeks.org/problems/move-all-zeroes-to-end-of-array0751/1' },
      { id: 'AP020', title: 'Next Permutation', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/next-permutation/', gfgUrl: 'https://www.geeksforgeeks.org/problems/next-permutation5226/1' },
      { id: 'AP021', title: 'Pascals Triangle', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/pascals-triangle/', gfgUrl: 'https://www.geeksforgeeks.org/problems/pascal-triangle/1' },
      { id: 'AP022', title: 'Chocolate Distribution Problem', difficulty: 'Easy', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/chocolate-distribution-problem3825/1' },
      { id: 'AP023', title: 'Count Inversions in Array', difficulty: 'Medium', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/inversion-of-array-1587115620/1' },
      { id: 'AP024', title: 'Find Triplet That Sums to Given Value', difficulty: 'Medium', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/triplet-sum-in-array-1587115621/1' },
    ]
  },
  {
    id: 'two-pointers',
    name: 'Two Pointers',
    problems: [
      { id: 'AP025', title: '3Sum', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/3sum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/triplets-with-sum-with-given-range/1' },
      { id: 'AP026', title: '3Sum Closest', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/3sum-closest/', gfgUrl: 'https://www.geeksforgeeks.org/problems/three-sum-closest/1' },
      { id: 'AP027', title: 'Container With Most Water', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/container-with-most-water/', gfgUrl: 'https://www.geeksforgeeks.org/problems/container-with-most-water/1' },
      { id: 'AP028', title: 'Trapping Rain Water', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/trapping-rain-water/', gfgUrl: 'https://www.geeksforgeeks.org/problems/trapping-rain-water/1' },
      { id: 'AP029', title: 'Valid Palindrome', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/valid-palindrome/', gfgUrl: 'https://www.geeksforgeeks.org/problems/palindrome-string/1' },
      { id: 'AP030', title: 'Valid Palindrome II', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/valid-palindrome-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/valid-palindrome/1' },
      { id: 'AP031', title: 'Two Sum II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/', gfgUrl: 'https://www.geeksforgeeks.org/problems/pair-in-array-whose-sum-is-closest-to-x/1' },
      { id: 'AP032', title: 'Sort Colors', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/sort-colors/', gfgUrl: 'https://www.geeksforgeeks.org/problems/sort-an-array-of-0s-1s-and-2s/1' },
      { id: 'AP033', title: 'Remove Duplicates from Sorted Array', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/', gfgUrl: 'https://www.geeksforgeeks.org/problems/remove-duplicate-elements-from-sorted-array/1' },
      { id: 'AP034', title: '4Sum', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/4sum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/find-all-four-sum-numbers/1' },
      { id: 'AP035', title: 'Boats to Save People', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/boats-to-save-people/', gfgUrl: 'https://www.geeksforgeeks.org/problems/boats-to-save-people/1' },
      { id: 'AP036', title: 'Merge Sorted Array', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/merge-sorted-array/', gfgUrl: 'https://www.geeksforgeeks.org/problems/merge-two-sorted-arrays/1' },
      { id: 'AP037', title: 'Backspace String Compare', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/backspace-string-compare/', gfgUrl: 'https://www.geeksforgeeks.org/problems/backspace-string-compare/1' },
    ]
  },
  {
    id: 'sliding-window',
    name: 'Sliding Window',
    problems: [
      { id: 'AP038', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', gfgUrl: 'https://www.geeksforgeeks.org/problems/longest-distinct-characters-in-string/1' },
      { id: 'AP039', title: 'Longest Repeating Character Replacement', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/longest-repeating-character-replacement/', gfgUrl: null },
      { id: 'AP040', title: 'Permutation in String', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/permutation-in-string/', gfgUrl: 'https://www.geeksforgeeks.org/problems/check-if-two-strings-are-permutations-of-each-other/1' },
      { id: 'AP041', title: 'Minimum Window Substring', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/minimum-window-substring/', gfgUrl: 'https://www.geeksforgeeks.org/problems/smallest-window-in-a-string-containing-all-the-characters-of-another-string/1' },
      { id: 'AP042', title: 'Sliding Window Maximum', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/sliding-window-maximum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/maximum-of-all-subarrays-of-size-k/1' },
      { id: 'AP043', title: 'Max Consecutive Ones III', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/max-consecutive-ones-iii/', gfgUrl: null },
      { id: 'AP044', title: 'Fruit Into Baskets', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/fruit-into-baskets/', gfgUrl: 'https://www.geeksforgeeks.org/problems/fruit-into-baskets/1' },
      { id: 'AP045', title: 'Subarray Product Less Than K', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/subarray-product-less-than-k/', gfgUrl: 'https://www.geeksforgeeks.org/problems/count-subarray-with-k-product/1' },
      { id: 'AP046', title: 'Repeated DNA Sequences', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/repeated-dna-sequences/', gfgUrl: 'https://www.geeksforgeeks.org/problems/repeated-dna-sequences/1' },
      { id: 'AP047', title: 'Find All Anagrams in String', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/find-all-anagrams-in-a-string/', gfgUrl: 'https://www.geeksforgeeks.org/problems/count-occurences-of-anagrams/1' },
    ]
  },
  {
    id: 'stack-queue',
    name: 'Stack & Queue',
    problems: [
      { id: 'AP048', title: 'Valid Parentheses', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/valid-parentheses/', gfgUrl: 'https://www.geeksforgeeks.org/problems/parenthesis-checker/1' },
      { id: 'AP049', title: 'Min Stack', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/min-stack/', gfgUrl: 'https://www.geeksforgeeks.org/problems/get-minimum-element-from-stack/1' },
      { id: 'AP050', title: 'Evaluate Reverse Polish Notation', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/', gfgUrl: 'https://www.geeksforgeeks.org/problems/evaluate-the-expression/1' },
      { id: 'AP051', title: 'Generate Parentheses', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/generate-parentheses/', gfgUrl: 'https://www.geeksforgeeks.org/problems/generate-all-parentheses/1' },
      { id: 'AP052', title: 'Daily Temperatures', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/daily-temperatures/', gfgUrl: 'https://www.geeksforgeeks.org/problems/number-of-nges-to-the-right/1' },
      { id: 'AP053', title: 'Next Greater Element I', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/next-greater-element-i/', gfgUrl: 'https://www.geeksforgeeks.org/problems/next-larger-element/1' },
      { id: 'AP054', title: 'Next Greater Element II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/next-greater-element-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/next-greater-element/1' },
      { id: 'AP055', title: 'Largest Rectangle in Histogram', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/largest-rectangle-in-histogram/', gfgUrl: 'https://www.geeksforgeeks.org/problems/maximum-rectangular-area-in-a-histogram/1' },
      { id: 'AP056', title: 'Maximal Rectangle', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/maximal-rectangle/', gfgUrl: 'https://www.geeksforgeeks.org/problems/max-rectangle/1' },
      { id: 'AP057', title: 'Car Fleet', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/car-fleet/', gfgUrl: null },
      { id: 'AP058', title: 'Asteroid Collision', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/asteroid-collision/', gfgUrl: 'https://www.geeksforgeeks.org/problems/asteroid-collision/1' },
      { id: 'AP059', title: 'Remove K Digits', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/remove-k-digits/', gfgUrl: 'https://www.geeksforgeeks.org/problems/remove-k-digits/1' },
      { id: 'AP060', title: 'Decode String', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/decode-string/', gfgUrl: 'https://www.geeksforgeeks.org/problems/decode-the-string/1' },
      { id: 'AP061', title: 'Simplify Path', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/simplify-path/', gfgUrl: 'https://www.geeksforgeeks.org/problems/simplify-path/1' },
      { id: 'AP062', title: 'Stock Span Problem', difficulty: 'Medium', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/stock-span-problem-1587115621/1' },
      { id: 'AP063', title: 'Rotting Oranges', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/rotting-oranges/', gfgUrl: 'https://www.geeksforgeeks.org/problems/rotten-oranges2536/1' },
      { id: 'AP064', title: 'Clone a Stack Without Extra Space', difficulty: 'Medium', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/clone-a-stack-without-usinig-extra-space/1' },
      { id: 'AP065', title: 'Celebrity Problem', difficulty: 'Medium', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/the-celebrity-problem/1' },
    ]
  },
  {
    id: 'linked-list',
    name: 'Linked List',
    problems: [
      { id: 'AP066', title: 'Reverse Linked List', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/reverse-linked-list/', gfgUrl: 'https://www.geeksforgeeks.org/problems/reverse-a-linked-list/1' },
      { id: 'AP067', title: 'Merge Two Sorted Lists', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/', gfgUrl: 'https://www.geeksforgeeks.org/problems/merge-two-sorted-linked-lists/1' },
      { id: 'AP068', title: 'Linked List Cycle', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/linked-list-cycle/', gfgUrl: 'https://www.geeksforgeeks.org/problems/detect-loop-in-linked-list/1' },
      { id: 'AP069', title: 'Linked List Cycle II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/linked-list-cycle-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/find-the-first-node-of-loop-in-linked-list/1' },
      { id: 'AP070', title: 'Remove Nth Node From End of List', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', gfgUrl: 'https://www.geeksforgeeks.org/problems/remove-nth-node-from-end-of-list/1' },
      { id: 'AP071', title: 'Add Two Numbers', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/add-two-numbers/', gfgUrl: 'https://www.geeksforgeeks.org/problems/add-two-numbers-represented-by-linked-lists/1' },
      { id: 'AP072', title: 'Copy List with Random Pointer', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/copy-list-with-random-pointer/', gfgUrl: 'https://www.geeksforgeeks.org/problems/clone-a-linked-list-with-next-and-random-pointer/1' },
      { id: 'AP073', title: 'Flatten Binary Tree to Linked List', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/flatten-binary-tree-to-linked-list/', gfgUrl: 'https://www.geeksforgeeks.org/problems/flatten-binary-tree-to-linked-list/1' },
      { id: 'AP074', title: 'Rotate List', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/rotate-list/', gfgUrl: 'https://www.geeksforgeeks.org/problems/rotate-a-linked-list/1' },
      { id: 'AP075', title: 'Partition List', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/partition-list/', gfgUrl: 'https://www.geeksforgeeks.org/problems/partition-a-linked-list-around-a-given-value/1' },
      { id: 'AP076', title: 'LRU Cache', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/lru-cache/', gfgUrl: 'https://www.geeksforgeeks.org/problems/lru-cache/1' },
      { id: 'AP077', title: 'LFU Cache', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/lfu-cache/', gfgUrl: 'https://www.geeksforgeeks.org/problems/lfu-cache/1' },
      { id: 'AP078', title: 'Merge k Sorted Lists', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/', gfgUrl: 'https://www.geeksforgeeks.org/problems/merge-k-sorted-linked-lists/1' },
      { id: 'AP079', title: 'Reverse Nodes in k-Group', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/reverse-nodes-in-k-group/', gfgUrl: 'https://www.geeksforgeeks.org/problems/reverse-a-linked-list-in-groups-of-given-size/1' },
      { id: 'AP080', title: 'Design HashMap', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/design-hashmap/', gfgUrl: 'https://www.geeksforgeeks.org/problems/design-hashmap/1' },
      { id: 'AP081', title: 'Middle of the Linked List', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/middle-of-the-linked-list/', gfgUrl: 'https://www.geeksforgeeks.org/problems/finding-middle-element-in-a-linked-list/1' },
      { id: 'AP082', title: 'Palindrome Linked List', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/palindrome-linked-list/', gfgUrl: 'https://www.geeksforgeeks.org/problems/check-if-linked-list-is-pallindrome/1' },
      { id: 'AP083', title: 'Intersection of Two Linked Lists', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/intersection-of-two-linked-lists/', gfgUrl: 'https://www.geeksforgeeks.org/problems/intersection-point-in-y-shaped-linked-lists/1' },
      { id: 'AP084', title: 'Check if Linked List is Circular', difficulty: 'Easy', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/circular-linked-list/1' },
      { id: 'AP085', title: 'Length of Loop in Linked List', difficulty: 'Medium', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/find-length-of-loop/1' },
      { id: 'AP086', title: 'Multiply Two Linked Lists', difficulty: 'Medium', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/multiply-two-linked-lists/1' },
    ]
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    problems: [
      { id: 'AP087', title: 'Binary Search', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/binary-search/', gfgUrl: 'https://www.geeksforgeeks.org/problems/binary-search/1' },
      { id: 'AP088', title: 'Search in Rotated Sorted Array', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', gfgUrl: 'https://www.geeksforgeeks.org/problems/search-in-a-rotated-array/1' },
      { id: 'AP089', title: 'Search in Rotated Sorted Array II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/search-in-rotated-sorted-array/1' },
      { id: 'AP090', title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-element-in-a-sorted-and-rotated-array/1' },
      { id: 'AP091', title: 'Find Peak Element', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/find-peak-element/', gfgUrl: 'https://www.geeksforgeeks.org/problems/peak-element/1' },
      { id: 'AP092', title: 'Search a 2D Matrix', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/search-a-2d-matrix/', gfgUrl: 'https://www.geeksforgeeks.org/problems/search-in-a-matrix/1' },
      { id: 'AP093', title: 'Search a 2D Matrix II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/search-a-2d-matrix-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/search-in-a-matrix17292717/1' },
      { id: 'AP094', title: 'Koko Eating Bananas', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/koko-eating-bananas/', gfgUrl: 'https://www.geeksforgeeks.org/problems/koko-eating-bananas/1' },
      { id: 'AP095', title: 'Capacity To Ship Packages Within D Days', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/', gfgUrl: 'https://www.geeksforgeeks.org/problems/capacity-to-ship-packages-within-d-days/1' },
      { id: 'AP096', title: 'Median of Two Sorted Arrays', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/median-of-two-sorted-arrays/', gfgUrl: 'https://www.geeksforgeeks.org/problems/median-of-two-sorted-arrays/1' },
      { id: 'AP097', title: 'Split Array Largest Sum', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/split-array-largest-sum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/split-array-largest-sum/1' },
      { id: 'AP098', title: 'Find K Closest Elements', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/find-k-closest-elements/', gfgUrl: 'https://www.geeksforgeeks.org/problems/find-k-closest-elements/1' },
      { id: 'AP099', title: 'Time Based Key-Value Store', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/time-based-key-value-store/', gfgUrl: 'https://www.geeksforgeeks.org/problems/time-based-key-value-store/1' },
      { id: 'AP100', title: 'Single Element in a Sorted Array', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/single-element-in-a-sorted-array/', gfgUrl: 'https://www.geeksforgeeks.org/problems/find-the-element-that-appears-once-in-sorted-array/1' },
      { id: 'AP101', title: 'Sqrt(x)', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/sqrtx/', gfgUrl: 'https://www.geeksforgeeks.org/problems/square-root/1' },
      { id: 'AP102', title: 'Find Pair with Given Difference', difficulty: 'Medium', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/find-pair-given-difference1559/1' },
      { id: 'AP103', title: 'Find Bitonic Point', difficulty: 'Medium', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/maximum-value-in-a-bitonic-array3001/1' },
      { id: 'AP104', title: 'Transition Point in Binary Array', difficulty: 'Easy', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/find-transition-point-1587115620/1' },
    ]
  },
  {
    id: 'trees',
    name: 'Trees',
    problems: [
      { id: 'AP105', title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/maximum-depth-of-binary-tree/1' },
      { id: 'AP106', title: 'Same Tree', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/same-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/determine-if-two-trees-are-identical/1' },
      { id: 'AP107', title: 'Invert Binary Tree', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/invert-binary-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/mirror-tree/1' },
      { id: 'AP108', title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', gfgUrl: 'https://www.geeksforgeeks.org/problems/level-order-traversal/1' },
      { id: 'AP109', title: 'Binary Tree Zigzag Level Order Traversal', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/', gfgUrl: 'https://www.geeksforgeeks.org/problems/zigzag-tree-traversal/1' },
      { id: 'AP110', title: 'Binary Tree Right Side View', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/binary-tree-right-side-view/', gfgUrl: 'https://www.geeksforgeeks.org/problems/right-view-of-binary-tree/1' },
      { id: 'AP111', title: 'Binary Tree Left Side View', difficulty: 'Easy', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/left-view-of-binary-tree/1' },
      { id: 'AP112', title: 'Top View of Binary Tree', difficulty: 'Medium', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/top-view-of-binary-tree/1' },
      { id: 'AP113', title: 'Bottom View of Binary Tree', difficulty: 'Medium', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/bottom-view-of-binary-tree/1' },
      { id: 'AP114', title: 'Vertical Order Traversal', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/vertical-traversal-of-binary-tree/1' },
      { id: 'AP115', title: 'Binary Tree Paths', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/binary-tree-paths/', gfgUrl: 'https://www.geeksforgeeks.org/problems/binary-tree-paths/1' },
      { id: 'AP116', title: 'Path Sum', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/path-sum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/root-to-leaf-path-sum/1' },
      { id: 'AP117', title: 'Path Sum II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/path-sum-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/paths-from-root-with-a-specified-sum/1' },
      { id: 'AP118', title: 'Path Sum III', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/path-sum-iii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/k-sum-paths/1' },
      { id: 'AP119', title: 'Subtree of Another Tree', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/subtree-of-another-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/check-if-subtree/1' },
      { id: 'AP120', title: 'Lowest Common Ancestor of Binary Tree', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/lowest-common-ancestor-in-a-binary-tree/1' },
      { id: 'AP121', title: 'Lowest Common Ancestor of BST', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/lowest-common-ancestor-in-a-bst/1' },
      { id: 'AP122', title: 'Diameter of Binary Tree', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/diameter-of-binary-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/diameter-of-binary-tree/1' },
      { id: 'AP123', title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/maximum-path-sum-from-any-node/1' },
      { id: 'AP124', title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/serialize-and-deserialize-a-binary-tree/1' },
      { id: 'AP125', title: 'Validate Binary Search Tree', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/validate-binary-search-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/check-for-bst/1' },
      { id: 'AP126', title: 'Kth Smallest Element in a BST', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/', gfgUrl: 'https://www.geeksforgeeks.org/problems/kth-largest-element-in-bst/1' },
      { id: 'AP127', title: 'Convert Sorted Array to BST', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/array-to-bst/1' },
      { id: 'AP128', title: 'Binary Tree to DLL', difficulty: 'Medium', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/binary-tree-to-dll/1' },
      { id: 'AP129', title: 'Construct Binary Tree from Preorder and Inorder', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/', gfgUrl: 'https://www.geeksforgeeks.org/problems/construct-tree-1/1' },
      { id: 'AP130', title: 'Construct Binary Tree from Inorder and Postorder', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/', gfgUrl: 'https://www.geeksforgeeks.org/problems/tree-from-postorder-and-inorder/1' },
      { id: 'AP131', title: 'Populating Next Right Pointers in Each Node', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/populating-next-right-pointers-in-each-node/', gfgUrl: 'https://www.geeksforgeeks.org/problems/populate-inorder-successor-for-all-nodes/1' },
    ]
  },
  {
    id: 'heap',
    name: 'Heap & Priority Queue',
    problems: [
      { id: 'AP132', title: 'Kth Largest Element in an Array', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', gfgUrl: 'https://www.geeksforgeeks.org/problems/kth-largest-element/1' },
      { id: 'AP133', title: 'Find Median from Data Stream', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/find-median-from-data-stream/', gfgUrl: 'https://www.geeksforgeeks.org/problems/find-median-in-a-stream/1' },
      { id: 'AP134', title: 'Merge k Sorted Lists', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/', gfgUrl: 'https://www.geeksforgeeks.org/problems/merge-k-sorted-linked-lists/1' },
      { id: 'AP135', title: 'Top K Frequent Elements', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/top-k-frequent-elements/', gfgUrl: 'https://www.geeksforgeeks.org/problems/top-k-frequent-elements/1' },
      { id: 'AP136', title: 'Task Scheduler', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/task-scheduler/', gfgUrl: 'https://www.geeksforgeeks.org/problems/task-scheduler/1' },
      { id: 'AP137', title: 'Design Twitter', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/design-twitter/', gfgUrl: 'https://www.geeksforgeeks.org/problems/design-twitter/1' },
      { id: 'AP138', title: 'Reorganize String', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/reorganize-string/', gfgUrl: 'https://www.geeksforgeeks.org/problems/reorganize-the-array/1' },
      { id: 'AP139', title: 'Minimum Cost to Connect Sticks', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/minimum-cost-to-connect-sticks/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-cost-of-ropes/1' },
      { id: 'AP140', title: 'Maximum Performance of a Team', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/maximum-performance-of-a-team/', gfgUrl: 'https://www.geeksforgeeks.org/problems/maximum-performance-of-a-team/1' },
      { id: 'AP141', title: 'Smallest Range Covering Elements from K Lists', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/', gfgUrl: 'https://www.geeksforgeeks.org/problems/find-smallest-range-containing-elements-from-k-lists/1' },
      { id: 'AP142', title: 'Sliding Window Maximum', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/sliding-window-maximum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/maximum-of-all-subarrays-of-size-k/1' },
      { id: 'AP143', title: 'Meeting Rooms II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/meeting-rooms-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-platforms/1' },
      { id: 'AP144', title: 'K Closest Points to Origin', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/k-closest-points-to-origin/', gfgUrl: 'https://www.geeksforgeeks.org/problems/k-closest-points-to-origin/1' },
    ]
  },
  {
    id: 'backtracking',
    name: 'Backtracking',
    problems: [
      { id: 'AP145', title: 'Subsets', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/subsets/', gfgUrl: 'https://www.geeksforgeeks.org/problems/subsets/1' },
      { id: 'AP146', title: 'Subsets II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/subsets-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/subsets-ii/1' },
      { id: 'AP147', title: 'Combinations', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/combinations/', gfgUrl: 'https://www.geeksforgeeks.org/problems/combinations/1' },
      { id: 'AP148', title: 'Combination Sum', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/combination-sum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/combination-sum/1' },
      { id: 'AP149', title: 'Combination Sum II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/combination-sum-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/combination-sum-ii/1' },
      { id: 'AP150', title: 'Combination Sum III', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/combination-sum-iii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/combination-sum-iii/1' },
      { id: 'AP151', title: 'Permutations', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/permutations/', gfgUrl: 'https://www.geeksforgeeks.org/problems/permutations-of-a-given-string/1' },
      { id: 'AP152', title: 'Permutations II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/permutations-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/permutations-ii/1' },
      { id: 'AP153', title: 'N-Queens', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/n-queens/', gfgUrl: 'https://www.geeksforgeeks.org/problems/n-queen-problem/1' },
      { id: 'AP154', title: 'N-Queens II', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/n-queens-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/n-queen-problem/1' },
      { id: 'AP155', title: 'Sudoku Solver', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/sudoku-solver/', gfgUrl: 'https://www.geeksforgeeks.org/problems/solve-the-sudoku/1' },
      { id: 'AP156', title: 'Word Search', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/word-search/', gfgUrl: 'https://www.geeksforgeeks.org/problems/word-search/1' },
      { id: 'AP157', title: 'Letter Combinations of Phone Number', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/', gfgUrl: 'https://www.geeksforgeeks.org/problems/letter-combinations-of-a-phone-number/1' },
      { id: 'AP158', title: 'Generate Parentheses', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/generate-parentheses/', gfgUrl: 'https://www.geeksforgeeks.org/problems/generate-all-parentheses/1' },
      { id: 'AP159', title: 'Palindrome Partitioning', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/palindrome-partitioning/', gfgUrl: 'https://www.geeksforgeeks.org/problems/palindromic-partitioning/1' },
      { id: 'AP160', title: 'Restore IP Addresses', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/restore-ip-addresses/', gfgUrl: 'https://www.geeksforgeeks.org/problems/generate-ip-addresses/1' },
      { id: 'AP161', title: 'Expression Add Operators', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/expression-add-operators/', gfgUrl: 'https://www.geeksforgeeks.org/problems/expression-add-operators/1' },
      { id: 'AP162', title: 'Partition to K Equal Sum Subsets', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/partition-to-k-equal-sum-subsets/', gfgUrl: 'https://www.geeksforgeeks.org/problems/partition-array-to-k-subsets/1' },
    ]
  },
  {
    id: 'tries',
    name: 'Tries',
    problems: [
      { id: 'AP163', title: 'Implement Trie (Prefix Tree)', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/implement-trie-prefix-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/trie-insert-and-search/1' },
      { id: 'AP164', title: 'Design Add and Search Words Data Structure', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/design-add-and-search-words-data-structure/', gfgUrl: 'https://www.geeksforgeeks.org/problems/design-add-and-search-words-data-structure/1' },
      { id: 'AP165', title: 'Word Search II', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/word-search-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/word-search-ii/1' },
      { id: 'AP166', title: 'Replace Words', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/replace-words/', gfgUrl: 'https://www.geeksforgeeks.org/problems/replace-words/1' },
      { id: 'AP167', title: 'Maximum XOR of Two Numbers in an Array', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/', gfgUrl: 'https://www.geeksforgeeks.org/problems/maximum-xor-of-two-numbers-in-an-array/1' },
      { id: 'AP168', title: 'Palindrome Pairs', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/palindrome-pairs/', gfgUrl: 'https://www.geeksforgeeks.org/problems/palindrome-pairs/1' },
      { id: 'AP169', title: 'Stream of Characters', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/stream-of-characters/', gfgUrl: 'https://www.geeksforgeeks.org/problems/stream-of-characters/1' },
    ]
  },
  {
    id: 'graphs',
    name: 'Graphs',
    problems: [
      { id: 'AP170', title: 'Number of Islands', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/number-of-islands/', gfgUrl: 'https://www.geeksforgeeks.org/problems/find-the-number-of-islands/1' },
      { id: 'AP171', title: 'Max Area of Island', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/max-area-of-island/', gfgUrl: 'https://www.geeksforgeeks.org/problems/find-number-of-islands/1' },
      { id: 'AP172', title: 'Clone Graph', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/clone-graph/', gfgUrl: 'https://www.geeksforgeeks.org/problems/clone-an-undirected-graph/1' },
      { id: 'AP173', title: 'Pacific Atlantic Water Flow', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/pacific-atlantic-water-flow/', gfgUrl: 'https://www.geeksforgeeks.org/problems/pacific-atlantic-water-flow/1' },
      { id: 'AP174', title: 'Course Schedule', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/course-schedule/', gfgUrl: 'https://www.geeksforgeeks.org/problems/course-schedule/1' },
      { id: 'AP175', title: 'Course Schedule II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/course-schedule-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/course-schedule/1' },
      { id: 'AP176', title: 'Alien Dictionary', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/alien-dictionary/', gfgUrl: 'https://www.geeksforgeeks.org/problems/alien-dictionary/1' },
      { id: 'AP177', title: 'Word Ladder', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/word-ladder/', gfgUrl: 'https://www.geeksforgeeks.org/problems/word-ladder/1' },
      { id: 'AP178', title: 'Word Ladder II', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/word-ladder-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/word-ladder-ii/1' },
      { id: 'AP179', title: 'Rotting Oranges', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/rotting-oranges/', gfgUrl: 'https://www.geeksforgeeks.org/problems/rotten-oranges2536/1' },
      { id: 'AP180', title: 'Surrounded Regions', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/surrounded-regions/', gfgUrl: 'https://www.geeksforgeeks.org/problems/replace-os-with-xs/1' },
      { id: 'AP181', title: 'Graph Valid Tree', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/graph-valid-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/graph-valid-tree/1' },
      { id: 'AP182', title: 'Redundant Connection', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/redundant-connection/', gfgUrl: 'https://www.geeksforgeeks.org/problems/redundant-connection/1' },
      { id: 'AP183', title: 'Network Delay Time', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/network-delay-time/', gfgUrl: 'https://www.geeksforgeeks.org/problems/network-delay-time/1' },
      { id: 'AP184', title: 'Cheapest Flights Within K Stops', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/cheapest-flights-within-k-stops/', gfgUrl: 'https://www.geeksforgeeks.org/problems/cheapest-flights-within-k-stops/1' },
      { id: 'AP185', title: 'Is Graph Bipartite', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/is-graph-bipartite/', gfgUrl: 'https://www.geeksforgeeks.org/problems/bipartite-graph/1' },
      { id: 'AP186', title: 'Keys and Rooms', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/keys-and-rooms/', gfgUrl: 'https://www.geeksforgeeks.org/problems/keys-and-rooms/1' },
      { id: 'AP187', title: 'Reconstruct Itinerary', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/reconstruct-itinerary/', gfgUrl: 'https://www.geeksforgeeks.org/problems/reconstruct-itinerary/1' },
      { id: 'AP188', title: 'Topological Sort', difficulty: 'Medium', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/topological-sort/1' },
      { id: 'AP189', title: 'Detect Cycle in Directed Graph', difficulty: 'Medium', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1' },
      { id: 'AP190', title: 'Dijkstra Algorithm', difficulty: 'Medium', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-7-adjacency-list/1' },
    ]
  },
  {
    id: 'advanced-graphs',
    name: 'Advanced Graphs',
    problems: [
      { id: 'AP191', title: 'Swim in Rising Water', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/swim-in-rising-water/', gfgUrl: 'https://www.geeksforgeeks.org/problems/swim-in-rising-water/1' },
      { id: 'AP192', title: 'Find Critical and Pseudo-Critical Edges in MST', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree/', gfgUrl: 'https://www.geeksforgeeks.org/problems/critical-connections-in-a-network/1' },
      { id: 'AP193', title: 'Minimum Obstacle Removal to Reach Corner', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/minimum-obstacle-removal-to-reach-corner/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-obstacle-removal-to-reach-corner/1' },
      { id: 'AP194', title: 'Last Day Where You Can Still Cross', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/last-day-where-you-can-still-cross/', gfgUrl: 'https://www.geeksforgeeks.org/problems/last-day-where-you-can-still-cross/1' },
      { id: 'AP195', title: 'Trapping Rain Water II', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/trapping-rain-water-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/trapping-rain-water-ii/1' },
    ]
  },
  {
    id: '1d-dp',
    name: '1-D DP',
    problems: [
      { id: 'AP196', title: 'Climbing Stairs', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/climbing-stairs/', gfgUrl: 'https://www.geeksforgeeks.org/problems/count-ways-to-reach-the-nth-stair/1' },
      { id: 'AP197', title: 'House Robber', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/house-robber/', gfgUrl: 'https://www.geeksforgeeks.org/problems/stickler-theif/1' },
      { id: 'AP198', title: 'House Robber II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/house-robber-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/stickler-theif-1587115621/1' },
      { id: 'AP199', title: 'Maximum Subarray', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/maximum-subarray/', gfgUrl: 'https://www.geeksforgeeks.org/problems/max-sum-without-adjacents2430/1' },
      { id: 'AP200', title: 'Coin Change', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/coin-change/', gfgUrl: 'https://www.geeksforgeeks.org/problems/coin-change/1' },
      { id: 'AP201', title: 'Coin Change 2', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/coin-change-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/coin-change-number-of-ways/1' },
      { id: 'AP202', title: 'Minimum Cost For Tickets', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/minimum-cost-for-tickets/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-cost-for-tickets/1' },
      { id: 'AP203', title: 'Longest Increasing Subsequence', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/', gfgUrl: 'https://www.geeksforgeeks.org/problems/longest-increasing-subsequence/1' },
      { id: 'AP204', title: 'Number of LIS', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/number-of-longest-increasing-subsequence/', gfgUrl: 'https://www.geeksforgeeks.org/problems/number-of-longest-increasing-subsequence/1' },
      { id: 'AP205', title: 'Partition Equal Subset Sum', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/partition-equal-subset-sum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/subset-sum-problem2014/1' },
      { id: 'AP206', title: 'Combination Sum IV', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/combination-sum-iv/', gfgUrl: 'https://www.geeksforgeeks.org/problems/combination-sum-iv/1' },
      { id: 'AP207', title: 'Word Break', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/word-break/', gfgUrl: 'https://www.geeksforgeeks.org/problems/word-break/1' },
      { id: 'AP208', title: 'Decode Ways', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/decode-ways/', gfgUrl: 'https://www.geeksforgeeks.org/problems/total-decoding-messages/1' },
      { id: 'AP209', title: 'Palindromic Substrings', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/palindromic-substrings/', gfgUrl: 'https://www.geeksforgeeks.org/problems/count-palindrome-sub-strings-of-a-string/1' },
      { id: 'AP210', title: 'Longest Palindromic Substring', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/longest-palindromic-substring/', gfgUrl: 'https://www.geeksforgeeks.org/problems/longest-palindrome-in-a-string/1' },
      { id: 'AP211', title: 'Edit Distance', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/edit-distance/', gfgUrl: 'https://www.geeksforgeeks.org/problems/edit-distance/1' },
      { id: 'AP212', title: 'Delete and Earn', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/delete-and-earn/', gfgUrl: 'https://www.geeksforgeeks.org/problems/delete-and-earn/1' },
    ]
  },
  {
    id: '2d-dp',
    name: '2-D DP',
    problems: [
      { id: 'AP213', title: 'Unique Paths', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/unique-paths/', gfgUrl: 'https://www.geeksforgeeks.org/problems/count-all-possible-paths-from-top-left-to-bottom-right/1' },
      { id: 'AP214', title: 'Unique Paths II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/unique-paths-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/count-all-possible-paths/1' },
      { id: 'AP215', title: 'Minimum Path Sum', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/minimum-path-sum/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-cost-path/1' },
      { id: 'AP216', title: 'Triangle', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/triangle/', gfgUrl: 'https://www.geeksforgeeks.org/problems/triangle-sum-path-in-triangle/1' },
      { id: 'AP217', title: 'Dungeon Game', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/dungeon-game/', gfgUrl: 'https://www.geeksforgeeks.org/problems/dungeon-game/1' },
      { id: 'AP218', title: 'Longest Common Subsequence', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/longest-common-subsequence/', gfgUrl: 'https://www.geeksforgeeks.org/problems/longest-common-subsequence/1' },
      { id: 'AP219', title: 'Interleaving String', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/interleaving-string/', gfgUrl: 'https://www.geeksforgeeks.org/problems/interleaved-strings/1' },
      { id: 'AP220', title: 'Regular Expression Matching', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/regular-expression-matching/', gfgUrl: 'https://www.geeksforgeeks.org/problems/wildcard-string-matching/1' },
      { id: 'AP221', title: 'Wildcard Matching', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/wildcard-matching/', gfgUrl: 'https://www.geeksforgeeks.org/problems/wildcard-pattern-matching/1' },
      { id: 'AP222', title: 'Burst Balloons', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/burst-balloons/', gfgUrl: 'https://www.geeksforgeeks.org/problems/burst-balloons/1' },
      { id: 'AP223', title: 'Best Time to Buy and Sell Stock with Cooldown', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/', gfgUrl: 'https://www.geeksforgeeks.org/problems/stock-buy-and-sell/1' },
      { id: 'AP224', title: 'Best Time to Buy and Sell Stock III', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/buy-maximum-stocks-if-i-stocks-can-be-bought-on-i-th-day/1' },
      { id: 'AP225', title: 'Best Time to Buy and Sell Stock IV', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/', gfgUrl: 'https://www.geeksforgeeks.org/problems/stock-buy-and-sell-1587115621/1' },
      { id: 'AP226', title: 'Maximal Square', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/maximal-square/', gfgUrl: 'https://www.geeksforgeeks.org/problems/largest-square-formed-in-a-matrix/1' },
      { id: 'AP227', title: 'Maximum Rectangle', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/maximal-rectangle/', gfgUrl: 'https://www.geeksforgeeks.org/problems/max-rectangle/1' },
    ]
  },
  {
    id: 'greedy',
    name: 'Greedy',
    problems: [
      { id: 'AP228', title: 'Assign Cookies', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/assign-cookies/', gfgUrl: 'https://www.geeksforgeeks.org/problems/assign-cookies/1' },
      { id: 'AP229', title: 'Non-overlapping Intervals', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/non-overlapping-intervals/', gfgUrl: 'https://www.geeksforgeeks.org/problems/non-overlapping-intervals/1' },
      { id: 'AP230', title: 'Meeting Rooms', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/meeting-rooms/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-platforms/1' },
      { id: 'AP231', title: 'Meeting Rooms II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/meeting-rooms-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-platforms/1' },
      { id: 'AP232', title: 'Jump Game', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/jump-game/', gfgUrl: 'https://www.geeksforgeeks.org/problems/jump-game/1' },
      { id: 'AP233', title: 'Jump Game II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/jump-game-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-number-of-jumps/1' },
      { id: 'AP234', title: 'Gas Station', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/gas-station/', gfgUrl: 'https://www.geeksforgeeks.org/problems/circular-tour/1' },
      { id: 'AP235', title: 'Candy', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/candy/', gfgUrl: 'https://www.geeksforgeeks.org/problems/candy/1' },
      { id: 'AP236', title: 'Reconstruct Queue by Height', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/queue-reconstruction-by-height/', gfgUrl: 'https://www.geeksforgeeks.org/problems/queue-reconstruction-by-height/1' },
      { id: 'AP237', title: 'Partition Labels', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/partition-labels/', gfgUrl: 'https://www.geeksforgeeks.org/problems/partition-labels/1' },
      { id: 'AP238', title: 'Task Scheduler', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/task-scheduler/', gfgUrl: 'https://www.geeksforgeeks.org/problems/task-scheduler/1' },
      { id: 'AP239', title: 'Minimum Number of Arrows to Burst Balloons', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-number-of-arrows-to-burst-balloons/1' },
      { id: 'AP240', title: 'Remove K Digits', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/remove-k-digits/', gfgUrl: 'https://www.geeksforgeeks.org/problems/remove-k-digits/1' },
      { id: 'AP241', title: 'Monotone Increasing Digits', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/monotone-increasing-digits/', gfgUrl: 'https://www.geeksforgeeks.org/problems/monotone-increasing-digits/1' },
      { id: 'AP242', title: 'Broken Calculator', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/broken-calculator/', gfgUrl: 'https://www.geeksforgeeks.org/problems/broken-calculator/1' },
    ]
  },
  {
    id: 'intervals',
    name: 'Intervals',
    problems: [
      { id: 'AP243', title: 'Insert Interval', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/insert-interval/', gfgUrl: 'https://www.geeksforgeeks.org/problems/insert-interval/1' },
      { id: 'AP244', title: 'Merge Intervals', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/merge-intervals/', gfgUrl: 'https://www.geeksforgeeks.org/problems/overlapping-intervals/1' },
      { id: 'AP245', title: 'Non-overlapping Intervals', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/non-overlapping-intervals/', gfgUrl: 'https://www.geeksforgeeks.org/problems/non-overlapping-intervals/1' },
      { id: 'AP246', title: 'Meeting Rooms', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/meeting-rooms/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-platforms/1' },
      { id: 'AP247', title: 'Meeting Rooms II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/meeting-rooms-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-platforms/1' },
      { id: 'AP248', title: 'Minimum Interval to Include Each Query', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/minimum-interval-to-include-each-query/', gfgUrl: 'https://www.geeksforgeeks.org/problems/minimum-interval-to-include-each-query/1' },
    ]
  },
  {
    id: 'math-geometry',
    name: 'Math & Geometry',
    problems: [
      { id: 'AP249', title: 'Rotate Image', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/rotate-image/', gfgUrl: 'https://www.geeksforgeeks.org/problems/rotate-by-90-degree/1' },
      { id: 'AP250', title: 'Spiral Matrix', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/spiral-matrix/', gfgUrl: 'https://www.geeksforgeeks.org/problems/spirally-traversing-a-matrix/1' },
      { id: 'AP251', title: 'Spiral Matrix II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/spiral-matrix-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/spiral-matrix/1' },
      { id: 'AP252', title: 'Set Matrix Zeroes', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/set-matrix-zeroes/', gfgUrl: 'https://www.geeksforgeeks.org/problems/boolean-matrix-problem/1' },
      { id: 'AP253', title: 'Happy Number', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/happy-number/', gfgUrl: 'https://www.geeksforgeeks.org/problems/happy-number/1' },
      { id: 'AP254', title: 'Plus One', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/plus-one/', gfgUrl: 'https://www.geeksforgeeks.org/problems/plus-one/1' },
      { id: 'AP255', title: 'Pow(x, n)', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/powx-n/', gfgUrl: 'https://www.geeksforgeeks.org/problems/power-of-numbers/1' },
      { id: 'AP256', title: 'Multiply Strings', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/multiply-strings/', gfgUrl: 'https://www.geeksforgeeks.org/problems/multiply-strings/1' },
      { id: 'AP257', title: 'Factorial Trailing Zeroes', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/factorial-trailing-zeroes/', gfgUrl: 'https://www.geeksforgeeks.org/problems/trailing-zeroes-in-factorial/1' },
      { id: 'AP258', title: 'Integer to English Words', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/integer-to-english-words/', gfgUrl: 'https://www.geeksforgeeks.org/problems/number-to-words/1' },
      { id: 'AP259', title: 'Basic Calculator', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/basic-calculator/', gfgUrl: 'https://www.geeksforgeeks.org/problems/expression-evaluation/1' },
      { id: 'AP260', title: 'Basic Calculator II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/basic-calculator-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/expression-evaluation/1' },
      { id: 'AP261', title: 'Largest Even Number', difficulty: 'Medium', leetCodeUrl: null, gfgUrl: 'https://www.geeksforgeeks.org/problems/largest-even-number3821/1' },
    ]
  },
  {
    id: 'bit-manipulation',
    name: 'Bit Manipulation',
    problems: [
      { id: 'AP262', title: 'Single Number', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/single-number/', gfgUrl: 'https://www.geeksforgeeks.org/problems/odd-occurrences-in-an-array/1' },
      { id: 'AP263', title: 'Number of 1 Bits', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/number-of-1-bits/', gfgUrl: 'https://www.geeksforgeeks.org/problems/set-bits-count/1' },
      { id: 'AP264', title: 'Counting Bits', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/counting-bits/', gfgUrl: 'https://www.geeksforgeeks.org/problems/count-total-set-bits/1' },
      { id: 'AP265', title: 'Missing Number', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/missing-number/', gfgUrl: 'https://www.geeksforgeeks.org/problems/missing-number-in-array/1' },
      { id: 'AP266', title: 'Reverse Bits', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/reverse-bits/', gfgUrl: 'https://www.geeksforgeeks.org/problems/reverse-bits/1' },
      { id: 'AP267', title: 'Single Number II', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/single-number-ii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/find-element-odd-number-of-times/1' },
      { id: 'AP268', title: 'Single Number III', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/single-number-iii/', gfgUrl: 'https://www.geeksforgeeks.org/problems/two-numbers-with-odd-occurrences/1' },
      { id: 'AP269', title: 'Maximum XOR of Two Numbers', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/', gfgUrl: 'https://www.geeksforgeeks.org/problems/maximum-xor-of-two-numbers-in-an-array/1' },
      { id: 'AP270', title: 'Bitwise AND of Numbers Range', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/bitwise-and-of-numbers-range/', gfgUrl: 'https://www.geeksforgeeks.org/problems/bitwise-and-of-numbers-range/1' },
    ]
  },
  {
    id: 'design',
    name: 'Design Problems',
    problems: [
      { id: 'AP271', title: 'Design HashSet', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/design-hashset/', gfgUrl: 'https://www.geeksforgeeks.org/problems/design-hashset/1' },
      { id: 'AP272', title: 'Design HashMap', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/design-hashmap/', gfgUrl: 'https://www.geeksforgeeks.org/problems/design-hashmap/1' },
      { id: 'AP273', title: 'Design Linked List', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/design-linked-list/', gfgUrl: 'https://www.geeksforgeeks.org/problems/design-linked-list/1' },
      { id: 'AP274', title: 'Design Circular Queue', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/design-circular-queue/', gfgUrl: 'https://www.geeksforgeeks.org/problems/circular-queue-implementation/1' },
      { id: 'AP275', title: 'Design Hit Counter', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/design-hit-counter/', gfgUrl: 'https://www.geeksforgeeks.org/problems/design-hit-counter/1' },
      { id: 'AP276', title: 'Insert Delete GetRandom O(1)', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/insert-delete-getrandom-o1/', gfgUrl: 'https://www.geeksforgeeks.org/problems/insert-delete-getrandom-o1/1' },
      { id: 'AP277', title: 'LRU Cache', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/lru-cache/', gfgUrl: 'https://www.geeksforgeeks.org/problems/lru-cache/1' },
      { id: 'AP278', title: 'LFU Cache', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/lfu-cache/', gfgUrl: 'https://www.geeksforgeeks.org/problems/lfu-cache/1' },
      { id: 'AP279', title: 'Time Based Key-Value Store', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/time-based-key-value-store/', gfgUrl: 'https://www.geeksforgeeks.org/problems/time-based-key-value-store/1' },
      { id: 'AP280', title: 'Design Browser History', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/design-browser-history/', gfgUrl: 'https://www.geeksforgeeks.org/problems/design-browser-history/1' },
      { id: 'AP281', title: 'Design Underground System', difficulty: 'Medium', leetCodeUrl: 'https://leetcode.com/problems/design-underground-system/', gfgUrl: 'https://www.geeksforgeeks.org/problems/design-underground-system/1' },
      { id: 'AP282', title: 'Design Parking System', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/design-parking-system/', gfgUrl: null },
      { id: 'AP283', title: 'All O one Data Structure', difficulty: 'Hard', leetCodeUrl: 'https://leetcode.com/problems/all-oone-data-structure/', gfgUrl: 'https://www.geeksforgeeks.org/problems/all-oone-data-structure/1' },
      { id: 'AP284', title: 'Implement Stack using Queues', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/implement-stack-using-queues/', gfgUrl: 'https://www.geeksforgeeks.org/problems/stack-using-two-queues/1' },
      { id: 'AP285', title: 'Implement Queue using Stacks', difficulty: 'Easy', leetCodeUrl: 'https://leetcode.com/problems/implement-queue-using-stacks/', gfgUrl: 'https://www.geeksforgeeks.org/problems/queue-using-two-stacks/1' },
    ]
  },
];

// Calculate statistics for Apple questions
export const getAppleInterviewStats = () => {
  let total = 0;
  let easy = 0;
  let medium = 0;
  let hard = 0;

  appleInterviewCategories.forEach(category => {
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
    categories: appleInterviewCategories.length
  };
};

// Get problem by ID
export const getAppleProblemById = (id) => {
  for (const category of appleInterviewCategories) {
    const problem = category.problems.find(p => p.id === id);
    if (problem) return { ...problem, category: category.name };
  }
  return null;
};
