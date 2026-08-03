const TARGET_ACCURACY_METERS = 150;
const MAX_ACCEPTABLE_ACCURACY_METERS = 1500;

export function getAccurateCurrentPosition(timeoutMs = 20000): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Location is not supported in this browser."));
      return;
    }

    let best: GeolocationPosition | null = null;
    let watchId = 0;
    const finish = () => {
      navigator.geolocation.clearWatch(watchId);
      window.clearTimeout(timer);
      if (best && best.coords.accuracy <= MAX_ACCEPTABLE_ACCURACY_METERS) resolve(best);
      else reject(new Error("Precise location unavailable. Turn on GPS and Precise Location, then try again outdoors."));
    };
    const timer = window.setTimeout(finish, timeoutMs);

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (!best || position.coords.accuracy < best.coords.accuracy) best = position;
        if (position.coords.accuracy <= TARGET_ACCURACY_METERS) finish();
      },
      (error) => {
        navigator.geolocation.clearWatch(watchId);
        window.clearTimeout(timer);
        reject(new Error(error.code === error.PERMISSION_DENIED
          ? "Please allow Precise Location permission and try again."
          : "Current GPS location could not be detected. Please try again."));
      },
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 },
    );
  });
}

