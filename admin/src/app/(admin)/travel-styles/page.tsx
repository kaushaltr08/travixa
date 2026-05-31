import AdminResourcePage from "@/components/dashboard/AdminResourcePage";

export default function TravelStylesPage() {
  return (
    <AdminResourcePage
      title="Travel Styles"
      description="Manage mood and interest categories used across discovery and planning."
      endpoint="/api/travel-styles"
      metricLabel="Total Styles"
      columns={[
        { key: "name", label: "Name" },
        { key: "icon", label: "Icon" },
        { key: "description", label: "Description" },
      ]}
    />
  );
}
