import React, { useState, useRef, useEffect } from 'react';
import { useClerk } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { clearTokenPOST } from '@/hooks/api';
import { useMutation } from 'react-query';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/router';

const CustomUserButton = () => {
    const { user, signOut } = useClerk();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const { getToken } = useAuth();
    const router = useRouter();


    const { mutate } = useMutation(clearTokenPOST, {
        onSuccess: async (data) => {
            // Handle successful response
            // fetchAllOrganizations(session).then((data) => {
            //   setOrganizations(data);
            // });
            toast.success("Successfully logged out");
            await signOut();
            router.push('/');

        },
        onError: (error) => {
            // Handle error

            toast.error("Error updating order" + error.message);
        },
    });

    const handleLogout = async () => {
        try {
            const token = await getToken();
            mutate(token);

        } catch (error) {
            toast.error("Error trying to logout");
        }
    };


    const goToAccess = async () => {
        router.push('/access');
    };


    const toggleDropdown = () => setShowDropdown(!showDropdown);

    // Close the dropdown if clicked outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dropdownRef]);

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 cursor-pointer" onClick={toggleDropdown}>
                <span className="text-white text-xl capitalize">
                    {user?.emailAddresses[0]?.emailAddress?.charAt(0) || ''}
                </span>
            </div>
            {showDropdown && (
                <div className="absolute right-0 mt-2 py-2 w-60 bg-white rounded-md shadow-xl z-20">
                    {/* {user ? <span className="block px-4 py-2 text-sm text-gray-700">{user?.firstName + " " + user?.lastName}</span> : ""} */}
                    {user ? <span className="block px-4 py-2 text-sm text-gray-700 overflow-hidden">{user.emailAddresses[0].emailAddress}</span> : ""}
                    <button onClick={goToAccess} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Switch Patient</button>
                    <button onClick={handleLogout} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Logout</button>
                </div>
            )}
        </div>
    );
};

export default CustomUserButton;
