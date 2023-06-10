import { registerRootComponent } from "expo";
import { RecoilRoot } from "recoil";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
  Inter_600SemiBold,
  Poppins_700Bold,
  Poppins_300Light,
  Poppins_400Regular,
} from "@expo-google-fonts/dev";
import { HomeScreen, LendScreen } from "./screens";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Header } from "./components";
import Fonts from "./utils/Fonts";

const Stack = createNativeStackNavigator();

function App() {
  let [fontsLoaded] = useFonts({
    [Fonts.InterRegular]: Inter_400Regular,
    [Fonts.InterBold]: Inter_700Bold,
    [Fonts.InterSemiBold]: Inter_600SemiBold,
    [Fonts.PoppinsBold]: Poppins_700Bold,
    [Fonts.PoppinsLight]: Poppins_300Light,
    [Fonts.PoppinsRegular]: Poppins_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <RecoilRoot>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: "#1F2126",
            },
            headerTitleAlign: "center",
            headerShadowVisible: false,
            headerTitle: () => <Header />,
            headerTintColor: "#ffffff",
          }}
        >
          <Stack.Screen name="Lend" component={LendScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </RecoilRoot>
  );
}

export default registerRootComponent(App);
