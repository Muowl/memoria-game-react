import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

const colors = ['red', 'blue', 'green', 'yellow'];
const sounds: { [key: string]: any } = {
  red: require('../assets/sounds/red.mp3'),  // Adicione arquivos de som no assets
  blue: require('../assets/sounds/blue.mp3'),
  green: require('../assets/sounds/green.mp3'),
  yellow: require('../assets/sounds/yellow.mp3'),
};

const GameScreen = () => {
  const [sequence, setSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadHighScore();
    startNewLevel();
  }, []);

  const loadHighScore = async () => {
    const stored = await AsyncStorage.getItem('highScore');
    if (stored) setHighScore(parseInt(stored));
  };

  const saveHighScore = async (score: number) => {
    await AsyncStorage.setItem('highScore', score.toString());
    setHighScore(score);
  };

  const startNewLevel = () => {
    const newColor = colors[Math.floor(Math.random() * colors.length)];
    const newSeq = [...sequence, newColor];
    setSequence(newSeq);
    setUserSequence([]);
    setIsPlaying(true);
    playSequence(newSeq);
  };

  const playSequence = async (seq: string[]) => {
    for (let color of seq) {
      await playSound(color);
      await flashColor(color);
      await delay(300);  // Pausa entre cores
    }
    setIsPlaying(false);
  };

  const playSound = async (color: string) => {
    const { sound } = await Audio.Sound.createAsync(sounds[color]);
    await sound.playAsync();
  };

  const flashColor = (color: string) => {
    // Lógica de animação: mude opacidade ou use Animated
    return new Promise(resolve => setTimeout(resolve, 500));  // Simula flash
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handlePress = (color: string) => {
    if (isPlaying) return;
    const newUserSeq = [...userSequence, color];
    setUserSequence(newUserSeq);

    if (newUserSeq[newUserSeq.length - 1] !== sequence[newUserSeq.length - 1]) {
      Alert.alert('Erro!', 'Sequência incorreta. Tente novamente!');
      if (level - 1 > highScore) saveHighScore(level - 1);
      setLevel(1);
      startNewLevel();
      return;
    }

    if (newUserSeq.length === sequence.length) {
      setLevel(level + 1);
      startNewLevel();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.level}>Nível: {level}</Text>
      <Text>Pontuação Máxima: {highScore}</Text>
      <View style={styles.buttonContainer}>
        {colors.map(color => (
          <TouchableOpacity
            key={color}
            style={[styles.button, { backgroundColor: color }]}
            onPress={() => handlePress(color)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  level: { fontSize: 20, marginBottom: 10 },
  buttonContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  button: { width: 100, height: 100, margin: 10, borderRadius: 10 },
});

export default GameScreen;