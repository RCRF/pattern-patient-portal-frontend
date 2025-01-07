import { PlusCircleIcon, TrashIcon } from "@heroicons/react/24/solid";
import { add } from "lodash";
import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useMutation } from "react-query";
import { toast } from "react-hot-toast";
import {
  createAuthorPOST,
  deleteSideEffectPOST,
  updateAuthorsPOST,
} from "@/hooks/api";
import { useSession } from "next-auth/react";
import { queryClient } from "@/queryClient";
import MedicationSearch from "../AddMedication";
import AddInstitutionForm from "./AddInstitutionForm";

export default function InstitutionForm({
  closeModal,
  sideEffects,
  medication,
}) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {

    },
  });



  return (
    <div className="flex items-center self-center justify-center mt-32">

      <div className="flex flex-row">
        <div className="pt-2 w-full">
          <AddInstitutionForm />
        </div>


      </div>
    </div>
  );
}
