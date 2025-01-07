import React, { useState, useEffect, use } from "react";
import {
  formatDate,
  linkColumns,
  sortByListOrderAndDate,
  filterItemsToDuringPlusIntervalBeforeAndAfter,
  sortByDateAndPanel,
} from "@/utils/helpers";
import Relations from "./Relations";

import { ArrowUpRightIcon } from "@heroicons/react/20/solid";
import {
  useAttachmentsByIntervention,
  useImaging,
  useInterventions,
  useMedications,
  useLabsByDateRange,
  useAppointmentById,
  useAppointments,
} from "@/hooks/api";
import { useAttachmentsByDiagnosis } from "@/hooks/api";
import { usePatientContext } from "@/components/context/PatientContext";

const InterventionDetails = ({ selectedItem, displayFull, version }) => {
  const [filteredImaging, setFilteredImaging] = useState([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [filteredInterventions, setFilteredIntervenions] = useState([]);
  const [highlightedAttachments, setHighlightedAttachments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filteredLabs, setFilteredLabs] = useState([]);
  const { patientId } = usePatientContext();


  const { data: imaging } = useImaging(
    { id: patientId }
  );

  const { data: medications } = useMedications(
    { id: patientId }
  );

  const { data: interventions } = useInterventions(
    { id: patientId }
  );

  const { data: attachments } = useAttachmentsByIntervention(
    { id: selectedItem?.id },
    {
      enabled: !!selectedItem?.id,
    }
  );

  const { data: appointments } = useAppointments(
    { id: patientId }
  );

  const { data: labs } = useLabsByDateRange(
    {
      id: patientId,
      startDate: selectedItem?.startDate,
      daysBefore: 14,
      daysAfter: 21,
    }
  );

  useEffect(() => {
    if (imaging && selectedItem) {
      const filteredScans = filterItemsToDuringPlusIntervalBeforeAndAfter(
        imaging,
        selectedItem,
        90,
        15
      ).sort((a, b) => {
        const startDate = new Date(a.startDate);
        const endDate = new Date(b.startDate);
        return endDate - startDate;
      });

      setFilteredImaging(filteredScans);
    }
  }, [imaging, selectedItem]);

  useEffect(() => {
    if (labs) {
      const sortedLabs = sortByDateAndPanel(labs);
      setFilteredLabs(sortedLabs);
    }
  }, [labs]);

  useEffect(() => {
    if (medications && selectedItem) {
      const filteredMedications = medications.filter((intervention) => {
        const interventionDate = new Date(intervention.startDate);
        const selectedItemStartDate = new Date(selectedItem.startDate);
        const selectedItemEndDate = new Date(selectedItem.endDate);

        const fourteenDaysBeforeMedicationStarts = new Date(
          selectedItemStartDate
        );
        fourteenDaysBeforeMedicationStarts.setDate(
          selectedItemStartDate.getDate() - 14
        );

        const OneDaysAfterMedicationEnds = new Date(selectedItemEndDate);
        OneDaysAfterMedicationEnds.setDate(selectedItemEndDate.getDate() + 14);

        return (
          interventionDate >= fourteenDaysBeforeMedicationStarts &&
          interventionDate <= OneDaysAfterMedicationEnds
        );
      });

      setFilteredMedications(filteredMedications);
    }
  }, [medications, selectedItem]);

  useEffect(() => {
    if (interventions && selectedItem) {
      const filteredInterventions = interventions.filter((intervention) => {
        const interventionDate = new Date(intervention.startDate);
        const interventionStartDate = new Date(selectedItem.startDate);
        const interventionEndDate = new Date(selectedItem.endDate);

        const oneWeekBeforeInterventionStarts = new Date(interventionStartDate);
        oneWeekBeforeInterventionStarts.setDate(
          interventionStartDate.getDate() - 7
        );

        const fourteenDaysAfterMedicationEnds = new Date(interventionEndDate);
        fourteenDaysAfterMedicationEnds.setDate(
          interventionEndDate.getDate() + 14
        );

        return (
          interventionDate >= oneWeekBeforeInterventionStarts &&
          interventionDate <= fourteenDaysAfterMedicationEnds &&
          intervention.id !== selectedItem.id
        );
      });

      setFilteredIntervenions(filteredInterventions);
    }
  }, [interventions, selectedItem]);

  useEffect(() => {
    if (attachments && selectedItem) {
      //Attachments
      const filteredAttachements = attachments?.sort(
        (a, b) => new Date(b.startDate) - new Date(a.startDate)
      );

      const highlightedAttachments = filteredAttachements?.filter(
        (attachment) => attachment.highlight
      );
      setHighlightedAttachments(highlightedAttachments);
    }
  }, [attachments, selectedItem]);

  useEffect(() => {
    if (appointments && selectedItem) {
      const filtAppts = filterItemsToDuringPlusIntervalBeforeAndAfter(
        appointments,
        selectedItem,
        60,
        40
      ).sort((a, b) => {
        const startDate = new Date(a.startDate);
        const endDate = new Date(b.startDate);
        return endDate - startDate;
      });

      setFilteredAppointments(filtAppts);
    }
  }, [appointments, selectedItem]);
  return (
    <div className="pl-3 pr-3 bg-white pb-10 pt-5">
      <div
        className={`${version === "full" ? "" : "bg-slate-100"} p-2 pl-4 pr-4 `}
      >
        <div
          className={`border-1 rounded-sm w-full h-8 text-left p-2 mb-2 ${selectedItem?.category === "surgical"
            ? "bg-red-200"
            : selectedItem?.category === "interventional"
              ? "bg-blue-100"
              : "bg-gray-100"
            } border-slate-400 text-gray-800 text-xs text-left uppercase`}
        >
          <span className="font-medium text-medium text-gray-800 ">
            {selectedItem?.category}
          </span>
        </div>
        <div className="flex md:flex-row flex-col justify-between">
          <div className="flex flex-row">
            <h2 className="font-bold text-2xl mb-2">{selectedItem?.title}</h2>

            {selectedItem?.diagnosis && (
              <div className="ml-3 mb-2 self-center">
                <span className="bg-blue-500 p-1 rounded text-white line-clamp-1 mr-10">
                  {selectedItem?.diagnosis[0]?.title}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-row  mt-3 text-right">
            <p className="text-righ">
              <span className="font-medium">Date:</span>{" "}
              {formatDate(selectedItem?.startDate)}
            </p>
          </div>
        </div>
        {selectedItem?.category === "labs" && (
          <div>
            <span className="font-medium">Panels:</span>{" "}
            <span className="font-regular">
              <div className="text-xs mb-2 grid grid-cols-5 gap-1 text-gray-600">
                {selectedItem?.panels?.map((panel, index) => (
                  <a href={`${selectedItem?.link}`} target="_blank">
                    <div
                      className={`rounded rounded-sm text-center p-1 capitalize bg-gray-100`}
                      key={index}
                    >
                      <div className="flex flex-row w-full">
                        <div className="justify-center w-full">{panel} </div>
                        <div className="justify-en">
                          <ArrowUpRightIcon className="w-4 h-4 text-gray-80" />
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </span>
          </div>
        )}

        <div>
          <span className="font-medium">Organs:</span>
          <span className="p-1 font-regular text-sm capitalize">

            {selectedItem?.metadata.organs?.map((organ, index) => (
              <span className="capitalize" key={index}>
                {index !== selectedItem.metadata.organs.length - 1
                  ? organ + ", "
                  : organ}
              </span>
            ))}
          </span>
        </div>
        <div>
          <span className="font-medium">Reason:</span>
          <span className="p-1 font-regular text-sm">
            {selectedItem?.reason}
          </span>
        </div>
        <div>
          <span className="font-medium">Provider(s):</span>{" "}
          {selectedItem?.providers?.map((provider, index) => {
            return index !== selectedItem?.providers.length - 1 ? (
              <a href={`/providers/${provider.id}`} target="_blank" className="text-blue-800">
                {provider.firstName + " " + provider.lastName + ", "}{" "}
              </a>
            ) : (
              <a href={`/providers/${provider.id}`} target="_blank" className="text-blue-800">
                {provider.firstName + " " + provider.lastName}
              </a>
            );
          })}
        </div>
        <div className="overflow-x-auto">
          <span className="font-medium">Institution:</span>{" "}
          {selectedItem?.institutions.length > 0 ? (
            <a
              className="text-blue-800 text-sm"
              href={`/institutions/${selectedItem?.institutions[0].id}`}
              target="_blank"
            >
              {selectedItem?.institutions[0]?.title}
            </a>
          ) : (
            "N/A"
          )}

        </div>
        <div className="w-full">
          <span className="font-medium">Result:</span>{" "}
          <span className="text-sm">{selectedItem?.result ?? "N/A"}</span>
        </div>
        {/* <div className="w-full">
          <span className="font-medium">Procedure/Surgical Report:</span>{" "}
          <span className="text-blue-800 bg-blue-100 p-1 text-xs rounded cursor-pointer">
            View
          </span>
        </div> */}
        {(selectedItem?.category === "surgical" ||
          selectedItem?.category === "biopsy") && (
            <div>
              {/* <div>
              <span className="font-medium">Pathology Report:</span>{" "}
              <span className="text-blue-800 text-xs bg-blue-100 p-1 rounded cursor-pointer">
                View
              </span>
            </div> */}
              <div>
                <span className="font-medium">Days Admitted:</span>{" "}
                <span className="text-sm">
                  {selectedItem?.daysAdmitted ?? "N/A"}
                </span>
              </div>
            </div>
          )}
        {/* <span className="font-medium">Attachments:</span>{" "} */}
        <span className="lowercase text-center">
          <div className="text-xs mb-2 grid grid-cols-5 gap-1 text-gray-600">
            {selectedItem?.attachments?.map((attachment, index) =>
              attachment.link ? (
                <a
                  href={`${attachment?.link}`}
                  target="_blank"
                  className={`${version === "full"
                    ? "bg-slate-600 text-white mt-2"
                    : "bg-slate-600 text-white mt-2"
                    } rounded rounded-sm text-center p-1 capitalize `}
                  key={index}
                >
                  <div className="flex flex-row w-full">
                    <div className="justify-center w-full">
                      {attachment?.title}
                    </div>
                    <div className="justify-en">
                      <ArrowUpRightIcon className="w-4 h-4 text-gray-80" />
                    </div>
                  </div>
                </a>
              ) : (
                <div
                  className={`${version === "full"
                    ? "bg-slate-600 text-white mt-2"
                    : "bg-slate-600 text-white mt-2"
                    } rounded rounded-sm text-center p-1 capitalize `}
                  key={index}
                >
                  <div className="flex flex-row w-full">
                    <div className="justify-center w-full">
                      {attachment?.title}
                    </div>
                    <div className="justify-en">
                      <ArrowUpRightIcon className="w-4 h-4 text-gray-80" />
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </span>
        {version !== "full" ? (
          <hr className="mt-2 mb-2 rounded bg-slate-500" />
        ) : null}
        {highlightedAttachments && (
          <div className="grid xl:grid-cols-5 sm:grid-cols-2 grid-cols-1 gap-2 mt-2 mb-2">
            {highlightedAttachments.slice(0, 4).map((attachment) => (
              <div className="group">
                {" "}
                <a href={attachment.link} target="_blank" className="block">
                  <div className="text-white flex flex-row text-xs h-8 p-2 border rounded-sm self-center bg-slate-600 w-full text-center">
                    <div className="justify-center w-full line-clamp-1 overflow-auto">
                      {attachment.title}
                      <div
                        className="absolute hidden mb-2 group-hover:block ml-2 text-left w-80 
                         text-slate-800 text-sm p-3 flex-wrap bg-white border border-slate-100 rounded-sm shadow-md
                        whitespace-normal z-50
                        overflow-hidden"
                      >
                        <div className="flex flex-row gap-1">
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
                    <div className="justify-end text-white">
                      <ArrowUpRightIcon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        )}
        <div>
          <span className="font-medium">Notes:</span>{" "}
          <span className="text-sm line-clamp-6 overflow-auto">
            {selectedItem?.notes ?? "N/A"}
          </span>
        </div>
      </div>

      <div
        className={`flex flex-row ${version === "full" ? "ml-4 mr-4" : null}`}
      >
        <Relations
          interventions={filteredInterventions}
          imaging={filteredImaging}
          medications={filteredMedications}
          appointments={filteredAppointments}
          attachments={attachments}
          links={selectedItem?.links}
          linkColumns={linkColumns}
          labs={filteredLabs}
        />
      </div>
    </div>
  );
};

export default InterventionDetails;
