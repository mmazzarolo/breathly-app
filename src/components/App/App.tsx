import React, { FC } from "react";
import { AppContextProvider } from "../../context/AppContext";
import { AppMain } from "./AppMain";

// App entry point used to wrap the core logic of the app with context providers
export const App: FC = () => {
  return (
    <AppContextProvider>
      <AppMain />
    </AppContextProvider>
  );
};
