import { Audio } from 'expo-av';
import { Button, StyleSheet, View } from 'react-native';

const StreamAudio = () => {
    const playAudioFromNodeJS = async () => {
        try {
            const apiKey = 'usr_rK1WGJWkuf9lzc33OW1pwf2WvqXBHQfL';
            // Configura le opzioni per la richiesta POST
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "X-Api-Key": apiKey,
                    "Connection": "keep-alive"
                },
                body: JSON.stringify({
                    text: "Sopra la panca la capra campa, sotto la panca la capra crepa."
                }),
            };
            const url = `https://beta-ai-rag-system-backend.original.land/api/text_to_speech/669e08bd6614ff72acff93be`;

            const response = await fetch(url, options);

            console.warn(response.body);

            if (!response.ok) throw new Error('Errore nella richiesta');

            const reader = response.body!.getReader();

            // await TrackPlayer.setupPlayer();

            let chunk = await reader.read();
            while (!chunk.done) {

                const { sound } = await Audio.Sound.createAsync({ uri: chunk.value });
                await sound.playAsync();
                // Aggiungi il chunk audio alla coda di riproduzione di TrackPlayer
                // await TrackPlayer.add({
                //     id: Date.now().toString(),
                //     url: chunk.value,
                //     title: 'Audio Chunk',
                //     artist: 'Node.js Endpoint',
                // });

                // Leggi il prossimo chunk
                chunk = await reader.read();
            }

            // Avvia la riproduzione audio
            // await TrackPlayer.play();
        } catch (error) {
            console.error('Errore durante la riproduzione audio:', error);
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
