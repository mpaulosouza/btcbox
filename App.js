import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { ContentView } from './view/ContentView';
import config from './config/config.json';

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');

  useEffect(()=> {
    registerForPushNotificationsAsync();
  },[]);

  useEffect(()=>{
    if(expoPushToken != null){
        sendToken();
    }
  },[expoPushToken]);

  async function registerForPushNotificationsAsync() {
    let token;
    if (Constants.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token);
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
  
    return token;
  }

  async function sendToken()
  {
    let response = await fetch(config.urlRoot+'token',{
        method:'POST',
        headers:{
            Accept:'application/json',
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            token: expoPushToken
        })
    });
  }

  return (
    <View style={styles.container}>
      <ContentView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
});
