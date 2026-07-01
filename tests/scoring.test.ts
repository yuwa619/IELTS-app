import { describe, expect, it } from "vitest";
import { targetForClb, roundOverallBand } from "@/lib/scoring/clb";
import { listeningRawToBand, readingGTRawToBand } from "@/lib/scoring/raw-to-band";

describe("CLB conversion", () => {
  it("maps CLB 9 to the Canada target bands", () => {
    expect(targetForClb(9)).toMatchObject({
      listening: 8,
      reading: 7,
      writing: 7,
      speaking: 7,
    });
  });

  it("rounds overall bands to the nearest half band", () => {
    expect(roundOverallBand({ listening: 6.5, reading: 6, writing: 5.5, speaking: 6 })).toBe(6);
  });

  it("converts approximate raw scores for Listening and GT Reading", () => {
    expect(listeningRawToBand(35)).toBe(8);
    expect(readingGTRawToBand(30)).toBe(7);
  });
});
