import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Jogo da Memória para Idosos' }} />
        <Stack.Screen name="Game" component={GameScreen} options={{ title: 'Jogue!' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;