import { StyleSheet, View, Text } from "react-native";

const Header = () => {
  return (
    <View style={styles.container}>
      <Text>MoonFi</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Header;
