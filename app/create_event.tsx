import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, View } from 'react-native';
import { collection, addDoc, Timestamp, getDoc, doc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useRouter } from 'expo-router';

export default function CreateEvent() {
  const [eventTitle, setEventTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [invitedUsername, setInvitedUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<Array<{id: string, username: string}>>([]);
  const router = useRouter();

  const handleCreateEvent = async () => {
    const user = auth.currentUser;

    if (!user || !eventTitle || !description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, 'events'), {
        eventTitle,
        description,
        locations: location ? [location] : [],
        creatorId: user.uid,
        invitedUsers: invitedUsers.length > 0 ? invitedUsers.map(u => u.id) : [user.uid],
        createdAt: Timestamp.now(),
      });

      Alert.alert('Success', 'Event created successfully');
      router.back();
    } catch (error) {
      console.error('Error creating event: ', error);
      Alert.alert('Error', 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!invitedUsername) {
      Alert.alert('Error', 'Please enter a username to invite');
      return;
    }

    try {
      const usernameDoc = await getDoc(doc(db, 'usernames', invitedUsername));

      if (!usernameDoc.exists()) {
        Alert.alert('Error', 'User not found');
        return;
      }

      const invitedUserId = usernameDoc.data().uid;
      const userDoc = await getDoc(doc(db, 'users', invitedUserId));
      const userData = userDoc.data();
      if (!userData) {
        throw new Error('User data not found');
      }
      
      setInvitedUsers(prevUsers => [...prevUsers, { id: invitedUserId, username: userData.username }]);
      setInvitedUsername('');
    } catch (error) {
      Alert.alert('Error', 'Failed to invite user');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Create New Event</Text>
        <TextInput
          style={styles.input}
          placeholder="Event Title"
          placeholderTextColor="#aaa"
          value={eventTitle}
          onChangeText={setEventTitle}
        />
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Description"
          placeholderTextColor="#aaa"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Location (optional)"
          placeholderTextColor="#aaa"
          value={location}
          onChangeText={setLocation}
        />
        <TextInput
          style={styles.input}
          placeholder="Invite user by username"
          placeholderTextColor="#aaa"
          value={invitedUsername}
          onChangeText={setInvitedUsername}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleInviteUser}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Invite User</Text>
        </TouchableOpacity>
        {invitedUsers.map((user, index) => (
          <Text key={index} style={styles.invitedUser}>{user.username}</Text>
        ))}
        <TouchableOpacity
          style={styles.button}
          onPress={handleCreateEvent}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating...' : 'Create Event'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    fontSize: 16,
    color: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff',
    paddingVertical: 10,
    marginBottom: 20,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  invitedUser: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 10,
  },
});
