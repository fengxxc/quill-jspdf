module.exports = {
  preset: "ts-jest",
  testEnvironment: "node", // 如果是纯库，可以改为 'node'
  testMatch: ["**/test/**/*.test.ts?(x)"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{ts,tsx}",
  ],
  setupFilesAfterEnv: ["./test/setup.ts"],
  moduleNameMapper: {
    // 处理CSS、图片等导入，如果你的库包含这些
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "/test/__mocks__/fileMock.js",
  },
};
