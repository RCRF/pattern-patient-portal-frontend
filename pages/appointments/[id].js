import React, { useEffect, useState } from "react";

import { useRouter } from "next/router";
import {
  useAppointmentById,
  useAppointments,
  useFamilyHistory,
  useMedications,
  useImaging,
  useInterventions,
  useLabsByDateRange,
} from "@/hooks/api";
import { formatDate } from "@/utils/helpers";
import ReactMarkdown from "react-markdown";
import AppointmentDetails from "@/components/timeline/AppointmentDetails";
import { useSession } from "@clerk/nextjs";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { usePatientContext } from "@/components/context/PatientContext";

const Appointment = () => {
  const router = useRouter();
  const { session } = useSession();
  const patientId = router.query.patientId;
  const { data: medications } = useMedications({ id: patientId });
  const { data: interventions } = useInterventions({
    id: patientId,
  });
  const { data: imaging, isLodaing: imagesAreLoading } = useImaging({ id: patientId });
  const appointmentId = router.query.id;

  const { data: appointment, isLoading, isError } = useAppointmentById(
    { id: appointmentId },
    {
      enabled: !!appointmentId,
    }
  );

  const { data: labs } = useLabsByDateRange(
    {
      id: patientId,
      startDate: appointment?.startDate,
      daysBefore: 30,
      daysAfter: 14,
      session: session,
    },
    {
      enabled: !!appointment,
    }
  );

  useEffect(() => {
    if (isError) {
      router.push("/404");
    }
  }, [isError]);

  if (isLoading || imagesAreLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="mx-auto w-5/6 p-4 pb-20">
      <h1 className="text-5xl font-semibold text-slate-900 w-full mt-14 pl-4 md:text-left mb-5">
        Appointment Details
      </h1>
      <hr className="w-full border-1 border-slate-200 mb-7" />
      <AppointmentDetails
        labs={labs}
        selectedItem={appointment}
        imaging={imaging}
        interventions={interventions}
        medications={medications}
        displayFull={true}
      />
    </div>
  );
};

export default Appointment;
