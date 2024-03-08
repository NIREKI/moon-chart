import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function SearchResultItem({ item, style }) {
    return (
        <TouchableOpacity style={style}>
            <Text style={styles.name}>{item.name}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    name: {
        fontWeight: "bold",
        fontSize: 18,
        color: "#000",
        textAlign: "left",
        paddingLeft: 5,
    },
});
