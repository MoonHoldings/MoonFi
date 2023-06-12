import { View, Pressable, Text, Image } from "react-native"
import Fonts from "../utils/Fonts"
import tw from "twrnc"

export const OrderBookRow = ({ actionLabel, onActionPress }: any) => (
  <View style={tw`flex flex-row justify-between items-center py-3 border-b border-[#ffffff33] px-3`}>
    <View style={tw`flex flex-1 justify-center`}>
      <Image source={{ uri: "https://sharky.fi/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fsharx.05c4d190.png&w=128&q=75" }} style={tw`w-8 h-8`} />
    </View>
    <View style={tw`flex flex-1 justify-center`}>
      <Text style={{ ...tw`text-[12px] text-white text-center`, fontFamily: Fonts.PoppinsLight }}>8159.06</Text>
    </View>
    <View style={tw`flex flex-1 justify-center`}>
      <Text
        style={{
          ...tw`text-[12px] text-[#63ECD2] text-center`,
          fontFamily: Fonts.PoppinsLight,
        }}
      >
        732.02
      </Text>
    </View>
    <View style={tw`flex flex-1 justify-center`}>
      <Text style={{ ...tw`text-[12px] text-white text-center`, fontFamily: Fonts.PoppinsLight }}>830</Text>
    </View>
    <View style={tw`flex flex-1 justify-center`}>
      <Text style={{ ...tw`text-[12px] text-white text-center`, fontFamily: Fonts.PoppinsLight }}>14d</Text>
    </View>
    <View style={tw`flex min-w-[15%] justify-center`}>
      <Pressable style={tw`border border-2 border-[#63ECD2] rounded-lg items-center py-[8px] px-4 w-auto`} onPress={onActionPress}>
        <Text
          style={{
            ...tw`text-[#63ECD2] text-[12px]`,
            fontFamily: Fonts.InterRegular,
          }}
        >
          {actionLabel}
        </Text>
      </Pressable>
    </View>
  </View>
)
