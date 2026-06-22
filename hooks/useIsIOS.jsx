import { useQuery } from "@tanstack/react-query";

const detectIsIOS = () => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isAppleMobile = /iPad|iPhone|iPod/.test(ua);
  // iPadOS 13+ reports as a Mac, so fall back to touch capability.
  const isIPadOS =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return isAppleMobile || isIPadOS;
};

/**
 * iOS Safari force-zooms the viewport when an input/textarea with a font-size
 * below 16px is focused. Detecting iOS lets components opt into a 16px minimum
 * only on those devices, leaving the smaller design untouched elsewhere.
 *
 * The result can't change within a session, so it's resolved once and held in
 * the react-query cache forever (staleTime/gcTime: Infinity) instead of being
 * recomputed on every mount.
 *
 * @return {boolean}
 */
const useIsIOS = () => {
  const { data } = useQuery({
    queryKey: ["is-ios"],
    queryFn: detectIsIOS,
    placeholderData: false,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  return Boolean(data);
};

export default useIsIOS;
