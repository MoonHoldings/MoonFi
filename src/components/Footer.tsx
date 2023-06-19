import { View, TouchableOpacity, Text } from 'react-native'
import Fonts from '../utils/Fonts'
import tw from 'twrnc'

export const Footer = ({ navigation, activeScreen }: any) => {
  return (
    <View style={tw`flex flex-row items-center justify-around w-full mt-4`}>
      <View style={tw`flex flex-col items-center justify-center w-[45%]`}>
        <TouchableOpacity
          disabled={activeScreen === 'Lend'}
          style={tw`border border-2 border-[#63ECD2] rounded-md w-full items-center py-2 ${activeScreen === 'Lend' ? 'bg-[#63ECD2]' : ''}`}
          onPress={() => navigation.navigate('Lend')}
        >
          <Text
            style={{
              ...tw`${activeScreen === 'Lend' ? 'text-black' : 'text-[#63ECD2]'} text-[14px]`,
              fontFamily: Fonts.InterSemiBold,
            }}
          >
            Lend
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`border border-2 border-[#63ECD2] rounded-md w-full items-center py-2 mt-4 ${activeScreen === 'Borrow' ? 'bg-[#63ECD2]' : ''}`}
          onPress={() => navigation.navigate('Borrow')}
        >
          <Text
            style={{
              ...tw`${activeScreen === 'Borrow' ? 'text-black' : 'text-[#63ECD2]'} text-[14px]`,
              fontFamily: Fonts.InterSemiBold,
            }}
          >
            Borrow
          </Text>
        </TouchableOpacity>
      </View>
      <View style={tw`flex flex-col items-center justify-center w-[45%]`}>
        <TouchableOpacity
          style={tw`border border-2 border-[#63ECD2] rounded-md w-full items-center py-2 ${activeScreen === 'Offers' ? 'bg-[#63ECD2]' : ''}`}
          onPress={() => navigation.navigate('Offers')}
        >
          <Text
            style={{
              ...tw`${activeScreen === 'Offers' ? 'text-black' : 'text-[#63ECD2]'} text-[14px]`,
              fontFamily: Fonts.InterSemiBold,
            }}
          >
            Offers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`border border-2 border-[#63ECD2] rounded-md w-full items-center py-2 mt-4 ${activeScreen === 'Loans' ? 'bg-[#63ECD2]' : ''}`}
          onPress={() => navigation.navigate('Loans')}
        >
          <Text
            style={{
              ...tw`${activeScreen === 'Loans' ? 'text-black' : 'text-[#63ECD2]'} text-[14px]`,
              fontFamily: Fonts.InterSemiBold,
            }}
          >
            Loans
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
