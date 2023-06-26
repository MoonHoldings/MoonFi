import { useState } from 'react'
import { Modal, View, Image, TouchableOpacity, Text, TextInput, Platform, ScrollView, ActivityIndicator, Linking } from 'react-native'
import { Controller } from 'react-hook-form'
import tw from 'twrnc'

import { Header, Screen } from '../components'
import Fonts from '../utils/Fonts'
import toCurrencyFormat from '../utils/toCurrencyFormat'
import calculateLendInterest from '../utils/calculateLendInterest'

const HeaderBar = () => {
  return (
    <View style={tw`w-full bg-[#1F2126] h-[64px]`}>
      <Header />
    </View>
  )
}

export const ExtendModal = ({ visible, onClose, orderBook }: { visible: boolean; onClose?: any; orderBook?: any }) => {
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  const defaultImage = 'https://sharky.fi/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FMoonHolders.10dd0302.jpg&w=128&q=75'

  const renderCloseButton = () => {
    return (
      <TouchableOpacity onPress={onClose}>
        <Image source={require('/assets/icon-x-square.svg')} style={{ ...tw`h-6 w-6 absolute top-0 right-0 z-50` }} />
      </TouchableOpacity>
    )
  }

  return (
    <Modal animationType="fade" visible={visible}>
      <HeaderBar />
      <Screen style={tw`flex bg-black p-[16px]`}>
        <ScrollView style={tw`flex flex-1 bg-[${isSuccess ? '#022628' : '#1F2126'}] rounded-md p-[16px]`} showsVerticalScrollIndicator={false}>
          <View style={{ zIndex: 999 }}>{renderCloseButton()}</View>
          <View style={tw`flex justify-center items-center`}>
            <Image source={{ uri: orderBook?.collectionImage ?? defaultImage }} style={tw`w-15 h-15 rounded-full`} />
            <Text
              style={{
                ...tw`text-white text-[20px] mt-1`,
                fontFamily: Fonts.PoppinsBold,
              }}
            >
              {isSuccess ? 'SUCCESS!' : 'sharx'}
            </Text>
          </View>
          <View style={tw`flex w-full flex-row mt-4`}>
            <View style={tw`flex flex-1 justify-center items-center`}>
              <Text style={{ fontFamily: Fonts.InterSemiBold, color: 'rgba(255, 255, 255, 0.50)' }}>Current</Text>
            </View>
            <View style={tw`flex flex-1 justify-center items-center`}>
              <Text style={{ fontFamily: Fonts.InterSemiBold, color: 'white' }}>New Loan</Text>
            </View>
          </View>
          <View style={tw`flex w-full flex-row mt-3`}>
            <View style={tw`flex flex-1 justify-center items-center`}>
              <Text style={{ fontFamily: Fonts.InterSemiBold, color: 'rgba(255, 255, 255, 0.50)', fontSize: 10 }}>Principal</Text>
            </View>
            <View style={tw`flex flex-1 justify-center items-center`}>
              <Text style={{ fontFamily: Fonts.InterSemiBold, color: 'white', fontSize: 10 }}>Principal</Text>
            </View>
          </View>
          <View style={tw`flex w-full flex-row mb-1 mt-1`}>
            <View style={tw`flex flex-1 flex-row justify-center items-center`}>
              <Image source={require('/assets/sol.svg')} style={tw`w-4 h-4 mr-[4px]`} />
              <Text style={{ fontFamily: Fonts.InterSemiBold, color: 'rgba(255, 255, 255, 0.50)', fontSize: 16 }}>25.2</Text>
            </View>
            <View style={tw`flex flex-1 flex-row justify-center items-center`}>
              <Image source={require('/assets/sol.svg')} style={tw`w-4 h-4 mr-[4px]`} />
              <Text style={{ fontFamily: Fonts.InterSemiBold, color: 'white', fontSize: 16 }}>24.81</Text>
            </View>
          </View>
          <View style={tw`flex w-full flex-row mt-2`}>
            <View style={tw`flex flex-1 justify-center items-center`}>
              <Text style={{ fontFamily: Fonts.InterSemiBold, color: 'rgba(255, 255, 255, 0.50)', fontSize: 10 }}>Interest</Text>
            </View>
            <View style={tw`flex flex-1 justify-center items-center`}>
              <Text style={{ fontFamily: Fonts.InterSemiBold, color: 'white', fontSize: 10 }}>Interest</Text>
            </View>
          </View>
          <View style={tw`flex w-full flex-row mb-1 mt-1`}>
            <View style={tw`flex flex-1 flex-row justify-center items-center`}>
              <Image source={require('/assets/sol.svg')} style={tw`w-4 h-4 mr-[4px]`} />
              <Text style={{ fontFamily: Fonts.InterSemiBold, color: 'rgba(255, 255, 255, 0.50)', fontSize: 16 }}>1.283</Text>
            </View>
            <View style={tw`flex flex-1 flex-row justify-center items-center`}>
              <Image source={require('/assets/sol.svg')} style={tw`w-4 h-4 mr-[4px]`} />
              <Text style={{ fontFamily: Fonts.InterSemiBold, color: 'white', fontSize: 16 }}>1.263</Text>
            </View>
          </View>
          <View style={tw`flex w-full flex-row mt-2`}>
            <View style={tw`flex flex-1 justify-center items-center`}>
              <Text style={{ fontFamily: Fonts.InterSemiBold, color: 'rgba(255, 255, 255, 0.50)', fontSize: 10 }}>Remaining Time</Text>
            </View>
            <View style={tw`flex flex-1 justify-center items-center`}>
              <Text style={{ fontFamily: Fonts.InterSemiBold, color: 'white', fontSize: 10 }}>New Duration</Text>
            </View>
          </View>
          <View style={tw`flex w-full flex-row mb-1 mt-1`}>
            <View style={tw`flex flex-1 flex-row justify-center items-center`}>
              <Text style={{ fontFamily: Fonts.InterSemiBold, color: 'rgba(255, 255, 255, 0.50)', fontSize: 16 }}>13d 18h 11m</Text>
            </View>
            <View style={tw`flex flex-1 flex-row justify-center items-center`}>
              <Text style={{ fontFamily: Fonts.InterSemiBold, color: 'white', fontSize: 16 }}>16d</Text>
            </View>
          </View>
          <View style={tw`w-full h-[1px] bg-[#ffffff1a] my-3`} />
          <View style={tw`flex w-full justify-center items-center`}>
            <Text style={{ color: 'rgba(255, 255, 255, 0.50)', fontFamily: Fonts.InterSemiBold, fontSize: 12 }}>Difference (24.81 - 26.483)</Text>
          </View>
          <View style={tw`flex flex-1 flex-row justify-center items-center mt-1`}>
            <Image source={require('/assets/sol.svg')} style={tw`w-4 h-4 mr-[4px]`} />
            <Text style={{ fontFamily: Fonts.InterSemiBold, color: 'white', fontSize: 16 }}>-1.263</Text>
          </View>
          <View style={tw`flex justify-center items-center mt-1`}>
            <Text style={{ color: 'rgba(255, 255, 255, 0.50)', fontFamily: Fonts.InterRegular, fontSize: 12, textAlign: 'center', width: '85%' }}>
              New loan is <Text style={{ color: '#FB6962' }}>smaller</Text> than what you owe, which means you will need extra SOL to extend it
            </Text>
          </View>
          <View style={tw`w-full h-[1px] bg-[#ffffff1a] my-3`} />
          <View style={tw`flex w-full justify-center items-center`}>
            <Text style={{ color: 'rgba(255, 255, 255, 0.50)', fontFamily: Fonts.InterSemiBold, fontSize: 12 }}>Amount required to extend</Text>
          </View>
          <View style={tw`flex flex-1 flex-row justify-center items-center mt-1`}>
            <Image source={require('/assets/sol.svg')} style={tw`w-4 h-4 mr-[4px]`} />
            <Text style={{ fontFamily: Fonts.InterSemiBold, color: 'white', fontSize: 12 }}>1.263</Text>
          </View>
          <View style={tw`flex w-full justify-center items-center mt-3`}>
            <TouchableOpacity style={tw`flex flex-row justify-center border border-2 border-[#63ECD2] rounded-md items-center py-3 w-full bg-[#63ECD2]`} onPress={() => console.log('extend offer')}>
              <Text
                style={{
                  ...tw`text-black text-[14px]`,
                  fontFamily: Fonts.InterSemiBold,
                }}
              >
                Extend by 16d
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Screen>
    </Modal>
  )
}
