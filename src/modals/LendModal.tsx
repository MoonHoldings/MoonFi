import { useEffect, useState } from 'react'
import { Modal, View, Image, TouchableOpacity, Text, TextInput, Platform, ScrollView, ActivityIndicator, Linking } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import tw from 'twrnc'
import { createSharkyClient } from '@sharkyfi/client'
import { LAMPORTS_PER_SOL, PublicKey, TransactionSignature } from '@solana/web3.js'
import { AnchorProvider } from '@coral-xyz/anchor'

import { Header, Screen } from '../components'
import Fonts from '../utils/Fonts'
import toCurrencyFormat from '../utils/toCurrencyFormat'
import calculateLendInterest from '../utils/calculateLendInterest'
import { usePublicKeys } from '../hooks/xnft-hooks'
import createAnchorProvider, { connection } from '../utils/createAnchorProvider'
import waitTransactionConfirmation from '../utils/waitTransactionConfirmation'
import { useMutation } from '@apollo/client'
import { CREATE_LOANS } from '../utils/mutations'

const MAX_OFFERS = 4

const HeaderBar = () => {
  return (
    <View style={tw`w-full bg-[#1F2126] h-[64px]`}>
      <Header />
    </View>
  )
}

export const LendModal = ({ visible, onClose, orderBook }: { visible: boolean; onClose?: any; orderBook: any }) => {
  const [offerCount, setOfferCount] = useState(1)
  const [balance, setBalance] = useState<number | null>(null)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [txLink, setTxLink] = useState<string | null>(null)
  const [failMessage, setFailMessage] = useState<string | null>(null)

  const [createLoans] = useMutation(CREATE_LOANS)

  const publicKeys = usePublicKeys()

  const methods = useForm({
    defaultValues: {
      offerAmount: '',
    },
    mode: 'onBlur',
  })

  const {
    formState: { errors, isSubmitting },
    control,
    handleSubmit,
    watch,
    reset,
  } = methods

  const floorPriceSol = orderBook?.floorPriceSol
  const defaultImage = 'https://sharky.fi/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FMoonHolders.10dd0302.jpg&w=128&q=75'

  useEffect(() => {
    if (publicKeys?.solana && visible) {
      getBalance()
    }

    if (!visible) {
      setOfferCount(1)
      setTxLink(null)
      setIsSuccess(false)
      setFailMessage(null)
      reset()
    }
  }, [publicKeys, visible])

  const getBalance = async () => {
    if (!publicKeys?.solana) return

    try {
      const balance = await connection.getBalance(new PublicKey(publicKeys?.solana))

      setBalance(balance / LAMPORTS_PER_SOL)
    } catch (error) {
      console.log(error)
    }
  }

  const renderCloseButton = () => {
    return (
      <TouchableOpacity onPress={onClose}>
        <Image source={require('/assets/icon-x-square.svg')} style={{ ...tw`h-6 w-6 absolute top-0 right-0 z-50` }} />
      </TouchableOpacity>
    )
  }

  const renderOfferCountSelector = () => {
    const selectors = []

    for (let x = 1; x <= MAX_OFFERS; x++) {
      selectors.push(
        <TouchableOpacity
          key={x}
          style={tw`w-10 h-10 ml-2 flex justify-center items-center rounded-md border ${offerCount === x ? 'border-[#61D9EB]' : 'border-[#747E92]'}`}
          onPress={() => {
            if (isSuccess) setIsSuccess(false)

            setOfferCount(x)
          }}
        >
          <Text
            style={{
              ...tw`${offerCount === x ? 'text-[#61D9EB]' : 'text-[#747E92]'}  text-[16px]`,
              fontFamily: Fonts.InterSemiBold,
            }}
          >
            {x}
          </Text>
        </TouchableOpacity>
      )
    }

    return selectors
  }

  const onSuccess = async (tx: TransactionSignature, loans: any[]) => {
    try {
      await createLoans({
        variables: { loans },
      })
    } catch (error) {
      console.log(error)
    }

    getBalance()
    setIsSuccess(true)
    setTxLink(`https://solana.fm/tx/${tx}?cluster=mainnet-qn1`)
  }

  const onSubmit = async (data: any) => {
    if (data?.offerAmount) {
      setIsSuccess(false)
      setTxLink(null)

      const provider = createAnchorProvider()

      try {
        const sharkyClient = createSharkyClient(provider as AnchorProvider)
        const { program } = sharkyClient

        const { orderBook: orderBookInfo } = await sharkyClient.fetchOrderBook({
          program,
          orderBookPubKey: new PublicKey(orderBook.pubKey),
        })

        if (orderBookInfo) {
          const { sig, offeredLoans } = await orderBookInfo.offerLoan({
            program,
            principalLamports: parseFloat(data?.offerAmount) * LAMPORTS_PER_SOL,
            onTransactionUpdate: console.dir,
            count: offerCount,
          })

          const loansToCreate = offeredLoans.map((loan) => ({
            pubKey: loan.pubKey.toBase58(),
            version: loan.data.version,
            principalLamports: loan.data.principalLamports.toNumber(),
            valueTokenMint: loan.data.valueTokenMint.toBase58(),
            supportsFreezingCollateral: loan.supportsFreezingCollateral,
            isCollateralFrozen: loan.isCollateralFrozen,
            isHistorical: loan.isHistorical,
            isForeclosable: loan.isForeclosable(),
            state: loan.state,
            duration: loan.data.loanState?.offer?.offer.termsSpec.time?.duration?.toNumber(),
            lenderWallet: loan.data.loanState.offer?.offer.lenderWallet.toBase58(),
            offerTime: loan.data.loanState.offer?.offer.offerTime?.toNumber(),
            orderBook: loan.data.orderBook.toBase58(),
          }))

          await waitTransactionConfirmation(
            sig,
            () => onSuccess(sig, loansToCreate),
            () => setFailMessage('Transaction failed')
          )
        }
      } catch (error) {
        console.log(error)
      }
    }
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
              {isSuccess ? 'SUCCESS!' : orderBook?.collectionName}
            </Text>
          </View>
          <View style={tw`flex flex-row w-full mt-2`}>
            <View style={tw`flex flex-1 items-start`}>
              <Text
                style={{
                  ...tw`text-white text-[11px]`,
                  fontFamily: Fonts.InterSemiBold,
                }}
              >
                APY%
              </Text>
            </View>
            <View style={tw`flex flex-1 items-center`}>
              <Text
                style={{
                  ...tw`text-white text-[11px]`,
                  fontFamily: Fonts.InterSemiBold,
                }}
              >
                Duration
              </Text>
            </View>
            <View style={tw`flex flex-1 items-end`}>
              <Text
                style={{
                  ...tw`text-white text-[11px]`,
                  fontFamily: Fonts.InterSemiBold,
                }}
              >
                Floor
              </Text>
            </View>
          </View>
          <View style={tw`flex flex-row w-full mt-1`}>
            <View style={tw`flex flex-1 items-start`}>
              <Text
                style={{
                  ...tw`text-[#50AC3C] text-[16px]`,
                  fontFamily: Fonts.PoppinsRegular,
                }}
              >
                {orderBook?.apyAfterFee}%
              </Text>
            </View>
            <View style={tw`flex flex-1 items-center`}>
              <Text
                style={{
                  ...tw`text-white text-[16px]`,
                  fontFamily: Fonts.PoppinsRegular,
                }}
              >
                {orderBook?.duration / 86400}d
              </Text>
            </View>
            <View style={tw`flex flex-row flex-1 justify-end items-center`}>
              <Image source={require('/assets/sol.svg')} style={tw`w-4 h-4 mr-[4px]`} />
              <Text
                style={{
                  ...tw`text-white text-[16px]`,
                  fontFamily: Fonts.PoppinsRegular,
                }}
              >
                {floorPriceSol ? toCurrencyFormat(floorPriceSol) : 'No Data'}
              </Text>
            </View>
          </View>
          <View style={tw`w-full h-[1px] bg-[#ffffff1a] my-3`} />
          <View style={tw`flex flex-row w-full justify-between mt-1 mb-2`}>
            <View style={tw`flex w-[47%]`}>
              <Text
                style={{
                  ...tw`text-white text-[11px]`,
                  fontFamily: Fonts.InterSemiBold,
                }}
              >
                Offer Amount
              </Text>
              <View style={tw`flex items-center px-3 flex-row rounded-lg bg-[#0C0D0F] w-full mt-2`}>
                <Image source={require('/assets/sol.svg')} style={tw`w-4 h-4 mr-[8px]`} />
                <Controller
                  control={control}
                  rules={{
                    required: {
                      value: true,
                      message: 'Offer amount is required.',
                    },
                    min: {
                      value: 0.01,
                      message: 'Please input an offer amount not less than 0.01.',
                    },
                    max: {
                      value: (balance as any) / offerCount,
                      message: `Not enough balance.`,
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={{
                        ...tw`rounded-lg w-full items-center text-white h-full text-[13px] py-[15px] bg-[#0C0D0F]`,
                        ...Platform.select({ web: { outline: 'none' } }),
                        fontFamily: Fonts.InterSemiBold,
                      }}
                      onBlur={onBlur}
                      onChangeText={(text) => {
                        const VALID_INPUT_FORMAT = /^(\d*(\.(\d{1,2})?)?)$/

                        if (text === '.') {
                          onChange('0.')
                        } else if (VALID_INPUT_FORMAT.test(text)) {
                          if (parseFloat(text) < 999999 || text === '') {
                            onChange(text)
                          }
                        }
                      }}
                      onFocus={() => {
                        if (isSuccess) setIsSuccess(false)
                      }}
                      value={value}
                    />
                  )}
                  name="offerAmount"
                />
              </View>
            </View>
            <View style={tw`flex w-[47%]`}>
              <Text
                style={{
                  ...tw`text-white text-[11px]`,
                  fontFamily: Fonts.InterSemiBold,
                }}
              >
                Total Interest
              </Text>
              <View style={tw`flex items-center px-3 flex-row rounded-lg bg-[#0C0D0F] w-full mt-2`}>
                <Image source={require('/assets/sol.svg')} style={tw`w-4 h-4 mr-[8px]`} />
                <TextInput
                  editable={false}
                  style={{
                    ...tw`rounded-lg w-full items-center text-white h-full text-[13px] py-[15px] bg-[#0C0D0F]`,
                    ...Platform.select({ web: { outline: 'none' } }),
                    fontFamily: Fonts.InterSemiBold,
                  }}
                  value={calculateLendInterest(parseFloat(watch('offerAmount')), orderBook?.duration, orderBook?.apy, orderBook?.feePermillicentage) as any}
                />
              </View>
            </View>
          </View>
          {errors?.offerAmount?.message && <Text style={tw`mb-2 w-auto break-words text-[11.5px] text-red-500`}>{errors?.offerAmount?.message}</Text>}
          <View style={tw`flex flex-row w-full`}>
            <Text
              style={{
                ...tw`text-[#747E92] text-[11px]`,
                fontFamily: Fonts.InterRegular,
              }}
            >
              Best Offer:
            </Text>
            <Image source={require('/assets/sol.svg')} style={tw`w-3 h-3 mx-[4px]`} />
            <Text
              style={{
                ...tw`text-[#747E92] text-[11px]`,
                fontFamily: Fonts.InterRegular,
              }}
            >
              {toCurrencyFormat(orderBook?.bestOffer)}
            </Text>
          </View>
          <View style={tw`flex flex-row w-full justify-between items-center mt-3`}>
            <Text
              style={{
                ...tw`text-white text-[11px]`,
                fontFamily: Fonts.InterRegular,
              }}
            >
              Number of Offers
            </Text>
            <View style={tw`flex flex-row`}>{renderOfferCountSelector()}</View>
          </View>
          <View style={tw`w-full h-[1px] bg-[#ffffff1a] my-4`} />
          <View style={tw`flex flex-row w-full items-center justify-between`}>
            <Text
              style={{
                ...tw`text-white text-[11px]`,
                fontFamily: Fonts.InterSemiBold,
              }}
            >
              Total
            </Text>
            <View style={tw`flex flex-row items-center`}>
              <Image source={require('/assets/sol.svg')} style={tw`w-3 h-3 mx-[4px]`} />
              <Text
                style={{
                  ...tw`text-white text-[11px]`,
                  fontFamily: Fonts.InterSemiBold,
                }}
              >
                {toCurrencyFormat(parseFloat(watch('offerAmount')) * offerCount)}
              </Text>
            </View>
          </View>
          <View style={tw`flex flex-row w-full items-center justify-between mt-2`}>
            <Text
              style={{
                ...tw`text-[#747E92] text-[11px]`,
                fontFamily: Fonts.InterSemiBold,
              }}
            >
              Balance
            </Text>
            <View style={tw`flex flex-row items-center`}>
              <Image source={require('/assets/sol.svg')} style={tw`w-3 h-3 mx-[4px]`} />
              <Text
                style={{
                  ...tw`text-[#747E92] text-[11px]`,
                  fontFamily: Fonts.InterSemiBold,
                }}
              >
                {toCurrencyFormat(balance)}
              </Text>
            </View>
          </View>
          <View style={tw`flex w-full justify-center items-center mt-2`}>
            <TouchableOpacity style={tw`flex flex-row justify-center border border-2 border-[#63ECD2] rounded-md items-center py-3 px-8 bg-[#63ECD2]`} onPress={handleSubmit(onSubmit)}>
              <Text
                style={{
                  ...tw`text-black text-[14px]`,
                  fontFamily: Fonts.InterSemiBold,
                }}
              >
                Place Offer
              </Text>
              {isSubmitting && <ActivityIndicator color="black" size={18} style={tw`ml-2`} />}
            </TouchableOpacity>
          </View>
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
          <View style={tw`flex w-full justify-center items-center mt-3`}>
            <Text
              style={{
                ...tw`text-center text-[#747E92] text-[10px]`,
                fontFamily: Fonts.InterRegular,
              }}
            >
              Offers can be revoked at any time up until it is taken by a borrower.
            </Text>
          </View>
        </ScrollView>
      </Screen>
    </Modal>
  )
}
