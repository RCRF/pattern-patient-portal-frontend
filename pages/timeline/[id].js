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
    useTimelineEvent,
} from "@/hooks/api";
import { useSession } from "@clerk/nextjs";
import { usePatientContext } from "@/components/context/PatientContext";
import AddImagingForm from "@/components/AddImagingForm";
import { useUser } from "@clerk/clerk-react";
import TagDetails from "@/components/timeline/TagDetails";

const TimelineEvent = () => {
    const session = useSession();
    const { patientId } = usePatientContext();
    const router = useRouter();
    const timeineId = router.query.id;
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

    const { data: timelineEvent } = useTimelineEvent({
        patientId: patientId,
        timelineId: timeineId
    })

    const { data: medications } = useMedications(
        { id: patientId }
    );

    const { data: interventions } = useInterventions(
        { id: patientId }
    );

    const { data: appointments } = useAppointments(
        { id: patientId }
    );


    const { data: labs, isLoading } = useLabsByDateRange(
        {
            id: patientId,
            startDate: timelineEvent?.startDate,
            daysBefore: 10,
            daysAfter: 10,
            session: session,
        },
        {
            enabled: !!timelineEvent,
        }
    );



    return (
        <div className="pl-3 pr-3 w-[80%] mx-auto mt-14">
            {isAdmin && (
                <button onClick={() => setEditing(!editing)} className="text-slate-700 text-sm font-medium mb-4">
                    {editing ? "Back" : "Edit Timeline Event"}
                </button>
            )}

            {timelineEvent && (

                <TagDetails
                    selectedItem={timelineEvent}
                    displayFull={true}
                    medications={medications}
                    interventions={interventions}
                    imaging={imaging}
                    links={timelineEvent?.links}
                    labs={labs}
                />


            )}



        </div >
    );
};

export default TimelineEvent;
