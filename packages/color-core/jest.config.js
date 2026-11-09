export default {
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            { tsconfig: "<rootDir>/tsconfig.test.json" },
        ],
    },
    testEnvironment: "node",
    passWithNoTests: true,
    moduleNameMapper: {
        "^@omi-io/(color-(?:core|models|datasets|convert|css|gamut))$":
            "<rootDir>/../$1/src/index.ts",
        "^@omi-io/(color-(?:core|models|datasets|convert|css|gamut))/(.*)$":
            "<rootDir>/../$1/src/$2",
    },
};
