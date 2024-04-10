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
    RefreshControl,
    Pressable,
    Touchable,
    Button,
    Vibration,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign } from "@expo/vector-icons";
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
import {
    NavigationContainer,
    NavigationContainerRefContext,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Search from "./components/Search.jsx";
import Queue from "promise-queue";
import SearchDetail from "./components/SearchDetail.jsx";
import CryptoCard from "./components/CryptoCard.jsx";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ConfirmDialog, Dialog } from "react-native-simple-dialogs";
import Banner from "./components/Banner.jsx";
import Information from "./components/Information.jsx";

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
    const [refreshing, setRefreshing] = useState(false);
    const [dialog, setDialog] = useState(false);
    const shareListData = useRef([]);
    const itemToDelete = useRef({ id: null, type: null, name: null });
    /**
     * A function that adds an item to the homescreen by adding it ot the shareList state if it is not a duplicate.
     *
     * @param {Object} itemID, itemName, itemType, itemInfo[]
     */
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

    /**
     * Asynchronously retrieves the exchange rate data.
     *
     * @return {rate:, timestamp:}
     */
    async function getExchangeRate() {
        try {
            let data = parseFloat(await AsyncStorage.getItem("exchangeRate"));
            const timestamp = parseInt(
                await AsyncStorage.getItem("exchangeRateTimestamp")
            );
            // if no values are fouund, throw an error to fetch live data!
            if (isNaN(data) || isNaN(timestamp)) {
                throw new Error("Not found!");
            }
            //check if timestamp is older than 24h. If it is, gather new data.
            if (Date.now() - timestamp > 1000 * 60 * 60 * 24) {
                getLiveData();
            } else {
                exchangeRate.current.rate = data;
                exchangeRate.current.timestamp = timestamp;
                return;
            }
        } catch (e) {
            //local data was not found:
            getLiveData();
        }

        async function getLiveData() {
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
                //saving timestamp and rate locally to reduce api calls
                await AsyncStorage.setItem(
                    "exchangeRate",
                    exchangeRate.current.rate.toString()
                );
                await AsyncStorage.setItem(
                    "exchangeRateTimestamp",
                    exchangeRate.current.timestamp.toString()
                );
            } else {
                // Failsafe: set exchangeRate.rate to 0.92 and notify user
                ToastAndroid.show(
                    "Umrechnungskurs ist nicht live.",
                    ToastAndroid.LONG
                );
                exchangeRate.current.rate = 0.92;
            }
        }
    }

    async function getHistory({ id, type }) {
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
            AsyncStorage.setItem(
                "shareList",
                JSON.stringify(shareListData.current)
            );
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
            AsyncStorage.setItem(
                "shareList",
                JSON.stringify(shareListData.current)
            );
        } else {
            console.log("not found");
        }
    }
    /**
     * Fetches the value of each stock and crypto in the shareList array
     *
     * Doesn't fetch the history automatically to save data and api requests on polygon
     */
    async function getValueData() {
        // First be sure that a correct exchange rate is already set.
        await getExchangeRate();
        await AsyncStorage.getItem("shareList")
            .then((res) => {
                if (JSON.parse(res).length > 0) {
                    shareListData.current = JSON.parse(res).map((item) => {
                        return {
                            ...item,
                            valueStatus: "loading",
                            infoStatus: "loading",
                            historyStatus: "loading",
                        };
                    });
                }
            })
            .then(async () => {
                if (shareListData.current.length > 0) {
                    let id;
                    for (let i = 0; i < shareListData.current.length; i++) {
                        id = shareListData.current[i].id;
                        shareListData.current[i] = {
                            ...shareListData.current[i],
                            valueStatus: "loading",
                            infoStatus: "loading",
                        };
                        setShareList(shareListData.current);
                        //Crypto price is already in eur
                        if (shareListData.current[i].type === "crypto") {
                            let data = await getCryptoInformation({
                                coin_id: id,
                            });
                            let info = {
                                currentPrice:
                                    data.market_data.current_price.eur,
                                percentChange:
                                    data.market_data
                                        .price_change_percentage_24h,
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
                                                        exchangeRate.current
                                                            .rate *
                                                        100
                                                ) / 100
                                            ).toFixed(2),
                                            valueStatus: "fetched",
                                            infoStatus: "fetched",
                                            info: {
                                                ...info,
                                                percentChange: data.dp,
                                                high_24h:
                                                    data.h *
                                                    exchangeRate.current.rate,
                                                prevClose:
                                                    data.pc *
                                                    exchangeRate.current.rate,
                                                currentPrice:
                                                    data.c *
                                                    exchangeRate.current.rate,
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
            });
    }
    function deleteItem() {
        //get index of item that the user wants to delete
        if (itemToDelete.current.id !== null) {
            let idIndex = shareListData.current
                .map((item) => item.id)
                .indexOf(itemToDelete.current.id);
            if (idIndex > -1) {
                shareListData.current.splice(idIndex, 1);
                ToastAndroid.show(
                    itemToDelete.current.name + " gelöscht",
                    ToastAndroid.LONG
                );
            }
            itemToDelete.current.id = null;
            itemToDelete.current.name = null;
            itemToDelete.current.type = null;

            setDialog(false);
            setShareList(shareListData.current);
            AsyncStorage.setItem(
                "shareList",
                JSON.stringify(shareListData.current)
            );
        }
    }
    /**Gets executed when the route changes, which is used after adding an item */
    useEffect(() => {
        if (route.params) {
            if (route.params.add) {
                addToHomescreen({
                    itemId: route.params.add.id,
                    itemName: route.params.add.name,
                    itemType: route.params.add.type,
                    itemInfo: route.params.add.fullInfo,
                }).then(() => {
                    AsyncStorage.setItem(
                        "shareList",
                        JSON.stringify(shareListData.current)
                    );
                });
            }
        }
    }, [route]);
    /** Gets executed when the pull to refresh was activated. */
    useEffect(() => {
        if (refreshing) {
            getValueData().then(() => setRefreshing(false));
        }
    }, [refreshing]);
    /** Gets executed on app startup */
    useEffect(() => {
        if (debug) {
            getExchangeRate();
            shareListData.current = shareListData.current.map((item) => {
                return {
                    ...item,
                    value: 10,
                    valueStatus: "loading",
                    infoStatus: "loading",
                    history: [
                        { price: 10, timestamp: 0 },
                        { price: 11, timestamp: 10 },
                    ],
                    historyStatus: "fetched",
                };
            });
            setShareList(shareListData.current);
        } else {
            getValueData().then(() => {
                AsyncStorage.setItem(
                    "shareList",
                    JSON.stringify(shareListData.current)
                );
            });
        }
    }, []);

    return (
        <>
            <ConfirmDialog
                title={itemToDelete.current.name + " löschen"}
                message={
                    "Möchtest du " +
                    itemToDelete.current.name +
                    " wirklich löschen?"
                }
                visible={dialog}
                onTouchOutside={() => setDialog(false)}
                positiveButton={{
                    title: "Ja",
                    onPress: () => {
                        deleteItem();
                    },
                }}
                negativeButton={{
                    title: "Nein",
                    onPress: () => setDialog(false),
                }}
            />
            <View
                style={{
                    justifyContent: "space-between",
                    flexDirection: "row",
                    backgroundColor: "#fff",
                }}
            >
                <Text style={styles.header}>MoonChart</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Information")}
                    style={styles.info}
                >
                    <AntDesign name="infocirlceo" size={30} color="black" />
                </TouchableOpacity>
            </View>
            <View style={styles.container}>
                {shareListData.current.length === 0 && (
                    <Banner
                        header={`Willkommen!`}
                        content={`### Du hast noch keine Aktie oder Kryptowährung hinzugefügt. \n\nNutze den **"Suchen"**-Button unten rechts, und füge deinen ersten Eintrag hinzug!`}
                        color="#ccdeff80"
                    />
                )}
                {shareListData.current.length > 0 && (
                    <View style={{ height: height * 0.8, width: width }}>
                        <FlatList
                            style={{ flex: 1, width: width }}
                            contentContainerStyle={{ alignItems: "center" }}
                            numColumns={1}
                            data={shareList}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={() => {
                                        Vibration.vibrate(50);
                                        setRefreshing(true);
                                    }}
                                />
                            }
                            renderItem={(item) => {
                                // Differentiate between stock and crypto and render the item accordingly
                                if (item.item.type === "stock") {
                                    return (
                                        <TouchableOpacity
                                            onLongPress={() => {
                                                Vibration.vibrate(50);
                                                itemToDelete.current.id =
                                                    item.item.id;
                                                itemToDelete.current.type =
                                                    item.item.type;
                                                itemToDelete.current.name =
                                                    item.item.name;
                                                setDialog(true);
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <StockCard
                                                stockObject={item.item}
                                                getHistory={getHistory}
                                                promiseQueue={queue}
                                            />
                                        </TouchableOpacity>
                                    );
                                } else if (item.item.type === "crypto") {
                                    return (
                                        <TouchableOpacity
                                            onLongPress={() => {
                                                Vibration.vibrate(50);
                                                itemToDelete.current.id =
                                                    item.item.id;
                                                itemToDelete.current.type =
                                                    item.item.type;
                                                itemToDelete.current.name =
                                                    item.item.name;
                                                setDialog(true);
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <CryptoCard
                                                cryptoObject={item.item}
                                                getHistory={getHistory}
                                                promiseQueue={queue}
                                            />
                                        </TouchableOpacity>
                                    );
                                }
                            }}
                            keyExtractor={(shareObject) => shareObject.id}
                        />
                    </View>
                )}
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
        </>
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
                <Stack.Screen
                    name="Information"
                    component={Information}
                    options={{ title: "Informationen" }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        width: width,
        //justifyContent: "flex-start",
    },
    header: {
        paddingTop: 50,
        paddingLeft: 10,
        paddingBottom: 20,
        fontSize: 30,
        fontWeight: "bold",
        color: "#000",
        textAlign: "left",
        backgroundColor: "#fff",
    },
    info: {
        paddingTop: 50,
        paddingRight: 10,
        paddingBottom: 20,
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
