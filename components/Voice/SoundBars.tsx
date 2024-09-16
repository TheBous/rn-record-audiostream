import randomNumberBetween from '@/utils/randomNumberBetween';
import React, { useEffect } from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';

const SoundBars = ({ onVoiceClick = () => { }, headerColor = '' }) => {
    const animatedValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(() => new Animated.Value(0));

    useEffect(() => {
        const animations = animatedValues.map((value, index) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.timing(value, {
                        toValue: randomNumberBetween(0.8, 1),
                        duration: 400 + (index * 10),
                        useNativeDriver: false,
                    }),
                    Animated.timing(value, {
                        toValue: 0,
                        duration: 400 + (index * 10),
                        useNativeDriver: false,
                    }),
                ])
            );
        });

        Animated.parallel(animations).start();
    }, []);

    return (
        <TouchableOpacity onPress={onVoiceClick} style={styles.container}>
            {animatedValues.map((value, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.bar,
                        {
                            backgroundColor: headerColor || '#dc2626',
                            height: value.interpolate({
                                inputRange: [0, 1],
                                outputRange: [3, 70],
                            }),
                            opacity: value.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.35, 1],
                            }),
                        },
                    ]}
                />
            ))}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        height: 70,
    },
    bar: {
        width: 10,
        marginHorizontal: 4,
        borderRadius: 5,
    },
});

export default SoundBars;