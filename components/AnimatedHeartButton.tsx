import React from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '../theme';
import { triggerLightHaptic } from '../utils/haptics';

interface AnimatedHeartButtonProps {
  liked: boolean;
  onPress: () => void;
  size?: number;
}

export const AnimatedHeartButton = React.memo(function AnimatedHeartButton({
  liked,
  onPress,
  size = 22,
}: AnimatedHeartButtonProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    triggerLightHaptic();
    scale.value = withSequence(
      withSpring(1.32, { damping: 10, stiffness: 360 }),
      withSpring(1, { damping: 14, stiffness: 280 })
    );
    onPress();
  };

  return (
    <Pressable onPress={handlePress} hitSlop={10}>
      <Animated.View style={animStyle}>
        <Ionicons
          name={liked ? 'heart' : 'heart-outline'}
          size={size}
          color={liked ? colors.accent : colors.textSecondary}
        />
      </Animated.View>
    </Pressable>
  );
});
