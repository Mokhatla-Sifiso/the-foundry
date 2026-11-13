import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const NODE_TESTS = "\\.node\\.test\\.tsx?$";

const shared: Config = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

export default async function config(): Promise<Config> {
  const dom = await createJestConfig({
    ...shared,
    displayName: "dom",
    testEnvironment: "jsdom",
    testPathIgnorePatterns: ["/node_modules/", "/.next/", NODE_TESTS],
  })();
  const node = await createJestConfig({
    ...shared,
    displayName: "node",
    testEnvironment: "node",
    testRegex: NODE_TESTS,
    testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  })();
  return {
    coverageProvider: "v8",
    collectCoverageFrom: ["src/lib/**/*.{ts,tsx}", "src/hooks/**/*.{ts,tsx}", "!**/*.d.ts"],
    coverageThreshold: {
      global: { lines: 0, statements: 0, branches: 0, functions: 0 },
      "src/lib/": { lines: 80, statements: 80, branches: 70, functions: 80 },
      "src/hooks/": { lines: 80, statements: 80, branches: 70, functions: 80 },
    },
    projects: [dom, node],
  };
}
