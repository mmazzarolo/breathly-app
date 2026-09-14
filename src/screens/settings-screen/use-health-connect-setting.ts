import { useCallback, useEffect, useRef } from "react";
import { Alert } from "react-native";
import {
  getHealthConnectStatus,
  requestHealthConnectPermission,
} from "@breathly/services/health-connect";

type SetHealthConnectEnabled = (enabled: boolean) => unknown;

const unavailableMessages = {
  unavailable: "Health Connect is not available on this device.",
  updateRequired: "Install or update Health Connect before enabling this option.",
  unsupported: "This version of Health Connect cannot record mindfulness sessions.",
} as const;

export const useHealthConnectSetting = (setHealthConnectEnabled: SetHealthConnectEnabled) => {
  const requestInProgress = useRef(false);
  const desiredEnabled = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(
    async (enabled: boolean) => {
      desiredEnabled.current = enabled;
      if (!enabled) {
        setHealthConnectEnabled(false);
        return;
      }
      if (requestInProgress.current) return;

      requestInProgress.current = true;
      try {
        const status = await getHealthConnectStatus();
        if (!desiredEnabled.current) return;

        if (status === "authorized") {
          setHealthConnectEnabled(true);
          return;
        }
        if (status === "permissionRequired") {
          const granted = await requestHealthConnectPermission();
          if (!desiredEnabled.current) return;

          setHealthConnectEnabled(granted);
          if (!granted && isMounted.current) {
            Alert.alert(
              "Health Connect permission needed",
              "Allow Breathly to write mindfulness sessions to use this option.",
            );
          }
          return;
        }

        if (isMounted.current) {
          Alert.alert("Health Connect unavailable", unavailableMessages[status]);
        }
      } catch (error) {
        console.warn("[health-connect] could not request access", error);
        if (desiredEnabled.current && isMounted.current) {
          Alert.alert(
            "Health Connect unavailable",
            "Breathly could not connect to Health Connect.",
          );
        }
      } finally {
        requestInProgress.current = false;
      }
    },
    [setHealthConnectEnabled],
  );
};
