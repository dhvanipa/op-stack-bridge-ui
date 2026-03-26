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
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { useAccount } from "wagmi";
import { Inbox } from "lucide-react";

interface ActivityPanelProps {
  open: boolean;
  onClose: () => void;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Inbox className="h-10 w-10 mb-3" />
      <p className="text-sm">No transactions yet</p>
    </div>
  );
}

export function ActivityPanel({ open, onClose }: ActivityPanelProps) {
  const { address } = useAccount();
  const { transactions } = useTransactionHistory(address);

  const deposits = transactions.filter((tx) => tx.direction === "deposit");
  const withdrawals = transactions.filter(
    (tx) => tx.direction === "withdrawal"
  );

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="bg-card border-white/10 text-white w-full sm:max-w-[400px] p-0">
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle className="text-white">Activity</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="all" className="flex-1">
          <TabsList className="w-full bg-white/5 mx-4" style={{ width: "calc(100% - 2rem)" }}>
            <TabsTrigger value="all" className="flex-1">
              All
            </TabsTrigger>
            <TabsTrigger value="deposits" className="flex-1">
              Deposits
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex-1">
              Withdrawals
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-8rem)] px-4 pt-3">
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
