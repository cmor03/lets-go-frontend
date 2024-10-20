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
  Platform,
  KeyboardTypeOptions,
} from "react-native";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import styles from "../styles";

interface LoginErrors {
  [key: string]: string | undefined;
  identifier?: string;
  password?: string;
}

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
  const [errors, setErrors] = useState<LoginErrors>({});
  const router = useRouter();
  const theme = useTheme();

  const validateForm: () => Promise<boolean> = async() => {
    const newErrors: LoginErrors = {};
    if (!identifier) newErrors.identifier = "Enter a username or email address";
    if (!password) newErrors.password = "Enter a password"
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleLogin = async () => {
    if (!(await validateForm())) return;

    setLoading(true);

    try {
      let email = identifier;

      // Check if the identifier is a username
      if (!identifier.includes("@")) {
        // Get the email associated with the username
        const usernameDoc = await getDoc(doc(db, "usernames", identifier));

        if (!usernameDoc.exists()) {
          setErrors((prev) => ({...prev, identifier: "Invalid username or email address"}))
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
      console.error(error);
      if (error instanceof Error){
        Alert.alert("Error", error.message);
      }
    } finally {
      setLoading(false);
    }
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
        keyboardShouldPersistTaps="always"
      >
        <TouchableWithoutFeedback onPress={Platform.OS != "web" ? Keyboard.dismiss : ()=>{}}>
          <View style={styles.inner}>
            <LogoHeader useIcon={true}/>
            <TextInputWithLink
              label="Username or Email Address"
              value={identifier}
              onChangeValue={setIdentifier}
              onForgot={handleForgotUsername}
              keyboardType="email-address"
              errorKey="identifier"
              errorObj={errors}
            />
            <TextInputWithLink
              label="Password"
              value={password}
              onChangeValue={setPassword}
              onForgot={() => Alert.alert("Hello", "world")}
              password={true}
              errorKey="password"
              errorObj={errors}
            />
            <Button
              icon="login"
              mode="contained-tonal"
              rippleColor={theme.colors.primary}
              onPress={handleLogin}
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

interface LogoHeaderProps {
  useIcon?: boolean;
}

export const LogoHeader: React.FC<LogoHeaderProps> = ({useIcon = false}) => {
  return (
    <View style={{ alignItems: "center", gap: 16 }}>
      <Text
        variant="displayLarge"
        style={{ textAlign: "center", fontWeight: "bold" }}
      >
        Let's Go
      </Text>
      {useIcon && <Icon source="compass-outline" size={80} />}
    </View>
  );
};

interface TextInputWithLinkProps {
  label: string;
  value: string;
  onChangeValue: (text: string) => void;
  onForgot: () => void;
  password?: boolean;
  errorObj: LoginErrors;
  errorKey: string;
  keyboardType?: KeyboardTypeOptions;
}

const TextInputWithLink: React.FC<TextInputWithLinkProps> = ({
  label,
  value,
  onChangeValue,
  onForgot,
  password = false,
  errorObj,
  errorKey,
  keyboardType = "default",
}) => {
  const theme = useTheme();

  return (
    <View style={styles.loginTextInputWithLink}>
      <View>
        <TextInput
          label={label}
          value={value}
          onChangeText={onChangeValue}
          mode="outlined"
          secureTextEntry={password}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
        {errorKey in errorObj && <HelperText type="error">{errorObj[errorKey]}</HelperText>}
      </View>
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