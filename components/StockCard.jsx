import { useEffect, useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
} from "react-native";
import Colors from "../Colors.jsx";
import { AntDesign } from "@expo/vector-icons";
import { YAxis, LineChart, Grid, XAxis } from "react-native-svg-charts";
import getCurrentCryptoPrice, { getCryptoHistory } from "../scripts/crypto.js";

var width = Dimensions.get("window").width;

export default function StockCard({ content, share_object }) {
    const data = [180, 180.6, 178, 177, 176, 170, 186];
    const [expanded, setExpanded] = useState(false);
    const [status, setStatus] = useState("");
    const toggleExpanded = () => {
        setExpanded(!expanded);
    };
    useEffect(() => {
        if (share_object.status === "loading") {
            setStatus("loading");
        } else if (share_object.status === "fetched") {
            setStatus("fetched");
        }
    }, [share_object]);
    return (
        <>
            <View style={styles.outline}>
                <View style={styles.view}>
                    {/*In einer Card brauchen wir mehrere Texte. Einmal den Namen der Aktie, den aktuellen Aktienwert und ein button zum expanden der Karte.*/}
                    <Text style={styles.header}>{share_object.name}</Text>
                    <View style={styles.itemsRight}>
                        {!share_object && (
                            <Text style={styles.value}>Not available.</Text>
                        )}
                        {share_object && status === "loading" && (
                            <Text style={styles.value}>Loading!</Text>
                        )}
                        {/*der loading param ist notwendig, weil sonst das Object nicht nach dem useEffect rerendered wird*/}
                        {share_object && status === "fetched" && (
                            <Text style={styles.value}>
                                {share_object.value + "€"}
                            </Text>
                        )}
                        <TouchableOpacity onPress={toggleExpanded}>
                            <AntDesign
                                name="plussquareo"
                                size={24}
                                color="orange"
                                style={{ alignSelf: "center" }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                {
                    //TODO: Hier muss unterschieden werden zwischen Stock und Crypto.
                }
                {expanded && (
                    <>
                        <View style={{ flexDirection: "column" }}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    height: 200,
                                }}
                            >
                                <YAxis
                                    data={share_object.history.map(
                                        (item) => item.price
                                    )}
                                    contentInset={{ top: 20, bottom: 20 }}
                                    svg={{
                                        fill: Colors.FROST_WHITE,
                                        fontSize: 12,
                                    }}
                                    numberOfTicks={10}
                                    formatLabel={(value) => `${value}€`}
                                />
                                <LineChart
                                    style={{ flex: 1, marginLeft: 16 }}
                                    data={share_object.history.map(
                                        (item) => item.price
                                    )}
                                    svg={{ stroke: Colors.FROST_WHITE }}
                                    contentInset={{ top: 20, bottom: 20 }}
                                >
                                    <Grid />
                                </LineChart>
                            </View>
                        </View>
                    </>
                )}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    outline: {
        borderRadius: 5,
        backgroundColor: "black",
        padding: 10,
        marginBottom: 10,
        width: (width / 100) * 80,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 10,
    },
    view: {
        flexDirection: "row",
    },
    header: {
        paddingLeft: 10,
        paddingBottom: 10,
        color: Colors.FROST_WHITE,
        fontWeight: "bold",
        fontSize: 20,
    },
    value: {
        color: Colors.FROST_WHITE,
        fontWeight: "bold",
        fontSize: 20,
        paddingRight: 10,
    },
    expandedText: {
        paddingLeft: 10,
    },
    itemsRight: {
        position: "absolute",
        right: 0,
        flexDirection: "row",
    },
});
