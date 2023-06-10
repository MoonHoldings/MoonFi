import { Text, View, Pressable } from "react-native";
import tw from "twrnc";
import { Screen } from "../components/Screen";
import Fonts from "../utils/Fonts";
import { Footer } from "../components";

export function HomeScreen({ navigation }: any) {
  return (
    <Screen style={tw`flex bg-black`}>
      <View style={tw`flex flex-col flex-1 justify-between items-center`}>
        <View style={tw`flex justify-center mt-[3rem]`}>
          <Text
            style={{
              ...tw`text-white text-[24px] text-center`,
              fontFamily: Fonts.PoppinsBold,
            }}
          >
            Lend and borrow{"\n"} on your NFTs
          </Text>
          <Text
            style={{
              ...tw`text-white text-[14px] text-center mt-3 opacity-70`,
              fontFamily: Fonts.PoppinsLight,
            }}
          >
            MoonHoldings.xyz with SharkyFI
          </Text>
        </View>
        <View style={tw`flex w-full`}>
          <View style={tw`flex flex-row items-center justify-around w-full`}>
            <View style={tw`flex flex-row justify-center items-center`}>
              <Pressable onPress={() => navigation.navigate("Lend")}>
                <Text
                  style={{
                    ...tw`text-[16px] text-[#63ECD2] underline`,
                    fontFamily: Fonts.InterSemiBold,
                  }}
                >
                  Lend
                </Text>
              </Pressable>
              <Text
                style={{
                  ...tw`text-[16px] text-white`,
                  fontFamily: Fonts.InterSemiBold,
                }}
              >
                {" "}
                or{" "}
              </Text>
              <Pressable>
                <Text
                  style={{
                    ...tw`text-[16px] text-[#63ECD2] underline`,
                    fontFamily: Fonts.InterSemiBold,
                  }}
                >
                  Borrow
                </Text>
              </Pressable>
            </View>
            <View style={tw`flex flex-col`}>
              <View style={tw`flex flex-row justify-center`}>
                <Text
                  style={{
                    ...tw`text-[16px] text-white`,
                    fontFamily: Fonts.InterSemiBold,
                  }}
                >
                  View your existing
                </Text>
              </View>
              <View style={tw`flex flex-row justify-center`}>
                <Pressable>
                  <Text
                    style={{
                      ...tw`text-[16px] text-[#63ECD2] underline`,
                      fontFamily: Fonts.InterSemiBold,
                    }}
                  >
                    Offers
                  </Text>
                </Pressable>
                <Text
                  style={{
                    ...tw`text-[16px] text-white`,
                    fontFamily: Fonts.InterSemiBold,
                  }}
                >
                  {" "}
                  or{" "}
                </Text>
                <Pressable>
                  <Text
                    style={{
                      ...tw`text-[16px] text-[#63ECD2] underline`,
                      fontFamily: Fonts.InterSemiBold,
                    }}
                  >
                    Loans
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
          <View
            style={tw`flex flex-row items-center justify-around w-full mt-4`}
          >
            <Text style={tw`text-[24px]`}>👇</Text>
            <Text style={tw`text-[24px]`}>👇</Text>
          </View>
          <Footer navigation={navigation} />
        </View>
      </View>
    </Screen>
  );
}
