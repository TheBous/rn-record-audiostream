import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const BouncingLoader = () => {
    const animation = useRef(new Animated.Value(0)).current;

    const animate = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animation, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(animation, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    useEffect(() => {
        animate();
    }, []);

    const dotStyle = {
        transform: [
            {
                scale: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.5],
                }),
            },
        ],
        opacity: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.5],
        }),
    };

    return (
        <View style={styles.container}>
            <View style={styles.loader}>
                <Animated.View style={[styles.dot, dotStyle]} />
                <Animated.View style={[styles.dot, dotStyle]} />
                <Animated.View style={[styles.dot, dotStyle]} />
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    loader: {
        flexDirection: 'row',
    },
    dot: {
        backgroundColor: 'white',
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
        marginVertical: 2,
        opacity: 1,
    },
});

export default BouncingLoader;