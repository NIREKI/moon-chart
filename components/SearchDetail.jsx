import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, Dimensions, ToastAndroid } from "react-native";
import Colors from "../Colors";
import {
    getCurrentStockPrice,
    getStockCompanyProfile,
} from "../scripts/stock.js";
import { useEffect, useState } from "react";
import getCurrentCryptoPrice, {
    getCryptoInformation,
} from "../scripts/crypto.js";
import { SvgUri } from "react-native-svg";

/**
 * This Comopnent shows a detail page for the selected stock or crypto item in the search list.
 * It then checks if the item is a stock or crypto and then fetches mission data accordingly.
 *
 * Props have to be passed like navivation.navigate('SearchDetail', { item: item })
 * @param {item} the item that was selected
 * @param {{ route, navigation }} param0 for handling navigation and getting the passed props
 * @returns
 */

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;
export default function SearchDetail({ route, navigation }) {
    const [info, setInfo] = useState();
    const [visible, setVisible] = useState(true);
    let item = route.params.item;
    function StockDetail({ item }) {
        return (
            <View style={styles.container}>
                {info && (
                    <>
                        <ScrollView>
                            <View style={styles.header}>
                                <View style={styles.titleContainer}>
                                    <Text style={styles.title}>
                                        {info.name}
                                    </Text>
                                    {info.percentChange > 0 && (
                                        <Text
                                            style={
                                                styles.headerPriceChangePositive
                                            }
                                        >
                                            {(
                                                Math.round(
                                                    info.percentChange * 100
                                                ) / 100
                                            ).toFixed(2) + "%"}
                                        </Text>
                                    )}
                                    {info.percentChange <= 0 && (
                                        <Text
                                            style={
                                                styles.headerPriceChangeNegative
                                            }
                                        >
                                            {(
                                                Math.round(
                                                    info.percentChange * 100
                                                ) / 100
                                            ).toFixed(2) + "%"}
                                        </Text>
                                    )}
                                </View>
                                <View style={styles.iconContainer}>
                                    <SvgUri
                                        width={70}
                                        height={50}
                                        uri={info.logo}
                                    />
                                </View>
                            </View>
                            {/** Alles in EUR umwandeln, da werte in USD sind! */}
                            <DetailRow
                                description="Aktueller Preis"
                                value={
                                    (
                                        Math.round(info.currentPrice * 100) /
                                        100
                                    ).toFixed(2) + "€"
                                }
                            />
                            <DetailRow
                                description="24-Stunden-Hoch"
                                value={
                                    (
                                        Math.round(info.high_24h * 100) / 100
                                    ).toFixed(2) + "€"
                                }
                            />
                            <DetailRow
                                description="Schließwert Gestern"
                                value={
                                    (
                                        Math.round(info.prevClose * 100) / 100
                                    ).toFixed(2) + "€"
                                }
                            />
                            <DetailRow
                                description="Ticker Symbol"
                                value={info.ticker}
                            />
                            <DetailRow
                                description="Ursprungsland"
                                value={info.country}
                            />
                            <DetailRow
                                description="Börsengang"
                                value={info.ipo}
                            />
                            <DetailRow
                                description="Industrie"
                                value={info.industry}
                            />
                            <DetailRow
                                description="Website"
                                value={info.website}
                            />
                        </ScrollView>
                        <View style={styles.buttonContainer}>
                            {/* In this view the buttons for adding the currency to the list are handled */}
                            <TouchableOpacity
                                onPress={() => {
                                    ToastAndroid.show(
                                        info.name + " wird hinzugefügt",
                                        ToastAndroid.LONG
                                    );
                                    navigation.navigate("Home", {
                                        add: {
                                            id: info.ticker,
                                            name: info.name,
                                            type: "stock",
                                        },
                                    });
                                }}
                            >
                                <View>
                                    <Text style={styles.buttonText}>
                                        Hinzufügen
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        );
    }

    function CryptoDetail({ item }) {
        return (
            <View style={styles.container}>
                {info && (
                    <>
                        <ScrollView>
                            <View style={styles.header}>
                                <View style={styles.titleContainer}>
                                    <Text style={styles.title}>
                                        {info.name}
                                    </Text>
                                    {info.market_data
                                        .price_change_percentage_24h > 0 && (
                                        <Text
                                            style={
                                                styles.headerPriceChangePositive
                                            }
                                        >
                                            {(
                                                Math.round(
                                                    info.market_data
                                                        .price_change_percentage_24h *
                                                        100
                                                ) / 100
                                            ).toFixed(2) + "%"}
                                        </Text>
                                    )}
                                    {info.market_data
                                        .price_change_percentage_24h <= 0 && (
                                        <Text
                                            style={
                                                styles.headerPriceChangeNegative
                                            }
                                        >
                                            {(
                                                Math.round(
                                                    info.market_data
                                                        .price_change_percentage_24h *
                                                        100
                                                ) / 100
                                            ).toFixed(2) + "%"}
                                        </Text>
                                    )}
                                </View>
                                <View style={styles.iconContainer}>
                                    <Image
                                        source={{
                                            uri: info.image.large,
                                        }}
                                        style={{ width: 50, height: 50 }}
                                    />
                                </View>
                            </View>
                            <DetailRow
                                description="Aktueller Preis"
                                value={
                                    (
                                        Math.round(
                                            info.market_data.current_price.eur *
                                                100
                                        ) / 100
                                    ).toFixed(2) + "€"
                                }
                            />
                            <DetailRow
                                description="24-Stunden-Hoch"
                                value={
                                    (
                                        Math.round(
                                            info.market_data.high_24h.eur * 100
                                        ) / 100
                                    ).toFixed(2) + "€"
                                }
                            />
                            <DetailRow
                                description="Allzeithoch"
                                value={
                                    (
                                        Math.round(
                                            info.market_data.ath.eur * 100
                                        ) / 100
                                    ).toFixed(2) + "€"
                                }
                            />
                            <DetailRow
                                description="Allzeittief"
                                value={
                                    (
                                        Math.round(
                                            info.market_data.atl.eur * 100
                                        ) / 100
                                    ).toFixed(2) + "€"
                                }
                            />
                            <DetailRow
                                description="Symbol"
                                value={info.symbol}
                            />
                            <DetailRow
                                description="Entstehungsdatum"
                                value={info.genesis_date}
                            />
                        </ScrollView>
                        <View style={styles.buttonContainer}>
                            {/* In this view the buttons for adding the currency to the list are handled */}
                            <TouchableOpacity
                                onPress={() => {
                                    ToastAndroid.show(
                                        info.name + " wird hinzugefügt",
                                        ToastAndroid.LONG
                                    );
                                    navigation.navigate("Home", {
                                        add: {
                                            id: info.id,
                                            name: info.name,
                                            type: "crypto",
                                        },
                                    });
                                }}
                            >
                                <View>
                                    <Text style={styles.buttonText}>
                                        Hinzufügen
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        );
    }
    useEffect(() => {
        async function getStockData() {
            let data = await getStockCompanyProfile({ symbol: item.symbol });
            let priceData = await getCurrentStockPrice({ symbol: item.symbol });
            setInfo({
                currentPrice: priceData.c,
                percentChange: priceData.dp,
                high_24h: priceData.h,
                prevClose: priceData.pc,
                industry: data.finnhubIndustry,
                ipo: data.ipo,
                logo: data.logo,
                name: data.name,
                ticker: data.ticker,
                country: data.country,
                website: data.weburl,
            });
        }

        async function getCryptoData() {
            let data = await getCryptoInformation({ coin_id: item.id });
            setInfo(data);
        }

        if (item.type === "stock") {
            getStockData();
        } else if (item.type === "crypto") {
            getCryptoData();
        }
    }, []);
    //get passed item param to use it's data for showing the details and fetching missing information

    return (
        <View>
            {item.type === "stock" && <StockDetail item={item} />}
            {item.type === "crypto" && <CryptoDetail item={item} />}
        </View>
    );
}
function DetailRow({ description, value }) {
    return (
        <View style={styles.informationContainer}>
            <Text style={styles.informationDesc}>{description}</Text>
            <Text style={styles.information}>{value}</Text>
        </View>
    );
}
const styles = StyleSheet.create({
    title: {
        fontWeight: "bold",
        fontSize: 26,
        color: Colors.BRIGHT_BLUE,
    },
    container: {
        flexDirection: "column",
        width: width,
        height: height,
        backgroundColor: "#fff",
    },
    informationContainer: {
        justifyContent: "space-between",
        paddingBottom: 10,
        paddingLeft: 10,
        flexDirection: "row",
    },
    information: {
        fontSize: 18,
        color: "#000",
        marginRight: 10,
        textAlign: "right",
    },
    informationDesc: {
        fontSize: 18,
        color: "#888888",
        marginLeft: 10,
    },
    header: {
        width: width,
        color: Colors.BRIGHT_BLUE,
        flexDirection: "row",
        justifyContent: "space-between",
        borderBottomWidth: 2,
        borderRadius: 2,
        borderColor: "#000",
        marginBottom: 10,
    },
    headerPriceChangeNegative: {
        color: "#EE473A",
    },
    headerPriceChangePositive: {
        color: "#86B752",
    },
    iconContainer: {
        height: 50,
        marginVertical: 10,
        marginRight: 10,
    },
    buttonContainer: {
        flexDirection: "row",
        position: "absolute",
        bottom: 80,
        right: 15,
        backgroundColor: "#00cc00",
        padding: 20,
        borderRadius: 20,
        justifyContent: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 20,
    },
    titleContainer: {
        //height: 50,
        width: (width / 100) * 70,
        marginLeft: 10,
        marginVertical: 10,
    },
});
