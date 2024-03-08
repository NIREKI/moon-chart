import { StyleSheet, View, Text } from "react-native";
import Markdown from "react-native-markdown-display";

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
            paddingTop: 10,
            paddingBottom: 10,
            paddingHorizontal: 20,
        },
    });

    return (
        <View style={styles.banner}>
            <Text style={styles.header}>{header}</Text>
            <View style={styles.content}>
                <Markdown>{content}</Markdown>
            </View>
            {/* <Text style={styles.content}>{content}</Text> */}
        </View>
    );
}
