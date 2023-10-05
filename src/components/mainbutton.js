import React from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icon: {
    width: 32,
    height: 32,
    color: '#000',
  },
  box: {
    flex: 1,
    borderWidth: 0.7,
    borderColor: 'black',
    backgroundColor: 'transparent',
    // minHeight: 50,
    height: 75,
    // maxHeight: 50,
    // width: 100,
    flexGrow: 1,
    padding: 20,
    borderRadius: 3,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const MainButton = ({Icon, text, onPress}) => {
  return (
    <TouchableOpacity style={styles.box} onPress={onPress}>
      <Icon style={styles.icon} />
      <Text> {text} </Text>
    </TouchableOpacity>
  );
};

export default MainButton;
