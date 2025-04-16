import { Text, View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

export default function Movie() {
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Movie',
          headerStyle: {
            backgroundColor: '#25292e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            color: '#fff',
          },
        }} 
      />
      <View style={styles.container}>
        <Text style={styles.text}>Movie screen</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
  },
});