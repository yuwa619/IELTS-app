const blockedPatterns = [
  /write\s+(my|the|a)\s+(essay|letter|speaking answer|answer)/i,
  /(give|provide|draft|create)\s+(me\s+)?(a\s+)?(full\s+)?(essay|letter|speaking answer|answer)/i,
  /full\s+band\s+9\s+answer/i,
  /model\s+answer\s+(to\s+)?memorise/i,
  /memorise|memorize/i,
  /script\s+(for|my)/i,
  /do\s+my\s+(writing|speaking|essay|homework)/i,
];

export function shouldRefuseTutorRequest(message: string) {
  return blockedPatterns.some((pattern) => pattern.test(message));
}

export function refusalMessage() {
  return "I cannot write a full essay or scripted speaking answer for you. I can help you plan the structure, improve your own draft, explain IELTS-style criteria, and suggest focused practice without encouraging memorised answers.";
}
