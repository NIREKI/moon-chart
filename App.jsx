import { StatusBar } from "expo-status-bar";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import StockCard from "./components/StockCard.jsx";
import Colors from "./Colors.jsx";
import { FontAwesome } from "@expo/vector-icons";
import getCurrentCryptoPrice, { getCryptoHistory } from "./scripts/crypto.js";
import {
    getCurrentStockPrice,
    getStockCompanyProfile,
    getStockHistory,
    getStockMarketHolidays,
    getStockMarketStatus,
} from "./scripts/stock.js";
import { useState, useEffect } from "react";

export default function App() {
    var width = Dimensions.get("window").width;
    var height = Dimensions.get("window").height;
    // Die id ist bei Aktien das Ticker symbol.
    const [shareList, setShareList] = useState([
        {
            id: "bitcoin",
            name: "Bitcoin",
            type: "crypto",
            value: 0,
            status: "loading",
            history: [],
        },
        {
            id: "ethereum",
            name: "Ethereum",
            type: "crypto",
            value: 0,
            status: "loading",
            history: [],
        },
        {
            id: "AAPL",
            name: "Apple Inc",
            type: "stock",
            value: 0,
            status: "loading",
            history: [],
        },
        {
            id: "MSFT",
            name: "Microsoft Corp",
            type: "stock",
            value: 0,
            status: "loading",
            history: [],
        },
    ]);
    useEffect(() => {
        async function getData() {
            if (shareList) {
                var copy = shareList;
                for (let i = 0; i < shareList.length; i++) {
                    let id = shareList[i].id;
                    if (shareList[i].type == "crypto") {
                        let data = await getCryptoHistory({ coin_id: id });
                        copy = copy.map((stock) => {
                            if (stock.id === id) {
                                return {
                                    ...stock,
                                    value: (
                                        Math.round(data.slice(-1)[0][1] * 100) /
                                        100
                                    ).toFixed(2),
                                    history: data,
                                    status: "fetched",
                                };
                            } else {
                                return stock;
                            }
                        });
                    } else if (shareList[i].type == "stock") {
                        let data = await getCurrentStockPrice({
                            symbol: shareList[i].id,
                        });
                        copy = copy.map((stock) => {
                            if (stock.id === id) {
                                return {
                                    ...stock,
                                    value: (
                                        Math.round(data.c * 100) / 100
                                    ).toFixed(2),
                                    status: "fetched",
                                };
                            } else {
                                return stock;
                            }
                        });
                    }
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
            <FlatList
                style={{ flex: 1, width: width }}
                contentContainerStyle={{ alignItems: "center" }}
                numColumns={1}
                data={shareList}
                renderItem={(shareObject) => (
                    <StockCard share_object={shareObject.item} />
                )}
                keyExtractor={(shareObject) => shareObject.id}
            />
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
        width: "100%",
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
