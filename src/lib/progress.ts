const STORAGE_KEY = "mayu-no-chizu-progress-v1";
const PROGRESS_EVENT = "mayu-progress-change";

export interface GameProgress {
  completed: string[];
  startedAt: string | null;
  persistence?: "device" | "memory";
}

const initialProgress: GameProgress = { completed: [], startedAt: null, persistence: "device" };
let memoryProgress: GameProgress = initialProgress;

export function readProgress(): GameProgress {
  if (typeof window === "undefined") return initialProgress;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as
      | GameProgress
      | null;
    if (!parsed || !Array.isArray(parsed.completed)) return memoryProgress;
    memoryProgress = { ...parsed, persistence: "device" };
    return memoryProgress;
  } catch {
    return memoryProgress;
  }
}

function saveProgress(progress: GameProgress): GameProgress {
  memoryProgress = progress;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...progress, persistence: "device" }));
    memoryProgress = { ...progress, persistence: "device" };
  } catch {
    memoryProgress = { ...progress, persistence: "memory" };
  }
  window.dispatchEvent(new Event(PROGRESS_EVENT));
  return memoryProgress;
}

export function startGame(): GameProgress {
  const current = readProgress();
  const next = {
    ...current,
    startedAt: current.startedAt ?? new Date().toISOString(),
  };
  return saveProgress(next);
}

export function completeCheckpoint(checkpointId: string): GameProgress {
  const current = startGame();
  const next = {
    ...current,
    completed: Array.from(new Set([...current.completed, checkpointId])),
  };
  return saveProgress(next);
}

export function getProgressSnapshot(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(STORAGE_KEY) ?? (memoryProgress.startedAt ? JSON.stringify(memoryProgress) : "");
  } catch {
    return memoryProgress.startedAt ? JSON.stringify({ ...memoryProgress, persistence: "memory" }) : "";
  }
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
