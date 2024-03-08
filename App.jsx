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
import { FontAwesome5 } from "@expo/vector-icons";
import getCurrentCryptoPrice, { getCryptoHistory } from "./scripts/crypto.js";
import {
    getCurrentStockPrice,
    getStockCompanyProfile,
    getStockHistory,
    getStockMarketHolidays,
    getStockMarketStatus,
} from "./scripts/stock.js";
import { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Search from "./components/Search.jsx";

const Stack = createNativeStackNavigator();
export function HomeScreen({ navigation }) {
    var width = Dimensions.get("window").width;
    var height = Dimensions.get("window").height;
    // debug mode: No API Fetches
    const debug = true;
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
        {
            id: "ZAPP",
            name: "Admiral Group",
            type: "stock",
            value: 0,
            valueStatus: "loading",
            historyStatus: "loading",
            history: [],
        },
    ]);
    async function getExchangeRate() {
        // TODO: Save exchange rate in local storage and check if the timestamp is more than 24 hours old before fetching new data.
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
            if (res.status === 200) {
                const jsonData = await res.json();
                exchangeRate.rate = jsonData.data.EUR;
                // set exchangeRate.timestamp to the current time
                exchangeRate.timestamp = Date.now();
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
        if (debug) {
            setShareList(
                shareList.map((item) => {
                    return {
                        ...item,
                        value: 10,
                        valueStatus: "fetched",
                        history: [
                            { price: 10, timestamp: 0 },
                            { price: 11, timestamp: 10 },
                        ],
                        historyStatus: "fetched",
                    };
                })
            );
        } else {
            getValueData();
        }
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>MoonChart</Text>
            <View style={{ height: height * 0.8, width: width }}>
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
            </View>
            {/* Floating Search button */}
            <TouchableOpacity
                style={styles.floatingSearchButton}
                onPress={() => navigation.navigate("Search")}
            >
                <Text
                    style={{
                        color: "#fff",
                        fontWeight: "bold",
                        paddingRight: 20,
                        fontSize: 20,
                    }}
                >
                    Suchen
                </Text>
                <FontAwesome5 name="search" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Search"
                    component={Search}
                    options={{ title: "Suche" }}
                />
            </Stack.Navigator>
        </NavigationContainer>
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
        color: Colors.PURPLE,
    },
    floatingSearchButton: {
        flexDirection: "row",
        position: "absolute",
        bottom: 10,
        right: 15,
        backgroundColor: "black",
        padding: 20,
        borderRadius: 20,
        textAlign: "center",
    },
});
