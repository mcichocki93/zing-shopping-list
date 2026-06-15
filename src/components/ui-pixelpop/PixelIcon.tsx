import React from 'react';
import Svg, { Rect } from 'react-native-svg';

// ─── pixelarticons imports ───────────────────────────────────────────────────
import BellIcon from 'pixelarticons/svg/bell.svg';
import CartIcon from 'pixelarticons/svg/shopping-cart.svg';
import CheckIcon from 'pixelarticons/svg/check.svg';
import ChevronLIcon from 'pixelarticons/svg/chevron-left.svg';
import ChevronRIcon from 'pixelarticons/svg/chevron-right.svg';
import CloseIcon from 'pixelarticons/svg/close.svg';
import EditIcon from 'pixelarticons/svg/pen-square.svg';
import FilterIcon from 'pixelarticons/svg/filter.svg';
import GearIcon from 'pixelarticons/svg/settings-cog.svg';
import HeartIcon from 'pixelarticons/svg/heart.svg';
import ListBoxIcon from 'pixelarticons/svg/list-box.svg';
import MenuIcon from 'pixelarticons/svg/menu.svg';
import MicIcon from 'pixelarticons/svg/mic.svg';
import MinusIcon from 'pixelarticons/svg/minus.svg';
import PlusIcon from 'pixelarticons/svg/plus.svg';
import SearchIcon from 'pixelarticons/svg/search.svg';
import ShareIcon from 'pixelarticons/svg/share.svg';
import SparkleIcon from 'pixelarticons/svg/sparkle.svg';
import StarIcon from 'pixelarticons/svg/star.svg';
import TrashIcon from 'pixelarticons/svg/trash.svg';
import UserIcon from 'pixelarticons/svg/user.svg';
import UsersIcon from 'pixelarticons/svg/users.svg';

// ─── Pixelarticons map ───────────────────────────────────────────────────────
const PA_ICONS: Record<string, React.FC<{ width?: number; height?: number; color?: string }>> = {
  bell: BellIcon,
  cart: CartIcon,
  check: CheckIcon,
  chevronL: ChevronLIcon,
  chevron: ChevronRIcon,
  close: CloseIcon,
  edit: EditIcon,
  filter: FilterIcon,
  gear: GearIcon,
  heart: HeartIcon,
  menu: MenuIcon,
  mic: MicIcon,
  minus: MinusIcon,
  plus: PlusIcon,
  search: SearchIcon,
  share: ShareIcon,
  sparkle: SparkleIcon,
  star: StarIcon,
  template: ListBoxIcon,
  trash: TrashIcon,
  user: UserIcon,
  users: UsersIcon,
};

// ─── Custom pixel-art glyphs (16×16 Rect grid) ──────────────────────────────
type Rectangle = [number, number, number, number];

const GLYPHS: Record<string, Rectangle[]> = {
  logo: [[3,3,10,2],[3,5,2,2],[5,7,2,2],[7,9,2,2],[9,11,2,2],[3,13,10,2]],
  apple: [[6,2,2,2],[4,5,8,2],[3,7,10,4],[4,11,8,2],[6,13,4,1]],
  milk: [[5,2,6,2],[5,4,1,2],[10,4,1,2],[4,6,8,8]],
  bread: [[3,5,10,2],[2,7,12,4],[3,11,10,2]],
  drink: [[5,2,6,1],[5,3,1,11],[10,3,1,11],[6,13,4,1]],
  drag: [[4,4,2,2],[10,4,2,2],[4,8,2,2],[10,8,2,2],[4,12,2,2],[10,12,2,2]],
};

// ─── Component ───────────────────────────────────────────────────────────────

export type PixelIconName = keyof typeof PA_ICONS | keyof typeof GLYPHS;

interface PixelIconProps {
  name: PixelIconName | string;
  size?: number;
  color?: string;
}

export function PixelIcon({ name, size = 16, color = '#120E22' }: PixelIconProps) {
  const PaIcon = PA_ICONS[name];
  if (PaIcon) {
    return <PaIcon width={size} height={size} color={color} />;
  }

  const rects = GLYPHS[name] ?? [];
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      {rects.map(([x, y, w, h], i) => (
        <Rect key={i} x={x} y={y} width={w} height={h} fill={color} />
      ))}
    </Svg>
  );
}

export default PixelIcon;
