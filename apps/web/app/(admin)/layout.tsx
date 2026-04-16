export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-900 text-white hidden md:block">
        <div className="p-6">
          <span className="text-xl font-bold">Admin Portal</span>
          <p className="text-gray-400 text-xs mt-1">My Digital Card</p>
        </div>
        {/* Admin nav — coming soon */}
      </aside>
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  );
}
