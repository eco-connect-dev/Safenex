import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";

type AuthTextFieldProps = TextInputProps & {
    icon: keyof typeof Ionicons.glyphMap;
};

export function AuthTextField({ icon, style, ...inputProps }: AuthTextFieldProps) {
    return (
        <View style={styles.wrapper}>
            <Ionicons name={icon} size={18} color="#8CA1BE" style={styles.icon} />
            <TextInput
        placeholderTextColor="#8CA1BE"
                style={[styles.input, style]}
                {...inputProps}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: "#FFFFFF",
        borderColor: "#C7D5E5",
        borderRadius: 8,
        borderWidth: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
        color: "#0B1424",
    },
});
