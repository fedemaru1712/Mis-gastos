import { useEffect, useState } from "react";

const IOS_INSTALL_HINT_DISMISSED_KEY = "ios-install-hint-dismissed";

type IOSNavigator = Navigator & {
  standalone?: boolean;
};

function isIosDevice(userAgent: string) {
  return /iPad|iPhone|iPod/.test(userAgent) || (userAgent.includes("Mac") && navigator.maxTouchPoints > 1);
}

function isSafariBrowser(userAgent: string) {
  return /Safari/.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(userAgent);
}

function isStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as IOSNavigator).standalone === true;
}

export function useIosInstallHint() {
  const [shouldShowHint, setShouldShowHint] = useState(false);

  useEffect(() => {
    const dismissed = window.localStorage.getItem(IOS_INSTALL_HINT_DISMISSED_KEY) === "true";
    const userAgent = window.navigator.userAgent;
    const shouldPrompt = isIosDevice(userAgent) && isSafariBrowser(userAgent) && !isStandaloneMode() && !dismissed;

    setShouldShowHint(shouldPrompt);
  }, []);

  function dismissHint() {
    window.localStorage.setItem(IOS_INSTALL_HINT_DISMISSED_KEY, "true");
    setShouldShowHint(false);
  }

  return {
    shouldShowHint,
    dismissHint,
  };
}
