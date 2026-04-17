import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { brandGreen } from '../constants/theme';

import WebViewContainer from './WebViewContainer';

const styles = StyleSheet.create({
    safeAreaView: {
        flex: 1,
        backgroundColor: brandGreen,
    },
});

export default function Index() {
    return (
        <SafeAreaView style={styles.safeAreaView}>
            <WebViewContainer />
        </SafeAreaView>
    );
}
