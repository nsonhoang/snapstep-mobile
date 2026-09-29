import { registerRootComponent } from 'expo';

import App from './App';
import { getMessaging } from '@react-native-firebase/messaging';

getMessaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log(' [Background FCM Message]:', remoteMessage);
  // Hệ điều hành Android/iOS sẽ tự hiển thị Heads-up banner nếu payload có trường `notification`
});


// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
