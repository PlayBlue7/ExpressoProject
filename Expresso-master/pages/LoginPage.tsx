/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';

// import type {PropsWithChildren} from 'react';
import {
  Alert,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Text,
  View,
} from 'react-native';

import { Button } from 'react-native-paper';
import { AppleButton } from '@invertase/react-native-apple-authentication'

import AuthenticationService from '../services/AuthenticationService';
import { useAppTheme } from '../App';

function LoginPage({ navigation }) {
  const theme = useAppTheme();
  return (
    <SafeAreaView style={{ height: "90%" }} className='items-center justify-center'>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <View
        className='m-8 items-center align-middle'
        style={{
          backgroundColor: theme.colors.background
        }}>
        <View>
          <Text className='text-center text-3xl' style={{ color: theme.colors.onBackground }}>Welcome to Expresso</Text>
          <Text className='text-center text-lg mt-4' style={{ color: theme.colors.onBackground }}>
            Manage your restaurants and easily generate menu QR codes
          </Text>
        </View>
      </View>
      <View className='flex-col items-center justify-center' style={{ backgroundColor: theme.colors.background }}>
        <View className='my-4'>
          <Button icon='google' mode='contained'
            onPress={async () => await AuthenticationService.SignInWithGoogle()
              .then(() => {
                navigation.navigate("Restaurants");
              })
              .catch((reason) => {
                if (reason != "Cancelled") // if reason isn't cancelled sign in
                  Alert.alert("Login failed\nReason: " + reason);
              })
            }
          >
            Sign in with Google
          </Button>
        </View>
        <View>
          <AppleButton
            buttonStyle={theme.dark ? AppleButton.Style.WHITE : AppleButton.Style.BLACK}
            buttonType={AppleButton.Type.SIGN_IN}
            style={{ // Width is relative to screen size
              width: Dimensions.get('window').width / 2, // No need for event listener as app cannot be rotated
              height: 45, // You must specify a height
            }}
            onPress={async () => await AuthenticationService.SignInWithApple()
              .then(() => {
                navigation.navigate("Restaurants");
              })
              .catch((reason) => {
                if (reason != "Cancelled") // if reason isn't cancelled sign in
                  Alert.alert("Login failed\nReason: " + reason);
              })
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default LoginPage;
