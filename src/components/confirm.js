import {Alert} from 'react-native';

export const showConfirmAlert = (title = 'Confirmation', message = '') => {
  return new Promise((resolve, reject) => {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'Cancel',
          onPress: () => resolve(false),
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => resolve(true),
        },
      ],
      {cancelable: false}, // Setting this to false ensures users must select an option
    );
  });
};
