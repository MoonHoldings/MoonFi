import { Modal, View, Image, TouchableOpacity, Text, Linking, ActivityIndicator } from 'react-native'
import tw from 'twrnc'
import { Header, Screen } from '../components'
import Fonts from '../utils/Fonts'
import { useState } from 'react'
import { createSharkyClient } from '@sharkyfi/client'
import { PublicKey, TransactionSignature } from '@solana/web3.js'
import createAnchorProvider from '../utils/createAnchorProvider'
import waitTransactionConfirmation from '../utils/waitTransactionConfirmation'
import { useMutation } from '@apollo/client'
import { DELETE_LOAN_BY_PUBKEY } from '../utils/mutations'

const HeaderBar = () => {
  return (
    <View style={tw`w-full bg-[#1F2126] h-[64px]`}>
      <Header />
    </View>
  )
}

export const RevokeModal = ({ visible, onClose, offer }: { visible: boolean; onClose?: any; offer: any }) => {
  if (!offer) return null

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [txLink, setTxLink] = useState<string | null>(null)
  const [failMessage, setFailMessage] = useState<string | null>(null)

  const [deleteLoanByPubKey] = useMutation(DELETE_LOAN_BY_PUBKEY)

  const renderCloseButton = () => {
    return (
      <TouchableOpacity onPress={onCloseModal}>
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

  const revokeOffer = async () => {
    try {
      setIsSubmitting(true)
      const provider = createAnchorProvider()
      const sharkyClient = createSharkyClient(provider)
      const { program } = sharkyClient

      const result = await sharkyClient.fetchLoan({
        program,
        loanPubKey: new PublicKey(offer?.pubKey),
      })

      if (!result) {
        setFailMessage('Loan not found')
        setIsSubmitting(false)
        return
      }

      if (!('offered' in result)) {
        setFailMessage('Loan is already taken, and cannot be revoked')
        setIsSubmitting(false)
        return
      }

      const loan = result.offered
      const { sig } = await loan.rescind({
        program,
        onTransactionUpdate: console.dir,
      })

      await waitTransactionConfirmation(
        sig,
        () => onSuccess(sig, loan.pubKey.toBase58()),
        () => setFailMessage('Transaction failed')
      )

      setIsSubmitting(false)
    } catch (error) {
      console.log(error)
      setIsSubmitting(false)
    }
  }

  const onCloseModal = () => {
    onClose()
    setIsSuccess(false)
    setFailMessage(null)
    setTxLink(null)
  }

  return (
    <Modal animationType="fade" visible={visible}>
      <HeaderBar />
      <Screen style={tw`flex bg-black p-[16px]`}>
        <View style={tw`flex w-full bg-[${isSuccess ? '#022628' : '#1F2126'}] rounded-md p-[16px]`}>
          <View style={{ zIndex: 999 }}>{renderCloseButton()}</View>
          <View style={tw`flex justify-center items-center`}>
            <Image source={{ uri: offer.collectionImage }} style={tw`w-15 h-15 rounded-full`} />
            <Text style={{ ...tw`text-white text-[20px] mt-1`, fontFamily: Fonts.PoppinsBold }}>{isSuccess ? 'SUCCESS!' : offer?.collectionName}</Text>
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
              <Text style={{ ...tw`text-[#50AC3C] text-[16px]`, fontFamily: Fonts.PoppinsRegular }}>{offer.apy}%</Text>
            </View>
            <View style={tw`flex flex-1 items-center`}>
              <Text style={{ ...tw`text-white text-[16px]`, fontFamily: Fonts.PoppinsRegular }}>{offer.duration}d</Text>
            </View>
            <View style={tw`flex flex-row flex-1 justify-end items-center`}>
              <Image source={require('/assets/sol.svg')} style={tw`w-4 h-4 mr-[4px]`} />
              <Text style={{ ...tw`text-white text-[16px]`, fontFamily: Fonts.PoppinsRegular }}>{offer.floorPriceSol}</Text>
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
              <Text style={{ ...tw`text-white text-[16px]`, fontFamily: Fonts.InterSemiBold }}>{offer.amountOffered}</Text>
            </View>
          </View>
          <View style={tw`flex flex-row w-full items-center justify-between mt-6`}>
            <Text style={{ ...tw`text-white text-[11px]`, fontFamily: Fonts.InterSemiBold }}>Interest</Text>
            <View style={tw`flex flex-row items-center`}>
              <Image source={require('/assets/sol.svg')} style={tw`w-5 h-5 mx-[4px]`} />
              <Text style={{ ...tw`text-white text-[16px]`, fontFamily: Fonts.InterSemiBold }}>{offer.offerInterest}</Text>
            </View>
          </View>
          <View style={tw`w-full h-[1px] bg-[#ffffff1a] my-3`} />
          <TouchableOpacity
            style={tw`flex flex-row justify-center border border-2 border-[#63ECD2] rounded-md items-center py-3 px-8 bg-[#63ECD2] w-full mt-2`}
            disabled={isSubmitting}
            onPress={isSuccess ? onCloseModal : revokeOffer}
          >
            <Text
              style={{
                ...tw`text-black text-[14px]`,
                fontFamily: Fonts.InterSemiBold,
              }}
            >
              {isSuccess ? 'Close' : 'Revoke Offer'}
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
