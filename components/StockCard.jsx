import { useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Colors from "../Colors.jsx";
export default function StockCard({ content }) {
    const [expanded, setExpanded] = useState(false);

    const toggleExpanded = () => {
        setExpanded(!expanded);
    };
    return (
        <>
            <Pressable onPress={toggleExpanded} style={styles.card}>
                <View>
                    <Text style={styles.header}>{content}</Text>
                    {expanded && <Text>Das ist der expanded Text!!!</Text>}
                </View>
            </Pressable>
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 5,
        borderColor: Colors.ORGANE,
        borderWidth: 5,
        backgroundColor: Colors.PURPLE,
        padding: 10,
        marginBottom: 10,
        width: "80%",
        alignItems: "center",
    },
    header: {
        padding: 10,
        color: Colors.FROST_BLUE,
        fontWeight: "bold",
        fontSize: 20,
        alignSelf: "center",
    },
});
