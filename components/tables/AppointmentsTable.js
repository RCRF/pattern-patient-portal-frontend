import React, { useEffect, useState } from "react";
import { formatDate } from "@/utils/helpers";
import { usePatientContext } from "@/components/context/PatientContext";

export default function AppointmentsTable({
  appointments,
  fullDetails = false,
}) {
  const [filterBy, setFilterBy] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResults, setFilteredResults] = useState(appointments);
  const { patientId } = usePatientContext();

  useEffect(() => {
    let results = appointments;

    if (filterBy === "dateDec") {
      results = results.sort(
        (a, b) => new Date(a.startDate) - new Date(b.startDate)
      );
    } else if (filterBy === "dateAsc") {
      results = results.sort(
        (a, b) => new Date(b.startDate) - new Date(a.startDate)
      );
    } else if (filterBy === "category") {
      results = results.sort((a, b) => {
        const categoryA = a?.category || "";
        const categoryB = b?.category || "";

        return categoryA.localeCompare(categoryB);
      });
    } else if (filterBy === "institution") {
      results = results.sort((a, b) => {
        const institutionNameA = a?.institution?.[0]?.institutionName || "";
        const institutionNameB = b?.institution?.[0]?.institutionName || "";

        return institutionNameA.localeCompare(institutionNameB);
      });
    }

    if (searchTerm) {
      results = results.filter((result) => {
        const lowerCaseSearchTerm = searchTerm?.toLowerCase();

        const isTitleMatch = result?.title
          ?.toLowerCase()
          .includes(lowerCaseSearchTerm);

        const isCategoryMatch = result?.cateogry
          ?.toLowerCase()
          .includes(lowerCaseSearchTerm);

        const isInstitutionMatch = result.institutions?.some((institutionObj) =>
          institutionObj?.institutionName
            .toLowerCase()
            .includes(lowerCaseSearchTerm)
        );

        const isProviderMatch = result.providers?.some((provider) =>
          provider?.lastName.toLowerCase().includes(lowerCaseSearchTerm)
        );

        return (
          isTitleMatch ||
          isCategoryMatch ||
          isInstitutionMatch ||
          isProviderMatch
        );
      });
    }

    setFilteredResults(results);
  }, [appointments, filterBy, searchTerm]);

  const filterOptions = [
    { value: "dateAsc", label: "Date Ascending" },
    { value: "dateDec", label: "Date Decending" },
    { value: "category", label: "Category" },
    { value: "institution", label: "Institution" },
  ];
  return (
    <div className="">
      {fullDetails && (
        <div className="flex gap-4 mb-6 w-full justify-end opacity-80">
          <div>
            <label
              htmlFor="filter"
              className="block text-sm font-medium text-gray-700"
            >
              Filter by
            </label>
            <select
              id="filter"
              className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 font-normal bg-slate-300 text-slate-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
            >
              {filterOptions.map((option) => (
                <option value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 "
            >
              Search
            </label>
            <input
              type="text"
              autoComplete="off"
              id="search"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none bg-slate-300 text-slate-600 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="">
        <table className="border w-full">
          <thead className="bg-slate-100 w-full text-base">
            <tr>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-md font-semibold text-gray-900 "
              >
                Date
              </th>

              <th
                scope="col"
                className="py-3.5 px3.5 pl-4 pr-3 w-60 text-left text-md font-semibold text-gray-900 hidden sm:table-cell"
              >
                Title
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-md font-semibold text-gray-900 hidden sm:table-cell"
              >
                Category
              </th>

              <th
                scope="col"
                className="px-3 py-3.5 text-left text-md font-semibold text-gray-900"
              >
                Provider
              </th>

              <th
                scope="col"
                className="px-3 py-3.5 text-left text-md font-semibold text-gray-900 hidden sm:table-cell"
              >
                Institution
              </th>

              <th
                scope="col"
                className="px-3 py-3.5 text-left text-md font-semibold text-gray-900"
              >
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {Array.isArray(appointments) &&
              filteredResults.map((appointment, index) => (
                <tr key={index}>
                  <td className="py-4 pl-3 pr-4 text-left text-xs font-medium sm:pr-0 text-gray-600">
                    {formatDate(appointment.startDate)}
                  </td>

                  <td className="lg:pl-4 max-w-0 py-4 pl-1 text-sm font-medium text-blue-800 sm:w-auto sm:max-w-none sm:pl-0 hidden sm:table-cell">
                    <a
                      href={`/appointments/${appointment?.id}`}
                      target="_blank"
                      className="text-blue-800 cursor-pointer"
                    >
                      <div className="h-full self-center">
                        {appointment.title}
                      </div>
                    </a>
                  </td>

                  <td
                    className={`lg:pl-4 max-w-0 py-4 pl-1 text-sm ${appointment.category === "pcp"
                      ? "uppercase"
                      : "capitalize"
                      } text-gray-600 sm:w-auto sm:table-cell hidden sm:max-w-none sm:pl-0`}
                  >
                    <>{appointment.category}</>
                  </td>

                  <td className="py-4 pl-3 pr-4 text-left text-xs font-medium sm:pr-0 text-gray-600 sm:table-cell">
                    {appointment.providers?.map((provider) => (
                      <a
                        href={`/providers/${provider.id}?patientId=${patientId}`}
                        target="_blank"
                        className="text-blue-800 cursor-pointer"
                      >
                        {provider.firstName} {provider.lastName}{" "}
                        {provider.designation}
                      </a>
                    ))}
                  </td>

                  <td className="py-4 pl-3 pr-4 text-left text-xs font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                    {appointment.institutions?.map((institution) => (
                      <a
                        href={`/institutions/${institution.institutionId}`}
                        target="_blank"
                        className="text-blue-800 cursor-pointer"
                      >
                        {institution.institutionName}
                      </a>
                    ))}
                  </td>

                  <td className="py-4 pl-3 pr-4 w-1/3 text-left text-xs font-medium sm:pr-0 text-gray-600">
                    <div className="line-clamp-3 overflow-auto">
                      {appointment.notes}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
