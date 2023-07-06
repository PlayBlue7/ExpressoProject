/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { Component, createRef, useEffect, useMemo, useRef, useState } from 'react';

// import type {PropsWithChildren} from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
  SectionList
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appbar, Avatar, Button, Card, Dialog, Divider, FAB, IconButton, Menu as RNMenu, Paragraph, Portal, SegmentedButtons, Snackbar, Surface, TouchableRipple } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useAppTheme } from '../App';
import { DetailsHeaderScrollView, StickyHeaderScrollView, useStickyHeaderScrollProps } from 'react-native-sticky-parallax-header';
import { ImageHeaderScrollView, TriggeringView } from 'react-native-image-header-scroll-view';

import DynamicHeader from '../components/DynamicHeader'
import NavBar from '../components/NavBar';
import { AnimatedScrollView } from '@kanelloc/react-native-animated-header-scroll-view';
import LocationService from '../services/LocationService';
import { transparent } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';
import DataStore from '../services/DataStore';
import Menu from '../classes/Menu';
import MenuSection from '../classes/MenuSection';
import { onClose, onOpen, Picker } from 'react-native-actions-sheet-picker';
import WeekDayService from '../services/WeekDayService';


function RestaurantDetailPage({ route, navigation }) {
  const { restaurant } = route.params;
  // const isDarkMode = useColorScheme() === 'dark';
  const theme = useAppTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();

  const scrollRef = createRef<SectionList>();

  const { geocodingLocation, getGeocoding, setGeocoding } = LocationService.getGeocodingState();

  const imageRef =
    restaurant.coverPhoto == "" ?
    "https://maps.googleapis.com/maps/api/place/photo?maxwidth=2000&photo_reference=" + restaurant.googlePhotoRef + "&key="
    : restaurant.coverPhoto

  const scrollOffsetY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getGeocoding(setGeocoding, restaurant.location);
  }, []);

  const menus: Menu[] = restaurant.menus.sort((m1, m2) => m1.name < m2.name ? -1 : 1)

  const [currentSection, setCurrentSection] = useState("0");

  const [selected, setSelected] = useState(menus[0] ?? undefined);
  const [selectedKey, setSelectedKey] = useState(0);
  const [query, setQuery] = useState('')

  const filteredData = useMemo(() => {
    if (menus && menus.length > 0) {
      return menus.filter((item) =>
        item.name
          .toLocaleLowerCase('en')
          .includes(query.toLocaleLowerCase('en'))
      );
    }
    return []
  }, [menus, query]);

  const onSearch = (text: string) => {
    setQuery(text);
  };

  // CODE THAT DIDN'T WORK FOR AN ANIMATED HEADER

  // const { loading, user, getUser } = AuthenticationService.GetUserState();

  // useEffect(() => {
  //   getUser();
  // }, []);

  // if (loading) return null; // allows user state to load before rendering

  // const PARALLAX_HEIGHT = 330;
  // const HEADER_BAR_HEIGHT = 92;
  // const SNAP_START_THRESHOLD = 50;
  // const SNAP_STOP_THRESHOLD = 330;

  // const { width: windowWidth } = useWindowDimensions();
  // const {
  //   onMomentumScrollEnd,
  //   onScroll,
  //   onScrollEndDrag,
  //   scrollHeight,
  //   scrollValue,
  //   scrollViewRef,
  //   // useStickyHeaderScrollProps is generic and need to know
  //   // which component (ScrollView, FlatList<ItemT> or SectionList<ItemT, SectionT>)
  //   // will be enhanced with sticky scroll props
  // } = useStickyHeaderScrollProps<ScrollView>({
  //   parallaxHeight: PARALLAX_HEIGHT,
  //   snapStartThreshold: SNAP_START_THRESHOLD,
  //   snapStopThreshold: SNAP_STOP_THRESHOLD,
  //   snapToEdge: true,
  // });

  // const styles = StyleSheet.create({
  //   foregroundContainer: {
  //     height: 200,
  //     justifyContent: 'center',
  //     alignItems: 'center',
  //   },
  //   header: { backgroundColor: 'transparent' },
  //   content: { height: 1000 },
  // });

  // return (
  //   <SafeAreaView className='flex-1 items-center justify-center bg-red-600'>
  //       <Text className='text-blue-500 p-10 flex-2'>Hi</Text>
  //       <Text className='text-green-500 p-10 flex-2'>Hello</Text>
  //   </SafeAreaView>
  // );

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      paddingHorizontal: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    btnRightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    btnRight: {
      marginRight: 8,
    },
  });

  return (
    <View style={{ paddingBottom: insets.bottom }} className='flex-1'>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
      />

      {/* <DynamicHeader animHeaderValue={scrollOffsetY} googlePhotoRef={restaurant.googlePhotoRef} /> */}
      {/* <ScrollView
        stickyHeaderIndices={[]}
        scrollEventThrottle={16}
        className='flex-auto bg-red-500'
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollOffsetY } } }],
          { useNativeDriver: false }
        )}> */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Confirm Restaurant Deletion?</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Permanent deletion of this restaurant will lose all saved menus and details. </Paragraph>
          </Dialog.Content>
          <Dialog.Actions className='pb-4'>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button
              loading={loading}
              textColor={theme.colors.error}
              onPress={async () => {
                setLoading(true);
                await DataStore.removeRestaurant(restaurant.uid);
                setDialogVisible(false);
                setLoading(false);
                navigation.navigate({ name: 'Restaurants', params: { deleted: true } });
                // Alert.alert("Restaurant Deleted!");
              }
              }
            >Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <AnimatedScrollView
        headerImage={{
          uri: imageRef
        }}
        // ref={scrollRef}
        nestedScrollEnabled
        HeaderNavbarComponent={
          // <IconButton
          //   icon="arrow-left"
          //   mode='contained'
          //   containerColor={theme.colors.surfaceDisabled}
          //   iconColor={theme.colors.primary}
          //   size={20}
          //   onPress={() => console.log('Pressed')}
          // />
          // <View style={styles.container}>
          //   <View style={styles.titleContainer}>
          //     <Text>Foreground component</Text>
          //   </View>
          // </View>
          <View className='flex-row pt-4' style={{ width: '100%' }}>
            <View style={{ flexGrow: 1, alignItems: 'center' }} >
              <IconButton
                icon="arrow-left"
                mode='contained'
                containerColor={theme.colors.background}
                iconColor={theme.colors.primary}
                size={20}
                onPress={navigation.goBack}
              />
            </View>
            <View className='justify-center' style={{ flexGrow: 5 }}>
              <Text className='text-xl text-center text-transparent'>{restaurant.name}</Text>
            </View>
            <View style={{
              flexGrow: 1, alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
              <RNMenu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={{ x: width, y: 100 }}
                contentStyle={{ borderRadius: 10 }}>
                <RNMenu.Item
                  leadingIcon='pencil'
                  onPress={() => setMenuVisible(false)}
                  title="Edit Details" style={{ marginBottom: -4, marginTop: -8 }}
                  titleStyle={{ marginLeft: -4 }} />
                <Divider style={{ marginVertical: 4 }} />
                <RNMenu.Item titleStyle={{ color: theme.colors.error, marginLeft: -4 }}
                  leadingIcon={() => (
                    <Icon name="trash-can" size={24} color={theme.colors.error} />
                  )}
                  onPress={() => {
                    setMenuVisible(false);
                    setDialogVisible(true);
                  }
                  }
                  title="Delete Restaurant"
                  style={{ marginBottom: -8, marginTop: -4 }} />
              </RNMenu>
              <IconButton
                icon="dots-horizontal"
                mode='contained'
                containerColor={theme.colors.background}
                iconColor={theme.colors.primary}
                size={20}
                onPress={() => setMenuVisible(true)}
              />
            </View>
          </View>
        }
        TopNavBarComponent={
          <View className='flex-row pt-4' style={{ width: '100%', backgroundColor: theme.colors.background, }}>
            <StatusBar
              barStyle={theme.dark ? 'light-content' : 'dark-content'}
            />
            <View style={{ flexGrow: 1, alignItems: 'center' }} >
              <IconButton
                icon="arrow-left"
                mode='contained'
                containerColor={theme.colors.surfaceDisabled}
                iconColor={theme.colors.primary}
                size={20}
                onPress={navigation.goBack}
              />
            </View>
            <View className='justify-center' style={{ flexGrow: 5 }}>
              <Text className='text-xl text-center' style={{ color: theme.colors.onBackground }}>{restaurant.name}</Text>
            </View>
            <View style={{ flexGrow: 1, alignItems: 'center' }}>
              <IconButton
                icon="dots-horizontal"
                mode='contained'
                containerColor={theme.colors.surfaceDisabled}
                iconColor={theme.colors.primary}
                size={20}
                onPress={() => setMenuVisible(true)}
              />
            </View>
          </View>
        }
        topBarHeight={100}
        headerMaxHeight={220}
        stickyHeaderIndices={[2]}
      >
        <View className='pt-6 px-6 flex-col'>
          <Text className='text-4xl flex-none' style={{ color: theme.colors.onBackground }}>{restaurant.name}</Text>
          <View className='flex-row flex-grow-0 py-2'>
            <Avatar.Icon
              size={36}
              icon="map-marker-radius"
              color={theme.colors.onBackground}
              style={{
                backgroundColor: '#0000000',
                opacity: 0.9,
              }} />
            <View className='justify-center pr-6'>
              <Text className='pr-6'>
                {geocodingLocation}
              </Text>
            </View>
          </View>

        </View>
        <View>
          <View className='px-4'>
            <TouchableOpacity onPress={() => navigation.navigate("QRDetail", { uid: restaurant.uid })}>
              <Surface className='mt-6 rounded-lg'>
                <View className='flex-row'>
                  <View className=' justify-center flex-grow'>
                    <Avatar.Icon
                      size={48}
                      icon="qrcode"
                      color={theme.colors.onSurface}
                      style={{
                        alignSelf: 'center',
                        backgroundColor: '#0000000',
                        opacity: 0.8,
                      }} />
                  </View>
                  <View className='flex-grow py-4'>
                    <Text className='text-lg'>Restaurant QR Code</Text>
                  </View>
                  <View className='flex-grow'>
                    <Avatar.Icon
                      size={36}
                      icon="chevron-right"
                      color={theme.colors.onBackground}
                      style={{
                        alignSelf: 'flex-end',
                        backgroundColor: '#0000000',
                        flexGrow: 1,
                        opacity: 0.8,
                        marginRight: 8
                      }} />
                  </View>
                </View>
              </Surface>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onOpen('menus')}>
              <Surface className='my-6 rounded-lg'>
                <View className='flex-row'>
                  <View className='flex-grow justify-center' style={{ flex: 1 }}>
                    <Avatar.Icon
                      size={48}
                      // icon="silverware-fork-knife"
                      icon="food-fork-drink"
                      color={theme.colors.onSurface}
                      style={{
                        alignSelf: 'center',
                        backgroundColor: '#0000000',
                        opacity: 0.8,
                      }} />
                  </View>
                  <View className=' py-4' style={{ flexGrow: 1 }}>
                    <Text className='text-lg'>{selected?.name ?? "No Menus"}</Text>
                  </View>
                  <View className='flex-1'>
                    <Avatar.Icon
                      size={36}
                      icon="chevron-down"
                      color={theme.colors.onBackground}
                      style={{
                        alignSelf: 'flex-end',
                        backgroundColor: '#0000000',
                        flexGrow: 1,
                        opacity: 0.8,
                        marginRight: 8
                      }} />
                  </View>
                </View>
              </Surface>
            </TouchableOpacity>
          </View>
        </View>

        <View className=''>
          <Picker
            id="menus"
            data={filteredData}
            inputValue={query}
            searchable={true}
            label="Select Menu"
            setSelected={setSelected}
            height={0.6 * height}
            onSearch={onSearch}
            noDataFoundText="No Menus found"
            renderListItem={(item, index) =>
              <TouchableOpacity
                style={{
                  paddingVertical: 20,
                  borderBottomWidth: 0.5,
                  borderColor: '#CDD4D9',
                }}
                onPress={() => {
                  setSelected(item);
                  setSelectedKey(index);
                  setQuery('');
                  onClose('menus');
                }}
              >
                <View className='flex-row'>
                  <View className=' py-4' style={{ flexGrow: 1 }}>
                    <Text className='text-xl' style={{ fontWeight: selectedKey !== index ? 'normal' : 'bold' }}>
                      {item.name ? item.name : null}
                    </Text>
                    {
                      WeekDayService.days.map((day) => (
                        item.activeTimes[day].map((activeTime) => (
                          <Text
                            key={item.activeTimes[day].indexOf(activeTime)}
                            className='pt-2 pr-2'
                            style={{ fontWeight: selected !== item ? 'normal' : 'bold', }}
                          >
                            {day + " " + WeekDayService.startEndToString(activeTime.start, activeTime.end)}
                          </Text>
                        )
                        )
                      ))
                    }
                  </View>
                  {selectedKey == index ?
                    <View className='mr-4 justify-center' style={{}}>
                      <Avatar.Icon
                        size={36}
                        icon="check"
                        color={theme.colors.onSurface}
                        style={{
                          alignSelf: 'center',
                          backgroundColor: theme.colors.primaryContainer,
                          opacity: 0.8,
                        }} />
                    </View>
                    : null}
                </View>

              </TouchableOpacity>
            }
          />
          {selected?.sections.map((section: MenuSection, i) => (
            <View key={i}>
              <Text className='text-3xl p-4'>{section.name}</Text>
              {section.items.map((dish, j) => (
                <Surface elevation={0} key={j} className=" border-gray-200 border p-4">
                  <View className='flex-row' >
                    <View className='flex-1 pr-2'>
                      <Text className='text-xl'>{dish.name}</Text>
                      <Text className='text-l text-gray-500'>{dish.description}</Text>
                      <Text className='text-l mt-4 text-gray-500'>{"£"+dish.price.toFixed(2)}</Text>
                    </View>
                    <View>
                      {
                        dish.photo != "" ?
                        <Image
                          style={{ borderRadius:4 }}
                          source={{ uri: dish.photo }}
                          className="h-20 w-20 bg-gray-300 p-4"
                        />
                        : null
                      }
                    </View>
                  </View>
                </Surface>
              ))}
            </View>
          ))}
        </View>

      </AnimatedScrollView>
    </View >
    
    // ANOTHER ANIMATED SCROLL VIEW IMPLEMENTATION THAT DID NOT WORK

    /* <ImageHeaderScrollView
      maxHeight={200}
      minHeight={100}
      headerImage={{uri: "https://maps.googleapis.com/maps/api/place/photo?maxwidth=2000&photo_reference=" + restaurant.googlePhotoRef + "&key="}}
      renderFixedForeground={() =>
        <View style={{ height: 150, justifyContent: "center", alignItems: "center" }} >
          <TouchableOpacity onPress={() => console.log("tap!!")}>
            <Text style={{ backgroundColor: "transparent" }}>Tap Me!</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={{ height: 1000, backgroundColor:theme.colors.error }}>
        <TriggeringView onHide={() => console.log("text hidden")}>
          <Text>Scroll Me!</Text>
        </TriggeringView>
      </View>
    </ImageHeaderScrollView> */
    /* <View style={{}}>
        {/* <View style={{ width: windowWidth }}>
          <HeaderBar scrollValue={scrollValue} />
        </View>
        <View style={{}}>
          <StickyHeaderScrollView
            ref={scrollViewRef}
            containerStyle={{}}
            onScroll={onScroll}
            onMomentumScrollEnd={onMomentumScrollEnd}
            onScrollEndDrag={onScrollEndDrag}
            renderHeader={() => {
              return (
                <View pointerEvents="box-none" style={{ height: scrollHeight }}>
                  {/* <Foreground scrollValue={scrollValue} />
                </View>
              );
            }}
            renderTabs={() => (
              <View style={{}}>
                {/* <Tabs />
              </View>
            )}
            showsVerticalScrollIndicator={false}
            style={{}}>
            <SafeAreaView edges={['left', 'right', 'bottom']} style={{}}>
              <Text style={{}}>
                jj
              </Text>
            </SafeAreaView>
          </StickyHeaderScrollView>
        </View>
        <StatusBar barStyle="light-content" backgroundColor={Colors.black} translucent />
      </View> */
    /* uri: "https://maps.googleapis.com/maps/api/place/photo?maxwidth=2000&photo_reference=" + restaurant.googlePhotoRef + "&key=" */
    // </ScrollView >
  );
}

export default RestaurantDetailPage;
