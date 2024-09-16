import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const BouncingLoader = () => {
    // Inizializziamo un valore animato
    const animation = useRef(new Animated.Value(0)).current;

    // Definiamo l'animazione che alterna tra 0 e 1
    const animate = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animation, {
                    toValue: 1,
                    duration: 300, // metà della durata totale di 600ms
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

    // Avvio dell'animazione quando il componente viene montato
    useEffect(() => {
        animate();
    }, []);

    // Definiamo lo stile animato per i puntini
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

// Definizione degli stili
const styles = StyleSheet.create({
    container: {
        flex: 1, // Occupa tutto lo spazio disponibile
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20, // Padding di 20px (equivalente a p-5 in Tailwind)
        backgroundColor: 'transparent', // Sfondo trasparente
    },
    loader: {
        flexDirection: 'row', // Disposizione orizzontale dei puntini
    },
    dot: {
        backgroundColor: 'white',
        width: 12, // Larghezza di 12px (w-3 in Tailwind)
        height: 12, // Altezza di 12px (h-3 in Tailwind)
        borderRadius: 6, // Border radius per rendere il puntino rotondo (rounded-full)
        marginHorizontal: 6, // Margine orizzontale di 6px (mx-1.5 in Tailwind)
        marginVertical: 2, // Margine verticale di 2px (my-0.5 in Tailwind)
        opacity: 1, // Opacità iniziale
    },
});

export default BouncingLoader;