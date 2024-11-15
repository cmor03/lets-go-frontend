import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
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
import styles from "../../styles";

interface LoginErrors {
  [key: string]: string | undefined;
  email?: string;
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
import { FirebaseError } from "firebase/app";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const router = useRouter();
  const theme = useTheme();

  const validateForm: () => Promise<boolean> = async() => {
    const newErrors: LoginErrors = {};
    if (!email) newErrors.email = "Enter an email address";
    if (!password) newErrors.password = "Enter a password"
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleLoginError = (error: FirebaseError) => {
    if (error.code == "auth/invalid-credential") setErrors((prev) => ({...prev, password: "Authentication failed. Invalid credentials."}));
    if (error.code == "auth/too-many-requests") setErrors((prev) => ({...prev, password: "Authentication failed. This account is temporarily disabled due to repeated failed login attemps."}));
  }

  const handleLogin = async () => {
    if (!(await validateForm())) return;

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      router.push("/main/");
    } catch (error) {
      if (error instanceof FirebaseError)
        handleLoginError(error);
    } finally {
      setLoading(false);
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
        <TouchableWithoutFeedback onPress={Platform.OS != "web" ? Keyboard.dismiss : ()=>{}}>
          <View style={styles.inner}>
            <LogoHeader useIcon={true}/>
            <View>
              <TextInput
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                mode="outlined"
              />
              <HelperText type="error"> {errors.email}</HelperText>
            </View>
            <TextInputWithLink
              label="Password"
              value={password}
              onChangeValue={setPassword}
              onForgot={() => router.push("/auth/forgot_password")}
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
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeValue}
        mode="outlined"
        secureTextEntry={password}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
      <View>
        <TouchableOpacity onPress={onForgot}>
          <Text
            variant="labelMedium"
            style={{ ...styles.underline, color: theme.colors.primary }}
          >
            Forgot {label}
          </Text>
        </TouchableOpacity>
        {errorKey in errorObj && <HelperText type="error">{errorObj[errorKey]}</HelperText>}
      </View>
    </View>
  );
};