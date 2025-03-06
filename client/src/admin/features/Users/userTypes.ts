interface User {
    role: "customer" | "admin";
    user_id: number;
    username: string;
    defaultPassword: boolean;
}

export type AccessLevel = "full" | "limited" | "view only";
export interface AdminUser extends User {
    admin_id: number;
    accessLevel: AccessLevel;
}

export interface CustomerUser extends User {
    customer_id: number;
    email: string;
    totalSpent: number;
    totalOrders: number;
}

export interface CustomerFilters {
    page: string;
    usersPerPage: string;
    searchString?: string;
}

export interface AdminFilters {
    page: string;
    accessLevel: Array<"full" | "limited" | "view only">;
    usersPerPage: string;
    searchString?: string;
}

export interface UserState {
    admins: AdminUser[];
    customers: CustomerUser[];
    numberOfAdmins: number;
    numberOfCustomers: number;
    adminFilters: AdminFilters | null;
    customerFilters: CustomerFilters | null;
    error: string | null;
    loading: boolean;
}

export interface FetchCustomersResponse {
    customers: CustomerUser[];
    numberOfCustomers: number;
    customerFilters: CustomerFilters;
}

export interface FetchAdminsResponse {
    admins: AdminUser[];
    numberOfAdmins: number;
    adminFilters: AdminFilters;
}
