import React, { useState, useEffect } from "react";
import {
  filterItemsToDuringPlusIntervalBeforeAndAfter,
  formatDate,
  linkColumns,
} from "@/utils/helpers";
import Relations from "./Relations";
import { calculateDaysBetweenDates } from "@/utils/helpers";
import {
  useImaging,
  useInterventions,
  useFetchArticles,
  useRelatedMedicationsByPatientMedicationId,
  useAppointments,
  useLabsByDateRange,
} from "@/hooks/api";
import { usePatientContext } from "@/components/context/PatientContext";

const MedicationDetails = ({ selectedItem, displayFull, version }) => {
  const [filteredScans, setFilteredScans] = useState([]);
  const [filteredInterventions, setFilteredIntervenions] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [daysOnTreatment, setDaysOnTreatment] = useState(0);
  const [filteredLabs, setFilteredLabs] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [pubMedUrl, setPubMedUrl] = useState();
  const { patientId } = usePatientContext();


  const { data: imaging } = useImaging(
    { id: patientId }
  );

  const { data: interventions } = useInterventions(
    { id: patientId }
  );

  const { data: relatedMedications } =
    useRelatedMedicationsByPatientMedicationId(
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
      daysAfter: daysOnTreatment + 14,
    },
    {
      enabled:
        selectedItem?.startDate !== undefined &&
        daysOnTreatment > 14,
    }
  );

  useEffect(() => {
    if (selectedItem && selectedItem.endDate) {
      const daysOnTreatment = calculateDaysBetweenDates(
        selectedItem.startDate,
        selectedItem.endDate
      );
      if (daysOnTreatment > 14) {
        setDaysOnTreatment(daysOnTreatment);
      }
    }
  }, [selectedItem]);

  useEffect(() => {
    if (daysOnTreatment > 14 && labs) {
      setFilteredLabs(labs);
    }
  }, [labs]);


  useEffect(() => {
    if (imaging && selectedItem) {
      const filteredScans = imaging.filter((scan) => {
        const scanDate = new Date(scan.startDate);
        const medicationStartDate = new Date(selectedItem.startDate);
        let medicationEndDate = selectedItem.endDate
          ? new Date(selectedItem.endDate)
          : null;

        const threeDaysBeforeMedicationStarts = new Date(medicationStartDate);
        threeDaysBeforeMedicationStarts.setDate(
          medicationStartDate.getDate() - 5
        );

        let fourteenDaysAfterMedicationEnds;
        if (medicationEndDate) {
          fourteenDaysAfterMedicationEnds = new Date(medicationEndDate);
          fourteenDaysAfterMedicationEnds.setDate(
            medicationEndDate.getDate() + 14
          );
        }

        console.log(scanDate, threeDaysBeforeMedicationStarts, fourteenDaysAfterMedicationEnds);
        console.log(medicationEndDate);

        return medicationEndDate
          ? scanDate >= threeDaysBeforeMedicationStarts &&
          scanDate <= fourteenDaysAfterMedicationEnds
          : scanDate >= threeDaysBeforeMedicationStarts;
      });

      setFilteredScans(filteredScans);
    }
  }, [imaging, selectedItem]);

  useEffect(() => {
    if (interventions && selectedItem) {
      const filteredInterventions = interventions.filter((scan) => {
        const scanDate = new Date(scan.startDate);
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
          scanDate >= oneWeekBeforeInterventionStarts &&
          scanDate <= fourteenDaysAfterMedicationEnds
        );
      });

      setFilteredIntervenions(filteredInterventions);
    }
  }, [interventions, selectedItem]);

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

  const queryOptions = [
    {
      field: "Title",
      value: selectedItem?.title,
      tags: [],
    },
  ];

  const { data } = useFetchArticles(queryOptions);

  useEffect(() => {
    if (data) {
      setFilteredArticles(data.articles);
      setPubMedUrl(data.queryUrl);
    }
  }, [data]);

  return (
    <div className="pl-3 pr-3 bg-white pb-10 pt-5">
      <div
        className={`${version === "full" ? "" : "bg-slate-100"} p-2 pl-4 pr-4`}
      >
        <div className="flex sm:flex-row flex-col justify-between">
          <div className="flex sm:flex-row flex-col z-1">
            {version !== "full" ? (
              <a href={`/medications/${selectedItem.id}`} target="_blank">
                <h2 className="font-bold text-3xl capitalize">{selectedItem?.title}</h2>
              </a>
            ) : (
              <h2 className="font-bold text-3xl capitalize">{selectedItem?.title}</h2>
            )}

            {selectedItem?.diagnosis.length > 0 && (
              <div className="ml-3 mt-3">
                <a
                  className="bg-blue-500 p-1 rounded text-white"
                  href={`/diagnoses/${selectedItem?.diagnosis[0].id}`}
                  target="_blank"
                >
                  {selectedItem?.diagnosis[0]?.title}
                </a>
              </div>
            )}
          </div>
          <div className="flex sm:flex-row flex-col mt-3">
            <p className="mr-5">
              <span className="font-medium">Start Date:</span>{" "}
              {formatDate(selectedItem?.startDate)}
            </p>
            <p>
              <span className="font-medium">End Date:</span>{" "}
              {formatDate(selectedItem?.endDate)}
            </p>
            <p className="mt-2 mb-2 sm:mt-0 sm:mb-0">
              <span
                className={`${selectedItem?.status === "active"
                  ? "bg-green-200"
                  : "bg-red-200"
                  } capitalize p-2 rounded sm:ml-5 font-bold`}
              >
                {selectedItem?.status}
              </span>
            </p>
          </div>
        </div>
        <div>
          <span className="font-medium">Dosage:</span>{" "}
          <span className="font-regular">
            {selectedItem?.dosage ? selectedItem?.dosage + " " + (selectedItem?.units ? selectedItem?.units : "") : "N/A"}


            <span className="text-xs text-center">{selectedItem.frequency ? ` ${selectedItem.frequency}x` : ""}</span>
            <span className="text-xs text-center">{selectedItem.interval ? "/" + selectedItem.interval : ""}</span>

          </span>
        </div>
        <div>
          <span className="font-medium">Reason:</span>{" "}
          <span className="p-1 font-regular">{selectedItem?.reason}</span>
        </div>
        <div>
          <span className="font-medium">Prescriber:</span>{" "}
          <a
            className="text-blue-800"
            href={`/providers/${selectedItem?.prescribingProvider?.length > 0
              ? selectedItem?.prescribingProvider[0]?.id
              : ""
              }`}
            target="_blank"
          >
            {selectedItem?.prescribingProvider?.length > 0
              ? selectedItem?.prescribingProvider[0]?.firstName
              : ""}{" "}
            {selectedItem?.prescribingProvider?.length > 0
              ? selectedItem?.prescribingProvider[0]?.lastName
              : ""}
          </a>
        </div>
        {displayFull && (
          <div>
            <div>
              <span className="font-medium">Side Effects:</span>{" "}
              <span className="lowercase text-center">
                <div className="text-xs mb-2 grid sm:grid-cols-5 grid-cols-2 gap-1 text-gray-600">
                  {selectedItem?.sideEffects
                    ?.sort((a, b) => {
                      // if either value is null, sort it last
                      if (a.listOrder === null) return 1;
                      if (b.listOrder === null) return -1;

                      return a.listOrder - b.listOrder;
                    })
                    .map((sideEffect, index) => (
                      <div
                        className={`${version === "full"
                          ? "bg-slate-400 mt-2 text-white"
                          : "bg-slate-400 text-white"
                          } rounded-sm text-center p-1 capitalize relative group`}
                        key={index}
                      >
                        {sideEffect.title}
                        <div
                          className={`absolute hidden mb-2 group-hover:block ml-2 text-left w-80 rounded
                            ${version !== "full"
                              ? "bg-white border border-slate-100 shadow-md"
                              : "bg-white border border-slate-100 rounded-sm shadow-md"
                            } text-slate-600 text-sm p-3 rounded-sm flex-wrap
                            whitespace-normal z-50
                            overflow-hidden`}
                        >
                          <div className="flex flex-row gap-1">
                            <div>
                              Started: {formatDate(sideEffect.startDate)}
                            </div>
                            <div>Stopped:{formatDate(sideEffect.endDate)}</div>
                          </div>
                          <div>
                            <strong>Severity:</strong> {sideEffect.severity}
                          </div>
                          {sideEffect?.notes && (
                            <div className="line-clamp-3 overflow-auto normal-case">
                              <strong> Notes:</strong> {sideEffect.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </span>
            </div>
            <div className="overflow-x-auto">
              <span className="font-medium">Notes:</span>{" "}
              <span className="text-sm">{selectedItem?.notes}</span>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-row ml-4 mr-4">
        <Relations
          attachments={selectedItem?.attachments}
          interventions={filteredInterventions}
          imaging={filteredScans}
          medications={relatedMedications}
          appointments={filteredAppointments}
          links={selectedItem?.links}
          linkColumns={linkColumns}
          articles={filteredArticles}
          labs={filteredLabs}
        />
      </div>
    </div>
  );
};

export default MedicationDetails;
