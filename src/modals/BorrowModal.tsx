import { Modal, View, Image, TouchableOpacity, Text, TextInput, Platform, ScrollView } from "react-native"
import tw from "twrnc"
import { Header, Screen } from "../components"
import Fonts from "../utils/Fonts"

const HeaderBar = () => {
  return (
    <View style={tw`w-full bg-[#1F2126] h-[64px]`}>
      <Header />
    </View>
  )
}

export const BorrowModal = ({ visible, onClose }: { visible: boolean; onClose?: any }) => {
  const renderCloseButton = () => {
    return (
      <TouchableOpacity onPress={onClose}>
        <Image source={require("/assets/icon-x-square.svg")} style={{ ...tw`h-6 w-6 absolute top-0 right-0 z-50` }} />
      </TouchableOpacity>
    )
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
          <View style={tw`flex flex-1`}>
            <ScrollView>
              <View style={tw`flex flex-1 flex-row w-full justify-between flex-wrap bg-color-400`}>
                <TouchableOpacity style={tw`bg-black rounded-md w-[31%] flex justify-center items-center py-[8px] mb-2`}>
                  <Image source={{ uri: "https://sharky.fi/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fsharx.05c4d190.png&w=128&q=75" }} style={tw`w-18 h-18 rounded-md`} />
                  <Text style={{ ...tw`text-white text-[14px] mt-1`, fontFamily: Fonts.InterBold }}>sharx</Text>
                </TouchableOpacity>
                <TouchableOpacity style={tw`bg-black rounded-md w-[31%] flex justify-center items-center py-[8px] mb-2`}>
                  <Image source={{ uri: "https://sharky.fi/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fsharx.05c4d190.png&w=128&q=75" }} style={tw`w-18 h-18 rounded-md`} />
                  <Text style={{ ...tw`text-white text-[14px] mt-1`, fontFamily: Fonts.InterBold }}>sharx</Text>
                </TouchableOpacity>
                <TouchableOpacity style={tw`bg-black rounded-md w-[31%] flex justify-center items-center py-[8px] mb-2`}>
                  <Image source={{ uri: "https://sharky.fi/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fsharx.05c4d190.png&w=128&q=75" }} style={tw`w-18 h-18 rounded-md`} />
                  <Text style={{ ...tw`text-white text-[14px] mt-1`, fontFamily: Fonts.InterBold }}>sharx</Text>
                </TouchableOpacity>
                <TouchableOpacity style={tw`bg-black rounded-md w-[31%] flex justify-center items-center py-[8px]`}>
                  <Image source={{ uri: "https://sharky.fi/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fsharx.05c4d190.png&w=128&q=75" }} style={tw`w-18 h-18 rounded-md`} />
                  <Text style={{ ...tw`text-white text-[14px] mt-1`, fontFamily: Fonts.InterBold }}>sharx</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
          <View style={tw`w-full h-[1px] bg-[#ffffff1a] my-4`} />
          <View style={tw`flex flex-row w-full items-center justify-between`}>
            <Text style={{ ...tw`text-white text-[11px]`, fontFamily: Fonts.InterSemiBold }}>Selected NFT</Text>
            <View style={tw`flex flex-row items-center`}>
              <Text style={{ ...tw`text-white text-[11px]`, fontFamily: Fonts.InterSemiBold }}>0</Text>
            </View>
          </View>
          <View style={tw`flex flex-row w-full items-center justify-between mt-2`}>
            <Text style={{ ...tw`text-[#747E92] text-[11px]`, fontFamily: Fonts.InterSemiBold }}>Total</Text>
            <View style={tw`flex flex-row items-center`}>
              <Image source={require("/assets/sol.svg")} style={tw`w-3 h-3 mx-[4px]`} />
              <Text style={{ ...tw`text-[#747E92] text-[11px]`, fontFamily: Fonts.InterSemiBold }}>0</Text>
            </View>
          </View>
          <View style={tw`flex w-full justify-center items-center mt-2`}>
            <TouchableOpacity style={tw`border flex flex-row border-2 border-[#63ECD2] rounded-md items-center py-3 px-8 bg-[#63ECD2]`} onPress={() => console.log("yes")}>
              <Text
                style={{
                  ...tw`text-black text-[14px]`,
                  fontFamily: Fonts.InterSemiBold,
                }}
              >
                Borrow
              </Text>
              <Image source={require("/assets/sol.svg")} style={tw`w-5 h-5 mx-[4px]`} />
              <Text
                style={{
                  ...tw`text-black text-[14px]`,
                  fontFamily: Fonts.InterSemiBold,
                }}
              >
                772.3
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
