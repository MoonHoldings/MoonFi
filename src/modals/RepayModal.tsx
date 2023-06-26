import { Modal, View, Image, TouchableOpacity, Text, Linking, ActivityIndicator } from 'react-native'
import tw from 'twrnc'
import { Header, Screen } from '../components'
import Fonts from '../utils/Fonts'
import { LAMPORTS_PER_SOL, PublicKey, TransactionSignature } from '@solana/web3.js'
import { createSharkyClient } from '@sharkyfi/client'
import createAnchorProvider from '../utils/createAnchorProvider'
import waitTransactionConfirmation from '../utils/waitTransactionConfirmation'
import { useEffect, useState } from 'react'
import { useMutation } from '@apollo/client'
import { DELETE_LOAN_BY_PUBKEY } from '../utils/mutations'

const HeaderBar = () => {
  return (
    <View style={tw`w-full bg-[#1F2126] h-[64px]`}>
      <Header />
    </View>
  )
}

export const RepayModal = ({ visible, onClose, loan }: { visible: boolean; onClose?: any; loan: any }) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [failMessage, setFailMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [txLink, setTxLink] = useState<string | null>(null)

  const [deleteLoanByPubKey] = useMutation(DELETE_LOAN_BY_PUBKEY)

  useEffect(() => {
    if (!visible) {
      setTxLink(null)
      setIsSuccess(false)
      setFailMessage(null)
    }
  }, [visible])

  const renderCloseButton = () => {
    return (
      <TouchableOpacity onPress={onClose}>
        <Image source={require('/assets/icon-x-square.svg')} style={{ ...tw`h-6 w-6 absolute top-0 right-0 z-50` }} />
      </TouchableOpacity>
    )
  }

  const breakdownDuration = (start: number, duration: number) => {
    // Get the current date and time
    const startDate: any = new Date(start * 1000)
    const now: any = new Date()

    // Convert duration to milliseconds
    const durationMs = duration * 1000

    // Calculate the target date and time
    const target: any = new Date(startDate.getTime() + durationMs)

    // Calculate the difference in milliseconds
    const diffMs = target - now

    // Calculate the remaining days, hours, minutes, and seconds
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)

    // Return the breakdown as an object
    return {
      days,
      hours,
      minutes,
      seconds,
    }
  }

  const onSuccess = async (tx: TransactionSignature, pubKey: string) => {
    // Call delete loan
    try {
      await deleteLoanByPubKey({ variables: { pubKey } })
    } catch (error) {
      console.log(error)
    }

    setIsSuccess(true)
    setTxLink(`https://solana.fm/tx/${tx}?cluster=mainnet-qn1`)
  }

  const repay = async () => {
    try {
      setIsSubmitting(true)

      const provider = createAnchorProvider()
      const sharkyClient = createSharkyClient(provider, undefined, 'mainnet')
      const { program } = sharkyClient

      const result = await sharkyClient.fetchLoan({
        program,
        loanPubKey: new PublicKey(loan?.pubKey),
      })

      if (!result) {
        setFailMessage('Loan not found')
        setIsSubmitting(false)
        return
      }

      if (!('taken' in result)) {
        setFailMessage('Loan is not in taken state, so cannot be repaid')
        setIsSubmitting(false)
        return
      }

      const sharkyLoan = result.taken
      const { orderBook } = await sharkyClient.fetchOrderBook({
        program,
        orderBookPubKey: sharkyLoan.data.orderBook,
      })

      if (orderBook) {
        const { sig } = await sharkyLoan.repay({
          program,
          orderBook,
        })

        await waitTransactionConfirmation(
          sig,
          () => onSuccess(sig, sharkyLoan.pubKey.toBase58()),
          () => console.log('fail')
        )
      } else {
        setFailMessage('Order book not found.')
      }

      setIsSubmitting(false)
    } catch (error) {
      console.log(error)
      setIsSubmitting(false)
    }
  }

  const { days, hours, minutes } = breakdownDuration(loan?.start, loan?.duration)

  console.log(loan)

  return (
    <Modal animationType="fade" visible={visible} onRequestClose={onClose}>
      <HeaderBar />
      <Screen style={tw`flex bg-black p-[16px]`}>
        <View style={tw`flex w-full bg-[${isSuccess ? '#022628' : '#1F2126'}] rounded-md p-[16px]`}>
          <View style={{ zIndex: 999 }}>{renderCloseButton()}</View>
          <View style={tw`flex justify-center items-center`}>
            <Image source={{ uri: 'https://sharky.fi/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fsharx.05c4d190.png&w=128&q=75' }} style={tw`w-15 h-15 rounded-full`} />
            <Text style={{ ...tw`text-white text-[20px] mt-1`, fontFamily: Fonts.PoppinsBold }}>{isSuccess ? 'SUCCESS!' : loan?.orderBook?.nftList?.collectionName}</Text>
          </View>
          <View style={tw`flex flex-row w-full mt-3 justify-center`}>
            <Text style={{ ...tw`text-white text-[11px]`, fontFamily: Fonts.InterSemiBold }}>Repay Before</Text>
          </View>
          <View style={tw`flex flex-row w-full px-12 mt-3`}>
            <View style={tw`flex flex-1 items-center`}>
              <Text style={{ ...tw`text-white text-[11px]`, fontFamily: Fonts.InterSemiBold }}>Days</Text>
            </View>
            <View style={tw`flex flex-1 items-center`}>
              <Text style={{ ...tw`text-white text-[11px]`, fontFamily: Fonts.InterSemiBold }}>Hours</Text>
            </View>
            <View style={tw`flex flex-1 items-center`}>
              <Text style={{ ...tw`text-white text-[11px]`, fontFamily: Fonts.InterSemiBold }}>Minutes</Text>
            </View>
          </View>
          <View style={tw`flex flex-row w-full mt-1 px-12`}>
            <View style={tw`flex flex-1 items-center`}>
              <Text style={{ ...tw`text-white text-[16px]`, fontFamily: Fonts.PoppinsRegular }}>{days}</Text>
            </View>
            <View style={tw`flex flex-1 items-center`}>
              <Text style={{ ...tw`text-white text-[16px]`, fontFamily: Fonts.PoppinsRegular }}>{hours}</Text>
            </View>
            <View style={tw`flex flex-1 items-center`}>
              <Text style={{ ...tw`text-white text-[16px]`, fontFamily: Fonts.PoppinsRegular }}>{minutes}</Text>
            </View>
          </View>
          <View style={tw`w-full h-[1px] bg-[#ffffff1a] my-3`} />
          <View style={tw`flex flex-row w-full items-center justify-between`}>
            <Text style={{ ...tw`text-white text-[11px]`, fontFamily: Fonts.InterSemiBold }}>Principal</Text>
            <View style={tw`flex flex-row items-center`}>
              <Image source={require('/assets/sol.svg')} style={tw`w-5 h-5 mx-[4px]`} />
              <Text style={{ ...tw`text-white text-[16px]`, fontFamily: Fonts.InterSemiBold }}>{(loan?.principalLamports / LAMPORTS_PER_SOL).toFixed(4)}</Text>
            </View>
          </View>
          <View style={tw`flex flex-row w-full items-center justify-between mt-6`}>
            <Text style={{ ...tw`text-white text-[11px]`, fontFamily: Fonts.InterSemiBold }}>Interest</Text>
            <View style={tw`flex flex-row items-center`}>
              <Image source={require('/assets/sol.svg')} style={tw`w-5 h-5 mx-[4px]`} />
              <Text style={{ ...tw`text-white text-[16px]`, fontFamily: Fonts.InterSemiBold }}>{((loan?.totalOwedLamports - loan?.principalLamports) / LAMPORTS_PER_SOL).toFixed(4)}</Text>
            </View>
          </View>
          <View style={tw`flex flex-row w-full items-center justify-between mt-6`}>
            <Text style={{ ...tw`text-white text-[11px]`, fontFamily: Fonts.InterSemiBold }}>Amount Due</Text>
            <View style={tw`flex flex-row items-center`}>
              <Image source={require('/assets/sol.svg')} style={tw`w-5 h-5 mx-[4px]`} />
              <Text style={{ ...tw`text-white text-[16px]`, fontFamily: Fonts.InterSemiBold }}>{(loan?.totalOwedLamports / LAMPORTS_PER_SOL).toFixed(4)}</Text>
            </View>
          </View>
          <View style={tw`w-full h-[1px] bg-[#ffffff1a] my-3`} />
          <TouchableOpacity
            style={tw`flex flex-row justify-center border border-2 border-[#63ECD2] rounded-md items-center py-3 px-8 bg-[#63ECD2] w-full mt-2`}
            onPress={isSuccess ? onClose : repay}
            disabled={isSubmitting}
          >
            <Text
              style={{
                ...tw`text-black text-[14px]`,
                fontFamily: Fonts.InterSemiBold,
              }}
            >
              {isSuccess ? 'Close' : 'Repay'}
            </Text>
            {isSubmitting && <ActivityIndicator color="black" size={18} style={tw`ml-2`} />}
          </TouchableOpacity>
          {txLink && (
            <View style={tw`flex w-full justify-center items-center mt-2`}>
              <Text style={tw`mt-2 text-[11px] text-white underline`} onPress={() => Linking.openURL(txLink as string)}>
                View your last transaction on Solana FM
              </Text>
            </View>
          )}
          {failMessage && (
            <View style={tw`flex w-full justify-center items-center mt-2`}>
              <Text style={tw`mt-2 text-[11px] text-red-500`}>{failMessage}</Text>
            </View>
          )}
        </View>
      </Screen>
    </Modal>
  )
}
