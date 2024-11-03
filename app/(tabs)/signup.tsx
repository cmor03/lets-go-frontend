import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  TouchableOpacity,
  View,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import styles from "../styles";
import { LogoHeader } from "./index";
import { Button, HelperText, TextInput, useTheme } from "react-native-paper";
import { useAuthState } from "react-firebase-hooks/auth";

interface Errors {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  birthday?: string;
}

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthday, setBirthday] = useState<undefined | Date>(undefined);
  const [showBirthdayPicker, setShowBirthdayPicker] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const router = useRouter();
  const theme = useTheme();

  const validateForm = () => {
    let newErrors: Errors = {};
    if (!firstName.trim()) newErrors.firstName = "First name required";
    if (!lastName.trim()) newErrors.lastName = "Last name required";
    if (!username.trim()) newErrors.username = "Username required";
    if (!email.trim()) newErrors.email = "Email required";
    if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email address";
    if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (birthday == undefined) newErrors.birthday = "Date of birth is required";
    else if (birthday > new Date())
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
        birthday: birthday!.toISOString(),
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", user.uid), userData);
      await setDoc(doc(db, "usernames", username), { uid: user.uid });

      console.log("User created successfully:", user.uid);
      router.replace("/main/");
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.code === "auth/email-already-in-use") {
        setErrors((prev) => ({ ...prev, email: "Email already in use" }));
      } else if (error.code === "auth/invalid-email") {
        setErrors((prev) => ({ ...prev, email: "Email is invalid" }));
      } else if (error.code === "auth/weak-password") {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Password is too weak",
        }));
      } else {
        Alert.alert("Error", `Failed to create account: ${error.message}`);
      }
    }
  };

  const onChangeBirthday = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    setShowBirthdayPicker(false);
    if (selectedDate === undefined || event.type == "dismissed") return;
    setBirthday(selectedDate);
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
        <TouchableWithoutFeedback
          onPress={Platform.OS != "web" ? Keyboard.dismiss : () => {}}
        >
          <View style={styles.inner}>
            <LogoHeader />
            <NameInput
              firstName={firstName}
              onChangeFirstName={setFirstName}
              firstNameError={"firstName"}
              lastName={lastName}
              onChangeLastName={setLastName}
              errorObj={errors}
            />
            <View>
              <TextInput
                label="Username"
                mode="outlined"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
              {"username" in errors && (
                <HelperText type="error">{errors.username}</HelperText>
              )}
            </View>
            <View>
              <TextInput
                label="Email Address"
                mode="outlined"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {"email" in errors && (
                <HelperText type="error">{errors.email}</HelperText>
              )}
            </View>
            <View>
              <Button
                style={styles.flexGrow}
                mode="outlined"
                onPress={() =>
                  Platform.OS == "web"
                    ? setBirthday(new Date(0))
                    : setShowBirthdayPicker(true)
                }
              >
                {birthday ? birthday.toLocaleDateString() : "Date of Birth"}
              </Button>
              {"birthday" in errors && (
                <HelperText type="error">{errors.birthday}</HelperText>
              )}
              {showBirthdayPicker && (
                <DateTimePicker
                  value={birthday || new Date()}
                  mode={"date"}
                  onChange={onChangeBirthday}
                />
              )}
            </View>
            <View>
              <TextInput
                label="Password"
                mode="outlined"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                autoCapitalize="none"
              />
              {"password" in errors && (
                <HelperText type="error">{errors.password}</HelperText>
              )}
            </View>
            <View>
              <TextInput
                label="Confirm Password"
                mode="outlined"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={true}
                autoCapitalize="none"
              />
              {"confirmPassword" in errors && (
                <HelperText type="error">{errors.confirmPassword}</HelperText>
              )}
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
  firstNameError: string;
  lastName: string;
  onChangeLastName: (lastName: string) => void;
  errorObj: Errors;
}

const NameInput: React.FC<NameInputProps> = ({
  firstName,
  onChangeFirstName,
  firstNameError,
  lastName,
  onChangeLastName,
  errorObj,
}) => {
  return (
    <View style={styles.flexRow}>
      <View style={styles.flexGrow}>
        <TextInput
          label="First Name"
          value={firstName}
          onChangeText={onChangeFirstName}
          mode="outlined"
        />
        {"firstName" in errorObj && (
          <HelperText type="error">{errorObj.firstName}</HelperText>
        )}
      </View>
      <View style={styles.flexGrow}>
        <TextInput
          label="Last Name"
          value={lastName}
          onChangeText={onChangeLastName}
          mode="outlined"
        />
        {"lastName" in errorObj && (
          <HelperText type="error">{errorObj.lastName}</HelperText>
        )}
      </View>
    </View>
  );
};

export default Signup;
