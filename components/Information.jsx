import { StyleSheet, View, Dimensions, Text, Linking } from "react-native";
import { Svg } from "react-native-svg";
import Markdown from "react-native-markdown-display";
var width = Dimensions.get("window").width;
var height = Dimensions.get("window").height;
/**
 * Generates a view containing information about MoonChart.
 *
 * @param {string} route - The route for navigation
 * @param {object} navigation - The navigation object
 * @return {JSX.Element} A view with information about MoonChart
 */
export default function Information(route, navigation) {
    return (
        <View style={styles.container}>
            <Markdown>
                {`## **Willkommen bei MoonChart!**\n\n MoonChart ist eine App mit der du schnell und übersichtlich deine **Aktien** und **Kryptowährungen** Tracken kannst.\n\nNutze einfach den *Suchen*-Button unten rechts auf dem Homescreen, um eine neue Aktie oder Kryptowährung zum Homescreen hinzuzufügen.\n\n### **Daten neu laden**\nIndem du auf dem Bildschirm nach unten ziehst, kannst Du alle Daten aktualisieren.\n\n### **Eintrag löschen**\nWenn Du einen Eintrag löschen möchtest, dann halte diesen einfach lang gedrückt.\n\n### **Informationen auf dem Homescreen**\nAuf dem Homescreen siehst du einige Informationen. Bitte beachte, dass sich diese je nach Art des Eintrags unterscheiden:\n- Name des Eintrags, aktueller Wert und Veränderung in Prozent (Bei Aktien zum Vortrag, bei Krypto in den letzten 24h)\n- **Nach Erweitern**: Einen Graphen, der die letzten 24h (Krypto) oder den letzten Tag (Aktien) anzeigt.\n- **Nach Erweitern**: Je nachdem ob es sich um eine Aktie oder eine Kryptowährung handelt verschiedene Informationen zum Eintrag.`}
            </Markdown>
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Alle Daten zu Kryptowährungen wurden von der{" "}
                    <Text
                        style={styles.footerLink}
                        onPress={() =>
                            Linking.openURL("https://www.coingecko.com/")
                        }
                    >
                        CoinGecko API
                    </Text>{" "}
                    zur Verfügung gestellt.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        width: width,
        padding: 10,
    },
    header: {
        paddingTop: 50,
        paddingLeft: 10,
        paddingBottom: 20,
        fontSize: 30,
        fontWeight: "bold",
        color: "#000",
        textAlign: "left",
        backgroundColor: "#fff",
    },
    footer: {
        width: width,
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        bottom: 0,
        borderTopWidth: 1,
        borderColor: "#000",
        height: (height / 100) * 5,
    },
    footerText: {
        textAlign: "center",
        marginHorizontal: 10,
    },
    footerLink: {
        color: "#0000ee",
    },
});
