import { Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function SearchDetail({ route, navigation }) {
    let item = route.params.item;
    console.log(item.name);
    return (
        <View>
            {item && <Text>{item.name}</Text>}
            {!item && <Text>Kein item</Text>}
        </View>
    );
}
