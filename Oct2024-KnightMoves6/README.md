# Knight Moves 6 - Jane Street Puzzle Solution Process

[https://www.janestreet.com/puzzles/knight-moves-6-index/](https://www.janestreet.com/puzzles/knight-moves-6-index/)

## The Problem
Given a 6x6 board where:
- Need to place 3 distinct positive integers (A, B, C) on all correspondingly labelled squares
- Need to find two knight paths:
  a. a1 to f6
  b. a6 to f1
- No square can be revisited within a trip
- Each path must score exactly 2024 points
- Both trips must use the same integers for A, B, C
- Scoring rules:
  - Start with A points
  - When moving between different numbers: multiply by destination value
  - When moving between same numbers: add destination value
- **Goal**: Minimize A + B + C (must be < 50)

## Problem-Solving Steps

### Step 1: Board Configuration Analysis
- Created a 6x6 board layout with A, B, C values
- Analyzed the pattern needed for optimal scoring:
```
A B B C C C
A B B C C C
A A B B C C
A A B B C C
A A A B B C
A A A B B C
```

### Step 2: Path Generation Development
- Implemented `generateKnightPaths` function to:
  - Find all possible paths between corners
  - Handle paths of different lengths (4, 6, 8, 10 moves)
  - Convert coordinates to chess notation (a1, b3, etc.)
  - Ensure no square revisiting

### Step 3: Scoring System Implementation
- Created equation generation system that:
  - Tracks moves between same/different letters
  - Builds mathematical expressions for scoring
  - Example equation: `((((((A + A) * B) * C) * B) * C + C) * B) * C + C + C`

### Step 4: Value Finding Optimization
- Implemented solution finding with multiple optimizations:
  1. Memoization for equation evaluation
  2. Caching for path validation
  3. Letter sequence caching
  4. Early termination for invalid paths

### Step 5: Mathematical Analysis
Analyzed possible value ranges:
- Proved A, B, C cannot all be 2
- Proved two values cannot be 2 with the third being 3
- Established search boundaries for A, B, C values
- Limited search space by determining upper and lower bounds for A, B, C values

### Step 6: Final Solution Implementation
Created a system that:
1. Generates all possible paths
2. Finds valid equations for each path
3. Searches for common A, B, C values that work for both paths
4. Tracks and returns the solution with minimum sum
```
## Final Solution Found
Path a1->f6: a1 -> b3 -> c5 -> e4 -> d2 -> f3 -> e5 -> c4 -> e3 -> d5 -> f6
Path a6->f1: a6 -> b4 -> c6 -> e5 -> c4 -> d6 -> e4 -> c3 -> d5 -> e3 -> f1
Values: A = 1, B = 5, C = 2
Total sum: 8
```

## Key Optimizations Made
1. Memoization of equation evaluations
2. Path validity caching
3. Letter sequence caching
4. Early termination of invalid paths
5. Reduced search space for A, B, C values
6. Progress tracking for long-running calculations