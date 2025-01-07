import React, { use, useEffect, useState } from "react";
import { formatDate, listWithCommas } from "@/utils/helpers";
import { useRouter } from "next/router";
import {
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  PhoneIcon,
  PhoneXMarkIcon,
  PrinterIcon,
} from "@heroicons/react/20/solid";
import ContactInfo from "@/components/common/ContactInfo";
import Relations from "@/components/timeline/Relations";
import PubMedArticles from "@/components/PubMedArticles";
import {
  useAppointmentById,
  useAppointments,
  useFetchArticles,
  useProviderById,
} from "@/hooks/api";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import {
  useProvider,
  useProviderDiagnoses,
  useImaging,
  useInterventions,
  useMedications,
} from "@/hooks/api";
import Spinner from "@/components/common/Spinner";
import { usePatientContext } from "@/components/context/PatientContext";
import AddProviderForm from "@/components/AddProviderForm";
import { useUser } from "@clerk/clerk-react";

const Provider = () => {
  const router = useRouter();
  const [isArticlesOpen, setIsArticlesOpen] = useState(false);
  const providerID = router.query.id;
  const [filteredScans, setFilteredScans] = useState([]);
  const [filteredInterventions, setFilteredIntervenions] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [queryOptions, setQueryOptions] = useState([]);
  const [editing, setEditing] = useState(false);
  const [providerDetails, setProviderDetails] = useState();
  const [articles, setArticles] = useState();
  const [pubMedUrl, setPubMedUrl] = useState();
  const { patientId } = usePatientContext();
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useUser();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  const isEmailMatch = () => {
    return user?.emailAddresses.some(
      (emailObj) => emailObj.emailAddress === adminEmail
    );
  };

  useEffect(() => {
    if (!user) return;

    if (user?.emailAddresses) {
      setIsAdmin(isEmailMatch());
    }
  }, [user]);


  const {
    data: provider,
    isLoading: isLoadingProvider,
    isError,
  } = useProviderById({ providerID, patientId }, {
    enabled: !!providerID, // The query will run only when providerID is available
  });

  const { data: diagnoses } = useProviderDiagnoses({ providerID, patientId }, {
    enabled: !!providerID,
  });

  const { data: imaging, isLoading } = useImaging(
    { id: patientId }
  );

  const { data: interventions } = useInterventions(
    { id: patientId }
  );

  const { data: medications } = useMedications(
    { id: patientId }
  );

  const { data: appointments } = useAppointments(
    { id: patientId }
  );

  useEffect(() => {
    if (imaging && interventions) {
      const filteredScans = imaging?.filter((scan) => {
        if (!scan?.orderingProvider) return false;
        return scan.orderingProvider[0].id === providerID;
      });

      setFilteredScans(filteredScans);

      const filteredInterventions = interventions?.filter((intervention) =>
        intervention?.providers?.some((provider) => provider?.id === providerID)
      );

      setFilteredIntervenions(filteredInterventions);

      const filteredMedications = medications?.filter((medication) => {
        if (
          !medication.prescribingProvider &&
          medication.prescribingProvider.length < 1
        )
          return false;
        return medication?.prescribingProvider[0]?.id === providerID;
      });

      setFilteredMedications(filteredMedications);
    }
  }, [imaging, provider, medications]);

  useEffect(() => {
    if (!provider) return;
    const providerNameString = `${provider.firstName} ${provider.lastName}`;

    const queryOptions = [
      {
        field: "Author",
        value: providerNameString,
        tags: [],
      },
    ];
    setQueryOptions(queryOptions);
  }, [provider]);

  const { data } = useFetchArticles(queryOptions);

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  useEffect(() => {
    if (!data) return;
    const filteredArticles = data.articles?.filter((article) => {
      // filter to first and last authors
      if (article?.authors?.length > 0 && article?.authors[0]) {
        const middleInitial = provider.middleinitial
          ? provider.middleinitial
          : "";
        const firstAuthorLastNameCheck =
          article?.authors[0].lastName === provider?.lastName;
        const firstAuthorlastNamePlusMiddleInitialCheck =
          article?.authors[0].lastName ===
          provider?.lastName + " " + middleInitial;
        const lastAuthorLastNameCheck =
          article?.authors[article?.authors.length - 1].lastName ===
          provider?.lastName;
        const lastAuthorlastNamePlusMiddleInitialCheck =
          article?.authors[article?.authors.length - 1].lastName ===
          provider?.lastName + " " + middleInitial;

        return (
          firstAuthorLastNameCheck ||
          firstAuthorlastNamePlusMiddleInitialCheck ||
          lastAuthorLastNameCheck ||
          lastAuthorlastNamePlusMiddleInitialCheck
        );
      }
    });

    filteredArticles?.length === 0
      ? setFilteredArticles(data.articles)
      : setFilteredArticles(filteredArticles);

    setPubMedUrl(data.queryUrl);
  }, [data]);

  useEffect(() => {
    if (!provider || !diagnoses) return;
    setProviderDetails({ ...provider, diagnoses: diagnoses });
  }, [diagnoses])

  useEffect(() => {
    if (!appointments) return;
    const filterAppointments = appointments?.filter((appt) => {
      if (!appt.providers && appt.providers.length < 1) return false;
      return appt?.providers[0]?.id === providerID;
    });

    setFilteredAppointments(filterAppointments);
  }, [appointments]);

  useEffect(() => {
    if (isError) {
      router.push("/404");
    }
  }, [isError]);


  if (isLoadingProvider) {
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
    <div className="mx-auto w-[80%] pt-20 ">
      {isAdmin && (
        <div className={`w-full ${editing ? ' p-4' : ''}`}>
          <button onClick={() => setEditing(!editing)} className="text-slate-700 text-sm font-medium mb-4">
            {editing ? "Back" : "Edit Provider"}
          </button>
        </div>)}

      {
        editing ? (
          <div className="p-4 mx-auto ">
            <AddProviderForm providerAdded={providerDetails} mode="editing" />
          </div>
        ) : (

          <div className="w-full">
            <div className="bg-slate-200 rounded-sm p-4">
              <div className="flex sm:flex-row flex-col justify-between">
                <div className="flex flex-col">
                  <div className="flex sm:flex-row flex-col">
                    <div className="flex col-span-1 aspect-w-1 aspect-h-1 overflow-hidden self-center max-h-40 w-32">
                      <img
                        className={
                          provider?.image
                            ? "object-fit rounded-sm self-center "
                            : "opacity-30 object-fit rounded-sm self-center"
                        }
                        src={
                          provider?.image
                            ? provider?.image
                            : "/img/emptyProfilePhoto.png"
                        }
                        alt="profile picture"
                      />
                    </div>

                    <div className="flex-row flex ml-4 w-5/6">
                      <div>
                        <div className="flex sm:flex-row flex-col w-full sm:w-full">
                          <h2 className="font-bold text-3xl w-full">{`${provider?.firstName} ${provider?.lastName} ${provider?.designation}`}</h2>
                          <div className="sm:ml-6 mt-1 w-full grid grid-cols-1 md:grid-cols-2 gap-2 ">
                            {diagnoses?.length > 0 && (

                              diagnoses?.map((diagnosis, index) => {
                                return (
                                  <div className="bg-blue-500 p-2 col-span-1 rounded text-white self-center flex">
                                    <a
                                      target="_blank"
                                      href={`/diagnoses/${diagnosis.id}`}
                                      key={index}
                                      className="text-white text-xs self-center text-center w-full"
                                    >
                                      {diagnosis.title}
                                    </a>
                                  </div>
                                );
                              })

                            )}
                          </div>
                        </div>
                        {provider?.institutions &&
                          provider?.institutions?.length > 0 && (
                            <a
                              className="text-xl font-medium text-blue-800"
                              href={
                                provider?.institutions
                                  ? `/institutions/${provider?.institutions[0].institutionId}`
                                  : ""
                              }
                              target="_blank"
                            >
                              {provider?.institutions[0].institutionName}
                            </a>
                          )}

                        <div className="text-sm text-slate-500 mt-[-2px] italic">
                          {/* {provider?.institution.address1},{" "}
                    {provider?.institution.address2}{" "}
                    {provider?.institution.city}, {provider?.institution.state},{" "}
                    {provider?.institution.country}{" "}
                    {provider?.institution.postal} */}
                        </div>
                        <div className="text-slate-500">{`${provider?.title}`}</div>

                        <div className="text-lg font-semibold w-full">
                          Role:{" "}
                          <span className="font-normal w-full">{`${provider?.role}`}</span>
                        </div>
                        <div className="text-sm w-full sm:w-full">
                          <div className="font-normal italic line-clamp-6 overflow-auto">{`Notes: ${provider?.notes}`}</div>
                        </div>
                        <div className="flex sm:flex-row flex-col">
                          <div className="text-lg font-semibold flex flex-row mt-1 mr-4">
                            <EnvelopeIcon className="w-5 h-5 inline-block mr-2 text-blue-900" />
                            <div className="font-normal text-sm self-center text-blue-900">{`${provider?.email ?? ""
                              }`}</div>
                          </div>
                          <div className="text-lg font-semibold flex flex-row mt-1 mr-4">
                            <PhoneIcon className="w-5 h-5 inline-block mr-1 text-blue-900" />
                            <div className="font-normal text-sm self-center text-blue-900">{`${provider?.phone}`}</div>
                          </div>
                          <div className="text-lg font-semibold flex flex-row mt-1 mr-4">
                            <PrinterIcon className="w-5 h-5 inline-block mr-1 text-blue-900" />
                            <div className="font-normal text-sm self-center text-blue-900">{`${provider?.fax}`}</div>
                          </div>
                          {provider?.cell && provider?.cell !== "" && (
                            <div className="text-lg font-semibold flex flex-row mt-1 mr-4">
                              <DevicePhoneMobileIcon className="w-5 h-5 inline-block mr-1 text-blue-900" />
                              <div className="font-normal text-sm self-center text-blue-900">{`${provider?.cell}`}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row h-10">
                  <span
                    className={`${provider?.status === "active" ? "bg-green-400" : "bg-red-200"
                      } capitalize p-2 rounded ml-5 font-bold w-20 text-center text-white`}
                  >
                    {provider?.status}
                  </span>
                </div>
              </div>
            </div>
            <ContactInfo provider={provider} contactType={"provider"} />
            <div className="flex flex-row">
              <Relations
                imaging={filteredScans}
                medications={filteredMedications}
                appointments={filteredAppointments}
                interventions={filteredInterventions}
              />
            </div>

            <div
              className="font-semibold text-xl mt-5 flex justify-between items-center cursor-pointer pb-10"
              onClick={() => setIsArticlesOpen(!isArticlesOpen)}
            >
              <div className="flex flex-row">
                PubMed Articles
                {!filteredArticles || filteredArticles?.length < 1 ? (
                  <Spinner />
                ) : (
                  <span className="text-slate-500 text-base self-center ml-1">
                    ({filteredArticles?.length})
                  </span>
                )}
              </div>
              <span>
                {isArticlesOpen ? (
                  <ChevronUpIcon className="h-6 w-6 text-black" />
                ) : (
                  <ChevronDownIcon className="h-6 w-6 text-black" />
                )}
              </span>{" "}
            </div>
            {isArticlesOpen && (
              <div className="pb-20">
                <PubMedArticles articles={filteredArticles} />
              </div>
            )}

            {/* {articles ? <PubMedArticles articles={filteredArticles} /> : null} */}
          </div>
        )}
    </div>
  );
};

export default Provider;
