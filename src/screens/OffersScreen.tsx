import { useEffect, useState } from 'react'
import { FlatList, View, Text, Image, ActivityIndicator } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { useLazyQuery } from '@apollo/client'
import tw from 'twrnc'

import { Search, Screen, Footer, OfferRow } from '../components'
import Fonts from '../utils/Fonts'
import { RevokeModal, ViewLoanModal } from '../modals'
import { MY_HISTORICAL_OFFERS, MY_OFFERS } from '../utils/queries'
import { usePublicKeys } from '../hooks/xnft-hooks'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import calculateLendInterest from '../utils/calculateLendInterest'
import toCurrencyFormat from '../utils/toCurrencyFormat'

const TableHeader = () => (
  <View style={tw`flex w-[93%] flex-row justify-around items-center mt-4`}>
    <View style={tw`flex flex-1 justify-center`} />
    <View style={tw`flex flex-1 justify-center`}>
      <Text style={{ ...tw`text-[12px] text-[#666666] text-center`, fontFamily: Fonts.PoppinsRegular }}>Offer</Text>
    </View>
    <View style={tw`flex flex-1 justify-center`}>
      <Text
        style={{
          ...tw`text-[12px] text-[#666666] text-center`,
          fontFamily: Fonts.PoppinsRegular,
        }}
      >
        Interest
      </Text>
    </View>
    <View style={tw`flex flex-1 justify-center`}>
      <Text style={{ ...tw`text-[12px] text-[#666666] text-center`, fontFamily: Fonts.PoppinsRegular }}>APY</Text>
    </View>
    <View style={tw`flex flex-1 justify-center`}>
      <Text style={{ ...tw`text-[12px] text-[#666666] text-center`, fontFamily: Fonts.PoppinsRegular }}>Status</Text>
    </View>
    <View style={tw`flex flex-1 justify-center`} />
  </View>
)

export function OffersScreen({ navigation }: any) {
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [revokeModalVisible, setRevokeModalVisible] = useState(false)
  const [activeOffer, setActiveOffer] = useState<any | null>(null)
  const [search, setSearch] = useState<string>('')

  const isFocused = useIsFocused()
  const publicKeys = usePublicKeys()

  const [getMyOffers, { data: myOffers, loading: loadingOffers, stopPolling: stopPollingOffers }] = useLazyQuery(MY_OFFERS)
  const [getMyHistoricalOffers, { data: myHistoricalOffers, loading: loadingHistoricalOffers, stopPolling }] = useLazyQuery(MY_HISTORICAL_OFFERS)

  const loading = loadingOffers || loadingHistoricalOffers

  useEffect(() => {
    if (isFocused) {
      const solPublicKey = publicKeys?.solana

      if (solPublicKey && !loadingOffers) {
        getMyOffers({
          variables: {
            args: {
              filter: {
                // lenderWallet: "HtPS1sNkzVMp1VkC7iuW2AZanUnD28vaVgEEJ3gUwfYJ",
                lenderWallet: solPublicKey,
                type: 'offered',
              },
            },
          },
          pollInterval: 1000,
        })
      }
    } else {
      stopPollingOffers()
    }
  }, [isFocused, publicKeys, loadingOffers])

  useEffect(() => {
    if (isFocused) {
      const solPublicKey = publicKeys?.solana

      if (solPublicKey && !loadingHistoricalOffers) {
        getMyHistoricalOffers({
          variables: {
            // lender: "HtPS1sNkzVMp1VkC7iuW2AZanUnD28vaVgEEJ3gUwfYJ",
            lender: solPublicKey,
          },
          pollInterval: 3_600_000,
        })
      }
    } else {
      stopPolling()
    }
  }, [isFocused, publicKeys, loadingHistoricalOffers])

  console.log(myHistoricalOffers)

  const getNonHistoricalOffers = () => {
    let offers: any[] = []

    if (myOffers?.getLoans?.data?.length) {
      offers = [...myOffers?.getLoans?.data]
      offers.sort((a: any, b: any) => a.offerTime - b.offerTime)
    }

    if (search.length) {
      return offers
        .filter((offer: any) => offer?.orderBook?.nftList?.collectionName?.toLocaleLowerCase()?.includes(search?.toLocaleLowerCase()))
        .map((offer: any) => ({ ...offer, isHistorical: false }))
    }

    return offers.map((offer: any) => ({ ...offer, isHistorical: false }))
  }

  const getActiveHistoricalOffers = () => {
    return myHistoricalOffers?.getHistoricalLoansByUser?.filter?.((offer: any) => offer.status === 'Active')?.map((offer: any) => ({ ...offer, isHistorical: true })) ?? []
  }

  const getInactiveHistoricalOffers = () => {
    return myHistoricalOffers?.getHistoricalLoansByUser?.filter?.((offer: any) => offer.status !== 'Active')?.map((offer: any) => ({ ...offer, isHistorical: true })) ?? []
  }

  const renderNonHistoricalOffer = (offer: any, index: number) => {
    const defaultImage = 'https://sharky.fi/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FMoonHolders.10dd0302.jpg&w=128&q=75'
    const offerInterest = calculateLendInterest(offer?.principalLamports / LAMPORTS_PER_SOL, offer?.orderBook?.duration, offer?.orderBook?.apy, offer?.orderBook?.feePermillicentage)

    return (
      <OfferRow
        key={index}
        actionLabel="Revoke"
        actionButtonColor="#FB6962"
        offer={{
          apy: offer?.orderBook?.apyAfterFee,
          collectionImage: offer?.orderBook?.nftList?.collectionImage ?? defaultImage,
          collectionName: offer?.orderBook?.nftList?.collectionName,
          amountOffered: offer?.principalLamports / LAMPORTS_PER_SOL,
          offerInterest,
        }}
        onActionPress={() => {
          setActiveOffer({
            pubKey: offer?.pubKey,
            collectionImage: offer?.orderBook?.nftList?.collectionImage ?? defaultImage,
            collectionName: offer?.orderBook?.nftList?.collectionName,
            duration: Math.floor(offer?.orderBook?.duration / 86400),
            apy: offer?.orderBook?.apyAfterFee,
            floorPriceSol: toCurrencyFormat(offer?.orderBook?.nftList?.floorPriceSol ?? 0),
            amountOffered: toCurrencyFormat(offer?.principalLamports / LAMPORTS_PER_SOL),
            offerInterest,
          })
          setRevokeModalVisible(true)
        }}
      />
    )
  }

  const renderHistoricalOffer = (offer: any, index: number) => {
    const defaultImage = 'https://sharky.fi/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FMoonHolders.10dd0302.jpg&w=128&q=75'
    const parsedOffer = {
      apy: offer?.apy,
      collectionImage: offer?.collectionImage ?? defaultImage,
      collectionName: offer?.collectionName,
      duration: Math.floor(offer?.loanDurationSeconds / 86400),
      floorPriceSol: toCurrencyFormat(offer?.floorPriceSol ?? 0),
      amountOffered: offer?.amountOffered,
      offerInterest: offer.offerInterest.toFixed(4),
      remainingDays: offer?.remainingDays,
      status: offer?.status,
      repayElapsedTime: offer?.repayElapsedTime,
      foreclosedElapsedTime: offer?.foreclosedElapsedTime,
      isHistorical: true,
    }

    return (
      <OfferRow
        key={index}
        actionLabel="View"
        offer={parsedOffer}
        onActionPress={() => {
          setActiveOffer(parsedOffer)
          setViewModalVisible(true)
        }}
      />
    )
  }

  const currentOffers: number = myOffers?.getLoans?.data?.reduce((accumulator: number, offer: any) => {
    return accumulator + offer?.principalLamports / LAMPORTS_PER_SOL
  }, 0)

  const expectedInterest: number = myOffers?.getLoans?.data?.reduce((accumulator: number, offer: any) => {
    return (
      accumulator + parseFloat(calculateLendInterest(offer?.principalLamports / LAMPORTS_PER_SOL, offer?.orderBook?.duration, offer?.orderBook?.apy, offer?.orderBook?.feePermillicentage) as string)
    )
  }, 0)

  const data = [...getActiveHistoricalOffers(), ...getNonHistoricalOffers(), ...getInactiveHistoricalOffers()]

  return (
    <Screen style={tw`flex bg-black`}>
      <ViewLoanModal visible={viewModalVisible} onClose={() => setViewModalVisible(false)} offer={activeOffer} />
      <RevokeModal visible={revokeModalVisible} onClose={() => setRevokeModalVisible(false)} offer={activeOffer} />
      <View style={tw`flex flex-col rounded-lg bg-[#1F2126] w-full justify-center mb-4 py-3 px-5`}>
        <View style={tw`flex flex-row w-full`}>
          <View style={tw`flex flex-1 items-start`}>
            <Text style={{ ...tw`text-white text-[11px]`, fontFamily: Fonts.PoppinsSemiBold }}>Interest Earned</Text>
          </View>
          <View style={tw`flex flex-1 items-center`}>
            <Text style={{ ...tw`text-white text-center text-[11px]`, fontFamily: Fonts.PoppinsSemiBold }}>Current Offers</Text>
          </View>
          <View style={tw`flex flex-1 items-end`}>
            <Text style={{ ...tw`text-white text-[11px]`, fontFamily: Fonts.PoppinsSemiBold }}>Expected Interest</Text>
          </View>
        </View>
        <View style={tw`flex flex-row w-full mt-1`}>
          <View style={tw`flex flex-row flex-1 justify-start items-center`}>
            {/* <Image source={require('/assets/sol.svg')} style={tw`w-4 h-4 mr-[4px]`} /> */}
            <Text style={{ ...tw`text-white text-[16px]`, fontFamily: Fonts.PoppinsLight }}>-</Text>
          </View>
          <View style={tw`flex flex-row flex-1 justify-center items-center`}>
            <Image source={require('/assets/sol.svg')} style={tw`w-4 h-4 mr-[4px]`} />
            <Text style={{ ...tw`text-white text-center text-[16px]`, fontFamily: Fonts.PoppinsLight }}>{currentOffers}</Text>
          </View>
          <View style={tw`flex flex-row flex-1 justify-end items-center`}>
            <Image source={require('/assets/sol.svg')} style={tw`w-4 h-4 mr-[4px]`} />
            <Text style={{ ...tw`text-white text-[16px]`, fontFamily: Fonts.PoppinsLight }}>{expectedInterest?.toPrecision(2)}</Text>
          </View>
        </View>
      </View>
      <Search value={search} onChangeText={setSearch} loading={false} />
      <TableHeader />
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
        {!loading && (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={data}
            renderItem={({ item: offer, index }) => {
              if (!offer.isHistorical) return renderNonHistoricalOffer(offer, index)
              else return renderHistoricalOffer(offer, index)
            }}
          />
        )}
        {loading && <ActivityIndicator size={25} color="#63ECD2" />}
        {data?.length === 0 && !loading && (
          <View style={tw`w-full flex items-center justify-center`}>
            <Text style={{ ...tw`text-white text-[15px]` }}>No data</Text>
          </View>
        )}
      </View>
      <Footer navigation={navigation} activeScreen={'Offers'} />
    </Screen>
  )
}
