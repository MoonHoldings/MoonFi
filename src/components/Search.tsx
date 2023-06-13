import { View, TextInput, Platform, ActivityIndicator, Image } from "react-native"
import Fonts from "../utils/Fonts"
import tw from "twrnc"

type Props = {
  onChangeText: any
  value: string
  loading: boolean
}

export const Search = ({ onChangeText, value, loading }: Props) => {
  return (
    <View
      style={{
        ...tw`border border-2 border-[#63ECD2] rounded-md w-full flex flex-row items-center px-[16px]`,
      }}
    >
      <Image source={require("/assets/search.svg")} style={tw`h-[12px] w-[12px]`} />
      <TextInput
        style={{
          ...tw`rounded-md w-full items-center text-[#63ECD2] h-full text-[12px] py-[16px] ml-[9px] bg-black`,
          ...Platform.select({ web: { outline: "none" } }),
          fontFamily: Fonts.InterSemiBold,
        }}
        onChangeText={onChangeText}
        value={value}
        placeholder="Search"
        accessibilityRole="search"
        underlineColorAndroid="transparent"
        returnKeyType="search"
      />
      {loading && <ActivityIndicator color="#63ECD2" />}
    </View>
  )
}
