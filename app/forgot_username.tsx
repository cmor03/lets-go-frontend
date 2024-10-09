import React, { useState } from 'react';
import { Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { auth, db } from './firebase';
import { ScrollView } from 'react-native-gesture-handler';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const ForgotUsername = () => {
    const [email, setEmail] = useState('');


    const handleForgotUsername = async () => {
        // FIREBASE CODE HERE
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Forgot Username (WIP)</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />

            <Button title="Submit" onPress={handleForgotUsername} />

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    input: {
        width: '100%',
        padding: 10,
        marginVertical: 10,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#ccc',
    },
});

export default ForgotUsername;
