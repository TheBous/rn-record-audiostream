import StreamAudio from '@/components/StreamAudio';
import { StyleSheet, View } from 'react-native';

export default function App() {

  return (
    <View style={styles.container}>
      {/* <RecButton /> */}
      <StreamAudio />
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