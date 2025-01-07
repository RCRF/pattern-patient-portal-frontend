import React, { useEffect, useState, Fragment } from "react";
import InterventionDetails from "@/components/timeline/InterventionDetails";
import { useRouter } from "next/router";
import { updateInterventionLinksPATCH, useInstitutions, useIntervention, useProviders } from "@/hooks/api";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import AddInterventionForm from "@/components/forms/AddInterventionForm";
import Modal from "@/components/Modal";
import { useForm, Controller } from "react-hook-form";
import { ControlledMultiSelectTypeahead } from "../common/ControlledMultiSelectTypeAhead";
import { useMutation, useQueryClient } from "react-query";
import { useAuth } from "@clerk/nextjs";
import { toast } from "react-hot-toast";
import { usePatientContext } from "@/components/context/PatientContext";




const LinkOptions = ({ currentProviders, closeModal, sourceComponent }) => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const { getToken } = useAuth();
    const interventionId = router.query.id;
    const [editing, setEditing] = useState(false);
    const [providersList, setProvidersList] = useState([]);
    const [currentProvidersList, setCurrentProvidersList] = useState([]);
    const [institutionsList, setInstitutionsList] = useState([]);
    const [currentInstitutionsList, setCurrentInstitutionsList] = useState([]);
    const [selectedEdit, setSelectedEdit] = useState();
    const [isProvidersOpen, setIsProvidersOpen] = useState(false);
    const [isInstitutionsOpen, setIsInstitutionsOpen] = useState(false);
    const { patientId } = usePatientContext();

    const {
        handleSubmit,
        register,
        watch,
        control,
        reset,
        formState: { errors },
    } = useForm();



    const {
        data: intervention,
        isLoading,
        isError,
    } = useIntervention({ interventionId }, {
        enabled: !!interventionId,
    });

    const { data: providers } = useProviders();
    const { data: institutions } = useInstitutions(
        {
            id: patientId,
        }
    );


    useEffect(() => {
        if (isError) {
            router.push("/404");
        }
    }, [isError]);

    if (isLoading) {
        return <LoadingSpinner />
    }



    useEffect(() => {
        if (providers) {
            const providersArray = providers.map((provider) => {
                return {
                    value: provider,
                    label: `${provider.firstName} ${provider.lastName}, ${provider.designation}`,
                };
            });
            const currentProvidersArray = currentProviders.map((provider) => {
                return {
                    value: provider,
                    label: `${provider.firstName} ${provider.lastName}, ${provider.designation}`,
                };
            });
            setCurrentProvidersList(currentProvidersArray);
            setProvidersList(providersArray);
        }
    }, [providers]);

    useEffect(() => {
        if (institutions && intervention) {
            const institutionsArray = institutions.map((institution) => {
                return {
                    value: institution,
                    label: `${institution.title}`,
                };
            });

            // get list of unique institutions from all interventions
            const uniqueInstitutions = intervention.institutions.filter((institution, index, self) =>
                index === self.findIndex((t) => (
                    t.institutionId === institution.institutionId
                ))
            )

            //get interventions and filter to remove duplicates then tranform into label value pair
            const currentInstitutionsArray = uniqueInstitutions.map((institution) => {
                return {
                    value: institution,
                    label: `${institution.title}`,
                };
            })

            setCurrentInstitutionsList(currentInstitutionsArray);
            setInstitutionsList(institutionsArray);
        }
    }, [institutions]);

    useEffect(() => {
        if (selectedEdit === "providers") {
            setIsProvidersOpen(true);
            setIsInstitutionsOpen(false);
        }
        if (selectedEdit === "institutions") {
            setIsInstitutionsOpen(true);
            setIsProvidersOpen(false);
        }
    }, [selectedEdit]);




    const { mutate: updateInterventionLinks } = useMutation(
        (payload) => updateInterventionLinksPATCH({ data: payload }),
        {
            onSuccess: () => {
                toast.success("Successfully updated intervention links");
                queryClient.invalidateQueries(["providers", "institutions", "medications", "diagnoses", "interventions", "imaging"]);
                closeModal();
                // reset();
            },
            onError: (error) => {
                toast.error("Unable to add intervention links" + error);
            },
        }
    );

    const handleProviderSubmit = () => {
        handleSubmit((data) => onSubmit(data, "providers"))();
    };

    const handleInstitutionSubmit = () => {
        handleSubmit((data) => onSubmit(data, "institutions"))();
    };

    const onSubmit = async (data, type) => {
        const token = await getToken();
        data.interventionId = interventionId;
        if (type === "providers") {
            //make call to update providers 
            data.linkUpdate = "providers"
            data.providers = data.providers.map((provider) => provider.value);

            if (sourceComponent === "interventions") {
                updateInterventionLinks({ data, token })
            }


        }

        if (type === "institutions") {
            //make call to update institutions
            data.linkUpdate = "institutions"
        }

        if (type === "medications") {
            //make call to update medications
        }

        if (type === "diagnoses") {
            //make call to update diagnoses
        }

        if (type === "interventions") {
            //make call to update interventions
        }

        if (type === "imaging") {
            //make call to update imaging
        }

    };

    return (
        <div className="pl-3 pr-3 w-[95%] mx-auto mt-5">
            <h3 className="w-full text-center mb-10 font-bold text-2xl">Which options would you like to link?</h3>
            <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-1">
                <button onClick={() => setSelectedEdit("providers")} className={`text-white ${selectedEdit === "providers" ? 'bg-slate-600' : 'bg-slate-400'} p-2 rounded text-sm font-medium mb-2 lg:mb-4`}>
                    Providers
                </button>
                <button onClick={() => setSelectedEdit("institutions")} className={`text-white ${selectedEdit === "institutions" ? 'bg-slate-600' : 'bg-slate-400'} p-2 rounded text-sm font-medium mb-2 lg:mb-4`}>
                    Institutions
                </button>
            </div>

            {isProvidersOpen && (
                <>
                    {/* <h3 className="text-lg font-semibold text-slate-700 mb-4">Link Providers</h3> */}
                    <div className="min-h-[300px]">
                        <div className='col-span-1 lg:col-span-4'>
                            <label htmlFor="providers" className="text-sm font-medium">
                                Providers
                            </label>
                            <div className='w-full mt-1'>
                                <div className=' w-full min-h-[200px] overflow-scroll '>
                                    <ControlledMultiSelectTypeahead
                                        control={control}
                                        name="providers"
                                        data={providersList}
                                        defaultValue={currentProvidersList}
                                        placeholder="Select Providers"
                                    />
                                    <button onClick={handleProviderSubmit} className="text-white bg-blue-600 p-2 float-right rounded text-sm font-medium mt-10 w-32">Save </button>
                                </div>
                            </div>


                        </div>
                    </div>
                </>
            )}

            {isInstitutionsOpen && (
                <>
                    {/* <h3 className="text-lg font-semibold text-slate-700 mb-4">Link Providers</h3> */}
                    <div className="min-h-[300px]">
                        <div className='col-span-1 lg:col-span-4'>
                            <label htmlFor="providers" className="text-sm font-medium">
                                Institutions
                            </label>
                            <div className='w-full mt-1'>
                                <div className=' w-full min-h-[200px] overflow-scroll '>
                                    <ControlledMultiSelectTypeahead
                                        control={control}
                                        name="institutions"
                                        data={institutionsList}
                                        defaultValue={currentInstitutionsList}
                                        placeholder="Select Institutions"
                                    />
                                    <button onClick={handleInstitutionSubmit} className="text-white bg-blue-600 p-2 float-right rounded text-sm font-medium mt-10 w-32">Save </button>
                                </div>
                            </div>


                        </div>
                    </div>
                </>
            )}

        </div>
    );
};

export default LinkOptions;
