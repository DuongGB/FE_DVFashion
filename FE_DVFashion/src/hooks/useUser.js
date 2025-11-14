import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userAPI } from "../services/userAPI";

export const useUser = () => {
  const queryClient = useQueryClient();

  // Get all users (admin only)
  const {
    data: users,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useQuery({
    queryKey: ["users", "all"],
    queryFn: async () => {
      try {
        const res = await userAPI.getAllUsers();
        // console.log("Users response:", res.data);
        // Process users data to match frontend structure
        const processedUsers = (res.data.data || res.data || []).map(
          (user) => ({
            ...user,
            // Map backend role format to frontend enum
            role:
              user.roles && user.roles.length > 0
                ? user.roles[0].replace("ROLE_", "") // Convert "ROLE_CUSTOMER" to "CUSTOMER"
                : "CUSTOMER",
            // Ensure active field exists (default to true if not provided)
            active: user.active !== undefined ? user.active : true,
            // Handle null dob
            dob: user.dob ? new Date(user.dob) : null,
            // Add missing fields with defaults
            userName: user.userName || user.email?.split("@")[0] || "",
            lastName: user.lastName || "",
            addresses: user.addresses || [],
            cart: user.cart || null,
            reviews: user.reviews || [],
            wishlist: user.wishlist || [],
            createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
            updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
          })
        );
        return processedUsers;
      } catch (error) {
        console.error("Error fetching users:", error);
        if (error.response?.status === 401) {
          throw new Error("Bạn cần đăng nhập để xem danh sách người dùng");
        }
        if (error.response?.status === 403) {
          throw new Error("Bạn không có quyền truy cập danh sách người dùng");
        }
        throw error;
      }
    },
    retry: (failureCount, error) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Get user by ID
  const useGetUserByIdQuery = (id) =>
    useQuery({
      queryKey: ["users", "detail", id],
      queryFn: async () => {
        try {
          const res = await userAPI.getUserById(id);
          console.log("User detail response:", res.data);
          const user = res.data.data || res.data;

          // Process single user data
          return {
            ...user,
            role:
              user.roles && user.roles.length > 0
                ? user.roles[0].replace("ROLE_", "")
                : "CUSTOMER",
            active: user.active !== undefined ? user.active : true,
            dob: user.dob ? new Date(user.dob) : null,
            userName: user.userName || user.email?.split("@")[0] || "",
            lastName: user.lastName || "",
            addresses: user.addresses || [],
            cart: user.cart || null,
            reviews: user.reviews || [],
            wishlist: user.wishlist || [],
            createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
            updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
          };
        } catch (error) {
          console.error("Error fetching user detail:", error);
          if (error.response?.status === 401) {
            throw new Error("Bạn cần đăng nhập để xem thông tin người dùng");
          }
          if (error.response?.status === 403) {
            throw new Error("Bạn không có quyền truy cập thông tin này");
          }
          throw error;
        }
      },
      enabled: !!id,
      retry: (failureCount, error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          return false;
        }
        return failureCount < 2;
      },
    });

  // Create user mutation (for customer creation)
  const createUserMutation = useMutation({
    mutationFn: (userData) => {
      // console.log("Creating user with data:", userData);
      // Transform frontend data to backend format
      const backendData = {
        ...userData,
        // Convert frontend role enum to backend format
        roles: userData.role ? [`ROLE_${userData.role}`] : ["ROLE_CUSTOMER"],
        // Handle dob conversion
        dob: userData.dob ? userData.dob.toISOString().split("T")[0] : null,
      };
      return userAPI.createStaff(backendData);
    },
    onSuccess: (data) => {
      console.log("User created successfully:", data);
      queryClient.invalidateQueries(["users", "all"]);
    },
    onError: (error) => {
      console.error("Error creating user:", error);
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, userData }) => {
      // console.log(`Updating user ${userId} with data:`, userData);
      // Transform frontend data to backend format
      const backendData = {
        ...userData,
        roles: userData.role ? [`ROLE_${userData.role}`] : undefined,
        // Handle both string and Date object for dob
        dob: userData.dob
          ? typeof userData.dob === "string"
            ? userData.dob // Already in YYYY-MM-DD format from date input
            : userData.dob.toISOString().split("T")[0] // Convert Date to YYYY-MM-DD
          : null,
      };
      return userAPI.updateUser(userId, backendData);
    },
    onSuccess: (data, variables) => {
      // console.log("User updated successfully:", data);
      queryClient.invalidateQueries(["users", "all"]);
      queryClient.invalidateQueries(["users", "detail", variables.userId]);
    },
    onError: (error) => {
      console.error("Error updating user:", error);
    },
  });

  // Verify staff mutation
  const verifyStaffMutation = useMutation({
    mutationFn: (verifyData) => {
      // console.log("Verifying staff with data:", verifyData);
      return userAPI.verifyStaff(verifyData);
    },
    onSuccess: (data) => {
      // console.log("Staff verified successfully:", data);
      queryClient.invalidateQueries(["users", "all"]);
    },
    onError: (error) => {
      console.error("Error verifying staff:", error);
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (passwordData) => {
      // console.log("Changing password");
      return userAPI.changePassword(passwordData);
    },
    onSuccess: (data) => {
      // console.log("Password changed successfully:", data);
    },
    onError: (error) => {
      console.error("Error changing password:", error);
    },
  });

  return {
    // Fetched data
    users,
    isLoadingUsers,
    usersError,
    useGetUserByIdQuery,

    // User creation (for customers)
    createUser: createUserMutation.mutateAsync,
    isCreatingUser: createUserMutation.isPending,
    createUserError: createUserMutation.error,

    // User update
    updateUser: updateUserMutation.mutateAsync,
    isUpdatingUser: updateUserMutation.isPending,
    updateUserError: updateUserMutation.error,

    // Staff verification
    verifyStaff: verifyStaffMutation.mutateAsync,
    isVerifyingStaff: verifyStaffMutation.isPending,
    verifyStaffError: verifyStaffMutation.error,

    // Password change
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    changePasswordError: changePasswordMutation.error,
  };
};
