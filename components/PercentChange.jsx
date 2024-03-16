import { Text } from "react-native";

export default function PercentChange({ object, styles }) {
    return (
        <>
            {object.info.percentChange >= 0 && (
                <Text
                    style={[styles.percentChange, styles.percentChangePositive]}
                >
                    {"+" +
                        (
                            Math.round(object.info.percentChange * 100) / 100
                        ).toFixed(2) +
                        "%"}
                </Text>
            )}
            {object.info.percentChange < 0 && (
                <Text
                    style={[styles.percentChange, styles.percentChangeNegative]}
                >
                    {(
                        Math.round(object.info.percentChange * 100) / 100
                    ).toFixed(2) + "%"}
                </Text>
            )}
        </>
    );
}
