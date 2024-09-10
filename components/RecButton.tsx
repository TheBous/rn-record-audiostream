import { Audio, AVPlaybackStatus } from 'expo-av';
import { RecordingStatus } from 'expo-av/build/Audio';
import { useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';

export default function RecButton() {
  const [myRecording, setMyRecording] = useState<Audio.Recording>();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [audioUri, setAudioUri] = useState<string>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [durationMillis, setDurationMillis] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  const onRecordingStatusUpdate = (status: RecordingStatus) => {
    const { isRecording: _isRecording = false, durationMillis: _durationMillis = 0 } = status;
    setIsRecording(_isRecording);
    setDurationMillis(_durationMillis);
  };

  const startRecording = async () => {
    try {
      if (!permissionResponse || permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting myRecording..');
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY, onRecordingStatusUpdate);
      if (!recording) throw new Error('Failed to create myRecording');
      setMyRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start myRecording', err);
    }
  }

  const stopRecording = async () => {
    try {
      console.log('Stopping myRecording..');
      setMyRecording(undefined);
      setIsRecording(false);
      setDurationMillis(0);
      if (!myRecording) throw new Error('No myRecording to stop');
      await myRecording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync(
        {
          allowsRecordingIOS: false,
        }
      );
      const uri = myRecording.getURI();
      if (!uri) throw new Error('Failed to get myRecording URI');
      setAudioUri(uri);
      await playSound(uri);
    } catch (e) {
      console.error('Failed to stop myRecording', e);
    }
  }

  const onPlayingStatusUpdate = (status: AVPlaybackStatus & { isPlaying?: boolean }) => {
    const { isPlaying: _isPlaying = false } = status;
    setIsPlaying(_isPlaying);
  };

  const playSound = async (overrideUri?: string) => {
    try {
      const uri = overrideUri || audioUri;
      if (!uri) throw new Error('No audio URI to play');
      const { sound } = await Audio.Sound.createAsync({ uri }, {}, onPlayingStatusUpdate);

      await sound.playAsync();
    } catch (e) {
      console.error('Failed to play sound', e);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title={myRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={myRecording ? stopRecording : startRecording}
      />
      {!!audioUri && !isPlaying && <Button title="Play Sound" onPress={() => playSound()} />}
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