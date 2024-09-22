// app/events.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { collection, query, where, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';  // Firebase setup
import { useRouter } from 'expo-router';

export default function Events() {
  interface Event {
    id: string;
    eventTitle: string;
    description: string;
    locations: string[];
    creatorId: string;
    invitedUsers: string[];
    createdAt: Timestamp;
  }

  const [events, setEvents] = useState<Event[]>([]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
        return;
    }

    // Firestore query to get events created by the user or where the user is invited
    const q = query(
      collection(db, 'events'),
      where('invitedUsers', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          eventTitle: data.eventTitle,
          description: data.description,
          locations: data.locations,
          creatorId: data.creatorId,
          invitedUsers: data.invitedUsers,
          createdAt: data.createdAt,
        };
      });
      setEvents(eventsData);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateEvent = async () => {
    const user = auth.currentUser;

    if (!user || !newEventTitle || !newEventDescription) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, 'events'), {
        eventTitle: newEventTitle,
        description: newEventDescription,
        locations: [],
        creatorId: user.uid,
        invitedUsers: [user.uid],
        createdAt: Timestamp.now(),
      });

      setNewEventTitle('');
      setNewEventDescription('');
    } catch (error) {
      console.error('Error creating event: ', error);
      alert('Error creating event');
    } finally {
      setLoading(false);
    }
  };

  const renderEvent = ({ item }: { item: { id: string; eventTitle: string; creatorId: string } }) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: `./events/${item.id}` })}
      style={styles.eventContainer}
    >
      <Text style={styles.eventTitle}>{item.eventTitle}</Text>
      <Text>Creator: {auth.currentUser && item.creatorId === auth.currentUser.uid ? 'You' : item.creatorId}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your Events</Text>
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>No events found.</Text>}
      />

      <Text style={styles.heading}>Create New Event</Text>
      <TextInput
        placeholder="Event Title"
        value={newEventTitle}
        onChangeText={setNewEventTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="Event Description"
        value={newEventDescription}
        onChangeText={setNewEventDescription}
        style={styles.input}
      />
      <Button title={loading ? 'Creating...' : 'Create Event'} onPress={handleCreateEvent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 20,
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  eventContainer: {
    padding: 15,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 10,
    borderRadius: 5,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
