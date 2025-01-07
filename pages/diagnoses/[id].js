import React, { useState, useEffect, use } from "react";
import {
  formatDate,
  linkColumns,
  listWithCommas,
  sortByDateDesc,
  sortByListOrderAndDate,
} from "@/utils/helpers";
import { useRouter } from "next/router";

import Relations from "@/components/timeline/Relations";
import PubMedArticles from "@/components/PubMedArticles";
import {
  useAppointments,
  useDiagnosis,
  useFetchArticles,
  useDiagnosisProviders,
  useInterventionsByDiagnosis,
  useImagingByDiagnosis,
  useMedicationsByDiagnosis,
  fetchRelatedMedicationsByPatientMedicationId,
  useAttachmentsByDiagnosis,
  useAppointmentsByDiagnosisId,
} from "@/hooks/api";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

import { image } from "@cloudinary/url-gen/qualifiers/source";
import { ArrowUpRightIcon } from "@heroicons/react/20/solid";
import DiagnosisDetails from "@/components/timeline/DiagnosisDetails";
import AddDiagnosisForm from "@/components/forms/AddDiagnosisForm";
import { useUser } from "@clerk/clerk-react";

const Diagnosis = () => {
  const router = useRouter();
  const [isArticlesOpen, setIsArticlesOpen] = useState(false);
  const [allMedications, setAllMedications] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filteredImaging, setFilteredImaging] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [editing, setEditing] = useState(false);
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

  const [queryOptions, setQueryOptions] = useState([]);
  const diagnosisId = router.query.id;

  const {
    data: diagnosis,
    isLoading,
    isError,
  } = useDiagnosis(
    { id: diagnosisId },
    {
      enabled: false,
    },
  );

  const { data: appointments } = useAppointmentsByDiagnosisId(
    { id: diagnosisId },
    {
      enabled: false,
    }
  );

  const { data: imaging } = useImagingByDiagnosis(
    { id: diagnosisId },
    {
      enabled: false,
    }
  );

  const { data: providers } = useDiagnosisProviders({ id: diagnosisId }, {
    enabled: false,
  });

  const { data: interventions } = useInterventionsByDiagnosis(
    { id: diagnosisId },
    {
      enabled: false,
    }
  );

  const { data: medications } = useMedicationsByDiagnosis(
    { id: diagnosisId },
    {
      enabled: false,
    }
  );

  const { data: attachments } = useAttachmentsByDiagnosis(
    { id: diagnosisId },
    {
      enabled: false,
    }
  );



  const shouldFetch =
    !!diagnosisId && Array.isArray(queryOptions) && queryOptions.length > 0;
  const { data: articles } = useFetchArticles(queryOptions, {
    enabled: shouldFetch,
  });

  useEffect(() => {
    if (isError) {
      router.push("/404")
    }
  }, [isError]);


  useEffect(() => {
    if (articles) {
      setFilteredArticles(articles.articles);
    }
  }, [articles]);

  useEffect(() => {
    if (imaging) {
      setFilteredImaging(sortByListOrderAndDate(imaging));
    }
  }, [imaging]);

  useEffect(() => {
    if (diagnosis) {
      if (diagnosis.title === "Metastatic Oncocytoma") {
        queryOptions.push({
          field: "Title",
          value: "Oncocytoma",
          tags: [],
        });
        queryOptions.push({
          field: "Title",
          value: "Chromophobe",
          tags: [],
        });
        queryOptions.push({
          field: "Title",
          value: "Metastatic Oncocytoma",
          tags: [],
        });
      } else {
        queryOptions.push({
          field: "Title",
          value: diagnosis.title,
          tags: [],
        });
      }
    }
  }, [diagnosis]);

  useEffect(() => {
    if (appointments) {
      setFilteredAppointments(sortByDateDesc(appointments));
    }
  }, [appointments]);

  useEffect(() => {
    const fetchAllRelatedMedications = async () => {
      if (medications && medications.length > 0) {
        try {
          const relatedMedicationsPromises = medications.map((medication) =>
            fetchRelatedMedicationsByPatientMedicationId(medication.id)
          );

          const allRelatedMedications = await Promise.all(
            relatedMedicationsPromises
          );

          const combinedMedications = [
            ...medications,
            ...allRelatedMedications.flat(),
          ];

          setAllMedications(sortByDateDesc(combinedMedications));
        } catch (error) {
          console.error("Error fetching related medications:", error);
        }
      }
    };

    fetchAllRelatedMedications();
  }, [medications]);

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  const diseaseStatusLookup = {
    stable: "Stable",
    ned: "No Evidence of Disease",
    progression: "Progression",
    controlled: "Controlled",
    scheduled_intervention: "Scheduled Intervention",
  };

  //Attachments
  const filteredAttachements = attachments?.sort(
    (a, b) => new Date(b.startDate) - new Date(a.startDate)
  );

  const highlightedAttachments = filteredAttachements?.filter(
    (attachment) => attachment.highlight
  );

  return (
    <div className="mx-auto w-[80%] mt-20 p-4 bg-white">
      {isAdmin && (
        <button onClick={() => setEditing(!editing)} className="text-slate-700 text-sm font-medium mb-4">
          {editing ? "Back" : "Edit Diagnosis"}
        </button>
      )}

      {
        editing ? (
          <AddDiagnosisForm diagnosis={diagnosis} mode="editing" />
        ) : (
          <DiagnosisDetails selectedItem={diagnosis} />
        )
      }
    </div>
  );
};

export default Diagnosis;
