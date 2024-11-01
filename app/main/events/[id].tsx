import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  Image
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Avatar, Button, Divider, Icon, Surface, Text, useTheme } from "react-native-paper";
import styles from "../../styles";

interface Event {
  id: string;
  eventTitle: string;
  description: string;
  locations: string[];
  creatorId: string;
  invitedUsers: string[];
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

interface UserInfo {
  uid: string;
  username: string;
}

export default function EventDetails() {
  const { id } = useLocalSearchParams<{id: string}>();
  const [ event, setEvent ] = useState<Event | undefined>(undefined);
  const theme = useTheme();

  useEffect(() => {
    const fetchEvent = async () => {
      const eventDoc = await getDoc(doc(db, 'events', id as string));
      if (eventDoc.exists()) {
        const eventData = { id: eventDoc.id, ...eventDoc.data() } as Event;
        setEvent(eventData);
      } else {
        console.log('No such event!');
      }
    };

    fetchEvent()
      .catch(console.error);
  }, [id]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="always"
      >
        <TouchableWithoutFeedback
          onPress={Platform.OS != "web" ? Keyboard.dismiss : () => {}}
        >
          <View style={styles.inner}>
            <View>
              <Text variant="displayMedium" style={styles.boldText}>{event ? event.eventTitle : " "}</Text>
              <View style={styles.eventLocationInfo}>
                <Icon size={18} source="map-marker"/>
                <Text variant="bodyLarge">1310 Maple St, Golden, CO 80401</Text>
              </View>
              <Text variant="bodyLarge" style={{color: theme.colors.tertiary}} numberOfLines={1}>Jun 10, 2024 9:41 AM</Text>
            </View>
            <Divider />
            <Image
              style={{width: "auto", height: 200, borderRadius: theme.roundness}}
              source={{
                uri: 'https://imgur.com/UJnKfWR.jpg',
              }}
            />
            <View style={styles.attendants}>
              <View style={styles.attendantAvatarBox}>
                <Surface style={styles.attendantAvatar}><Avatar.Icon size={34} icon="account"/></Surface>
                <Surface style={styles.attendantAvatar}><Avatar.Icon size={34} icon="account"/></Surface>
                <Surface style={styles.attendantAvatar}><Avatar.Icon size={34} icon="account"/></Surface>
                <Surface style={styles.attendantAvatar}><Avatar.Icon size={34} icon="account"/></Surface>
                <Surface style={styles.attendantAvatar}><Avatar.Icon size={34} icon="account"/></Surface>
              </View>
              <Text variant="bodyLarge">+12 more</Text>
            </View>
            <Text variant="bodyLarge">{event ? event.description : " "}</Text>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
      <Surface style={styles.eventFooter}>
        <Button
          icon="account-voice"
          mode="contained"
          rippleColor={theme.colors.primary}
          onPress={() => null}
          style={styles.flexGrow}
        >
          RSVP
        </Button>
        <Button
          icon="directions"
          mode="contained-tonal"
          rippleColor={theme.colors.primary}
          onPress={() => null}
          style={styles.flexGrow}
        >
          Get Directions
        </Button>
      </Surface>
    </KeyboardAvoidingView>
  );
}
