import React, { useEffect, useState } from "react";

import { useRouter } from "next/router";
import {
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  PhoneIcon,
  PhoneXMarkIcon,
  PrinterIcon,
} from "@heroicons/react/20/solid";
import Relations from "@/components/timeline/Relations";
import {
  useImaging,
  useInstitution,
  useInterventions,
  useAppointments,
  useProviders,
} from "@/hooks/api";
import Link from "next/link";
import { usePatientContext } from "@/components/context/PatientContext";
import AddInstitutionForm from "@/components/forms/AddInstitutionForm";
import { useUser } from "@clerk/clerk-react";

const Institution = () => {
  const router = useRouter();
  const institutionId = router.query.id;
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [editing, setEditing] = useState(false);
  const { patientId } = usePatientContext();
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
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


  const { data: imaging } = useImaging(
    { id: patientId }
  );

  const { data: interventions } = useInterventions(
    { id: patientId }
  );

  const { data: providers } = useProviders(
    { id: patientId }
  );

  const filteredScans = imaging?.filter(
    (scan) => scan?.institution[0]?.id === institutionId
  );

  const { data: appointments } = useAppointments(
    { id: patientId }
  );



  useEffect(() => {
    if (appointments) {
      const filtAppts = appointments?.filter(
        (appt) => appt?.institutionId === institutionId
      );
      setFilteredAppointments(filtAppts);
    }
  }, [appointments]);

  const {
    data: institutionData,
    isLoading,
    isError,
  } = useInstitution(institutionId, patientId, {
    enabled: !!institutionId,
  });

  //Interventions
  const filteredInterventions = interventions?.filter(
    (intervention) => intervention.institutionId === institutionId
  );

  //Providers
  const filteredProviders = providers?.filter(
    (provider) => provider.institutions[0]?.institutionId === institutionId
  );

  return (
    <div className="mx-auto w-[80%] pt-20">
      {isAdmin && (
        <div className={`w-full ${editing ? 'p-4' : ''}`}>
          <button onClick={() => setEditing(!editing)} className="text-slate-700 text-sm font-medium mb-4">
            {editing ? "Back" : "Edit Institution"}
          </button>
        </div>
      )}
      {
        editing ? (
          <div className="p-4 mx-auto">
            <AddInstitutionForm institutionDetails={institutionData} mode="editing" setEditing={setEditing} />
          </div>
        ) : (
          <div>
            <div className="bg-slate-200 rounded-sm p-4">
              <div className="flex flex-row justify-between">
                <div className="flex flex-col">
                  <div className="flex flex-row">
                    <div className="flex col-span-1 mr-4 aspect-w-1 aspect-h-1 overflow-hidden self-center h-full md:h-20 lg:h-20 xl:h-full pb-4">
                      <img
                        className={
                          !!institutionData?.image
                            ? "object-fit rounded-sm mr-5 self-center w-32"
                            : "opacity-30 object-fit rounded-sm self-center w-32"
                        }
                        src={
                          !!institutionData?.image
                            ? institutionData?.image
                            : "/img/emptyInstitution.png"
                        }
                        alt="institution picture"
                      />
                    </div>

                    <div className="flex-row flex">
                      <div>
                        <div className="flex flex-row">
                          <h2 className="font-bold text-3xl">{`${institutionData?.title}`}</h2>
                        </div>

                        <div className="text-xl font-medium">{`${institutionData?.city}, ${institutionData?.state}`}</div>
                        <div className="text-sm text-slate-500 mt-[-2px] italic">
                          {institutionData?.address_1}, {institutionData?.address_2}{" "}
                          {institutionData?.city}, {institutionData?.state}{" "}
                          {institutionData?.country} {institutionData?.postal}
                        </div>
                        <div className="text-slate-500">{`${institutionData?.title}`}</div>

                        <div className="text-lg font-semibold">
                          Medical Records Office:{" "}
                          <div className="flex flex-row">
                            <div className="text-lg font-semibold flex flex-row mt-1 mr-4">
                              <EnvelopeIcon className="w-5 h-5 inline-block mr-2 text-blue-900" />
                              <div className="font-normal text-sm self-center text-blue-900">{`${institutionData?.recordsOfficeEmail ?? ""
                                }`}</div>
                            </div>
                            <div className="text-lg font-semibold flex flex-row mt-1 mr-4">
                              <PhoneIcon className="w-5 h-5 inline-block mr-1 text-blue-900" />
                              <div className="font-normal text-sm self-center text-blue-900">{`${institutionData?.recordsOfficePhone ?? "(---) --- ----"
                                }`}</div>
                            </div>
                            {institutionData?.cell &&
                              institutionData?.cell !== "" && (
                                <div className="text-lg font-semibold flex flex-row mt-1 mr-4">
                                  <DevicePhoneMobileIcon className="w-5 h-5 inline-block mr-1 text-blue-900" />
                                  <div className="font-normal text-sm self-center text-blue-900">{`${institutionData?.cell ?? ""
                                    }`}</div>
                                </div>
                              )}
                          </div>
                        </div>
                        <div className="text-sm mt-2">
                          <span className="font-normal italic">
                            Notes: {`${institutionData?.notes ?? "N/A"}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row h-10">
                  <span
                    className={`${institutionData?.status === "active"
                      ? "bg-green-400"
                      : "bg-red-300"
                      } capitalize p-2 rounded ml-5 font-bold w-20 text-center text-white`}
                  >
                    {institutionData?.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-700 opacity-80 text-center text-white pb-4 pt-2 pl-4 pr-2">
              <div className="w-full text-left font-semibold text-semibold">
                Manages:
              </div>
              <div className="grid grid-cols-5 gap-2">
                {institutionData?.diagnoses
                  ?.filter((d) => d.category !== "allergy")
                  ?.map((diagnosis) => (
                    <a
                      className={`text-white mt-1 rounded-sm opacity-90 bg-blue-600 font-medium p-1 text-center`}
                      href={`/diagnoses/${diagnosis?.id}`}
                      target="_blank"
                    >
                      {diagnosis?.title}
                    </a>
                  ))}
              </div>
              {filteredProviders?.length > 0 && (
                <>
                  <div className="w-full text-left font-semibold text-semibold mt-2">
                    Providers:
                  </div>
                  <div className="text-xs mb-1 grid grid-cols-6 gap-2 text-gray-600">
                    {filteredProviders
                      ?.sort((a, b) => {
                        return a.listOrder !== null && b.listOrder !== null
                          ? a.listOrder - b.listOrder
                          : a.listOrder !== null
                            ? -1
                            : 1;
                      })
                      .map((provider, index) => (
                        <Link
                          href={`/providers/${provider?.providerId}`}
                          target="_blank"
                        >
                          <div
                            className={`rounded-sm text-center pb-2 capitalize bg-slate-200  flex flex-col cursor-pointer`}
                            key={provider?.id}
                          >
                            <div className="text-slate-900 font-semibold w-full mt-1 text-center">
                              {provider.firstName} {provider.lastName}{" "}
                              {provider.designation}
                              <span className="text-base">
                                {provider.primaryContact ? " *" : null}
                              </span>
                            </div>
                            <div className="text-slate-900 line-clamp-1 mt-[-6px] overflow-auto">
                              {provider.role}
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-row pb-10">
              <Relations
                imaging={filteredScans}
                appointments={filteredAppointments}
                interventions={filteredInterventions}
              />
            </div>
          </div>
        )}
    </div>

  );
};

export default Institution;
