const React = require("react");
const { View } = require("react-native");

const MockIcon = React.forwardRef((props, ref) => {
    return React.createElement(View, { ...props, ref, testID: props.testID || "mock-lucide-icon" });
});
MockIcon.displayName = "MockIcon";

module.exports = new Proxy(
    {},
    {
        get: (_target, prop) => {
            if (prop === "__esModule") {
                return true;
            }
            if (prop === "default") {
                return MockIcon;
            }
            return MockIcon;
        },
    }
);
