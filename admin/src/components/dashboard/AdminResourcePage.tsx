"use client";

import React, { useEffect, useState } from "react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type AdminResourcePageProps = {
  title: string;
  description: string;
  endpoint: string;
  columns: { key: string; label: string }[];
  metricLabel: string;
  allowDelete?: boolean;
};

const getValue = (item: Record<string, unknown>, key: string) => {
  const value = key.split(".").reduce<unknown>((current, part) => {
    if (current && typeof current === "object") {
      return (current as Record<string, unknown>)[part];
    }

    return undefined;
  }, item);

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value);
  }

  return value ? String(value) : "-";
};

export default function AdminResourcePage({
  title,
  description,
  endpoint,
  columns,
  metricLabel,
  allowDelete = false,
}: AdminResourcePageProps) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRows = async () => {
      try {
        setIsLoading(true);
        setMessage("");
        const response = await fetch(`${apiBaseUrl}${endpoint}`, { cache: "no-store" });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || `Unable to load ${title.toLowerCase()}.`);
        }

        setRows(result.data || []);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load admin data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadRows();
  }, [endpoint, title]);

  const deleteRow = async (row: Record<string, unknown>) => {
    const id = String(row._id || "");

    if (!id) {
      setMessage("Unable to delete this record because it is missing an id.");
      return;
    }

    const confirmed = window.confirm(`Delete this ${title.toLowerCase().replace(/s$/, "")}?`);
    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      const token = localStorage.getItem("travixaAdminToken");
      const response = await fetch(`${apiBaseUrl}${endpoint}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete record.");
      }

      setRows((currentRows) => currentRows.filter((item) => item._id !== row._id));
      setMessage("Record deleted successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete record.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-5 py-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">{metricLabel}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
            {isLoading ? "--" : rows.length}
          </p>
        </div>
      </div>

      {message && (
        <p className="rounded-lg bg-error-50 px-4 py-3 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-500">
          {message}
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-white/[0.02] dark:text-gray-400">
                {columns.map((column) => (
                  <th key={column.key} className="px-5 py-3 font-medium">
                    {column.label}
                  </th>
                ))}
                {allowDelete && <th className="px-5 py-3 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={String(row._id || index)} className="border-b border-gray-100 text-gray-700 last:border-0 dark:border-gray-800 dark:text-gray-300">
                  {columns.map((column) => (
                    <td key={column.key} className="px-5 py-4">
                      {getValue(row, column.key)}
                    </td>
                  ))}
                  {allowDelete && (
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => deleteRow(row)}
                        className="rounded-lg bg-error-50 px-3 py-2 text-xs font-semibold text-error-600 transition hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {!isLoading && rows.length === 0 && (
                <tr>
                  <td className="px-5 py-8 text-center text-gray-500" colSpan={columns.length + (allowDelete ? 1 : 0)}>
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
