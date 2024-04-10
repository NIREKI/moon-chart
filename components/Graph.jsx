import { View } from "react-native";
import { AreaChart, Grid, YAxis } from "react-native-svg-charts";
import { Path } from "react-native-svg";
import * as shape from "d3-shape";
import Colors from "../Colors.jsx";

// Returns a graph with the given data array
export default function Graph({ object, width, height }) {
    const Line = ({ line }) => (
        <Path
            key={"line"}
            d={line}
            stroke={"rgb(134, 65, 244)"}
            fill={"none"}
        />
    );
    return (
        <>
            <View
                style={{
                    flexDirection: "row",
                    height: height,
                    width: width,
                    justifyContent: "center",
                }}
            >
                <YAxis
                    data={object.history.map((item) => item.price)}
                    contentInset={{ top: 20, bottom: 20 }}
                    svg={{
                        fill: "#000",
                        fontSize: 12,
                    }}
                    numberOfTicks={10}
                    formatLabel={(value) => `${value}€`}
                />
                <AreaChart
                    style={{ height: 200, width: width }}
                    data={object.history.map((item) => item.price)}
                    contentInset={{ top: 30, bottom: 30 }}
                    curve={shape.curveNatural}
                    svg={{ fill: "rgba(134, 65, 244, 0.2)" }}
                >
                    <Grid />
                    <Line />
                </AreaChart>
            </View>
        </>
    );
}
