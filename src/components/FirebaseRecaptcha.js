import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { forwardRef } from 'react';

const FirebaseRecaptcha = forwardRef(({ firebaseConfig }, ref) => {
    return (
        <FirebaseRecaptchaVerifierModal
            ref={ref}
            firebaseConfig={firebaseConfig}
            attemptInvisibleVerification={true}
        />
    );
});

export default FirebaseRecaptcha;
