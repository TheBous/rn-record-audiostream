import useMessagesStore, { MessageRole } from '@/store/messages';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Send } from "lucide-react-native";
import { useCallback, useRef } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import useMarkdown, { textToMarkdown } from 'react-native-usemarkdown-chat';

interface IBottomConversationsProps {
    sendNewMsg: (msg: string) => void;
}

const BottomConversations = ({ sendNewMsg }: IBottomConversationsProps) => {
    const bottomSheetRef = useRef<BottomSheet>(null);

    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
    }, []);

    const { messages } = useMessagesStore();
    const [text, setText] = useMarkdown();

    const onSend = () => {
        sendNewMsg(text);
        setText('');
    };

    return (
        <BottomSheet
            snapPoints={['5%', '90%']}
            ref={bottomSheetRef}
            onChange={handleSheetChanges}
        >
            <BottomSheetView style={{ paddingLeft: 20, paddingRight: 20, flex: 1, position: 'relative' }}>
                <View className='w-full absolute bottom-5 flex gap-x-2 items-center justify-between flex-row' style={{ left: 20, right: 20 }}>
                    <TextInput className='flex-1 h-12 border border-blue-500 rounded-md text-black' value={text} onChangeText={setText} />
                    <Pressable onPress={onSend} className='bg-blue-500 rounded-full p-2'>
                        <Send size={24} className='text-white' />
                    </Pressable>
                </View>
                <ScrollView className='flex-1 flex gap-y-4 p-2'>
                    {messages.map(({ content = "", role }, index) => {
                        const positioningClass = role === MessageRole.AI ? 'self-end' : 'self-start';
                        const imagePositioning = role === MessageRole.AI ? 'flex-row-reverse' : 'flex-row'
                        const msgColour = role === MessageRole.AI ? "bg-blue-400" : 'bg-gray-400';

                        return (
                            <View className={`flex ${imagePositioning} gap-x-2 items-center ${positioningClass} max-w-[85%]`} key={`${content}-${index}`}>
                                <Image
                                    className='rounded-full w-10 h-10'
                                    source={{
                                        uri: 'https://reactnative.dev/img/tiny_logo.png',
                                    }}
                                />
                                <View className={`border-gray-200 rounded-lg p-4 space-y-3 flex items-center gap-x-1 flex-wrap ${msgColour}`}>
                                    <Text>{textToMarkdown(content)}</Text>
                                </View>
                            </View>
                        )
                    })}
                </ScrollView>
            </BottomSheetView>
        </BottomSheet>
    );
};

export default BottomConversations;