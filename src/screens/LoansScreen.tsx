import { useEffect, useState } from 'react'
import { FlatList, View, Text, Image, ActivityIndicator } from 'react-native'
import tw from 'twrnc'
import { Search, Screen, Footer, LoanRow } from '../components'
import Fonts from '../utils/Fonts'
import { useLazyQuery } from '@apollo/client'
import { MY_HISTORICAL_OFFERS, MY_LOANS } from '../utils/queries'
import { usePublicKeys } from '../hooks/xnft-hooks'
import { useIsFocused } from '@react-navigation/native'
import { RepayModal } from '../modals'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

const TableHeader = () => (
  <View style={tw`flex w-[80%] flex-row justify-around items-center mt-3`}>
    <View style={tw`flex flex-1 justify-center`} />
    <View style={tw`flex flex-1 justify-center`}>
      <Text style={{ ...tw`text-[12px] text-[#666666] text-center`, fontFamily: Fonts.PoppinsRegular }}>Amount Due</Text>
    </View>
    <View style={tw`flex flex-1 justify-center`}>
      <Text
        style={{
          ...tw`text-[12px] text-[#666666] text-center`,
          fontFamily: Fonts.PoppinsRegular,
        }}
      >
        Term
      </Text>
    </View>
    <View style={tw`flex flex-1 justify-center`} />
    <View style={tw`flex flex-1 justify-center`} />
  </View>
)

export function LoansScreen({ navigation }: any) {
  const [text, onChangeText] = useState('')
  const [repayModalVisible, setRepayModalVisible] = useState(false)
  const [activeLoan, setActiveLoan] = useState(false)
  const [search, setSearch] = useState<string>('')

  const isFocused = useIsFocused()
  const publicKeys = usePublicKeys()

  const [getMyLoans, { data: myLoans, loading: loadingMyLoans, stopPolling: stopPollingLoans }] = useLazyQuery(MY_LOANS)
  const [getMyHistoricalLoans, { data: myHistoricalLoans, loading: loadingHistoricalLoans, stopPolling }] = useLazyQuery(MY_HISTORICAL_OFFERS)

  const loading = loadingMyLoans || loadingHistoricalLoans

  useEffect(() => {
    if (isFocused) {
      const solPublicKey = publicKeys?.solana

      if (solPublicKey && !loadingMyLoans) {
        getMyLoans({
          variables: {
            args: {
              filter: {
                borrowerWallet: solPublicKey,
                type: 'taken',
              },
            },
          },
          pollInterval: 1000,
        })
      }
    } else {
      stopPollingLoans()
    }
  }, [isFocused, publicKeys, loadingMyLoans])

  // useEffect(() => {
  //   if (isFocused) {
  //     const solPublicKey = publicKeys?.solana

  //     if (solPublicKey && !loadingHistoricalLoans) {
  //       getMyHistoricalLoans({
  //         variables: {
  //           borrower: solPublicKey,
  //         },
  //         pollInterval: 3_600_000,
  //       })
  //     }
  //   } else {
  //     stopPolling()
  //   }
  // }, [isFocused, publicKeys, loadingHistoricalLoans])

  const getNonHistoricalOffers = () => {
    let offers: any[] = []

    if (myLoans?.getLoans?.data?.length) {
      offers = [...myLoans?.getLoans?.data]
      offers.sort((a: any, b: any) => a.offerTime - b.offerTime)
    }

    if (search.length) {
      return offers
        .filter((offer: any) => offer?.orderBook?.nftList?.collectionName?.toLocaleLowerCase()?.includes(search?.toLocaleLowerCase()))
        .map((offer: any) => ({ ...offer, isHistorical: false }))
    }

    return offers.map((offer: any) => ({ ...offer, isHistorical: false }))
  }

  const activeLoansCount = myLoans?.getLoans?.data?.length
  const borrowedValue = myLoans?.getLoans?.data?.reduce((accumulator: number, loan: any) => {
    return accumulator + loan?.principalLamports / LAMPORTS_PER_SOL
  }, 0)
  const owedValue = myLoans?.getLoans?.data?.reduce((accumulator: number, loan: any) => {
    return accumulator + loan?.totalOwedLamports / LAMPORTS_PER_SOL
  }, 0)
  const interestOwed = owedValue - borrowedValue

  return (
    <Screen style={tw`flex bg-black`}>
      <RepayModal visible={repayModalVisible} onClose={() => setRepayModalVisible(false)} loan={activeLoan} />
      <View style={tw`flex flex-col rounded-lg bg-[#1F2126] w-full justify-center mb-4 py-3 px-5`}>
        <View style={tw`flex flex-row w-full`}>
          <View style={tw`flex flex-1 items-start`}>
            <Text style={{ ...tw`text-white text-[11px]`, fontFamily: Fonts.PoppinsSemiBold }}>Active Loans</Text>
          </View>
          <View style={tw`flex flex-1 items-center`}>
            <Text style={{ ...tw`text-white text-center text-[11px]`, fontFamily: Fonts.PoppinsSemiBold }}>Borrowed Value</Text>
          </View>
          <View style={tw`flex flex-1 items-end`}>
            <Text style={{ ...tw`text-white text-[11px]`, fontFamily: Fonts.PoppinsSemiBold }}>Interest Owed</Text>
          </View>
        </View>
        <View style={tw`flex flex-row w-full mt-1`}>
          <View style={tw`flex flex-row flex-1 justify-start items-center`}>
            <Text style={{ ...tw`text-white text-[16px]`, fontFamily: Fonts.PoppinsLight }}>{activeLoansCount}</Text>
          </View>
          <View style={tw`flex flex-row flex-1 justify-center items-center`}>
            <Image source={require('/assets/sol.svg')} style={tw`w-4 h-4 mr-[4px]`} />
            <Text style={{ ...tw`text-white text-center text-[16px]`, fontFamily: Fonts.PoppinsLight }}>{borrowedValue?.toFixed(4)}</Text>
          </View>
          <View style={tw`flex flex-row flex-1 justify-end items-center`}>
            <Image source={require('/assets/sol.svg')} style={tw`w-4 h-4 mr-[4px]`} />
            <Text style={{ ...tw`text-white text-[16px]`, fontFamily: Fonts.PoppinsLight }}>{interestOwed?.toFixed(4)}</Text>
          </View>
        </View>
      </View>
      <Search value={search} onChangeText={setSearch} loading={false} />
      <TableHeader />
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
        {!loading && (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={[...getNonHistoricalOffers()]}
            renderItem={({ item, index }) => (
              <LoanRow
                key={index}
                loan={item}
                onRepay={() => {
                  setActiveLoan(item)
                  setRepayModalVisible(true)
                }}
              />
            )}
          />
        )}
        {loading && <ActivityIndicator size={25} color="#63ECD2" />}
        {myLoans?.getLoans?.data?.length === 0 && !loading && (
          <View style={tw`w-full flex items-center justify-center`}>
            <Text style={{ ...tw`text-white text-[15px]` }}>No data</Text>
          </View>
        )}
      </View>
      <Footer navigation={navigation} activeScreen={'Loans'} />
    </Screen>
  )
}
