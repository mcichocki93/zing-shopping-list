import React from 'react';
import Svg, { Rect } from 'react-native-svg';

// ─── pixelarticons imports ───────────────────────────────────────────────────
import BellIcon from 'pixelarticons/svg/bell.svg';
import CakeIcon from 'pixelarticons/svg/cake.svg';
import CartIcon from 'pixelarticons/svg/shopping-cart.svg';
import CheckIcon from 'pixelarticons/svg/check.svg';
import ChevronLIcon from 'pixelarticons/svg/chevron-left.svg';
import ChevronRIcon from 'pixelarticons/svg/chevron-right.svg';
import CloseIcon from 'pixelarticons/svg/close.svg';
import CoffeeIcon from 'pixelarticons/svg/coffee.svg';
import EditIcon from 'pixelarticons/svg/pen-square.svg';
import FilterIcon from 'pixelarticons/svg/filter.svg';
import FishIcon from 'pixelarticons/svg/fish.svg';
import GearIcon from 'pixelarticons/svg/settings-cog.svg';
import HeartIcon from 'pixelarticons/svg/heart.svg';
import LeafIcon from 'pixelarticons/svg/leaf.svg';
import ListBoxIcon from 'pixelarticons/svg/list-box.svg';
import MenuIcon from 'pixelarticons/svg/menu.svg';
import MicIcon from 'pixelarticons/svg/mic.svg';
import MinusIcon from 'pixelarticons/svg/minus.svg';
import PackageIcon from 'pixelarticons/svg/package.svg';
import PlusIcon from 'pixelarticons/svg/plus.svg';
import SearchIcon from 'pixelarticons/svg/search.svg';
import ShareIcon from 'pixelarticons/svg/share.svg';
import SparkleIcon from 'pixelarticons/svg/sparkle.svg';
import SprayCanIcon from 'pixelarticons/svg/spray-can.svg';
import StarIcon from 'pixelarticons/svg/star.svg';
import TrashIcon from 'pixelarticons/svg/trash.svg';
import UserIcon from 'pixelarticons/svg/user.svg';
import UsersIcon from 'pixelarticons/svg/users.svg';

// ─── Pixelarticons map ───────────────────────────────────────────────────────
const PA_ICONS: Record<string, React.FC<{ width?: number; height?: number; color?: string }>> = {
  bell: BellIcon,
  cake: CakeIcon,
  cart: CartIcon,
  check: CheckIcon,
  chevronL: ChevronLIcon,
  chevron: ChevronRIcon,
  close: CloseIcon,
  coffee: CoffeeIcon,
  edit: EditIcon,
  filter: FilterIcon,
  fish: FishIcon,
  gear: GearIcon,
  heart: HeartIcon,
  leaf: LeafIcon,
  menu: MenuIcon,
  mic: MicIcon,
  minus: MinusIcon,
  package: PackageIcon,
  plus: PlusIcon,
  search: SearchIcon,
  share: ShareIcon,
  sparkle: SparkleIcon,
  'spray-can': SprayCanIcon,
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
  milk: [[5,2,6,2],[5,4,1,2],[10,4,1,2],[4,6,8,8]],
  bread: [[3,5,10,2],[2,7,12,4],[3,11,10,2]],
  drag: [[4,4,2,2],[10,4,2,2],[4,8,2,2],[10,8,2,2],[4,12,2,2],[10,12,2,2]],
  snowflake: [[7,2,2,3],[7,11,2,3],[2,7,3,2],[11,7,3,2],[7,7,2,2],[4,4,2,2],[10,4,2,2],[4,10,2,2],[10,10,2,2]],
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
