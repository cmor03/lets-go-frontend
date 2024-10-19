import React, { useState } from 'react';
import { Text, TextInput, Button, StyleSheet, Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../firebase';
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
            {/* <Text style={styles.title}>Sign Up</Text> */}

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

            <TouchableOpacity 
                style={styles.loginButton} 
                onPress={handleSignup}
            >
                <Text style={styles.loginButtonText}>Sign Up</Text>
            </TouchableOpacity>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
      backgroundColor: '#121212',
    },
    logo: {
      fontFamily: 'sans-serif',
      fontSize: 48,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 40,
      color: '#007AFF',
    },
    input: {
      height: 50,
      borderColor: '#1E1E1E',
      borderWidth: 1,
      marginBottom: 15,
      paddingHorizontal: 10,
      borderRadius: 5,
      backgroundColor: '#1E1E1E',
      marginHorizontal: 20,
      color: '#FFFFFF',
    },
    loginButton: {
      backgroundColor: '#007AFF',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 25,
      marginTop: 20,
      alignSelf: 'center',
    },
    loginButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    loadingIndicator: {
      marginTop: 10,
    },
    signUpContainer: {
      marginTop: 20,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    forgotUsernameContainer: {
      alignItems: 'flex-start',
      marginHorizontal: 35,
      marginTop: -10,
      marginBottom: 5,
    },
    signUpText: {
      fontSize: 16,
      color: '#B0B0B0',
      marginRight: 5,
    },
    signUpButton: {
      fontSize: 16,
      color: '#007AFF',
      fontWeight: 'bold',
    },
    forgotUsernameButton: {
      fontSize: 12,
      color: '#007AFF',
    },
    errorText: {
      color: '#FF6347',
      textAlign: 'center',
      marginBottom: 10,
    },
  });
  

export default Signup;
