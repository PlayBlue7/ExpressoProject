import * as React from 'react';
import { Text, View, StyleSheet, Animated, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DynamicHeader = ({ animHeaderValue, googlePhotoRef }) => {

    const insets = useSafeAreaInsets();
    const Max_Header_Height = 200;
    const Min_Header_Height = insets.top;
    const Scroll_Distance = Max_Header_Height - Min_Header_Height

    const animatedHeaderHeight = animHeaderValue.interpolate({
        inputRange: [0, Scroll_Distance],
        outputRange: [Max_Header_Height, Min_Header_Height],
        extrapolate: 'clamp'
    })

    const animatedOpacity = animHeaderValue.interpolate({
        inputRange: [0, Max_Header_Height - Min_Header_Height],
        outputRange: [1, 0.3],
        extrapolate: 'clamp'
    })

    return (
        <Animated.Image
            source={{ uri: "https://maps.googleapis.com/maps/api/place/photo?maxwidth=2000&photo_reference=" + googlePhotoRef + "&key=" }}
            style={{ height: animatedHeaderHeight, opacity: animatedOpacity }}
        />
        // <Animated.View
        //     style={[
        //         styles.header,
        //         {
        //             height: animatedHeaderHeight,
        //             backgroundColor: animatedHeaderBackgroundColor
        //         }

        //     ]}
        // >
        //     <Text style={styles.headerText}>
        //         A List of Books
        //     </Text>
        //     <Image
        //   source={{ uri: "https://maps.googleapis.com/maps/api/place/photo?maxwidth=2000&photo_reference=" + googlePhotoRef + "&key=" }}
        //   style={{ width: '100%', aspectRatio: 16 / 9 }}
        // />
        // </Animated.View>
    );
};

const styles = StyleSheet.create({
    header: {
        justifyContent: 'center',
        alignItems: 'center',
        left: 0,
        right: 0,
        paddingTop: 10
    },
    headerText: {
        color: '#fff',
        fontSize: 25,
        fontWeight: 'bold',
        textAlign: 'center'
    },
});

export default DynamicHeader;