import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Animate an integer from 0 to `target` over `duration` ms when `run` is true.
 * Drives a JS-side state value (no native driver) so callers can render the
 * number directly. Used for the quality score and reward count-up.
 */
export function useCountUp(target: number, duration: number, run: boolean): number {
  const [value, setValue] = useState(0);
  const [anim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!run) return;
    const id = anim.addListener(({ value: v }) => setValue(Math.round(v)));
    const animation = Animated.timing(anim, {
      toValue: target,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start();
    return () => {
      animation.stop();
      anim.removeListener(id);
    };
  }, [target, duration, run, anim]);

  return value;
}
