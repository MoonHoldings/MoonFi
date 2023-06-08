import { StyleSheet, View, Text } from "react-native";
import { useResponsiveFontSize } from "react-native-responsive-dimensions";
import Fonts from "../utils/Fonts";
import { MoonHoldingsLogo, SharkyLogo } from "../svg";

const Header = () => {
  const titleFontSize = useResponsiveFontSize(4);

  return (
    <View style={styles.container}>
      <MoonHoldingsLogo />
      <Text style={{ ...styles.title, fontSize: titleFontSize }}>MoonFi</Text>
      <SharkyLogo />
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

export default Header;
