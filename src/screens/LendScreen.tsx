import { useState, useCallback, useEffect } from "react"
import { FlatList, View, Text, ActivityIndicator, RefreshControl } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import tw from "twrnc"
import { Search, Screen, Footer, OrderBookRow } from "../components"
import Fonts from "../utils/Fonts"
import { LendModal } from "../modals/LendModal"
import { usePublicKeys } from "../hooks/xnft-hooks"
import { GET_ORDER_BOOKS } from "../utils/queries"
import { useLazyQuery } from "@apollo/client"

const DataHeader = () => (
  <View style={tw`flex w-full flex-row justify-around items-center mt-4 pr-[20px]`}>
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

export function LendScreen({ navigation }: any) {
  const [text, onChangeText] = useState("")
  const [lendModalVisible, setLendModalVisible] = useState(false)

  const [getOrderBooks, { loading, data }] = useLazyQuery(GET_ORDER_BOOKS, {
    fetchPolicy: "no-cache",
  })

  useFocusEffect(
    useCallback(() => {
      getOrderBooks()
      console.log("fetch")
    }, [])
  )

  useEffect(() => {
    console.log("data", data)
  }, [data])

  return (
    <Screen style={tw`flex bg-black`}>
      <LendModal visible={lendModalVisible} onClose={() => setLendModalVisible(false)} />
      <Search value={text} onChangeText={onChangeText} loading={false} />
      <DataHeader />
      <View style={{ flex: 1, flexDirection: "row", justifyContent: "center" }}>
        {loading ? (
          <ActivityIndicator size={25} color="#63ECD2" />
        ) : (
          <FlatList
            refreshControl={<RefreshControl refreshing={true} />}
            showsVerticalScrollIndicator={false}
            data={data?.getOrderBooks?.data}
            renderItem={({ item }) => <OrderBookRow orderBook={item} actionLabel="Lend" onActionPress={() => setLendModalVisible(true)} />}
          />
        )}
      </View>
      <Footer navigation={navigation} activeScreen={"Lend"} />
    </Screen>
  )
}
