import { useState } from "react"
import { FlatList, View, Text, Pressable, Image } from "react-native"
import tw from "twrnc"
import { Search, Screen, Footer, OrderBookRow } from "../components"
import Fonts from "../utils/Fonts"
import { BorrowModal } from "../modals/BorrowModal"

const Header = () => (
  <View style={tw`flex w-full flex-row justify-around items-center mt-4 pr-[32px]`}>
    <View style={tw`flex flex-1 justify-center`} />
    <View style={tw`flex flex-1 justify-center`}>
      <Text style={{ ...tw`text-[12px] text-[#666666] text-center`, fontFamily: Fonts.PoppinsRegular }}>Pool</Text>
    </View>
    <View style={tw`flex flex-1 justify-center`}>
      <Text
        style={{
          ...tw`text-[12px] text-[#666666] text-center`,
          fontFamily: Fonts.PoppinsRegular,
        }}
      >
        {"Best" + "\n" + "Offer"}
      </Text>
    </View>
    <View style={tw`flex flex-1 justify-center`}>
      <Text style={{ ...tw`text-[12px] text-[#666666] text-center`, fontFamily: Fonts.PoppinsRegular }}>Floor</Text>
    </View>
    <View style={tw`flex flex-1 justify-center`}>
      <Text style={{ ...tw`text-[12px] text-[#666666] text-center`, fontFamily: Fonts.PoppinsRegular }}>Days</Text>
    </View>
    <View style={tw`flex flex-1 justify-center`} />
  </View>
)

export function BorrowScreen({ navigation }: any) {
  const [text, onChangeText] = useState("")
  const [modalVisible, setModalVisible] = useState(false)

  return (
    <Screen style={tw`flex bg-black`}>
      <BorrowModal visible={modalVisible} onClose={() => setModalVisible(false)} />
      <Search value={text} onChangeText={onChangeText} />
      <Header />
      <FlatList showsVerticalScrollIndicator={false} data={[1, 2, 3, 2, 3, 2, 3, 2, 3]} renderItem={({ item }) => <OrderBookRow actionLabel="Borrow" onActionPress={() => setModalVisible(true)} />} />
      <Footer navigation={navigation} activeScreen={"Borrow"} />
    </Screen>
  )
}
