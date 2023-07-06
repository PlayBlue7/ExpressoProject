import firestore from '@react-native-firebase/firestore';
import { useState } from 'react';
import { Alert } from 'react-native';
import Restaurant from '../classes/Restaurant';
import ConversionService from './ConversionService';
import storage from '@react-native-firebase/storage';
import Menu from '../classes/Menu';

class DataStore {
    static getRestaurants() {

        const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
        const [dataLoading, setDataLoading] = useState(true);

        const loadRestaurants = (
            setRestaurants: (arg0: Restaurant[]) => void,
            setDataLoading: (arg0: boolean) => void,
            ownerUID: string,
            currentLocation: { longitude: number, latitude: number }
        ) => {
            if (ownerUID == null) {
                setRestaurants(restaurants)
                return
            }
            firestore().collection('Restaurants').where('owner', '==', ownerUID ? ownerUID : "0").onSnapshot(async querySnapshot => {
                if(querySnapshot == null) return
                setDataLoading(true)
                const restaurants: Restaurant[] = [];
                // querySnapshot.forEach(async doc => {
                for (const doc of querySnapshot.docs) {
                    const { name, owner, restaurantLocation, googlePhotoRef, coverPhoto, menuUIDs } = doc.data();
                    let menus: Menu[] = []
                    for (const menuUID of menuUIDs) {
                        await firestore().collection('Menus').doc(menuUID).get()
                            .then(async (menu) => {
                                const { name, sections, activeTimes } = menu.data();
                                for (const section of sections) {
                                    for (const item of section.items) {
                                        if (item.photo != "") {
                                            await storage().ref(item.photo).getDownloadURL()
                                                .then((url) => {
                                                    item.photo = url
                                                })
                                        }
                                    }
                                }
                                menus.push({
                                    uid: doc.id,
                                    name: name,
                                    sections: sections,
                                    activeTimes: activeTimes
                                })
                            });
                    }
                    await storage().ref(coverPhoto).getDownloadURL()
                        .then((url) => {
                            restaurants.push({
                                uid: doc.id,
                                name,
                                owner: owner,
                                location: restaurantLocation,
                                googlePhotoRef: "",
                                coverPhoto: url,
                                distance: ConversionService.getDistance(currentLocation, restaurantLocation),
                                menus: menus
                            });
                        })
                        .catch(() => { // if can't find photo or photo doesn't exist
                            restaurants.push({
                                uid: doc.id,
                                name,
                                owner: owner,
                                location: restaurantLocation,
                                googlePhotoRef: googlePhotoRef,
                                coverPhoto: "",
                                distance: ConversionService.getDistance(currentLocation, restaurantLocation),
                                menus: menus
                            });
                        })
                }
                // });
                setRestaurants(restaurants.sort(function (r1: Restaurant, r2: Restaurant) {
                    if (r1.distance < r2.distance) return -1;
                    if (r1.distance > r2.distance) return 1;
                    return 0;
                }));
                setDataLoading(false);
            });
        }
        return { dataLoading, setDataLoading, restaurants, loadRestaurants, setRestaurants };
    }
    static async addRestaurant(text: string, owner: string, restaurantLocation: { longitude: number, latitude: number }, googlePhotoRef: string, imagePath: string, menus: Menu[]) {
        let menuUIDs: string[] = []
        for (const menu of menus) {
            for (const section of menu.sections) {
                for (const item of section.items) {
                    if (item.photo != "") {
                        const fileName = "/MenuItemPhotos" + item.photo.substring(item.photo.lastIndexOf('/'))
                        const reference = storage().ref(fileName)
                        await reference.putFile(item.photo)
                        item.photo = fileName
                    }
                }
            }
            await firestore()
                .collection('Menus')
                .add(menu)
                .then(ref => menuUIDs.push(ref.id))
                .catch((error) => {
                    Alert.alert(error);
                });
        }
        if (imagePath == "") { // use googlePhotoRef instead
            await firestore()
                .collection('Restaurants')
                .add({
                    name: text,
                    owner: owner,
                    restaurantLocation: restaurantLocation,
                    googlePhotoRef: googlePhotoRef,
                    coverPhoto: "",
                    menuUIDs: menuUIDs
                })
                .catch((error) => {
                    Alert.alert(error);
                });
        }
        else {
            const fileName = "/RestaurantCoverPhotos" + imagePath.substring(imagePath.lastIndexOf('/') + 1);
            const reference = storage().ref(fileName)
            await reference.putFile(imagePath).then(() =>
                firestore()
                    .collection('Restaurants')
                    .add({
                        name: text,
                        owner: owner,
                        restaurantLocation: restaurantLocation,
                        googlePhotoRef: "",
                        coverPhoto: fileName,
                        menus: menuUIDs
                    })
                    .catch((error) => {
                        Alert.alert(error);
                    })
            );
        }
    }

    static async removeRestaurant(uid: string) {
        firestore()
            .collection('Restaurants')
            .doc(uid)
            .delete()
            .catch((error) => {
                Alert.alert(error);
            });
    }
}

export default DataStore;