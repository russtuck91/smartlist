import { useEffect, useRef } from 'react';
import { BackHandler, StyleSheet } from 'react-native';
import WebView, { WebViewNavigation } from 'react-native-webview';

const styles = StyleSheet.create({
    webview: {
        backgroundColor: 'transparent',
    },
});

export default function WebViewContainer() {
    const webviewRef = useRef<WebView>(null);
    let canGoBack = false;

    const handleBackButton = (): boolean => {
        if (canGoBack && webviewRef.current) {
            webviewRef.current.goBack();
            return true;
        }
        return false;
    };
    useEffect(() => {
        const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
        return () => subscription.remove();
    }, []);

    const handleNavigationStateChange = (navState: WebViewNavigation) => {
        canGoBack = navState.canGoBack;
    };

    return (
        <WebView
            ref={webviewRef}
            source={{
                uri: 'https://www.smartlistmusic.com/',
            }}
            style={styles.webview}
            onNavigationStateChange={handleNavigationStateChange}
        />
    );
}
