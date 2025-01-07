import React, { useState, useEffect, Fragment, use } from "react";
import Research from "@/components/Research";
import {
  useFetchArticles,
  useTissue,
  useClinicalTrials,
  useResearchInterests,
} from "@/hooks/api";
import { Footer } from "@/components/HomePage/Footer";
import BasicTable from "@/components/tables/BasicTable";
import { researchCategories, sortDataByDate, statuses } from "@/utils/helpers";
import ResearchCard from "@/components/cards/ResearchCard";
import { PlusCircleIcon } from "@heroicons/react/20/solid";
import { useSession } from "@clerk/nextjs";
import Modal from "@/components/Modal";
import ResearchInputForm from "@/components/forms/ResearchInputForm";
import { useUser } from "@clerk/clerk-react";
import ResearchTable from "@/components/tables/ResearchTable";
import { usePatientContext } from "@/components/context/PatientContext";

const ResearchPage = ({ version, isEditing }) => {
  const { user } = useUser();
  const queryOptions = [
    {
      field: "Title",
      value: "Oncocytoma",
      tags: [],
    },
    {
      field: "Title",
      value: "Chromophobe",
      tags: [],
    },
    {
      field: "Title",
      value: "Metastatic Oncocytoma",
      tags: [],
    },
  ];

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  const { patientId } = usePatientContext();
  const [isAddResearchOpen, setIsAddResearchOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const { data } = useFetchArticles(queryOptions);
  const [articles, setArticles] = useState();
  const [pubMedUrl, setPubMedUrl] = useState();
  const { data: trials } = useClinicalTrials();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInterestsOpen, setIsInterestsOpen] = useState(false);
  const [filteredResearchInterests, setFilteredResearchInterests] = useState(
    []
  );
  const { data: researchInterests } = useResearchInterests(
    {
      id: patientId,
    }
  );

  const { data: tissue } = useTissue(
    { id: patientId }
  );

  const closeModal = () => {
    setIsModalOpen(false);
  };

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
    if (data) {
      setArticles(data.articles);
      setPubMedUrl(data.queryUrl);
    }
  }, [data]);

  useEffect(() => {
    // Simulate delay for fetching data
    // const delay = setTimeout(() => {
    //   setIsLoading(false);
    // }, 3250);
    if (articles) {
      setIsLoading(false);
    }
  }, [articles]);

  const columns = [
    {
      key: "conditions",
      header: "Conditions",
    },
    {
      key: "phase",
      header: "Phase",
    },

    {
      key: "status",
      header: "Status",
    },
    {
      key: "briefTitle",
      header: "Title",
    },
    {
      key: "location",
      header: "Location",
    },
    {
      key: "dateAdded",
      header: "Date Added",
    },
    {
      key: "link",
      header: "Link",
    },
  ];

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

  const submitResearch = (data) => {
    const payload = {
      data,
      session,
    };
    mutate(payload, {
      onSuccess: (data) => {
        // setIsToggled(!isToggled);
        queryClient.invalidateQueries("research");
      },
    });
  };

  const closeInterestsTable = () => {
    setIsInterestsOpen(false);
  };

  return (
    <div className="flex justify-center w-full">
      <main className="flex flex-col bg-slate-50 justify-center items-center md:w-[70%] w-5/6">
        <h1 className="text-5xl font-semibold text-slate-900 w-full mt-14 md:text-left ">
          Research
        </h1>
        {isModalOpen && (
          <Modal show={isModalOpen} fragment={Fragment} closeModal={closeModal}>
            <ResearchInputForm
              closeModal={closeModal}
              addLabs={submitResearch}
              statuses={statuses}
              researchCategories={researchCategories}
            />
          </Modal>
        )}

        {articles && pubMedUrl ? (
          <Research
            version={version}
            // medications={medications}
            articles={articles}
            pubMedUrl={pubMedUrl}
            // trialData={trialData}
            tissue={tissue ?? []}
            isEditing={isEditing}
          />
        ) : null}

        <div className="flex flex-row mt-20 w-full">
          <h1 className="text-left text-2xl font-semibold pl-2">
            Research Interests / Notes
          </h1>

          {session && isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              type="button"
              className="rounded-full self-center  p-1 text-white shadow-sm"
            >
              <PlusCircleIcon
                className="h-6 w-6 text-blue-500 pl-1 hover:text-blue-600"
                aria-hidden="true"
              />
            </button>
          )}
        </div>
        <div className="mb-15 mt-7 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {filteredResearchInterests.slice(0, 3)?.map((researchInterest) => {
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
              ({filteredResearchInterests?.length}) View all research interests{" "}
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

        <div className="w-full">
          <h1 className="text-left w-full text-2xl font-semibold mt-12 pl-2">
            Clinical Trials
          </h1>
          <p className="text-sm text-left w-full mb-4 pl-2">
            Clincial trials for non-clear cell renal cell carcinoma
          </p>
          <BasicTable
            data={sortDataByDate(trials)}
            columns={columns}
            isClinicalTrial={true}
          />
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default ResearchPage;
