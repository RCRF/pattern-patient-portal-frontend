import React, { useEffect, useState, Fragment } from "react";
import InterventionDetails from "@/components/timeline/InterventionDetails";
import { useRouter } from "next/router";
import { useIntervention, useProviders } from "@/hooks/api";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import AddInterventionForm from "@/components/forms/AddInterventionForm";
import Modal from "@/components/Modal";
import LinkOptions from "@/components/forms/LinkOptions";
import { useUser } from "@clerk/clerk-react";



const Intervention = () => {
  const router = useRouter();
  const interventionId = router.query.id;
  const [editing, setEditing] = useState(false);
  const [providersList, setProvidersList] = useState([]);
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
    data: intervention,
    isLoading,
    isError,
  } = useIntervention({ interventionId }, {
    enabled: !!interventionId,
  });


  const closeModal = () => {
    setEditing(false);
  };

  return (
    <div className="pl-3 pr-3 w-[75%] mx-auto mt-14">
      {
        isAdmin && (
          <button onClick={() => setEditing(!editing)} className="text-slate-700 text-sm font-medium mb-4">
            {editing ? "Back" : "Edit Intervention"}
          </button>

        )
      }

      {editing ? (
        <AddInterventionForm intervention={intervention} mode="editing" />
      ) : (
        <InterventionDetails
          selectedItem={intervention}
          version={"full"}
          displayFull={true}
        />
      )}



    </div>
  );
};

export default Intervention;
