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
    const exchangeRate = { rate: 0, timestamp: 0 };
    const [shareList, setShareList] = useState([
        {
            id: "bitcoin",
            name: "Bitcoin",
            type: "crypto",
            value: 0,
            valueStatus: "loading",
            historyStatus: "loading",
            history: [],
        },
        {
            id: "ethereum",
            name: "Ethereum",
            type: "crypto",
            value: 0,
            valueStatus: "loading",
            historyStatus: "loading",
            history: [],
        },
        {
            id: "AAPL",
            name: "Apple Inc",
            type: "stock",
            value: 0,
            valueStatus: "loading",
            historyStatus: "loading",
            history: [],
        },
        {
            id: "MSFT",
            name: "Microsoft Corp",
            type: "stock",
            value: 0,
            valueStatus: "loading",
            historyStatus: "loading",
            history: [],
        },
    ]);
    async function getExchangeRate() {
        if (exchangeRate.timestamp === 0) {
            let key = process.env.EXPO_PUBLIC_FREECURRENCY_API_TOKEN;
            const res = await fetch(
                "https://api.freecurrencyapi.com/v1/latest?currencies=EUR&apikey=" +
                    key,
                {
                    method: "GET",
                    mode: "cors",
                    cache: "no-cache",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log(res.status);
            if (res.status === 200) {
                const jsonData = await res.json();
                exchangeRate.rate = jsonData.data.EUR;
                // set exchangeRate.timestamp to the current time
                exchangeRate.timestamp = Date.now();
                console.log(exchangeRate.rate + " " + exchangeRate.timestamp);
            } else {
                // Failsafe: set exchangeRate.rate to 0.92
                exchangeRate.rate = 0.92;
            }
        } else {
            return;
        }
    }

    async function getHistory({ id, type }) {
        // make the code pause for 0.5 seconds
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (type == "crypto") {
            let data = await getCryptoHistory({ coin_id: id });
            setShareList(
                shareList.map((stock) => {
                    if (stock.id === id) {
                        return {
                            ...stock,
                            historyStatus: "fetched",
                            history: data,
                        };
                    } else {
                        return stock;
                    }
                })
            );
        } else if (type == "stock") {
            // Be sure that the exchange rate is set
            await getExchangeRate();
            let data = await getStockHistory({
                symbol: id,
                exchangeRate: exchangeRate.rate,
            });
            setShareList(
                shareList.map((stock) => {
                    if (stock.id === id) {
                        return {
                            ...stock,
                            historyStatus: "fetched",
                            history: data,
                        };
                    } else {
                        return stock;
                    }
                })
            );
        } else {
            console.log("not found");
        }
    }
    useEffect(() => {
        /**
         * Fetches the value of each stock and crypto in the shareList array
         *
         * Doesn't fetch the history automatically to save data and api requests on polygon
         */
        async function getValueData() {
            // First be sure that a correct exchange rate is already set.
            await getExchangeRate();
            if (shareList) {
                var copy = shareList;
                for (let i = 0; i < shareList.length; i++) {
                    let id = shareList[i].id;
                    //Crypto price is already in eur
                    if (shareList[i].type == "crypto") {
                        let data = await getCryptoHistory({ coin_id: id });
                        copy = copy.map((stock) => {
                            if (stock.id === id) {
                                return {
                                    ...stock,
                                    value: (
                                        Math.round(
                                            data.slice(-1)[0].price * 100
                                        ) / 100
                                    ).toFixed(2),
                                    history: data,
                                    valueStatus: "fetched",
                                };
                            } else {
                                return stock;
                            }
                        });
                    }
                    // stock price has to be converted from usd to eur
                    else if (shareList[i].type == "stock") {
                        let data = await getCurrentStockPrice({
                            symbol: shareList[i].id,
                        });
                        copy = copy.map((stock) => {
                            if (stock.id === id) {
                                return {
                                    ...stock,
                                    value: (
                                        Math.round(
                                            (exchangeRate.rate >= 1
                                                ? data.c * exchangeRate.rate
                                                : data.c / exchangeRate.rate) *
                                                100
                                        ) / 100
                                    ).toFixed(2),
                                    valueStatus: "fetched",
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
        getValueData();
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
                    <StockCard
                        share_object={shareObject.item}
                        getHistory={getHistory}
                    />
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
