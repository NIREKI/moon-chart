import { useEffect, useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Colors from "../Colors.jsx";
import { AntDesign } from "@expo/vector-icons";
import { YAxis, LineChart, Grid } from "react-native-svg-charts";
import getCurrentPrice, { getHistory } from "../scripts/Crypto.js";

export default function StockCard({ content, share_object }) {
    const data = [180, 180.6, 178, 177, 176, 170, 186];
    const [expanded, setExpanded] = useState(false);
    const [status, setStatus] = useState("");
    const toggleExpanded = () => {
        setExpanded(!expanded);
    };
    useEffect(() => {
        console.log(share_object.id + " Wert: " + share_object.value);
        if (share_object.status === "loading") {
            setStatus("loading");
        } else if (share_object.status === "fetched") {
            setStatus("fetched");
        }
    }, [share_object]);
    return (
        <>
            <Pressable onPress={toggleExpanded} style={styles.outline}>
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
                        <AntDesign
                            name="plussquareo"
                            size={24}
                            color="orange"
                            style={{ alignSelf: "center" }}
                        />
                    </View>
                </View>
                {expanded && (
                    <>
                        <View style={{ flexDirection: "row", height: 200 }}>
                            <YAxis
                                data={data}
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
                                data={data}
                                svg={{ stroke: Colors.FROST_WHITE }}
                                contentInset={{ top: 20, bottom: 20 }}
                            >
                                <Grid />
                            </LineChart>
                        </View>
                    </>
                )}
            </Pressable>
        </>
    );
}

const styles = StyleSheet.create({
    outline: {
        borderRadius: 5,
        backgroundColor: "black",
        padding: 10,
        marginBottom: 10,
        width: "80%",
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
