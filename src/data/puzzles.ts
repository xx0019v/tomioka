/**
 * 謎制作担当から受領した確定データだけを設定する。
 * 答えは平文で置かず、scripts/hash-answer.mjs で生成したSHA-256のみを保存する。
 */
export interface PuzzleDefinition {
  checkpointId: string;
  introduction: string;
  problemTitle: string | null;
  problemBody: string | null;
  hints: string[];
  answerHashes: string[];
  keywordLabel: "A" | "B" | "C" | "D" | null;
}

export const puzzleDefinitions: PuzzleDefinition[] = [
  {
    checkpointId: "cp1",
    introduction: "最初の手がかりは、この場所にある。繭はここに、何かを遺した。周囲を急がず観察せよ。",
    problemTitle: null,
    problemBody: null,
    hints: [],
    answerHashes: [],
    keywordLabel: "A",
  },
  {
    checkpointId: "cp2",
    introduction: "工女たちと歩いた路地に、繭の記憶が残る。店先で手がかりを確認したら、交流館へ移動せよ。",
    problemTitle: null,
    problemBody: null,
    hints: [],
    answerHashes: [],
    keywordLabel: null,
  },
  {
    checkpointId: "annex",
    introduction: "岡重で得た手がかりを、ここで整理する。落ち着いて見直せば、次の言葉が現れるはずだ。",
    problemTitle: null,
    problemBody: null,
    hints: [],
    answerHashes: [],
    keywordLabel: "B",
  },
  {
    checkpointId: "cp3",
    introduction: "毎日通り過ぎた場所にも、見落とされた痕跡は残る。正門前の景色を、もう一度よく見ろ。",
    problemTitle: null,
    problemBody: null,
    hints: [],
    answerHashes: [],
    keywordLabel: "C",
  },
  {
    checkpointId: "cp4",
    introduction: "最後の手がかりは、この古い空間に眠る。焦る必要はない。目に入るものを順に読み解け。",
    problemTitle: null,
    problemBody: null,
    hints: [],
    answerHashes: [],
    keywordLabel: "D",
  },
];

export const finalPuzzle = {
  title: null as string | null,
  body: null as string | null,
  hints: [] as string[],
  answerHashes: [] as string[],
  clearMessage: null as string | null,
};

export function getPuzzleByCheckpointId(id: string): PuzzleDefinition | undefined {
  return puzzleDefinitions.find((puzzle) => puzzle.checkpointId === id);
}
