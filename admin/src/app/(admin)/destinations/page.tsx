import AdminResourcePage from "@/components/dashboard/AdminResourcePage";

export default function DestinationsPage() {
  return (
    <AdminResourcePage
      title="Destinations"
      description="Manage Travixa destination intelligence, seasonality, and budget ranges."
      endpoint="/api/destinations"
      metricLabel="Total Destinations"
      columns={[
        { key: "name", label: "Name" },
        { key: "state", label: "State" },
        { key: "bestTimeToVisit", label: "Best Time" },
        { key: "budgetRange", label: "Budget Range" },
      ]}
    />
  );
}
