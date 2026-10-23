/* 프로토타입 LI(name) — Lucide 아이콘을 class="ic"로 (크기·선은 프로토타입 CSS가 정함) */
import {
  ArrowLeft, Bell, BellRing, BookOpen, Check, ChevronDown, ChevronRight, CircleDot, Clock, Coins, DoorOpen, Flame,
  Flower2, Gift, History, House, Leaf, ListChecks, Lock, LogIn, LogOut, Menu, Moon, Pencil, Plus, Search,
  ShieldCheck, Shirt, Sprout, Star, Swords, Ticket, Timer, Trash2, TreeDeciduous, Trees, Trophy, UserRound, Users,
  UserX, X, Zap, type LucideIcon,
} from 'lucide-react';

const MAP: Record<string, LucideIcon> = {
  'arrow-left': ArrowLeft, bell: Bell, 'bell-ring': BellRing, 'book-open': BookOpen, check: Check,
  'chevron-down': ChevronDown, 'chevron-right': ChevronRight, 'circle-dot': CircleDot, clock: Clock, coins: Coins,
  'door-open': DoorOpen, flame: Flame, 'flower-2': Flower2, gift: Gift, history: History, house: House, leaf: Leaf,
  'list-checks': ListChecks, lock: Lock, 'log-in': LogIn, 'log-out': LogOut, menu: Menu, moon: Moon, pencil: Pencil,
  plus: Plus, search: Search, 'shield-check': ShieldCheck, shirt: Shirt, sprout: Sprout, star: Star, swords: Swords,
  ticket: Ticket, timer: Timer, 'trash-2': Trash2, 'tree-deciduous': TreeDeciduous, trees: Trees, trophy: Trophy,
  'user-round': UserRound, users: Users, 'user-x': UserX, x: X, zap: Zap,
};

export default function Ic({ n, c, plain }: { n: string; c?: string; plain?: boolean }) {
  const I = MAP[n];
  if (!I) return null;
  return <I className={plain ? c : `ic${c ? ' ' + c : ''}`} aria-hidden />;
}

/** 프로토타입이 문자열로 만든 SVG(아바타·도장)를 그대로 넣는다 */
export const Svg = ({ html }: { html: string }) => (
  <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />
);
