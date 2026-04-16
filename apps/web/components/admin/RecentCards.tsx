import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye } from "lucide-react";

interface RecentCard {
  id: string;
  displayName: string;
  slug: string;
  isPublished: boolean;
  createdAt: Date;
  user: { name: string; email: string };
  analytics: { totalViews: number } | null;
}

export function RecentCards({ cards }: { cards: RecentCard[] }) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-semibold">Recent Cards</CardTitle>
        <Button variant="ghost" size="sm" asChild className="text-blue-600 hover:text-blue-700">
          <Link href="/admin/cards">
            View all <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {cards.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-gray-400">No cards yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {cards.map((card) => (
              <div key={card.id} className="flex items-center gap-3 px-6 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 text-xs font-bold">
                  {card.displayName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {card.displayName}
                  </p>
                  <p className="text-xs text-gray-400 truncate">by {card.user.name}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Eye className="h-3 w-3" />
                    {card.analytics?.totalViews ?? 0}
                  </span>
                  <Badge
                    className={
                      card.isPublished
                        ? "bg-green-100 text-green-700 hover:bg-green-100 text-xs"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-100 text-xs"
                    }
                  >
                    {card.isPublished ? "Live" : "Draft"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
