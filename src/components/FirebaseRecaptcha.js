import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const FirebaseRecaptcha = forwardRef(({ firebaseConfig }, ref) => {
    const [visible, setVisible] = useState(false);
    const resolveRef = useRef(null);
    const rejectRef = useRef(null);

    useImperativeHandle(ref, () => ({
        verify: () => {
            return new Promise((resolve, reject) => {
                setVisible(true);
                resolveRef.current = resolve;
                rejectRef.current = reject;
            });
        },
        type: 'recaptcha',
        // Firebase Auth SDK calls these
        _reset: () => { setVisible(false); },
        reset: () => { setVisible(false); }
    }));

    const handleCancel = () => {
        setVisible(false);
        if (rejectRef.current) rejectRef.current(new Error("Verification cancelled"));
    };

    const injectedJS = `
    (function() {
      var interval = setInterval(function() {
        if (window.grecaptcha && window.grecaptcha.render) {
          clearInterval(interval);
          var originalRender = window.grecaptcha.render;
          window.grecaptcha.render = function(container, parameters) {
            var originalCallback = parameters.callback;
            parameters.callback = function(token) {
              window.ReactNativeWebView.postMessage(token);
              if (originalCallback) originalCallback(token);
            };
            return originalRender(container, parameters);
          };
        }
      }, 100);
    })();
    true;
  `;

    if (!visible) return null;

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={handleCancel}>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Verifying Security</Text>
                    <Pressable onPress={handleCancel}><Text style={styles.cancel}>Cancel</Text></Pressable>
                </View>
                <WebView
                    source={{ uri: `https://${firebaseConfig.authDomain}/__/auth/handler?apiKey=${firebaseConfig.apiKey}&appName=${firebaseConfig.projectId}&lang=en` }}
                    javaScriptEnabled
                    domStorageEnabled
                    injectedJavaScript={injectedJS}
                    onMessage={(event) => {
                        const token = event.nativeEvent.data;
                        if (token) {
                            setVisible(false);
                            if (resolveRef.current) resolveRef.current(token);
                        }
                    }}
                    startInLoadingState
                    renderLoading={() => <ActivityIndicator style={styles.loading} />}
                />
            </SafeAreaView>
        </Modal>
    );
});

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: '#eee', alignItems: 'center' },
    title: { fontWeight: 'bold', fontSize: 16 },
    cancel: { color: '#007AFF', fontSize: 16 }, // System blue
    loading: { position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -10 }, { translateY: -10 }] }
});

export default FirebaseRecaptcha;
