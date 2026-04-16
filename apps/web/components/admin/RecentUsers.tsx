import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface RecentUser {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  _count: { cards: number };
}

export function RecentUsers({ users }: { users: RecentUser[] }) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-semibold">Recent Users</CardTitle>
        <Button variant="ghost" size="sm" asChild className="text-blue-600 hover:text-blue-700">
          <Link href="/admin/users">
            View all <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {users.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-gray-400">No users yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {users.map((user) => {
              const initials = user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <div key={user.id} className="flex items-center gap-3 px-6 py-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-gray-100 text-gray-600 text-xs font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-400">
                      {user._count.cards} card{user._count.cards !== 1 ? "s" : ""}
                    </span>
                    <Badge
                      variant={user.isActive ? "default" : "secondary"}
                      className={
                        user.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-100 text-xs"
                          : "bg-red-100 text-red-600 hover:bg-red-100 text-xs"
                      }
                    >
                      {user.isActive ? "Active" : "Suspended"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
