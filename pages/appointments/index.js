import React, { useEffect, useState } from "react";

import { useRouter } from "next/router";
import { useAppointments, useFamilyHistory } from "@/hooks/api";
import AppointmentsTable from "@/components/tables/AppointmentsTable";
import { usePatientContext } from "@/components/context/PatientContext";
import FollowupCard from "@/components/cards/FollowupCard";

export const followupMock =
  [{
    "id": "1",
    "title": "Dermatology",
    "reason": "Routine Screening",
    "lastAppointments": [
      {
        "title": "Dermatology",
        "date": "2021-01-01",
        "provider": "John Doe, MD"
      }
    ],
    "nextAppointment": {
      "id": "1",
      "title": "Dermatology",
      "date": "2023-01-01",
    },
    "dueDate": "2025-01-01",
    "followupFrequency": "1_month",
    "status": "Needs To Be Scheduled",
    "startDate": "2022-01-01",
    "provider": [
      {
        "firstName": "John",
        "lastName": "Doe",
        "designation": "MD"
      }
    ],
    "institution": [
      { "title": "Mayo Clinic", id: "1" }
    ],
    "details": "Details",
    "notes": "Ask about mole on left calf",
    "report": "https://www.google.com"
  }]

export const followupFrequency = [
  {
    id: 1,
    title: "In 1 Week",
    value: "1_week",
  },
  {
    id: 2,
    title: "In 2 Weeks",
    value: "2_weeks",
  },
  {
    id: 3,
    title: "In 1 Month",
    value: "1_month",
  },
  {
    id: 4,
    title: "In 3 Months",
    value: "3_months",
  },
  {
    id: 5,
    title: "In 6 Months",
    value: "6_months",
  },
  {
    id: 6,
    title: "In 1 Year",
    value: "1_year",
  },

]

const Appointments = () => {
  const router = useRouter();
  const patientId = router.query.patientId;
  const [upcomingAppts, setUpcomingAppts] = useState([]);
  const [pastAppts, setPastAppts] = useState([]);

  const { data: appointments } = useAppointments(
    { id: patientId }
  );

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  //upcoming appointments
  useEffect(() => {
    if (appointments) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const upcomingAppts = appointments
        .filter((appt) => {
          const apptDate = new Date(appt.startDate + "Z");
          apptDate.setHours(0, 0, 0, 0);

          return apptDate >= now;
        })
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      setUpcomingAppts(upcomingAppts);

      const pastAppts = appointments
        .filter((appt) => {
          const apptDate = new Date(appt.startDate + "Z");
          apptDate.setHours(0, 0, 0, 0);

          return apptDate < now;
        })
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      setPastAppts(pastAppts);
    }
  }, [appointments]);






  return (
    <div className="mx-auto w-5/6 p-4 pb-20">
      <h1 className="text-5xl font-semibold text-slate-900 w-full mt-14 pl-4 md:text-left mb-7">
        Follow-Up
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <FollowupCard followup={followupMock[0]} />
      </div>
      <h1 className="text-5xl font-semibold text-slate-900 w-full mt-14 pl-4 md:text-left mb-7">
        Appointments
      </h1>
      <hr className="w-full border-1 border-slate-200 mb-7" />
      <div className="rounded-sm p-4">
        <h1 className="text-3xl font-semibold text-slate-900 w-full md:text-left ">
          Upcomming
        </h1>

        <AppointmentsTable appointments={upcomingAppts} fullDetails={true} />
      </div>
      <div className="rounded-sm p-4">
        <h1 className="text-3xl font-semibold text-slate-900 w-full md:text-left mt-10">
          Past
        </h1>
        <AppointmentsTable appointments={pastAppts} fullDetails={true} />
      </div>
    </div>
  );
};

export default Appointments;
