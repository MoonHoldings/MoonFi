import { useEffect, useState } from 'react'
import { Modal, View, Image, TouchableOpacity, Text, ScrollView, ActivityIndicator, Linking } from 'react-native'
import tw from 'twrnc'
import { Header, Screen } from '../components'
import Fonts from '../utils/Fonts'
import calculateBorrowInterest from '../utils/calculateBorrowInterest'
import { LAMPORTS_PER_SOL, PublicKey, TransactionSignature } from '@solana/web3.js'
import breakdownLoanDuration from '../utils/breakdownLoanDuration'
import { useLazyQuery, useMutation } from '@apollo/client'
import { GET_BEST_OFFER_FOR_EXTEND } from '../utils/queries'
import sharkyClient from '../utils/sharkyClient'
import waitTransactionConfirmation from '../utils/waitTransactionConfirmation'
import { BORROW_LOAN, DELETE_LOAN_BY_PUBKEY } from '../utils/mutations'

const HeaderBar = () => {
  return (
    <View style={tw`w-full bg-[#1F2126] h-[64px]`}>
      <Header />
    </View>
  )
}

const defaultImage = 'https://sharky.fi/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FMoonHolders.10dd0302.jpg&w=128&q=75'

export const ExtendModal = ({ visible, onClose, loan }: { visible: boolean; onClose?: any; loan?: any }) => {
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [failMessage, setFailMessage] = useState<string | null>(null)
  const [txLink, setTxLink] = useState<string | null>(null)

  const [deleteLoanByPubKey] = useMutation(DELETE_LOAN_BY_PUBKEY)
  const [borrowLoan] = useMutation(BORROW_LOAN)

  const [getBestOffer, { data, loading, stopPolling }] = useLazyQuery(GET_BEST_OFFER_FOR_EXTEND, {
    fetchPolicy: 'no-cache',
  })
  const bestOffer = data?.getLoans?.data[0]

  const renderCloseButton = () => {
    return (
      <TouchableOpacity onPress={onClose}>
        <Image source={require('/assets/icon-x-square.svg')} style={{ ...tw`h-6 w-6 absolute top-0 right-0 z-50` }} />
      </TouchableOpacity>
    )
  }

  useEffect(() => {
    if (visible) {
      fetchBestLoan()
    }

    if (!visible) {
      stopPolling()
    }
  }, [visible])

  const fetchBestLoan = async () => {
    // Fetch best loan
    const {
      data: {
        getLoans: { data },
      },
    } = await getBestOffer({
      variables: {
        args: {
          pagination: {
            limit: 1,
            offset: 0,
          },
          filter: {
            type: 'offered',
            orderBookId: parseInt(loan?.orderBook?.id),
          },
          sort: {
            order: 'DESC',
            type: 'amount',
          },
        },
      },
      pollInterval: 1000,
    })

    return data
  }

  const onSuccess = async (tx: TransactionSignature, oldPubKey: string, newLoan: any) => {
    // Call delete loan
    try {
      await deleteLoanByPubKey({ variables: { pubKey: oldPubKey } })
    } catch (error) {
      console.log(error)
    }

    try {
      await borrowLoan({ variables: { borrowedLoan: newLoan } })
    } catch (error) {
      console.log(error)
    }

    setIsSuccess(true)
    setTxLink(`https://solana.fm/tx/${tx}?cluster=mainnet-qn1`)
  }

  const extendLoan = async () => {
    try {
      setIsSuccess(false)
      setIsSubmitting(true)
      setFailMessage(null)

      const { program } = sharkyClient

      // Fetch best loan
      const data = await fetchBestLoan()

      if (data && data.length) {
        const bestOffer = data[0]
        const offeredLoan = await sharkyClient.fetchLoan({
          program,
          loanPubKey: new PublicKey(bestOffer.pubKey),
        })

        if (!offeredLoan) {
          setFailMessage(`No loan found with pubkey ${bestOffer.pubKey}`)
          return
        }
        if (!('offered' in offeredLoan)) {
          setFailMessage('Loan is already taken.')
          return
        }

        const currentLoan = await sharkyClient.fetchLoan({
          program,
          loanPubKey: new PublicKey(loan?.pubKey),
        })

        if (!currentLoan) {
          setFailMessage(`No loan found with pubkey ${loan.pubKey}`)
          return
        }
        if (!('taken' in currentLoan)) {
          setFailMessage('Loan is not in taken state')
          return
        }

        const sharkyOffer = offeredLoan.offered
        const sharkyLoan = currentLoan.taken
        const { orderBook } = await sharkyClient.fetchOrderBook({
          program,
          orderBookPubKey: sharkyOffer.data.orderBook,
        })

        if (orderBook) {
          const { takenLoan, sig } = await sharkyLoan.extend({ program, orderBook, newLoan: sharkyOffer })

          const loanToBorrow = {
            pubKey: takenLoan.pubKey.toBase58(),
            nftCollateralMint: takenLoan.data.loanState.taken?.taken.nftCollateralMint.toBase58(),
            lenderNoteMint: takenLoan.data.loanState.taken?.taken.lenderNoteMint.toBase58(),
            borrowerNoteMint: takenLoan.data.loanState.taken?.taken.borrowerNoteMint.toBase58(),
            apy: takenLoan.data.loanState.taken?.taken.apy.fixed?.apy,
            start: takenLoan.data.loanState.taken?.taken.terms.time?.start?.toNumber(),
            totalOwedLamports: takenLoan.data.loanState.taken?.taken.terms.time?.totalOwedLamports?.toNumber(),
          }

          await waitTransactionConfirmation(
            sig,
            () => onSuccess(sig, sharkyLoan.pubKey.toBase58(), loanToBorrow),
            () => console.log('fail')
          )
        }

        setIsSubmitting(false)
      }
    } catch (error) {
      console.log(error)
      setIsSubmitting(false)
    }
  }

  const { days, hours, minutes } = breakdownLoanDuration(loan?.start, loan?.duration)
  const bestOfferInterest = calculateBorrowInterest(bestOffer?.principalLamports / LAMPORTS_PER_SOL, bestOffer?.duration, bestOffer?.orderBook?.apy) * LAMPORTS_PER_SOL
  const principalLamportsInterestLamports = loan?.principalLamports + bestOfferInterest
  const principalLamportsInterest = principalLamportsInterestLamports / LAMPORTS_PER_SOL
  const difference = bestOffer?.principalLamports ? (bestOffer?.principalLamports - principalLamportsInterestLamports) / LAMPORTS_PER_SOL : 0
  const principalLamports = (loan?.principalLamports / LAMPORTS_PER_SOL).toFixed(4)
  const newPrincipalLamports = bestOffer?.principalLamports ? (bestOffer?.principalLamports / LAMPORTS_PER_SOL)?.toFixed(4) : 0
  const newDuration = `${bestOffer?.duration / 86400}d`

  return (
    <Modal animationType="fade" visible={visible}>
      <HeaderBar />
      <Screen style={tw`flex bg-black p-[16px]`}>
        <ScrollView style={tw`flex flex-1 bg-[${isSuccess ? '#022628' : '#1F2126'}] rounded-md p-[16px]`} showsVerticalScrollIndicator={false}>
          <View style={{ zIndex: 999 }}>{renderCloseButton()}</View>
          <View style={tw`flex justify-center items-center`}>
            <Image source={{ uri: loan?.orderBook?.nftList?.collectionImage ?? defaultImage }} style={tw`w-15 h-15 rounded-full`} />
            <Text
              style={{
                ...tw`text-white text-[20px] mt-1`,
                fontFamily: Fonts.PoppinsBold,
              }}
            >
              {isSuccess ? 'SUCCESS!' : loan?.orderBook?.nftList?.collectionName}
            </Text>
          </View>
          <View style={tw`flex w-full flex-row mt-4`}>
            <View style={tw`flex flex-1 justify-center items-center`}>
              <Text style={{ fontFamily: Fonts.InterSemiBold, color: 'rgba(255, 255, 255, 0.50)' }}>Current</Text>
            </View>
            <View style={tw`flex flex-1 flex-row justify-center items-center`}>
              <Text style={{ fontFamily: Fonts.InterSemiBold, color: 'white' }}>New Loan</Text>
              {loading && <ActivityIndicator color="white" size={18} style={tw`ml-1`} />}
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
              <Text style={{ fontFamily: Fonts.InterSemiBold, color: 'rgba(255, 255, 255, 0.50)', fontSize: 16 }}>{principalLamports}</Text>
            </View>
            <View style={tw`flex flex-1 flex-row justify-center items-center`}>
              <Image source={require('/assets/sol.svg')} style={tw`w-4 h-4 mr-[4px]`} />
              {loading ? <ActivityIndicator color="white" size={16} /> : <Text style={{ fontFamily: Fonts.InterSemiBold, color: 'white', fontSize: 16 }}>{newPrincipalLamports}</Text>}
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
              <Text style={{ fontFamily: Fonts.InterSemiBold, color: 'rgba(255, 255, 255, 0.50)', fontSize: 16 }}>
                {((loan?.totalOwedLamports - loan?.principalLamports) / LAMPORTS_PER_SOL).toFixed(4)}
              </Text>
            </View>
            <View style={tw`flex flex-1 flex-row justify-center items-center`}>
              <Image source={require('/assets/sol.svg')} style={tw`w-4 h-4 mr-[4px]`} />
              {loading ? (
                <ActivityIndicator color="white" size={16} />
              ) : (
                <Text style={{ fontFamily: Fonts.InterSemiBold, color: 'white', fontSize: 16 }}>{(bestOfferInterest / LAMPORTS_PER_SOL).toFixed(4)}</Text>
              )}
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
              <Text style={{ fontFamily: Fonts.InterSemiBold, color: 'rgba(255, 255, 255, 0.50)', fontSize: 16 }}>
                {days > 0 && `${days}d`} {hours > 0 && `${hours}h`} {minutes > 0 && `${minutes}m`}
              </Text>
            </View>
            <View style={tw`flex flex-1 flex-row justify-center items-center`}>
              {loading ? <ActivityIndicator color="white" size={16} /> : <Text style={{ fontFamily: Fonts.InterSemiBold, color: 'white', fontSize: 16 }}>{newDuration}</Text>}
            </View>
          </View>
          <View style={tw`w-full h-[1px] bg-[#ffffff1a] my-3`} />
          <View style={tw`flex w-full justify-center items-center`}>
            <Text style={{ color: 'rgba(255, 255, 255, 0.50)', fontFamily: Fonts.InterSemiBold, fontSize: 12 }}>
              Difference ({newPrincipalLamports} - {principalLamportsInterest.toFixed(4)})
            </Text>
          </View>
          <View style={tw`flex flex-1 flex-row justify-center items-center mt-1`}>
            <Image source={require('/assets/sol.svg')} style={tw`w-4 h-4 mr-[4px]`} />
            <Text style={{ fontFamily: Fonts.InterSemiBold, color: 'white', fontSize: 16 }}>{difference.toFixed(4)}</Text>
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
            <Text style={{ fontFamily: Fonts.InterSemiBold, color: 'white', fontSize: 12 }}>{Math.abs(difference).toFixed(4)}</Text>
          </View>
          <View style={tw`flex w-full justify-center items-center mt-3`}>
            <TouchableOpacity
              style={tw`flex flex-row justify-center border border-2 border-[#63ECD2] rounded-md items-center py-3 w-full bg-[#63ECD2]`}
              onPress={extendLoan}
              disabled={loading || isSubmitting}
            >
              <Text
                style={{
                  ...tw`text-black text-[14px] flex flex-row justify-center items-center`,
                  fontFamily: Fonts.InterSemiBold,
                }}
              >
                Extend by {loading || isSubmitting ? <ActivityIndicator color="black" size={16} /> : newDuration}
              </Text>
            </TouchableOpacity>
            {txLink && (
              <View style={tw`flex w-full justify-center items-center mt-1`}>
                <Text style={{ ...tw`mt-2 text-[11px] text-white underline`, fontFamily: Fonts.InterRegular }} onPress={() => Linking.openURL(txLink as string)}>
                  View your last transaction on Solana FM
                </Text>
              </View>
            )}
            {failMessage && (
              <View style={tw`flex w-full justify-center items-center mt-1`}>
                <Text style={{ ...tw`mt-2 text-[11px] text-[#FB6962]`, fontFamily: Fonts.InterRegular }}>{failMessage}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </Screen>
    </Modal>
  )
}
