import React from 'react';
import {StyleSheet, SafeAreaView, Platform} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const styles = StyleSheet.create({
  root: {
    marginHorizontal: 20,
    marginBottom: 20,
    flex: 1,
    flexDirection: 'column',
    // backgroundColor: '#f5f5f5',
  },
});

const Margin20View = ({style, children}) => {
  return (
    <SafeAreaView style={[styles.root, style]}>
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        enableAutomaticScroll={Platform.OS === 'ios'}
        contentContainerStyle={{flexGrow: 1}}
        keyboardShouldPersistTaps="handled" // To close the keyboard when tapping outside an input
        showsVerticalScrollIndicator={false}>
        {children}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default Margin20View;
