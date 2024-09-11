// import { Buffer } from 'buffer';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Button, StyleSheet, View } from 'react-native';

export type Role = 'question' | 'answer';

export interface StreamingResponse {
    type: "audio" | "text";
    content: string;
    role: Role;
}

const processChunk = async (parsedChunk: StreamingResponse) => {
    if (parsedChunk.type === 'audio') {
        const audioBuffer = Uint8Array.from(atob(parsedChunk.content), (c) =>
            c.charCodeAt(0)
        ).buffer;

        console.warn(audioBuffer);
    }
};

export async function saveAudioToLocalCache(
    audioUrl: string,
    soundName: string
): Promise<string> {
    const audioFileType = 'wav';
    const cacheDir = FileSystem.cacheDirectory;

    const newAudioUrl = createAudioUrl(cacheDir, soundName, audioFileType);
    const base64AudioData = extractBase64Data(audioUrl, audioFileType);

    await writeAudioDataToFile(newAudioUrl, base64AudioData);

    return newAudioUrl;
}

function createAudioUrl(cacheDir: string, soundName: string, audioFileType: string): string {
    return `${cacheDir}${soundName}.${audioFileType}`;
}

function extractBase64Data(audioUrl: string, audioFileType: string): string {
    return audioUrl.replace(`data:audio/${audioFileType};base64,`, '');
}

async function writeAudioDataToFile(newAudioUrl: string, base64AudioData: string): Promise<void> {
    await FileSystem.writeAsStringAsync(newAudioUrl, base64AudioData, {
        encoding: FileSystem.EncodingType.Base64,
    });
}

const StreamAudio = () => {
    const playAudioFromNodeJS = async () => {
        try {
            const apiKey = 'usr_rK1WGJWkuf9lzc33OW1pwf2WvqXBHQfL';
            // Configura le opzioni per la richiesta POST
            // const options = {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         "X-Api-Key": apiKey,
            //         "Connection": "keep-alive"
            //     },
            //     responseType: 'base64',
            //     body: JSON.stringify({
            //         text: "Sopra la panca la capra campa, sotto la panca la capra crepa."
            //     }),
            //     reactNative: { textStreaming: true }
            // };
            // const url = `http://localhost:3009/api/text_to_speech/669e08bd6614ff72acff93be`;

            // const response = await fetch(url, options);
            // const reader = response.body!.getReader();
            // let buffer = "";
            // const textDecoder = new TextDecoder();


            // while (true) {
            //     const { done, value } = await reader.read();
            //     if (done) {
            //         break;
            //     }

            //     buffer += textDecoder.decode(value, { stream: true });
            // }

            // console.warn('buffer', buffer);



            const url = `http://192.168.1.4:3009/api/omni/669e08bd6614ff72acff93be`;
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
            xhr.open(options.method, url, true); // Sostituisci con l'URL corretto

            // Imposta gli headers
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
                                // const buf = Buffer.from(audioData, 'base64');
                                // console.warn(buf);


                                // const { sound } = await Audio.Sound.createAsync({ uri: `data:audio/mpeg;base64,${audioData}` });
                                // console.warn(sound);
                                // await sound.playAsync();
                                const uri = await saveAudioToLocalCache(`data:audio/wav;base64,${base64Audio}`, 'test');
                                console.warn(uri)
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

                                await sound.playAsync();
                            } catch (e) {
                                console.error(e);
                            }



                            // const downloadResumable = FileSystem.createDownloadResumable(
                            //     audioData,
                            //     FileSystem.documentDirectory + 'small.mp3',
                            // );

                            // const { uri } = await downloadResumable.downloadAsync();
                            // console.warn(uri);
                            // const playSound = () => {
                            //     const sound = new Sound(path, '', () => callback(sound))
                            // }
                            // const callback = () => sound.play(successCallback)
                            // const audioBuffer = Uint8Array.from(atob(audioData), (c) =>
                            //     c.charCodeAt(0)
                            // ).buffer;


                        }
                    }
                }
            }

            xhr.onerror = function () {
                console.error('Errore di rete');
            };

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
