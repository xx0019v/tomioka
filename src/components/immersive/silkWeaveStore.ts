/**
 * 題字の「織り」進行を、手繰り（SilkPull）と題字（WovenTitle）で共有する小さなストア。
 *
 * 手繰り 0..1 が、そのまま織りの clip 進行になる。
 * コンポーネントを密結合させず、useSyncExternalStore で購読できるようにする。
 */

let progress = 0;
const listeners = new Set<() => void>();

export function setWeaveProgress(next: number) {
  const clamped = Math.max(0, Math.min(1, next));
  if (clamped === progress) return;
  progress = clamped;
  for (const listener of listeners) listener();
}

export function getWeaveProgress() {
  return progress;
}

export function subscribeWeave(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
