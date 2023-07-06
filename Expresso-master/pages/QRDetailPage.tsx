/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { Component, useEffect, useState } from 'react';

// import type {PropsWithChildren} from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import { useAppTheme } from '../App';
import QRCode from 'react-native-qrcode-svg';


function QRDetailPage({ route, navigation }) {
  const { uid } = route.params;
  // const isDarkMode = useColorScheme() === 'dark';
  const theme = useAppTheme();

  // const { loading, user, getUser } = AuthenticationService.GetUserState();

  // useEffect(() => {
  //   getUser();
  // }, []);

  // if(loading) return null; // allows user state to load before rendering

  return (
    <SafeAreaView>
      <StatusBar
        // barStyle={theme.dark ? 'light-content' : 'dark-content'}
        barStyle={'light-content'} // status bar is always black in modal view
      // backgroundColor={theme.colors.background}
      />
      <View className='flex-row items-center p-8'>
        <View className='flex-grow grid grid-cols-1 gap-12 justify-center items-center'>
          <View className='flex'></View>
          <View className='flex bg-white p-8'>
            <QRCode
              value={"https://expressoqr.web.app/" + uid } // CHANGE
              size={200}
            />
          </View>
          <View className='flex justify-center items-center'>
            <Text className='text-center text-lg' style={{color:theme.colors.onBackground}}>
              Take a screenshot of this QR code and put it on all of your tables to allow your customers to view the menu and place orders
            </Text>
          </View>
          <View className='flex justify-center items-center'>
            <Text className='text-center text-lg' style={{ color: theme.colors.onBackground }}>
              This QR code will always direct customers to the correct menu based on the active times you've defined
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView >
  );
}

export default QRDetailPage;
