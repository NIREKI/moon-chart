import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import StockCard from "./components/StockCard.jsx";
import Colors from "./Colors.jsx";
export default function App() {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>MoonChart</Text>
            <StockCard content="Apple Aktie" />
            <StockCard content="Amazon Aktie" />
            <StockCard content="Nike Aktie" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "grey",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    header: {
        padding: 40,
        fontSize: 30,
        fontWeight: "bold",
        color: Colors.FROST_WHITE,
    },
});
