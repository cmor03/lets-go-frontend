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
  const { id: string } = useLocalSearchParams();
  const theme = useTheme();

  

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
              <Text variant="displayMedium" style={styles.boldText}>Event Name</Text>
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
            <Text variant="bodyLarge">{"Lorem ipsum odor amet, consectetuer adipiscing elit. Morbi sollicitudin inceptos arcu adipiscing dui facilisis porttitor potenti. Phasellus eu faucibus mollis volutpat accumsan class magna. Ante sed rutrum primis etiam ipsum ut magna. Praesent nullam curae imperdiet, posuere proin a. Interdum tempus morbi iaculis nibh euismod diam nam malesuada. Nibh gravida vestibulum posuere; montes sit semper eu. Cras tincidunt sapien magna placerat placerat vel sollicitudin fames. Sed lacus parturient feugiat porttitor aptent sapien torquent. Litora neque donec praesent conubia nisi.\n\nUrna fames facilisis arcu curae; pretium morbi. Pulvinar in facilisi felis sed a ad ornare. Cubilia ullamcorper massa hendrerit suscipit maecenas quam tellus a. Sociosqu nec porttitor tristique nostra tempor faucibus. Interdum ipsum scelerisque duis leo per etiam quis sodales. Hendrerit placerat ipsum fermentum cubilia eget sit. Tortor morbi ante feugiat ut parturient; fermentum euismod. Urna vestibulum non nisi enim libero.\n\nVel risus tellus sed massa rhoncus duis risus. Penatibus penatibus nec arcu taciti primis? Fusce netus primis iaculis conubia eleifend accumsan. Finibus parturient et consectetur blandit consectetur. Gravida nam sem quis felis elementum lectus sem libero. Blandit magna finibus maecenas efficitur maecenas aenean mauris feugiat auctor. Cras nibh quisque condimentum taciti porttitor sem odio.\n\nInteger inceptos at gravida nostra magnis mi cras. Arcu rutrum himenaeos at sagittis, volutpat rhoncus. Class amet imperdiet cras venenatis arcu; pellentesque ultricies. Elit magnis feugiat est suspendisse sagittis facilisi vehicula amet tempor. Faucibus sem imperdiet, tristique ligula maecenas facilisi amet penatibus. Fames morbi natoque ullamcorper aptent porttitor convallis pellentesque. Ornare semper fringilla molestie ultrices ridiculus etiam.\n\nNam hendrerit praesent integer curabitur arcu; taciti aenean enim. Morbi laoreet sem sapien placerat morbi gravida integer. Nullam lobortis commodo ultrices mollis auctor purus. Velit risus condimentum class mus amet nascetur integer. Porta semper nisl maecenas cras inceptos posuere. Enim platea eu fames dui maecenas montes."}</Text>
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
