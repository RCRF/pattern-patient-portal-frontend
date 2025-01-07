"use client";
import { React, useState, useEffect, Fragment, useRef } from "react";
import ResearchHighlights from "../components/ResearchHighlights";

import DocumentsCard from "@/components/cards/DocumentsCard";
import AddProviderForm from "@/components/AddProviderForm";
import { useDiagnoses, useImportantDocuments, usePatient } from "@/hooks/api";
import TagLegendCard from "@/components/TagLegendCard";
import Modal from "@/components/Modal";
import { Footer } from "@/components/HomePage/Footer";
import Head from "next/head";
import { useSession, useUser } from "@clerk/nextjs";
import { PlusCircleIcon } from "@heroicons/react/20/solid";

import { useQueryClient, useQuery } from "react-query";
import { colorLookup } from "@/utils/helpers";

import Link from "next/link";
import Sequencing from "@/components/Sequencing";
import { sortByListOrderAndStatus, calculateAge } from "@/utils/helpers";
import { useRouter } from "next/router";
import { usePatientContext } from "@/components/context/PatientContext";
import DiagnosesTable from "@/components/tables/DiagnosesTable";

export default function Home({ version, setVersion, isEditing, setIsEditing }) {
  const { session } = useSession();
  const router = useRouter();
  const { user } = useUser();
  const { patientId } = usePatientContext();
  const [lastLogin, setLastLogin] = useState(null);
  const [isDiagnosesOpen, setIsDiagnosesOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  const isEmailMatch = () => {
    return user?.emailAddresses.some(
      (emailObj) => emailObj.emailAddress === adminEmail
    );
  };

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

  useEffect(() => {
    if (!user) return;
    setLastLogin(user.lastSignInAt);


    if (user?.emailAddresses) {
      setIsAdmin(isEmailMatch());
    }
  }, [user]);

  const queryClient = useQueryClient();

  const { data: diagnoses, isLoading, isError } = useDiagnoses({ id: patientId });
  const { data: documents } = useImportantDocuments({
    id: patientId,
  });
  const { data: patient } = usePatient({ id: patientId });

  const [isModalOpen, setIsModalOpen] = useState(false);


  const [isAddProviderOpen, setIsAddProviderOpen] = useState(false);
  // const [isLoading, setIsLoading] = useState(true);
  const [isAddInstitutionOpen, setIsAddInstitutionOpen] = useState(false);

  // useEffect(() => {
  //   const delay = setTimeout(() => {
  //     setIsLoading(false);
  //   }, 1250);
  //   return () => clearTimeout(delay);
  // }, []);

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

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeInstitutionModal = () => {
    setIsAddInstitutionOpen(false);
  };

  const closeAddProvider = () => {
    setIsAddProviderOpen(false);
  };

  const closeDiagnoses = () => {
    setIsDiagnosesOpen(false);
  }

  useEffect(() => {
    if (isError) {
      router.push("/404");
    }
  }, [isError]);


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
        {patientId}
        <meta name="description" content="Patient Portal" />
        <meta property="og:title" content="MedResourceConnect" />
        <meta property="og:type" content="website" />

        <meta
          property="og:image"
          content="https://res.cloudinary.com/dyrev28qc/image/upload/v1688187311/MedResourceConnect_jsvkul.png"
        />
      </Head>

      <div className="flex justify-center">

        {isDiagnosesOpen && (
          <Modal
            show={isDiagnosesOpen}
            fragment={Fragment}
            closeModal={closeDiagnoses}
          >
            <div>
              <div className="mb-10">
                <h1 className="text-center md:text-left sm:text-2xl text-md p-2 font-semibold mb-2">
                  Full Diagnoses List{" "}
                </h1>

                <DiagnosesTable
                  diagnoses={diagnoses}
                  modal={true}
                  isAdmin={session?.isAdmin ?? false}
                  isEditing={true}
                />
              </div>
            </div>
          </Modal>
        )}



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

        <main className="flex flex-col p-10 bg-slate-50 justify-center items-center md:w-[80%] w-full">
          <h1 className="md:text-6xl w-full text-3xl mx-auto p-2 text-center font-semibold">
            {/* todo: check for admin before linking to profile  */}
            <Link href={"/profile"}>{patient?.firstName} {patient?.lastName}</Link>
          </h1>

          <h4>Age: {calculateAge(new Date(patient?.dob).toLocaleDateString())}</h4>
          {version === "oncology" || version === "emergency" &&
            <h5 className="text-xs font-light flex flex-row w-1/3 group  mx-auto">
              <div className="flex flex-row w-full justify-center">
                <div
                  className="absolute hidden mb-2 group-hover:block ml-2 mt-5 text-left w-80 
                         text-slate-800 text-sm p-3 flex-wrap bg-white border border-slate-100 rounded-sm shadow-md
                        whitespace-normal z-50
                        overflow-hidden"
                >
                  <div className="flex flex-col gap-1 text-sm">
                    <div>Relation: {patient?.emergencyContactRelation}</div>
                    <div>Phone: {patient?.emergencyContactPhone}</div>
                    <div>Email: {patient?.emergencyContactEmail}</div>
                  </div>
                </div>
                <div>Emergency Contact: </div>
                <div className="text-blue-500 ml-1">
                  {patient?.emergencyContactName}{" "}
                </div>
              </div>
            </h5>
          }

          <div className="mt-5 w-full flex justify-center">
            <div className="flex overflow-auto">
              <div className="grid grid-flow-col gap-4 auto-cols-max group overflow-auto">
                {diagnoses
                  ?.filter(
                    (d) => d.category !== "allergy" && d.highlighted === true
                  )
                  .map((diagnosis, index) => (
                    <Link
                      target="_blank"
                      href={`/diagnoses/${diagnosis.id}`}
                      key={diagnosis.id}
                      className={`p-2 ${diagnosis.status === "active" ? colorLookup[diagnosis.color] : 'bg-gray-600 opacity-30'} rounded-sm truncate text-xs text-center cursor-pointer text-white`}
                    >
                      {diagnosis.title}
                    </Link>
                  ))}
              </div>
            </div>
          </div>

          <div className="w-full flex flex-row justify-center mt-4">
            <button className="flex self-center justify-center  text-sm text-blue-300 hover:text-blue-700" onClick={() => setIsDiagnosesOpen(!isDiagnosesOpen)} >
              ({diagnoses?.length}) View all diagnoses
            </button>
            <div>
              {isAdmin && version === "admin" && (
                <a href="/diagnoses/create" className="rounded  text-xs ml-2 h-7 p-2 text-white bg-blue-600 shadow-sm h-7 self-center" target="_blank">
                  Add
                </a>
              )}
            </div>
          </div>



          <div className="inline-block w-full">
            <h4 className="text-left w-full mb-2 text-3xl font-semibold mt-20">
              Allergies
            </h4>
            <div className="grid grid-flow-col gap-4 auto-cols-max">
              {diagnoses
                ?.filter(
                  (d) => d.status === "active" && d.category === "allergy"
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
                        {" "}({diagnosis.type})
                      </span>
                    </div>
                  </Link>
                ))}

              <span className="lowercase text-sm text-gray-400">{diagnoses?.filter((d) => d.status === "active" && d.category === "allergy"
              ).length < 1 ? "(no allergies listed)" : ""}</span>
            </div>
          </div>

          <div className="w-full">
            <h1 className="text-left w-full p-4 pl-0 text-3xl font-semibold mt-5">
              Summary
            </h1>
            <div className="text-left w-full">
              <p>{patient?.summary}</p>
            </div>
          </div>

          {/* {version !== "research" && <Sequencing />} */}


          <div className="mx-auto w-full">
            <ResearchHighlights
              version={version}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
            />
          </div>


          <h1 className="text-left w-full p-4 text-3xl font-semibold mt-20">
            Important Documents
          </h1>
          <div className="grid sm:grid-cols-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 w-full gap-4">
            {documents?.map((organization, index) => (
              <DocumentsCard
                className="shadow-md"
                key={index}
                document={organization}
              />
            ))}
          </div>

          {/* <h1 className="text-left w-full p-4 text-2xl font-semibold mt-16">
            Resources / Webinars / Videos
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 grid-rows-[1fr] w-full">
            {resources?.map((resource, index) => (
              <ResourceCard
                className="shadow-md"
                key={index}
                resource={resource}
                isActive={false}
              />
            ))}
          </div> */}
        </main>
      </div>
      <Footer />
    </>
  );
}

// Home.getInitialProps = async ({ query }) => {
//   return {
//     type: query.type,
//     props: {
//       organizations: organizationsMock,
//     },
//   };
// };
