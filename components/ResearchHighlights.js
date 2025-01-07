import React, { useState, Fragment, useEffect } from "react";
import ResultsTable from "./tables/ResultsTable";
import {
  InformationCircleIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/solid";
import TagLegendCard from "./TagLegendCard";
import Modal from "./Modal";
import { useMutation } from "react-query";
import { useSession } from "@clerk/nextjs";
import InternalResearchForm from "./LabsInputForm";
import {
  createArticlePOST,
  useLabs,
  useMedications,
  useInstitutions,
  useLabPanels,
} from "@/hooks/api";
import { toast } from "react-hot-toast";
import { queryClient } from "@/queryClient";
import InterventionCard from "./cards/InterventionCard";
import ScanCard from "./cards/scanCard";
import InterventionsTable from "./tables/InterventionsTable";
import MedicationsTable from "./tables/MedicationsTable";
import MedicationCard from "./cards/MedicationCard";
import ProvidersTable from "./tables/ProvidersTable";
import ProviderCard from "./cards/ProviderCard";
import InstitutionCard from "@/components/cards/InstitutionCard";

import { useInterventions, useImaging, useProviders } from "@/hooks/api";
import {
  sortByListOrderAndStatus,
  sortByListOrderAndDate,
  sortByDateDesc,
  sortByDateAndPanel,
} from "@/utils/helpers";
import ScansTable from "./tables/ScansTable";
import LabsIntputForm from "./LabsInputForm";
import AppointmentsTable from "@/components/tables/AppointmentsTable";
import TimelineEventsTable from "@/components/tables/TimelineEventsTable";
import { useUser } from "@clerk/clerk-react";
import Sequencing from "./Sequencing";
import { usePatientContext } from '@/components/context/PatientContext';
import EmptyState from "./common/EmptyState";
import { DocumentMinusIcon, BuildingOfficeIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import MedicationForm from "./forms/MedicationForm";
import InstitutionForm from "./forms/InstitutionForm";
import AddInstitutionForm from "./forms/AddInstitutionForm";
import { ChartBarSquareIcon } from "@heroicons/react/20/solid";

const trialTagMocks = [
  {
    id: 1,
    value: "immunotherapy",
    title: "Immunotherapy",
    firstLine: "Nivolumab, Pembrolizumab, Ipilimumab, Atezolizumab",
    secondLine: "",
  },
  {
    id: 2,
    value: "tki",
    title: "Drugs Targeting VEGF (mostly TKIs)",
    firstLine: "Lenvatinib, Cabozantinib, Sunitinib, Axitinib, Bevacizumab",
    secondLine: "",
  },
  {
    id: 3,
    value: "mtor",
    title: "mTOR Inhibitors",
    firstLine: "Everolimus",
    secondLine: "",
  },
  ,
  {
    id: 3,
    value: "chemotherapy",
    title: "Chemotherapy",
    firstLine:
      "Gemcitabine, Doxorubicin, Carboplatin, Paclitaxel, Capecitabine",
    secondLine: "",
  },
];

export default function Research({
  version,
  isEditing,
  lastLogin,
  appointments,
  timelineEvents,
}) {
  const { session } = useSession();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddResearchOpen, setIsAddResearchOpen] = useState(false);
  const [isProvidersModalOpen, setIsProvidersModalOpen] = useState(false);
  const [isScansOpen, setIsScansOpen] = useState(false);
  const [isInterventionsOpen, setIsInterventionsOpen] = useState(false);
  const [isAddProviderOpen, setIsAddProviderOpen] = useState(false);
  const [isAddInstitutionOpen, setIsAddInstitutionOpen] = useState(false);

  const [sortedInterventions, setSortedInterventions] = useState([]);
  const [sortedLabs, setSortedLabs] = useState([]);
  const [sortedImaging, setSortedImaging] = useState([]);
  const [sortedMedications, setSortedMedications] = useState([]);
  const [isMedicationsOpen, setIsMedicationsOpen] = useState(false);
  const [sortedProviders, setSortedProviders] = useState([]);
  const [isProvidersOpen, setIsProvidersOpen] = useState(false);
  const [sortedInstitutions, setSortedInstitutions] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const { patientId } = usePatientContext();
  const [isAddMedicationOpen, setIsAddMedicationOpen] = useState(false);

  const { data: providersData } = useProviders(
    { id: patientId },
    {
      enabled: lastLogin ? true : false,
    }
  );
  const { data: imaging } = useImaging(
    { id: patientId, lastLogin: lastLogin },
    {
      enabled: lastLogin ? true : false,
    }
  );

  const { data: institutionsData } = useInstitutions(
    {
      id: patientId,
      session: session,
      lastLogin: lastLogin,
    },
    { enabled: !!lastLogin }
  );

  const { data: labs } = useLabs(
    {
      id: patientId,
      session: session,
      lastLogin: lastLogin,
    },
    { enabled: !!lastLogin }
  );

  const { data: medications, isLoading: isMedicationsLoading } = useMedications(
    {
      id: patientId,
      lastLogin: lastLogin,
    },
    { enabled: !!lastLogin }
  );
  const { user } = useUser();

  const { data: interventionsData } = useInterventions(
    {
      id: patientId,
      lastLogin: lastLogin,
    },
    { enabled: !!lastLogin }
  );

  useEffect(() => {
    if (!institutionsData) return;
    setSortedInstitutions(sortByListOrderAndStatus(institutionsData));
  }, [institutionsData]);

  useEffect(() => {
    if (!interventionsData || interventionsData.length < 1) return;
    setSortedInterventions(sortByListOrderAndStatus(interventionsData));
  }, [interventionsData]);

  useEffect(() => {
    if (!labs || labs.length < 1) return;
    setSortedLabs(sortByDateAndPanel(labs));
  }, [labs]);

  useEffect(() => {
    if (!imaging) return;
    setSortedImaging(sortByListOrderAndDate(imaging));
  }, [imaging]);

  //todo: this should not be needed, need to sort out why call is sending without lastLogin
  useEffect(() => {
    if (!providersData) return;
    if (lastLogin) {
      const filteredProviders = providersData.filter(
        (provider) => new Date(provider.createdAt) > new Date(lastLogin)
      );
      setSortedProviders(sortByListOrderAndStatus(filteredProviders));
    } else {
      setSortedProviders(sortByListOrderAndStatus(providersData));
    }
  }, [providersData]);

  //todo: this should not be needed, need to sort out why call is sending without lastLogin
  useEffect(() => {
    if (!medications) return;
    if (lastLogin) {
      const filteredMedication = medications.filter(
        (medication) => new Date(medication.createdAt) > new Date(lastLogin)
      );
      setSortedMedications(sortByListOrderAndStatus(filteredMedication));
    } else {
      setSortedMedications(sortByListOrderAndStatus(medications));
    }
  }, [medications]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeAddResearch = () => {
    setIsAddResearchOpen(false);
  };

  const closeManagementModal = () => {
    setIsMedicationsOpen(false);
  };

  const closeInterventionModal = () => {
    setIsInterventionsOpen(false);
  };

  const closeScansModal = () => {
    setIsScansOpen(false);
  };

  const closeProvidersTable = () => {
    setIsProvidersOpen(false);
  };

  const closeAddMedication = () => {
    setIsAddMedicationOpen(false);
  };

  const closeAddInstitution = () => {
    setIsAddInstitutionOpen(false);
  }


  const isEmailMatch = () => {
    return user?.emailAddresses.some(
      (emailObj) => emailObj.emailAddress === adminEmail
    );
  };

  useEffect(() => {
    if (user?.emailAddresses) {
      setIsAdmin(isEmailMatch());
    }
  }, [user]);

  const submitLabs = (data) => {
    const payload = {
      data,
      session,
    };
    mutate(payload, {
      onSuccess: (data) => {
        // setIsToggled(!isToggled);
        queryClient.invalidateQueries("labs");
      },
    });
  };

  const addMedication = (data) => {
    const payload = {
      data,
      session,
    };
    mutate(payload, {
      onSuccess: (data) => {
        // setIsToggled(!isToggled);
        queryClient.invalidateQueries("medications");
      },
    });
  }



  return (
    <>
      <div className="flex justify-center w-full">
        <main className="flex flex-col bg-slate-50 w-full">
          <div className="w-full">
            {isModalOpen && trialTagMocks && (
              <Modal
                show={isModalOpen}
                fragment={Fragment}
                closeModal={closeModal}
              >
                <LabsIntputForm
                  closeModal={closeModal}
                  addLabs={submitLabs}
                  institutions={institutionsData}
                  providers={providersData}
                />
              </Modal>
            )}

            {isProvidersModalOpen && (
              <Modal
                show={isProvidersModalOpen}
                fragment={Fragment}
                closeModal={closeAddProvider}
              >
                <TagLegendCard
                  tags={providersTagsMock}
                  tagType="Provider Tags"
                />
                <div className="mt-4 flex flex-row">
                  <BuildingOfficeIcon className="h-8 w-8 ml-1 text-blue-400" />{" "}
                  <p className="text-sm flex self-center"></p>
                </div>
              </Modal>
            )}

            {isProvidersOpen && (
              <div>
                <Modal
                  show={isProvidersOpen}
                  fragment={Fragment}
                  closeModal={closeProvidersTable}
                >
                  <div className="mb-10">
                    <h1 className="text-center md:text-left sm:text-xl text-md p-2 font-semibold mb-2">
                      Full Providers List{" "}
                    </h1>
                    <ProvidersTable
                      providers={sortedProviders}
                      modal={true}
                      isAdmin={session?.isAdmin ?? false}
                      isEditing={isEditing}
                    />
                  </div>
                </Modal>
              </div>
            )}

            {isInterventionsOpen && (
              <div>
                <Modal
                  show={isInterventionsOpen}
                  fragment={Fragment}
                  closeModal={closeInterventionModal}
                >
                  <div className="mb-10">
                    <h1 className="text-center md:text-left sm:text-xl text-md p-2 font-semibold mb-2">
                      Full Interventions List{" "}
                    </h1>

                    <InterventionsTable
                      interventions={interventionsData}
                      modal={true}
                      isAdmin={session?.isAdmin ?? false}
                      isEditing={isEditing}
                    />
                  </div>
                </Modal>
              </div>
            )}

            {isMedicationsOpen && (
              <div>
                <Modal
                  show={isModalOpen}
                  fragment={Fragment}
                  closeModal={closeManagementModal}
                >
                  <div className="mb-10">
                    <h1 className="text-center md:text-left sm:text-2xl text-md p-2 font-semibold mb-2">
                      Full Medication List{" "}
                    </h1>

                    <MedicationsTable
                      medications={sortedMedications}
                      modal={true}
                      isAdmin={session?.isAdmin ?? false}
                      isEditing={true}
                    />
                  </div>
                </Modal>
              </div>
            )}

            {isScansOpen && (
              <div>
                <Modal
                  show={isModalOpen}
                  fragment={Fragment}
                  closeModal={closeScansModal}
                >
                  <div className="mb-10">
                    <h1 className="text-center md:text-left sm:text-2xl text-md p-2 font-semibold mb-2">
                      Full Imaging List{" "}
                    </h1>

                    <ScansTable scans={sortedImaging} modal={true} />
                  </div>
                </Modal>
              </div>
            )}

            {isAddResearchOpen && (
              <Modal
                show={isAddResearchOpen}
                fragment={Fragment}
                closeModal={closeAddResearch}
              >
                <div>
                  <InternalResearchForm
                    closeModal={closeAddResearch}
                    addArticle={submitArticle}
                  />
                </div>
              </Modal>
            )}

            {isAddInstitutionOpen && (

              <Modal
                show={isAddInstitutionOpen}
                fragment={Fragment}
                closeModal={closeAddInstitution}
              >
                <div>
                  <AddInstitutionForm />
                </div>
              </Modal>
            )}


            {isAddMedicationOpen && (
              <Modal
                show={isAddMedicationOpen}
                fragment={Fragment}
                closeModal={closeAddMedication}
              >
                <MedicationForm />
              </Modal>
            )}
            {(
              <div className="w-full">
                <div className="flex flex-row w-full mt-7">
                  <div className="text-center md:text-3xl text-xl font-semibold flex flex-row justify-between w-full">
                    <h1 className="md:flex md:flex-row w-full text-center sm:text-left"> Medications{" "}
                      {isMedicationsLoading ? (
                        <div></div>
                      ) : sortedMedications &&
                        sortedMedications.some(
                          (m) => m.status === "active"
                        ) ? null : (

                        <div className="ml-2 text-sm self-center mt-1 opacity-70 text-blue-500">
                          (no active medications)
                        </div>
                      )}
                    </h1>
                    <div>
                      {isAdmin && version === "admin" && (
                        <a href="/medications/create" className="rounded text-xs ml-2 h-8 p-2 font-normal text-white bg-blue-600 shadow-sm" target="_blank">
                          Add
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  {lastLogin && sortedMedications?.length > 0 ? (
                    <div className="w-full mt-2">
                      <MedicationsTable
                        medications={sortedMedications.slice(0, 5)}
                      />
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full gap-4 pt-2">
                      {sortedMedications
                        ?.slice(0, 4)
                        .map((medication, index) => (
                          <MedicationCard
                            isEditing={isEditing}
                            className="shadow-md"
                            key={index}
                            medications={sortedMedications}
                            isActive={false}
                            medication={medication}
                            session={session}
                            index={index}
                            type={"management"}
                          />
                        ))}
                    </div>
                  )}
                </div>
                {sortedMedications?.length > 0 ? <div className="md:text-right text-center p-2 mt-4 text-sm text-blue-700 font-semibold">
                  <button onClick={() => setIsMedicationsOpen(true)}>
                    ({sortedMedications?.length}) View all medications
                  </button>
                </div> : (
                  <a className="mt-2 w-full flex justify-center" href="/medications/create" target="_blank">
                    <EmptyState message="Add Medications" Icon={DocumentMinusIcon} width="w-1/3" />
                  </a>
                )}
              </div>
            )}


            <div className="w-full">
              <div className="flex flex-row mt-3 w-full justify-between">
                <h1 className="text-center md:text-left md:text-3xl text-xl font-semibold w-full">
                  Interventions
                </h1>
                {isAdmin && version === "admin" && (
                  <div>
                    <a href="/imaging/create" className="rounded text-xs ml-2 p-2 text-white bg-blue-600 shadow-sm h-8 self-center" target="_blank">
                      Add
                    </a>
                  </div>
                )}
              </div>
              <div className="w-full">
                {lastLogin && sortedInterventions?.length > 0 ? (
                  <div className="w-full mt-2">
                    <InterventionsTable
                      interventions={sortedInterventions.slice(0, 5)}
                    />
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-4 pt-2">
                    {sortedInterventions
                      ?.slice(0, 3)
                      .map((intervention, index) => (
                        <InterventionCard
                          isEditing={isEditing}
                          className="shadow-md"
                          key={index}
                          intervenions={sortedInterventions}
                          isActive={false}
                          intervention={intervention}
                          session={session}
                          index={index}
                          type={"management"}
                        />
                      ))}
                  </div>
                )}
              </div>
              <div className="md:text-right text-center p-2 mt-4 text-sm text-blue-700 font-semibold">
                <button onClick={() => setIsInterventionsOpen(true)}>
                  ({sortedInterventions.length}) View all interventions{" "}
                </button>
              </div>
            </div>


            {sortedImaging?.length > 0 && (
              <div className="w-full">
                <div className="flex flex-row self-center w-full justify-between">
                  <h1 className="md:text-left text-center p-4 pl-0 md:text-3xl text-xl font-semibold">
                    Imaging
                  </h1>
                  {isAdmin && version === "admin" && (

                    <a href="/imaging/create" className="rounded  text-xs ml-2 p-2 text-white bg-blue-600 shadow-sm h-8 self-center" target="_blank">
                      Add
                    </a>
                  )}
                </div>


                <div className="w-full">
                  {lastLogin && sortedImaging?.length > 0 ? (
                    <div className="w-full mt-2">
                      <ScansTable scans={sortedImaging.slice(0, 3)} />
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-4 pt-2">
                      {sortedImaging?.slice(0, 3).map((scan, index) => (
                        <ScanCard
                          isEditing={isEditing}
                          className="shadow-md"
                          key={index}
                          isActive={false}
                          scan={scan}
                          session={session}
                          index={index}
                          type={"management"}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="sm:text-right text-center p-2 mt-4 text-sm text-blue-700 font-semibold">
                  <button onClick={() => setIsScansOpen(true)}>
                    ({sortedImaging?.length}) View all imaging{" "}
                  </button>
                </div>
              </div>
            )}


            {version === "oncology" || version === "research" || version === "admin" ? <Sequencing isAdmin={isAdmin} version={version} /> : null}


            <div className="flex flex-col w-full">
              <div className="flex flex-row mt-10 w-full justify-between">
                <h1 className="text-center md:text-left pl-0 text-3xl font-semibold self-center">
                  Labs / Test Results  </h1>
                {isAdmin && version === "admin" && (
                  <div className="self-center ">
                    <button onClick={() => setIsModalOpen(true)} className="rounded  text-xs ml-2 p-2 text-white bg-blue-600 shadow-sm h-8 self-center" >
                      Add
                    </button>
                  </div>
                )}

              </div>
              <div className="align-left w-full mx-auto pl-20 pr-10 sm:pl-0 sm:pr-0">
                {sortedLabs?.length > 0 ? (
                  <ResultsTable labResults={sortedLabs} displaySearch={true} />
                ) : (
                  <div className="w-full flex justify-center ">
                    <button onClick={() => setIsModalOpen(true)}>
                      <EmptyState message="No Labs Results Available" Icon={ChartBarSquareIcon} width="w-full" />
                    </button>
                  </div>

                )}

              </div>
            </div>


            <div>
              <div className="flex flex-row self-center w-full justify-between">
                <h1 className="md:text-left text-center p-4 pl-0 md:text-3xl text-xl font-semibold">
                  Providers
                </h1>
                {isAdmin && version === "admin" && (
                  <a href="/providers/create" className="rounded text-xs ml-2 p-2 text-white bg-blue-600 shadow-sm h-8 self-center" target="_blank">
                    Add
                  </a>
                )}
              </div>

              {sortedProviders?.length > 0 ? (
                <div className="mb-10">
                  <div className="flex-row grid sm:grid-cols-1  grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-4">
                    {sortedProviders?.slice(0, 6)?.map((provider, index) => (
                      <ProviderCard
                        className="shadow-md"
                        key={index}
                        provider={provider}
                        isActive={false}
                      />
                    ))}
                  </div>
                  <div className="md:text-right text-center p-2 mt-4 text-sm text-blue-700 font-semibold">
                    <button onClick={() => setIsProvidersOpen(true)}>
                      ({sortedProviders?.length}) View all providers{" "}
                    </button>
                  </div>
                </div>

              ) : (<div className="w-full flex justify-center">
                <button onClick={() => setIsModalOpen(true)}>
                  <EmptyState message="No Providers Added" Icon={UserGroupIcon} width="w-full" />
                </button>
              </div>)}


            </div>


            <div className="w-full">
              <div className="flex flex-row self-center w-full justify-between">
                <h1 className="md:text-left text-center p-4 pl-0 md:text-3xl text-xl font-semibold">
                  Institutions / Cancer Centers{" "}
                </h1>
                {isAdmin && version === "admin" && (
                  <a href="/institutions/create" className="rounded  text-xs ml-2 p-2 text-white bg-blue-600 shadow-sm h-8 self-center" target="_blank">
                    Add
                  </a>
                )}
              </div>
              {sortedInstitutions?.length > 0 ? (
                <>
                  <div className="w-full mb-4">
                    <div className="flex flex-col h-full">
                      <TagLegendCard />
                    </div>
                    {/* ))} */}
                  </div>
                  <div className="mb-10 max-h-80 overflow-auto mt-5 ">
                    <div className="grid sm:grid-cols-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-4 grid-row-[fr1]">
                      {sortedInstitutions?.map((institution, index) => (
                        <div className="flex flex-col h-full">
                          <InstitutionCard
                            className="shadow-md"
                            key={index}
                            institution={institution}
                            isActive={false}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>

              ) : (
                <button className="mt-2 w-full" href="/institutions/create" target="_blank">
                  <EmptyState message="Add Institution" Icon={BuildingOfficeIcon} width="w-1/3" />
                </button>
              )}
            </div>
            <div className="flex justify-center mx-auto w-full">
              <main className="flex flex-col bg-slate-50">
                {appointments?.length > 0 && (
                  <div className="rounded-sm p-4">
                    <h1 className="text-3xl font-semibold text-slate-900 w-full md:text-left mt-5">
                      Appointments
                    </h1>
                    <AppointmentsTable
                      appointments={appointments}
                      fullDetails={true}
                    />
                  </div>
                )}

                {timelineEvents?.length > 0 && (
                  <div className="rounded-sm p-4 w-full">
                    <h1 className="text-3xl font-semibold text-slate-900 w-full md:text-left mt-5">
                      Timeline Events
                    </h1>
                    <TimelineEventsTable
                      events={timelineEvents}
                      fullDetails={true}
                    />
                  </div>
                )}
              </main>
            </div>
          </div>
        </main >
      </div >
    </>
  );
}

//test
