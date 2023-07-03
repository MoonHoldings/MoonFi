import { Modal, View, Image, TouchableOpacity, Text, Linking, ActivityIndicator } from 'react-native'
import tw from 'twrnc'
import { Header, Screen } from '../components'
import { LAMPORTS_PER_SOL, PublicKey, TransactionSignature } from '@solana/web3.js'
import { createSharkyClient } from '@sharkyfi/client'
import createAnchorProvider from '../utils/createAnchorProvider'
import waitTransactionConfirmation from '../utils/waitTransactionConfirmation'
import { useEffect, useState } from 'react'
import { useMutation } from '@apollo/client'
import Fonts from '../utils/Fonts'
import { DELETE_LOAN_BY_PUBKEY } from '../utils/mutations'
import breakdownLoanDuration from '../utils/breakdownLoanDuration'

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

  const { days, hours, minutes } = breakdownLoanDuration(loan?.start, loan?.duration)
  const defaultImage = 'https://sharky.fi/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FMoonHolders.10dd0302.jpg&w=128&q=75'

  return (
    <Modal animationType="fade" visible={visible} onRequestClose={onClose}>
      <HeaderBar />
      <Screen style={tw`flex bg-black p-[16px]`}>
        <View style={tw`flex w-full bg-[${isSuccess ? '#022628' : '#1F2126'}] rounded-md p-[16px]`}>
          <View style={{ zIndex: 999 }}>{renderCloseButton()}</View>
          <View style={tw`flex justify-center items-center`}>
            <Image source={{ uri: loan?.orderBook?.nftList?.collectionImage ?? defaultImage }} style={tw`w-15 h-15 rounded-full`} />
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
