import React, { useState } from "react";

import { useRouter } from "next/router";
import { useFamilyHistory } from "@/hooks/api";
import BasicTable from "@/components/tables/BasicTable";
import FamilyTable from "@/components/tables/FamilyTable";

const FamilyHistory = () => {
  const router = useRouter();
  const [isArticlesOpen, setIsArticlesOpen] = useState(false);
  const [allMedications, setAllMedications] = useState([]);
  const [queryOptions, setQueryOptions] = useState([]);
  const patientId = router.query.id;

  const { data: familyHistory } = useFamilyHistory(
    { id: patientId }
  );

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  const columns = [
    {
      Header: "Family Member",
      accessor: "familyMemberRelation",
    },
    {
      Header: "Diagnosis",
      accessor: "familyMemberHistory",
    },
    {
      Header: "Category",
      accessor: "category",
    },
    {
      Header: "Age at Diagnosis",
      accessor: "familyAgeAtDiagnosis",
    },

    {
      Header: "Notes",
      accessor: "notes",
    },
  ];

  return (
    <div className="mx-auto w-5/6 p-4">
      <h1 className="text-5xl font-semibold text-slate-900 w-full mt-14 pl-4 md:text-left mb-7">
        Family History
      </h1>
      <div className="rounded-sm p-4">
        <FamilyTable familyHistory={familyHistory} />
      </div>
    </div>
  );
};

export default FamilyHistory;
