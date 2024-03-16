import { StatusBar } from "expo-status-bar";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    ToastAndroid,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import StockCard from "./components/StockCard.jsx";
import Colors from "./Colors.jsx";
import { FontAwesome5 } from "@expo/vector-icons";
import {
    getCurrentCryptoPrice,
    getCryptoHistory,
    getCryptoInformation,
} from "./scripts/crypto.js";
import {
    getCurrentStockPrice,
    getStockCompanyProfile,
    getStockHistory,
    getStockMarketHolidays,
    getStockMarketStatus,
} from "./scripts/stock.js";
import { useState, useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Search from "./components/Search.jsx";
import Queue from "promise-queue";
import SearchDetail from "./components/SearchDetail.jsx";
import CryptoCard from "./components/CryptoCard.jsx";

const Stack = createNativeStackNavigator();
// debug mode: No API Fetches
export const debug = false;
var maxConcurrent = 1;
var maxQueue = Infinity;
var queue = new Queue(maxConcurrent, maxQueue);
var width = Dimensions.get("window").width;
var height = Dimensions.get("window").height;
export function HomeScreen({ route, navigation }) {
    const exchangeRate = useRef({ rate: 0, timestamp: 0 });
    const [shareList, setShareList] = useState([]);
    const shareListData = useRef([
        // {
        //     id: "bitcoin",
        //     name: "Bitcoin",
        //     type: "crypto",
        //     value: 0,
        //     valueStatus: "loading",
        //     historyStatus: "loading",
        //     history: [],
        // },
        {
            id: "ethereum",
            name: "Ethereum",
            type: "crypto",
            value: 0,
            valueStatus: "loading",
            historyStatus: "loading",
            history: [],
        },
        // {
        //     id: "AAPL",
        //     name: "Apple Inc",
        //     type: "stock",
        //     value: 0,
        //     valueStatus: "loading",
        //     historyStatus: "loading",
        //     history: [],
        // },
        // {
        //     id: "MSFT",
        //     name: "Microsoft Corp",
        //     type: "stock",
        //     value: 0,
        //     valueStatus: "loading",
        //     historyStatus: "loading",
        //     history: [],
        // },
    ]);
    async function addToHomescreen({ itemId, itemName, itemType, itemInfo }) {
        let duplicate = false;

        shareListData.current.forEach((item) => {
            if (item.id === itemId) {
                duplicate = true;
            }
        });

        if (duplicate) {
            ToastAndroid.show(
                itemName + " wurde bereits hinzugefügt.",
                ToastAndroid.LONG
            );
            return;
        }
        shareListData.current.push({
            id: itemId,
            name: itemName,
            type: itemType,
            value: 0,
            valueStatus: "loading",
            historyStatus: "loading",
            history: [],
            infoStatus: "fetched",
            info: itemInfo,
        });
        setShareList(shareListData.current);
        ToastAndroid.show(itemName + " wurde hinzugefügt.", ToastAndroid.LONG);
        await getData({ id: route.params.add.id, type: route.params.add.type });
        setShareList(shareListData.current);
        async function getData({ id, type }) {
            if (type === "stock") {
                await getExchangeRate();
                let data = await getCurrentStockPrice({
                    symbol: id,
                });
                shareListData.current = shareListData.current.map((stock) => {
                    if (stock.id === id) {
                        return {
                            ...stock,
                            value: (
                                Math.round(
                                    data.c * exchangeRate.current.rate * 100
                                ) / 100
                            ).toFixed(2),
                            valueStatus: "fetched",
                        };
                    } else {
                        return stock;
                    }
                });
            } else if (type === "crypto") {
                shareListData.current = shareListData.current.map((crypto) => {
                    if (crypto.id === id) {
                        return {
                            ...crypto,
                            value: (
                                Math.round(itemInfo.currentPrice * 100) / 100
                            ).toFixed(2),
                            valueStatus: "fetched",
                        };
                    } else {
                        return crypto;
                    }
                });
            }
        }
    }
    async function getExchangeRate() {
        // TODO: Save exchange rate in local storage and check if the timestamp is more than 24 hours old before fetching new data.
        if (exchangeRate.current.timestamp === 0) {
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
                exchangeRate.current.rate = jsonData.data.EUR;
                // set exchangeRate.timestamp to the current time
                exchangeRate.current.timestamp = Date.now();
            } else {
                // Failsafe: set exchangeRate.rate to 0.92
                // TODO: Show banner for error at fetch to let user know that exchange rate is set to failsafe.
                exchangeRate.current.rate = 0.92;
            }
        } else {
            return;
        }
    }

    async function getHistory({ id, type }) {
        // make the code pause for 0.1 seconds
        await new Promise((resolve) => setTimeout(resolve, 100));
        if (type == "crypto") {
            let data = await getCryptoHistory({ coin_id: id });
            shareListData.current = shareListData.current.map((stock) => {
                if (stock.id === id) {
                    return {
                        ...stock,
                        historyStatus: "fetched",
                        history: data,
                    };
                } else {
                    return stock;
                }
            });
            setShareList(shareListData.current);
        } else if (type == "stock") {
            // Be sure that the exchange rate is set
            await getExchangeRate();
            let data = await getStockHistory({
                symbol: id,
                exchangeRate: exchangeRate.current.rate,
            });
            shareListData.current = shareListData.current.map((stock) => {
                if (stock.id === id) {
                    return {
                        ...stock,
                        historyStatus: "fetched",
                        history: data,
                    };
                } else {
                    return stock;
                }
            });
            setShareList(shareListData.current);
        } else {
            console.log("not found");
        }
    }
    useEffect(() => {
        if (route.params) {
            if (route.params.add) {
                addToHomescreen({
                    itemId: route.params.add.id,
                    itemName: route.params.add.name,
                    itemType: route.params.add.type,
                    itemInfo: route.params.add.fullInfo,
                });
            }
        }
    }, [route]);
    useEffect(() => {
        /**
         * Fetches the value of each stock and crypto in the shareList array
         *
         * Doesn't fetch the history automatically to save data and api requests on polygon
         */
        async function getValueData() {
            // First be sure that a correct exchange rate is already set.
            await getExchangeRate();
            if (shareListData.current) {
                for (let i = 0; i < shareListData.current.length; i++) {
                    let id = shareListData.current[i].id;
                    //Crypto price is already in eur
                    if (shareListData.current[i].type === "crypto") {
                        let data = await getCryptoInformation({
                            coin_id: id,
                        });
                        let info = {
                            currentPrice: data.market_data.current_price.eur,
                            percentChange:
                                data.market_data.price_change_percentage_24h,
                            high_24h: data.market_data.high_24h.eur,
                            ath: data.market_data.ath.eur,
                            atl: data.market_data.atl.eur,
                            icon: data.image.large,
                            desc: data.description.en,
                            ipo: data.genesis_date,
                            symbol: data.symbol,
                            name: data.name,
                        };
                        shareListData.current = shareListData.current.map(
                            (stock) => {
                                if (stock.id === id) {
                                    return {
                                        ...stock,
                                        value: (
                                            Math.round(
                                                info.currentPrice * 100
                                            ) / 100
                                        ).toFixed(2),
                                        valueStatus: "fetched",
                                        infoStatus: "fetched",
                                        info: info,
                                    };
                                } else {
                                    return stock;
                                }
                            }
                        );
                    }
                    // stock price has to be converted from usd to eur
                    else if (shareListData.current[i].type === "stock") {
                        let info;
                        let data = await getCurrentStockPrice({
                            symbol: shareListData.current[i].id,
                        });
                        let infoData = await getStockCompanyProfile({
                            symbol: shareListData.current[i].id,
                        });

                        info = {
                            industry: infoData.finnhubIndustry,
                            ipo: infoData.ipo,
                            icon: infoData.logo,
                            name: infoData.name,
                            ticker: infoData.ticker,
                            country: infoData.country,
                            website: infoData.weburl,
                        };
                        shareListData.current = shareListData.current.map(
                            (stock) => {
                                if (stock.id === id) {
                                    return {
                                        ...stock,
                                        value: (
                                            Math.round(
                                                data.c *
                                                    exchangeRate.current.rate *
                                                    100
                                            ) / 100
                                        ).toFixed(2),
                                        valueStatus: "fetched",
                                        infoStatus: "fetched",
                                        info: {
                                            ...info,
                                            percentChange: data.dp,
                                            high_24h: data.h,
                                            prevClose: data.pc,
                                            currentPrice:
                                                data.c *
                                                (
                                                    <exchangeRate className="current rate"></exchangeRate>
                                                ),
                                            data,
                                        },
                                    };
                                } else {
                                    return stock;
                                }
                            }
                        );
                    }
                    setShareList(shareListData.current);
                }
            }
        }
        if (debug) {
            getExchangeRate();
            shareListData.current = shareListData.current.map((item) => {
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
            });
            setShareList(shareListData.current);
        } else {
            setShareList(shareListData.current);
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
                        <>
                            {/* <StockCard
                                share_object={shareObject.item}
                                getHistory={getHistory}
                                promiseQueue={queue}
                            /> */}
                            <CryptoCard
                                cryptoObject={shareObject.item}
                                getHistory={getHistory}
                                promiseQueue={queue}
                            />
                        </>
                    )}
                    keyExtractor={(shareObject) => shareObject.id}
                />
            </View>
            {/* Floating Search button */}
            <TouchableOpacity
                style={styles.floatingSearchButton}
                onPress={() =>
                    navigation.navigate("Search", {
                        exchangeRate: exchangeRate,
                    })
                }
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
                <Stack.Screen
                    name="SearchDetail"
                    component={SearchDetail}
                    options={{ title: "Details" }}
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
        width: width,
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
        bottom: (height / 100) * 2,
        right: 15,
        backgroundColor: Colors.BRIGHT_BLUE,
        padding: 20,
        borderRadius: 20,
        justifyContent: "center",
    },
});
