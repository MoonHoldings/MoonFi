import { View, TouchableOpacity, Text, Image } from 'react-native'
import { addSeconds, differenceInSeconds } from 'date-fns'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import tw from 'twrnc'

import Fonts from '../utils/Fonts'
import toCurrencyFormat from '../utils/toCurrencyFormat'

export const LoanRow = ({ loan, onRepay }: { loan: any; onRepay: any }) => {
  const defaultImage = 'https://sharky.fi/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FMoonHolders.10dd0302.jpg&w=128&q=75'

  const getRemainingDays = (loan: any) => {
    const startTime = new Date(loan.start * 1000)
    const duration = loan.duration
    const endTime = addSeconds(startTime, duration)

    const remainingSeconds = differenceInSeconds(endTime, new Date())
    const remainingDays = remainingSeconds / 86400

    return Math.floor(remainingDays)
  }

  return (
    <View style={tw`flex flex-row justify-between items-center py-3 border-b border-[#ffffff33] px-3`}>
      <View style={tw`flex flex-1 justify-center`}>
        <Image source={{ uri: loan?.orderBook?.nftList?.collectionImage ?? defaultImage }} style={tw`w-8 h-8`} />
      </View>
      <View style={tw`flex flex-1 justify-center`}>
        <Text style={{ ...tw`text-[11px] text-[#63ECD2] text-center`, fontFamily: Fonts.PoppinsLight }}>{(loan?.totalOwedLamports / LAMPORTS_PER_SOL).toFixed(4)}</Text>
      </View>
      <View style={tw`flex flex-1 justify-center`}>
        <Text style={{ ...tw`text-[11px] text-[#50AC3C] text-center`, fontFamily: Fonts.PoppinsLight }}>{getRemainingDays(loan)}d Left</Text>
      </View>
      <View style={tw`flex min-w-[15%] justify-center ml-4`}>
        <TouchableOpacity style={tw`border border-2 border-[#63ECD2] rounded-lg items-center py-[8px] px-4 w-auto`} onPress={onRepay}>
          <Text
            style={{
              ...tw`text-[#63ECD2] text-[12px]`,
              fontFamily: Fonts.InterRegular,
            }}
          >
            Repay
          </Text>
        </TouchableOpacity>
      </View>
      <View style={tw`flex min-w-[15%] justify-center ml-2`}>
        <TouchableOpacity style={{ ...tw`border border-2 border-[#63ECD2] rounded-lg items-center py-[8px] px-4 w-auto`, opacity: 0.5 }} onPress={() => console.log('asd')} disabled={true}>
          <Text
            style={{
              ...tw`text-[#63ECD2] text-[12px]`,
              fontFamily: Fonts.InterRegular,
            }}
          >
            Extend
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
