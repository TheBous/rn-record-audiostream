// import { Buffer } from 'buffer';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Button, StyleSheet, View } from 'react-native';

export type Role = 'question' | 'answer';

export interface StreamingResponse {
    type: "audio" | "text";
    content: string;
    role: Role;
}

export async function saveAudioToLocalCache(
    audioUrl: string,
    soundName: string
): Promise<string> {
    const audioFileType = 'wav';
    const cacheDir = FileSystem.cacheDirectory;

    if (!cacheDir) return '';
    const newAudioUrl = createAudioUrl(cacheDir, soundName, audioFileType);
    const base64AudioData = extractBase64Data(audioUrl, audioFileType);

    await writeAudioDataToFile(newAudioUrl, base64AudioData);
    return newAudioUrl;
}

const createAudioUrl = (cacheDir: string, soundName: string, audioFileType: string): string => `${cacheDir}${soundName}.${audioFileType}`;
const extractBase64Data = (audioUrl: string, audioFileType: string): string => audioUrl.replace(`data:audio/${audioFileType};base64,`, '');

const writeAudioDataToFile = async (newAudioUrl: string, base64AudioData: string): Promise<void> => {
    await FileSystem.writeAsStringAsync(newAudioUrl, base64AudioData, {
        encoding: FileSystem.EncodingType.Base64,
    });
}

const StreamAudio = () => {
    const playAudioFromNodeJS = async () => {
        try {
            const apiKey = 'usr_rK1WGJWkuf9lzc33OW1pwf2WvqXBHQfL';

            const url = `http://192.168.1.5:8120/api/omni/6666ae3ef38d11470be2949f`;
            let buffer = '';
            const textDecoder = new TextDecoder();


            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "X-Api-Key": apiKey,
                    "Connection": "keep-alive"
                },
                body: JSON.stringify({
                    text: "Sopra la panca la capra campa, sotto la panca la capra crepa.Sopra la panca la capra campa, sotto la panca la capra crepa.Sopra la panca la capra campa, sotto la panca la capra crepa.Sopra la panca la capra campa, sotto la panca la capra crepa.Sopra la panca la capra campa, sotto la panca la capra crepa."
                }),
            };

            const xhr = new XMLHttpRequest();
            xhr.open(options.method, url, true);

            for (const [key, value] of Object.entries(options.headers)) {
                xhr.setRequestHeader(key, value);
            }

            xhr.responseType = 'text';
            xhr.onload = async function (event) {
                const lines = event?.target?.response?.split("\n\n");

                for (const line of lines) {
                    if (line.trim() !== "") {
                        const data = JSON.parse(line);
                        if (data.type === "text") {
                            // Gestisci il testo ricevuto
                            console.log("Text:", data.content);
                        } else if (data.type === "audio") {
                            try {
                                const base64Audio = data.content;
                                const uri = await saveAudioToLocalCache(`data:audio/wav;base64,${base64Audio}`, 'test');

                                const { sound } = await Audio.Sound.createAsync({ uri });
                                sound.setOnPlaybackStatusUpdate((status) => {
                                    if (!status.isLoaded) {
                                        console.log('Errore nel caricamento dell\'audio', status);
                                    } else {
                                        console.log('Audio in riproduzione:', status);
                                        if (status.didJustFinish) {
                                            console.log('Riproduzione terminata');
                                        }
                                    }
                                });

                                await Audio.setAudioModeAsync({
                                    allowsRecordingIOS: false,
                                    interruptionModeIOS: InterruptionModeIOS.DuckOthers,
                                    playsInSilentModeIOS: true,
                                    staysActiveInBackground: false,
                                    shouldDuckAndroid: true,
                                    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
                                });

                                await sound.playAsync();
                            } catch (e) {
                                console.error(e);
                            }
                        }
                    }
                }
            }

            xhr.onerror = () => console.error('Errore di rete');
            xhr.send(options.body);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <Button title="Play Audio from Node.js" onPress={playAudioFromNodeJS} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#ecf0f1',
        padding: 10,
    },
});

export default StreamAudio;
