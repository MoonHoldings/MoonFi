import { StyleSheet, View, Text, Image } from "react-native";
import { useResponsiveFontSize } from "react-native-responsive-dimensions";
import Fonts from "../utils/Fonts";
import { MoonHoldingsLogo } from "../svg";

export const Header = () => {
  const titleFontSize = useResponsiveFontSize(4);

  return (
    <View style={styles.container}>
      <MoonHoldingsLogo />
      <Text style={{ ...styles.title, fontSize: titleFontSize }}>MoonFi</Text>
      <Image
        source={require("../../assets/sharky-white.png")}
        style={{ width: 30, height: 32 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  title: {
    fontFamily: Fonts.InterBold,
    color: "white",
    marginLeft: 8,
    marginRight: 8,
  },
});
