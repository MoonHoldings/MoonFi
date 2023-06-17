import { Modal, View, Image, TouchableOpacity, Text } from 'react-native'
import tw from 'twrnc'
import { Header, Screen } from '../components'
import Fonts from '../utils/Fonts'

const HeaderBar = () => {
  return (
    <View style={tw`w-full bg-[#1F2126] h-[64px]`}>
      <Header />
    </View>
  )
}

export const ViewLoanModal = ({ visible, onClose }: { visible: boolean; onClose?: any }) => {
  const renderCloseButton = () => {
    return (
      <TouchableOpacity onPress={onClose}>
        <Image source={require('/assets/icon-x-square.svg')} style={{ ...tw`h-6 w-6 absolute top-0 right-0 z-50` }} />
      </TouchableOpacity>
    )
  }

  return (
    <Modal animationType="fade" visible={visible} onRequestClose={onClose}>
      <HeaderBar />
      <Screen style={tw`flex bg-black p-[16px]`}>
        <View style={tw`flex w-full bg-[#1F2126] rounded-md p-[16px]`}>
          <View style={{ zIndex: 999 }}>{renderCloseButton()}</View>
          <View style={tw`flex justify-center items-center`}>
            <Image source={{ uri: 'https://sharky.fi/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fsharx.05c4d190.png&w=128&q=75' }} style={tw`w-15 h-15 rounded-full`} />
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
              <Image source={require('/assets/sol.svg')} style={tw`w-4 h-4 mr-[4px]`} />
              <Text style={{ ...tw`text-white text-[16px]`, fontFamily: Fonts.PoppinsRegular }}>5.40</Text>
            </View>
          </View>
          <View style={tw`w-full h-[1px] bg-[#ffffff1a] my-3`} />
          <View style={tw`flex flex-row w-full items-center justify-between`}>
            <Text style={{ ...tw`text-white text-[11px]`, fontFamily: Fonts.InterSemiBold }}>Status</Text>
            <View style={tw`flex flex-row items-center`}>
              <Text style={{ ...tw`text-white text-[16px]`, fontFamily: Fonts.InterSemiBold }}>Seeking Borrowers</Text>
            </View>
          </View>
          <View style={tw`flex flex-row w-full items-center justify-between mt-6`}>
            <Text style={{ ...tw`text-white text-[11px]`, fontFamily: Fonts.InterSemiBold }}>Offer Amount</Text>
            <View style={tw`flex flex-row items-center`}>
              <Image source={require('/assets/sol.svg')} style={tw`w-5 h-5 mx-[4px]`} />
              <Text style={{ ...tw`text-white text-[16px]`, fontFamily: Fonts.InterSemiBold }}>5.20</Text>
            </View>
          </View>
          <View style={tw`flex flex-row w-full items-center justify-between mt-6`}>
            <Text style={{ ...tw`text-white text-[11px]`, fontFamily: Fonts.InterSemiBold }}>Interest</Text>
            <View style={tw`flex flex-row items-center`}>
              <Image source={require('/assets/sol.svg')} style={tw`w-5 h-5 mx-[4px]`} />
              <Text style={{ ...tw`text-white text-[16px]`, fontFamily: Fonts.InterSemiBold }}>0.0025</Text>
            </View>
          </View>
        </View>
      </Screen>
    </Modal>
  )
}
