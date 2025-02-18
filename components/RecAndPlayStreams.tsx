import React from 'react';
import useMessagesStore, { ChatMessage, MessageRole } from '@/store/messages';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { RecordingStatus } from 'expo-av/build/Audio';
import { useMemo, useRef, useState } from 'react';
import { Animated, Image, Text, View } from 'react-native';
import { fetch as fetchRNApi } from "react-native-fetch-api";
import BottomConversations from './Conversations/BottomConversations';
import RecButton from './RecButton/RecButton';
import Voice from './RecButton/Voice';
import * as Haptics from 'expo-haptics';

const domain = 'https://beta-ai-rag-system-backend.original.land'; //'http://localhost:8120';

const userApiKey = 'usr_rK1WGJWkuf9lzc33OW1pwf2WvqXBHQfL';
const botId = "66e9ae8dbf41992862cb0a29"; // strong beta: 66e9ae8dbf41992862cb0a29, noku ai beta: '6666ae3ef38d11470be2949f' - strong prod: 66b6266e76a3c6f8b549945a
let myRecording: Audio.Recording | undefined;

export default function RecAndPlayStreams() {
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [audioUri, setAudioUri] = useState<string>();
  const [durationMillis, setDurationMillis] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isServerLoading, setServerLoading] = useState(false);
  const { messages, appendContentToLastMessage, replaceContentToLastMessage, appendmessage } = useMessagesStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);

  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Aggiungiamo l'AbortController
  const abortControllerRef = useRef<AbortController | null>(null);

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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // Inizia la vibrazione
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

      myRecording.setOnRecordingStatusUpdate(onRecordingStatusUpdate);

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
      // Creiamo un nuovo AbortController
      abortControllerRef.current = new AbortController();

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
        },
        body: formData,
        // Passiamo il segnale all'API fetch
        signal: abortControllerRef.current.signal,
      });

      if (response.ok) {
        if (response.body) {
          const { data: responseData } = await response.json();
          const { textStreamName, question, audioStreamName } = responseData;

          appendmessage({ content: question ?? "Error while decoding questions from user", role: MessageRole.USER });
          appendmessage({ role: MessageRole.AI, content: "" });

          if (audioStreamName) {
            const streamingAudioUrl = `${domain}/api/consume/audio?streamName=${audioStreamName}`;
            await playSound(streamingAudioUrl);
          }

          if (textStreamName) {
            const response = await fetchRNApi(
              `${domain}/api/consume/text?streamName=${textStreamName}`,
              {
                method: 'GET',
                reactNative: { textStreaming: true },
                signal: abortControllerRef.current.signal, // Passiamo il segnale
              }
            );

            const body = await response.body;
            const reader = body!.getReader();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const decodedValue = new TextDecoder().decode(value, { stream: true });
              if (decodedValue) appendContentToLastMessage(` ${decodedValue}`);
            }
          }
        }
      }
    } catch (e: any) {
      if (e.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error(e);
      }
    } finally {
      setServerLoading(false);
    }
  };

  const stopRecording = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); // Ferma la vibrazione
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
      myRecording = undefined;
      setIsRecording(false);
      setServerLoading(false);
      setDurationMillis(0);
    }
  };

  const onPlayingStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.error(`Playback Error: ${status.error}`);
      }
      return;
    }

    const wasPlaying = isPlayingRef.current;
    isPlayingRef.current = status.isPlaying;

    if (status.isPlaying && !wasPlaying) {
      // La riproduzione è appena iniziata
      console.log('Playback started');
      setIsPlaying(true);
    } else if (!status.isPlaying && wasPlaying) {
      if (status.didJustFinish) {
        // La riproduzione è appena terminata naturalmente
        console.log('Playback finished');
        setIsPlaying(false);

        // Pulisci il suono
        soundRef.current?.unloadAsync();
        soundRef.current = null;
      } else {
        // La riproduzione è stata interrotta manualmente
        console.log('Playback stopped manually');
        setIsPlaying(false);
      }
    }
  };

  const playSound = async (overrideUri?: string) => {
    try {
      const uri = overrideUri || audioUri;
      if (!uri) throw new Error('No audio URI to play');
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        onPlayingStatusUpdate
      );

      soundRef.current = sound;
      await soundRef.current.playAsync();
    } catch (e) {
      console.error('Failed to play sound', e);
    }
  };

  const onStopPlaying = () => {
    soundRef.current?.stopAsync();
    soundRef.current?.unloadAsync();

    // Abortiamo le chiamate fetch in corso
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Resettiamo gli stati di caricamento
    setIsPlaying(false);
    setServerLoading(false);
  };


  const sendNewMsg = async (question: string) => {
    const formattedText = question.charAt(0).toUpperCase() + question.slice(1).toLowerCase();
    appendmessage({ content: formattedText, role: MessageRole.USER });
    appendmessage({ role: MessageRole.AI, content: "" })

    const body: {
      query: string;
      streaming: boolean;
      chat: ChatMessage[];
      chatBotType: string;
      conversationId?: string | null;
    } = {
      query: formattedText,
      streaming: true,
      chat: messages,
      chatBotType: "playground"
    };
    let headers: HeadersInit = {
      Accept: '*/*',
      'X-Api-Key': userApiKey,
    }

    const formData = new FormData();
    formData.append('inputData', JSON.stringify(body));

    try {
      setServerLoading(true);
      // Creiamo un nuovo AbortController
      abortControllerRef.current = new AbortController();

      const response = await fetchRNApi(
        `${domain}/api/chat/query/${botId}`,
        {
          method: 'POST',
          headers,
          body: formData,
          reactNative: { textStreaming: true },
          signal: abortControllerRef.current.signal // Passiamo il segnale
        }
      );

      const bodyResponse = await response.body;
      const reader = bodyResponse!.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const decodedValue = new TextDecoder().decode(value, { stream: true });

        const messagesChunks = decodedValue.split('\n');

        messagesChunks.forEach((contentChunk) => {
          if (contentChunk) {
          const parsedChunk = JSON.parse(contentChunk);
          const content = parsedChunk?.content?.content;
          if (content) replaceContentToLastMessage(content);
          }
        });
      }
    } catch (e: any) {
      if (e.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error(e);
      }
    } finally {
      setServerLoading(false);
    }
  };

  const imageUrl = "https://static.noku.io/assets/noku/ai/bot-avatar/66e9aed2bf41992862cb0a64.png"; // strong, noku ai: https://static.noku.io/assets/noku/ai/bot-avatar/66d1764c1357bc6c2f64b256.pngr

  return (
    <>
      <Text className='ml-auto mr-auto mt-10 text-4xl font-bold text-center'>Talk to Strong Beta</Text>
      <Text className='ml-auto mr-auto mt-5 font-light text-xl text-center'>Press and hold red button to talk</Text>
      <View className="flex items-center justify-center flex-1">
        <View className='flex flex-col items-center justify-between'>
          <Image
            source={{
              uri: imageUrl,
            }}
            className="w-56 h-56 rounded-full object-cover mr-2 mb-14"
            alt="Agent avatar"
          />
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }],
            }}
          >
            {isPlaying ?
              <Voice onVoiceClick={onStopPlaying} /> :
              <RecButton
                isLoading={isServerLoading}
                disabled={isRecButtonDisabled}
                startRecording={startRecording}
                stopRecording={stopRecording}
              />
            }
          </Animated.View>
        </View>
        <BottomConversations sendNewMsg={sendNewMsg} isSendNewMsgDisabled={isRecButtonDisabled} />
      </View>
    </>
  );
}