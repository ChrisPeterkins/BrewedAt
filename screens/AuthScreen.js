import React, { useState } from 'react';
import { TextInput, TouchableOpacity, Text, StyleSheet, KeyboardAvoidingView, Platform, Image, View, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase.config';
import ScreenTransition from '../components/ScreenTransition';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [showTestAnimation, setShowTestAnimation] = useState(false);
  const [bgColor, setBgColor] = useState('#FAFAF8');

  const bgOptions = [
    { name: 'Dark', color: '#262f39', textColor: '#FFFFFF', isGradient: false, inputBg: 'rgba(255, 255, 255, 0.1)', inputBorder: 'rgba(255, 255, 255, 0.3)', inputText: '#FFFFFF' },
    { name: 'Off-white', color: '#FAFAF8', textColor: '#8B4513', isGradient: false, inputBg: '#FFFFFF', inputBorder: '#E0E0E0', inputText: '#1A1A1A' },
    { name: 'Cream', color: '#F5F5DC', textColor: '#654321', isGradient: false, inputBg: '#FFFFFF', inputBorder: '#D2B48C', inputText: '#1A1A1A' },
    { name: 'Wheat', color: '#FFF8E7', textColor: '#8B4513', isGradient: false, inputBg: '#FFFFFF', inputBorder: '#E8A540', inputText: '#1A1A1A' },
    { name: 'Gradient', color: 'gradient', textColor: '#654321', isGradient: true, inputBg: 'rgba(255, 255, 255, 0.85)', inputBorder: '#D4922A', inputText: '#1A1A1A' },
  ];

  const currentOption = bgOptions.find(opt => opt.color === bgColor) || bgOptions[1];

  const handleAuth = async () => {
    try {
      setError('');
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const renderBackground = () => {
    if (currentOption.isGradient) {
      return (
        <LinearGradient
          colors={['#F5F5DC', '#FFF8E7', '#E8A540']}
          style={StyleSheet.absoluteFill}
        />
      );
    }
    return null;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, !currentOption.isGradient && { backgroundColor: bgColor }]}
    >
      {renderBackground()}
      <ScrollView horizontal style={styles.colorSwitcher} contentContainerStyle={styles.colorSwitcherContent}>
        {bgOptions.map((option) => (
          <TouchableOpacity
            key={option.color}
            style={[styles.colorOption, { backgroundColor: option.color, borderColor: bgColor === option.color ? '#D4922A' : 'transparent' }]}
            onPress={() => setBgColor(option.color)}
          >
            <Text style={[styles.colorOptionText, { color: option.textColor }]}>{option.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Image
        source={require('../assets/brewedat-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={[styles.subtitle, { color: currentOption.textColor }]}>Discover. Sip. Earn.</Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: currentOption.inputBg,
            borderColor: currentOption.inputBorder,
            color: currentOption.inputText,
          },
        ]}
        placeholder="Email"
        placeholderTextColor={currentOption.inputText === '#FFFFFF' ? 'rgba(255, 255, 255, 0.6)' : '#999'}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: currentOption.inputBg,
            borderColor: currentOption.inputBorder,
            color: currentOption.inputText,
          },
        ]}
        placeholder="Password"
        placeholderTextColor={currentOption.inputText === '#FFFFFF' ? 'rgba(255, 255, 255, 0.6)' : '#999'}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleAuth}>
        <Text style={styles.buttonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={[styles.switchText, { color: bgColor === '#262f39' ? '#CCCCCC' : '#666666' }]}>
          {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.testButton} onPress={() => {
        setShowTestAnimation(true);
        setTimeout(() => setShowTestAnimation(false), 1800);
      }}>
        <Text style={styles.testButtonText}>Test Animation</Text>
      </TouchableOpacity>

      {showTestAnimation && (
        <ScreenTransition key={Date.now()} isVisible={true}>
          <View style={{ flex: 1 }} />
        </ScreenTransition>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  colorSwitcher: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    maxHeight: 50,
  },
  colorSwitcherContent: {
    paddingHorizontal: 24,
    gap: 8,
    flexDirection: 'row',
  },
  colorOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
  colorOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  logo: {
    width: 250,
    height: 100,
    alignSelf: 'center',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#D4922A',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  switchText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
  },
  error: {
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 14,
  },
  testButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: 'rgba(212, 146, 42, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4922A',
  },
  testButtonText: {
    color: '#D4922A',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
});