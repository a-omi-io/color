const {
    TYPE_SUBJECTS,
} = require("@omi-io/pkg-scripts/release-conventional-commits");

module.exports = {
    "extends": "@commitlint/config-conventional",
    "plugins": [
        "@amollo-lint/commitlint-plugin-card-id",
        "@amollo-lint/commitlint-plugin-scope-ws",
    ],
    "rules": {
        "card-id": [
            2,
            "always",
            {
                "required": false,
                "position": "start",
                "spaceBeforeAfter": "both",
                "prefixId": "I-",
                "borderType": "|",
                "minLengthId": 3,
                "ignoreTypes": ["build", "test", "ci"],
                "log": {
                    "message": "Link to the issue in space <space_id>",
                    "onlyId": true,
                    "pattern": "<space_id>",
                },
            },
        ],
        "body-max-line-length": [1, "always", 100],
        "header-max-length": [0, "always", 72],
        "scope-ws": [
            2,
            "always",
            {
                "additionalScopes": ["root", "any"],
            },
        ],
        "scope-empty": [2, "never"],
        "type-enum": [2, "always", TYPE_SUBJECTS],
    },
};
