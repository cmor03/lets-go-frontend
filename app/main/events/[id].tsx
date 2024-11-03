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
  Image,
  Linking,
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
import {
  Avatar,
  Button,
  Divider,
  Icon,
  List,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
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
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<Event | undefined>(undefined);
  const theme = useTheme();

  useEffect(() => {
    const fetchEvent = async () => {
      const eventDoc = await getDoc(doc(db, "events", id as string));
      if (eventDoc.exists()) {
        const eventData = { id: eventDoc.id, ...eventDoc.data() } as Event;
        setEvent(eventData);
      } else {
        console.log("No such event!");
      }
    };

    fetchEvent().catch(console.error);
  }, [id]);

  const openMaps = () => {
    if (Platform.OS == "web") return;

    const scheme = Platform.select({
      ios: "maps://0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${39.75344474079665},${-105.22940811833696}`;
    const label = event?.eventTitle;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    Linking.openURL(url!).catch(console.error);
  };

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
            <View style={styles.eventHeader}>
              <View>
                <Text variant="displayMedium" style={styles.boldText}>
                  {event ? event.eventTitle : " "}
                </Text>
                <View style={styles.eventInfoBar}>
                  <Icon size={18} source="calendar" />
                  <Text
                    variant="bodyLarge"
                    style={{ color: theme.colors.tertiary }}
                  >
                    Jun 10, 2024 • RSVP by Jun 5, 2024
                  </Text>
                </View>
                <View style={styles.eventInfoBar}>
                  <Icon size={18} source="clock-outline" />
                  <Text
                    variant="bodyLarge"
                    style={{ color: theme.colors.tertiary }}
                  >
                    45 min
                  </Text>
                </View>
              </View>
              <View style={styles.organizerBlock}>
                <Avatar.Icon size={34} icon="account" />
                <View>
                  <Text variant="bodyLarge" style={styles.boldText}>
                    Sherlock Holmes
                  </Text>
                  <Text
                    variant="bodyLarge"
                    style={{ marginTop: -4, color: theme.colors.tertiary }}
                  >
                    Host
                  </Text>
                </View>
              </View>
            </View>
            <Divider />
            <Image
              style={{
                width: "auto",
                height: 200,
                borderRadius: theme.roundness,
              }}
              source={{
                uri: "https://imgur.com/p7XkTEN.jpg",
              }}
            />
            <View style={styles.attendants}>
              <View style={styles.attendantAvatarBox}>
                <Surface style={styles.attendantAvatar}>
                  <Avatar.Icon size={34} icon="account" />
                </Surface>
                <Surface style={styles.attendantAvatar}>
                  <Avatar.Icon size={34} icon="account" />
                </Surface>
                <Surface style={styles.attendantAvatar}>
                  <Avatar.Icon size={34} icon="account" />
                </Surface>
                <Surface style={styles.attendantAvatar}>
                  <Avatar.Icon size={34} icon="account" />
                </Surface>
                <Surface style={styles.attendantAvatar}>
                  <Avatar.Icon size={34} icon="account" />
                </Surface>
              </View>
              <Text variant="bodyLarge">+12 more</Text>
            </View>
            <View>
              <View style={styles.eventInfoBar}>
                <Text variant="bodyLarge" style={styles.boldText}>Event Locations</Text>
                <Icon size={24} source="chevron-down" />
              </View>
              <List.Item 
                title="221B Baker St"
                description="Jun 10, 2024 9:41 AM"
                left={props => <Icon source="map-marker" size={34}/>}
              />
            </View>
            <View>
              <Text variant="bodyLarge" style={styles.boldText}>Description</Text>
              <Text variant="bodyLarge">{event ? event.description.trim() : " "}</Text>
            </View>
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
          onPress={openMaps}
          style={styles.flexGrow}
        >
          Get Directions
        </Button>
      </Surface>
    </KeyboardAvoidingView>
  );
}
