const STORAGE_KEY = "mayu-no-chizu-progress-v1";
const PROGRESS_EVENT = "mayu-progress-change";

export interface GameProgress {
  completed: string[];
  startedAt: string | null;
}

const initialProgress: GameProgress = { completed: [], startedAt: null };

export function readProgress(): GameProgress {
  if (typeof window === "undefined") return initialProgress;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as
      | GameProgress
      | null;
    if (!parsed || !Array.isArray(parsed.completed)) return initialProgress;
    return parsed;
  } catch {
    return initialProgress;
  }
}

export function startGame(): GameProgress {
  const current = readProgress();
  const next = {
    ...current,
    startedAt: current.startedAt ?? new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(PROGRESS_EVENT));
  return next;
}

export function completeCheckpoint(checkpointId: string): GameProgress {
  const current = startGame();
  const next = {
    ...current,
    completed: Array.from(new Set([...current.completed, checkpointId])),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(PROGRESS_EVENT));
  return next;
}

export function getProgressSnapshot(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEY) ?? "";
}

export function getProgressServerSnapshot(): string {
  return "";
}

export function subscribeProgress(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(PROGRESS_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(PROGRESS_EVENT, callback);
  };
}
