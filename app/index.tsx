import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './firebase';
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (identifier === '' || password === '') {
      setErrorMessage('Please enter username/email and password');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      let email = identifier;
      
      // Check if the identifier is a username
      if (!identifier.includes('@')) {
        // Get the email associated with the username
        const usernameDoc = await getDoc(doc(db, 'usernames', identifier));
        
        if (!usernameDoc.exists()) {
          throw new Error('User not found');
        }
        
        const userId = usernameDoc.data().uid;
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.data();
        if (!userData) throw new Error('User data not found');
        email = userData.email;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      router.push('/events');
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  const handleForgotUsername = () => {
    router.push('/forgot_username');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>LET'S GO</Text>
      <TextInput
        placeholder="Username or Email"
        value={identifier}
        onChangeText={(text) => setIdentifier(text)}
        style={styles.input}
        autoCapitalize="none"
        placeholderTextColor="#B0B0B0"
      />
      <View style={styles.forgotUsernameContainer}>
        <TouchableOpacity onPress={handleForgotUsername}>
          <Text style={styles.forgotUsernameButton}>Forgot Username</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={(text) => setPassword(text)}
        style={styles.input}
        secureTextEntry
        placeholderTextColor="#B0B0B0"
      />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      <TouchableOpacity 
        style={styles.loginButton} 
        onPress={handleLogin} 
        disabled={loading}
      >
        <Text style={styles.loginButtonText}>{loading ? "Loading..." : "Login"}</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator style={styles.loadingIndicator} color="#007AFF" />}
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Not a member?</Text>
        <TouchableOpacity onPress={handleSignUp}>
          <Text style={styles.signUpButton}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#A4C2A8',
  },
  logo: {
    fontFamily: 'sans-serif',
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#28502E',
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
    backgroundColor: '#28502E',
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
    color: '#28502E',
    marginRight: 5,
  },
  signUpButton: {
    fontSize: 16,
    color: '#28502E',
    fontWeight: 'bold',
  },
  forgotUsernameButton: {
    fontSize: 12,
    color: '#28502E',
  },
  errorText: {
    color: '#FF6347',
    textAlign: 'center',
    marginBottom: 10,
  },
});
