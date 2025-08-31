import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
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
  const [currentScore, setCurrentScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [flashingColor, setFlashingColor] = useState<string | null>(null);
  
  // Refs para animações
  const redOpacity = useRef(new Animated.Value(1)).current;
  const blueOpacity = useRef(new Animated.Value(1)).current;
  const greenOpacity = useRef(new Animated.Value(1)).current;
  const yellowOpacity = useRef(new Animated.Value(1)).current;

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
    return new Promise<void>((resolve) => {
      setFlashingColor(color);
      
      // Animação de flash
      let opacityRef;
      switch (color) {
        case 'red': opacityRef = redOpacity; break;
        case 'blue': opacityRef = blueOpacity; break;
        case 'green': opacityRef = greenOpacity; break;
        case 'yellow': opacityRef = yellowOpacity; break;
        default: return resolve();
      }

      Animated.sequence([
        Animated.timing(opacityRef, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityRef, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setFlashingColor(null);
        resolve();
      });
    });
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handlePress = (color: string) => {
    if (isPlaying) return;
    const newUserSeq = [...userSequence, color];
    setUserSequence(newUserSeq);

    if (newUserSeq[newUserSeq.length - 1] !== sequence[newUserSeq.length - 1]) {
      Alert.alert('Erro!', 'Sequência incorreta. Tente novamente!');
      if (currentScore > highScore) saveHighScore(currentScore);
      setLevel(1);
      setCurrentScore(0);
      setSequence([]);
      setTimeout(() => startNewLevel(), 1000);
      return;
    }

    if (newUserSeq.length === sequence.length) {
      const newScore = currentScore + level * 10;
      setCurrentScore(newScore);
      setLevel(level + 1);
      setTimeout(() => startNewLevel(), 1000);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.level}>Nível: {level}</Text>
      <Text style={styles.score}>Pontuação Atual: {currentScore}</Text>
      <Text style={styles.score}>Pontuação Máxima: {highScore}</Text>
      <View style={styles.buttonContainer}>
        <Animated.View style={[styles.button, { backgroundColor: 'red', opacity: redOpacity }]}>
          <TouchableOpacity
            style={styles.buttonTouchable}
            onPress={() => handlePress('red')}
            disabled={isPlaying}
          />
        </Animated.View>
        <Animated.View style={[styles.button, { backgroundColor: 'blue', opacity: blueOpacity }]}>
          <TouchableOpacity
            style={styles.buttonTouchable}
            onPress={() => handlePress('blue')}
            disabled={isPlaying}
          />
        </Animated.View>
        <Animated.View style={[styles.button, { backgroundColor: 'green', opacity: greenOpacity }]}>
          <TouchableOpacity
            style={styles.buttonTouchable}
            onPress={() => handlePress('green')}
            disabled={isPlaying}
          />
        </Animated.View>
        <Animated.View style={[styles.button, { backgroundColor: 'yellow', opacity: yellowOpacity }]}>
          <TouchableOpacity
            style={styles.buttonTouchable}
            onPress={() => handlePress('yellow')}
            disabled={isPlaying}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  level: { fontSize: 20, marginBottom: 10 },
  score: { fontSize: 16, marginBottom: 5 },
  buttonContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  button: { width: 100, height: 100, margin: 10, borderRadius: 10 },
  buttonTouchable: { width: '100%', height: '100%', borderRadius: 10 },
});

export default GameScreen;