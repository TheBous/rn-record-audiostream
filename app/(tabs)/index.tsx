import RecButton from '@/components/RecButton';
import { View } from 'react-native';

export default function App() {

  return (
    <View className='flex-1 justify-center bg-[#ecf0f1] p-10'>
      <RecButton />
      {/* <StreamAudinRecButton /> */}
    </View>
  );
}