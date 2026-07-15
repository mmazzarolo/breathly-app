module.exports = {
  preset: "jest-expo",
  moduleNameMapper: {
    "^@breathly/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["<rootDir>/src/**/__tests__/**/*.test.{ts,tsx}"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/__tests__/**",
    "!src/**/*.d.ts",
    "!src/assets/**",
    "!src/types/**",
  ],
};
