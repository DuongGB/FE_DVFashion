import { useAuth } from "../hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  if (!isAuthenticated) {
    return <p className="text-center text-red-500">Bạn chưa đăng nhập!</p>;
  }

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Xin chào {user?.username} 🎉</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.phone}</p>
    </div>
  );
}
