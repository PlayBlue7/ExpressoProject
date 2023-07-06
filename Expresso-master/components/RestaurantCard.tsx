/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';

// import type {PropsWithChildren} from 'react';
import {
  ImageBackground,
  Text,
  View,
} from 'react-native';


import { ActivityIndicator, Button, Card } from 'react-native-paper';
import { useAppTheme } from '../App';

interface RestaurantCardProps {
  owner: string;
  title: string;
  googlePhotoRef: string;
  coverPhoto: string;
  distance: number;
}

function RestaurantCard(props: RestaurantCardProps) {
  const theme = useAppTheme();
  const [loading, setLoading] = useState(false);

  const imageRef =
    props.coverPhoto == "" ?
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=2000&photo_reference=" + props.googlePhotoRef + "&key="
      : props.coverPhoto

  return (
    <Card style={{ borderRadius: 10, overflow: 'hidden' }}>
      <View>
        <ImageBackground
          style={{
            width: "100%", height: undefined, aspectRatio: 16 / 9,
            opacity: 0.8
          }}
          onLoadStart={() => { setLoading(true) }}
          onLoadEnd={() => { setLoading(false) }}
          resizeMode='cover'
          source={{
            uri: imageRef
          }}
        >
          {
            loading ?
              <ActivityIndicator
                animating={true}
                size='small'
                color={theme.colors.primary}
                style={{ width: "100%", height: undefined, aspectRatio: 16 / 9, }}
              />
              : null
          }

        </ImageBackground>
      </View>

      <View style={{ position: 'absolute', bottom: 20, left: 20, }}>
        <Text
          style={{
            fontSize: 30,
            color: 'white',
            textShadowColor: 'rgba(0, 0, 0, 0.75)',
            textShadowOffset: { width: -1, height: 1 },
            textShadowRadius: 10
          }}>
          {props.title}
        </Text>
      </View>

      <View style={{ position: 'absolute', top: 10, right: 10 }}>
        <View style={{ flexDirection: 'row' }}>
          <Button
            icon="map-marker-radius"
            mode="contained"
            buttonColor={theme.colors.background}
            textColor={theme.colors.onBackground}
            style={{ opacity: 0.9 }}
          >
            <Text style={{ color: theme.colors.onBackground }}>
              {props.distance + " miles"}
            </Text>
          </Button>
        </View>
      </View>

    </Card>
  );
}

export default RestaurantCard;