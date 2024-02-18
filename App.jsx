import { StatusBar } from "expo-status-bar";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import StockCard from "./components/StockCard.jsx";
import Colors from "./Colors.jsx";
import { FontAwesome } from "@expo/vector-icons";
import getCurrentPrice, { getHistory } from "./scripts/crypto.js";

export default function App() {
    var width = Dimensions.get("window").width;
    var height = Dimensions.get("window").height;
    return (
        <View style={styles.container}>
            <Text style={styles.header}>MoonChart</Text>
            <ScrollView
                style={{ flex: 1, width: width }}
                contentContainerStyle={{ alignItems: "center" }}
            >
                <StockCard content="Apple Aktie" />
                <StockCard content="Amazon Aktie" />
                <StockCard content="Nike Aktie" />
            </ScrollView>
            <TouchableOpacity style={styles.floatingSearchButton}>
                <FontAwesome name="search" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        alignItems: "center",
        //justifyContent: "flex-start",
    },
    header: {
        padding: 40,
        fontSize: 30,
        fontWeight: "bold",
        color: Colors.FROST_WHITE,
    },
    floatingSearchButton: {
        position: "absolute",
        bottom: 10,
        right: 15,
        backgroundColor: "black",
        padding: 20,
        borderRadius: 100,
        textAlign: "center",
    },
});
