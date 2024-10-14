import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';

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
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState<Event | null>(null);
  const [userInfos, setUserInfos] = useState<UserInfo[]>([]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventDoc = await getDoc(doc(db, 'events', id as string));
        if (eventDoc.exists()) {
          const eventData = { id: eventDoc.id, ...eventDoc.data() } as Event;
          setEvent(eventData);
          setEditedEvent(eventData);
          fetchUsernames(eventData.invitedUsers);
        } else {
          console.log('No such event!');
        }
      } catch (error) {
        console.error('Error fetching event: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const fetchUsernames = async (uids: string[]) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('uid', 'in', uids));
    const querySnapshot = await getDocs(q);
    const userInfos: UserInfo[] = [];
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      userInfos.push({ uid: userData.uid, username: userData.username });
    });
    setUserInfos(userInfos);
  };

  const handleRemoveUser = (uidToRemove: string) => {
    if (!editedEvent) return;
    const updatedInvitedUsers = editedEvent.invitedUsers.filter(uid => uid !== uidToRemove);
    setEditedEvent({ ...editedEvent, invitedUsers: updatedInvitedUsers });
    setUserInfos(userInfos.filter(info => info.uid !== uidToRemove));
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    if (!editedEvent) return;

    try {
      await updateDoc(doc(db, 'events', id as string), {
        eventTitle: editedEvent.eventTitle,
        description: editedEvent.description,
        locations: editedEvent.locations,
        invitedUsers: editedEvent.invitedUsers,
      });
      setEvent(editedEvent);
      setEditing(false);
      Alert.alert('Success', 'Event updated successfully');
    } catch (error) {
      console.error('Error updating event: ', error);
      Alert.alert('Error', 'Failed to update event');
    }
  };

  const handleCancel = () => {
    setEditedEvent(event);
    setEditing(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!event || !editedEvent) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Event not found</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <LinearGradient
        colors={['#121212', '#1E1E1E']}
        style={styles.gradient}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.title}>
            {editing ? (
              <TextInput
                style={styles.input}
                value={editedEvent.eventTitle}
                onChangeText={(text) => setEditedEvent({ ...editedEvent, eventTitle: text })}
              />
            ) : (
              event.eventTitle
            )}
          </Text>
          <Text style={styles.label}>Description:</Text>
          {editing ? (
            <TextInput
              style={[styles.input, styles.multilineInput]}
              multiline
              value={editedEvent.description}
              onChangeText={(text) => setEditedEvent({ ...editedEvent, description: text })}
            />
          ) : (
            <Text style={styles.text}>{event.description}</Text>
          )}
          <Text style={styles.label}>Creator ID:</Text>
          <Text style={styles.text}>{event.creatorId}</Text>
          <Text style={styles.label}>Locations:</Text>
          {editing ? (
            editedEvent.locations.map((location, index) => (
              <TextInput
                key={index}
                style={styles.input}
                value={location}
                onChangeText={(text) => {
                  const newLocations = [...editedEvent.locations];
                  newLocations[index] = text;
                  setEditedEvent({ ...editedEvent, locations: newLocations });
                }}
              />
            ))
          ) : (
            event.locations.map((location, index) => (
              <Text key={index} style={styles.text}>{location}</Text>
            ))
          )}
          <Text style={styles.label}>Invited Users:</Text>
          {editing ? (
            userInfos.map((userInfo) => (
              <View key={userInfo.uid} style={styles.userItem}>
                <Text style={styles.text}>{userInfo.username}</Text>
                <TouchableOpacity onPress={() => handleRemoveUser(userInfo.uid)}>
                  <FontAwesome name="times" size={20} color="#FF6347" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            userInfos.map((userInfo) => (
              <Text key={userInfo.uid} style={styles.text}>{userInfo.username}</Text>
            ))
          )}
          <Text style={styles.label}>Created At:</Text>
          <Text style={styles.text}>{new Date(event.createdAt.seconds * 1000).toLocaleString()}</Text>
          
          {editing ? (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleEdit}>
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  gradient: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 15,
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderColor: '#1E1E1E',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#1E1E1E',
    color: '#FFFFFF',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#FF6347',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
});
