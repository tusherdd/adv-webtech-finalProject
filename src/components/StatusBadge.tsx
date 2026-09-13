"use client";

type StatusBadgeProps = {
  status: string;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = (status || "").toUpperCase();

  let colorClasses = "bg-gray-100 text-gray-800 border-gray-300";

  switch (normalized) {
    case "ACTIVE":
    case "PAID":
      colorClasses = "bg-green-100 text-green-800 border-green-300";
      break;
    case "CHECKED_IN":
      colorClasses = "bg-blue-100 text-blue-800 border-blue-300";
      break;
    case "COMPLETED":
      colorClasses = "bg-purple-100 text-purple-800 border-purple-300";
      break;
    case "CANCELLED":
    case "FAILED":
      colorClasses = "bg-red-100 text-red-800 border-red-300";
      break;
    case "PENDING":
      colorClasses = "bg-yellow-100 text-yellow-800 border-yellow-300";
      break;
    default:
      colorClasses = "bg-gray-100 text-gray-800 border-gray-300";
  }

  return (
    <span
      className={`inline-block px-2.5 py-1 text-xs font-semibold rounded border ${colorClasses}`}
    >
      {normalized}
    </span>
  );
}
