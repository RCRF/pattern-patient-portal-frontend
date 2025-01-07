import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import TypeCard from "./TypeCard";
import { CursorArrowRaysIcon } from "@heroicons/react/24/solid";
import { set } from "lodash";

export default function Modal({
  data,
  children,
  fragment,
  closeModal,
  setVersion,
  setIsResearch,
}) {
  const setPatientVersion = () => {
    localStorage.setItem("version", "oncology");
    setVersion("oncology");
    closeModal();
  };

  const setFullVersion = () => {
    localStorage.setItem("version", "oncology");
    setVersion("oncology");
    closeModal();
  };

  return (
    <Transition.Root show={true} as={fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-1/2 sm:p-6">
                <div className="mx-auto w-full">
                  <div className="w-full text-center mt-5">
                    {/* <h1 className="text-3xl font-medium">Welcome</h1> */}
                    <div className="w-full mb-5">
                      <CursorArrowRaysIcon className="w-14 h-14 mx-auto bg-blue-50 rounded p-2 color-white" />
                    </div>
                    <h1 className="text-3xl font-medium mb-5">
                      How would you like to view the page
                    </h1>
                  </div>
                  <div>
                    <div className="w-full text-sm text-center sm:text-lg">
                      We understand that not all patients want to see trial data
                      or survival stats.{" "}
                      <p>
                        We have broken the content out into two versions, select
                        which you'd like to view.
                      </p>
                    </div>
                  </div>
                  <div className="w-full sm:w-5/6 mx-auto grid grid-cols-2 mb-10 mt-14 h-10 gap-5 sm:mb-10 sm:gap-10">
                    <button
                      type="submit"
                      className="bg-indigo-500 text-white py-2 px-6 rounded h-full"
                      onClick={setPatientVersion}
                    >
                      <p className="text-sm sm:text-lg">Patient Focused</p>
                      <p className="text-xxs mt-0">hides trial/research data</p>
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-500 text-white py-2 px-3 rounded h-full"
                      onClick={setFullVersion}
                    >
                      <p className="text-sm sm:text-lg">Full Access</p>
                      <p className="text-xxs mt-0">
                        includes studies and research
                      </p>
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
