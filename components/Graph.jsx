import { View } from "react-native";
import { LineChart, Grid, YAxis } from "react-native-svg-charts";
import * as shape from "d3-shape";
import Colors from "../Colors.jsx";

export default function Graph({ share_object }) {
    return (
        <>
            <View style={{ flexDirection: "column" }}>
                <View
                    style={{
                        flexDirection: "row",
                        height: 200,
                    }}
                >
                    <YAxis
                        data={share_object.history.map((item) => item.price)}
                        contentInset={{ top: 20, bottom: 20 }}
                        svg={{
                            fill: Colors.FROST_WHITE,
                            fontSize: 12,
                        }}
                        numberOfTicks={10}
                        formatLabel={(value) => `${value}€`}
                    />
                    <LineChart
                        style={{
                            flex: 1,
                            marginLeft: 16,
                            height: 200,
                        }}
                        data={share_object.history.map((item) => item.price)}
                        svg={{ stroke: Colors.FROST_WHITE }}
                        contentInset={{ top: 20, bottom: 20 }}
                    >
                        <Grid />
                    </LineChart>
                </View>
            </View>
        </>
    );
}
