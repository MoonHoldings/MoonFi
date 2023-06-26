import { registerRootComponent } from 'expo'
import { RecoilRoot } from 'recoil'
import { ActivityIndicator, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { useFonts, Inter_400Regular, Inter_700Bold, Inter_600SemiBold, Poppins_700Bold, Poppins_300Light, Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/dev'
import { HomeScreen, LendScreen, BorrowScreen, OffersScreen, LoansScreen } from './screens'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Header } from './components'
import Fonts from './utils/Fonts'
import { ApolloProvider } from '@apollo/client'
import client from './utils/apollo-client'
import { Buffer } from 'buffer'
import { ExtendModal } from './modals/ExtendModal'

window.Buffer = Buffer

const Stack = createNativeStackNavigator()

function App() {
  let [fontsLoaded] = useFonts({
    [Fonts.InterRegular]: Inter_400Regular,
    [Fonts.InterBold]: Inter_700Bold,
    [Fonts.InterSemiBold]: Inter_600SemiBold,
    [Fonts.PoppinsBold]: Poppins_700Bold,
    [Fonts.PoppinsLight]: Poppins_300Light,
    [Fonts.PoppinsRegular]: Poppins_400Regular,
    [Fonts.PoppinsSemiBold]: Poppins_600SemiBold,
  })

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <ApolloProvider client={client}>
      <ExtendModal visible />
      <RecoilRoot>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              animation: 'fade',
              headerStyle: {
                backgroundColor: '#1F2126',
              },
              headerTitleAlign: 'center',
              headerShadowVisible: false,
              headerTitle: () => <Header />,
              headerTintColor: '#ffffff',
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Lend" component={LendScreen} />
            <Stack.Screen name="Borrow" component={BorrowScreen} />
            <Stack.Screen name="Offers" component={OffersScreen} />
            <Stack.Screen name="Loans" component={LoansScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </RecoilRoot>
    </ApolloProvider>
  )
}

export default registerRootComponent(App)
