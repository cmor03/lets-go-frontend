// app/events.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { collection, query, where, onSnapshot, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
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
  const [usernames, setUsernames] = useState<{[key: string]: string}>({});

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

      // Fetch usernames immediately after setting events
      const allUserIds = [...new Set(eventsData.flatMap(event => [...event.invitedUsers]))];
      fetchUsernames(allUserIds);
    });

    // Fetch usernames for all users
    const fetchUsernames = async (userIds: string[]) => {
      const usernamePromises = userIds.map(async (uid) => {
        const userDoc = await getDoc(doc(db, 'users', uid));
        return { [uid]: userDoc.data()?.username || 'Unknown User' };
      });
      const usernameResults = await Promise.all(usernamePromises);
      const usernameMap = Object.assign({}, ...usernameResults);
      setUsernames(usernameMap);
    };

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

  const renderEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventItem}
      onPress={() => router.push({ pathname: `./events/${item.id}` })}
    >
      <Text style={styles.eventTitle}>{item.eventTitle}</Text>
      <Text style={styles.eventText}>Locations: {item.locations.length > 0 ? item.locations.join(', ') : 'No locations set'}</Text>
      <Text style={styles.eventText}>{item.description}</Text>
      
      <Text style={styles.eventText}>Date: {item.createdAt.toDate().toLocaleDateString()}</Text>
      <Text style={styles.eventText}>
        Invitees: {item.invitedUsers.map(uid => usernames[uid] || 'Loading...').join(', ')}
      </Text>
    </TouchableOpacity>
  );

  const handleCreateEventPress = () => {
    router.push('/create_event');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your Events</Text>
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No events found.</Text>}
      />

      <TouchableOpacity style={styles.createButton} onPress={handleCreateEventPress}>
        <Text style={styles.createButtonText}>Create New Event</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212', // Dark background
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ffffff', // White text
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
    color: '#ffffff', // White text
    marginBottom: 5,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 20,
    alignSelf: 'center',
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  eventItem: {
    padding: 15,
    backgroundColor: '#1E1E1E', // Slightly lighter than background
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3, // Add some depth
  },
  eventText: {
    color: '#B0B0B0', // Light gray text
    marginBottom: 3,
  },
  emptyText: {
    color: '#B0B0B0',
    textAlign: 'center',
    marginTop: 20,
  },
});
