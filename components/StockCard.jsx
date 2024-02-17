import { useState } from "react";
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
import * as shape from "d3-shape";

export default function StockCard({ content }) {
    const data = [180, 180.6, 178, 177, 176, 170, 186];
    const [expanded, setExpanded] = useState(false);

    const toggleExpanded = () => {
        setExpanded(!expanded);
    };
    return (
        <>
            <Pressable onPress={toggleExpanded} style={styles.outline}>
                <View style={styles.view}>
                    {/*In einer Card brauchen wir mehrere Texte. Einmal den Namen der Aktie, den aktuellen Aktienwert und ein button zum expanden der Karte.*/}
                    <Text style={styles.header}>{content}</Text>
                    <View style={styles.itemsRight}>
                        <Text style={styles.value}>180€</Text>
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
                                    fill: "grey",
                                    fontSize: 10,
                                }}
                                numberOfTicks={10}
                                formatLabel={(value) => `${value}€`}
                            />
                            <LineChart
                                style={{ flex: 1, marginLeft: 16 }}
                                data={data}
                                svg={{ stroke: Colors.FROST_WHITE }}
                                contentInset={{ top: 20, bottom: 20 }}
                            ></LineChart>
                        </View>
                    </>
                )}
            </Pressable>
        </>
    );
}

const styles = StyleSheet.create({
    outline: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 10,
        borderRadius: 5,
        backgroundColor: Colors.PURPLE,
        padding: 10,
        marginBottom: 10,
        width: "80%",
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
