/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { createRef, useEffect, useState } from 'react';

// import type {PropsWithChildren} from 'react';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  Text,
  View,
} from 'react-native';


import { ActivityIndicator, Avatar, Button, Portal, Snackbar, TouchableRipple } from 'react-native-paper';
import DataStore from '../services/DataStore';
import { useAppTheme } from '../App';
import RestaurantCard from '../components/RestaurantCard';
import AuthenticationService from '../services/AuthenticationService';
import LocationService from '../services/LocationService';


function RestaurantsPage({ navigation, route }) {
  const theme = useAppTheme();

  const { dataLoading, setDataLoading, restaurants, loadRestaurants, setRestaurants } = DataStore.getRestaurants(); // returns the list and a listener for updates

  const { loading, user, getUser } = AuthenticationService.GetUserState();
  const { location, getLocation, setLocation } = LocationService.getLocationState();

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    getLocation(setLocation);
  }, []); // will only run on page mount

  useEffect(() => {
    loadRestaurants(setRestaurants, setDataLoading, user ? user.uid : "", location);
  }, [user, location]); // when user object loads, make query

  const scrollRef = createRef<FlatList>();

  const [deletedSnackbarVisible, setDeletedSnackbarVisible] = useState(false);
  const [addedSnackbarVisible, setAddedSnackbarVisible] = useState(false);


  useEffect(() => {
    if (route.params?.deleted) {
      setDeletedSnackbarVisible(true)
    }
  }, [route.params?.deleted]);

  useEffect(() => {
    if (route.params?.added) {
      setAddedSnackbarVisible(true)
    }
  }, [route.params?.added]);

  if (loading) return null;

  return (
    <SafeAreaView>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      <Portal>
        <Snackbar
          visible={deletedSnackbarVisible}
          onDismiss={() => setDeletedSnackbarVisible(false)}
          duration={Snackbar.DURATION_SHORT}
          action={{
            label: 'Dismiss',
            onPress: () => setDeletedSnackbarVisible(false),
          }}>
          Restaurant deleted!
        </Snackbar>
        <Snackbar
          visible={addedSnackbarVisible}
          onDismiss={() => setAddedSnackbarVisible(false)}
          duration={Snackbar.DURATION_SHORT}
          action={{
            label: 'Dismiss',
            onPress: () => setDeletedSnackbarVisible(false),
          }}>
          Restaurant added!
        </Snackbar>
      </Portal>

      {dataLoading ?
        <View style={{ alignItems: 'center', justifyContent: 'center', height: "100%" }}>
          <ActivityIndicator
            animating={true}
            size='small'
            color={theme.colors.primary}
            className='mb-8'
          />
        </View>
        :
        restaurants.length == 0 && !dataLoading ?
          <View style={{ height: "100%", alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
            <Avatar.Icon icon='card-bulleted-off-outline' color={theme.colors.onBackground} style={{ backgroundColor: theme.colors.background }} />
            <Text className='mb-24'>No Restaurants Found</Text>
          </View>
          :
          <FlatList
            ref={scrollRef}
            data={restaurants}
            renderItem={({ item }) => (
              <View style={{ padding: 5, paddingBottom: 15 }}>
                <TouchableRipple
                  onPress={() => {
                    // scrollRef.current?.scrollToIndex({ index: 0 })
                    // console.log(item)
                    navigation.navigate("RestaurantDetail", { restaurant: item })
                  }
                  }
                  onLongPress={() => { }}>
                  {/* onLongPress avoids touch activation when scrolling*/}
                  <RestaurantCard
                    owner={item.owner}
                    title={item.name}
                    googlePhotoRef={item.googlePhotoRef}
                    coverPhoto={item.coverPhoto}
                    distance={item.distance} />
                </TouchableRipple>
                {/* Only require the minimum information for the card, then load details if necessary */}
              </View>
            )}
            style={{ padding: 10, height: "100%" }}
            ListFooterComponent={<View className=' mt-16'></View>}
          />
      }
      <Button
        icon="plus"
        mode='contained'
        buttonColor={theme.colors.primary}
        textColor={theme.colors.onPrimary}
        labelStyle={{ fontSize: 24 }}
        style={{
          marginVertical: -55,
          marginHorizontal: 60,
          // paddingVertical:6,
          // justifyContent: 'center',
          // alignItems: 'center',
        }}
        contentStyle={{
          paddingVertical: 4
        }}
        onPress={() => navigation.navigate("AddRestaurant")}
      >
        <Text style={{ fontSize: 16 }}>Add Restaurant</Text>
      </Button>
    </SafeAreaView >
  );
}

export default RestaurantsPage;
