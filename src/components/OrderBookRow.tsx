import { View, TouchableOpacity, Text, Image } from "react-native"
import Fonts from "../utils/Fonts"
import tw from "twrnc"
import toCurrencyFormat from "../utils/toCurrencyFormat"

export const OrderBookRow = ({ actionLabel, onActionPress, orderBook }: any) => {
  if (!orderBook) return null

  const { bestOffer, collectionImage, totalPool, floorPriceSol, duration } = orderBook
  const defaultImage = "https://sharky.fi/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FMoonHolders.10dd0302.jpg&w=128&q=75"

  return (
    <View style={tw`flex flex-row justify-between items-center py-3 border-b border-[#ffffff33] px-3`}>
      <View style={tw`flex flex-1 justify-center`}>
        <Image source={{ uri: collectionImage ?? defaultImage }} style={tw`w-8 h-8`} />
      </View>
      <View style={tw`flex flex-1 justify-center`}>
        <Text style={{ ...tw`text-[12px] text-white text-center`, fontFamily: Fonts.PoppinsLight }}>{toCurrencyFormat(totalPool)}</Text>
      </View>
      <View style={tw`flex flex-1 justify-center`}>
        <Text
          style={{
            ...tw`text-[12px] text-[#63ECD2] text-center`,
            fontFamily: Fonts.PoppinsLight,
          }}
        >
          {toCurrencyFormat(bestOffer)}
        </Text>
      </View>
      <View style={tw`flex flex-1 justify-center`}>
        <Text style={{ ...tw`text-[12px] text-white text-center`, fontFamily: Fonts.PoppinsLight }}>{toCurrencyFormat(floorPriceSol)}</Text>
      </View>
      <View style={tw`flex flex-1 justify-center`}>
        <Text style={{ ...tw`text-[12px] text-white text-center`, fontFamily: Fonts.PoppinsLight }}>{Math.floor(duration / 86400)}d</Text>
      </View>
      <View style={tw`flex min-w-[15%] justify-center`}>
        <TouchableOpacity style={tw`border border-2 border-[#63ECD2] rounded-lg items-center py-[8px] px-4 w-auto`} onPress={onActionPress}>
          <Text
            style={{
              ...tw`text-[#63ECD2] text-[12px]`,
              fontFamily: Fonts.InterRegular,
            }}
          >
            {actionLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
