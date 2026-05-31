import AdminResourcePage from "@/components/dashboard/AdminResourcePage";

export default function UsersPage() {
  return (
    <AdminResourcePage
      title="Users"
      description="Monitor Travixa user and admin accounts."
      endpoint="/api/users"
      metricLabel="Total Users"
      columns={[
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "role", label: "Role" },
        { key: "isActive", label: "Active" },
      ]}
    />
  );
}
