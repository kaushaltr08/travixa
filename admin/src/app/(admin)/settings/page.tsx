export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Configure API connections, authentication, and admin preferences.
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Environment</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-white/[0.04]">
            <p className="text-sm text-gray-500 dark:text-gray-400">API URL</p>
            <p className="mt-2 font-medium text-gray-900 dark:text-white">
              {process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-white/[0.04]">
            <p className="text-sm text-gray-500 dark:text-gray-400">Admin Mode</p>
            <p className="mt-2 font-medium text-gray-900 dark:text-white">Role-based JWT protected</p>
          </div>
        </div>
      </div>
    </div>
  );
}
