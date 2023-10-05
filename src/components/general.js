import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

const styles = StyleSheet.create({
  pillButton: {
    borderRadius: 20,
    padding: 10,
  },
  continueButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    padding: 10,
    height: 45,
  },
  wideButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#000000',
    padding: 10,
  },
});

export const SpacingVar = ({length, ...props}) => {
  const {horizontal = false} = props;
  return (
    <View
      {...props}
      style={{
        height: horizontal ? 0 : length,
        width: horizontal ? length : 0,
        opacity: 0,
      }}
    />
  );
};

export const Spacing40 = props => {
  const {horizontal = false} = props;
  return (
    <View
      {...props}
      style={{
        height: horizontal ? 0 : 40,
        width: horizontal ? 40 : 0,
        opacity: 0,
      }}
    />
  );
};

export const Spacing20 = props => {
  const {horizontal = false} = props;
  return (
    <View
      {...props}
      style={{
        height: horizontal ? 0 : 20,
        width: horizontal ? 20 : 0,
        opacity: 0,
      }}
    />
  );
};

export const Spacing10 = props => {
  const {horizontal = false} = props;
  return (
    <View
      {...props}
      style={{
        height: horizontal ? 0 : 10,
        width: horizontal ? 10 : 0,
        opacity: 0,
      }}
    />
  );
};

export const Spacing05 = props => {
  const {horizontal = false} = props;
  return (
    <View
      {...props}
      style={{
        height: horizontal ? 0 : 5,
        width: horizontal ? 5 : 0,
        opacity: 0,
      }}
    />
  );
};

export const PillButton = ({text, color, onPress, ...props}) => {
  return (
    <TouchableOpacity
      {...props}
      style={[styles.pillButton, {backgroundColor: color}]}
      onPress={onPress}>
      <Text> {text} </Text>
    </TouchableOpacity>
  );
};

export const ContinueButton = ({
  color,
  onPress,
  text = 'Continue',
  style,
  disabled,
  colorDisabled = '#808080',
  ...props
}) => {
  return (
    <TouchableOpacity
      {...props}
      disabled={disabled}
      style={[
        styles.continueButton,
        {backgroundColor: disabled ? colorDisabled : color},
        style,
      ]}
      onPress={onPress}>
      <Text style={{color: 'white', fontWeight: 'bold', fontSize: 15}}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

export const WideButton = ({
  color,
  textColor,
  onPress,
  text,
  style,
  ...props
}) => {
  return (
    <TouchableOpacity
      {...props}
      style={[styles.wideButton, {backgroundColor: color}, style]}
      onPress={onPress}>
      <Text style={{color: textColor, fontWeight: 'bold', fontSize: 15}}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};
