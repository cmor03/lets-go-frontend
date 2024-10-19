import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  View,
  Touchable,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import styles from "../styles";

import {
  useTheme,
  Text,
  Button,
  TextInput,
  HelperText,
  Icon,
} from "react-native-paper";
export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const theme = useTheme();

  const handleLogin = async () => {
    if (identifier === "" || password === "") {
      setErrorMessage("Please enter username/email and password");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      let email = identifier;

      // Check if the identifier is a username
      if (!identifier.includes("@")) {
        // Get the email associated with the username
        const usernameDoc = await getDoc(doc(db, "usernames", identifier));

        if (!usernameDoc.exists()) {
          throw new Error("User not found");
        }

        const userId = usernameDoc.data().uid;
        const userDoc = await getDoc(doc(db, "users", userId));
        const userData = userDoc.data();
        if (!userData) throw new Error("User data not found");
        email = userData.email;
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      router.push("/events");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  const handleForgotUsername = () => {
    router.push("/forgot_username");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <LogoHeader />
            <TextInputWithLink
              label="Username or Email Address"
              value={identifier}
              onChangeValue={setIdentifier}
              onForgot={() => console.log("Identifier was Forgotten")}
            />
            <TextInputWithLink
              label="Password"
              value={password}
              onChangeValue={setPassword}
              onForgot={() => Alert.alert("Hello", "world")}
            />
            <Button
              icon="login"
              mode="contained-tonal"
              rippleColor={theme.colors.primary}
              onPress={() => {}}
              style={{ marginTop: "auto" }}
            >
              Log In
            </Button>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const LogoHeader = () => {
  return (
    <View style={{ alignItems: "center", gap: 16 }}>
      <Text
        variant="displayLarge"
        style={{ textAlign: "center", fontWeight: "bold" }}
      >
        Let's Go
      </Text>
      <Icon source="compass-outline" size={80} />
    </View>
  );
};

interface Props {
  label: string;
  value: string;
  onChangeValue: (text: string) => void;
  onForgot: () => void;
}

const TextInputWithLink: React.FC<Props> = ({
  label,
  value,
  onChangeValue,
  onForgot,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.loginTextInputWithLink}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeValue}
        mode="outlined"
        secureTextEntry={true}
      />
      <TouchableOpacity onPress={onForgot}>
        <Text
          variant="labelMedium"
          style={{ ...styles.underline, color: theme.colors.primary }}
        >
          Forgot {label}
        </Text>
      </TouchableOpacity>
    </View>
  );
};