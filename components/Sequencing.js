import React, { useEffect } from "react";
import { useSequencing } from "@/hooks/api";
import { formatDate } from "@/utils/helpers";
import { usePatientContext } from "@/components/context/PatientContext";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import EmptyState from "@/components/common/EmptyState";
import { BeakerIcon } from "@heroicons/react/20/solid";

const Sequencing = ({ isAdmin = false, version }) => {
  const { patientId } = usePatientContext();
  const { data: sequencing } = useSequencing({ id: patientId });

  return (
    <div className="w-full">
      <div className="items-bottom flex mt-10 pb-4 w-full justify-between">
        <h1 className="text-center md:text-left pl-0 text-3xl font-semibold self-center">
          Genomic Profiling  </h1>
        {isAdmin && version === "admin" && (
          <a href="/attachments/create" target="_blank" className="rounded text-xs ml-2 p-2 text-white bg-blue-600 shadow-sm h-8 self-center">
            Add
          </a>
        )}

      </div>
      {sequencing ?
        sequencing.map((sequencing, index) => (
          <div
            className={`m-2 flex flex-row justify-between items-center border bg-white shadow-lg p-6`}
          >
            <div>
              <h2 className="text-2xl font-semibold">{sequencing?.title}</h2>
              <p>Date: {formatDate(sequencing?.startDate)}</p>
              <p className="line-clamp-3 overflow-auto w-5/6">
                Notes: {sequencing?.notes}
              </p>
            </div>
            <a
              href={sequencing?.link}
              target="_blank"
              className="whitespace-nowrap h-10 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View Report
            </a>
          </div>
        )) : (
          <button className="mt-2 w-full" href="/attachments/create" target="_blank">
            <EmptyState message="Add Sequencing" Icon={BeakerIcon} width="w-1/3" />
          </button>
        )}
    </div>
  );
};

export default Sequencing;
