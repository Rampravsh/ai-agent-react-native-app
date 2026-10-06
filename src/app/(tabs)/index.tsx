/**
 * Tab Index Route ('/(tabs)')
 *
 * Redirects directly to the default Chat tab.
 */

import React from 'react';
import { Redirect } from 'expo-router';

export default function TabIndex() {
  return <Redirect href={'/(tabs)/chat' as any} />;
}
