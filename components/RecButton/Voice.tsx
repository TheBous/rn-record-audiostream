// Voice.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';

interface VoiceProps {
    onVoiceClick?: () => void;
}

const Voice = ({ onVoiceClick }: VoiceProps) => {
    const durations = [474, 433, 407, 458, 400, 427, 441, 419, 487, 442];

    // Create an array of Animated.Values for each bar
    const bars = durations.map(() => useRef(new Animated.Value(3)).current);

    useEffect(() => {
        bars.forEach((bar, index) => {
            const duration = durations[index];
            const animate = () => {
                Animated.sequence([
                    // Animate to height 70
                    Animated.timing(bar, {
                        toValue: 70,
                        duration: duration,
                        useNativeDriver: false,
                    }),
                    // Animate back to height 3
                    Animated.timing(bar, {
                        toValue: 3,
                        duration: duration,
                        useNativeDriver: false,
                    }),
                ]).start(() => {
                    animate(); // Loop the animation
                });
            };

            animate();
        });
    }, []);

    return (
        <TouchableOpacity onPress={onVoiceClick}>
            <View style={styles.bars}>
                {bars.map((bar, index) => (
                    <Animated.View
                        key={index}
                        style={[
                            styles.bar,
                            {
                                height: bar, // Animated height
                                opacity: bar.interpolate({
                                    inputRange: [3, 70],
                                    outputRange: [0.35, 1],
                                }),
                            },
                        ]}
                    />
                ))}
            </View>
        </TouchableOpacity>
    );
};

export default Voice;

const styles = StyleSheet.create({
    bars: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end', // Align bars to the bottom
    },
    bar: {
        backgroundColor: '#dc2626', // Equivalent to Tailwind's bg-red-600
        width: 10,
        marginHorizontal: 4,
        borderRadius: 5,
    },
});