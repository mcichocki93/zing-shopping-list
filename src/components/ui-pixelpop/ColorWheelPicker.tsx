import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { PP } from '../../constants/pixelPopTheme';

const SIZE = 220;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUTER_R = 100;
const MID_R = 68;
const INNER_R = 42;
const SEG_COUNT = 12;
const SEG_DEG = 360 / SEG_COUNT;
const GAP_DEG = 1.5;

function polar(r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function ringSegPath(r1: number, r2: number, startDeg: number, endDeg: number) {
  const s = startDeg + GAP_DEG;
  const e = endDeg - GAP_DEG;
  const large = e - s > 180 ? 1 : 0;
  const a = polar(r1, s), b = polar(r1, e);
  const c = polar(r2, e), d = polar(r2, s);
  const f = (n: number) => n.toFixed(2);
  return `M${f(a.x)} ${f(a.y)} A${r1} ${r1} 0 ${large} 1 ${f(b.x)} ${f(b.y)} L${f(c.x)} ${f(c.y)} A${r2} ${r2} 0 ${large} 0 ${f(d.x)} ${f(d.y)}Z`;
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

interface Props {
  value: string;
  onChange: (color: string) => void;
}

export function ColorWheelPicker({ value, onChange }: Props) {
  const segments = Array.from({ length: SEG_COUNT }, (_, i) => ({
    startDeg: i * SEG_DEG,
    endDeg: (i + 1) * SEG_DEG,
    outerColor: hslToHex(i * SEG_DEG, 90, 65),
    innerColor: hslToHex(i * SEG_DEG, 90, 45),
  }));

  return (
    <View style={{ alignItems: 'center', paddingVertical: 8 }}>
      <Svg width={SIZE} height={SIZE}>
        {segments.map(({ startDeg, endDeg, outerColor, innerColor }) => {
          const outerSel = value === outerColor;
          const innerSel = value === innerColor;
          return (
            <G key={startDeg}>
              <Path
                d={ringSegPath(OUTER_R, MID_R, startDeg, endDeg)}
                fill={outerColor}
                stroke={outerSel ? PP.ink : 'none'}
                strokeWidth={outerSel ? 3 : 0}
                onPress={() => onChange(outerColor)}
              />
              <Path
                d={ringSegPath(MID_R - 2, INNER_R, startDeg, endDeg)}
                fill={innerColor}
                stroke={innerSel ? PP.ink : 'none'}
                strokeWidth={innerSel ? 3 : 0}
                onPress={() => onChange(innerColor)}
              />
            </G>
          );
        })}
        {/* Center: current color preview */}
        <Circle cx={CX} cy={CY} r={INNER_R - 3} fill={value} stroke={PP.ink} strokeWidth={3} />
      </Svg>
    </View>
  );
}
