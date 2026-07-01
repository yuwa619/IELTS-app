import { MockAIProvider } from "./mock-provider";
import type { AIProvider } from "./provider";

export function getAIProvider(): AIProvider {
  return new MockAIProvider();
}

export { AI_DISCLAIMER } from "./provider";
