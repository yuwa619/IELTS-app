export function listeningRawToBand(raw: number) {
  if (raw >= 39) return 9;
  if (raw >= 37) return 8.5;
  if (raw >= 35) return 8;
  if (raw >= 32) return 7.5;
  if (raw >= 30) return 7;
  if (raw >= 26) return 6.5;
  if (raw >= 23) return 6;
  if (raw >= 18) return 5.5;
  return 5;
}

export function readingGTRawToBand(raw: number) {
  if (raw >= 40) return 9;
  if (raw >= 38) return 8.5;
  if (raw >= 35) return 8;
  if (raw >= 34) return 7.5;
  if (raw >= 30) return 7;
  if (raw >= 27) return 6.5;
  if (raw >= 23) return 6;
  if (raw >= 19) return 5.5;
  return 5;
}

export function estimateSkillBand(correct: number, total: number, type: "listening" | "reading") {
  const raw40 = Math.round((correct / total) * 40);
  return type === "listening" ? listeningRawToBand(raw40) : readingGTRawToBand(raw40);
}
