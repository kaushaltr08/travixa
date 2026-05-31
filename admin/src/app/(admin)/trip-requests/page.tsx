import AdminResourcePage from "@/components/dashboard/AdminResourcePage";

export default function TripRequestsPage() {
  return (
    <AdminResourcePage
      title="Trip Requests"
      description="Track user planning requests generated from Travixa Studio."
      endpoint="/api/trip-requests"
      metricLabel="Total Requests"
      allowDelete
      columns={[
        { key: "userId.name", label: "Traveler" },
        { key: "destination.name", label: "Destination" },
        { key: "budget", label: "Budget" },
        { key: "days", label: "Days" },
        { key: "travelStyle", label: "Style" },
        { key: "season", label: "Season" },
      ]}
    />
  );
}
