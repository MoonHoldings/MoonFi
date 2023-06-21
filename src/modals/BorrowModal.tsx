import { Modal, View, Image, TouchableOpacity, Text, TextInput, Platform, ScrollView, ActivityIndicator, Linking } from 'react-native'
import tw from 'twrnc'
import { Header, Screen } from '../components'
import Fonts from '../utils/Fonts'
import toCurrencyFormat from '../utils/toCurrencyFormat'
import { useEffect, useState } from 'react'
import { useLazyQuery, useMutation } from '@apollo/client'
import { GET_BEST_OFFER_FOR_BORROW, MY_LOANS } from '../utils/queries'
import { LAMPORTS_PER_SOL, PublicKey, TransactionSignature } from '@solana/web3.js'
import calculateBorrowInterest from '../utils/calculateBorrowInterest'
import createAnchorProvider from '../utils/createAnchorProvider'
import { createSharkyClient } from '@sharkyfi/client'
import waitTransactionConfirmation from '../utils/waitTransactionConfirmation'
import { BORROW_LOAN } from '../utils/mutations'
import { usePublicKeys } from '../hooks/xnft-hooks'

const HeaderBar = () => {
  return (
    <View style={tw`w-full bg-[#1F2126] h-[64px]`}>
      <Header />
    </View>
  )
}

export const BorrowModal = ({ visible, onClose, orderBook }: { visible: boolean; onClose?: any; orderBook: any }) => {
  const [selectedNft, setSelectedNft] = useState<string | null>(null)
  const [selectedNftIndex, setSelectedNftIndex] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [failMessage, setFailMessage] = useState<string | null>(null)
  const [txLink, setTxLink] = useState<string | null>(null)

  const [getBestOffer, { data, loading, stopPolling, startPolling }] = useLazyQuery(GET_BEST_OFFER_FOR_BORROW, {
    fetchPolicy: 'no-cache',
  })
  const [getMyLoans, { data: myLoans, loading: loadingMyLoans }] = useLazyQuery(MY_LOANS)

  const [borrowLoan] = useMutation(BORROW_LOAN)

  const publicKeys = usePublicKeys()

  const bestOffer = data?.getLoans?.data[0]
  const bestOfferSolNum = bestOffer ? bestOffer.principalLamports / LAMPORTS_PER_SOL : 0
  const bestOfferSol = toCurrencyFormat(bestOffer ? bestOffer.principalLamports / LAMPORTS_PER_SOL : 0)
  const duration = bestOffer?.duration
  let interest: any = calculateBorrowInterest(bestOfferSolNum, duration, orderBook?.apy)
  interest = interest < 0.01 ? interest.toFixed(3) : interest.toFixed(2)

  const floorPriceSol = orderBook?.floorPriceSol
  const defaultImage = 'https://sharky.fi/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FMoonHolders.10dd0302.jpg&w=128&q=75'

  useEffect(() => {
    if (visible) {
      fetchBestLoan()

      getMyLoans({
        variables: {
          args: {
            filter: {
              borrowerWallet: publicKeys?.solana,
              type: 'taken',
            },
          },
        },
      })
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
            orderBookId: orderBook?.id,
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

  const renderCloseButton = () => {
    return (
      <TouchableOpacity onPress={onClose}>
        <Image source={require('/assets/icon-x-square.svg')} style={{ ...tw`h-6 w-6 absolute top-0 right-0 z-50` }} />
      </TouchableOpacity>
    )
  }

  const onSuccess = async (tx: TransactionSignature, loan: any) => {
    try {
      await borrowLoan({ variables: { borrowedLoan: loan } })
    } catch (error) {
      console.log(error)
    }

    setIsSuccess(true)
    setTxLink(`https://solana.fm/tx/${tx}?cluster=mainnet-qn1`)
    setSelectedNft(null)
  }

  const borrow = async () => {
    setIsSuccess(false)

    if (!selectedNft) {
      setFailMessage('Please select an NFT')
      return
    }

    setIsSubmitting(true)
    setFailMessage(null)
    setIsSuccess(false)

    const provider = createAnchorProvider()
    const sharkyClient = createSharkyClient(provider)
    const { program } = sharkyClient

    // Fetch best loan
    const data = await fetchBestLoan()

    if (data && data.length) {
      const bestOffer = data[0]
      console.log('bestOffer', bestOffer)
      const offeredOrTaken: any = await sharkyClient.fetchLoan({
        program,
        loanPubKey: new PublicKey(bestOffer.pubKey),
      })

      if (!offeredOrTaken) {
        setFailMessage(`No loan found with pubkey ${bestOffer.pubKey}`)
        return
      }
      if (!offeredOrTaken.offered) {
        setFailMessage('Loan is already taken.')
        return
      }

      const loan = offeredOrTaken.offered
      const metadata: any = await sharkyClient.program.provider.connection.getParsedAccountInfo(new PublicKey(selectedNft), 'confirmed')
      const { freezeAuthority } = metadata?.value?.data?.parsed?.info
      const isFreezable = Boolean(freezeAuthority)

      try {
        const { takenLoan, sig } = await loan.take({
          program,
          nftMintPubKey: new PublicKey(selectedNft),
          nftListIndex: selectedNftIndex,
          skipFreezingCollateral: !isFreezable,
        })

        const loanToBorrow = {
          pubKey: takenLoan.pubKey.toBase58(),
          nftCollateralMint: takenLoan.data.loanState.taken?.taken.nftCollateralMint.toBase58(),
          lenderNoteMint: takenLoan.data.loanState.taken?.taken.lenderNoteMint.toBase58(),
          borrowerNoteMint: takenLoan.data.loanState.taken?.taken.borrowerNoteMint.toBase58(),
          apy: takenLoan.data.loanState.taken?.taken.apy.fixed?.apy,
          start: takenLoan.data.loanState.taken?.taken.terms.time?.start?.toNumber(),
          totalOwedLamports: takenLoan.data.loanState.taken?.taken.terms.time?.totalOwedLamports?.toNumber(),
        }

        // Check if the transaction was successful
        await waitTransactionConfirmation(
          sig,
          () => onSuccess(sig, loanToBorrow),
          () => setFailMessage('Transaction failed')
        )
      } catch (e: any) {
        if (e.sig) {
          setFailMessage(`Error taking loan (sig: ${e.sig})`)
        }
      }
    }

    setIsSubmitting(false)
  }

  const nfts = orderBook?.ownedNfts?.filter((ownedNft: any) => myLoans?.getLoans?.data?.find((myLoan: any) => myLoan.nftCollateralMint === ownedNft.mint) === undefined)

  return (
    <Modal animationType="fade" visible={visible} onRequestClose={onClose}>
      <HeaderBar />
      <Screen style={tw`flex bg-black p-[16px]`}>
        <View style={tw`flex flex-1 bg-[${isSuccess ? '#022628' : '#1F2126'}] rounded-md p-[16px]`}>
          <View style={{ zIndex: 999 }}>{renderCloseButton()}</View>
          <View style={tw`flex justify-center items-center`}>
            <Image source={{ uri: orderBook?.collectionImage ?? defaultImage }} style={tw`w-15 h-15 rounded-full`} />
            <Text style={{ ...tw`text-white text-[20px] mt-1`, fontFamily: Fonts.PoppinsBold }}>{isSuccess ? 'SUCCESS!' : orderBook?.collectionName}</Text>
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
              <Text style={{ ...tw`text-[#50AC3C] text-[16px]`, fontFamily: Fonts.PoppinsRegular }}>{orderBook?.apyAfterFee}%</Text>
            </View>
            <View style={tw`flex flex-1 items-center`}>
              <Text style={{ ...tw`text-white text-[16px]`, fontFamily: Fonts.PoppinsRegular }}>{orderBook?.duration / 86400}d</Text>
            </View>
            <View style={tw`flex flex-row flex-1 justify-end items-center`}>
              <Image source={require('/assets/sol.svg')} style={tw`w-4 h-4 mr-[4px]`} />
              <Text style={{ ...tw`text-white text-[16px]`, fontFamily: Fonts.PoppinsRegular }}>{floorPriceSol ? toCurrencyFormat(floorPriceSol) : 'No Data'}</Text>
            </View>
          </View>
          <View style={tw`w-full h-[1px] bg-[#ffffff1a] my-3`} />
          <View style={tw`flex flex-1`}>
            {nfts?.length === 0 ? (
              <View style={tw`flex flex-1 justify-center items-center`}>
                {loadingMyLoans ? <ActivityIndicator color="white" size={22} /> : <Text style={{ ...tw`text-white text-[14px]`, fontFamily: Fonts.PoppinsSemiBold }}>All NFTs are being used</Text>}
              </View>
            ) : (
              <ScrollView>
                <View style={tw`flex flex-1 flex-row w-full justify-between flex-wrap`}>
                  {nfts?.map((nft: any, index: number) => {
                    return (
                      <TouchableOpacity
                        key={index}
                        style={tw`bg-black rounded-md border border-[${selectedNft === nft.mint ? '#63ECD2' : 'black'}] w-[31%] flex justify-center items-center p-[8px] mb-2`}
                        onPress={() => {
                          if (selectedNft) {
                            setSelectedNft(null)
                            setSelectedNftIndex(null)
                          } else {
                            setSelectedNft(nft.mint)
                            setSelectedNftIndex(nft.nftListIndex)
                          }

                          if (isSuccess) setIsSuccess(false)
                        }}
                      >
                        <Image source={{ uri: nft?.image }} style={tw`w-19 h-19 rounded-md`} />
                        <Text style={{ ...tw`text-white text-center text-[13px] mt-1`, fontFamily: Fonts.InterBold }}>{nft?.name}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </ScrollView>
            )}
          </View>
          <View style={tw`w-full h-[1px] bg-[#ffffff1a] my-4`} />
          <View style={tw`flex flex-row w-full items-center justify-between`}>
            <Text style={{ ...tw`text-white text-[11px]`, fontFamily: Fonts.InterSemiBold }}>Selected NFT</Text>
            <View style={tw`flex flex-row items-center`}>
              <Text style={{ ...tw`text-white text-[11px]`, fontFamily: Fonts.InterSemiBold }}>{selectedNft ? 1 : 0}</Text>
            </View>
          </View>
          <View style={tw`flex flex-row w-full items-center justify-between mt-2`}>
            <Text style={{ ...tw`text-[#747E92] text-[11px]`, fontFamily: Fonts.InterSemiBold }}>Total</Text>
            <View style={tw`flex flex-row items-center`}>
              <Image source={require('/assets/sol.svg')} style={tw`w-3 h-3 mx-[4px]`} />
              <Text style={{ ...tw`text-[#747E92] text-[11px]`, fontFamily: Fonts.InterSemiBold }}>{bestOfferSol}</Text>
            </View>
          </View>
          <View style={tw`flex w-full justify-center items-center mt-2`}>
            <TouchableOpacity style={tw`border flex flex-row border-2 border-[#63ECD2] rounded-md items-center py-3 px-8 bg-[#63ECD2]`} onPress={borrow} disabled={isSubmitting || loadingMyLoans}>
              <Text
                style={{
                  ...tw`text-black text-[14px]`,
                  fontFamily: Fonts.InterSemiBold,
                }}
              >
                Borrow
              </Text>
              <Image source={require('/assets/sol.svg')} style={tw`w-5 h-5 mx-[4px]`} />
              <Text
                style={{
                  ...tw`text-black text-[14px]`,
                  fontFamily: Fonts.InterSemiBold,
                }}
              >
                {bestOfferSol}
              </Text>
              {isSubmitting && <ActivityIndicator color="black" size={18} style={tw`ml-2`} />}
            </TouchableOpacity>
          </View>
          <View style={tw`flex w-full flex-row justify-center items-center mt-3`}>
            <Text style={{ ...tw`text-center text-[#747E92] text-[10px]`, fontFamily: Fonts.InterRegular }}>Repay</Text>
            <Image source={require('/assets/sol.svg')} style={tw`w-3 h-3 mx-[4px]`} />
            <Text style={{ ...tw`text-center text-[#747E92] text-[10px]`, fontFamily: Fonts.InterRegular }}>
              {(parseFloat(interest) + bestOfferSolNum).toFixed(4)} in {orderBook?.duration / 86400} days
            </Text>
          </View>
          {txLink && (
            <View style={tw`flex w-full justify-center items-center mt-1`}>
              <Text style={tw`mt-2 text-[11px] text-white underline`} onPress={() => Linking.openURL(txLink as string)}>
                View your last transaction on Solana FM
              </Text>
            </View>
          )}
          {failMessage && (
            <View style={tw`flex w-full justify-center items-center mt-1`}>
              <Text style={tw`mt-2 text-[11px] text-red-500`}>{failMessage}</Text>
            </View>
          )}
        </View>
      </Screen>
    </Modal>
  )
}
