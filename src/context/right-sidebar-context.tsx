import { createContext, useContext, ReactNode } from 'react';

type RightSidebarContextType = {
  setRightSidebarContent: (content: ReactNode | null) => void;
};

export const RightSidebarContext = createContext<
  RightSidebarContextType | undefined
>(undefined);

export function useSetRightSidebar() {
  const context = useContext(RightSidebarContext);
  if (!context) {
    throw new Error(
      'useSetRightSidebar must be used within a RightSidebarContext.Provider',
    );
  }
  return context;
}
