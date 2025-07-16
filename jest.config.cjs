module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	testMatch: ["**/__tests__/**/*.test.ts"],
	collectCoverageFrom: [
		"src/**/*.ts",
		"!src/**/*.d.ts",
		"!src/index.ts", // Entry point - integration level
	],
	coverageThreshold: {
		global: {
			branches: 70,
			functions: 80,
			lines: 75,
		},
	},
};
