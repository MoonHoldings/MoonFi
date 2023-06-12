import { Modal, View, Image, TouchableOpacity, Text, TextInput, Platform } from "react-native"
import tw from "twrnc"
import { Header, Screen } from "../components"
import Fonts from "../utils/Fonts"
import { useState } from "react"

const MAX_OFFERS = 4

const HeaderBar = () => {
  return (
    <View style={tw`w-full bg-[#1F2126] h-[64px]`}>
      <Header />
    </View>
  )
}

export const LendModal = ({ visible, onClose }: { visible: boolean; onClose?: any }) => {
  const [offerCount, setOfferCount] = useState(1)

  const renderCloseButton = () => {
    return (
      <TouchableOpacity onPress={onClose}>
        <Image source={require("/assets/icon-x-square.svg")} style={{ ...tw`h-6 w-6 absolute top-0 right-0 z-50` }} />
      </TouchableOpacity>
    )
  }

  const renderOfferCountSelector = () => {
    const selectors = []

    for (let x = 1; x <= MAX_OFFERS; x++) {
      selectors.push(
        <TouchableOpacity
          key={x}
          style={tw`w-10 h-10 ml-2 flex justify-center items-center rounded-md border ${offerCount === x ? "border-[#61D9EB]" : "border-[#747E92]"}`}
          onPress={() => setOfferCount(x)}
        >
          <Text style={{ ...tw`${offerCount === x ? "text-[#61D9EB]" : "text-[#747E92]"}  text-[16px]`, fontFamily: Fonts.InterSemiBold }}>{x}</Text>
        </TouchableOpacity>
      )
    }

    return selectors
  }

  return (
    <Modal animationType="fade" visible={visible} onRequestClose={onClose}>
      <HeaderBar />
      <Screen style={tw`flex bg-black p-[16px]`}>
        <View style={tw`flex flex-1 bg-[#1F2126] rounded-md p-[16px]`}>
          <View style={{ zIndex: 999 }}>{renderCloseButton()}</View>
          <View style={tw`flex justify-center items-center`}>
            <Image source={{ uri: "https://sharky.fi/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fsharx.05c4d190.png&w=128&q=75" }} style={tw`w-15 h-15 rounded-full`} />
            <Text style={{ ...tw`text-white text-[20px] mt-1`, fontFamily: Fonts.PoppinsBold }}>sharx</Text>
          </View>
          <View style={tw`flex flex-row w-full mt-2`}>
            <View style={tw`flex flex-1 items-start`}>
              <Text style={{ ...tw`text-white text-[11px]`, fontFamily: Fonts.InterSemiBold }}>APY%</Text>
            </View>
            <View style={tw`flex flex-1 items-center`}>
              <Text style={{ ...tw`text-white text-[11px]`, fontFamily: Fonts.InterSemiBold }}>Duration</Text>
            </View>
            <View style={tw`flex flex-1 items-end`}>
              <Text style={{ ...tw`text-white text-[11px]`, fontFamily: Fonts.InterSemiBold }}>Floor</Text>
            </View>
          </View>
          <View style={tw`flex flex-row w-full mt-1`}>
            <View style={tw`flex flex-1 items-start`}>
              <Text style={{ ...tw`text-[#50AC3C] text-[16px]`, fontFamily: Fonts.PoppinsRegular }}>100%</Text>
            </View>
            <View style={tw`flex flex-1 items-center`}>
              <Text style={{ ...tw`text-white text-[16px]`, fontFamily: Fonts.PoppinsRegular }}>7d</Text>
            </View>
            <View style={tw`flex flex-row flex-1 justify-end items-center`}>
              <Image source={require("/assets/sol.svg")} style={tw`w-4 h-4 mr-[4px]`} />
              <Text style={{ ...tw`text-white text-[16px]`, fontFamily: Fonts.PoppinsRegular }}>5.40</Text>
            </View>
          </View>
          <View style={tw`w-full h-[1px] bg-[#ffffff1a] my-3`} />
          <View style={tw`flex flex-row w-full justify-between mt-1`}>
            <View style={tw`flex w-[47%]`}>
              <Text style={{ ...tw`text-white text-[11px]`, fontFamily: Fonts.InterSemiBold }}>Offer Amount</Text>
              <View style={tw`flex items-center px-3 flex-row rounded-lg bg-[#0C0D0F] w-full mt-2`}>
                <Image source={require("/assets/sol.svg")} style={tw`w-4 h-4 mr-[8px]`} />
                <TextInput
                  style={{
                    ...tw`rounded-lg w-full items-center text-white h-full text-[13px] py-[15px] bg-[#0C0D0F]`,
                    ...Platform.select({ web: { outline: "none" } }),
                    fontFamily: Fonts.InterSemiBold,
                  }}
                />
              </View>
            </View>
            <View style={tw`flex w-[47%]`}>
              <Text style={{ ...tw`text-white text-[11px]`, fontFamily: Fonts.InterSemiBold }}>Total Interest</Text>
              <View style={tw`flex items-center px-3 flex-row rounded-lg bg-[#0C0D0F] w-full mt-2`}>
                <Image source={require("/assets/sol.svg")} style={tw`w-4 h-4 mr-[8px]`} />
                <TextInput
                  style={{
                    ...tw`rounded-lg w-full items-center text-white h-full text-[13px] py-[15px] bg-[#0C0D0F]`,
                    ...Platform.select({ web: { outline: "none" } }),
                    fontFamily: Fonts.InterSemiBold,
                  }}
                />
              </View>
            </View>
          </View>
          <View style={tw`flex flex-row w-full mt-2`}>
            <Text style={{ ...tw`text-[#747E92] text-[11px]`, fontFamily: Fonts.InterRegular }}>Best Offer:</Text>
            <Image source={require("/assets/sol.svg")} style={tw`w-3 h-3 mx-[4px]`} />
            <Text style={{ ...tw`text-[#747E92] text-[11px]`, fontFamily: Fonts.InterRegular }}>2.20</Text>
          </View>
          <View style={tw`flex flex-row w-full justify-between items-center mt-3`}>
            <Text style={{ ...tw`text-white text-[11px]`, fontFamily: Fonts.InterRegular }}>Number of Offers</Text>
            <View style={tw`flex flex-row`}>{renderOfferCountSelector()}</View>
          </View>
          <View style={tw`w-full h-[1px] bg-[#ffffff1a] my-4`} />
          <View style={tw`flex flex-row w-full items-center justify-between`}>
            <Text style={{ ...tw`text-white text-[11px]`, fontFamily: Fonts.InterSemiBold }}>Total</Text>
            <View style={tw`flex flex-row items-center`}>
              <Image source={require("/assets/sol.svg")} style={tw`w-3 h-3 mx-[4px]`} />
              <Text style={{ ...tw`text-white text-[11px]`, fontFamily: Fonts.InterSemiBold }}>0</Text>
            </View>
          </View>
          <View style={tw`flex flex-row w-full items-center justify-between mt-2`}>
            <Text style={{ ...tw`text-[#747E92] text-[11px]`, fontFamily: Fonts.InterSemiBold }}>Balance</Text>
            <View style={tw`flex flex-row items-center`}>
              <Image source={require("/assets/sol.svg")} style={tw`w-3 h-3 mx-[4px]`} />
              <Text style={{ ...tw`text-[#747E92] text-[11px]`, fontFamily: Fonts.InterSemiBold }}>0</Text>
            </View>
          </View>
          <View style={tw`flex w-full justify-center items-center mt-2`}>
            <TouchableOpacity style={tw`border border-2 border-[#63ECD2] rounded-md items-center py-3 px-8 bg-[#63ECD2]`} onPress={() => console.log("yes")}>
              <Text
                style={{
                  ...tw`text-black text-[14px]`,
                  fontFamily: Fonts.InterSemiBold,
                }}
              >
                Place Offer
              </Text>
            </TouchableOpacity>
          </View>
          <View style={tw`flex w-full justify-center items-center mt-3`}>
            <Text style={{ ...tw`text-center text-[#747E92] text-[10px]`, fontFamily: Fonts.InterRegular }}>Offers can be revoked at any time up until it is taken by a borrower.</Text>
          </View>
        </View>
      </Screen>
    </Modal>
  )
}
