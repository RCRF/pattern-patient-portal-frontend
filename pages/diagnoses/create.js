
import React, { useEffect, useState } from 'react';

import AddDiagnosisForm from '@/components/forms/AddDiagnosisForm';
import { useUser } from '@clerk/clerk-react';
import { useRouter } from 'next/router';


const Diagnoses = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const { user } = useUser();
    const router = useRouter();
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
            if (!isEmailMatch()) {
                router.push('/');
            }
        }
    }, [user]);




    return (
        <div className='w-5/6 mx-auto mt-12'>
            <AddDiagnosisForm />
        </div>
    );
}


export default Diagnoses;