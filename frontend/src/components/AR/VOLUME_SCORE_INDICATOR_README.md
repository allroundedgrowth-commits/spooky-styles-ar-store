# Volume Score Indicator Component

## Overview

The `VolumeScoreIndicator` component displays the hair volume score as a visual gauge (0-100) with a category label. It provides real-time feedback to users about their hair volume and whether automatic flattening will be applied.

## Features

- **Visual Gauge**: Displays score as an animated progress bar (0-100)
- **Category Label**: Shows volume category (minimal/moderate/high/very-high)
- **Fast Updates**: Updates within 200ms of detection completion with smooth animations
- **Halloween Theme**: Styled with purple, orange, and green colors
- **Auto-flatten Indicator**: Shows threshold marker at 40 on the gauge
- **Responsive Design**: Adapts to different screen sizes

## Requirements

Validates: **Requirements 1.4**

## Usage

```tsx
import { VolumeScoreIndicator } from '../components/AR/VolumeScoreIndicator';

function MyComponent() {
  const { hairProcessingState } = useSimple2DAR();

  return (
    <VolumeScoreIndicator
      score={hairProcessingState?.segmentationData?.volumeScore || 0}
      category={hairProcessingState?.segmentationData?.volumeCategory || 'minimal'}
      isVisible={true}
    />
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `score` | `number` | Yes | - | Hair volume score (0-100) |
| `category` | `VolumeCategory` | Yes | - | Volume category: 'minimal', 'moderate', 'high', or 'very-high' |
| `isVisible` | `boolean` | No | `true` | Whether to show the indicator |
| `className` | `string` | No | `''` | Additional CSS classes |

## Volume Categories

The component displays different colors and icons based on the volume category:

| Category | Score Range | Color | Icon | Description |
|----------|-------------|-------|------|-------------|
| Minimal | 0-19 | Green | ▁ | Very low hair volume |
| Moderate | 20-49 | Orange | ▃ | Medium hair volume |
| High | 50-74 | Purple | ▅ | High hair volume |
| Very High | 75-100 | Red | ▇ | Very high hair volume |

## Visual Elements

### Progress Bar
- Animated gradient background showing the full 0-100 range
- Colored fill that grows to match the current score
- Shimmer animation during score updates
- Threshold marker at 40 (auto-flatten trigger point)

### Score Display
- Large numeric display of current score
- Category badge with icon and label
- Info text explaining whether flattening is recommended

### Performance
- Score updates animate smoothly over 200ms
- Uses `requestAnimationFrame` for smooth animations
- Ease-out timing function for natural motion

## Styling

The component uses Halloween theme colors:
- Background: `halloween-darkPurple` (#1a0033) with transparency
- Border: `halloween-purple` (#8b5cf6)
- Score colors:
  - Green (#10b981) for minimal volume
  - Orange (#f97316) for moderate volume
  - Purple (#8b5cf6) for high volume
  - Red (#dc2626) for very high volume

## Integration

The component is integrated into the `Simple2DARTryOn` page and appears as an overlay on the AR canvas when hair segmentation data is available:

```tsx
{isInitialized && hairProcessingState?.segmentationData && (
  <div className="absolute top-4 right-4 z-10">
    <VolumeScoreIndicator
      score={hairProcessingState.segmentationData.volumeScore}
      category={hairProcessingState.segmentationData.volumeCategory}
      isVisible={true}
    />
  </div>
)}
```

## Animation Details

The component uses a custom animation system:
1. When score changes, it captures the start and target values
2. Uses `requestAnimationFrame` for smooth 60fps animation
3. Applies ease-out easing for natural deceleration
4. Completes animation within 200ms (requirement)
5. Shows shimmer effect during animation

## Accessibility

- Clear visual hierarchy with large score display
- Color-coded categories with both color and icon indicators
- Descriptive text explaining the score meaning
- High contrast text on dark background

## Testing

The component should be tested with:
- Various score values (0, 20, 40, 50, 75, 100)
- Rapid score changes to verify animation performance
- Different volume categories
- Show/hide transitions
- Mobile and desktop viewports

## Future Enhancements

Potential improvements:
- Add click-to-expand for detailed volume breakdown
- Show historical score graph
- Add sound effects for threshold crossing
- Provide tips based on volume category
- Add accessibility features (screen reader support)
