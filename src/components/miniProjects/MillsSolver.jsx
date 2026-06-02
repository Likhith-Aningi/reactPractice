import { useEffect, useRef, useState } from "react";
import "./MillsSolver.css";
import {
  WHITE,
  BLACK,
  OPP,
  POINTS,
  MILLS,
  MILLS_BY_POINT,
  newState,
  cloneGameState,
  onBoard,
  playerPhase,
  formsMill,
  canRemove,
  getMoveTargets,
  detectWinnerAfter,
} from "../../services/MillsLogic.js";

const DIFFICULTY = {
  easy: { label: "Easy", score: 4, placeDepth: 2, moveDepth: 3, flyDepth: 2, randomTolerance: 8 },
  medium: { label: "Medium", score: 7, placeDepth: 3, moveDepth: 5, flyDepth: 3, randomTolerance: 3 },
  hard: { label: "Hard", score: 9, useEngine: true, maxDepth: 6, timeBudgetMs: 7000 },
  master: { label: "Master", score: 10, useEngine: true, maxDepth: 8, timeBudgetMs: 15000 },
  ruthless: { label: "Ruthless", score: 10, useEngine: true, maxDepth: 9, timeBudgetMs: 20000 },
};
const DIFFICULTY_ORDER = ["easy", "medium", "hard", "master", "ruthless"];

const TAUNTS = {
  hard: [
    "thinking… 🤔",
    "hmm 🤨",
    "plotting 😏",
    "deciding 🧠",
    "nice try 😂",
    "you trying? 💀",
    "mhm 😌",
    "let me see 👀",
    "cute move 😆",
    "that all you got? 🔥",
    "you're sweating already 😅",
    "too slow 🐢",
    "predictable 😈",
    "keep coping 🤡",
    "i'm just warming up 🔥",
    "you call that strategy? 💀",
    "bless your heart 🙏😂"
  ],
  master: [
    "plotting against you 😈",
    "can't beat me 💪",
    "noob 🤡",
    "amateur hour 😂",
    "embarrassing 💀",
    "step aside, mortal 👑",
    "this is too easy 😏",
    "you call this a game? 🔥",
    "child's play 👶",

    // Vulgar & Filthy ones:
    "i'm balls deep in your position 🍆💦",
    "your mills are getting fucked 🍆🔥",
    "i own your ass on the board 🍑💀",
    "stay mad, virgin 🤡",
    "get wrecked, bitch 🖕",
    "i'm raping your defense 😈",
    "you’re getting dominated like a slut 💦",
    "my pieces are deep in your territory 🍆",
    "cry harder, loser 😂💀",
    "i’m skullfucking your strategy 💀",
    "pathetic little shit 🤡",
    "your whole board is my bitch now 🐶",
    "keep trying, cumstain 💦",
    "i’ll make you quit like the pussy you are 🐱",
    "absolute fucking noob 🖕",
    "i’m wiping the floor with your weak ass 🧹",
    "you’re getting humiliated, boy 😭",
    "suck my dick while I take your mills 🍆",
    "this is a massacre, you fucking clown 🤡🔥",
    "get fucked and removed 💀",
    "కూకోని ఆకేసుకోవోయ్ 😂💀",
    "your moves are as weak as your pullout game 🍆😂"
  ],
  godmode: [
    "i’m violating your mills raw 🍆💦",
    "you’re getting cucked on the board 🐂",
    "i own every hole in your defense 😈",
    "beg for mercy, you worthless fuck 🙏💀",
    "your pieces are my cumrags 🧻",
    "i’m creampieing your entire strategy 💦",
    "die mad, skill issue 💀",
    "you play like you fuck — disappointing 🍆",
    "i’m the alpha, you’re the cumdump 🐺",
    "your ego just got gangbanged 👥💦",
    "కూకోని ఆకేసుకోవోయ్ 😂💀",
    "Baane aadav le subbarao inka saddey 😎💦"
  ]
};
const TAUNTS_QUIET = ["deliberating..", "Ok not bad", "good game", "baane aadutunnav subbaRao.."];
const tauntsFor = (key) => TAUNTS[key] || TAUNTS.master || TAUNTS_QUIET;

const GODMODE_DIFFICULTIES = new Set(["master", "ruthless"]);
const GODMODE_SCORE = 250;
const isGodmodeState = (difficulty, aiScore, aiPieces, huPieces, placingDone) => {
  if (!GODMODE_DIFFICULTIES.has(difficulty)) return false;
  if (!placingDone) return false;
  if (aiScore >= GODMODE_SCORE && aiPieces > huPieces) return true;
  if (huPieces <= 4 && huPieces < aiPieces) return true;
  return false;
};

const GRAIN = [
  { x: 84, y: 120, r: 1 }, { x: 160, y: 92, r: 0.8 }, { x: 230, y: 180, r: 0.6 },
  { x: 412, y: 98, r: 1 }, { x: 490, y: 170, r: 0.8 }, { x: 118, y: 430, r: 0.9 },
  { x: 540, y: 490, r: 1 }, { x: 490, y: 420, r: 0.7 }, { x: 380, y: 510, r: 0.9 },
  { x: 100, y: 280, r: 0.7 }, { x: 520, y: 270, r: 0.6 }, { x: 240, y: 540, r: 0.8 },
];

const createEngineWorker = () =>
  new Worker(new URL("../../services/MillsEngine.worker.js", import.meta.url), { type: "module" });

function MillsSolver() {
  const [phase, setPhase] = useState("picker");
  const [humanColor, setHumanColor] = useState(WHITE);
  const [difficulty, setDifficulty] = useState("medium");
  const [game, setGame] = useState(newState);
  const [aiThinking, setAiThinking] = useState(false);
  const [highlightMill, setHighlightMill] = useState([]);
  const [removingPoint, setRemovingPoint] = useState(null);
  const [showOver, setShowOver] = useState(false);
  const [history, setHistory] = useState([]);
  const [tauntIndex, setTauntIndex] = useState(0);
  const [aiAdvantage, setAiAdvantage] = useState(0);
  const cfg = DIFFICULTY[difficulty] || DIFFICULTY.medium;

  const huPieces = onBoard(game, humanColor);
  const aiPieces = onBoard(game, OPP[humanColor]);
  const placingDone = game.placed[1] === 9 && game.placed[2] === 9;
  const inGodmode = isGodmodeState(difficulty, aiAdvantage, aiPieces, huPieces, placingDone);
  const activeTaunts = inGodmode
    ? (TAUNTS.godmode || TAUNTS.master || TAUNTS_QUIET)
    : tauntsFor(difficulty);

  const stateRef = useRef(game);
  const renderedPositionsRef = useRef(new Set());
  const inputLockedRef = useRef(false);
  const aiPendingRef = useRef(false);
  const gameIdRef = useRef(0);
  const workerRef = useRef(null);
  const requestIdRef = useRef(0);

  const aiColor = OPP[humanColor];

  useEffect(() => { stateRef.current = game; }, [game]);

  useEffect(() => {
    workerRef.current = createEngineWorker();
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const cancelAndRecreateWorker = () => {
    workerRef.current?.terminate();
    workerRef.current = createEngineWorker();
  };

  useEffect(() => {
    if (!aiThinking) return;
    const list = activeTaunts;
    setTauntIndex(Math.floor(Math.random() * list.length));
    const id = setInterval(() => {
      setTauntIndex(i => {
        if (list.length <= 1) return 0;
        let next;
        do { next = Math.floor(Math.random() * list.length); } while (next === i);
        return next;
      });
    }, 5200);
    return () => clearInterval(id);
  }, [aiThinking, activeTaunts]);

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
    if (!workerRef.current) return;

    aiPendingRef.current = true;
    setAiThinking(true);
    const myGameId = gameIdRef.current;
    const worker = workerRef.current;
    const requestId = ++requestIdRef.current;

    const handler = (e) => {
      const data = e.data || {};
      if (data.requestId !== requestId) return;
      worker.removeEventListener("message", handler);
      if (gameIdRef.current !== myGameId || workerRef.current !== worker) {
        aiPendingRef.current = false;
        setAiThinking(false);
        return;
      }
      aiPendingRef.current = false;
      setAiThinking(false);
      if (typeof data.score === "number" && Number.isFinite(data.score)) {
        setAiAdvantage(data.score);
      }

      const s = stateRef.current;
      const move = data.move;
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
    };
    worker.addEventListener("message", handler);

    const t = setTimeout(() => {
      if (gameIdRef.current !== myGameId || workerRef.current !== worker) {
        worker.removeEventListener("message", handler);
        aiPendingRef.current = false;
        setAiThinking(false);
        return;
      }
      const snap = stateRef.current;
      worker.postMessage({
        type: "choose",
        requestId,
        state: snap,
        ai: aiColor,
        hu: humanColor,
        cfg: { ...cfg },
      });
    }, 280);

    return () => {
      clearTimeout(t);
      worker.removeEventListener("message", handler);
    };
  }, [phase, game.turn, game.winner, game.mustRemove, aiColor, humanColor, removingPoint, cfg]);

  const startGame = (color) => {
    gameIdRef.current++;
    aiPendingRef.current = false;
    inputLockedRef.current = false;
    renderedPositionsRef.current = new Set();
    cancelAndRecreateWorker();
    setHumanColor(color === "white" ? WHITE : BLACK);
    setGame(newState());
    setAiThinking(false);
    setHighlightMill([]);
    setRemovingPoint(null);
    setShowOver(false);
    setHistory([]);
    setAiAdvantage(0);
    setPhase("game");
  };

  const resetGame = () => {
    gameIdRef.current++;
    aiPendingRef.current = false;
    inputLockedRef.current = false;
    cancelAndRecreateWorker();
    setPhase("picker");
    setShowOver(false);
    setAiThinking(false);
    setAiAdvantage(0);
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

  const recentPositions = new Set();
  for (const player of [WHITE, BLACK]) {
    const m = game.lastMoves[player];
    if (m && m.to != null && game.board[m.to] === player) recentPositions.add(m.to);
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
    const isRecent = recentPositions.has(i);

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
        {isRecent && !inMill && !isRemoving && (
          <circle
            cx={0} cy={0} r={20.5}
            fill="none"
            strokeWidth={2}
            className="recent-halo"
          />
        )}
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

  const currentTaunt = activeTaunts[tauntIndex % activeTaunts.length];
  const aiTauntChip = (
    <span className={`ai-taunt ai-taunt--${inGodmode ? "godmode" : difficulty}`}>
      <span className="ai-taunt-dots"><i /><i /><i /></span>
      <span className="ai-taunt-text">{currentTaunt}</span>
    </span>
  );

  const turnSub = (() => {
    if (game.winner) return game.winner === game.turn ? "victor" : "defeated";
    if (aiThinking) return aiTauntChip;
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
    return { cls: "status-msg", content: aiTauntChip };
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

              <div className="difficulty-block">
                <div className="difficulty-prompt">— Skill of thy adversary —</div>
                <div className="difficulty-row">
                  {DIFFICULTY_ORDER.map(key => (
                    <button
                      key={key}
                      type="button"
                      data-difficulty={key}
                      className={`difficulty-pill ${difficulty === key ? "active" : ""}`}
                      onClick={() => setDifficulty(key)}
                      aria-pressed={difficulty === key}
                    >
                      <span className="d-label">{DIFFICULTY[key].label}</span>
                      <span className="d-score">{DIFFICULTY[key].score}/10</span>
                    </button>
                  ))}
                </div>
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
                  <div className="panel-label">Adversary</div>
                  <div className="adversary-info">
                    <span className="adversary-name">{cfg.label}</span>
                    <span className="adversary-strength">{cfg.score}/10</span>
                  </div>
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
