import { Tabs } from 'expo-router';
import { KeyRound } from "lucide-react-native";
import React from 'react';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const superHumansSmallLogo = colorScheme === "dark" ? require('../../assets/images/superhumans/superhuman-small-white.png') : require('../../assets/images/superhumans/superhuman-small-black.png');
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'SuperHuman',
          tabBarIcon: ({ color, focused }) => (
            // <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
            <Image source={superHumansSmallLogo} style={{ width: 24, height: 24 }} alt="Agent avatar" />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'settings',
          tabBarIcon: ({ color }) => <KeyRound color={color} />
        }}
      />
    </Tabs>
  );
}
