import { Text, View, StyleSheet } from 'react-native';

export default function FavoritScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorit</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
