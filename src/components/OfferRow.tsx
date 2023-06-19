import { View, TouchableOpacity, Text, Image } from 'react-native'
import Fonts from '../utils/Fonts'
import tw from 'twrnc'
import toCurrencyFormat from '../utils/toCurrencyFormat'

export const OfferRow = ({ actionLabel, onActionPress, actionButtonColor, offer }: any) => {
  const getStatus = () => {
    if (offer?.isHistorical) {
      if (offer?.status === 'Active') {
        return `${offer?.remainingDays}d Left`
      } else {
        return `${offer?.status} ${offer.status === 'Repaid' ? offer.repayElapsedTime : offer.foreclosedElapsedTime}`
      }
    } else {
      return 'Seeking Borrower'
    }
  }

  return (
    <View style={tw`flex flex-row justify-between items-center py-3 border-b border-[#ffffff33] px-3`}>
      <View style={tw`flex flex-1 justify-center`}>
        <Image source={{ uri: offer?.collectionImage }} style={tw`w-8 h-8`} />
      </View>
      <View style={tw`flex flex-1 justify-center`}>
        <Text style={{ ...tw`text-[11px] text-white text-center`, fontFamily: Fonts.PoppinsLight }}>{toCurrencyFormat(offer?.amountOffered)}</Text>
      </View>
      <View style={tw`flex flex-1 justify-center`}>
        <Text
          style={{
            ...tw`text-[11px] text-[#63ECD2] text-center`,
            fontFamily: Fonts.PoppinsLight,
          }}
        >
          {offer?.offerInterest}
        </Text>
      </View>
      <View style={tw`flex flex-1 justify-center`}>
        <Text style={{ ...tw`text-[11px] text-[#50AC3C] text-center`, fontFamily: Fonts.PoppinsLight }}>{offer?.apy}%</Text>
      </View>
      <View style={tw`flex flex-1 justify-center`}>
        <Text style={{ ...tw`text-[11px] text-white text-center`, fontFamily: Fonts.PoppinsLight }}>{getStatus()}</Text>
      </View>
      <View style={tw`flex min-w-[15%] w-[61px] justify-center ml-2`}>
        <TouchableOpacity style={tw`border border-2 border-[${actionButtonColor ?? '#63ECD2'}] rounded-lg items-center py-[8px] px-2 w-auto`} onPress={onActionPress}>
          <Text
            style={{
              ...tw`text-[${actionButtonColor ?? '#63ECD2'}] text-[12px]`,
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
