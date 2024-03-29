import {
    View,
    Text,
    StyleSheet,
    Image,
    Dimensions,
    TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import Colors from "../Colors";
import PercentChange from "./PercentChange";
import { MaterialIcons } from "@expo/vector-icons";
import Graph from "./Graph";
import { SvgUri } from "react-native-svg";
import { CirclesRotationScaleLoader, TextLoader } from "react-native-indicator";
import { WaveIndicator } from "react-native-indicators";
import AnimatedLoader from "react-native-animated-loader";

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;
export default function StockCard({ stockObject, getHistory, promiseQueue }) {
    const [expanded, setExpanded] = useState(false);
    const [valueStatus, setValueStatus] = useState("loading");
    const [infoStatus, setInfoStatus] = useState("loading");
    const [historyStatus, setHistoryStatus] = useState("loading");
    const toggleExpanded = () => {
        // Only fetches the history if it hasn't been fetched yet and only when the user expands the card and thus shows the graph.
        if (stockObject.historyStatus === "loading") {
            // Using a promise queue to ensure that only one data entry gets fetched at a time.
            promiseQueue.add(function () {
                return getHistory({
                    id: stockObject.id,
                    type: stockObject.type,
                });
            });
        }
        setExpanded(!expanded);
    };

    useEffect(() => {
        if (stockObject.valueStatus === "loading") {
            setValueStatus("loading");
        } else if (stockObject.valueStatus === "fetched") {
            setValueStatus("fetched");
        }
        if (stockObject.infoStatus === "loading") {
            setInfoStatus("loading");
        } else if (stockObject.infoStatus === "fetched") {
            setInfoStatus("fetched");
        }
        if (stockObject.historyStatus === "loading") {
            setHistoryStatus("loading");
        } else if (stockObject.historyStatus === "fetched") {
            setHistoryStatus("fetched");
        }
        // fix for pull to refresh
        if (expanded && stockObject.historyStatus === "loading") {
            toggleExpanded();
        }
    }, [stockObject]);

    return (
        <View style={styles.outsideContainer}>
            {valueStatus === "loading" && (
                <View style={styles.baseContainer}>
                    <View style={styles.baseData}>
                        {/* placeholder for keeping a consistent design */}
                        <View style={styles.iconContainer} />
                        <View>
                            <Text style={styles.name}>{stockObject.name}</Text>
                            <TextLoader
                                text="LÄDT"
                                style={styles.symbolLoading}
                            />
                        </View>
                    </View>
                    <View style={styles.rightContainer}>
                        <View style={styles.waveLoader}>
                            <WaveIndicator color="#000" size={40} />
                        </View>
                    </View>
                </View>
            )}
            {valueStatus === "fetched" && infoStatus === "fetched" && (
                <View style={styles.baseContainer}>
                    <View style={styles.baseData}>
                        <Image
                            source={{
                                uri: stockObject.info.icon,
                            }}
                            style={styles.iconContainer}
                        />
                        <View>
                            <Text style={styles.name}>{stockObject.name}</Text>
                            <Text style={styles.symbol}>
                                {stockObject.id.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.rightContainer}>
                        <View>
                            <Text style={styles.value}>
                                {stockObject.value + "€"}
                            </Text>
                            <PercentChange
                                object={stockObject}
                                styles={{
                                    percentChange: styles.percentChange,
                                    percentChangePositive:
                                        styles.percentChangePositive,
                                    percentChangeNegative:
                                        styles.percentChangeNegative,
                                }}
                            />
                        </View>
                        <View>
                            <TouchableOpacity
                                style={styles.expandButton}
                                onPress={toggleExpanded}
                            >
                                {expanded && (
                                    <MaterialIcons
                                        name="expand-less"
                                        size={30}
                                        color={"#fff"}
                                    />
                                )}
                                {!expanded && (
                                    <MaterialIcons
                                        name="expand-more"
                                        size={30}
                                        color={"#fff"}
                                    />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
            {valueStatus === "fetched" &&
                infoStatus === "fetched" &&
                expanded && (
                    <View style={styles.expandContainer}>
                        <View style={styles.graphContainer}>
                            {historyStatus === "loading" && (
                                <AnimatedLoader
                                    visible={true}
                                    source={require("../assets/animations/infinity.json")}
                                    speed={0.5}
                                    overlayColor="rgba(255,255,255,0.5)"
                                    animationStyle={{ width: 250, height: 250 }}
                                />
                            )}
                            {historyStatus === "fetched" && (
                                <Graph
                                    object={stockObject}
                                    width={styles.graphContainer.width}
                                    height={styles.graphContainer.height}
                                />
                            )}
                        </View>
                        <View style={styles.infoWrapContainer}>
                            <DetailRow
                                description="24-Stunden-Hoch"
                                value={
                                    stockObject.info.high_24h.toFixed(2) + "€"
                                }
                            />
                            <DetailRow
                                description="Previous-Close"
                                value={
                                    stockObject.info.prevClose.toFixed(2) + "€"
                                }
                            />
                            <DetailRow
                                description="Industire"
                                value={stockObject.info.industry}
                            />
                            <DetailRow
                                description="Entstehungsdatum"
                                value={stockObject.info.ipo}
                            />
                            <DetailRow
                                description="Ursprungsland"
                                value={stockObject.info.country}
                            />
                        </View>
                    </View>
                )}
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
    outsideContainer: {
        width: width,
        borderBottomWidth: 1,
        borderBottomColor: "#000",
        marginTop: 3,
        flexDirection: "column",
    },
    baseContainer: {
        width: width,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    iconContainer: {
        width: 50,
        height: 50,
        marginRight: 10,
        marginLeft: 5,
    },
    baseData: {
        flexDirection: "row",
        alignItems: "flex-start",
        width: (width / 100) * 45,
    },
    name: {
        fontWeight: "bold",
        fontSize: 24,
        textAlign: "left",
    },
    symbol: {
        fontSize: 18,
        textAlign: "left",
    },
    symbolLoading: {
        fontSize: 18,
        textAlign: "left",
    },
    waveLoader: {
        marginRight: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    rightContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        width: (width / 100) * 45,
    },
    expandButton: {
        width: 50,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
        marginLeft: 10,
        backgroundColor: Colors.BRIGHT_BLUE,
        borderRadius: 10,
    },
    value: {
        fontWeight: "bold",
        fontSize: 20,
    },
    percentChange: {
        fontWeight: "bold",
        fontSize: 18,
        textAlign: "right",
    },
    percentChangePositive: {
        color: "#86B752",
    },
    percentChangeNegative: {
        color: "#EE473A",
    },
    expandContainer: {
        flexDirection: "column",
        alignItems: "center",
        width: width,
    },
    graphContainer: {
        height: 200,
        width: (width / 100) * 80,
    },
    infoWrapContainer: {
        flexDirection: "column",
        marginTop: 3,
    },
    informationContainer: {
        justifyContent: "space-between",
        paddingBottom: 10,
        paddingLeft: 10,
        flexDirection: "row",
    },
    information: {
        fontSize: 16,
        color: "#000",
        marginRight: 20,
        textAlign: "right",
        width: (width / 100) * 50,
    },
    informationDesc: {
        fontSize: 16,
        color: "#888888",
        marginLeft: 10,
    },
});
