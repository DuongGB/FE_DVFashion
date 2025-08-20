import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";

export default function LoginForm({ onSuccess }) {
  const { login, isLoginLoading, loginError } = useAuth();
  const [formData, setFormData] = useState({
    username: "admin@gmail.com",
    password: "admin",
  });

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login(formData);
      if (result?.data?.success && onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 p-6 bg-white shadow-lg rounded-xl w-80"
    >
      <h2 className="text-xl font-semibold text-center">Login</h2>
      <div>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.username}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
      </div>
      <div>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
      </div>
      {loginError && <div className="error">{loginError.message}</div>}
      <button type="submit" disabled={isLoginLoading}>
        {isLoginLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
