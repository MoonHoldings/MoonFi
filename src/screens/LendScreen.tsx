import { useState, useEffect, useRef } from 'react'
import { FlatList, View, Text, ActivityIndicator, RefreshControl, TouchableOpacity, Image } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import tw from 'twrnc'
import { useLazyQuery } from '@apollo/client'

import { Search, Screen, Footer, OrderBookRow } from '../components'
import { LendModal } from '../modals/LendModal'
import { GET_ORDER_BOOKS } from '../utils/queries'
import Fonts from '../utils/Fonts'

const DataHeader = () => (
  <View style={tw`flex w-full flex-row justify-around items-center mt-4 pr-[20px]`}>
    <View style={tw`flex flex-1 justify-center`} />
    <View style={tw`flex flex-1 justify-center`}>
      <Text
        style={{
          ...tw`text-[12px] text-[#666666] text-center`,
          fontFamily: Fonts.PoppinsRegular,
        }}
      >
        Pool
      </Text>
    </View>
    <View style={tw`flex flex-1 justify-center`}>
      <Text
        style={{
          ...tw`text-[12px] text-[#666666] text-center`,
          fontFamily: Fonts.PoppinsRegular,
        }}
      >
        {'Best' + '\n' + 'Offer'}
      </Text>
    </View>
    <View style={tw`flex flex-1 justify-center`}>
      <Text
        style={{
          ...tw`text-[12px] text-[#666666] text-center`,
          fontFamily: Fonts.PoppinsRegular,
        }}
      >
        Floor
      </Text>
    </View>
    <View style={tw`flex flex-1 justify-center`}>
      <Text
        style={{
          ...tw`text-[12px] text-[#666666] text-center`,
          fontFamily: Fonts.PoppinsRegular,
        }}
      >
        Days
      </Text>
    </View>
    <View style={tw`flex flex-1 justify-center`} />
  </View>
)

const LIMIT = 30
const SCROLL_TO_TOP_THRESHOLD = 300

export function LendScreen({ navigation }: any) {
  const [search, setSearch] = useState<string | null>(null)
  const [lendModalVisible, setLendModalVisible] = useState<boolean>(false)
  const [offset, setOffset] = useState<number>(0)
  const [showScrollToTop, setShowScrollToTop] = useState<boolean>(false)
  const flatListRef: any = useRef(null)
  const [selectedOrderBook, setSelectedOrderBook] = useState(null)
  const isFocused = useIsFocused()

  const [getOrderBooks, { data, loading }] = useLazyQuery(GET_ORDER_BOOKS, {
    fetchPolicy: 'no-cache',
  })
  const [fetchedOrderBooks, setFetchedOrderBooks] = useState<any[]>([])

  useEffect(() => {
    if (isFocused) {
      fetchOrderBooks()
    } else {
      setSearch('')
    }
  }, [isFocused])

  useEffect(() => {
    if (search !== null) {
      if (search.length > 2) {
        fetchOrderBooks(true)
      } else if (search.length === 0) {
        fetchOrderBooks(true)
      }
    }
  }, [search])

  const fetchOrderBooks = async (isSearch = false) => {
    if (!loading) {
      const { data } = await getOrderBooks({
        variables: {
          args: {
            filter: {
              search,
            },
            pagination: {
              limit: LIMIT,
              offset: isSearch ? 0 : offset,
            },
          },
        },
      })
      const orderBooks = data?.getOrderBooks?.data

      if (orderBooks && !isSearch) {
        setFetchedOrderBooks([...fetchedOrderBooks, ...orderBooks])
        setOffset((prevOffset) => prevOffset + LIMIT)
      } else if (orderBooks) {
        setFetchedOrderBooks(orderBooks)
      }
    }
  }

  return (
    <Screen style={tw`flex bg-black`}>
      <LendModal visible={lendModalVisible} onClose={() => setLendModalVisible(false)} orderBook={selectedOrderBook} />
      <Search value={search ?? ''} onChangeText={(text: string) => setSearch(text)} loading={false} />
      <DataHeader />
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
        {loading && !fetchedOrderBooks.length ? (
          <ActivityIndicator size={25} color="#63ECD2" />
        ) : (
          <FlatList
            ref={flatListRef}
            refreshControl={<RefreshControl refreshing={true} />}
            showsVerticalScrollIndicator={false}
            data={fetchedOrderBooks}
            keyExtractor={(item) => 'orderbook_' + item.id}
            renderItem={({ item, index }) => (
              <OrderBookRow
                key={index}
                orderBook={item}
                actionLabel="Lend"
                onActionPress={() => {
                  setSelectedOrderBook(item)
                  setLendModalVisible(true)
                }}
              />
            )}
            onEndReached={() => {
              if (!loading && data?.getOrderBooks?.data?.length) {
                fetchOrderBooks()
              }
            }}
            onScroll={(event) => {
              if (event.nativeEvent.contentOffset.y > SCROLL_TO_TOP_THRESHOLD) {
                setShowScrollToTop(true)
              } else {
                setShowScrollToTop(false)
              }
            }}
            scrollsToTop={false}
          />
        )}
        {!fetchedOrderBooks.length && !loading && (
          <View style={tw`w-full flex items-center justify-center`}>
            <Text style={{ ...tw`text-white text-[15px]` }}>No data</Text>
          </View>
        )}
      </View>
      <View style={tw`flex items-center w-full`}>
        {(loading as any) && fetchedOrderBooks.length ? (
          <ActivityIndicator size={26} color="#63ECD2" />
        ) : (
          showScrollToTop && (
            <TouchableOpacity
              style={tw`text-white flex justify-center items-center bg-black rounded-full p-1 border-2 border-[#63ECD2]`}
              onPress={() => flatListRef?.current?.scrollToIndex({ index: 0 })}
            >
              <Image source={require('/assets/arrow-up.png')} style={tw`w-4 h-4`} />
            </TouchableOpacity>
          )
        )}
      </View>
      <Footer navigation={navigation} activeScreen={'Lend'} />
    </Screen>
  )
}
