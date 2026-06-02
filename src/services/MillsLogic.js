export const WHITE = 1, BLACK = 2;
export const OPP = { 1: 2, 2: 1 };

export const POINTS = [
  [50, 50], [300, 50], [550, 50],
  [150, 150], [300, 150], [450, 150],
  [250, 250], [300, 250], [350, 250],
  [50, 300], [150, 300], [250, 300],
  [350, 300], [450, 300], [550, 300],
  [250, 350], [300, 350], [350, 350],
  [150, 450], [300, 450], [450, 450],
  [50, 550], [300, 550], [550, 550],
];

export const ADJ = [
  [1, 9], [0, 2, 4], [1, 14],
  [4, 10], [1, 3, 5, 7], [4, 13],
  [7, 11], [4, 6, 8], [7, 12],
  [0, 10, 21], [3, 9, 11, 18], [6, 10, 15],
  [8, 13, 17], [5, 12, 14, 20], [2, 13, 23],
  [11, 16], [15, 17, 19], [12, 16],
  [10, 19], [16, 18, 20, 22], [13, 19],
  [9, 22], [19, 21, 23], [14, 22],
];

export const MILLS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11], [12, 13, 14], [15, 16, 17], [18, 19, 20], [21, 22, 23],
  [0, 9, 21], [3, 10, 18], [6, 11, 15], [1, 4, 7], [16, 19, 22], [8, 12, 17], [5, 13, 20], [2, 14, 23],
];

export const MILLS_BY_POINT = POINTS.map((_, i) => MILLS.filter(m => m.includes(i)));
export const JUNCTIONS = new Set([4, 10, 13, 19]);

export const newState = () => ({
  board: new Array(24).fill(0),
  turn: WHITE,
  placed: { 1: 0, 2: 0 },
  mustRemove: false,
  selected: null,
  winner: null,
  lastMoves: { 1: null, 2: null },
  lastRemovals: { 1: null, 2: null },
});

export const cloneGameState = (g) => ({
  board: g.board.slice(),
  turn: g.turn,
  placed: { 1: g.placed[1], 2: g.placed[2] },
  mustRemove: g.mustRemove,
  selected: g.selected,
  winner: g.winner,
  lastMoves: {
    1: g.lastMoves[1] ? { ...g.lastMoves[1] } : null,
    2: g.lastMoves[2] ? { ...g.lastMoves[2] } : null,
  },
  lastRemovals: {
    1: g.lastRemovals?.[1] ?? null,
    2: g.lastRemovals?.[2] ?? null,
  },
});

export const onBoard = (s, p) => {
  let n = 0;
  for (let i = 0; i < 24; i++) if (s.board[i] === p) n++;
  return n;
};

export const playerPhase = (s, p) => {
  if (s.placed[1] < 9 || s.placed[2] < 9) return "placing";
  if (onBoard(s, p) <= 3) return "flying";
  return "moving";
};

export const isInMill = (board, point, player) => {
  if (board[point] !== player) return false;
  return MILLS_BY_POINT[point].some(m => m.every(p => board[p] === player));
};

export const formsMill = (board, point, player) =>
  MILLS_BY_POINT[point].some(m => m.every(p => board[p] === player));

export const allInMills = (board, player) => {
  for (let i = 0; i < 24; i++) {
    if (board[i] === player && !isInMill(board, i, player)) return false;
  }
  return true;
};

export const canRemove = (board, point, opponent) => {
  if (board[point] !== opponent) return false;
  if (isInMill(board, point, opponent) && !allInMills(board, opponent)) return false;
  return true;
};

export const getMoveTargets = (s, from) => {
  const player = s.board[from];
  if (!player || player !== s.turn) return [];
  const phase = playerPhase(s, player);
  if (phase === "placing") return [];
  if (phase === "flying") {
    const t = [];
    for (let i = 0; i < 24; i++) if (s.board[i] === 0) t.push(i);
    return t;
  }
  return ADJ[from].filter(j => s.board[j] === 0);
};

export const getLegalMoves = (s, player) => {
  if (s.winner) return [];
  const phase = playerPhase(s, player);
  const opp = OPP[player];
  const moves = [];
  const add = (from, to) => {
    const tb = s.board.slice();
    if (from !== null) tb[from] = 0;
    tb[to] = player;
    if (formsMill(tb, to, player)) {
      const free = [], locked = [];
      for (let i = 0; i < 24; i++) {
        if (tb[i] === opp) {
          if (isInMill(tb, i, opp)) locked.push(i);
          else free.push(i);
        }
      }
      const removable = free.length ? free : locked;
      if (removable.length === 0) moves.push({ from, to, remove: null });
      else for (const r of removable) moves.push({ from, to, remove: r });
    } else moves.push({ from, to, remove: null });
  };
  if (phase === "placing") {
    for (let i = 0; i < 24; i++) if (s.board[i] === 0) add(null, i);
  } else if (phase === "flying") {
    for (let i = 0; i < 24; i++) {
      if (s.board[i] === player) {
        for (let j = 0; j < 24; j++) if (s.board[j] === 0) add(i, j);
      }
    }
  } else {
    for (let i = 0; i < 24; i++) {
      if (s.board[i] === player) {
        for (const j of ADJ[i]) if (s.board[j] === 0) add(i, j);
      }
    }
  }
  return moves;
};

const cloneForApply = (s) => ({
  board: s.board.slice(),
  turn: s.turn,
  placed: { 1: s.placed[1], 2: s.placed[2] },
  mustRemove: false,
  selected: null,
  winner: s.winner,
});

export const applyMove = (s, move, player) => {
  const ns = cloneForApply(s);
  if (move.from !== null) ns.board[move.from] = 0;
  else ns.placed[player]++;
  ns.board[move.to] = player;
  if (move.remove !== null) ns.board[move.remove] = 0;
  ns.turn = OPP[player];
  const placingDone = ns.placed[1] === 9 && ns.placed[2] === 9;
  if (placingDone && ns.winner === null) {
    if (onBoard(ns, WHITE) < 3) ns.winner = BLACK;
    else if (onBoard(ns, BLACK) < 3) ns.winner = WHITE;
    else if (getLegalMoves(ns, ns.turn).length === 0) ns.winner = player;
  }
  return ns;
};

export const detectWinnerAfter = (board, placed, turn, currentWinner, lastPlayer) => {
  if (currentWinner !== null) return currentWinner;
  const placingDone = placed[1] === 9 && placed[2] === 9;
  if (!placingDone) return null;
  const trial = { board, placed, turn, winner: null };
  if (onBoard(trial, WHITE) < 3) return BLACK;
  if (onBoard(trial, BLACK) < 3) return WHITE;
  if (getLegalMoves(trial, turn).length === 0) return lastPlayer;
  return null;
};
