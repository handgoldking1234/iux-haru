import { KidProvider } from '@/components/Kid';
import { BottomNav, SheetHost } from '@/components/Shell';
import SearchHost from '@/components/Search';
import Toasts from '@/components/Toast';

/* 셸: (공부일 때 .top) + .frames + .gnav — 각 페이지가 .top/.frames를 그린다 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <KidProvider>
      {children}
      <BottomNav />
      <SheetHost />
      <Toasts />
      <SearchHost />
    </KidProvider>
  );
}
