import { useEffect, useRef, useState } from "react";
import "./MillsSolver.css";

const WHITE = 1, BLACK = 2;
const OPP = { 1: 2, 2: 1 };

const POINTS = [
  [50, 50], [300, 50], [550, 50],
  [150, 150], [300, 150], [450, 150],
  [250, 250], [300, 250], [350, 250],
  [50, 300], [150, 300], [250, 300],
  [350, 300], [450, 300], [550, 300],
  [250, 350], [300, 350], [350, 350],
  [150, 450], [300, 450], [450, 450],
  [50, 550], [300, 550], [550, 550],
];

const ADJ = [
  [1, 9], [0, 2, 4], [1, 14],
  [4, 10], [1, 3, 5, 7], [4, 13],
  [7, 11], [4, 6, 8], [7, 12],
  [0, 10, 21], [3, 9, 11, 18], [6, 10, 15],
  [8, 13, 17], [5, 12, 14, 20], [2, 13, 23],
  [11, 16], [15, 17, 19], [12, 16],
  [10, 19], [16, 18, 20, 22], [13, 19],
  [9, 22], [19, 21, 23], [14, 22],
];

const MILLS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11], [12, 13, 14], [15, 16, 17], [18, 19, 20], [21, 22, 23],
  [0, 9, 21], [3, 10, 18], [6, 11, 15], [1, 4, 7], [16, 19, 22], [8, 12, 17], [5, 13, 20], [2, 14, 23],
];

const MILLS_BY_POINT = POINTS.map((_, i) => MILLS.filter(m => m.includes(i)));
const JUNCTIONS = new Set([4, 10, 13, 19]);

const GRAIN = [
  { x: 84, y: 120, r: 1 }, { x: 160, y: 92, r: 0.8 }, { x: 230, y: 180, r: 0.6 },
  { x: 412, y: 98, r: 1 }, { x: 490, y: 170, r: 0.8 }, { x: 118, y: 430, r: 0.9 },
  { x: 540, y: 490, r: 1 }, { x: 490, y: 420, r: 0.7 }, { x: 380, y: 510, r: 0.9 },
  { x: 100, y: 280, r: 0.7 }, { x: 520, y: 270, r: 0.6 }, { x: 240, y: 540, r: 0.8 },
];

const newState = () => ({
  board: new Array(24).fill(0),
  turn: WHITE,
  placed: { 1: 0, 2: 0 },
  mustRemove: false,
  selected: null,
  winner: null,
  lastMoves: { 1: null, 2: null },
  lastRemovals: { 1: null, 2: null },
});

const cloneGameState = (g) => ({
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

const onBoard = (s, p) => {
  let n = 0;
  for (let i = 0; i < 24; i++) if (s.board[i] === p) n++;
  return n;
};

const playerPhase = (s, p) => {
  if (s.placed[1] < 9 || s.placed[2] < 9) return "placing";
  if (onBoard(s, p) <= 3) return "flying";
  return "moving";
};

const isInMill = (board, point, player) => {
  if (board[point] !== player) return false;
  return MILLS_BY_POINT[point].some(m => m.every(p => board[p] === player));
};

const formsMill = (board, point, player) =>
  MILLS_BY_POINT[point].some(m => m.every(p => board[p] === player));

const allInMills = (board, player) => {
  for (let i = 0; i < 24; i++) {
    if (board[i] === player && !isInMill(board, i, player)) return false;
  }
  return true;
};

const canRemove = (board, point, opponent) => {
  if (board[point] !== opponent) return false;
  if (isInMill(board, point, opponent) && !allInMills(board, opponent)) return false;
  return true;
};

const getMoveTargets = (s, from) => {
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

const getLegalMoves = (s, player) => {
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

const applyMove = (s, move, player) => {
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

const evaluate = (s, ai, hu) => {
  if (s.winner === ai) return 100000;
  if (s.winner !== null && s.winner !== ai) return -100000;
  const aiN = onBoard(s, ai), huN = onBoard(s, hu);
  let score = (aiN - huN) * 100;
  let aiMills = 0, huMills = 0, aiPot = 0, huPot = 0;
  for (const m of MILLS) {
    let ac = 0, hc = 0;
    for (const p of m) {
      if (s.board[p] === ai) ac++;
      else if (s.board[p] === hu) hc++;
    }
    if (ac === 3) aiMills++;
    if (hc === 3) huMills++;
    if (ac === 2 && hc === 0) aiPot++;
    if (hc === 2 && ac === 0) huPot++;
  }
  score += (aiMills - huMills) * 60;
  score += (aiPot - huPot) * 16;
  if (s.placed[1] === 9 && s.placed[2] === 9) {
    let am = 0, hm = 0;
    if (aiN === 3) am = 30;
    else for (let i = 0; i < 24; i++) {
      if (s.board[i] === ai) am += ADJ[i].filter(j => s.board[j] === 0).length;
    }
    if (huN === 3) hm = 30;
    else for (let i = 0; i < 24; i++) {
      if (s.board[i] === hu) hm += ADJ[i].filter(j => s.board[j] === 0).length;
    }
    score += (Math.min(am, 30) - Math.min(hm, 30)) * 5;
    if (am === 0 && s.turn === ai) score -= 50000;
    if (hm === 0 && s.turn === hu) score += 50000;
  }
  for (const j of JUNCTIONS) {
    if (s.board[j] === ai) score += 8;
    else if (s.board[j] === hu) score -= 8;
  }
  return score;
};

const orderMoves = (moves) => {
  moves.sort((a, b) => {
    const am = a.remove !== null ? 1 : 0;
    const bm = b.remove !== null ? 1 : 0;
    if (am !== bm) return bm - am;
    const aj = JUNCTIONS.has(a.to) ? 1 : 0;
    const bj = JUNCTIONS.has(b.to) ? 1 : 0;
    return bj - aj;
  });
  return moves;
};

const minimax = (s, depth, alpha, beta, player, ai, hu) => {
  if (depth === 0 || s.winner !== null) return evaluate(s, ai, hu);
  const moves = orderMoves(getLegalMoves(s, player));
  if (moves.length === 0) return player === ai ? -100000 : 100000;
  if (player === ai) {
    let best = -Infinity;
    for (const m of moves) {
      const sc = minimax(applyMove(s, m, player), depth - 1, alpha, beta, OPP[player], ai, hu);
      if (sc > best) best = sc;
      if (best > alpha) alpha = best;
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const m of moves) {
      const sc = minimax(applyMove(s, m, player), depth - 1, alpha, beta, OPP[player], ai, hu);
      if (sc < best) best = sc;
      if (best < beta) beta = best;
      if (beta <= alpha) break;
    }
    return best;
  }
};

const pickDepth = (s, ai) => {
  const phase = playerPhase(s, ai);
  if (phase === "placing") {
    const placed = s.placed[1] + s.placed[2];
    if (placed < 4) return 3;
    if (placed < 14) return 3;
    return 4;
  }
  if (phase === "flying") return 3;
  return 4;
};

const chooseAIMove = (state, ai, hu) => {
  const moves = orderMoves(getLegalMoves(state, ai));
  if (!moves.length) return null;
  const depth = pickDepth(state, ai);
  const opp = OPP[ai];
  let bestScore = -Infinity;
  const scored = [];
  for (const m of moves) {
    const ns = applyMove(state, m, ai);
    const sc = minimax(ns, depth - 1, -Infinity, Infinity, opp, ai, hu);
    scored.push({ m, sc });
    if (sc > bestScore) bestScore = sc;
  }
  const tol = bestScore > 9000 ? 0 : 4;
  const top = scored.filter(x => x.sc >= bestScore - tol);
  return top[Math.floor(Math.random() * top.length)].m;
};

const detectWinnerAfter = (board, placed, turn, currentWinner, lastPlayer) => {
  if (currentWinner !== null) return currentWinner;
  const placingDone = placed[1] === 9 && placed[2] === 9;
  if (!placingDone) return null;
  const trial = { board, placed, turn, winner: null };
  if (onBoard(trial, WHITE) < 3) return BLACK;
  if (onBoard(trial, BLACK) < 3) return WHITE;
  if (getLegalMoves(trial, turn).length === 0) return lastPlayer;
  return null;
};

function MillsSolver() {
  const [phase, setPhase] = useState("picker");
  const [humanColor, setHumanColor] = useState(WHITE);
  const [game, setGame] = useState(newState);
  const [aiThinking, setAiThinking] = useState(false);
  const [highlightMill, setHighlightMill] = useState([]);
  const [removingPoint, setRemovingPoint] = useState(null);
  const [showOver, setShowOver] = useState(false);
  const [history, setHistory] = useState([]);

  const stateRef = useRef(game);
  const renderedPositionsRef = useRef(new Set());
  const inputLockedRef = useRef(false);
  const aiPendingRef = useRef(false);
  const gameIdRef = useRef(0);

  const aiColor = OPP[humanColor];

  useEffect(() => { stateRef.current = game; }, [game]);

  useEffect(() => {
    const occ = new Set();
    for (let i = 0; i < 24; i++) if (game.board[i] !== 0) occ.add(i);
    renderedPositionsRef.current = occ;
  });

  useEffect(() => {
    if (game.winner !== null) {
      const t = setTimeout(() => setShowOver(true), 700);
      return () => clearTimeout(t);
    }
  }, [game.winner]);

  useEffect(() => {
    if (removingPoint === null) return;
    inputLockedRef.current = true;
    const myGameId = gameIdRef.current;
    const t = setTimeout(() => {
      if (gameIdRef.current !== myGameId) return;
      inputLockedRef.current = false;
      setHighlightMill([]);
      setGame(s => {
        const newBoard = s.board.slice();
        newBoard[removingPoint] = 0;
        const newTurn = OPP[s.turn];
        const newLastRemovals = { ...s.lastRemovals, [s.turn]: removingPoint };
        const winner = detectWinnerAfter(newBoard, s.placed, newTurn, s.winner, OPP[newTurn]);
        return { ...s, board: newBoard, lastRemovals: newLastRemovals, mustRemove: false, turn: newTurn, selected: null, winner };
      });
      setRemovingPoint(null);
    }, 520);
    return () => clearTimeout(t);
  }, [removingPoint]);

  useEffect(() => {
    if (phase !== "game") return;
    if (game.winner !== null) return;
    if (game.turn !== aiColor) return;
    if (game.mustRemove) return;
    if (removingPoint !== null) return;
    if (aiPendingRef.current) return;

    aiPendingRef.current = true;
    setAiThinking(true);
    const myGameId = gameIdRef.current;

    setTimeout(() => {
      if (gameIdRef.current !== myGameId) {
        aiPendingRef.current = false;
        return;
      }
      aiPendingRef.current = false;
      const s = stateRef.current;
      const move = chooseAIMove(s, aiColor, humanColor);
      setAiThinking(false);

      if (!move) {
        setGame({ ...s, winner: humanColor });
        return;
      }

      const newBoard = s.board.slice();
      if (move.from !== null) newBoard[move.from] = 0;
      newBoard[move.to] = aiColor;
      const newPlaced = { ...s.placed };
      if (move.from === null) newPlaced[aiColor]++;
      const newLastMoves = { ...s.lastMoves, [aiColor]: { from: move.from, to: move.to } };

      if (move.remove !== null) {
        const mill = MILLS_BY_POINT[move.to].find(m => m.every(p => newBoard[p] === aiColor));
        setHighlightMill(mill ? mill.slice() : []);
        setGame({
          ...s,
          board: newBoard,
          placed: newPlaced,
          lastMoves: newLastMoves,
          mustRemove: true,
        });
        setTimeout(() => {
          if (gameIdRef.current !== myGameId) return;
          setRemovingPoint(move.remove);
        }, 700);
      } else {
        const newTurn = OPP[aiColor];
        const winner = detectWinnerAfter(newBoard, newPlaced, newTurn, s.winner, aiColor);
        setGame({
          ...s,
          board: newBoard,
          placed: newPlaced,
          lastMoves: newLastMoves,
          lastRemovals: { ...s.lastRemovals, [aiColor]: null },
          turn: newTurn,
          selected: null,
          mustRemove: false,
          winner,
        });
      }
    }, 320);
  }, [phase, game.turn, game.winner, game.mustRemove, aiColor, humanColor, removingPoint]);

  const startGame = (color) => {
    gameIdRef.current++;
    aiPendingRef.current = false;
    inputLockedRef.current = false;
    renderedPositionsRef.current = new Set();
    setHumanColor(color === "white" ? WHITE : BLACK);
    setGame(newState());
    setAiThinking(false);
    setHighlightMill([]);
    setRemovingPoint(null);
    setShowOver(false);
    setHistory([]);
    setPhase("game");
  };

  const resetGame = () => {
    gameIdRef.current++;
    aiPendingRef.current = false;
    inputLockedRef.current = false;
    setPhase("picker");
    setShowOver(false);
    setAiThinking(false);
    setHighlightMill([]);
    setRemovingPoint(null);
    setHistory([]);
  };

  const canUndo =
    history.length > 0
    && !aiThinking
    && removingPoint === null
    && game.turn === humanColor
    && !game.winner;

  const undo = () => {
    if (!canUndo) return;
    gameIdRef.current++;
    aiPendingRef.current = false;
    inputLockedRef.current = false;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setGame(prev);
    setHighlightMill([]);
    setRemovingPoint(null);
    setShowOver(false);
  };

  const pointHint = (i) => {
    if (inputLockedRef.current || game.winner || game.turn !== humanColor || aiThinking) return null;
    if (removingPoint !== null) return null;
    if (game.mustRemove) return canRemove(game.board, i, OPP[game.turn]) ? "remove" : null;
    const ph = playerPhase(game, game.turn);
    if (ph === "placing") return game.board[i] === 0 ? "place" : null;
    if (game.selected === null) {
      if (game.board[i] === game.turn && getMoveTargets(game, i).length > 0) return "selectable";
      return null;
    }
    if (game.selected === i) return "selected";
    if (game.board[i] === game.turn) {
      return getMoveTargets(game, i).length > 0 ? "selectable" : null;
    }
    if (game.board[i] === 0) {
      return getMoveTargets(game, game.selected).includes(i) ? "destination" : null;
    }
    return null;
  };

  const humanClick = (point) => {
    if (inputLockedRef.current || game.winner || game.turn !== humanColor || aiThinking) return;
    if (removingPoint !== null) return;

    if (game.mustRemove) {
      const opp = OPP[game.turn];
      if (!canRemove(game.board, point, opp)) return;
      setRemovingPoint(point);
      return;
    }

    const ph = playerPhase(game, game.turn);

    if (ph === "placing") {
      if (game.board[point] !== 0) return;
      setHistory(h => [...h, cloneGameState(game)]);
      const newBoard = game.board.slice();
      newBoard[point] = game.turn;
      const newPlaced = { ...game.placed, [game.turn]: game.placed[game.turn] + 1 };
      const newLastMoves = { ...game.lastMoves, [game.turn]: { from: null, to: point } };
      if (formsMill(newBoard, point, game.turn)) {
        const mill = MILLS_BY_POINT[point].find(m => m.every(p => newBoard[p] === game.turn));
        setHighlightMill(mill ? mill.slice() : []);
        setGame({ ...game, board: newBoard, placed: newPlaced, lastMoves: newLastMoves, mustRemove: true });
      } else {
        const newTurn = OPP[game.turn];
        setGame({
          ...game,
          board: newBoard,
          placed: newPlaced,
          lastMoves: newLastMoves,
          lastRemovals: { ...game.lastRemovals, [game.turn]: null },
          turn: newTurn,
          selected: null,
        });
      }
      return;
    }

    if (game.selected === null) {
      if (game.board[point] === game.turn && getMoveTargets(game, point).length > 0) {
        setGame({ ...game, selected: point });
      }
      return;
    }
    if (game.selected === point) {
      setGame({ ...game, selected: null });
      return;
    }
    if (game.board[point] === game.turn) {
      if (getMoveTargets(game, point).length > 0) {
        setGame({ ...game, selected: point });
      }
      return;
    }
    if (game.board[point] !== 0) return;
    const targets = getMoveTargets(game, game.selected);
    if (!targets.includes(point)) return;

    const from = game.selected;
    setHistory(h => [...h, { ...cloneGameState(game), selected: null }]);
    const newBoard = game.board.slice();
    newBoard[from] = 0;
    newBoard[point] = game.turn;
    const newLastMoves = { ...game.lastMoves, [game.turn]: { from, to: point } };

    if (formsMill(newBoard, point, game.turn)) {
      const mill = MILLS_BY_POINT[point].find(m => m.every(p => newBoard[p] === game.turn));
      setHighlightMill(mill ? mill.slice() : []);
      setGame({ ...game, board: newBoard, lastMoves: newLastMoves, selected: null, mustRemove: true });
    } else {
      const newTurn = OPP[game.turn];
      const winner = detectWinnerAfter(newBoard, game.placed, newTurn, game.winner, game.turn);
      setGame({
        ...game,
        board: newBoard,
        lastMoves: newLastMoves,
        lastRemovals: { ...game.lastRemovals, [game.turn]: null },
        turn: newTurn,
        selected: null,
        winner,
      });
    }
  };

  const millLines = MILLS.map((m, idx) => {
    const a = game.board[m[0]], b = game.board[m[1]], c = game.board[m[2]];
    if (a === 0 || a !== b || b !== c) return null;
    const [x1, y1] = POINTS[m[0]];
    const [x2, y2] = POINTS[m[2]];
    return (
      <line
        key={`mill-${idx}`}
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="#c9a961" strokeWidth={4} opacity={0.45} strokeLinecap="round"
        className="mill-line"
      />
    );
  });

  const trailEls = [];
  for (const player of [WHITE, BLACK]) {
    const m = game.lastMoves[player];
    if (!m || m.from === null) continue;
    const [x1, y1] = POINTS[m.from];
    const [x2, y2] = POINTS[m.to];
    const stroke = player === WHITE ? "#f7eddb" : "#f7fff8";
    trailEls.push(
      <g key={`trail-${player}`}>
        <line
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={stroke} strokeWidth={1.8} strokeDasharray="4 5"
          strokeLinecap="round" opacity={0.9} className="trail-line"
        />
        <circle cx={x1} cy={y1} r={3.5} fill={stroke} opacity={0.77} className="trail-origin" />
      </g>
    );
  }

  const removalXs = [];
  for (const player of [WHITE, BLACK]) {
    const r = game.lastRemovals?.[player];
    if (r === null || r === undefined) continue;
    if (game.board[r] !== 0) continue;
    const [x, y] = POINTS[r];
    removalXs.push(
      <g key={`rx-${player}`} className="removal-x" pointerEvents="none">
        <line x1={x - 11} y1={y - 11} x2={x + 11} y2={y + 11}
          stroke="#c25844" strokeWidth={3} strokeLinecap="round" opacity={0.92} />
        <line x1={x - 11} y1={y + 11} x2={x + 11} y2={y - 11}
          stroke="#c25844" strokeWidth={3} strokeLinecap="round" opacity={0.92} />
      </g>
    );
  }

  const isHumanTurnActive =
    game.turn === humanColor && !aiThinking && !game.winner && removingPoint === null;

  const pointEls = [];
  for (let i = 0; i < 24; i++) {
    const [x, y] = POINTS[i];
    const occupied = game.board[i] !== 0;
    const hint = pointHint(i);
    if (!occupied) {
      pointEls.push(<circle key={`dot-${i}`} cx={x} cy={y} r={6} fill="#3a2e20" opacity={0.7} />);
    }
    if (hint === "place") {
      pointEls.push(
        <circle key={`hp-${i}`} cx={x} cy={y} r={16} fill="none" stroke="#c9a961"
          strokeWidth={1.2} strokeDasharray="3 4" opacity={0.55} pointerEvents="none" />
      );
    }
    if (hint === "destination") {
      pointEls.push(
        <circle key={`hdf-${i}`} cx={x} cy={y} r={19} fill="#c9a961" opacity={0.18} pointerEvents="none" />,
        <circle key={`hds-${i}`} cx={x} cy={y} r={19} fill="none" stroke="#e6c576"
          strokeWidth={1.5} opacity={0.85} pointerEvents="none" className="dest-ring" />
      );
    }
    pointEls.push(
      <circle
        key={`ct-${i}`}
        cx={x} cy={y} r={24} fill="transparent"
        style={{ cursor: isHumanTurnActive && hint ? "pointer" : "default" }}
        onClick={() => humanClick(i)}
      />
    );
  }

  const pieceEls = [];
  for (let i = 0; i < 24; i++) {
    const p = game.board[i];
    if (!p) continue;
    const [x, y] = POINTS[i];
    const isNew = !renderedPositionsRef.current.has(i);
    const hint = pointHint(i);
    const inMill = highlightMill.includes(i);
    const isRemoving = removingPoint === i;

    let cls = "svg-piece";
    if (isNew) cls += " new";
    if (isRemoving) cls += " removing";
    if (hint === "selectable" || hint === "selected" || hint === "remove") cls += " clickable";

    pieceEls.push(
      <g
        key={`piece-${i}`}
        transform={`translate(${x}, ${y})`}
        className={cls}
        style={{ cursor: hint ? "pointer" : "default" }}
        onClick={() => humanClick(i)}
      >
        <ellipse cx={1} cy={20} rx={17} ry={4} fill="rgba(0,0,0,0.45)" className="piece-anim" />
        <g className={`piece-anim${inMill ? " mill-glow" : ""}`}>
          <circle
            cx={0} cy={0} r={19}
            fill={p === WHITE ? "url(#whitePiece)" : "url(#blackPiece)"}
            stroke={p === WHITE ? "#7c6748" : "#020202"}
            strokeWidth={0.5}
            className="piece-body"
          />
          <circle
            cx={0} cy={0} r={14} fill="none"
            stroke={p === WHITE ? "rgba(110, 90, 60, 0.4)" : "rgba(80, 70, 60, 0.5)"}
            strokeWidth={0.5}
          />
          <ellipse
            cx={-6} cy={-7} rx={6} ry={3.5}
            fill={p === WHITE ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.13)"}
            transform="rotate(-30 -6 -7)"
          />
        </g>
        {game.selected === i && (
          <circle cx={0} cy={0} r={23} fill="none" stroke="#e6c576" strokeWidth={2}
            opacity={0.95} className="selected-ring" />
        )}
        {game.mustRemove && p === OPP[game.turn] && !game.winner && canRemove(game.board, i, p) && (
          <circle cx={0} cy={0} r={23} fill="none" stroke="#c25844" strokeWidth={1.6}
            strokeDasharray="4 3" opacity={0.95} className="warn-ring" />
        )}
      </g>
    );
  }

  const phaseLabel = (() => {
    if (game.winner) return "Concluded";
    const ph = playerPhase(game, game.turn);
    return ph.charAt(0).toUpperCase() + ph.slice(1);
  })();

  const turnSub = (() => {
    if (game.winner) return game.winner === game.turn ? "victor" : "defeated";
    if (aiThinking) return <span className="thinking-indicator">deliberating</span>;
    if (game.turn === humanColor) return "your turn";
    return "adversary";
  })();

  const status = (() => {
    if (game.winner) {
      return {
        cls: "status-msg win",
        content: game.winner === humanColor ? "You have prevailed." : "The machine has bested you.",
      };
    }
    if (game.mustRemove) {
      return {
        cls: "status-msg warn",
        content: game.turn === humanColor
          ? <>A <em>mill</em> is yours. Take an opposing stone.</>
          : <>A <em>mill</em> falls to the adversary…</>,
      };
    }
    if (game.turn === humanColor) {
      const ph = playerPhase(game, game.turn);
      if (ph === "placing") return { cls: "status-msg", content: "Place a stone on any open intersection." };
      if (ph === "flying")
        return { cls: "status-msg", content: <>You may <em>fly</em> — select a stone, then any open point.</> };
      return { cls: "status-msg", content: "Select a stone, then slide to an adjacent point." };
    }
    return { cls: "status-msg", content: <span className="thinking-indicator">opponent deliberates</span> };
  })();

  const overTitle = game.winner === humanColor
    ? "Victory"
    : game.winner !== null
      ? "Defeat"
      : "Stalemate";
  const overCls = game.winner === humanColor
    ? "victory"
    : game.winner !== null
      ? "defeat"
      : "draw";
  const overVerdict = game.winner === humanColor
    ? "The stones have fallen in your favour."
    : game.winner !== null
      ? "The machine reads the board with cold precision."
      : "A stillness settles over the board.";

  return (
    <div className="mills-solver">
      <div className="ms-app">
        <header className="brand">
          <div className="eyebrow">— Anno · A Game of Antiquity —</div>
          <h1 className="title">Nine Men&apos;s <em>Morris</em></h1>
          <div className="subtitle">Carved on temple roofs, three thousand winters past.</div>
          <div className="divider-ornament"><span>◇</span></div>
        </header>

        <main>
          {phase === "picker" && (
            <section className="color-picker">
              <div className="picker-prompt">
                <div className="lead">Choose your stones, traveller.</div>
                <div className="note">— Ivory always opens the match —</div>
              </div>
              <div className="stone-row">
                <button className="stone-choice" onClick={() => startGame("white")} aria-label="Play as Ivory">
                  <div className="stone-preview white"></div>
                  <div><div className="stone-label">Ivory</div></div>
                  <div className="stone-tagline">You open</div>
                </button>
                <button className="stone-choice" onClick={() => startGame("black")} aria-label="Play as Obsidian">
                  <div className="stone-preview black"></div>
                  <div><div className="stone-label">Obsidian</div></div>
                  <div className="stone-tagline">Adversary opens</div>
                </button>
              </div>
              <div className="rules-hint">
                Place nine stones; then slide them along the lines.
                Form a line of three to claim a <b>mill</b> and take an opponent&apos;s stone.
                Reduce them to two — or trap them — to win.
              </div>
            </section>
          )}

          {phase === "game" && (
            <section className="game">
              <div className="board-wrap">
                <div className="board-frame"></div>
                <svg className="board" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="boardFace" cx="50%" cy="36%" r="82%">
                      <stop offset="0%" stopColor="#e6d6ad" />
                      <stop offset="55%" stopColor="#d1bd8d" />
                      <stop offset="100%" stopColor="#9c8862" />
                    </radialGradient>
                    <radialGradient id="whitePiece" cx="35%" cy="28%" r="78%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="20%" stopColor="#f9efd9" />
                      <stop offset="58%" stopColor="#e0d2b0" />
                      <stop offset="100%" stopColor="#8a7656" />
                    </radialGradient>
                    <radialGradient id="blackPiece" cx="35%" cy="28%" r="78%">
                      <stop offset="0%" stopColor="#6b6058" />
                      <stop offset="18%" stopColor="#2a2520" />
                      <stop offset="60%" stopColor="#14110e" />
                      <stop offset="100%" stopColor="#000000" />
                    </radialGradient>
                  </defs>
                  <rect x="0" y="0" width="600" height="600" fill="url(#boardFace)" />
                  <g opacity="0.07" fill="#1c1510">
                    {GRAIN.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} />)}
                  </g>
                  <rect x="14" y="14" width="572" height="572" fill="none"
                    stroke="#8a7142" strokeOpacity="0.28" strokeWidth="0.7" />
                  <rect x="22" y="22" width="556" height="556" fill="none"
                    stroke="#3a2e20" strokeOpacity="0.45" strokeWidth="0.5" />
                  <rect x="50" y="50" width="500" height="500" fill="none"
                    stroke="#3a2e20" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="150" y="150" width="300" height="300" fill="none"
                    stroke="#3a2e20" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="250" y="250" width="100" height="100" fill="none"
                    stroke="#3a2e20" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1={300} y1={50} x2={300} y2={250} stroke="#3a2e20" strokeWidth={2.5} strokeLinecap="round" />
                  <line x1={300} y1={350} x2={300} y2={550} stroke="#3a2e20" strokeWidth={2.5} strokeLinecap="round" />
                  <line x1={50} y1={300} x2={250} y2={300} stroke="#3a2e20" strokeWidth={2.5} strokeLinecap="round" />
                  <line x1={350} y1={300} x2={550} y2={300} stroke="#3a2e20" strokeWidth={2.5} strokeLinecap="round" />
                  <g>{millLines}</g>
                  <g>{pointEls}</g>
                  <g>{trailEls}</g>
                  <g>{removalXs}</g>
                  <g>{pieceEls}</g>
                </svg>
              </div>

              <aside className="panel">
                <div className="panel-section">
                  <div className="panel-label">On the move</div>
                  <div className="turn-indicator">
                    <div className={`turn-dot ${game.turn === WHITE ? "white" : "black"}`}></div>
                    <div className="turn-text">
                      {game.turn === WHITE ? "Ivory" : "Obsidian"} <small>{turnSub}</small>
                    </div>
                  </div>
                </div>
                <div className="panel-section">
                  <div className="panel-label">Phase</div>
                  <div className="phase-name">{phaseLabel}</div>
                </div>
                <div className="panel-section">
                  <div className="panel-label">Stones</div>
                  <div className="counters">
                    <div className="counter-row">
                      <div className="counter-dot white"></div>
                      <div className="lbl">Ivory</div>
                      <div className="num">
                        <span>{onBoard(game, WHITE)}</span>
                        <small>on board · <span>{9 - game.placed[WHITE]}</span> to set</small>
                      </div>
                    </div>
                    <div className="counter-row">
                      <div className="counter-dot black"></div>
                      <div className="lbl">Obsidian</div>
                      <div className="num">
                        <span>{onBoard(game, BLACK)}</span>
                        <small>on board · <span>{9 - game.placed[BLACK]}</span> to set</small>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="panel-section">
                  <div className="panel-label">Reading</div>
                  <div className={status.cls}>{status.content}</div>
                </div>
                <div className="panel-section actions">
                  <button
                    className="btn btn-secondary"
                    onClick={undo}
                    disabled={!canUndo}
                  >— Undo Move —</button>
                  <button className="btn" onClick={resetGame}>— Resign · New Match —</button>
                </div>
              </aside>
            </section>
          )}
        </main>

        <footer className="foot">— A Solitary Match with the Machine —</footer>
      </div>

      <div className={`game-over${showOver ? " active" : ""}`}>
        <div className="modal">
          <div className="eyebrow">— The Match Concludes —</div>
          <h2 className={overCls}>{overTitle}</h2>
          <div className="verdict">{overVerdict}</div>
          <button className="btn" onClick={resetGame}>— Begin Anew —</button>
        </div>
      </div>
    </div>
  );
}

export default MillsSolver;
