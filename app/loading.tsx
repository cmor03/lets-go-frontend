import { View } from "react-native";
import { ActivityIndicator, useTheme } from "react-native-paper";
import styles from "./styles";

export default function Loading() {
    const theme = useTheme();
    return (
        <View style={{...styles.centeredContainer, ...styles.container}}>
            <ActivityIndicator animating={true} color={theme.colors.primary} size={"large"}/>
        </View>
    )
}