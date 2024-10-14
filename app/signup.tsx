import React, { useState } from 'react';
import { Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, View } from 'react-native';
import { auth, db } from './firebase';
import { ScrollView } from 'react-native-gesture-handler';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Errors {
    firstName?: string;
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    birthday?: string;
}

const Signup = () => {
    const [firstName, setFirstName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [birthday, setBirthday] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [errors, setErrors] = useState<Errors>({});
    const router = useRouter();

    const validateForm = () => {
        let newErrors: Errors = {};
        if (!firstName.trim()) newErrors.firstName = "First name is required";
        if (!username.trim()) newErrors.username = "Username is required";
        if (!email.trim()) newErrors.email = "Email is required";
        if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";
        if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
        if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
        if (birthday > new Date()) newErrors.birthday = "Birthday can't be in the future";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const checkUsernameUniqueness = async () => {
        const usernameDoc = await getDoc(doc(db, 'usernames', username));
        if (usernameDoc.exists()) {
            setErrors(prev => ({ ...prev, username: "Username already taken" }));
            return false;
        }
        return true;
    };

    const handleSignup = async () => {
        if (!validateForm()) return;

        const isUsernameUnique = await checkUsernameUniqueness();
        if (!isUsernameUnique) return;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userData = {
                firstName,
                username,
                email,
                birthday: birthday.toISOString(),
                createdAt: serverTimestamp(),
            };

            await setDoc(doc(db, 'users', user.uid), userData);
            await setDoc(doc(db, 'usernames', username), { uid: user.uid });

            console.log('User created successfully:', user.uid);
            router.push('/events');
        } catch (error: any) {
            console.error('Signup error:', error);
            if (error.code === 'auth/email-already-in-use') {
                Alert.alert('Error', 'This email is already in use. Please use a different email.');
            } else if (error.code === 'auth/invalid-email') {
                Alert.alert('Error', 'The email address is not valid.');
            } else if (error.code === 'auth/weak-password') {
                Alert.alert('Error', 'The password is too weak. Please use a stronger password.');
            } else {
                Alert.alert('Error', `Failed to create account: ${error.message}`);
            }
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Sign Up</Text>

            <TextInput
                style={styles.input}
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
            />
            {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
            />
            {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

            <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <Text style={styles.input}>
                    {birthday.toLocaleDateString() || "Select Birthday"}
                </Text>
            </TouchableOpacity>
            {errors.birthday && <Text style={styles.errorText}>{errors.birthday}</Text>}

            {showDatePicker && (
                <DateTimePicker
                    value={birthday}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) setBirthday(selectedDate);
                    }}
                />
            )}

            <Button title="Sign Up" onPress={handleSignup} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
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
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
});

export default Signup;
