import {
  ToastAndroid,
  Platform,
  AlertIOS,
} from 'react-native';

export default Popup = (message) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT)
  } else {
    AlertIOS.alert(message);
  }
}