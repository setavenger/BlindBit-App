import React, {useEffect, useRef} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Platform,
  View,
  Text,
  Animated,
  TouchableOpacity,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import RefreshIcon from '../assets/icons/bitcoin-icons/svg/outline/refresh.svg';

const styles = StyleSheet.create({
  root: {
    marginHorizontal: 20,
    marginBottom: 20,
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F5F5F5',
  },
  loading: {
    backgroundColor: 'rgba(223, 223, 223, 0.8)',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  icon: {
    height: 64,
    width: 64,
  },
});

const LoadingOverlay = ({loading}) => {
  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startRotation();
  }, []);

  const startRotation = () => {
    rotateValue.setValue(0);
    Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ).start();
  };

  const spin = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    loading && (
      <View style={styles.loading}>
        <Animated.View style={{transform: [{rotate: spin}]}}>
          <RefreshIcon style={styles.icon} />
        </Animated.View>

        <Text style={{fontSize: 20}}>Loading...</Text>
      </View>
    )
  );
};

export const Margin20ViewScroll = ({style, children, loading}) => {
  return (
    <>
      <View style={{flex: 1, backgroundColor: '#F5F5F5'}}>
        <SafeAreaView style={[style, {flex: 1}]}>
          <KeyboardAwareScrollView
            style={styles.root}
            enableOnAndroid={true}
            enableAutomaticScroll={Platform.OS === 'ios'}
            contentContainerStyle={{flexGrow: 1}}
            keyboardShouldPersistTaps="handled" // To close the keyboard when tapping outside an input
            showsVerticalScrollIndicator={false}>
            {children}
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </View>
      <LoadingOverlay loading={loading} />
    </>
  );
};

export const Margin20View = ({style, children, loading = false}) => {
  return (
    <>
      <View style={{flex: 1, backgroundColor: '#F5F5F5'}}>
        <SafeAreaView style={[styles.root, style]}>{children}</SafeAreaView>
      </View>
      <LoadingOverlay loading={loading} />
    </>
  );
};
