import React, { useState, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import ScreenTransition from './ScreenTransition';

export default function TransitionWrapper({ children }) {
  const isFocused = useIsFocused();
  const [transitionKey, setTransitionKey] = useState(0);
  const [showTransition, setShowTransition] = useState(false);

  useEffect(() => {
    if (isFocused) {
      setShowTransition(true);
      setTransitionKey(prev => prev + 1);
    }
  }, [isFocused]);

  return (
    <ScreenTransition key={transitionKey} isVisible={showTransition}>
      {children}
    </ScreenTransition>
  );
}