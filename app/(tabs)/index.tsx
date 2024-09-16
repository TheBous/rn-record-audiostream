import RecButton from '@/components/RecButton';
import { StyleSheet, View } from 'react-native';

export default function App() {

  return (
    <View style={styles.container}>
      <RecButton />
      {/* <StreamAudinRecButton /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 10,
  },
});