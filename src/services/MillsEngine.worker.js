import {
  OPP,
  ADJ,
  MILLS,
  MILLS_BY_POINT,
  JUNCTIONS,
  onBoard,
  playerPhase,
  isInMill,
  formsMill,
  getLegalMoves,
  applyMove,
} from "./MillsLogic.js";

const TT_LIMIT = 200000;
const TT_EXACT = 0, TT_LOWER = 1, TT_UPPER = 2;
const MATE = 100000;
const MAX_PLY = 64;
const QSEARCH_MAX_DEPTH = 4;
const TIME_CHECK_INTERVAL = 2048;

const stateKey = (s) =>
  `${s.board.join("")}|${s.turn}|${s.placed[1]}|${s.placed[2]}`;

const moveEq = (a, b) =>
  a && b && a.from === b.from && a.to === b.to && a.remove === b.remove;

const countSwingingMills = (board, player) => {
  let count = 0;
  for (let a = 0; a < 24; a++) {
    if (board[a] !== player) continue;
    if (!isInMill(board, a, player)) continue;
    for (const b of ADJ[a]) {
      if (board[b] !== 0) continue;
      const tb = board.slice();
      tb[a] = 0;
      tb[b] = player;
      if (formsMill(tb, b, player)) { count++; break; }
    }
  }
  return count;
};

const countMillThreats = (s, player) => {
  const phase = playerPhase(s, player);
  let count = 0;
  if (phase === "placing" || phase === "flying") {
    for (let i = 0; i < 24; i++) {
      if (s.board[i] !== 0) continue;
      for (const m of MILLS_BY_POINT[i]) {
        let own = 0, opp = 0;
        for (const p of m) {
          if (p === i) continue;
          if (s.board[p] === player) own++;
          else if (s.board[p] !== 0) opp++;
        }
        if (own === 2 && opp === 0) { count++; break; }
      }
    }
  } else {
    for (let i = 0; i < 24; i++) {
      if (s.board[i] !== player) continue;
      for (const j of ADJ[i]) {
        if (s.board[j] !== 0) continue;
        for (const m of MILLS_BY_POINT[j]) {
          if (m.includes(i)) continue;
          let own = 0, opp = 0;
          for (const p of m) {
            if (p === j) continue;
            if (s.board[p] === player) own++;
            else if (s.board[p] !== 0) opp++;
          }
          if (own === 2 && opp === 0) { count++; break; }
        }
      }
    }
  }
  return count;
};

const countForks = (s, player) => {
  const phase = playerPhase(s, player);
  let forks = 0;
  const checkPlacement = (from, to) => {
    let threats = 0;
    for (const m of MILLS_BY_POINT[to]) {
      let own = 0, empty = 0, blocked = false;
      for (const p of m) {
        if (p === to) continue;
        if (s.board[p] === player) own++;
        else if (s.board[p] === 0 || p === from) empty++;
        else { blocked = true; break; }
      }
      if (!blocked && own === 1 && empty === 1) threats++;
      if (threats >= 2) break;
    }
    if (threats >= 2) forks++;
  };
  if (phase === "placing") {
    for (let i = 0; i < 24; i++) if (s.board[i] === 0) checkPlacement(null, i);
  } else if (phase === "flying") {
    for (let i = 0; i < 24; i++) if (s.board[i] === 0) checkPlacement(null, i);
  } else {
    for (let i = 0; i < 24; i++) {
      if (s.board[i] !== player) continue;
      for (const j of ADJ[i]) if (s.board[j] === 0) checkPlacement(i, j);
    }
  }
  return forks;
};

const countBlocks = (board, player, opp) => {
  let count = 0;
  for (const m of MILLS) {
    let pc = 0, oc = 0, ec = 0;
    for (const p of m) {
      if (board[p] === player) pc++;
      else if (board[p] === opp) oc++;
      else ec++;
    }
    if (oc === 2 && pc === 1 && ec === 0) count++;
  }
  return count;
};

const evaluate = (s, ai, hu) => {
  if (s.winner === ai) return MATE;
  if (s.winner !== null && s.winner !== ai) return -MATE;
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
  const placingDone = s.placed[1] === 9 && s.placed[2] === 9;
  if (placingDone) {
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
    score += (countSwingingMills(s.board, ai) - countSwingingMills(s.board, hu)) * 90;
  }
  for (const j of JUNCTIONS) {
    if (s.board[j] === ai) score += 8;
    else if (s.board[j] === hu) score -= 8;
  }
  score += (countMillThreats(s, ai) - countMillThreats(s, hu)) * 28;
  score += (countForks(s, ai) - countForks(s, hu)) * 45;
  score += (countBlocks(s.board, ai, hu) - countBlocks(s.board, hu, ai)) * 12;
  if (placingDone) {
    if (huN === 3 && aiMills > 0) score += 200;
    if (aiN === 3 && huMills > 0) score -= 200;
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
  if (moves.length === 0) return player === ai ? -MATE : MATE;
  if (player === ai) {
    let best = -Infinity;
    for (const m of moves) {
      const sc = minimax(applyMove(s, m, player), depth - 1, alpha, beta, OPP[player], ai, hu);
      if (sc > best) best = sc;
      if (best > alpha) alpha = best;
      if (beta <= alpha) break;
    }
    return best;
  }
  let best = Infinity;
  for (const m of moves) {
    const sc = minimax(applyMove(s, m, player), depth - 1, alpha, beta, OPP[player], ai, hu);
    if (sc < best) best = sc;
    if (best < beta) beta = best;
    if (beta <= alpha) break;
  }
  return best;
};

const pickDepth = (s, ai, cfg) => {
  const phase = playerPhase(s, ai);
  if (phase === "placing") {
    const placed = s.placed[1] + s.placed[2];
    return placed >= 14 ? cfg.placeDepth + 1 : cfg.placeDepth;
  }
  if (phase === "flying") return cfg.flyDepth;
  return cfg.moveDepth;
};

const orderMovesEngine = (moves, ttMove, killers, history, player) => {
  for (const m of moves) {
    let score = 0;
    if (ttMove && moveEq(m, ttMove)) score = 1e9;
    else if (m.remove !== null) score = 1e6 + (JUNCTIONS.has(m.to) ? 100 : 0);
    else if (killers && (moveEq(m, killers[0]) || moveEq(m, killers[1]))) score = 5e5;
    else {
      score = history[player][m.to] || 0;
      if (JUNCTIONS.has(m.to)) score += 50;
    }
    m._ord = score;
  }
  moves.sort((a, b) => b._ord - a._ord);
  return moves;
};

const recordKiller = (ctx, ply, m) => {
  const ks = ctx.killers[ply];
  if (!ks) return;
  if (moveEq(ks[0], m)) return;
  ks[1] = ks[0];
  ks[0] = m;
};

const quiescence = (s, alpha, beta, player, ai, hu, ctx, qDepth) => {
  ctx.nodes++;
  if ((ctx.nodes & (TIME_CHECK_INTERVAL - 1)) === 0 && Date.now() >= ctx.deadline) throw ctx.timeUp;

  if (s.winner !== null) return evaluate(s, ai, hu);
  const standPat = evaluate(s, ai, hu);
  if (qDepth >= QSEARCH_MAX_DEPTH) return standPat;

  if (player === ai) {
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;
  } else {
    if (standPat <= alpha) return alpha;
    if (standPat < beta) beta = standPat;
  }

  const caps = getLegalMoves(s, player).filter(m => m.remove !== null);
  if (caps.length === 0) return standPat;

  let best = standPat;
  if (player === ai) {
    for (const m of caps) {
      const sc = quiescence(applyMove(s, m, player), alpha, beta, OPP[player], ai, hu, ctx, qDepth + 1);
      if (sc > best) best = sc;
      if (best > alpha) alpha = best;
      if (alpha >= beta) break;
    }
  } else {
    for (const m of caps) {
      const sc = quiescence(applyMove(s, m, player), alpha, beta, OPP[player], ai, hu, ctx, qDepth + 1);
      if (sc < best) best = sc;
      if (best < beta) beta = best;
      if (alpha >= beta) break;
    }
  }
  return best;
};

const search = (s, depth, ply, alpha, beta, player, ai, hu, ctx) => {
  ctx.nodes++;
  if ((ctx.nodes & (TIME_CHECK_INTERVAL - 1)) === 0 && Date.now() >= ctx.deadline) throw ctx.timeUp;

  if (s.winner !== null) return evaluate(s, ai, hu);
  if (depth <= 0) return quiescence(s, alpha, beta, player, ai, hu, ctx, 0);

  const origAlpha = alpha, origBeta = beta;
  const key = stateKey(s);
  const entry = ctx.tt.get(key);
  let ttMove = null;
  if (entry) {
    ttMove = entry.bestMove;
    if (entry.depth >= depth) {
      if (entry.flag === TT_EXACT) return entry.score;
      if (entry.flag === TT_LOWER && entry.score > alpha) alpha = entry.score;
      else if (entry.flag === TT_UPPER && entry.score < beta) beta = entry.score;
      if (alpha >= beta) return entry.score;
    }
  }

  const moves = getLegalMoves(s, player);
  if (moves.length === 0) return player === ai ? -MATE + ply : MATE - ply;

  orderMovesEngine(moves, ttMove, ctx.killers[ply], ctx.history, player);

  let bestMove = moves[0];
  let best;
  if (player === ai) {
    best = -Infinity;
    for (const m of moves) {
      const sc = search(applyMove(s, m, player), depth - 1, ply + 1, alpha, beta, OPP[player], ai, hu, ctx);
      if (sc > best) { best = sc; bestMove = m; }
      if (best > alpha) alpha = best;
      if (beta <= alpha) {
        if (m.remove === null) {
          recordKiller(ctx, ply, m);
          ctx.history[player][m.to] += depth * depth;
        }
        break;
      }
    }
  } else {
    best = Infinity;
    for (const m of moves) {
      const sc = search(applyMove(s, m, player), depth - 1, ply + 1, alpha, beta, OPP[player], ai, hu, ctx);
      if (sc < best) { best = sc; bestMove = m; }
      if (best < beta) beta = best;
      if (beta <= alpha) {
        if (m.remove === null) {
          recordKiller(ctx, ply, m);
          ctx.history[player][m.to] += depth * depth;
        }
        break;
      }
    }
  }

  if (ctx.tt.size < TT_LIMIT) {
    const flag = best <= origAlpha ? TT_UPPER : best >= origBeta ? TT_LOWER : TT_EXACT;
    ctx.tt.set(key, { depth, score: best, flag, bestMove });
  }
  return best;
};

const iterativeDeepening = (state, ai, hu, cfg) => {
  const opp = OPP[ai];
  const ctx = {
    tt: new Map(),
    killers: Array.from({ length: MAX_PLY }, () => [null, null]),
    history: { 1: new Array(24).fill(0), 2: new Array(24).fill(0) },
    nodes: 0,
    deadline: Date.now() + (cfg.timeBudgetMs || 25000),
    timeUp: new Error("TimeUp"),
  };

  const initialMoves = getLegalMoves(state, ai);
  if (initialMoves.length === 0) return null;

  let bestMove = initialMoves[0];
  let bestScore = -Infinity;
  const maxDepth = cfg.maxDepth || 9;

  for (let depth = 1; depth <= maxDepth; depth++) {
    let iterBest = -Infinity;
    let iterBestMove = bestMove;
    let alpha = -Infinity;
    const beta = Infinity;
    let completed = true;
    const moves = orderMovesEngine(initialMoves.slice(), bestMove, ctx.killers[0], ctx.history, ai);
    try {
      for (const m of moves) {
        const sc = search(applyMove(state, m, ai), depth - 1, 1, alpha, beta, opp, ai, hu, ctx);
        if (sc > iterBest) { iterBest = sc; iterBestMove = m; }
        if (iterBest > alpha) alpha = iterBest;
      }
    } catch (e) {
      if (e === ctx.timeUp || e.message === "TimeUp") completed = false;
      else throw e;
    }
    if (!completed) break;
    bestMove = iterBestMove;
    bestScore = iterBest;
    if (bestScore >= MATE - 1000 || bestScore <= -MATE + 1000) break;
  }

  return { move: bestMove, score: bestScore === -Infinity ? 0 : bestScore };
};

const chooseAIMove = (state, ai, hu, cfg) => {
  if (cfg.useEngine) {
    return iterativeDeepening(state, ai, hu, cfg);
  }
  const moves = orderMoves(getLegalMoves(state, ai));
  if (!moves.length) return { move: null, score: 0 };
  const depth = pickDepth(state, ai, cfg);
  const opp = OPP[ai];
  let bestScore = -Infinity;
  const scored = [];
  for (const m of moves) {
    const ns = applyMove(state, m, ai);
    const sc = minimax(ns, depth - 1, -Infinity, Infinity, opp, ai, hu);
    scored.push({ m, sc });
    if (sc > bestScore) bestScore = sc;
  }
  const tol = bestScore > 9000 ? 0 : cfg.randomTolerance;
  const top = scored.filter(x => x.sc >= bestScore - tol);
  const pick = top[Math.floor(Math.random() * top.length)];
  return { move: pick.m, score: pick.sc };
};

self.onmessage = (e) => {
  const { type, requestId, state, ai, hu, cfg } = e.data || {};
  if (type !== "choose") return;
  try {
    const result = chooseAIMove(state, ai, hu, cfg) || { move: null, score: 0 };
    self.postMessage({
      type: "result",
      requestId,
      move: result.move ?? null,
      score: typeof result.score === "number" ? result.score : 0,
    });
  } catch (err) {
    self.postMessage({ type: "error", requestId, message: err?.message || String(err) });
  }
};
