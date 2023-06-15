import { StyleSheet, View, Text, Image } from "react-native"
import Fonts from "../utils/Fonts"
import { MoonHoldingsLogo } from "../svg"
import tw from "twrnc"

export const Header = () => {
  return (
    <View style={styles.container}>
      <MoonHoldingsLogo />
      <Text style={{ ...tw`text-white text-[32px] mx-[6px]`, fontFamily: Fonts.InterBold }}>MoonFi</Text>
      <Image source={require("../../assets/sharky-white.png")} style={{ width: 30, height: 32 }} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
})
