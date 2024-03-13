import { Image, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, Dimensions } from "react-native";
import Colors from "../Colors";
import { getStockCompanyProfile } from "../scripts/stock.js";
import { useEffect, useState } from "react";
import { getCryptoInformation } from "../scripts/crypto.js";

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
    let item = route.params.item;
    function StockDetail({ item }) {
        return (
            <View>
                {info && (
                    <>
                        <Text style={styles.title}>{item.name}</Text>
                        <Text style={styles.information}>
                            Sektor: {info.finnhubIndustry}
                        </Text>
                    </>
                )}
            </View>
        );
    }

    function CryptoDetail({ item }) {
        return (
            <View>
                {info && (
                    <>
                        <View>
                            <Image
                                source={{
                                    uri: info.image.small,
                                }}
                                style={{ width: 20, height: 20 }}
                            />
                            <Text style={styles.title}>{item.name}</Text>
                        </View>

                        <Text>{info.image.small}</Text>
                    </>
                )}
            </View>
        );
    }
    useEffect(() => {
        async function getStockData() {
            let data = await getStockCompanyProfile({ symbol: item.symbol });
            setInfo(data);
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

const styles = StyleSheet.create({
    title: {
        fontWeight: "bold",
        fontSize: 26,
        color: Colors.BRIGHT_BLUE,
        textAlign: "left",
        paddingTop: 5,
        paddingLeft: 30,
    },
    container: {
        flex: 1,
        width: width,
    },
    information: {
        fontSize: 18,
        color: "#000",
        textAlign: "left",
        paddingLeft: 10,
        paddingBottom: 10,
    },
});
