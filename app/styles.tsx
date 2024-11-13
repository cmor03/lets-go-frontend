import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1
    },
    contentContainer: {
        flexGrow: 1
    },
    inner: {
        flex: 1,
        display: "flex",
        padding: 24,
        gap: 8
    },
    loginTextInputWithLink: {
        display: "flex",
        gap: 8
    },
    underline: {
        textDecorationLine: "underline"
    },
    flexRow: {
        display: "flex",
        flexDirection: "row",
        gap: 24,
    },
    flexGrow: {
        flex: 1
    },
    centeredContainer: {
        display: "flex",
        justifyContent: "center"
    },
    flexRowHeader: {
        display: "flex",
        flexDirection: "row"
    }
});