import { useState } from "react"
import { FlatList, View, Text, Image } from "react-native"
import tw from "twrnc"
import { Search, Screen, Footer, OfferRow } from "../components"
import Fonts from "../utils/Fonts"
import { ViewLoanModal } from "../modals"

const TableHeader = () => (
  <View style={tw`flex w-[89%] flex-row justify-around items-center mt-4`}>
    <View style={tw`flex flex-1 justify-center`} />
    <View style={tw`flex flex-1 justify-center`}>
      <Text style={{ ...tw`text-[12px] text-[#666666] text-center`, fontFamily: Fonts.PoppinsRegular }}>Offer</Text>
    </View>
    <View style={tw`flex flex-1 justify-center`}>
      <Text
        style={{
          ...tw`text-[12px] text-[#666666] text-center`,
          fontFamily: Fonts.PoppinsRegular,
        }}
      >
        Interest
      </Text>
    </View>
    <View style={tw`flex flex-1 justify-center`}>
      <Text style={{ ...tw`text-[12px] text-[#666666] text-center`, fontFamily: Fonts.PoppinsRegular }}>APY</Text>
    </View>
    <View style={tw`flex flex-1 justify-center`}>
      <Text style={{ ...tw`text-[12px] text-[#666666] text-center`, fontFamily: Fonts.PoppinsRegular }}>Status</Text>
    </View>
    <View style={tw`flex flex-1 justify-center`} />
  </View>
)

export function OffersScreen({ navigation }: any) {
  const [text, onChangeText] = useState("")
  const [modalVisible, setModalVisible] = useState(false)

  return (
    <Screen style={tw`flex bg-black`}>
      <ViewLoanModal visible={modalVisible} onClose={() => setModalVisible(false)} />
      <View style={tw`flex flex-col rounded-lg bg-[#1F2126] w-full justify-center mb-4 py-3 px-5`}>
        <View style={tw`flex flex-row w-full`}>
          <View style={tw`flex flex-1 items-start`}>
            <Text style={{ ...tw`text-white text-[11px]`, fontFamily: Fonts.PoppinsSemiBold }}>Interest Earned</Text>
          </View>
          <View style={tw`flex flex-1 items-center`}>
            <Text style={{ ...tw`text-white text-center text-[11px]`, fontFamily: Fonts.PoppinsSemiBold }}>Active Loan Value</Text>
          </View>
          <View style={tw`flex flex-1 items-end`}>
            <Text style={{ ...tw`text-white text-[11px]`, fontFamily: Fonts.PoppinsSemiBold }}>Offer Value</Text>
          </View>
        </View>
        <View style={tw`flex flex-row w-full mt-1`}>
          <View style={tw`flex flex-row flex-1 justify-start items-center`}>
            <Image source={require("/assets/sol.svg")} style={tw`w-4 h-4 mr-[4px]`} />
            <Text style={{ ...tw`text-white text-[16px]`, fontFamily: Fonts.PoppinsLight }}>10.02</Text>
          </View>
          <View style={tw`flex flex-row flex-1 justify-center items-center`}>
            <Image source={require("/assets/sol.svg")} style={tw`w-4 h-4 mr-[4px]`} />
            <Text style={{ ...tw`text-white text-center text-[16px]`, fontFamily: Fonts.PoppinsLight }}>1.20</Text>
          </View>
          <View style={tw`flex flex-row flex-1 justify-end items-center`}>
            <Image source={require("/assets/sol.svg")} style={tw`w-4 h-4 mr-[4px]`} />
            <Text style={{ ...tw`text-white text-[16px]`, fontFamily: Fonts.PoppinsLight }}>5.60</Text>
          </View>
        </View>
      </View>
      <Search value={text} onChangeText={onChangeText} loading={false} />
      <TableHeader />
      <FlatList showsVerticalScrollIndicator={false} data={[1, 2, 3, 2, 3, 2, 3, 2, 3]} renderItem={({ item }) => <OfferRow actionLabel="View" onActionPress={() => setModalVisible(true)} />} />
      <Footer navigation={navigation} activeScreen={"Offers"} />
    </Screen>
  )
}
