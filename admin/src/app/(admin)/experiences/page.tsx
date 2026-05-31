import AdminResourcePage from "@/components/dashboard/AdminResourcePage";

export default function ExperiencesPage() {
  return (
    <AdminResourcePage
      title="Experiences"
      description="Review local experiences connected to destinations."
      endpoint="/api/experiences"
      metricLabel="Total Experiences"
      columns={[
        { key: "title", label: "Title" },
        { key: "destinationId.name", label: "Destination" },
        { key: "category", label: "Category" },
        { key: "description", label: "Description" },
      ]}
    />
  );
}
