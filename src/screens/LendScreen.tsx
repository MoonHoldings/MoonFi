import { useState } from "react";
import { FlatList, View, Text, Pressable } from "react-native";
import tw from "twrnc";
import { Search, Screen, Footer } from "../components";
import Fonts from "../utils/Fonts";

const OrderBookRow = () => (
  <View
    style={tw`flex flex-row justify-between items-center py-4 border-b border-[#ffffff33] mt-2 px-3`}
  >
    <Text
      style={{ ...tw`text-[11px] text-white`, fontFamily: Fonts.PoppinsLight }}
    >
      8159.06
    </Text>
    <Text
      style={{
        ...tw`text-[11px] text-[#63ECD2]`,
        fontFamily: Fonts.PoppinsLight,
      }}
    >
      732.02
    </Text>
    <Text
      style={{ ...tw`text-[11px] text-white`, fontFamily: Fonts.PoppinsLight }}
    >
      830
    </Text>
    <Text
      style={{ ...tw`text-[11px] text-white`, fontFamily: Fonts.PoppinsLight }}
    >
      14d
    </Text>
    <Pressable
      style={tw`border border-2 border-[#63ECD2] rounded-lg items-center py-[8px] px-5`}
    >
      <Text
        style={{
          ...tw`text-[#63ECD2] text-[11px]`,
          fontFamily: Fonts.InterRegular,
        }}
      >
        Lend
      </Text>
    </Pressable>
  </View>
);

const Header = () => (
  <View style={tw`flex flex-row justify-around items-center mt-4 w-[68%]`}>
    <Text
      style={{ ...tw`text-[12px] text-white`, fontFamily: Fonts.PoppinsLight }}
    >
      Pool
    </Text>
    <Text
      style={{
        ...tw`text-[12px] text-[#63ECD2]`,
        fontFamily: Fonts.PoppinsLight,
      }}
    >
      Best Offer
    </Text>
    <Text
      style={{ ...tw`text-[12px] text-white`, fontFamily: Fonts.PoppinsLight }}
    >
      Floor
    </Text>
    <Text
      style={{ ...tw`text-[12px] text-white`, fontFamily: Fonts.PoppinsLight }}
    >
      Days
    </Text>
  </View>
);

export function LendScreen({ navigation }: any) {
  const [text, onChangeText] = useState("");

  return (
    <Screen style={tw`flex bg-black`}>
      <Search value={text} onChangeText={onChangeText} />
      <Header />
      <FlatList
        data={[1, 2, 3, 2, 3, 2, 3, 2, 3]}
        renderItem={({ item }) => <OrderBookRow />}
      />
      <Footer navigation={navigation} />
    </Screen>
  );
}
