/**
 * @format
 */

import {
    MD3LightTheme as LightTheme,
    MD3DarkTheme as DarkTheme,
    Provider as PaperProvider,
} from 'react-native-paper';

const lightTheme = {
    ...LightTheme,
    colors: {
        ...LightTheme.colors,
        myOwnColor: '#BADA56',
    },
};

const darkTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        myOwnColor: '#BADA55',
    },
};

export { lightTheme, darkTheme };
