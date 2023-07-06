import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import {
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';

import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import { adaptNavigationTheme, Provider as PaperProvider, useTheme } from 'react-native-paper'


import LoginPage from './pages/LoginPage'

import { lightTheme, darkTheme } from './theme.js'
import './services/AuthenticationService';
import AuthenticationService from './services/AuthenticationService';
import RestaurantsPage from './pages/RestaurantsPage';
import NavBar from './components/NavBar';
import SettingsPage from './pages/SettingsPage';

import AddRestaurantPage from './pages/AddRestaurantPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import LocationService from './services/LocationService';
import QRDetailPage from './pages/QRDetailPage';

const Stack = createNativeStackNavigator();
const { LightTheme } = adaptNavigationTheme({ reactNavigationLight: DefaultTheme });
const { DarkTheme } = adaptNavigationTheme({ reactNavigationDark: DefaultTheme });

export type AppTheme = typeof lightTheme;
export const useAppTheme = () => useTheme<AppTheme>();

function App(): JSX.Element {

  AuthenticationService.InitialiseAuth();
  LocationService.InitialiseLocationService();
  const isDark = useColorScheme() === 'dark';

  const { loading, user, getUser } = AuthenticationService.GetUserState();

  useEffect(() => {
    getUser();
  }, []);

  if (loading)
    return <SafeAreaProvider><View></View></SafeAreaProvider> // replace with splash screen

  return (
    <SafeAreaProvider>
      <PaperProvider theme={isDark ? darkTheme : lightTheme}>
        <NavigationContainer theme={isDark ? DarkTheme : LightTheme}>
          <Stack.Navigator initialRouteName={!user ? "Login" : "Restaurants"}
          >
            <Stack.Screen name="Login" component={LoginPage}
              options={({ navigation, route }) => ({
                animation: 'fade',
                headerShown: false
                // headerRight: () => (
                //   <Button
                //     icon={"cog"}
                //     labelStyle={{ fontSize: 28 }}
                //     contentStyle={{ flexDirection: 'row-reverse' }}
                //     onPress={() => navigation.navigate("Settings")}>
                //   </Button>
                // ),
              })}
            />
            <Stack.Screen name="Restaurants" component={RestaurantsPage}
              options={({ navigation, route }) => ({
                animation: 'fade',
                header: ({ navigation, route, options, back }) => {
                  // const title = getHeaderTitle(options, route.name);

                  return (
                    <NavBar
                      title="Your Restaurants"
                      navigation={navigation}
                      back={false} // don't want to navigate back to Login screen once authed
                      cog
                    // leftButton={
                    //   back ? <MyBackButton onPress={navigation.goBack} /> : undefined
                    // }
                    // style={options.headerStyle}
                    />
                  );
                }
                // headerRight: () => (
                //   <Button
                //     icon={"cog"}
                //     labelStyle={{ fontSize: 28 }}
                //     contentStyle={{ flexDirection: 'row-reverse' }}
                //     onPress={() => navigation.navigate("Settings")}>
                //   </Button>
                // ),
              })}
            />
            <Stack.Screen name="Settings" component={SettingsPage}
              options={({ navigation, route }) => ({
                presentation: 'modal',
                header: ({ navigation, route, options, back }) => {
                  // const title = getHeaderTitle(options, route.name);

                  return (
                    <NavBar
                      title="Settings"
                      navigation={navigation}
                      cancel
                      modal
                    // leftButton={
                    //   back ? <MyBackButton onPress={navigation.goBack} /> : undefined
                    // }
                    // style={options.headerStyle}
                    />
                  );
                }
                // headerRight: () => (
                //   <Button
                //     icon={"cog"}
                //     labelStyle={{ fontSize: 28 }}
                //     contentStyle={{ flexDirection: 'row-reverse' }}
                //     onPress={() => navigation.navigate("Settings")}>
                //   </Button>
                // ),
              })}
            />
            <Stack.Screen name="AddRestaurant" component={AddRestaurantPage}
              options={({ navigation, route }) => ({
                presentation: 'modal',
                gestureEnabled: false,
                header: ({ navigation, route, options, back }) => {
                  // const title = getHeaderTitle(options, route.name);

                  return (
                    <NavBar
                      title="New Restaurant"
                      navigation={navigation}
                      cancel
                      modal
                    // leftButton={
                    //   back ? <MyBackButton onPress={navigation.goBack} /> : undefined
                    // }
                    // style={options.headerStyle}
                    />
                  );
                }
                // headerRight: () => (
                //   <Button
                //     icon={"cog"}
                //     labelStyle={{ fontSize: 28 }}
                //     contentStyle={{ flexDirection: 'row-reverse' }}
                //     onPress={() => navigation.navigate("Settings")}>
                //   </Button>
                // ),
              })}
            />
            <Stack.Screen name="RestaurantDetail" component={RestaurantDetailPage}
              options={({ navigation, route }) => ({
                header: ({ navigation, route, options, back }) => {
                  // const title = getHeaderTitle(options, route.name);
                  return (
                    null
                    // <NavBar
                    //   navigation={navigation}
                    //   back
                    // leftButton={
                    //   back ? <MyBackButton onPress={navigation.goBack} /> : undefined
                    // }
                    // style={options.headerStyle}
                    // />
                  );
                }
              })}
            // headerRight: () => (
            //   <Button
            //     icon={"cog"}
            //     labelStyle={{ fontSize: 28 }}
            //     contentStyle={{ flexDirection: 'row-reverse' }}
            //     onPress={() => navigation.navigate("Settings")}>
            //   </Button>
            // ),

            />
            <Stack.Screen name="QRDetail" component={QRDetailPage}
              options={({ navigation, route }) => ({
                presentation: 'modal',
                header: ({ navigation, route, options, back }) => {
                  // const title = getHeaderTitle(options, route.name);

                  return (
                    <NavBar
                      title="QR Code"
                      navigation={navigation}
                      cancel
                      modal
                    // leftButton={
                    //   back ? <MyBackButton onPress={navigation.goBack} /> : undefined
                    // }
                    // style={options.headerStyle}
                    />
                  );
                }
                // headerRight: () => (
                //   <Button
                //     icon={"cog"}
                //     labelStyle={{ fontSize: 28 }}
                //     contentStyle={{ flexDirection: 'row-reverse' }}
                //     onPress={() => navigation.navigate("Settings")}>
                //   </Button>
                // ),
              })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
