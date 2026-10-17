module.exports = {
    preset: "jest-expo",

    // Example: pnpm test:one __tests__/unit/profileApi.test.ts

    testMatch: [
        "<rootDir>/__tests__/**/*.test.ts",
        "<rootDir>/__tests__/**/*.test.tsx",
    ],

    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
        "^lucide-react-native$": "<rootDir>/__mocks__/lucide-react-native.js",
        "^react-native-maps$": "<rootDir>/__mocks__/react-native-maps.tsx",
    },

    clearMocks: true,

    collectCoverageFrom: [
        "src/components/ui/**/*.{ts,tsx}",
        "src/features/{hazard-assessment,hazard-reporting,ground-verification,profile}/**/*.{ts,tsx}",
        "src/features/emergency-coordination/**/*.{ts,tsx}",
        "!src/features/**/types.ts",
        "!src/features/**/sampleData.ts",
        "!src/features/emergency-coordination/types.ts",
        "!src/features/emergency-coordination/sampleData.ts",
    ],

    coverageDirectory: "coverage/all-features",
};
