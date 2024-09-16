import { Button, StyleSheet, View } from "react-native";

const StreamAudioWithUrls = () => {
    const playAudioFromNodeJS = async () => {
        const userApiKey = 'usr_rK1WGJWkuf9lzc33OW1pwf2WvqXBHQfL';
        const botId = '669e08bd6614ff72acff93be';

        const formData = new FormData();
        const file = new File([questionBlob], 'test.mp3', { type: 'audio/mp3' });
        // formData.append('chat', JSON.stringify(slicedHistory))
        formData.append('audio', file);
        formData.append('botId', botId);

        const url = `http://192.168.1.5:8120/api/omni/${botId}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-Api-Key': userApiKey,
                // 'X-Conversation-Id': conversationId || '',
            },
            body: formData,
            // signal,
        });
    };
    return (
        <View style={styles.container}>
            <Button title="Play Audio from Node.js" onPress={playAudioFromNodeJS} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#ecf0f1',
        padding: 10,
    },
});

export default StreamAudioWithUrls;