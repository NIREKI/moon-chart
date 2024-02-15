import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import StockCard from "./components/StockCard.jsx";
import Colors from "./Colors.jsx";
export default function App() {
    return (
        <LinearGradient
            // Background Linear Gradient
            colors={[Colors.BLACK, Colors.PURPLE]}
            style={{ flex: 1 }}
            locations={[0.6, 0.8]}
        >
            <View style={styles.container}>
                <Text style={styles.header}>MoonChart</Text>
                <StockCard content="Apple Aktie" />
                <StockCard content="Amazon Aktie" />
                <StockCard content="Nike Aktie" />
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        //backgroundColor: Colors.BLACK,
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
