import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ImagingDetails from "@/components/timeline/ImagingDetails";
import {
  useImaging,
  useMedications,
  useInterventions,
  useAttachmentsByImaging,
  useLabsByDateRange,
  useAppointments,
} from "@/hooks/api";
import { useSession } from "@clerk/nextjs";
import { usePatientContext } from "@/components/context/PatientContext";
import AddImagingForm from "@/components/AddImagingForm";
import { useUser } from "@clerk/clerk-react";

const Imaging = () => {
  const session = useSession();
  const { patientId } = usePatientContext();
  const router = useRouter();
  const imagingId = router.query.id;
  const [image, setImage] = useState(null);
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


  const { data: imaging } = useImaging(
    { id: patientId }
  );

  const { data: medications } = useMedications(
    { id: patientId }
  );

  const { data: interventions } = useInterventions(
    { id: patientId }
  );

  const { data: appointments } = useAppointments(
    { id: patientId }
  );

  const { data: attachments } = useAttachmentsByImaging(
    { id: imagingId },
    {
      enabled: !!imagingId,
    }
  );

  const { data: labs, isLoading } = useLabsByDateRange(
    {
      id: patientId,
      startDate: image?.startDate,
      daysBefore: 10,
      daysAfter: 10,
      session: session,
    },
    {
      enabled: !!imagingId,
    }
  );

  useEffect(() => {
    if (imaging) {
      const image = imaging.find((item) => item.id === imagingId);
      if (image) {
        setImage(image);
      } else {
        router.push("/404");
      }
    }
  }, [imaging]);

  return (
    <div className="pl-3 pr-3 w-[80%] mx-auto mt-14">
      {isAdmin && (
        <button onClick={() => setEditing(!editing)} className="text-slate-700 text-sm font-medium mb-4">
          {editing ? "Back" : "Edit Imaging"}
        </button>
      )}

      {
        editing ? (
          <AddImagingForm image={image} mode="editing" />
        ) : (
          <ImagingDetails
            appointments={appointments}
            selectedItem={image}
            version={"full"}
            displayFull={true}
            imaging={imaging}
            medications={medications}
            interventions={interventions}
            attachments={attachments}
            labs={labs}
          />
        )
      }

    </div >
  );
};

export default Imaging;
