// app/403/page.tsx
export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-semibold text-red-500">403 - Không có quyền truy cập</h1>
    </div>
  );
}