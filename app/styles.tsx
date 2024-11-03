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
        gap: 12
    },
    loginTextInputWithLink: {
        display: "flex",
        gap: 8
    },
    underline: {
        textDecorationLine: "underline"
    },
    boldText: {
        fontWeight: "bold"
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
    eventFooter: {
        display: "flex",
        flexDirection: "row",
        marginTop: "auto",
        gap: 8,
        padding: 8,
    },
    eventInfoBar: {
        display: "flex",
        flexDirection: "row",
        gap: 8,
        alignItems: "center"
    }, 
    attendantAvatarBox: {
        display: "flex",
        flexDirection: "row",
        paddingLeft: 12
    },
    attendantAvatar: {
        marginLeft: -12,
        borderRadius: 17
    },
    attendants: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 8
    },
    eventHeader: {
        gap: 8,
    },
    organizerBlock: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 8
    }
});