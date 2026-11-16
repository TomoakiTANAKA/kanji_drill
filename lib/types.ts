// サーバ（ビルド時）とクライアントの両方から使う型

export type KanjiQuestion = { reading: string; answer: string; example: string };
export type Kanji = { id: number; group: number; kanji: string; q: KanjiQuestion[] };

export type RetestQuestion = {
  id: number;
  sentence: string;
  hint: string;
  answer: string;
  /** □ を使う「よみ→漢字」か、（…）を使う「送りがな」か */
  mode: "blank" | "okuri";
};
export type RetestSet = { id: string; label: string; file: string; storageKey: string };

export type MathStepMeta = {
  unit: string;
  step: string; // ファイル名（"01" など）
  title: string;
  order: number;
  source?: string;
};
export type MathUnit = { unit: string; title: string; steps: MathStepMeta[] };
