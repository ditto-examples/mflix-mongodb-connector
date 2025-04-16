import  { Text, View, StyleSheet } from 'react-native';
import { useContext } from 'react';
import { Link } from 'expo-router';
import { Stack } from 'expo-router';
import DittoContext from './providers/DittoContext';

export default function Index() {
  const { dittoService } = useContext(DittoContext);
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Children Movies',
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
        <Text style={styles.text}>Home screen</Text>
        <Link href="/movie" style={styles.button}>Movie Link</Link>
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
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
});
