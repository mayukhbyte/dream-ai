# WaterRippleImage Component

A React component that renders an image with realistic water ripple effects using WebGL shaders.

## Features

- Real-time water ripple simulation
- Interactive controls for adjusting ripple properties
- Customizable image source
- Responsive full-screen canvas
- Performance optimized (devicePixelRatio capped at 2)

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `blueish` | number | 0.6 | Blue tint intensity |
| `scale` | number | 7 | Scale of the ripple effect |
| `illumination` | number | 0.15 | Lighting intensity |
| `surfaceDistortion` | number | 0.07 | Surface wave distortion |
| `waterDistortion` | number | 0.03 | Water refraction distortion |
| `src` | string | (see default) | Image URL to display |
| `showControls` | boolean | true | Whether to show adjustment controls |
| `className` | string | '' | Additional CSS classes |

## Usage

```tsx
import { WaterRippleImage } from '@/components/ui/water-ripple-image';

export default function MyComponent() {
  return (
    <div className="min-h-screen">
      <WaterRippleImage
        blueish={0.4}
        scale={7}
        illumination={0.15}
        surfaceDistortion={0.03}
        waterDistortion={0.02}
        src="https://example.com/my-image.jpg"
        className="mx-auto"
      />
    </div>
  );
}
```

## Installation

This component requires:
- React 18+
- No additional dependencies beyond React

It uses WebGL APIs which are available in all modern browsers.

## Implementation Notes

- The component uses a client-only directive ('use client') as it relies on browser APIs
- All WebGL resources are properly cleaned up on unmount
- The component handles image loading and texture updates automatically
- Controls are optional and can be hidden by setting showControls={false}