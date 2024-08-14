interface User {
    role: "customer" | "admin";
    user_id: number;
    username: string;
    defaultPassword: boolean;
}

export interface AdminUser extends User {
    admin_id: number;
    accessLevel: "full" | "limited" | "view only";
}

export interface CustomerUser extends User {
    customer_id: number;
    email: string;
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
