import { forwardRef } from 'react';

/**
 * Stub for FirebaseRecaptchaVerifierModal.
 * expo-firebase-recaptcha was deprecated and its dependency expo-firebase-core
 * is incompatible with modern Android Gradle Plugin (missing compileSdk).
 * Phone auth in this app uses a pre-obtained verificationId from the SMS flow,
 * so this component renders nothing while satisfying the existing ref usage.
 */
const FirebaseRecaptcha = forwardRef((_props, _ref) => {
    return null;
});

export default FirebaseRecaptcha;
