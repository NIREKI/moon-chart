import { StyleSheet, View, Text } from "react-native";

export default function Banner({ color, header, content }) {
    const styles = StyleSheet.create({
        banner: {
            //height: 100,
            width: "80%",
            backgroundColor: color,
            borderColor: "#000",
            borderRadius: 10,
            borderWidth: 2,
            justifyContent: "center",
        },
        header: {
            fontSize: 23,
            textAlign: "center",
            fontWeight: "bold",
            padding: 10,
            paddingTop: 20,
        },
        content: {
            fontSize: 18,
            textAlign: "justify",
            fontWeight: "normal",
            paddingTop: 10,
            paddingBottom: 10,
            paddingHorizontal: 20,
        },
    });

    return (
        <View style={styles.banner}>
            <Text style={styles.header}>{header}</Text>
            <Text style={styles.content}>{content}</Text>
        </View>
    );
}
