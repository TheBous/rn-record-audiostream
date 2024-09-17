import useMessagesStore, { MessageRole } from '@/store/messages';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { RecordingStatus } from 'expo-av/build/Audio';
import { useMemo, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import { fetch as fetchRNApi } from "react-native-fetch-api";
import BottomConversations from './Conversations/BottomConversations';
import RecButton from './RecButton/RecButton';
import SoundBars from './RecButton/SoundBars';

const domain = 'https://beta-ai-rag-system-backend.original.land';

let myRecording: Audio.Recording | undefined;

export default function RecAndPlayStreams() {
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [audioUri, setAudioUri] = useState<string>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [durationMillis, setDurationMillis] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isServerLoading, setServerLoading] = useState(false);
  const { messages, appendContentToLastMessage, appendmessage } = useMessagesStore();

  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const onRecordingStatusUpdate = (status: RecordingStatus) => {
    const { isRecording: _isRecording = false, durationMillis: _durationMillis = 0 } = status;
    setIsRecording(_isRecording);
    setDurationMillis(_durationMillis);
  };
  const soundRef = useRef<Audio.Sound | null>(null);

  const startAnimation = () => {
    animationRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    );
    animationRef.current.start();
  };

  const stopAnimation = () => {
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;

      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const startRecording = async () => {
    try {
      if (isRecButtonDisabled) return;
      if (!permissionResponse || permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }

      startAnimation();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Crea una nuova istanza di Audio.Recording
      myRecording = new Audio.Recording();

      // Prepara per la registrazione
      await myRecording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        ios: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
          extension: '.mp4'
        },
        android: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
          extension: '.mp4'
        }
      });

      // Imposta l'aggiornamento dello stato di registrazione
      myRecording.setOnRecordingStatusUpdate(onRecordingStatusUpdate);

      // Avvia la registrazione
      await myRecording.startAsync();

      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const isRecButtonDisabled = useMemo(() => isRecording || isPlaying || isServerLoading, [isRecording, isPlaying, isServerLoading])

  const sendToServer = async (uri: string) => {
    try {
      setServerLoading(true);

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
      formData.append('chat', JSON.stringify(messages));

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

          if (question) {
            appendmessage({ content: question, role: MessageRole.USER })
          }

          if (audioStreamName) {
            const streamingAudioUrl = `${domain}/api/omni/consume_audio?streamName=${audioStreamName}`;
            await playSound(streamingAudioUrl);
          }

          if (textStreamName) {
            const response = await fetchRNApi(
              `${domain}/api/omni/consume_text?streamName=${textStreamName}`,
              { method: 'GET', reactNative: { textStreaming: true } }
            );

            const body = await response.body;
            const reader = body!.getReader();
            let isNewMessage = true;
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const decodedValue = new TextDecoder().decode(value, { stream: true });
              if (decodedValue) {
                if (isNewMessage) appendmessage({ content: decodedValue, role: MessageRole.AI });
                else appendContentToLastMessage(` ${decodedValue}`);

                isNewMessage = false;
              }
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setServerLoading(false);
    }
  };

  const stopRecording = async () => {
    try {
      stopAnimation();
      console.log('Stopping recording..');

      if (!myRecording) throw new Error('No recording to stop');
      await myRecording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = myRecording.getURI();
      if (!uri) throw new Error('Failed to get recording URI');
      setAudioUri(uri);
      await sendToServer(uri);
    } catch (e) {
      console.error('Failed to stop recording', e);
    } finally {
      // Assicurati di impostare myRecording su undefined
      myRecording = undefined;
      setIsRecording(false);
      setDurationMillis(0);
    }
  };

  const onPlayingStatusUpdate = (status: AVPlaybackStatus & { isPlaying?: boolean }) => {
    const { isPlaying: _isPlaying = false } = status;
    setIsPlaying(_isPlaying);
  };

  const playSound = async (overrideUri?: string) => {
    try {
      const uri = overrideUri || audioUri;
      if (!uri) throw new Error('No audio URI to play');
      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: false }, onPlayingStatusUpdate);

      soundRef.current = sound;
      await soundRef.current.playAsync();
    } catch (e) {
      console.error('Failed to play sound', e);
    }
  };

  const onStopPlaying = () => {
    soundRef.current?.stopAsync();
    soundRef.current?.unloadAsync();

    soundRef.current = null;
    setIsPlaying(false);
  };

  return (
    <View className="flex items-center justify-center flex-1">
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        {isPlaying ?
          <SoundBars onVoiceClick={onStopPlaying} /> :
          <RecButton
            isLoading={isServerLoading}
            disabled={isRecButtonDisabled}
            startRecording={startRecording}
            stopRecording={stopRecording}
          />
        }
      </Animated.View>
      <BottomConversations sendNewMsg={console.warn} />
    </View>
  );
}
