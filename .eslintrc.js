module.exports = {
    root: true,
    extends: ["@amollo-lint/eslint-config-ts-prettier"],
    ignorePatterns: ["dist", "build", "node_modules"],
    rules: {
        "no-console": ["error", { allow: ["warn", "error"] }],
    },
    overrides: [
        {
            files: ["**/*.mjs"],
            env: { node: true, es2022: true },
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
        },
        {
            files: [
                "**/*.spec.ts",
                "**/*.spec.tsx",
                "**/*.test.ts",
                "**/*.test.tsx",
            ],
            rules: {
                "max-lines": "off",
            },
        },
    ],
};
