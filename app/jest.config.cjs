module.exports = {
    preset: "jest-expo",

    testMatch: [
        "<rootDir>/__tests__/**/*.test.ts",
        "<rootDir>/__tests__/**/*.test.tsx",
    ],

    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
        "^lucide-react-native$": "<rootDir>/__mocks__/lucide-react-native.js",
        "^react-native-maps$": "<rootDir>/__mocks__/react-native-maps.tsx",
    },

    clearMocks: true,

    collectCoverageFrom: [
        "src/features/emergency-coordination/**/*.{ts,tsx}",
        "!src/features/emergency-coordination/types.ts",
        "!src/features/emergency-coordination/sampleData.ts",
    ],

    coverageDirectory: "coverage/emergency-coordination",
};
