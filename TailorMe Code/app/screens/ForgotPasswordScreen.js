import React, { useState } from 'react';
import { View, Image, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Headline, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { StatusBar } from 'expo-status-bar';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (text) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(text) && text.length > 0) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

    const handleResetPassword = async () => {
    if (!email) {
        Alert.alert("Missing Information", "Please enter your email address");
        return;
    }

    if (emailError) {
        Alert.alert('Validation Error', 'Please fix the errors before submitting.');
        return;
    }

    setIsLoading(true);

    try {
        await sendPasswordResetEmail(auth, email);
        setIsLoading(false);
        Alert.alert(
        "Email Sent",
        "If an account exists with this email, you'll receive password reset instructions.",
        [
            { text: "OK", onPress: () => navigation.goBack() }
        ]
        );
    } catch (error) {
        setIsLoading(false);
        if (error.code === 'auth/user-not-found') {
        Alert.alert(
            "Email Not Found",
            "This email address isn't registered. Please check or sign up for a new account."
        );
        } else {
        Alert.alert("Error", error.message);
        }
    }
    };

  return (
    <>
      <StatusBar style="auto" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <LinearGradient
            colors={['#f7f7f7', '#f2f2f7']}
            style={styles.container}
          >
            <Animatable.View animation="fadeIn" duration={1000} style={styles.headerContainer}>
              <Image
                source={require('../../assets/images/tailor.png')}
                style={styles.logo}
              />
              <Animatable.View animation="fadeInUp" delay={300}>
                <Headline style={styles.appName}>Tailor Me</Headline>
                <Text style={styles.tagline}>Reset your password</Text>
              </Animatable.View>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={600}>
              <Surface style={styles.formSurface}>
                <Text style={styles.formTitle}>Forgot Password</Text>
                <Text style={styles.instructions}>
                  Enter your email address and we'll send you a link to reset your password.
                </Text>

                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    validateEmail(text);
                  }}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  left={<TextInput.Icon icon="email" />}
                  error={!!emailError}
                />
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                <Button
                  mode="contained"
                  onPress={handleResetPassword}
                  style={styles.button}
                  loading={isLoading}
                  disabled={isLoading}
                  labelStyle={{ color: 'white' }}
                >
                  Send Reset Link
                </Button>

                <View style={styles.footer}>
                  <Button
                    mode="text"
                    onPress={() => navigation.goBack()}
                    compact
                  >
                    Back to Login
                  </Button>
                </View>
              </Surface>
            </Animatable.View>
          </LinearGradient>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#6200ee',
    marginTop: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  formSurface: {
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 12,
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#6200ee',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
});