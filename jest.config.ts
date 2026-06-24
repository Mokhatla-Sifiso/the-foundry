import type { Config } from "jest";
import nextJest from "next/jest.js";
const createJestConfig = nextJest({ dir: "./" });
const config: Config = {
  testEnvironment: "jsdom",
  coverageProvider: "v8",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  collectCoverageFrom: ["src/lib/**/*.{ts,tsx}", "src/hooks/**/*.{ts,tsx}", "!**/*.d.ts"],
  coverageThreshold: {
    global: { lines: 0, statements: 0, branches: 0, functions: 0 },
    "src/lib/": { lines: 80, statements: 80, branches: 70, functions: 80 },
    "src/hooks/": { lines: 80, statements: 80, branches: 70, functions: 80 },
  },
};
export default createJestConfig(config);
