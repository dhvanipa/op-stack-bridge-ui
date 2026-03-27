"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TransactionItem } from "./TransactionItem";
import { useMergedTransactions } from "@/hooks/useMergedTransactions";
import { useAccount } from "wagmi";
import { Inbox, Loader2 } from "lucide-react";

interface ActivityPanelProps {
  open: boolean;
  onClose: () => void;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-white/30">
      <Inbox className="h-10 w-10 mb-3 stroke-[1.5]" />
      <p className="text-sm font-medium">No transactions yet</p>
      <p className="text-xs text-white/20 mt-1">Bridge activity will appear here</p>
    </div>
  );
}

export function ActivityPanel({ open, onClose }: ActivityPanelProps) {
  const { address } = useAccount();
  const { transactions, isLoadingExplorer } = useMergedTransactions(address);

  const deposits = transactions.filter((tx) => tx.direction === "deposit");
  const withdrawals = transactions.filter(
    (tx) => tx.direction === "withdrawal"
  );

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="bg-card/95 backdrop-blur-2xl border-white/[0.08] text-white w-full sm:max-w-[400px] p-0">
        <SheetHeader className="px-5 pt-5 pb-3">
          <SheetTitle className="text-white flex items-center gap-2 text-base font-semibold tracking-tight">
            Activity
            {isLoadingExplorer && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-white/30" />
            )}
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="all" className="flex-1">
          <TabsList
            className="w-[calc(100%-2.5rem)] mx-5 bg-white/[0.04] border border-white/[0.06]"
          >
            <TabsTrigger value="all" className="flex-1 text-[13px] font-medium tracking-wide">
              All
            </TabsTrigger>
            <TabsTrigger value="deposits" className="flex-1 text-[13px] font-medium tracking-wide">
              Deposits
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex-1 text-[13px] font-medium tracking-wide">
              Withdrawals
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-8rem)] px-5 pt-3">
            <TabsContent value="all" className="mt-0 space-y-2">
              {transactions.length === 0 ? (
                <EmptyState />
              ) : (
                transactions.map((tx) => (
                  <TransactionItem key={tx.id} tx={tx} />
                ))
              )}
            </TabsContent>

            <TabsContent value="deposits" className="mt-0 space-y-2">
              {deposits.length === 0 ? (
                <EmptyState />
              ) : (
                deposits.map((tx) => (
                  <TransactionItem key={tx.id} tx={tx} />
                ))
              )}
            </TabsContent>

            <TabsContent value="withdrawals" className="mt-0 space-y-2">
              {withdrawals.length === 0 ? (
                <EmptyState />
              ) : (
                withdrawals.map((tx) => (
                  <TransactionItem key={tx.id} tx={tx} />
                ))
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
