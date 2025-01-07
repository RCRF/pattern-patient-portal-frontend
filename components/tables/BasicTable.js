import React from "react";

export default function BasicTable({ data, columns }) {
  const linkColumnIndex = columns.findIndex((column) => column.key === "link");

  const filteredColumns =
    linkColumnIndex >= 0
      ? columns.filter((column) => column.key !== "link")
      : columns;

  const renderCell = (item, columnKey, columnIndex) => {
    const cellValue = item[columnKey];

    if (columnIndex === 0 && linkColumnIndex >= 0) {
      const link = item[columns[linkColumnIndex].key];
      const displayText = cellValue;
      return (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600"
        >
          {displayText}
        </a>
      );
    }

    if (columnKey === "status") {
      return <div className={`capitalize `}>{cellValue}</div>;
    }

    // Function to check if the string is a valid date format
    const isValidDate = (dateString) => {
      const regEx = /^\d{4}-\d{2}-\d{2}$/;
      return dateString?.match(regEx) != null;
    };

    // Check if the cellValue is a date string
    if (isValidDate(cellValue)) {
      const date = new Date(cellValue);
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    } else if (typeof cellValue === "string" && columnKey === "link") {
      return (
        <a
          href={cellValue}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600"
        >
          View
        </a>
      );
    } else {
      return cellValue === null || cellValue === "" ? "N/A" : cellValue;
    }
  };

  return (
    <div className="w-full">
      <div className="max-h-[600px] overflow-auto w-full">
        <table className="border w-full">
          <thead>
            <tr>
              {columns?.map((column) => (
                <th
                  key={column.key}
                  className="py-3.5 px-3.5 text-left whitespace-nowrap text-md font-semibold text-gray-900 bg-slate-50"
                >
                  {column.header !== "Link" ? column.header : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {Array.isArray(data) &&
              data.map((item, index) => (
                <tr key={index}>
                  {columns.map((column, columnIndex) => (
                    <td
                      key={column.key}
                      className={`py-4 text-left text-sm text-gray-900 p-4 ${
                        columnIndex === 0 ? "w-1/3" : ""
                      } ${columnIndex === 3 ? "w-1/4" : ""}`}
                      style={columnIndex === 0 ? { width: "33.333333%" } : {}}
                    >
                      <div
                        className={`line-clamp-3 overflow-auto ${
                          columnIndex === 1 ? "capitalize" : ""
                        } `}
                      >
                        {renderCell(item, column.key)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
