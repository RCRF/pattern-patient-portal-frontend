import React, { useEffect, useState } from "react";
import {
  formatDate,
  formatShortDate,
  sortByListOrderAndDate,
} from "@/utils/helpers";

export default function FamilyTable({ familyHistory }) {
  const [filteredFamilyHistory, setFilteredFamilyHistory] = useState([]);
  useEffect(() => {
    if (!familyHistory) return;
    setFilteredFamilyHistory(sortByListOrderAndDate(familyHistory));
  }, [familyHistory]);
  return (
    <div className="">
      <div className="max-h-[600px] overflow-auto">
        <table className="border w-full">
          <thead>
            <tr className="bg-slate-50 w-full">
              <th
                scope="col"
                className="py-3.5 px-3.5 pl-4 text-left text-md font-semibold text-gray-900"
              >
                Family Relation
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 w-1/12 text-left text-md font-semibold text-gray-900"
              >
                Category
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-md font-semibold text-gray-900 hidden sm:table-cell"
              >
                Diagnosis
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-md w-1/12 text-center font-semibold text-gray-900 hidden sm:table-cell"
              >
                Age at Diagnosis
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-md w-1/12 text-center font-semibold text-gray-900 hidden sm:table-cell"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left w-1/3 text-md font-semibold text-gray-900 table-cell"
              >
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {Array.isArray(filteredFamilyHistory) &&
              filteredFamilyHistory.map((familyMember, index) => (
                <tr key={index}>
                  <td className="py-4 pl-4 pr-3 text-sm w-1/6 font-medium text-gray-900 capitalize">
                    {familyMember.familyMemberRelation}
                  </td>
                  <td className="py-4 pl-3 pr-4 text-xs font-medium capitalize text-gray-600">
                    <div>{familyMember?.category}</div>
                  </td>
                  <td className="py-4 pl-3 pr-4 text-xs font-medium w-1/6 capitalize text-gray-600 hidden sm:table-cell">
                    <div>{familyMember?.familyMemberHistory}</div>
                  </td>
                  <td className="py-4 pl-3 pr-4 text-center text-xs font-medium text-gray-600 hidden sm:table-cell">
                    <div>{familyMember?.familyAgeAtDiagnosis}</div>
                  </td>
                  <td className="py-4 pl-3 pr-4 text-center text-xs font-medium text-gray-600 hidden sm:table-cell">
                    <div>{formatDate(familyMember?.startDate)}</div>
                  </td>
                  <td className="py-4 pl-3 pr-4 text-left text-xs font-medium text-gray-600 line-clamp-3 w-full">
                    <div className="line-clamp-3 overflow-auto">
                      {familyMember?.familyMemberNotes}
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
