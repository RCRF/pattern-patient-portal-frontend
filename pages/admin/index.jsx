"use client";
import { React, useState, useEffect, Fragment, useRef, use } from "react";
import { ReactTable } from "@/components/tables/ReactTable";
import { PlusIcon } from "@heroicons/react/24/solid";
import Modal from "@/components/Modal";
import {
   fetchAllOrganizations,
   createOrganizationPOST
} from "@/hooks/api";
import EntryForm from "@/components/EntryForm";
import { useRouter } from 'next/router'
import { useSession, getSession } from "next-auth/react";
import { useMutation, useQuery } from "react-query";
import toast from "react-hot-toast";
import { queryClient } from "@/queryClient";

export default function Admin() {
  const { data: session, status: sessionStatus } = useSession();
  const { mutate } = useMutation(createOrganizationPOST, {
    onSuccess: (data) => {
      // Handle successful response
      fetchAllOrganizations(session).then((data) => {
        setOrganizations(data)
      })
      toast.success("Organization added");
  
      
    },
    onError: (error) => {
      // Handle error
      toast.error("Error adding organizaiton");
    }

  })
  const [ organizations, setOrganizations ] = useState([])
  
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter()


  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (data) => {
    const payload = 
    {
      data,
      session
    }
    mutate(payload);
  }



  useEffect(() => {

    //todo: find a way to do this with react-query
    if (session && session.isAdmin === true) {

      fetchAllOrganizations(session).then((data) => {
        setOrganizations(data)
      })
  
    } 
      
  }, [session])

  const columns = [
    {
      Header: 'Name',
      accessor: 'name',
    },
    {
      Header: 'Email',
      accessor: 'email',
    },
    {
      Header: 'State',
      accessor: 'state',
    },
    {
      Header: 'Country',
      accessor: 'country',
    },
    {
      Header: 'Organization ID',
      accessor: 'id',
    },
  ];



  return (
    <>
      <div className="flex justify-center">
      
      {isModalOpen && (
          <Modal show={isModalOpen} fragment={Fragment} closeModal={closeModal}>
            <div>
              <EntryForm closeModal={closeModal} createOrg={handleSubmit}/>
           </div>
          </Modal>
        )}
        <main className="flex flex-col p-10 bg-slate-50 justify-center items-center md:w-[80%] w-full">
          <h1 className="md:text-6xl w-full text-3xl mx-auto p-4 text-left font-semibold">
            Pages
          </h1>
          <div className="mt-5 w-full flex flex-wrap ">
            <div className="grid sm:grid-cols-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-4 grid-row-[fr1] mt-14">
             
            </div>
          </div>
          <div className="w-full">
            <div className="w-full flex mt-20">
              <h1 className="text-left p-4 text-3xl font-semibold">
                Organizations
              </h1>
              
              <button
                onClick={() => setIsModalOpen(true)}
                type="button"
                className="rounded-full bg-slate-700 p-1 text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 self-center"
              >
                <PlusIcon className="h-4 w-4" aria-hidden="true" />
              </button>
              
            </div>

      
            <div className="text-left w-full pl-4">
                <ReactTable columns={columns} data={organizations} />
              
            </div>
          </div>

   
        </main>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context)
  
  if (!session || session.isAdmin === false || session.isAdmin === undefined) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  // if session exists, return props
  return {
    props: {}
  }
}



