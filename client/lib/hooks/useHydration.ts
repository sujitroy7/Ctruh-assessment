import { useEffect, useState } from "react";

export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is ready
    // Then set hydrated to true on the next tick
    const unsubscribe = setTimeout(() => {
      setIsHydrated(true);
    }, 0);

    return () => clearTimeout(unsubscribe);
  }, []);

  return isHydrated;
}
