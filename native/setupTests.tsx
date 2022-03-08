import React from 'react';
import { ViewProps } from 'react-native';


jest.mock('react-native', () => ({
    BackHandler: {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
    },
    StyleSheet: {
        create: () => ({}),
    },
    Platform: {
        select: jest.fn(),
    },
    StatusBar: () => 'StatusBar',
    SafeAreaView: ({ children }: ViewProps) => <>{children}</>,
}));

jest.mock('react-native-splash-screen', () => ({
    hide: jest.fn(),
}));

jest.mock('react-native-webview', () => 'WebView');
