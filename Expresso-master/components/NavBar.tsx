/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { Component } from 'react';

// import type {PropsWithChildren} from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import { Appbar, Button, Card, useTheme } from 'react-native-paper';
import DataStore from '../services/DataStore';
import { useAppTheme } from '../App';

function NavBar({ navigation, back = false, title = "", cancel = false, cog = false, modal = false}) {
  return (
    <Appbar.Header statusBarHeight={modal ? 0 : undefined}>
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      {cancel ? <Appbar.Action icon="close" onPress={navigation.goBack} /> : null}
      <Appbar.Content title={title} titleStyle={{ textAlign: 'center' }} />
      {cog ? <Appbar.Action icon="cog" onPress={() => { navigation.navigate("Settings"); }} /> : null}
    </Appbar.Header>
  );
}

export default NavBar;