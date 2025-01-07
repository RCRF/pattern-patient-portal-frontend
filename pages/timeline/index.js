import React, { useState, useEffect, Fragment, use } from "react";

import { Footer } from "@/components/HomePage/Footer";

import Modal from "@/components/Modal";
import MedicationDetails from "@/components/timeline/MedicationDetails";
import {
  formatShortDate,
  sortByDateDesc,
  sortByListOrderAndDate,
} from "@/utils/helpers";
import AppointmentDetails from "@/components/timeline/AppointmentDetails";
import InterventionDetails from "@/components/timeline/InterventionDetails";
import DiagnosisDetails from "@/components/timeline/DiagnosisDetails";
import ImagingDetails from "@/components/timeline/ImagingDetails";
import TagDetails from "@/components/timeline/TagDetails";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import {
  useProviders,
  useInstitutions,
  useMedications,
  useInterventions,
  useImaging,
  useDiagnoses,
  useTimeline,
  useAppointments,
  useLabs,
} from "@/hooks/api";
import { sortByListOrderAndStatus } from "@/utils/helpers";
import { useSession } from "@clerk/nextjs";
import { usePatientContext } from "@/components/context/PatientContext";

const Timeline = ({ isEditing }) => {
  const session = useSession();
  const { patientId } = usePatientContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState([]);
  const [selectedItem, setSelectedItem] = useState([]);
  const [displayYear, setDisplayYear] = useState("");
  const [combinedData, setCombinedData] = useState([]);
  const [isInterventionsOpen, setIsInterventionsOpen] = useState(false);
  const [isImagingOpen, setIsImagingOpen] = useState(false);
  const [isMedicationsOpen, setIsMedicationsOpen] = useState(false);
  const [isLifestyleOpen, setIsLifeStyleOpen] = useState(false);
  const [isAppointmentsOpen, setIsAppointmentsOpen] = useState(false);
  const [isDiagnosisOpen, setIsDiagnosisOpen] = useState(false);
  const [isSymptomsOpen, setIsSymptomsOpen] = useState(false);
  const [selectedDiagnoses, setSelectedDiagnoses] = useState([]);

  const [sortedProviders, setSortedProviders] = useState([]);
  const [sortedInstitutions, setSortedInstitutions] = useState([]);
  const [sortedMedications, setSortedMedications] = useState([]);
  const [sortedInterventions, setSortedInterventions] = useState([]);
  const [sortedImaging, setSortedImaging] = useState([]);
  const [sortedDiagnoses, setSortedDiagnoses] = useState([]);
  const [sortedLifeStyle, setSortedLifestyle] = useState([]);
  const [sortedSymtoms, setSortedSymptoms] = useState([]);
  const [sortedAppointments, setSortedAppointments] = useState([]);

  const [headers, setHeaders] = useState([]);

  const { data: providersData } = useProviders({ id: patientId });
  const { data: institutionsData } = useInstitutions({
    id: patientId,
  });
  const { data: medications } = useMedications({ id: patientId });
  const { data: interventions } = useInterventions({
    id: patientId,
  });
  const { data: imaging } = useImaging({ id: patientId });
  const { data: diagnoses } = useDiagnoses({ id: patientId });
  const { data: timelineEvents } = useTimeline({ id: patientId });
  const { data: appointments } = useAppointments({
    id: patientId,
  });
  const { data: labs } = useLabs({
    id: patientId,
    session: session,
  });

  useEffect(() => {
    if (!selectedItem) return;
    // Get the date range
    const startDates = selectedItem
      ?.filter(Boolean)
      .map((item) => new Date(item.startDate));

    const latestStartDate = selectedItem
      ?.filter((item) => Boolean(item.startDate))
      .reduce((latest, item) => {
        const currentDate = new Date(item.startDate);
        return currentDate > latest ? currentDate : latest;
      }, new Date(0));

    const endDates = selectedItem?.filter(Boolean).map((item) => {
      const endDate = new Date(item.endDate);
      return endDate > latestStartDate ? endDate : latestStartDate;
    });

    const minDate = new Date(Math.min(...startDates));
    const adjustedMinDate = new Date(
      minDate.getFullYear(),
      minDate.getMonth() - 1
    );
    const maxDate = new Date(Math.max(...endDates));

    const monthsFromYears =
      (maxDate.getFullYear() - minDate.getFullYear()) * 12;
    const monthAdjustments = maxDate.getMonth() - minDate.getMonth();
    const timelineLength = monthsFromYears + monthAdjustments + 3;
    const headers = Array.from({ length: timelineLength }, (_, index) => {
      const year =
        adjustedMinDate.getFullYear() +
        Math.floor((adjustedMinDate.getMonth() + index) / 12);
      const month = (adjustedMinDate.getMonth() + index) % 12;

      return new Date(year, month);
    });

    setHeaders(headers);
  }, [selectedItem]);

  useEffect(() => {
    if (!providersData) return;
    setSortedProviders(sortByListOrderAndStatus(providersData));
  }, [providersData]);

  useEffect(() => {
    if (!institutionsData) return;
    setSortedInstitutions(sortByListOrderAndStatus(institutionsData));
  }, [institutionsData]);

  useEffect(() => {
    if (!appointments) return;

    const allAppointments = appointments
      .filter((item) => item.id)
      .map((item) => {
        return {
          ...item,
          timelineCategory: "appointment",
        };
      });

    const filteredByDiagnosis = allAppointments.filter((item) => {
      if (selectedDiagnoses.length === 0) return true;

      return selectedDiagnoses.some((selectedDiagnosis) =>
        item.diagnoses.some(
          (diagnosis) => diagnosis.id === selectedDiagnosis.id
        )
      );
    });
    setCombinedData((prevData) => [...prevData, ...filteredByDiagnosis]);
    setSortedAppointments(sortByDateDesc(filteredByDiagnosis));
  }, [appointments, selectedDiagnoses]);

  useEffect(() => {
    if (!interventions) return;

    const allInterventions = interventions
      .filter((item) => item.id)
      .map((item) => {
        return {
          ...item,
          timelineCategory: "intervention",
        };
      });

    const filteredInterventions = allInterventions.filter((item) => {
      if (selectedDiagnoses.length === 0) return true;
      return selectedDiagnoses.some((d) => d.id === item.diagnosisId);
    });
    setCombinedData((prevData) => [...prevData, ...filteredInterventions]);
    setSortedInterventions(sortByListOrderAndStatus(filteredInterventions));
  }, [interventions, selectedDiagnoses]);

  useEffect(() => {
    if (!diagnoses) return;

    const allDiagnosis = diagnoses
      .filter((item) => item.id)
      .map((item) => {
        return {
          ...item,
          timelineCategory: "diagnosis",
        };
      });
    setCombinedData((prevData) => [...prevData, ...allDiagnosis]);
    setSortedDiagnoses(
      allDiagnosis.sort((a, b) => {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);
        return dateB - dateA;
      })
    );
  }, [diagnoses]);

  useEffect(() => {
    if (!imaging) return;

    const allImaging = imaging
      .filter((item) => item.id)
      .map((item) => {
        return {
          ...item,
          timelineCategory: "imaging",
        };
      });

    const filteredImaging = allImaging.filter((item) => {
      if (selectedDiagnoses.length === 0) return true;
      return selectedDiagnoses.some((d) => d.id === item.diagnosisId);
    });

    setCombinedData((prevData) => [...prevData, ...filteredImaging]);
    setSortedImaging(
      filteredImaging.sort((a, b) => {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);
        return dateB - dateA;
      })
    );
  }, [imaging, selectedDiagnoses]);

  useEffect(() => {
    if (!medications) return;

    const allMedications = medications
      .filter((item) => item.id)
      .map((item) => {
        return {
          ...item,
          timelineCategory: "medication",
        };
      });

    const filteredByDiagnosis = allMedications.filter((item) => {
      if (selectedDiagnoses.length === 0) return true;

      return selectedDiagnoses.some((selectedDiagnosis) =>
        item.diagnosis.some(
          (diagnosis) => diagnosis.id === selectedDiagnosis.id
        )
      );
    });

    setCombinedData((prevData) => [...prevData, ...filteredByDiagnosis]);
    setSortedMedications(sortByDateDesc(filteredByDiagnosis));
  }, [medications, selectedDiagnoses]);

  useEffect(() => {
    // const allAppointments = appointments
    //   .filter((item) => item.id)
    //   .map((item) => {
    //     return {
    //       ...item,
    //       timelineCategory: "appointment",
    //     };
    //   });
    if (!timelineEvents) return;
    const allLifestyle = timelineEvents
      ?.filter((item) => item.category === "diet")
      .map((item) => {
        return {
          ...item,
          timelineCategory: "diet",
        };
      });

    setSortedLifestyle(sortByDateDesc(allLifestyle));

    const allSymptoms = timelineEvents.map((item) => {
      return {
        ...item,
        timelineCategory: "symptom",
      };
    });
    setSortedSymptoms(sortByDateDesc(allSymptoms));
    setCombinedData([...allLifestyle, ...allSymptoms]);
  }, [timelineEvents]);

  const getColorClass = (itemType, selectedItem) => {
    const currentDate = new Date();
    const startDate = new Date(selectedItem.startDate);

    let baseColors = {
      medication: `${startDate < currentDate
        ? "bg-green-200"
        : "border border-2 border-green-400"
        }`,
      intervention: "bg-red-400",
      appointment: `${startDate < currentDate
        ? "bg-blue-400 text-white"
        : "border border-2 border-blue-400 "
        }`,
      diagnosis: `${startDate < currentDate
        ? "bg-indigo-500 text-white"
        : "border border-2 border-indigo-500"
        }`,
      imaging: `${startDate < currentDate
        ? "bg-purple-400 text-white"
        : "border border-2 border-purple-400"
        }`,
      diet: `${startDate < currentDate
        ? "bg-yellow-200 text-slate-600"
        : "border border-2 border-yellow-200"
        }`,
      symptom: "bg-pink-200",
    };

    return baseColors[itemType] || "";
  };

  const openTaskModal = (item) => {
    setSelectedTask(item);
    setModalOpen(true);
  };

  useEffect(() => {
    // Simulate delay for fetching data
    const delay = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(delay);
  }, []);

  if (isLoading) {
    // Render loading screen
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        <svg
          class="animate-spin -ml-1 mr-3 h-10 w-10 "
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Loading...
      </div>
    );
  }

  const toggleSelection = (item) => {
    const isAlreadySelected = selectedItem.some(
      (selected) => selected.id === item.id
    );
    setSelectedItem((prevSelected) => {
      if (isAlreadySelected) {
        // Remove the item from the array
        return prevSelected.filter((selected) => selected.id !== item.id);
      } else {
        // Add the item to the array
        return [...prevSelected, item];
      }
    });

    if (sortedDiagnoses.some((d) => d.id === item.id)) {
      setSelectedDiagnoses((prevSelected) => {
        if (isAlreadySelected) {
          // Remove the diagnosis from the array
          return prevSelected.filter((selected) => selected.id !== item.id);
        } else {
          // Add the diagnosis to the array
          return [...prevSelected, item];
        }
      });
    }
  };

  const toggleAllImaging = (isSelected) => {
    if (isSelected) {
      // Select all imaging IDs
      const newSelectedItems = new Set([...selectedItem, ...sortedImaging]);
      setSelectedItem(Array.from(newSelectedItems));
    } else {
      const updatedSelectedItems = selectedItem.filter(
        (item) => !sortedImaging.some((scan) => scan.id === item.id)
      );
      setSelectedItem(updatedSelectedItems);
    }
  };

  const toggleAllInterventions = (isSelected) => {
    if (isSelected) {
      const newSelectedItems = new Set([
        ...selectedItem,
        ...sortedInterventions,
      ]);
      setSelectedItem(Array.from(newSelectedItems));
    } else {
      const updatedSelectedItems = selectedItem.filter(
        (item) =>
          !interventions.some((intervention) => intervention.id === item.id)
      );
      setSelectedItem(updatedSelectedItems);
    }
  };

  const toggleAllDiagnosis = (isSelected) => {
    if (isSelected) {
      const newSelectedItems = new Set([...selectedItem, ...sortedDiagnoses]);
      setSelectedItem(Array.from(newSelectedItems));
    } else {
      const updatedSelectedItems = selectedItem.filter(
        (item) => !sortedDiagnoses.some((diagnosis) => diagnosis.id === item.id)
      );
      setSelectedItem(updatedSelectedItems);
    }
  };

  const toggleAllAppointments = (isSelected) => {
    if (isSelected) {
      const newSelectedItems = new Set([
        ...selectedItem,
        ...sortedAppointments,
      ]);
      setSelectedItem(Array.from(newSelectedItems));
    } else {
      const updatedSelectedItems = selectedItem.filter(
        (item) => !appointments.some((appt) => appt.id === item.id)
      );
      setSelectedItem(updatedSelectedItems);
    }
  };

  const toggleAllMedications = (isSelected) => {
    if (isSelected) {
      const newSelectedItems = new Set([...selectedItem, ...sortedMedications]);
      setSelectedItem(Array.from(newSelectedItems));
    } else {
      const updatedSelectedItems = selectedItem.filter(
        (item) => !sortedMedications.some((med) => med.id === item.id)
      );
      setSelectedItem(updatedSelectedItems);
    }
  };

  const toggleAllLifestyles = (isSelected) => {
    if (isSelected) {
      const newSelectedItems = new Set([...selectedItem, ...sortedLifeStyle]);
      setSelectedItem(Array.from(newSelectedItems));
    } else {
      const updatedSelectedItems = selectedItem.filter(
        (item) => !sortedLifeStyle.some((lifestyle) => lifestyle.id === item.id)
      );
      setSelectedItem(updatedSelectedItems);
    }
  };

  const toggleAllSymptoms = (isSelected) => {
    if (isSelected) {
      const newSelectedItems = new Set([...selectedItem, ...sortedSymtoms]);
      setSelectedItem(Array.from(newSelectedItems));
    } else {
      const updatedSelectedItems = selectedItem.filter(
        (item) => !sortedSymtoms.some((symptom) => symptom.id === item.id)
      );
      setSelectedItem(updatedSelectedItems);
    }
  };

  // Select All Options

  const isAllSelected = (itemsToCheck) => {
    const selectedIds = selectedItem.map((item) => item.id);
    return itemsToCheck.every((item) => selectedIds.includes(item.id));
  };

  const handleInputChange = (e) => {
    setDisplayYear(e.target.value);
  };

  return (
    <div className="flex justify-center w-full">
      <main className="flex flex-col justify-center items-center md:w-[80%]">
        <div className="flex flex-row justify-between w-full mt-10">
          <h1 className="text-5xl font-semibold text-slate-900 w-full mb-2 md:text-left ">
            Timeline
          </h1>

          <button
            className="bg-blue-700 text-white rounded text-base w-40 h-8 self-center mr-2"
            onClick={() => setIsSelectionModalOpen(true)}
          >
            Adjust Selections
          </button>
        </div>

        {/* <div className="mt-10 flex flex-col">
            <label
              htmlFor="displayYear"
              className=" font-bold text-lg text-gray-600"
            >
              Display Year
            </label>
            <input
              type="text"
              id="displayYear"
              name="displayYear"
              value={displayYear}
              onChange={handleInputChange}
              placeholder="Enter a year"
              className="px-4 py-2 border rounded-md shadow-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div> */}

        {isModalOpen && (
          <Modal
            show={isModalOpen}
            fragment={Fragment}
            closeModal={() => {
              setModalOpen(false);
              setSelectedTask(null);
            }}
          >
            <div>
              {selectedTask && (
                <>
                  {selectedTask.timelineCategory === "imaging" && (
                    <ImagingDetails
                      labs={labs}
                      imaging={imaging}
                      medications={medications}
                      interventions={interventions}
                      selectedItem={selectedTask}
                      appointments={appointments}
                    />
                  )}
                  {selectedTask.timelineCategory === "medication" && (
                    <MedicationDetails
                      selectedItem={selectedTask}
                      displayFull={true}
                    />
                  )}
                  {selectedTask.timelineCategory === "intervention" && (
                    <InterventionDetails selectedItem={selectedTask} />
                  )}
                  {selectedTask.timelineCategory === "appointment" && (
                    <AppointmentDetails
                      imaging={imaging}
                      medications={medications}
                      interventions={interventions}
                      selectedItem={selectedTask}
                      displayFull={true}
                      labs={labs}
                    />
                  )}
                  {selectedTask.timelineCategory === "diagnosis" && (
                    <DiagnosisDetails
                      selectedItem={selectedTask}
                      displayFull={true}
                    />
                  )}

                  {selectedTask.timelineCategory === "lifestyle" ||
                    selectedTask.timelineCategory === "symptom" ||
                    selectedTask.timelineCategory === "complication" ||
                    selectedTask.timelineCategory === "diet" ? (
                    <TagDetails
                      selectedItem={selectedTask}
                      displayFull={true}
                      medications={medications}
                      interventions={interventions}
                      imaging={imaging}
                      diagnoses={diagnoses}
                      links={selectedTask?.links}
                      labs={labs}
                    />
                  ) : null}
                </>
              )}
            </div>
          </Modal>
        )}

        {isSelectionModalOpen && (
          <Modal
            size={"large"}
            show={isSelectionModalOpen}
            fragment={Fragment}
            closeModal={() => {
              setIsSelectionModalOpen(false);
            }}
          >
            <div className="grid grid-cols-1 h-full">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 w-full mb-1 mt-[-2px] md:text-left ">
                  Timeline Selections
                </h2>
                <div className="flex flex-row text-center overflow-auto mb-2">
                  {sortedDiagnoses
                    .filter((d) => d.category !== "allergy")
                    .map((item) => {
                      const isSelected = selectedItem
                        .map((i) => i.id)
                        .includes(item?.id);
                      return (
                        <div
                          key={item?.id}
                          onClick={() => toggleSelection(item)}
                          className={`cursor-pointer m-1 px-3 text-sm py-1 rounded-lg border ${isSelected
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200"
                            }`}
                        >
                          {item.title}
                        </div>
                      );
                    })}
                </div>
              </div>
              <hr className="border-slate-300 border-1 w-full" />
              {/* All of these should be refactored to use a reusable collapsible component, there is far to much code duplication here */}
              {/* Imaging */}
              <div className="flex flex-col w-full">
                <div>
                  {" "}
                  <div>
                    <div
                      className="font-semibold text-large mt-2 flex items-center cursor-pointer justify-between"
                      onClick={() => setIsImagingOpen(!isImagingOpen)}
                    >
                      <p className="text-lg">
                        Imaging{" "}
                        <span className="text-slate-400 text-base">
                          ({sortedImaging?.length})
                        </span>
                      </p>
                      <span>
                        {isImagingOpen ? (
                          <ChevronUpIcon className="h-6 w-6 text-black" />
                        ) : (
                          <ChevronDownIcon className="h-6 w-6 text-black" />
                        )}
                      </span>
                    </div>
                    {isImagingOpen && (
                      <div className="h-52 overflow-auto">
                        <div className="pl-1">
                          <input
                            className="mr-1"
                            type="checkbox"
                            id="select-all"
                            checked={isAllSelected(sortedImaging)}
                            onChange={(e) => toggleAllImaging(e.target.checked)}
                          />
                          <label htmlFor="select-all"> Select All</label>
                        </div>
                        {sortedImaging.reduce((acc, item, index) => {
                          const year = new Date(item.startDate).getFullYear();
                          const prevYear =
                            index > 0
                              ? new Date(
                                sortedImaging[index - 1].startDate
                              ).getFullYear()
                              : null;

                          if (year !== prevYear) {
                            acc.push(
                              <div
                                key={`divider-${year}`}
                                className="year-divider  bg-gray-200 w-full mb-1 mt-1"
                              >
                                <h3 className="p-1 font-medium text-base">
                                  {year}
                                </h3>
                              </div>
                            );
                          }

                          acc.push(
                            <div key={item.id} className="pl-1">
                              <input
                                type="checkbox"
                                id={item.id}
                                checked={selectedItem
                                  .map((i) => i.id)
                                  .includes(item.id)}
                                onChange={() => toggleSelection(item)}
                              />
                              <label htmlFor={item.id}>
                                {" "}
                                ({formatShortDate(item.startDate)}) -{" "}
                                {item.title}
                              </label>
                            </div>
                          );

                          return acc;
                        }, [])}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Interventions */}
              <div className="flex flex-col w-full mt-4">
                <div>
                  {" "}
                  <div>
                    <div
                      className="font-semibold text-large mt-2 flex items-center cursor-pointer justify-between"
                      onClick={() =>
                        setIsInterventionsOpen(!isInterventionsOpen)
                      }
                    >
                      <p className="text-lg">
                        Interventions{" "}
                        <span className="text-slate-400 text-base">
                          ({sortedInterventions?.length})
                        </span>
                      </p>
                      <span>
                        {isInterventionsOpen ? (
                          <ChevronUpIcon className="h-6 w-6 text-black" />
                        ) : (
                          <ChevronDownIcon className="h-6 w-6 text-black" />
                        )}
                      </span>
                    </div>
                    {isInterventionsOpen && (
                      <>
                        <div>
                          <input
                            className="mr-1"
                            type="checkbox"
                            id="select-all"
                            checked={isAllSelected(sortedInterventions)}
                            onChange={(e) =>
                              toggleAllInterventions(e.target.checked)
                            }
                          />
                          <label htmlFor="select-all">Select All</label>
                        </div>
                        {sortedInterventions.reduce((acc, item, index) => {
                          const year = new Date(item.startDate).getFullYear();
                          const prevYear =
                            index > 0
                              ? new Date(
                                sortedInterventions[index - 1].startDate
                              ).getFullYear()
                              : null;

                          if (year !== prevYear) {
                            acc.push(
                              <div
                                key={`divider-${year}`}
                                className="year-divider  bg-gray-200 w-full mb-1 mt-1"
                              >
                                <h3 className="p-1 font-medium text-base">
                                  {year}
                                </h3>
                              </div>
                            );
                          }

                          acc.push(
                            <div key={item.id} className="pl-1">
                              <input
                                type="checkbox"
                                id={item.id}
                                checked={selectedItem
                                  .map((i) => i.id)
                                  .includes(item.id)}
                                onChange={() => toggleSelection(item)}
                              />
                              <label htmlFor={item.id}>
                                {" "}
                                ({formatShortDate(item.startDate)}) -{" "}
                                {item.title}
                              </label>
                            </div>
                          );

                          return acc;
                        }, [])}
                      </>
                    )}
                  </div>
                </div>
              </div>
              {/* Diagnosises */}
              {/* <div className="w-full flex flex-row ">
                <div className="flex flex-col w-full">
                  {" "}
                  <div
                    className="font-semibold text-large mt-5 flex items-center cursor-pointer justify-between"
                    onClick={() => setIsDiagnosisOpen(!isDiagnosisOpen)}
                  >
                    <p>
                      Diagnoses{" "}
                      <span className="text-slate-400 text-base">
                        ({sortedDiagnoses?.length})
                      </span>
                    </p>
                    <span>
                      {isDiagnosisOpen ? (
                        <ChevronUpIcon className="h-6 w-6 text-black" />
                      ) : (
                        <ChevronDownIcon className="h-6 w-6 text-black" />
                      )}
                    </span>{" "}
                  </div>
                  {isDiagnosisOpen && (
                    <div>
                      <div>
                        <input
                          className="mr-1"
                          type="checkbox"
                          id="select-all"
                          checked={isAllSelected(sortedDiagnoses)}
                          onChange={(e) => toggleAllDiagnosis(e.target.checked)}
                        />
                        <label htmlFor="select-all">Select All</label>
                      </div>
                      {sortedDiagnoses.map((item) => (
                        <div>
                          <div key={item?.id}>
                            <input
                              type="checkbox"
                              id={item?.id}
                              checked={selectedItem
                                .map((item) => item.id)
                                .includes(item?.id)}
                              onChange={() => toggleSelection(item)}
                            />
                            <label htmlFor={item?.id}>
                              {" "}
                              {item.timelineCategory === "appointment"
                                ? ` ${formatShortDate(item.startDate)} ${
                                    item.title
                                  }`
                                : ` ${item.title} `}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div> */}

              {/* Medications */}
              <div className="w-full flex flex-row">
                <div className="flex flex-col w-full">
                  {" "}
                  <div
                    className="font-semibold text-large mt-5 flex items-center cursor-pointer justify-between"
                    onClick={() => setIsMedicationsOpen(!isMedicationsOpen)}
                  >
                    <p className="text-lg">
                      Medications/Therapies{" "}
                      <span className="text-slate-400 text-base">
                        ({sortedMedications?.length})
                      </span>
                    </p>
                    <span>
                      {isMedicationsOpen ? (
                        <ChevronUpIcon className="h-6 w-6 text-black" />
                      ) : (
                        <ChevronDownIcon className="h-6 w-6 text-black" />
                      )}
                    </span>{" "}
                  </div>
                  {isMedicationsOpen && (
                    <div className="h-52 overflow-auto">
                      <div>
                        <input
                          className="mr-1"
                          type="checkbox"
                          id="select-all"
                          checked={isAllSelected(sortedMedications)}
                          onChange={(e) =>
                            toggleAllMedications(e.target.checked)
                          }
                        />
                        <label htmlFor="select-all">Select All</label>
                      </div>
                      {sortedMedications.reduce((acc, item, index) => {
                        const year = new Date(item.startDate).getFullYear();
                        const prevYear =
                          index > 0
                            ? new Date(
                              sortedMedications[index - 1].startDate
                            ).getFullYear()
                            : null;

                        if (year !== prevYear) {
                          acc.push(
                            <div
                              key={`divider-${year}`}
                              className="year-divider  bg-gray-200 rounded-sm  mb-2 w-full mt-2"
                            >
                              <h3 className="p-1 font-medium text-base">
                                {year}
                              </h3>
                            </div>
                          );
                        }

                        acc.push(
                          <div key={item.id} className="pl-1">
                            <input
                              type="checkbox"
                              id={item.id}
                              checked={selectedItem
                                .map((i) => i.id)
                                .includes(item.id)}
                              onChange={() => toggleSelection(item)}
                            />
                            <label htmlFor={item.id} className="capitalize">
                              {" "}
                              ({formatShortDate(item.startDate)}) - {item.title}
                            </label>
                          </div>
                        );

                        return acc;
                      }, [])}
                    </div>
                  )}
                </div>
              </div>
              {/* Appointments */}
              <div className="w-full flex flex-row">
                <div className="flex flex-col w-full">
                  {" "}
                  <div
                    className="font-semibold text-large mt-5 flex items-center cursor-pointer justify-between"
                    onClick={() => setIsAppointmentsOpen(!isAppointmentsOpen)}
                  >
                    <p className="text-lg">
                      Appointments{" "}
                      <span className="text-slate-400 text-base">
                        ({sortedAppointments?.length})
                      </span>
                    </p>
                    <span>
                      {isAppointmentsOpen ? (
                        <ChevronUpIcon className="h-6 w-6 text-black" />
                      ) : (
                        <ChevronDownIcon className="h-6 w-6 text-black" />
                      )}
                    </span>{" "}
                  </div>
                  {isAppointmentsOpen && (
                    <div>
                      <div>
                        <input
                          className="mr-1"
                          type="checkbox"
                          id="select-all"
                          checked={isAllSelected(sortedAppointments)}
                          onChange={(e) =>
                            toggleAllAppointments(e.target.checked)
                          }
                        />
                        <label htmlFor="select-all">Select All</label>
                      </div>
                      {sortedAppointments.reduce((acc, item, index) => {
                        const year = new Date(item.startDate).getFullYear();
                        const prevYear =
                          index > 0
                            ? new Date(
                              sortedAppointments[index - 1].startDate
                            ).getFullYear()
                            : null;

                        if (year !== prevYear) {
                          acc.push(
                            <div
                              key={`divider-${year}`}
                              className="year-divider  bg-gray-200 w-full mb-1 mt-1"
                            >
                              <h3 className="p-1 font-medium text-base">
                                {year}
                              </h3>
                            </div>
                          );
                        }

                        acc.push(
                          <div key={item.id} className="pl-1">
                            <input
                              type="checkbox"
                              id={item.id}
                              checked={selectedItem
                                .map((i) => i.id)
                                .includes(item.id)}
                              onChange={() => toggleSelection(item)}
                            />
                            <label htmlFor={item.id}>
                              {" "}
                              ({formatShortDate(item.startDate)}) - {item.title}
                            </label>
                          </div>
                        );

                        return acc;
                      }, [])}
                    </div>
                  )}
                </div>
              </div>
              {/* Lifestyle */}
              <div className="w-full flex flex-row">
                <div className="flex flex-col w-full">
                  {" "}
                  <div
                    className="font-semibold text-large mt-5 flex items-center cursor-pointer justify-between"
                    onClick={() => setIsLifeStyleOpen(!isLifestyleOpen)}
                  >
                    <p className="text-lg">
                      Diet/Lifestyle{" "}
                      <span className="text-slate-400 text-base">
                        ({sortedLifeStyle?.length})
                      </span>
                    </p>
                    <span>
                      {isLifestyleOpen ? (
                        <ChevronUpIcon className="h-6 w-6 text-black" />
                      ) : (
                        <ChevronDownIcon className="h-6 w-6 text-black" />
                      )}
                    </span>{" "}
                  </div>
                  {isLifestyleOpen && (
                    <div>
                      <div>
                        <input
                          className="mr-1"
                          type="checkbox"
                          id="select-all"
                          checked={isAllSelected(sortedLifeStyle)}
                          onChange={(e) =>
                            toggleAllLifestyles(e.target.checked)
                          }
                        />
                        <label htmlFor="select-all">Select All</label>
                      </div>
                      {sortedLifeStyle.reduce((acc, item, index) => {
                        const year = new Date(item.startDate).getFullYear();
                        const prevYear =
                          index > 0
                            ? new Date(
                              sortedLifeStyle[index - 1].startDate
                            ).getFullYear()
                            : null;

                        if (year !== prevYear) {
                          acc.push(
                            <div
                              key={`divider-${year}`}
                              className="year-divider  bg-gray-200 w-full mb-1 mt-1"
                            >
                              <h3 className="p-1 font-medium text-base">
                                {year}
                              </h3>
                            </div>
                          );
                        }

                        acc.push(
                          <div key={item.id} className="pl-1">
                            <input
                              type="checkbox"
                              id={item.id}
                              checked={selectedItem
                                .map((i) => i.id)
                                .includes(item.id)}
                              onChange={() => toggleSelection(item)}
                            />
                            <label htmlFor={item.id}>
                              {" "}
                              ({formatShortDate(item.startDate)}) - {item.title}
                            </label>
                          </div>
                        );

                        return acc;
                      }, [])}
                    </div>
                  )}
                </div>
              </div>
              {/* Symptoms */}
              <div className="w-full flex flex-row">
                <div className="flex flex-col w-full">
                  {" "}
                  <div
                    className="font-semibold text-large mt-5 flex items-center cursor-pointer justify-between"
                    onClick={() => setIsSymptomsOpen(!isSymptomsOpen)}
                  >
                    <p className="text-lg">
                      Symptoms / Complications / Lifestyle{" "}
                      <span className="text-slate-400 text-base">
                        ({sortedSymtoms?.length})
                      </span>
                    </p>
                    <span>
                      {isSymptomsOpen ? (
                        <ChevronUpIcon className="h-6 w-6 text-black" />
                      ) : (
                        <ChevronDownIcon className="h-6 w-6 text-black" />
                      )}
                    </span>{" "}
                  </div>
                  {isSymptomsOpen && (
                    <div>
                      <div>
                        <input
                          className="mr-1"
                          type="checkbox"
                          id="select-all"
                          checked={isAllSelected(sortedSymtoms)}
                          onChange={(e) => toggleAllSymptoms(e.target.checked)}
                        />
                        <label htmlFor="select-all">Select All</label>
                      </div>

                      {sortedSymtoms.length > 0 &&
                        sortedSymtoms
                          .filter(
                            (a) =>
                              a.timelineCategory === "symptom" ||
                              a.timelineCategory === "complication"
                          )
                          .reduce((acc, item, index) => {
                            const year = new Date(
                              item?.startDate
                            ).getFullYear();
                            const prevYear =
                              index > 0
                                ? new Date(
                                  sortedSymtoms[index - 1]?.startDate
                                ).getFullYear()
                                : null;

                            if (year !== prevYear) {
                              acc.push(
                                <div
                                  key={`divider-${year}`}
                                  className="year-divider  bg-gray-200 w-full mb-1 mt-1"
                                >
                                  <h3 className="p-1 font-medium text-base">
                                    {year}
                                  </h3>
                                </div>
                              );
                            }

                            acc.push(
                              <div key={item.id} className="pl-1">
                                <input
                                  type="checkbox"
                                  id={item.id}
                                  checked={selectedItem
                                    .map((i) => i.id)
                                    .includes(item.id)}
                                  onChange={() => toggleSelection(item)}
                                />
                                <label htmlFor={item.id}>
                                  {" "}
                                  ({formatShortDate(item.startDate)}) -{" "}
                                  {item.title}
                                </label>
                              </div>
                            );

                            return acc;
                          }, [])}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Modal>
        )}
        <div className="h-[700px] bg-white overflow-x-auto w-full rounded border shadow-sm">
          <div className="grid gap-2 w-full bg-white p-2  mb-20">
            <div className="flex w-full p-2 sticky top-0 z-10 bg-white">
              {headers.map((date, index) => (
                <div
                  key={index}
                  className="min-w-[60px] md:min-w-[80px] lg:min-w-[100px] border text-center font-medium text-base border-gray-400 p-2"
                >
                  {date.toLocaleDateString(undefined, {
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              ))}
            </div>

            {/* Display empty state if nothing is selected */}
            {selectedItem.length === 0 && (
              <div className="max-w-[1300px] text-center">
                <img
                  src="/img/gantt.png"
                  className="w-80 h-80 opacity-10 mx-auto"
                  alt="empty state gantt"
                />
                <div className="text-gray-300">Empty Timeline</div>
                <div className="text-gray-300">Add Your Selections</div>
              </div>
            )}

            {selectedItem.map((item, index) => {
              const itemStartDate = new Date(item.startDate);
              const itemEndDate = item.endDate
                ? new Date(item.endDate)
                : new Date(item.startDate);

              // Find the correct index for the start date
              const gridColumnStart =
                headers.findIndex(
                  (headerDate) =>
                    headerDate.getFullYear() === itemStartDate.getFullYear() &&
                    headerDate.getMonth() === itemStartDate.getMonth()
                ) + 1; // +1 because CSS grid is 1-based.

              // Find the correct index for the end date or use the last one if the item is ongoing
              let gridColumnEnd;

              if (item.startDate === item.endDate || !item.endDate) {
                gridColumnEnd = gridColumnStart + 1;
              } else {
                gridColumnEnd = headers.findIndex(
                  (headerDate) =>
                    headerDate.getFullYear() > itemEndDate.getFullYear() ||
                    (headerDate.getFullYear() === itemEndDate.getFullYear() &&
                      headerDate.getMonth() > itemEndDate.getMonth())
                );
              }

              const colorClass = getColorClass(item.timelineCategory, item);
              return (
                <div
                  key={index}
                  className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))]"
                >
                  <div
                    className={`${colorClass}
                    } cursor-pointer p-2 text-center text-xs rounded-sm font-medium overflow-auto capitalize`}
                    style={{ gridColumnStart, gridColumnEnd }}
                    onClick={() => openTaskModal(item)}
                  >
                    {item.timelineCategory === "appointment"
                      ? `${formatShortDate(item.startDate)} ${item.title}`
                      : item.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default Timeline;
