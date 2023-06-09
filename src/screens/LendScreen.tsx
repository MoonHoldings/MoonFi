import { useState } from "react"
import { TextInput } from "react-native"
import tw from "twrnc"
import { Screen } from "../components/Screen"
import Fonts from "../utils/Fonts"

export function LendScreen() {
  const [text, onChangeText] = useState("")

  return (
    <Screen style={tw`flex bg-black`}>
      <TextInput
        style={{ ...tw`border border-2 border-[#63ECD2] rounded-md w-full items-center py-2 text-[#63ECD2] text-[12px] py-[16px] px-[16px]`, fontFamily: Fonts.InterSemiBold }}
        onChangeText={onChangeText}
        value={text}
        placeholder="Search"
      />
    </Screen>
  )
}
