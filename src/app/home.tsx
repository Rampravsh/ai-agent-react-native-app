/**
 * Home Route ('/home')
 *
 * Redirects to the new Expo Router tabs layout ('/(tabs)/chat').
 */

import React from 'react';
import { Redirect } from 'expo-router';

export default function Home() {
  return <Redirect href={'/(tabs)/chat' as any} />;
}
