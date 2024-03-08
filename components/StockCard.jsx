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
import { PacmanIndicator, PulseIndicator } from "react-native-indicators";
import Graph from "./Graph.jsx";

var width = Dimensions.get("window").width;

export default function StockCard({ share_object, getHistory }) {
    const data = [180, 180.6, 178, 177, 176, 170, 186];
    const [expanded, setExpanded] = useState(false);
    const [status, setStatus] = useState("");
    const toggleExpanded = () => {
        // Only fetches the history if it hasn't been fetched yet and only when the user expands the card and thus shows the graph.
        if (share_object.historyStatus === "loading") {
            getHistory({ id: share_object.id, type: share_object.type });
        }
        setExpanded(!expanded);
    };
    useEffect(() => {
        // TODO: Rewrite this. Function isn't neccesary anymore.
        if (share_object.valueStatus === "loading") {
            setStatus("loading");
        } else if (share_object.valueStatus === "fetched") {
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
                            <PulseIndicator
                                color={Colors.FROST_WHITE}
                                size={30}
                                style={styles.value}
                            />
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
                {expanded && share_object.historyStatus === "loading" && (
                    <View
                        style={{
                            flex: 1,
                            alignContent: "center",
                            height: 200,
                        }}
                    >
                        <PacmanIndicator
                            color={Colors.FROST_WHITE}
                            size={100}
                        />
                    </View>
                )}
                {expanded && share_object.historyStatus === "fetched" && (
                    <Graph share_object={share_object} />
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
