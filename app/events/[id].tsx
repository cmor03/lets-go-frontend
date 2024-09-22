// app/events/[id].tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function EventDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Event Details Page for Event ID: {id}</Text>
      {/* You can eventually fetch the specific event data from Firestore using this ID */}
    </View>
  );
}
