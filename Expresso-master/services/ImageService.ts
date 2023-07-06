import { Alert, Linking } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import ImagePicker from "react-native-image-crop-picker";
import { check, openLimitedPhotoLibraryPicker, PERMISSIONS, request, RESULTS } from "react-native-permissions";

class ImageService {
  static async getImageLibraryPermissions() {
    let libaryGranted = false;
    const res = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);

    if (res === RESULTS.GRANTED || res === RESULTS.LIMITED) {
      libaryGranted = true;
    } else if (res === RESULTS.DENIED) {
      const res2 = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
      res2 === RESULTS.GRANTED
        ? libaryGranted = true : libaryGranted = false;
    }
    else if (res === RESULTS.BLOCKED) {
      libaryGranted = false;
    }
    return libaryGranted;
  }
  
  static async cleanTemp() {
    await ImagePicker.clean().then(() => {
      console.log('Cleared image temporary cache');
    }).catch(e => {
      console.warn(e);
    });
  }

  static async pickImage(height:number, width:number) {
    const granted = await this.getImageLibraryPermissions();
    let source = {path:""}
    if (granted) {
      await ImagePicker.openPicker({
        width: width,
        height: height,
        cropping: true,
        includeBase64: true,
        forceJpg: true,
        mediaType:'photo'
      }).then(image => {
        source = { path: image.path }
        return source
      }
      ).catch(error => {
        console.log(error)
      });
      // AN ALTERNATIVE IMAGE LIBRARY THAT DIDN'T RETURN IMAGE URIS
      // await launchImageLibrary({ mediaType: 'photo', selectionLimit:1, includeBase64:true, maxHeight:200, maxWidth:200 },
      //   (response) => {
      //     console.log('Response = ', response);
      //     if (response.didCancel) {
      //       console.log('User cancelled image picker');
      //     }
      //     else if (response.errorMessage) {
      //       console.log('ImagePicker Error: ', response.errorMessage);
      //     }
      //     else if (response.assets) {
      //       source = { uri: response.assets[0].uri };
      //       console.log('source', source);
      //     }
      //   }
      // );
    }
    else {
      Alert.alert("Permission denied", "Photo Library permission has been denied",
        [{
          text: 'Go to Settings',
          onPress: () => Linking.openSettings(),
        },
        {
          text: 'OK',
          style: 'cancel',
          }]
      )
    }
    return source;
  }
}

export default ImageService