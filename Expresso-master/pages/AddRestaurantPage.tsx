/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useRef, useState } from 'react';

// import type {PropsWithChildren} from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Button, TextInput, Avatar, IconButton, Surface, FAB, SegmentedButtons } from 'react-native-paper';
import DataStore from '../services/DataStore';
import { useAppTheme } from '../App';
import AuthenticationService from '../services/AuthenticationService';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import LocationService from '../services/LocationService';
import ImageService from '../services/ImageService';
import Menu from '../classes/Menu';
import MenuSection from '../classes/MenuSection';
import MenuItem from '../classes/MenuItem';
import CurrencyInput from 'react-native-currency-input';
import WeekDayService from '../services/WeekDayService';
import ActiveTime from '../classes/ActiveTime';
import DatePicker from 'react-native-date-picker';

function AddRestaurantPage({ navigation }) {
  const theme = useAppTheme();
  const width = Dimensions.get('window').width;

  const added = useRef(false); // added doesn't get updated in the backHandler, so useRef always uses current value
  const [restaurantName, setRestaurantName] = useState(""); // text doesn't get updated in listener, but not necessary to be up to date
  const [restaurantLocation, setRestaurantLocation] = useState({ latitude: 0, longitude: 0 })
  const [photoRef, setPhotoRef] = useState("");
  const [localImage, setLocalImage] = useState({ path: "" });
  const [buttonLoading, setButtonLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState("0");
  const [activeItem, setActiveItem] = useState(-1);
  const [activeSection, setActiveSection] = useState(-1);
  const [selectedDay, setSelectedDay] = useState("Mon");
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [openedTime, setOpenedTime] = useState(-1);
  const hasUnsavedChanges = Boolean(restaurantName || (restaurantLocation.latitude !== 0) || (menus.length != 0));
  const allNecessaryFieldsFilled = Boolean(restaurantName && (restaurantLocation.latitude !== 0));

  const { user, getUser } = AuthenticationService.GetUserState();

  const { location, getLocation, setLocation } = LocationService.getLocationState();
  const { geocodingLocation, getGeocoding, setGeocoding } = LocationService.getGeocodingState();

  useEffect(() => {
    getUser();
  }, []); // will only run on page mount

  useEffect(() => {
    getLocation(setLocation);
  }, []); // will only run on page mount

  useEffect(
    () => {
      const backHandler = (e: { preventDefault: () => void; data: { action: any; }; }) => {
        if (!hasUnsavedChanges || added.current) {
          // If we don't have unsaved changes, then we don't need to do anything
          // But if we are adding the restaurant, we can dismiss without warning
          return;
        }

        // Prevent default behavior of leaving the screen
        e.preventDefault();

        // Prompt the user before leaving the screen
        Alert.alert(
          'Discard changes?',
          'You will lose your unsaved changes',
          [
            { text: "Continue Editing", style: 'cancel', onPress: () => { } },
            {
              text: 'Discard',
              style: 'destructive',
              // If the user confirmed, then we dispatch the action we blocked earlier
              // This will continue the action that had triggered the removal of the screen
              onPress: async () => {
                await ImageService.cleanTemp().then(navigation.dispatch(e.data.action))
              },
            },
          ]
        );
      };
      return navigation.addListener('beforeRemove', backHandler); // returns unsubscriber
    },
    [navigation, hasUnsavedChanges, added]
  );

  return (
    <SafeAreaView>
      <StatusBar
        barStyle={buttonLoading && !theme.dark ? 'dark-content' : 'light-content'} // always black in modal, unless in photo selection
      // backgroundColor={theme.colors.background}
      />
      <ScrollView style={{ height: "85%", marginVertical: 10 }}
        contentContainerStyle={{ marginHorizontal: 10 }}
        keyboardShouldPersistTaps='always' // 'always' needed when tapping Google Places Autocomplete
        keyboardDismissMode='interactive' // nice iOS behaviour
        automaticallyAdjustKeyboardInsets // LESS BUGGY BEHAVIOUR WHEN ENABLED BUT NOT PERFECT 
        stickyHeaderIndices={[7]} // change to match Segmented button with menu list
      >
        <TextInput
          label="Restaurant Name"
          value={restaurantName}
          mode="outlined"
          onChangeText={text => setRestaurantName(text)}
          style={{ marginBottom: 10, marginHorizontal: 8 }} />
        <View className='px-4'>
          <Text style={{ color: theme.colors.secondary }}>Create a unique name to distinguish it from your other restaurants</Text>
        </View>
        <ScrollView horizontal scrollEnabled={false} className='px-2'
          contentContainerStyle={{ flex: 1, width: '100%', height: '100%', marginTop: 20 }}
          keyboardShouldPersistTaps='always'>
          <GooglePlacesAutocomplete
            placeholder='Start typing restaurant location...'
            fetchDetails
            listViewDisplayed={false}
            onPress={(data, details = null) => {
              // 'details' is provided when fetchDetails = true
              setRestaurantLocation({ latitude: details?.geometry.location.lat ?? 0, longitude: details?.geometry.location.lng ?? 0 }); // 6dp is sufficient
              if (details) {
                if (details.photos) {
                  setPhotoRef(details.photos[0].photo_reference ?? "")
                }
                getGeocoding(setGeocoding, details.geometry.location);
              }
            }}
            onFail={error => console.log(error)}
            onNotFound={() => console.log('no results')}
            query={{
              key: '',
              language: 'en',
              locationbias: 'circle:1000@' + location.latitude + ',' + location.longitude, // bias results to current location
              types: 'restaurant|cafe' // only restaurants or cafes show in results
            }}
            textInputProps={{
              InputComp: TextInput,
              mode: 'outlined',
              label: 'Restaurant Location',
              placeholderTextColor: '#8A8E99',
              multiline: true,
              autoComplete:'off',
              style: { width: '100%' } // sorts out text margin
            }}
          />
        </ScrollView>
        {/* <MapView
          provider={PROVIDER_GOOGLE}
          key=""
          initialRegion={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}>
        </MapView> */}
        <View className='mt-8 ml-2'>
          <Text className='text-xl' style={{ color: theme.colors.onBackground }}>
            Restaurant Cover Photo
          </Text>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', }}>
          {photoRef && localImage.path == "" ?
            <Image
              className='mt-6'
              style={{ width: "90%", height: undefined, aspectRatio: 16 / 9, borderRadius: 8 }}
              resizeMode='cover'
              source={{
                uri: "https://maps.googleapis.com/maps/api/place/photo?maxwidth=2000&photo_reference=" + photoRef + "&key="
              }}
            />
            :
            null
          }
          {localImage.path != "" ?
            <View className='mt-6' style={{ borderRadius: 8, width: "90%", height: undefined, aspectRatio: 16 / 9, }}>
              <ImageBackground
                style={{ width: "100%", height: "100%", }}
                imageStyle={{ borderRadius: 8 }}
                resizeMode='cover'
                source={{ uri: localImage.path }}
              >
                <IconButton
                  icon="close"
                  iconColor={theme.colors.onPrimaryContainer}
                  style={{ backgroundColor: theme.colors.primaryContainer, left: 4, top: 4, opacity: 0.9 }}
                  onPress={() => setLocalImage({ path: "" })}
                />
              </ImageBackground>
            </View>
            :
            null
          }
          <Button
            mode='contained'
            className='mt-6'
            icon='upload'
            loading={buttonLoading}
            onPress={async () => {
              setButtonLoading(true);
              await ImageService.pickImage(450, 800).then((source) => {
                if (source.path != "")
                  setLocalImage(source);
                // console.log(localImageURI)
                setButtonLoading(false);
              });
            }}>Upload photo</Button>
        </View>
        <View className='mt-8 ml-2 '>
          <Text className='text-xl' style={{ color: theme.colors.onBackground }}>
            Menus
          </Text>
        </View>
        <View className='px-4' style={{ alignContent: 'center', alignItems: 'center' }}>
        </View>
        <View className=' mx-6' style={{ alignContent: 'center', alignItems: 'center', backgroundColor:theme.colors.background }}>
        {menus.length > 1 ?
          <ScrollView horizontal showsHorizontalScrollIndicator={false} alwaysBounceHorizontal={false} className='my-2'>
            <SegmentedButtons
              value={selectedMenu}
              onValueChange={setSelectedMenu}
              buttons={menus.map((menu, index) => ({ value: index.toString(), label: menu.name }))}
            />
          </ScrollView>
          : null
        }
        </View>
        {menus.length > 0 ?
          <Surface className='p-4 mt-4 mx-4' style={{ borderRadius: 8, }}>
            <View className='flex-row'>
              <TextInput
                dense
                style={{ flexGrow: 1, justifyContent: 'center', alignSelf: 'center' }}
                label="Menu Name"
                value={menus[parseInt(selectedMenu)].name}
                clearTextOnFocus={menus[parseInt(selectedMenu)].name == "New Menu"}
                mode="outlined"
                onChangeText={text => {
                  let newMenus = [...menus];
                  newMenus[parseInt(selectedMenu)] = { ...newMenus[parseInt(selectedMenu)], name: text };
                  setMenus(newMenus)
                }} />
              <View className=' justify-center'>
                <IconButton icon='close' style={{ alignSelf: 'center', marginRight: -4, paddingLeft: 4 }}
                  onPress={() => {
                    let newMenus = [...menus];
                    newMenus.splice(parseInt(selectedMenu), 1);
                    setMenus(newMenus);
                    setSelectedMenu(selectedMenu == "0" ? "0" : (parseInt(selectedMenu) - 1).toString())
                  }} />
              </View>
            </View>
            <View className='pt-2 pb-4'>
              <Text className='text-lg' style={{ color: theme.colors.onBackground }}>Active Times</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className='mx-2 py-2'>
                <SegmentedButtons
                  value={selectedDay}
                  density='medium'
                  onValueChange={setSelectedDay}
                  buttons={WeekDayService.days.map(day => ({value:day, label:day}))}
                />
              </ScrollView>
              {
                menus[parseInt(selectedMenu)].activeTimes[selectedDay].map((time, i, array) => (
                  <Surface className='mt-2 rounded-lg mx-4' key={i}>
                    <View className='flex-row'>
                      <View className='flex-grow py-2 pl-4'>
                        <Text className='text-base' style={{ color: theme.colors.onBackground }}>{WeekDayService.startEndToString(time.start, time.end)}</Text>
                      </View>
                      <View className=''>
                        <TouchableOpacity onPress={() => {
                          setOpenedTime(i)
                          setStartOpen(true);
                        }}>
                          <Avatar.Icon
                            size={36}
                            icon="pencil"
                            color={theme.colors.onBackground}
                            style={{
                              alignSelf: 'flex-end',
                              backgroundColor: '#0000000',
                              flexGrow: 1,
                              opacity: 0.8,
                            }} />
                        </TouchableOpacity>
                      </View>
                      <View className=''>
                        <Avatar.Icon
                          size={36}
                          icon="delete"
                          color={theme.colors.error}
                          onTouchEnd={() => {
                            let newMenus = [...menus];
                            let newTimes = newMenus[parseInt(selectedMenu)].activeTimes;
                            newTimes[selectedDay].splice(i, 1);
                            newMenus[parseInt(selectedMenu)] = { ...newMenus[parseInt(selectedMenu)], activeTimes: newTimes };
                            setMenus(newMenus);
                          }}
                          style={{
                            alignSelf: 'flex-end',
                            backgroundColor: '#00000000',
                            flexGrow: 1,
                            opacity: 0.8,
                            marginRight: 8
                          }} />
                      </View>
                    </View>
                    <DatePicker
                      modal
                      open={startOpen && openedTime == i}
                      date={WeekDayService.activeTimeToDate(time.start)}
                      mode='time'
                      minuteInterval={15}
                      locale="en-FR" // gives 24 hour time
                      textColor={theme.colors.onBackground}
                      theme='auto'
                      confirmText='Set Start Time'
                      onConfirm={(date) => {
                        setStartOpen(false);
                        let newMenus = [...menus];
                        let newTimes = newMenus[parseInt(selectedMenu)].activeTimes;
                        newTimes[selectedDay][i] = { ...newTimes[selectedDay][i], start: { hour: date.getHours(), min: date.getMinutes() } }
                        newMenus[parseInt(selectedMenu)] = { ...newMenus[parseInt(selectedMenu)], activeTimes: newTimes };
                        setMenus(newMenus);
                        setEndOpen(true);
                      }}
                      onCancel={() => {
                        setStartOpen(false)
                      }}
                    />
                    <DatePicker
                      modal
                      open={endOpen && openedTime == i}
                      date={WeekDayService.activeTimeToDate(time.end)}
                      mode='time'
                      minuteInterval={15}
                      minimumDate={WeekDayService.activeTimeToDate(time.start)} // cannot set to before start
                      theme='auto'
                      locale="en-FR" // gives 24 hour time
                      confirmText='Set End Time'
                      onConfirm={(date) => {
                        setEndOpen(false);
                        let newMenus = [...menus];
                        let newTimes = newMenus[parseInt(selectedMenu)].activeTimes;
                        newTimes[selectedDay][i] = { ...newTimes[selectedDay][i], end: { hour: date.getHours(), min: date.getMinutes() } }
                        newTimes[selectedDay].sort((a, b) => {
                          if (a.start.hour < b.start.hour) return -1
                          if (a.start.hour == b.start.hour) {
                            if (a.start.min < b.start.min) return -1
                            if (a.start.min == b.start.min) {
                              if (a.end.hour < b.end.hour) return -1
                              return -1
                            }
                            return 1
                          }
                          return 1
                        })
                        newMenus[parseInt(selectedMenu)] = { ...newMenus[parseInt(selectedMenu)], activeTimes: newTimes };
                        setMenus(newMenus);
                      }}
                      onCancel={() => {
                        setEndOpen(false)
                      }}
                    />
                  </Surface>
                ))
              }
              {
                menus[parseInt(selectedMenu)].activeTimes[selectedDay].length == 0 ?
                  <View className=' mt-2'>
                    <Text className='text-center text-base'
                      style={{ color: theme.colors.inverseSurface, opacity: 0.8 }}>
                      No active times for this day
                    </Text>
                  </View>
                  :
                  null
              }
              <View className=' mt-2'>
                <IconButton
                  icon='plus'
                  style={{
                    backgroundColor: menus[parseInt(selectedMenu)].activeTimes[selectedDay].length > 4 ? theme.colors.surface : theme.colors.primary,
                    alignSelf: 'center'
                  }}
                  disabled={menus[parseInt(selectedMenu)].activeTimes[selectedDay].length > 4}
                  iconColor={theme.colors.onPrimary}
                  onPress={() => {
                    let newMenus = [...menus];
                    let newTimes = newMenus[parseInt(selectedMenu)].activeTimes
                    newTimes[selectedDay].push(new ActiveTime())
                    newMenus[parseInt(selectedMenu)] = { ...newMenus[parseInt(selectedMenu)], activeTimes: newTimes };
                    setMenus(newMenus)
                    setOpenedTime(menus[parseInt(selectedMenu)].activeTimes[selectedDay].length - 1)
                    setStartOpen(true)
                  }}
                />
              </View>
            </View>
            {
              menus[parseInt(selectedMenu)].sections.map((section, i) => (
                <View key={i}>
                  <View className='pl-4 py-2 flex-row'>
                    <TextInput
                      dense
                      style={{ flexGrow: 1, justifyContent: 'center', alignSelf: 'center' }}
                      clearTextOnFocus={section.name == "New Section"}
                      label="Section Name"
                      value={section.name}
                      mode="outlined"
                      onChangeText={text => {
                        let newMenus = [...menus];
                        let newSections = newMenus[parseInt(selectedMenu)].sections
                        newSections[i] = { ...newSections[i], name: text }
                        newMenus[parseInt(selectedMenu)] = { ...newMenus[parseInt(selectedMenu)], sections: newSections };
                        setMenus(newMenus)
                      }} />
                    <View className=' justify-center'>
                      <IconButton icon='close' style={{ alignSelf: 'center', marginRight: -4, paddingLeft: 4 }}
                        onPress={() => {
                          let newMenus = [...menus];
                          let newSections = newMenus[parseInt(selectedMenu)].sections;
                          newSections.splice(i, 1);
                          newMenus[parseInt(selectedMenu)] = { ...newMenus[parseInt(selectedMenu)], sections: newSections };
                          setMenus(newMenus);
                        }} />
                    </View>
                  </View>
                  {
                    section.items.map((item) => (
                      <View key={section.items.indexOf(item)} className='pl-8 py-2'>
                        <View className='flex-row'>
                          <View className=' flex-1'>
                            <TextInput
                              dense
                              style={{}}
                              label="Name"
                              value={item.name}
                              mode="outlined"
                              clearTextOnFocus={item.name == "New Item"}
                              onChangeText={text => {
                                let newMenus = [...menus];
                                let newSections = newMenus[parseInt(selectedMenu)].sections
                                let newItems = newSections[i].items
                                let itemIndex = section.items.indexOf(item)
                                newItems[itemIndex] = { ...newItems[itemIndex], name: text }
                                newSections[i] = { ...newSections[i], items: newItems }
                                newMenus[parseInt(selectedMenu)] = { ...newMenus[parseInt(selectedMenu)], sections: newSections };
                                setMenus(newMenus);
                              }} />
                          </View>
                          <View className=' justify-center'>
                            <IconButton icon='close' style={{ alignSelf: 'center', marginRight: -4, paddingLeft: 4 }}
                              onPress={() => {
                                let newMenus = [...menus];
                                let newSections = newMenus[parseInt(selectedMenu)].sections
                                let newItems = newSections[i].items
                                let itemIndex = section.items.indexOf(item)
                                newItems.splice(itemIndex, 1);
                                newSections[i] = { ...newSections[i], items: newItems }
                                newMenus[parseInt(selectedMenu)] = { ...newMenus[parseInt(selectedMenu)], sections: newSections };
                                setMenus(newMenus);
                              }} />
                          </View>
                        </View>
                        <View className='flex-row'>
                          <View className='flex-1'>
                            <CurrencyInput
                              className='mt-2'
                              value={item.price}
                              minValue={0}
                              onChangeValue={num => {
                                let newMenus = [...menus];
                                let newSections = newMenus[parseInt(selectedMenu)].sections
                                let newItems = newSections[i].items
                                let itemIndex = section.items.indexOf(item)
                                newItems[itemIndex] = { ...newItems[itemIndex], price: num ?? 0 }
                                newSections[i] = { ...newSections[i], items: newItems }
                                newMenus[parseInt(selectedMenu)] = { ...newMenus[parseInt(selectedMenu)], sections: newSections };
                                setMenus(newMenus);
                              }}
                              renderTextInput={textInputProps =>
                                <TextInput {...textInputProps} dense mode='outlined' label="Price" />
                              }
                              // renderText
                              prefix="£"
                              delimiter=","
                              separator="."
                              precision={2}
                            />
                            <TextInput
                              dense
                              style={{ marginTop: 8 }}
                              label="Description"
                              multiline
                              value={item.description}
                              mode="outlined"
                              onChangeText={text => {
                                let newMenus = [...menus];
                                let newSections = newMenus[parseInt(selectedMenu)].sections
                                let newItems = newSections[i].items
                                let itemIndex = section.items.indexOf(item)
                                newItems[itemIndex] = { ...newItems[itemIndex], description: text }
                                newSections[i] = { ...newSections[i], items: newItems }
                                newMenus[parseInt(selectedMenu)] = { ...newMenus[parseInt(selectedMenu)], sections: newSections };
                                setMenus(newMenus);
                              }} />
                          </View>
                          <View className='p-4 justify-center' style={{ alignSelf: 'center', borderRadius: 8, width: "47%", height: undefined, aspectRatio: 1 }}>
                            {item.photo != "" ?
                              <ImageBackground
                                style={{ width: "100%", height: "100%", alignSelf: 'center', }}
                                imageStyle={{ borderRadius: 8 }}
                                resizeMode='cover'
                                source={{ uri: item.photo }}
                              >
                                <Avatar.Icon
                                  icon="close"
                                  size={24}
                                  color={theme.colors.onPrimaryContainer}
                                  style={{ backgroundColor: theme.colors.primaryContainer, opacity: 0.9, top: 4, left: 4 }}
                                  onTouchEnd={() => {
                                    let newMenus = [...menus];
                                    let newSections = newMenus[parseInt(selectedMenu)].sections
                                    let newItems = newSections[i].items
                                    let itemIndex = section.items.indexOf(item)
                                    newItems[itemIndex] = { ...newItems[itemIndex], photo: "" }
                                    newSections[i] = { ...newSections[i], items: newItems }
                                    newMenus[parseInt(selectedMenu)] = { ...newMenus[parseInt(selectedMenu)], sections: newSections };
                                    setMenus(newMenus);
                                  }}
                                />
                              </ImageBackground>
                              :
                              <TouchableOpacity className='justify-center align-middle items-center'
                                style={{ borderRadius: 8, width: "100%", height: "100%", alignSelf: 'center', backgroundColor: theme.colors.surface }}
                                onPress={async () => {
                                  setButtonLoading(true);
                                  setActiveItem(section.items.indexOf(item))
                                  setActiveSection(i);
                                  await ImageService.pickImage(400, 400).then((source) => {
                                    if (source.path != "") {
                                      let newMenus = [...menus];
                                      let newSections = newMenus[parseInt(selectedMenu)].sections
                                      let newItems = newSections[i].items
                                      let itemIndex = section.items.indexOf(item)
                                      newItems[itemIndex] = { ...newItems[itemIndex], photo: source.path }
                                      newSections[i] = { ...newSections[i], items: newItems }
                                      newMenus[parseInt(selectedMenu)] = { ...newMenus[parseInt(selectedMenu)], sections: newSections };
                                      setMenus(newMenus);
                                    }
                                  });
                                  setButtonLoading(false);
                                }}
                              >
                                <FAB
                                  icon='camera'
                                  mode='flat'
                                  customSize={64}
                                  loading={buttonLoading && section.items.indexOf(item) == activeItem && i == activeSection}
                                  style={{ backgroundColor: theme.colors.surface }} />
                              </TouchableOpacity>
                            }
                          </View>
                        </View>
                      </View>
                    ))
                  }
                  <Button
                    mode='contained'
                    icon='hamburger-plus'
                    className='mb-6 mx-16'
                    onPress={() => {
                      let newMenus = [...menus];
                      let newSections = newMenus[parseInt(selectedMenu)].sections
                      let newItems = newSections[i].items
                      newItems.push(new MenuItem("New Item"))
                      newSections[i] = { ...newSections[i], items: newItems }
                      newMenus[parseInt(selectedMenu)] = { ...newMenus[parseInt(selectedMenu)], sections: newSections };
                      setMenus(newMenus)
                    }
                    }
                  >
                    Add Dish
                  </Button>
                </View>
              ))
            }
            <Button
              mode='contained'
              icon='playlist-plus'
              className='mx-4'
              onPress={() => {
                let newMenus = [...menus];
                let newSections = newMenus[parseInt(selectedMenu)].sections
                newSections.push(new MenuSection("New Section"))
                newMenus[parseInt(selectedMenu)] = { ...newMenus[parseInt(selectedMenu)], sections: newSections };
                setMenus(newMenus)
              }
              }
            >
              Add Section
            </Button>
          </Surface>
          : null
        }
        <View className='mb-4' style={{ justifyContent: 'center', alignItems: 'center', }}>
          <Button
            mode='contained'
            icon='text-box-plus'
            className='mt-4'
            contentStyle={{ paddingLeft: 8 }}
            onPress={() => {
              setMenus(old => [...old, new Menu("New Menu")]);
            }
            }
          >
            Add Menu
          </Button>
        </View>
      </ScrollView>
      <View className='px-8'>
        <Button
          icon="store-plus"
          mode='elevated'
          loading={uploading}
          buttonColor={theme.colors.primary}
          textColor={theme.colors.onPrimary}
          labelStyle={{ fontSize: 24 }}
          style={{
            // marginVertical: -30,
            // marginHorizontal: 60,
            // paddingVertical:6,
            // justifyContent: 'center',
            // alignItems: 'center',
          }}
          disabled={!allNecessaryFieldsFilled}
          contentStyle={{
            paddingVertical: 4
          }}
          onPress={async () => {
            setUploading(true);
            await DataStore.addRestaurant(restaurantName, user?.uid, restaurantLocation, photoRef, localImage.path, menus)
              .then(async () => {
                await ImageService.cleanTemp().then(() => {
                  setUploading(false);
                  added.current = true;
                  navigation.navigate({ name: "Restaurants", params: { added: true } }); // navigate directly to DetailPage?
                })
              })
          }
          }
        >
          <Text style={{ fontSize: 16 }}>Create Restaurant</Text>
        </Button>
      </View>
    </SafeAreaView >
  );
}

export default AddRestaurantPage;
