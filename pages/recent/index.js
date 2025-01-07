"use client";
import { React, useState, useEffect, Fragment } from "react";
import ResearchHighlights from "@/components/ResearchHighlights";
import AddProviderForm from "@/components/AddProviderForm";
import {
  useInstitutions,
  useProviders,
  useMedications,
  useDiagnoses,
  useAppointments,
  useTimeline,
  useResearchInterests,
} from "@/hooks/api";
import TagLegendCard from "@/components/TagLegendCard";
import { BuildingOfficeIcon } from "@heroicons/react/24/solid";
import Modal from "@/components/Modal";
import { Footer } from "@/components/HomePage/Footer";
import Head from "next/head";
import { useSession, useUser } from "@clerk/nextjs";
import AddInstitutionForm from "@/components/forms/AddInstitutionForm";
import { useQueryClient, useQuery } from "react-query";
import ProvidersTable from "@/components/tables/ProvidersTable";
import Link from "next/link";
import Sequencing from "@/components/Sequencing";
import MedicationsTable from "@/components/tables/MedicationsTable";
import {
  sortByListOrderAndStatus,
  calculateAge,
  sortByDateDesc,
} from "@/utils/helpers";
import AppointmentsTable from "@/components/tables/AppointmentsTable";
import TimelineEventsTable from "@/components/tables/TimelineEventsTable";
import ResearchCard from "@/components/cards/ResearchCard";
import ResearchTable from "@/components/tables/ResearchTable";
import { usePatientContext } from "@/components/context/PatientContext";

export default function Recent({
  version,
  setVersion,
  isEditing,
  setIsEditing,
}) {
  const { session } = useSession();
  const { user } = useUser();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const { patientId } = usePatientContext();
  const [isAdmin, setIsAdmin] = useState(false);
  const [lastLogin, setLastLogin] = useState(null);

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

  useEffect(() => {
    if (!user) return;
    setLastLogin(user.lastSignInAt.toISOString().split("T")[0]);
  }, [user]);

  const queryClient = useQueryClient();

  const { data: providersData } = useProviders(
    { id: patientId, lastLogin: lastLogin },
    {
      enabled: !!user,
    }
  );

  const { data: researchInterests } = useResearchInterests(
    {
      id: patientId,
      lastLogin: lastLogin,
    },
    {
      enabled: !!lastLogin,
    }
  );

  const { data: institutionsData } = useInstitutions(
    {
      id: patientId,
      session: session,
      lastLogin: lastLogin,
    },
    { enabled: !!user }
  );
  const { data: medications, isLoading: isMedicationsLoading } = useMedications(
    {
      id: patientId,
    }
  );
  const { data: diagnoses } = useDiagnoses(
    {
      id: patientId,
      lastLogin: lastLogin,
    },
    { enabled: !!lastLogin }
  );

  const { data: appointments } = useAppointments(
    { id: patientId }
  );

  const { data: timelineEvents } = useTimeline({ id: patientId });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProvidersModalOpen, setIsProvidersModalOpen] = useState(false);
  const [isMedicationsOpen, setIsMedicationsOpen] = useState(false);
  const [sortedProviders, setSortedProviders] = useState([]);
  const [sortedInstitutions, setSortedInstitutions] = useState([]);
  const [sortedMedications, setSortedMedications] = useState([]);
  const [sortedDiagnoses, setSortedDiagnoses] = useState([]);
  const [sortedAppointments, setSortedAppointments] = useState([]);
  const [sortedTimelineEvents, setSortedTimelineEvents] = useState([]);

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

    const sortedAppts = sortByDateDesc(
      appointments.filter((a) => new Date(a.createdAt) > new Date(lastLogin))
    );
    setSortedAppointments(sortedAppts);
  }, [appointments]);

  useEffect(() => {
    if (!medications) return;
    const sortedMeds = sortByListOrderAndStatus(medications);
    setSortedMedications(sortedMeds);
  }, [medications]);

  const [isAddProviderOpen, setIsAddProviderOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProvidersOpen, setIsProvidersOpen] = useState(false);
  const [isAddInstitutionOpen, setIsAddInstitutionOpen] = useState(false);
  const [isInterestsOpen, setIsInterestsOpen] = useState(false);
  const [filteredResearchInterests, setFilteredResearchInterests] = useState(
    []
  );

  useEffect(() => {
    const delay = setTimeout(() => {
      setIsLoading(false);
    }, 1250);
    return () => clearTimeout(delay);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedVersion = localStorage.getItem("version");
      if (storedVersion) {
        setVersion(storedVersion);
      }

      const handleStorageChange = (e) => {
        if (e.key === "version") {
          setVersion(e.newValue);
        }
      };

      window.addEventListener("storage", handleStorageChange);
      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    }
  }, []);

  useEffect(() => {
    if (!researchInterests) return;
    const sortedResearchInterests = researchInterests.sort((a, b) => {
      if (a.listOrder === null && b.listOrder === null) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (a.listOrder === null) {
        return 1;
      }
      if (b.listOrder === null) {
        return -1;
      }
      return a.listOrder - b.listOrder;
    });

    if (isAdmin) {
      setFilteredResearchInterests(sortedResearchInterests);
    } else {
      const filtered = sortedResearchInterests.filter(
        (interest) => interest.accessLevelId !== 1
      );
      setFilteredResearchInterests(filtered);
    }
  }, [researchInterests]);

  useEffect(() => {
    if (!timelineEvents) return;
    const sortedTimelineEvents = sortByDateDesc(
      timelineEvents.filter((a) => new Date(a.createdAt) > new Date(lastLogin))
    );
    setSortedTimelineEvents(sortedTimelineEvents);
  }, [timelineEvents]);

  const closeManagementModal = () => {
    setIsMedicationsOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeInstitutionModal = () => {
    setIsAddInstitutionOpen(false);
  };

  const closeAddProvider = () => {
    setIsAddProviderOpen(false);
  };

  const closeProvidersTable = () => {
    setIsProvidersOpen(false);
  };

  const closeInterestsTable = () => {
    setIsInterestsOpen(false);
  };
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

  return (
    <>
      <Head>
        <title>PatienPortal</title>
        <meta name="description" content="Patient Portal" />
        <meta property="og:title" content="MedResourceConnect" />
        <meta property="og:type" content="website" />

        <meta
          property="og:image"
          content="https://res.cloudinary.com/dyrev28qc/image/upload/v1688187311/MedResourceConnect_jsvkul.png"
        />
      </Head>

      <div className="flex justify-center">
        {isAddProviderOpen && (
          <Modal
            show={isAddProviderOpen}
            fragment={Fragment}
            closeModal={closeAddProvider}
          >
            <div>
              <AddProviderForm
                closeModal={closeAddProvider}
                session={session}
              />
            </div>
          </Modal>
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
                {/* //sort ProviderData by list order when list order is avail other wise make list order 0 and list by startDate dess  */}
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

        {isAddInstitutionOpen && (
          <Modal
            show={isAddInstitutionOpen}
            fragment={Fragment}
            closeModal={closeInstitutionModal}
          >
            <div>
              <AddInstitutionForm
                closeModal={closeInstitutionModal}
                session={session}
              />
            </div>
          </Modal>
        )}
        {isModalOpen && (
          <Modal show={isModalOpen} fragment={Fragment} closeModal={closeModal}>
            <TagLegendCard tagType="Institution Tags" />
          </Modal>
        )}
        {isProvidersModalOpen && (
          <Modal
            show={isProvidersModalOpen}
            fragment={Fragment}
            closeModal={closeAddProvider}
          >
            <TagLegendCard tags={providersTagsMock} tagType="Provider Tags" />
            <div className="mt-4 flex flex-row">
              <BuildingOfficeIcon className="h-8 w-8 ml-1 text-blue-400" />{" "}
              <p className="text-sm flex self-center"></p>
            </div>
          </Modal>
        )}
        <main className="flex flex-col p-10 bg-slate-50 justify-center items-center md:w-[80%] w-full">
          <h1 className="md:text-6xl w-full text-3xl mx-auto text-center p-2 font-semibold">
            Since last login
          </h1>

          <div className="mt-5 w-full flex justify-center ">
            <div className="flex overflow-auto">
              <div className="grid grid-flow-col gap-4 auto-cols-max group overflow-auto">
                {diagnoses
                  ?.filter(
                    (d) =>
                      d.status === "active" &&
                      d.category !== "allergy" &&
                      new Date(d.createdAt) > new Date(lastLogin)
                  )
                  .map((diagnosis, index) => (
                    <Link
                      target="_blank"
                      href={`/diagnoses/${diagnosis.id}`}
                      key={diagnosis.id}
                      className={`p-2 ${getColorClass(
                        diagnosis.title
                      )} rounded-sm truncate text-xs text-center cursor-pointer text-white`}
                    >
                      {diagnosis.title}
                    </Link>
                  ))}
              </div>
            </div>
          </div>
          {diagnoses?.filter(
            (d) =>
              d.status === "active" &&
              d.category === "allergy" &&
              new Date(d.createdAt) > new Date(lastLogin)
          ).length > 0 && (
              <div className="inline-block w-full pl-4">
                <h4 className="text-left w-full mb-2 text-2xl font-semibold mt-10">
                  Allergies
                </h4>
                <div className="grid grid-flow-col gap-4 auto-cols-max">
                  {diagnoses
                    ?.filter(
                      (d) =>
                        d.status === "active" &&
                        d.category === "allergy" &&
                        new Date(d.createdAt) > new Date(lastLogin)
                    )
                    .map((diagnosis, index) => (
                      <Link
                        target="_blank"
                        href={`/diagnoses/${diagnosis.id}`}
                        key={diagnosis.id}
                        className={`p-2 ${diagnosis.type === "mild"
                          ? "bg-yellow-200 text-slate-600  "
                          : diagnosis.type === "moderate"
                            ? "bg-orange-400 text-white"
                            : "bg-red-600 text-white"
                          }  rounded-sm truncate text-xs text-center cursor-pointer`}
                      >
                        <div>
                          {diagnosis.title}
                          <span className="italic text-xxs">
                            ({diagnosis.type})
                          </span>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            )}

          {version !== "oncology" && <Sequencing isAdmin={isAdmin} version={version} />}

          {version === "oncology" || version === "emergency" || version === "admin" ? (
            <>
              <ResearchHighlights
                appointments={sortedAppointments}
                timelineEvents={sortedTimelineEvents}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                lastLogin={lastLogin}
              />
            </>
          ) : null}

          <div className="flex flex-row mt-20 w-full">
            <h1 className="text-left text-2xl font-semibold pl-2 mb-4">
              Research Interests / Notes
            </h1>
          </div>

          <div class="w-full">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {filteredResearchInterests
                ?.slice(0, 3)
                .map((researchInterest) => {
                  return (
                    <ResearchCard
                      key={researchInterest.id}
                      researchInterest={researchInterest}
                    />
                  );
                })}
            </div>

            <div className="text-right w-full p-2 mt-4 text-sm text-blue-700 font-semibold">
              <button onClick={() => setIsInterestsOpen(true)}>
                ({filteredResearchInterests?.length}) View all research
                interests{" "}
              </button>
            </div>
          </div>

          {isInterestsOpen && (
            <div>
              <Modal
                show={isInterestsOpen}
                fragment={Fragment}
                closeModal={closeInterestsTable}
              >
                <div className="mb-10">
                  <h1 className="text-center md:text-left sm:text-xl text-md p-2 font-semibold mb-2">
                    Full Research Interests List{" "}
                  </h1>
                  <ResearchTable research={filteredResearchInterests} />
                </div>
              </Modal>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}

export const linkColumns = [
  {
    header: "Title",
    key: "title",
    link: true,
    href: "/research-interests/",
  },

  {
    header: "Category",
    key: "category",
  },
  {
    header: "Description",
    key: "description",
  },
  {
    header: "Notes",
    key: "notes",
  },
  {
    header: "Link",
    key: "link",
  },
];

// Home.getInitialProps = async ({ query }) => {
//   return {
//     type: query.type,
//     props: {
//       organizations: organizationsMock,
//     },
//   };
// };

const getColorClass = (itemType, selectedItem) => {
  let baseColors = {
    "Metastatic Oncocytoma": "bg-red-400 opacity-60",
    "Von Willebrand Disease": "bg-blue-500 opacity-50",
    "Bladder Polyp": "bg-indigo-500 text-slate-900 opacity-60",
    "General Health": "bg-green-500 opacity-50",
    "Kidney Function": "bg-purple-500 opacity-50",
    "Skin Screening": "bg-pink-500 opacity-50",
    "Postural Orthostatic Tachycardia Syndrome": "bg-gray-600 opacity-50",
  };
  let colorClass = baseColors[itemType] || "bg-gray-400";

  if (itemType === "diagnosis") {
    if (selectedItem && selectedItem.status !== "active") {
      colorClass += " bg-opacity-50";
    } else {
      colorClass += "  border-green-400 border-4 border-opacity-70";
    }
  }

  return colorClass;
};
