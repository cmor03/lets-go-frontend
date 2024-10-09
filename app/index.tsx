import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { useRouter } from 'expo-router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (email === '' || password === '') {
      setErrorMessage('Please enter email and password');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
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
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
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
      />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      <View style={styles.buttonContainer}>
        <Button title={loading ? "Loading..." : "Login"} onPress={handleLogin} disabled={loading} />
        {loading && <ActivityIndicator style={styles.loadingIndicator} />}
      </View>
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
    backgroundColor: '#f5f5f5',
  },
  logo: {
    fontFamily: 'sans-serif',
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#ff6347',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginHorizontal: 20,
  },
  buttonContainer: {
    marginTop: 20,
    marginHorizontal: 100,
    color: '#ff6347',
  },
  loadingIndicator: {
    marginTop: 10,
  },
  signUpContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  forgotUsernameContainer: {
    alignItems: 'flex-start',
    marginHorizontal: 20+15,
    marginTop: -10,
    marginBottom: 5,
  },
  signUpText: {
    fontSize: 16,
    color: '#333',
  },
  signUpButton: {
    fontSize: 16,
    color: '#ff6347',
    fontWeight: 'bold',
  },
  forgotUsernameButton: {
    fontSize: 12,
    color: '#28502E',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});
