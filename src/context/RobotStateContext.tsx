import React, {createContext, useState, useContext, ReactNode, useCallback} from 'react';
import RobotCommandService from '../services/RobotCommandService';
import {
  CMD_SPEED_1,
  CMD_SPEED_2,
  CMD_SPEED_3,
  CMD_AUTO_MODE,
  CMD_MANUAL_MODE,
} from '../constants/commands';

interface RobotStateContextType {
  activeSpeed: number;
  activeMode: 'manual' | 'auto';
  setSpeed: (level: number) => void;
  setMode: (mode: 'manual' | 'auto') => void;
}

const RobotStateContext = createContext<RobotStateContextType | undefined>(undefined);

export const RobotStateProvider: React.FC<{children: ReactNode}> = ({children}) => {
  // Default app state aligns with previous component local states
  const [activeSpeed, setActiveSpeedState] = useState<number>(2);
  const [activeMode, setActiveModeState] = useState<'manual' | 'auto'>('auto');

  const setSpeed = useCallback((level: number) => {
    setActiveSpeedState(level);
    let cmd = CMD_SPEED_2;
    if (level === 1) cmd = CMD_SPEED_1;
    else if (level === 3) cmd = CMD_SPEED_3;
    RobotCommandService.sendCommand(cmd);
  }, []);

  const setMode = useCallback((mode: 'manual' | 'auto') => {
    setActiveModeState(mode);
    RobotCommandService.sendCommand(mode === 'auto' ? CMD_AUTO_MODE : CMD_MANUAL_MODE);
  }, []);

  return (
    <RobotStateContext.Provider value={{activeSpeed, activeMode, setSpeed, setMode}}>
      {children}
    </RobotStateContext.Provider>
  );
};

export const useRobotState = () => {
  const context = useContext(RobotStateContext);
  if (context === undefined) {
    throw new Error('useRobotState must be used within a RobotStateProvider');
  }
  return context;
};
