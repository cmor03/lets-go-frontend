import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  Button,
  Dialog,
  Divider,
  HelperText,
  Portal,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import styles from "../styles";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { useRouter } from "expo-router";

interface PasswordResetErrors {
  email?: string;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<PasswordResetErrors>({});
  const [showDialog, setShowDialog] = useState(false);
  const theme = useTheme();
  const auth = getAuth();
  const router = useRouter();

  const validateForm = () => {
    const newErrors: PasswordResetErrors = {};
    if (!email || !/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Enter a valid email address.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordReset = async () => {
    if (!validateForm()) return;
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      if (error instanceof Error) setErrors({ email: error.message });
    } finally {
      setShowDialog(true);
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
        <TouchableWithoutFeedback
          onPress={Platform.OS != "web" ? Keyboard.dismiss : () => {}}
        >
          <View style={styles.inner}>
            <Text
              variant="headlineMedium"
              style={{ textAlign: "center", fontWeight: "bold" }}
            >
              Forgot your password?
            </Text>
            <Text variant="bodyLarge" style={{ textAlign: "center" }}>
              Enter your email address below.
            </Text>
            <View style={{ marginVertical: 12 }}>
              <TextInput
                mode="outlined"
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {"email" in errors && (
                <HelperText type="error">{errors.email}</HelperText>
              )}
            </View>
            <Text
              variant="bodyMedium"
              style={{ textAlign: "center", color: theme.colors.tertiary }}
            >
              Note: It may take a few minutes for the email to be sent. If you
              cannot find it, check for it in your "Promotions" and spam
              folders.
            </Text>
            <Button
              icon="lock-reset"
              mode="contained-tonal"
              rippleColor={theme.colors.primary}
              style={{ marginTop: "auto" }}
              onPress={handlePasswordReset}
            >
              Request Password Reset
            </Button>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
      <Portal>
        <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
          <Dialog.Icon icon="email-check" />
          <Dialog.Title>Success</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              An email has been sent to you with a link to reset your password.
              It may take a few minutes to arrive.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDialog(false)}>Dismiss</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  );
}
