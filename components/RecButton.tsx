import { Audio, AVPlaybackStatus } from 'expo-av';
import { RecordingStatus } from 'expo-av/build/Audio';
import { useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';

const domain = 'https://beta-ai-rag-system-backend.original.land';

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

      const { recording } = await Audio.Recording.createAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        ios: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
          extension: '.mp4'
        },
        android: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
          extension: '.mp4'
        }
      }, onRecordingStatusUpdate);

      if (!recording) throw new Error('Failed to create myRecording');
      setMyRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start myRecording', err);
    }
  }


  const sendToServer = async (uri: string) => {
    const userApiKey = 'usr_rK1WGJWkuf9lzc33OW1pwf2WvqXBHQfL';
    const botId = '669e08bd6614ff72acff93be';

    const formData = new FormData();
    if (!uri) return '';

    const audioFile: any = {
      uri,
      name: `test.mpeg`,
      type: `audio/mpeg`,
    };

    formData.append('audio', audioFile);
    formData.append('botId', botId);
    formData.append('chat', JSON.stringify([]));

    const url = `${domain}/api/omni/${botId}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Api-Key': userApiKey,
        'Origin': 'noku-ai',
        // 'X-Conversation-Id': conversationId || '',
      },
      body: formData,
      // signal,
    });

    if (response.ok) {
      if (response.body) {
        // const conversationId = response.headers.get('X-Conversation-Id');
        // if (conversationId) saveConversationidToLocalStorage(conversationId, botId);

        const { data: responseData } = await response.json();
        const { textStreamName, question, audioStreamName } = responseData;

        // TODO add question to chat and consume text streaming

        if (audioStreamName) {
          const streamingAudioUrl = `${domain}/api/omni/consume_audio?streamName=${audioStreamName}`;
          await playSound(streamingAudioUrl);
          // audio.src = streamingAudioUrl;
          // audio.crossOrigin = 'anonymous';
          // audio.play()

          // audio.onloadedmetadata = () => {
          //   ChatMetadataStore.update((store) => ({ ...store, aiIsTalking: true }));
          // }

          // audio.onended = () => {

          //   ChatMetadataStore.update((store) => ({ ...store, aiIsTalking: false }));
          // }

          // audio.onerror = () => {
          //   ChatMetadataStore.update((store) => ({ ...store, aiIsTalking: false }));
          // }
        }

        // if (textStreamName) {
        //   const response = await fetch(
        //     `${PUBLIC_BOT_ENDPOINT}/api/omni/consume_text?streamName=${textStreamName}`,
        //     { method: 'GET' }
        //   );

        //   if (response.ok) {
        //     const reader = response.body!.getReader();
        //     let isNewMessage = true;
        //     while (true) {
        //       const { done, value } = await reader.read();
        //       if (done) break;

        //       const decodedValue = new TextDecoder().decode(value, { stream: true });
        //       if (updateChatClientHistory) {
        //         updateChatClientHistory(decodedValue, {
        //           forceNewMessage: isNewMessage,
        //           role: 'answer'
        //         })
        //       }
        //       isNewMessage = false;
        //     }
        //   }
        // }
      }
    }
  };

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
      await sendToServer(uri);
    } catch (e) {
      console.error('Failed to stop myRecording', e);
    }
  }

  const onPlayingStatusUpdate = (status: AVPlaybackStatus & { isPlaying?: boolean }) => {
    const { isPlaying: _isPlaying = false } = status;
    console.warn("is Playing", isPlaying);
    setIsPlaying(_isPlaying);
  };

  const playSound = async (overrideUri?: string) => {
    try {
      const uri = overrideUri || audioUri;
      console.warn(1, uri);
      if (!uri) throw new Error('No audio URI to play');
      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: false }, onPlayingStatusUpdate);

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
      {!!audioUri && !isPlaying && <Button title="Play Sound" onPress={() => playSound('https://beta-ai-rag-system-backend.original.land/api/omni/consume_audio?streamName=37ab16b9-93fd-4e81-a833-b7929c21bf28')} />}
    </View>
  );
}

// Test streaming:

// https://audio-edge-cmc51.fra.h.radiomast.io/ref-128k-mp3-stereo
// https://cdn.radiantmediatechs.com/rmp/media/samples-for-rmp-site/04052024-lac-de-bimont/hls/playlist.m3u8


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 10,
  },
});