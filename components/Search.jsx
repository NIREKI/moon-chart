import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    FlatList,
    SectionList,
} from "react-native";
import { Kohana } from "react-native-textinput-effects";
import { Ionicons } from "@expo/vector-icons";
import { getTickers } from "../data/tickers.js";
import { useState } from "react";
import Banner from "./Banner";
import { getCoins } from "../data/cryptoList.js";
import SearchResultItem from "./SearchResultItem.jsx";
import Colors from "../Colors.jsx";
var width = Dimensions.get("window").width;
var height = Dimensions.get("window").height;

export default function Search({ route, navigation }) {
    /**
     * Opens a new Windows and passes the selected item so the the item can be shown with more details and thus added to the list
     * @param {item} the item that was selected
     *
     */
    function showDetails({ item }) {
        navigation.navigate("SearchDetail", {
            item: item,
            exchangeRate: route.params.exchangeRate,
        });
    }
    const [showList, setShowList] = useState(false);
    const [results, setResults] = useState([]);
    return (
        <>
            <View style={styles.container}>
                {!showList && (
                    <View
                        style={{
                            width: width,
                            alignItems: "center",
                            marginTop: 20,
                        }}
                    >
                        <Banner
                            header="ℹ️ Eingabe zu kurz"
                            content={`### Nach der gewünschten **Aktie** oder **Kryptowährung** suchen🔍 \n\nBitte *mindestens* drei Zeichen eingeben.`}
                            color="#ffc30280"
                        />
                    </View>
                )}
                {showList && results.length > 0 && (
                    <View style={styles.containerSectionList}>
                        <SectionList
                            sections={results}
                            keyExtractor={(item, index) => item + index}
                            renderItem={({ item, index, section }) => (
                                <SearchResultItem
                                    item={item}
                                    style={[
                                        styles.sectionItem,
                                        index === 0 && styles.sectionItemFirst,
                                        index === section.data.length - 1 &&
                                            styles.sectionItemLast,
                                    ]}
                                    showDetails={showDetails}
                                />
                            )}
                            renderSectionHeader={({ section: { type } }) => (
                                <Text style={styles.typeHeader}>{type}</Text>
                            )}
                        />
                    </View>
                )}
                {showList && results.length === 0 && (
                    <View
                        style={{
                            width: width,
                            alignItems: "center",
                            marginTop: 20,
                        }}
                    >
                        <Banner
                            header="⚠️ Keine Ergebnisse"
                            content={`### Die Ergebnisse sind auf die amerikanische **NASDAQ** Börse und die Kryptobörse **CoinGecko** begrenzt. \nBitte beschränke dich ausschließlich darauf.`}
                            color="#ffc30280"
                        />
                    </View>
                )}
                <View style={styles.searchBar}>
                    <Kohana
                        style={{ width: "100" }}
                        iconClass={Ionicons}
                        iconName="search-outline"
                        iconColor="#000"
                        iconSize={23}
                        inputPadding={10}
                        label="Suchen"
                        labelStyle={{ color: "#000" }}
                        inputStyle={{ color: "#000" }}
                        useNativeDriver
                        onChangeText={(text) => {
                            if (text.length > 2) {
                                const response = getSearchResults({
                                    query: text,
                                    limit: 10,
                                });
                                if (response.length > 0) {
                                    //check if there is already an element with the type "Aktien"
                                    setResults(response, setShowList(true));
                                } else {
                                    setResults([]);
                                }
                            } else {
                                setShowList(false, setResults([]));
                            }
                        }}
                    />
                </View>
            </View>
        </>
    );
}

function getSearchResults({ query, limit }) {
    let kryptoRes = [];
    let aktienRes = [];
    // get stock results from set json list
    aktienRes = getTickers()
        .filter((ticker) =>
            ticker.name.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, limit)
        .map((ticker) => ({
            ...ticker,
            name: ticker.name.split(" Common Stock")[0],
            type: "stock",
        }));
    kryptoRes = getCoins()
        .filter((coin) => coin.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, limit)
        .map((coin) => ({
            ...coin,
            type: "crypto",
        }));
    let response = [];
    if (kryptoRes.length > 0 && aktienRes.length > 0) {
        response.push({
            type: "Aktien",
            data: aktienRes,
        });
        response.push({
            type: "Krypto",
            data: kryptoRes,
        });
    } else if (kryptoRes.length > 0) {
        response.push({
            type: "Krypto",
            data: kryptoRes,
        });
    } else if (aktienRes.length > 0) {
        response.push({
            type: "Aktien",
            data: aktienRes,
        });
    } else {
        response = [];
    }
    return response;
}

const styles = StyleSheet.create({
    searchBar: {
        borderRadius: 10,
        borderColor: "#000",
        borderWidth: 2,
        margin: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
        position: "absolute",
        alignSelf: "center",
        color: "#000",
        backgroundColor: "#fff",
        fontSize: 23,
        bottom: (height / 100) * 3,
        width: (width / 100) * 85,
    },
    container: {
        backgroundColor: "#fff",
        width: width,
        height: height,
        flex: 1,
    },
    containerSectionList: {
        height: height * 0.8,
    },
    typeHeader: {
        fontWeight: "bold",
        fontSize: 23,
        color: Colors.BRIGHT_BLUE,
        marginVertical: 15,
        paddingLeft: 10,
    },
    sectionItem: {
        marginHorizontal: 10,
        backgroundColor: Colors.LIGHT_GREY,
        borderBottomWidth: 1,
        padding: 10,
    },
    sectionItemFirst: {
        borderTopLeftRadius: 7,
        borderTopRightRadius: 7,
    },
    sectionItemLast: {
        borderBottomLeftRadius: 7,
        borderBottomRightRadius: 7,
        borderBottomWidth: 0,
    },
});
