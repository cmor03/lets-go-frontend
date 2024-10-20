import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  TouchableOpacity,
  View,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform
} from "react-native";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import styles from "../styles";
import { LogoHeader } from "./index";
import { Button, HelperText, TextInput, useTheme } from "react-native-paper";

interface Errors {
  firstName?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  birthday?: string;
}

interface Birthday {
  date: Date;
  defined: boolean;
}

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthday, setBirthday] = useState<Birthday>({ date: new Date(), defined: false });
  const [errors, setErrors] = useState<Errors>({});
  const router = useRouter();
  const theme = useTheme();

  const validateForm = () => {
    let newErrors: Errors = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!username.trim()) newErrors.username = "Username is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";
    if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (birthday.date > new Date())
      newErrors.birthday = "Birthday can't be in the future";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkUsernameUniqueness = async () => {
    const usernameDoc = await getDoc(doc(db, "usernames", username));
    if (usernameDoc.exists()) {
      setErrors((prev) => ({ ...prev, username: "Username already taken" }));
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    const isUsernameUnique = await checkUsernameUniqueness();
    if (!isUsernameUnique) return;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userData = {
        firstName,
        username,
        email,
        birthday: birthday.date.toISOString(),
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", user.uid), userData);
      await setDoc(doc(db, "usernames", username), { uid: user.uid });

      console.log("User created successfully:", user.uid);
      router.push("/events");
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.code === "auth/email-already-in-use") {
        setErrors((prev) => ({ ...prev, email: "Email already in use" }));
      } else if (error.code === "auth/invalid-email") {
        setErrors((prev) => ({ ...prev, email: "Email is invalid" }));
      } else if (error.code === "auth/weak-password") {
        setErrors((prev) => ({ ...prev, confirmPassword: "Password is too weak" }));
      } else {
        Alert.alert("Error", `Failed to create account: ${error.message}`);
      }
    }
  };

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
        <TouchableWithoutFeedback onPress={Platform.OS != "web" ? Keyboard.dismiss : () => { }}>
          <View style={styles.inner}>
            <LogoHeader />
            <NameInput
              firstName={firstName}
              onChangeFirstName={setFirstName}
              lastName={lastName}
              onChangeLastName={setLastName}
            />
            <View>
              <TextInput label="Username" mode="outlined" value={username} onChangeText={setUsername} autoCapitalize="none" />
              {'username' in errors && <HelperText type="error">{errors.username}</HelperText>}
            </View>
            <View>
              <TextInput label="Email Address" mode="outlined" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              {'email' in errors && <HelperText type="error">{errors.email}</HelperText>}
            </View>
            <View style={styles.flexRow}>
              <Button style={styles.flexGrow} mode="outlined" onPress={() => {setBirthday({ defined: true, date: new Date('1995-12-17T03:24:00') }) }}>{birthday.defined ? birthday.date.toLocaleDateString() : "Date of Birth"}</Button>
            </View>
            <View>
              <TextInput label="Password" mode="outlined" value={password} onChangeText={setPassword} secureTextEntry={true} autoCapitalize="none" />
              {'password' in errors && <HelperText type="error">{errors.password}</HelperText>}
            </View>
            <View>
              <TextInput label="Confirm Password" mode="outlined" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={true} autoCapitalize="none" />
              {'confirmPassword' in errors && <HelperText type="error">{errors.confirmPassword}</HelperText>}
            </View>
            <Button
              icon="account-plus"
              mode="contained-tonal"
              onPress={handleSignup}
              style={{ marginTop: "auto" }}
            >
              Register
            </Button>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

interface NameInputProps {
  firstName: string;
  onChangeFirstName: (firstName: string) => void;
  lastName: string;
  onChangeLastName: (lastName: string) => void;
}

const NameInput: React.FC<NameInputProps> = ({
  firstName,
  onChangeFirstName,
  lastName,
  onChangeLastName,
}) => {
  return (
    <View style={styles.flexRow}>
      <TextInput label="First Name" value={firstName} onChangeText={onChangeFirstName} mode="outlined" style={styles.flexGrow} />
      <TextInput label="Last Name" value={lastName} onChangeText={onChangeLastName} mode="outlined" style={styles.flexGrow} />
    </View>
  );
};

export default Signup;
