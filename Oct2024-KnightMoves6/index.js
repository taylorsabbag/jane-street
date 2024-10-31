function generateKnightPaths(startX, startY, endX, endY, size, numMoves) {
  const knightMoves = [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ];
  const queue = [[[startX, startY]]];
  const validPaths = [];

  function coordinateToNotation(x, y) {
    return String.fromCharCode(97 + x) + (y + 1);
  }

  function isValid(x, y, path) {
    return (
      x >= 0 &&
      x < size &&
      y >= 0 &&
      y < size &&
      !path.some(([px, py]) => px === x && py === y)
    );
  }

  for (let move = 0; move < numMoves; move++) {
    const levelSize = queue.length;

    for (let i = 0; i < levelSize; i++) {
      const path = queue.shift();
      const [x, y] = path[path.length - 1];

      for (const [dx, dy] of knightMoves) {
        const newX = x + dx;
        const newY = y + dy;
        if (isValid(newX, newY, path)) {
          const newPath = [...path, [newX, newY]];
          if (move === numMoves - 1 && newX === endX && newY === endY) {
            validPaths.push(
              newPath.map(([x, y]) => coordinateToNotation(x, y))
            );
          } else if (move < numMoves - 1) {
            queue.push(newPath);
          }
        }
      }
    }
  }

  return validPaths;
}

function printPaths(paths, start, end, moves) {
  console.log(`Paths from ${start} to ${end} in ${moves} moves:`);
  if (paths.length === 0) {
    console.log("No valid paths found.");
  } else {
    paths.forEach((path, index) => {
      console.log(`Path ${index + 1}: ${path.join(" -> ")}`);
    });
    console.log(`Total paths: ${paths.length}`);
  }
  console.log();
}

const equationEvalCache = new Map();
const pathValidityCache = new Map();
const letterSequenceCache = new Map();

function convertNotation(notation) {
  const col = notation.charCodeAt(0) - "a".charCodeAt(0);
  const row = 6 - Number.parseInt(notation[1]); // 6 is the board size
  return [row, col];
}

function memoizedGetLetterSequence(board, path) {
  const pathKey = path.join(",");
  if (letterSequenceCache.has(pathKey)) {
    return letterSequenceCache.get(pathKey);
  }

  const sequence = path.map((pos) => {
    const [row, col] = convertNotation(pos);
    return board[row][col];
  });

  letterSequenceCache.set(pathKey, sequence);
  return sequence;
}

function memoizedEvaluateEquation(equation, a, b, c) {
  const key = `${equation}:${a},${b},${c}`;
  if (equationEvalCache.has(key)) {
    return equationEvalCache.get(key);
  }

  try {
    const equationFunc = new Function("A", "B", "C", `return ${equation};`);
    const result = equationFunc(a, b, c);
    equationEvalCache.set(key, result);
    return result;
  } catch (e) {
    equationEvalCache.set(key, null);
    return null;
  }
}

function generateEquation(board, path) {
  const pathKey = path.join(",");
  if (pathValidityCache.has(pathKey)) {
    return pathValidityCache.get(pathKey);
  }

  const letterSequence = memoizedGetLetterSequence(board, path);
  let equation = "A";
  let currentLetter = letterSequence[0];

  for (let i = 1; i < letterSequence.length; i++) {
    const nextLetter = letterSequence[i];
    if (nextLetter === currentLetter) {
      equation += ` + ${nextLetter}`;
    } else {
      equation = `(${equation}) * ${nextLetter}`;
    }
    currentLetter = nextLetter;
  }

  pathValidityCache.set(pathKey, equation);
  return equation;
}

function findBestPathPair(board, size) {
  // Clear caches at the start of a new search
  equationEvalCache.clear();
  pathValidityCache.clear();
  letterSequenceCache.clear();

  let overallBestResult = {
    sum: Number.POSITIVE_INFINITY,
    path1: null,
    path2: null,
    equation1: null,
    equation2: null,
    values: null,
  };

  // Generate all possible paths for moves 4, 6, 8, and 10
  const pathsA1F6 = [4, 6, 8, 10].flatMap((moves) =>
    generateKnightPaths(0, 0, 5, 5, size, moves)
  );

  const pathsA6F1 = [4, 6, 8, 10].flatMap((moves) =>
    generateKnightPaths(0, 5, 5, 0, size, moves)
  );

  console.log("\nPaths analysis:");
  for (const moves of [4, 6, 8, 10]) {
    const countA1F6 = generateKnightPaths(0, 0, 5, 5, size, moves).length;
    const countA6F1 = generateKnightPaths(0, 5, 5, 0, size, moves).length;
    console.log(
      `${moves} moves - a1->f6: ${countA1F6}, a6->f1: ${countA6F1}, pairs: ${
        countA1F6 * countA6F1
      }`
    );
  }

  // Pre-calculate solutions with progress tracking
  const path1Solutions = new Map();
  let processedPaths = 0;
  const totalPaths = pathsA1F6.length;

  console.log("\nProcessing paths...");
  for (const path1 of pathsA1F6) {
    processedPaths++;
    if (processedPaths % 1000 === 0) {
      console.log(
        `Processed ${processedPaths}/${totalPaths} paths (${Math.round(
          (processedPaths / totalPaths) * 100
        )}%)`
      );
      console.log(
        `Cache sizes - Equations: ${equationEvalCache.size}, Paths: ${pathValidityCache.size}, Letters: ${letterSequenceCache.size}`
      );
    }

    const equation1 = generateEquation(board, path1);
    const solutions = findPossibleValuesOptimized(equation1);

    if (solutions.length > 0) {
      path1Solutions.set(path1.join(","), {
        equation: equation1,
        solutions: solutions,
      });
    }
  }

  console.log(`\nValid solutions found: ${path1Solutions.size}`);

  // Check path pairs with progress tracking
  let checkedPairs = 0;
  const totalPairs = path1Solutions.size * pathsA6F1.length;

  for (const path2 of pathsA6F1) {
    const equation2 = generateEquation(board, path2);

    for (const [path1Key, path1Data] of path1Solutions) {
      checkedPairs++;
      if (checkedPairs % 10000 === 0) {
        console.log(
          `Checked ${checkedPairs}/${totalPairs} pairs (${Math.round(
            (checkedPairs / totalPairs) * 100
          )}%)`
        );
      }

      let foundValidPair = false;
      for (const solution of path1Data.solutions) {
        const result = memoizedEvaluateEquation(
          equation2,
          solution.a,
          solution.b,
          solution.c
        );
        if (result === 2024) {
          foundValidPair = true;
          if (solution.sum < overallBestResult.sum) {
            overallBestResult = {
              sum: solution.sum,
              path1: path1Key.split(","),
              path2: path2,
              equation1: path1Data.equation,
              equation2: equation2,
              values: solution,
            };
            console.log(`\nNew best sum found: ${solution.sum}`);
          }
          break;
        }
      }
    }
  }

  // Log cache statistics
  console.log("\nFinal cache sizes:");
  console.log(`Equation evaluations: ${equationEvalCache.size}`);
  console.log(`Path validations: ${pathValidityCache.size}`);
  console.log(`Letter sequences: ${letterSequenceCache.size}`);

  return overallBestResult;
}

function findPossibleValuesOptimized(equation) {
  const solutions = [];

  // Start with smaller values since we're looking for minimum sum
  for (let a = 1; a <= 20; a++) {
    for (let b = 1; b <= 20; b++) {
      for (let c = 1; c <= 20; c++) {
        if (a + b + c <= 50) {
          const result = memoizedEvaluateEquation(equation, a, b, c);
          if (result === 2024) {
            solutions.push({ a, b, c, sum: a + b + c });
          }
        }
      }
    }
  }

  return solutions;
}

function findCommonValuesOptimized(solutions1, equation2) {
  let bestResult = null;
  let lowestSum = Number.POSITIVE_INFINITY;

  const eq2Func = new Function("A", "B", "C", `return ${equation2};`);

  for (const solution of solutions1) {
    try {
      if (2024 === eq2Func(solution.a, solution.b, solution.c)) {
        if (solution.sum < lowestSum) {
          lowestSum = solution.sum;
          bestResult = solution;
        }
      }
    } catch (e) {
      // Handle potential overflow errors
    }
  }

  return bestResult;
}

// Test with the provided 6x6 board
const board = [
  ["A", "B", "B", "C", "C", "C"],
  ["A", "B", "B", "C", "C", "C"],
  ["A", "A", "B", "B", "C", "C"],
  ["A", "A", "B", "B", "C", "C"],
  ["A", "A", "A", "B", "B", "C"],
  ["A", "A", "A", "B", "B", "C"],
];

console.log("Board configuration:");
for (const row of board) {
  console.log(row.join(" "));
}

const bestResult = findBestPathPair(board, 6);

console.log("\nBest solution found:");
console.log("\nPath a1->f6:", bestResult.path1.join(" -> "));
console.log("Equation 1:", bestResult.equation1);
console.log("\nPath a6->f1:", bestResult.path2.join(" -> "));
console.log("Equation 2:", bestResult.equation2);
console.log("\nValues:");
console.log(`A = ${bestResult.values.a}`);
console.log(`B = ${bestResult.values.b}`);
console.log(`C = ${bestResult.values.c}`);
console.log(`Total sum: ${bestResult.values.sum}`);
