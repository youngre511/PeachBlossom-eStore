interface AdminUser {}

interface CustomerUser {}

interface UserState {
    admins: AdminUser[];
    customers: CustomerUser[];
    numberOfAdmins: number | null;
    numberOfCustomers: number | null;
}
