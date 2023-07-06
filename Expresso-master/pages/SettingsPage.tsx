/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';

// import type {PropsWithChildren} from 'react';
import {
  Alert,
  SafeAreaView,
  StatusBar,
  Text,
  View,
} from 'react-native';


import { Button } from 'react-native-paper';
import { useAppTheme } from '../App';
import AuthenticationService from '../services/AuthenticationService';


function SettingsPage({ navigation }) {
  // const isDarkMode = useColorScheme() === 'dark';
  const theme = useAppTheme();

  const { loading, user, getUser } = AuthenticationService.GetUserState();

  useEffect(() => {
    getUser();
  }, []);

  if (loading) return null; // allows user state to load before rendering

  return (
    <SafeAreaView>
      <StatusBar
        barStyle={'light-content'} // status bar is always black in modal view
      />
      <View className='p-8'>
        <Text style={{ color: theme.colors.onBackground }} className='pb-8 text-xl'>{user?.email}</Text>
        {/* ? Avoids null error when logging out */}
        <Button icon='logout' mode='contained'
          onPress={async () => await AuthenticationService.SignOut()
            .then(() => {
              navigation.goBack();
              navigation.push('Login');
            })
            .catch((reason) => {
              navigation.goBack();
              navigation.push('Login');
              Alert.alert("Sign out failed\nReason: " + reason);
            })
          }
        >
          Sign out</Button>
      </View>
    </SafeAreaView >
  );
}

export default SettingsPage;
