import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Provider as PaperProvider, DefaultTheme, Headline, Surface, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { StatusBar } from 'expo-status-bar';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';

// Custom theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    accent: '#03dac4',
    background: '#f7f7f7',
    surface: '#ffffff',
    error: '#B00020',
  },
};

export default function SignUpScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Validate email format
  const validateEmail = (text) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(text) && text.length > 0) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  // Validate password strength
  const validatePassword = (text) => {
    if (text.length > 0 && text.length < 6) {
      setPasswordError('Password must be at least 6 characters');
    } else {
      setPasswordError('');
    }
  };

  const handleSignUp = async () => {
    if (!name || !username || !email || !password) {
      Alert.alert('Missing Information', 'Please fill in all fields.');
      return;
    }

    if (emailError || passwordError) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting.');
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: name,
        username: username,
        email: user.email,
        role: role,
        createdAt: new Date(),
      });

      setIsLoading(false);
      Alert.alert('Success', 'Your account has been created successfully!');
      navigation.navigate('LoginScreen');
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Registration Failed', error.message);
    }
  };

  return (
    <PaperProvider theme={theme}>
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
                <Text style={styles.tagline}>Create your perfect fit</Text>
              </Animatable.View>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={600}>
              <Surface style={styles.formSurface}>
                <Text style={styles.formTitle}>Create Account</Text>

                <TextInput
                  label="Full Name"
                  value={name}
                  onChangeText={setName}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="account" />}
                />

                <TextInput
                  label="Username"
                  value={username}
                  onChangeText={setUsername}
                  mode="outlined"
                  style={styles.input}
                  autoCapitalize="none"
                  left={<TextInput.Icon icon="at" />}
                />

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
                {emailError ? <HelperText type="error">{emailError}</HelperText> : null}

                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    validatePassword(text);
                  }}
                  mode="outlined"
                  style={styles.input}
                  secureTextEntry={!passwordVisible}
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={passwordVisible ? "eye-off" : "eye"}
                      onPress={() => setPasswordVisible(!passwordVisible)}
                    />
                  }
                  error={!!passwordError}
                />
                {passwordError ? <HelperText type="error">{passwordError}</HelperText> : null}

                <Text style={styles.roleLabel}>I am a:</Text>
                <View style={styles.toggleRow}>
                  <TouchableOpacity
                    style={[styles.customToggle, role === 'user' && styles.activeToggle]}
                    onPress={() => setRole('user')}
                  >
                    <Text style={[styles.toggleIcon, role === 'user' && styles.activeToggleText]}>👤</Text>
                    <Text style={[styles.toggleText, role === 'user' && styles.activeToggleText]}>Normal User</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.customToggle, role === 'tailor' && styles.activeToggle]}
                    onPress={() => setRole('tailor')}
                  >
                    <Text style={[styles.toggleIcon, role === 'tailor' && styles.activeToggleText]}>✂️</Text>
                    <Text style={[styles.toggleText, role === 'tailor' && styles.activeToggleText]}>Tailor</Text>
                  </TouchableOpacity>
                </View>

                <Button
                  mode="contained"
                  onPress={handleSignUp}
                  style={styles.button}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  <Text>Sign Up</Text>
                </Button>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>Already have an account?</Text>
                  <Button
                    mode="text"
                    onPress={() => navigation.navigate('LoginScreen')}
                    compact
                  >
                    <Text>Login</Text>
                  </Button>
                </View>
              </Surface>
            </Animatable.View>
          </LinearGradient>
        </ScrollView>
      </KeyboardAvoidingView>
    </PaperProvider>
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
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  roleLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    marginBottom: 8,
  },
  toggleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },
  customToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minWidth: 120,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  toggleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 100,
  },
  toggleIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  toggleText: {
    fontSize: 16,
    color: '#666',
  },
  activeToggle: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  activeToggleText: {
    color: '#fff',
  },
  button: {
    marginTop: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#666',
  },
});