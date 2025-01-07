import React, { use, useEffect, useState } from "react";
import {
  formatDate,
  linkColumns,
  sortByDateDesc,
  sortByListOrderAndDate,
} from "@/utils/helpers";
import Relations from "./Relations";
import {
  useImagingByDiagnosis,
  useDiagnosisProviders,
  useInterventionsByDiagnosis,
  useMedicationsByDiagnosis,
  useAttachmentsByDiagnosis,
  useAppointments,
  fetchRelatedMedicationsByPatientMedicationId,
} from "@/hooks/api";
import Link from "next/link";
import { ArrowDownTrayIcon, ArrowUpRightIcon } from "@heroicons/react/20/solid";
import { usePatientContext } from "@/components/context/PatientContext";

const DiagnosisDetails = ({ selectedItem, displayFull }) => {
  const [allMedications, setAllMedications] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filteredImaging, setFilteredImaging] = useState([]);
  const [uniqueInstitutions, setUniqueInstitutions] = useState([]);
  const { patientId } = usePatientContext();

  const selectedId = selectedItem?.id;

  const { data: appointments } = useAppointments(
    { id: patientId }
  );

  const { data: imaging } = useImagingByDiagnosis(
    { id: selectedId },
    {
      enabled: !!selectedId,
    }
  );

  const { data: providers } = useDiagnosisProviders({ id: selectedId }, {
    enabled: !!selectedId,
  });

  const { data: interventions } = useInterventionsByDiagnosis(
    { id: selectedId },
    {
      enabled: !!selectedItem,
    }
  );

  const { data: medications } = useMedicationsByDiagnosis(
    { id: selectedId },
    {
      enabled: !!selectedItem,
    }
  );

  const { data: attachments } = useAttachmentsByDiagnosis(
    { id: selectedId },
    {
      enabled: !!selectedItem,
    }
  );

  const filteredAttachments = attachments?.sort(
    (a, b) => new Date(b.startDate) - new Date(a.startDate)
  );

  const highlightedAttachments = filteredAttachments?.filter(
    (attachment) => attachment.highlight
  );

  useEffect(() => {
    if (appointments) {
      const filtAppts = appointments.filter((appt) =>
        appt?.diagnoses?.some((diagnosis) => diagnosis.id === diagnosis?.id)
      );

      setFilteredAppointments(sortByDateDesc(filtAppts));
    }
  }, [appointments]);

  useEffect(() => {
    if (imaging) {
      setFilteredImaging(sortByListOrderAndDate(imaging));
    }
  }, [imaging]);

  const diseaseStatusLookup = {
    stable: "Stable",
    ned: "No Evidence of Disease",
    progression: "Progression",
    controlled: "Controlled",
    scheduled_intervention: "Scheduled Intervention",
  };

  useEffect(() => {
    if (selectedItem) {
      const uniqueInst = selectedItem?.institutions?.filter(
        (inst, index, self) =>
          index ===
          self.findIndex((t) => t.institutionId === inst.institutionId)
      );
      setUniqueInstitutions(uniqueInst);
    }
  }, [selectedItem]);


  return (
    <div className="pl-3 pr-3">
      <div className="bg-slate-100 p-2 pl-4 pr-4">
        <div className="flex md:flex-row flex-col justify-between">
          <div className="flex flex-row">
            <a href={`/diagnoses/${selectedId}`} target="_blank">
              <h2 className="font-bold text-3xl">{selectedItem?.title}</h2>
            </a>
            {selectedItem?.diagnosis && (
              <div className="ml-3 mt-3">
                <span className="bg-blue-500 p-1 rounded text-white">
                  {selectedItem?.diagnosis?.title}
                </span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 mt-3">
            <p className="mr-5 col-span-1">
              <span className="font-medium">Start Date:</span>{" "}
              {formatDate(selectedItem?.startDate)}
            </p>
            <p className="col-span-1">
              <span className="font-medium">End Date:</span>{" "}
              {selectedItem?.endDate ? formatDate(selectedItem?.endDate) : "N/A"}
            </p>
            <p className="col-span-1 mt-2 mb-2 lg:mt-0 lg:mb-0 md:text-right text-left">
              <span
                className={`${selectedItem?.status === "active"
                  ? "bg-green-200"
                  : "bg-red-200"
                  } capitalize p-2 pl-4 pr-4 rounded  font-bold w-32`}
              >
                {selectedItem?.status}
              </span>
            </p>
          </div>
        </div>

        {selectedItem?.category === "cancer" && (
          <div className="mb-2 grid grid-cols-1 lg:grid-cols-5 gap-1 text-gray-600 mt-2">
            <div className="rounded rounded-sm text-center p-1 capitalize bg-slate-400 text-white">
              <span className="font-medium">Stage:</span>
              <span className="p-1">{selectedItem?.stage}</span>
            </div>
            <div className="rounded rounded-sm text-center p-1 capitalize bg-slate-400 text-white">
              <span className="font-medium">Grade:</span>
              <span className="p-1">{selectedItem?.grade}</span>
            </div>
            <div className="rounded rounded-sm text-center p-1 capitalize bg-slate-400 text-white">
              <span className="font-medium">Size:</span>
              <span className="p-1 lowercase">
                {selectedItem?.primarySize} {selectedItem?.sizeUnits}{" "}
                <span className="text-xs italics">
                  *current {selectedItem?.currentSize}
                  {selectedItem?.sizeUnits}
                </span>
              </span>
            </div>
          </div>
        )}
        <div>
          <span className="font-medium">Disease Status:</span>{" "}
          <span className="font-regular capitalize text-sm">
            {selectedItem?.diseaseStatus
              ? diseaseStatusLookup[selectedItem?.diseaseStatus]
              : "N/A"}
          </span>
        </div>
        <div>
          <span className="font-medium text-sm">Category:</span>{" "}
          <span className="font-regular capitalize text-sm">
            {selectedItem?.category ? selectedItem?.category : "N/A"}
          </span>
        </div>
        <div>
          <span className="font-medium text-sm">Type:</span>{" "}
          <span className="p-1 font-regular text-sm capitalize">{selectedItem?.type}</span>
        </div>
        {selectedItem?.subtype && (
          <div>
            <span className="font-medium text-sm">Subtype:</span>
            <span className="p-1 text-sm">{selectedItem?.subtype}</span>
          </div>
        )}
        <div className="cursor-pointer">
          <span className="font-medium text-sm">Institutions:</span>{" "}
          <span className="text-blue-800 text-sm">
            {uniqueInstitutions?.map((institution, index, array) => (
              <React.Fragment key={institution}>
                <Link
                  href={`/institutions/${institution.institutionId}`}
                  className="hover:underline"
                  target="_blank"
                >
                  {institution.institutionName}
                </Link>
                {index < array.length - 1 ? ", " : ""}
              </React.Fragment>
            ))}
          </span>
        </div>
        <div>
          <span className="font-medium text-sm">Providers</span>{" "}
          <div className="text-xs mb-1 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-2 text-gray-600">
            {providers
              ?.sort((a, b) => {
                return a.listOrder !== null && b.listOrder !== null
                  ? a.listOrder - b.listOrder
                  : a.listOrder !== null
                    ? -1
                    : 1;
              })
              .map((provider, index) => (
                <Link href={`/providers/${provider?.id}`} target="_blank">
                  <div
                    className={`rounded-sm text-center pb-2 capitalize bg-blue-600 opacity-60 flex flex-col cursor-pointer`}
                    key={provider.id}
                  >
                    <div className="text-slate-200 font-semibold w-full mt-1 text-center line-clamp-1">
                      {provider.firstName} {provider.lastName}{" "}
                      {provider.designation}
                      <span className="text-base">
                        {provider.primaryContact ? " *" : null}
                      </span>
                    </div>
                    <div className="text-slate-200 line-clamp-1 mt-[-6px] overflow-auto">
                      {provider.role}
                    </div>
                  </div>
                </Link>
              ))}
          </div>
          {providers?.length > 0 && (
            <div className="text-xs italic text-gray-400">
              * Indicates primary contact
            </div>
          )}
        </div>

        <div>
          <div className="overflow-x-auto">
            <span className="font-medium text-sm">Notes:</span>{" "}
            <span className="text-sm">{selectedItem?.notes}</span>
          </div>
        </div>

        {highlightedAttachments && (
          <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-2 mt-4">
            {highlightedAttachments.slice(0, 6).map((attachment) => (
              <div className="group">
                {" "}
                {/* Added group class here */}
                <a href={attachment.link} target="_blank" className="block">
                  <div className="text-white bg-slate-600 flex flex-row text-xs h-8 p-2 border rounded-sm self-center border-slate-600 w-full text-center">
                    <div className="justify-center w-full line-clamp-2 overflow-auto">
                      {attachment.title}
                      <div
                        className="absolute hidden mb-2 group-hover:block ml-2 text-left w-80 
                         text-slate-800 text-sm p-3 flex-wrap bg-white border border-slate-100 rounded-sm shadow-md
                        whitespace-normal z-50
                        overflow-hidden"
                      >
                        <div className="flex flex-row gap-1 col-span-1">
                          <div>Date: {formatDate(attachment.startDate)}</div>
                        </div>

                        {attachment.institutions && (
                          <div className="line-clamp-3 overflow-auto normal-case">
                            <strong> Institution:</strong>{" "}
                            {attachment.institutions
                              .map((institution) => institution.institutionName)
                              .join(", ")}
                          </div>
                        )}

                        {attachment.notes && (
                          <div className="line-clamp-3 overflow-auto normal-case">
                            <strong> Notes:</strong> {attachment.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="justify-end">
                      <ArrowUpRightIcon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-row">
        <Relations
          imaging={filteredImaging}
          medications={medications}
          appointments={filteredAppointments}
          interventions={interventions}
          attachments={filteredAttachments}
          links={selectedItem?.links}
          linkColumns={linkColumns}
        />
      </div>
    </div>
  );
};

export default DiagnosisDetails;
