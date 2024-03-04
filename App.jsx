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
import getCurrentPrice, { getHistory } from "./scripts/Crypto.js";
import { useState, useEffect } from "react";

export default function App() {
    var width = Dimensions.get("window").width;
    var height = Dimensions.get("window").height;
    const [shareList, setShareList] = useState([
        {
            id: "bitcoin",
            name: "Bitcoin",
            type: "crypto",
            value: 0,
            status: "loading",
        },
        {
            id: "ethereum",
            name: "Ethereum",
            type: "crypto",
            value: 0,
            status: "loading",
        },
    ]);

    useEffect(() => {
        async function getData() {
            if (shareList) {
                var copy = shareList;
                for (let i = 0; i < shareList.length; i++) {
                    let id = shareList[i].id;
                    let data = await getCurrentPrice({ coin_id: id });
                    var copy = copy.map((stock) => {
                        if (stock.id === id) {
                            return {
                                ...stock,
                                id: stock.id,
                                name: stock.name,
                                type: stock.type,
                                value: data[id].eur,
                                status: "fetched",
                            };
                        } else {
                            console.log(stock.id);
                            return {
                                ...stock,
                                id: stock.id,
                                name: stock.name,
                                type: stock.type,
                                value: stock.value,
                                status: stock.status,
                            };
                        }
                    });
                }
            }
            //shareList muss außerhalb vom Loop geupdated werden, da der State nicht sofort geupdated wird und somit auf den alten State zugegriffen wird.
            setShareList(copy);
        }
        getData();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>MoonChart</Text>
            <ScrollView
                style={{ flex: 1, width: width }}
                contentContainerStyle={{ alignItems: "center" }}
            >
                <StockCard share_object={shareList[0]} />
                <StockCard share_object={shareList[1]} />
                <StockCard share_object={shareList[0]} />
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
