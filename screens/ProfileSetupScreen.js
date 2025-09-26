import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { auth } from '../firebase.config';

export default function ProfileSetupScreen({ onComplete }) {
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedStyles, setSelectedStyles] = useState([]);

  const beerStyles = [
    'IPA', 'Lager', 'Stout', 'Pale Ale', 'Wheat Beer',
    'Pilsner', 'Sour', 'Porter', 'Amber Ale', 'Saison'
  ];

  const toggleStyle = (style) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter(s => s !== style));
    } else {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  const calculateAge = (birthdate) => {
    const today = new Date();
    const birth = typeof birthdate === 'string' ? new Date(birthdate) : birthdate;
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setBirthdate(selectedDate);
    }
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}/${year}`;
  };

  const handleComplete = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!birthdate) {
      Alert.alert('Error', 'Please select your birthdate');
      return;
    }

    const age = calculateAge(birthdate);
    if (age < 21) {
      Alert.alert('Age Restriction', 'You must be 21 or older to use this app');
      return;
    }

    if (selectedStyles.length === 0) {
      Alert.alert('Error', 'Please select at least one beer style');
      return;
    }

    try {
      const user = auth.currentUser;
      const birthdateString = birthdate.toISOString().split('T')[0];
      await setDoc(doc(db, 'users', user.uid), {
        name,
        birthdate: birthdateString,
        age,
        beerPreferences: selectedStyles,
        createdAt: new Date().toISOString(),
        totalPoints: 0,
        level: 1,
      });

      onComplete();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <Text style={styles.subtitle}>Tell us a bit about yourself</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Your name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Birthdate</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateButtonText}>{formatDate(birthdate)}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={birthdate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1924, 0, 1)}
        />
      )}

      {Platform.OS === 'ios' && showDatePicker && (
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => setShowDatePicker(false)}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.label}>Favorite Beer Styles (select 3-5)</Text>
      <View style={styles.stylesContainer}>
        {beerStyles.map((style) => (
          <TouchableOpacity
            key={style}
            style={[
              styles.styleChip,
              selectedStyles.includes(style) && styles.styleChipSelected,
            ]}
            onPress={() => toggleStyle(style)}
          >
            <Text
              style={[
                styles.styleChipText,
                selectedStyles.includes(style) && styles.styleChipTextSelected,
              ]}
            >
              {style}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleComplete}>
        <Text style={styles.buttonText}>Complete Setup</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#654321',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B4513',
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#654321',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 24,
  },
  stylesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  styleChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  styleChipSelected: {
    backgroundColor: '#D4922A',
    borderColor: '#D4922A',
  },
  styleChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  styleChipTextSelected: {
    color: '#FFFFFF',
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  doneButton: {
    backgroundColor: '#D4922A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    alignSelf: 'flex-end',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#D4922A',
    padding: 16,
    borderRadius: 8,
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
});