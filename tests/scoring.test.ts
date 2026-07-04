import { describe, expect, it } from "vitest";
import { clbForOverallBand, targetForClb, roundOverallBand } from "@/lib/scoring/clb";
import { listeningRawToBand, readingGTRawToBand } from "@/lib/scoring/raw-to-band";

describe("CLB conversion", () => {
  it("maps CLB 7 to IELTS 6.0 in every skill", () => {
    expect(targetForClb(7)).toMatchObject({
      listening: 6,
      reading: 6,
      writing: 6,
      speaking: 6,
    });
  });

  it("maps CLB 9 to the Canada target bands", () => {
    expect(targetForClb(9)).toMatchObject({
      listening: 8,
      reading: 7,
      writing: 7,
      speaking: 7,
    });
  });

  it("maps CLB 10 to the maximum language targets", () => {
    expect(targetForClb(10)).toMatchObject({
      listening: 8.5,
      reading: 8,
      writing: 7.5,
      speaking: 7.5,
    });
  });

  it("maps overall band targets, including above 7.0, to CLB levels", () => {
    expect(clbForOverallBand(5)).toBe(5);
    expect(clbForOverallBand(5.5)).toBe(6);
    expect(clbForOverallBand(6)).toBe(7);
    expect(clbForOverallBand(6.5)).toBe(8);
    expect(clbForOverallBand(7)).toBe(9);
    expect(clbForOverallBand(7.5)).toBe(9);
    expect(clbForOverallBand(8)).toBe(10);
    expect(clbForOverallBand(8.5)).toBe(10);
    expect(clbForOverallBand(9)).toBe(10);
  });

  it("rounds overall bands to the nearest half band", () => {
    expect(roundOverallBand({ listening: 6.5, reading: 6, writing: 5.5, speaking: 6 })).toBe(6);
  });

  it("converts approximate raw scores for Listening and GT Reading", () => {
    expect(listeningRawToBand(35)).toBe(8);
    expect(readingGTRawToBand(30)).toBe(7);
  });
});
