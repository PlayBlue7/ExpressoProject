import { useState } from 'react';

import Geolocation from 'react-native-geolocation-service';
import { PERMISSIONS, check, request, RESULTS } from 'react-native-permissions'
import Geocoder from 'react-native-geocoding';

class LocationService {

    static InitialiseLocationService() {
        Geocoder.init(""); // redacted for personal privacy
    }

    static async getLocationPermissions() {
        let locationGranted = false;
        const res = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

        if (res === RESULTS.GRANTED) {
            locationGranted = true;
        } else if (res === RESULTS.DENIED) {
            const res2 = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
            res2 === RESULTS.GRANTED
                ? locationGranted = true : locationGranted = false;
        }
        else if (res === RESULTS.BLOCKED) {
            locationGranted = false;
        }
        return locationGranted;
    }

    // function to check permissions and get Location
    static getLocationState() {
        const [location, setLocation] = useState({ longitude: 10, latitude: 10 });

        const getLocation = async (setLocation: (arg0: { longitude: number; latitude: number; }) => void) => {
            const granted = await this.getLocationPermissions();
            if (granted) {
                Geolocation.getCurrentPosition(
                    position => {
                        setLocation({ longitude: position.coords.longitude, latitude: position.coords.latitude });
                    },
                    error => {
                        // See error code charts below.
                        setLocation({ longitude: 0, latitude: 0 });
                    },
                    { enableHighAccuracy: true }
                );
            }
        };
        return { location, getLocation, setLocation }
    };

    static getGeocodingState() {
        const [geocodingLocation, setGeocoding] = useState("");

        const getGeocoding = async (setGeocoding: (arg0: string) => void,  location: Geocoder.fromParams) => {
            Geocoder.from(location)
                  .then(json => {
                    var addressComponent = json.results[0].formatted_address;
                    setGeocoding(addressComponent);
                  })
                  .catch(error => console.warn(error));
        };
        return { geocodingLocation, getGeocoding, setGeocoding }
    };


}

export default LocationService;