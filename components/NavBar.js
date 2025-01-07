import { Fragment, useEffect, useState } from "react";
import { Disclosure, Menu, Switch, Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import {
  Bars3Icon,
  BellIcon,
  XMarkIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { useUser } from "@clerk/nextjs";
import { usePatientContext } from "@/components/context/PatientContext";
import CustomUserButton from "./common/CustomUserButton";
import { set } from "lodash";

function filterNavigationByVersion(navArray, currentVersion) {
  return navArray.filter(navItem => navItem.version.includes(currentVersion));
}


function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function NavBar({
  version,
  setVersion,
  isEditing,
  setIsEditing,
}) {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const { patientId } = usePatientContext();
  const router = useRouter();
  const [isIntroModalOpen, setIsIntroModalOpen] = useState(false);
  const { data: session } = useSession();
  const [isClient, setIsClient] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const user = useUser();

  const isEmailMatch = () => {
    return user?.user?.emailAddresses.some(
      (emailObj) => emailObj.emailAddress === adminEmail
    );
  };

  useEffect(() => {
    if (user?.user?.emailAddresses) {
      setIsAdmin(isEmailMatch());
    }
  }, [user]);


  const navigation = [
    { name: "Home", href: "/dashboard", current: false, version: ["research", "emergency", "patient", "oncology", "admin"] },

    {
      name: "Research",
      href: "/research",
      current: false,
      version: ["research", "oncology", "admin"],
    },
    {
      name: "Timeline",
      href: "/timeline",
      current: false,
      version: ["research", "emergency", "patient", "oncology", "admin"],
    },

    {
      name: "Appointments",
      href: `/appointments`,
      current: false,
      version: ["research", "oncology", "admin"],
    },
    {
      name: "Family History",
      href: `/family-history/${patientId}`,
      current: false,
      version: ["research", "emergency", "oncology", "admin"],
    },
    {
      name: "Since Last Login",
      href: `/recent`,
      current: false,
      version: ["research", "oncology", "admin"],
    },
  ];
  const [filteredNav, setFilteredNav] = useState(navigation);
  const [fullNav, setFullNav] = useState(navigation);

  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem("hasVisitedBefore");
    const storedVersion = localStorage.getItem("version");

    if (!hasVisitedBefore) {
      setIsIntroModalOpen(true);
      localStorage.setItem("hasVisitedBefore", "true");
      const defaultVersion = "oncology";
      localStorage.setItem("version", defaultVersion);
      setVersion(defaultVersion);
      setFilteredNav(filterNavigationByVersion(navigation, defaultVersion));
    } else {
      if (storedVersion === "patient") {
        setVersion("oncology");
      }
      setVersion(storedVersion);
      setFilteredNav(filterNavigationByVersion(navigation, storedVersion));

      // if (storedVersion === "patient") {
      //   router.push("/");
      // }
    }
  }, [router, setVersion]);

  useEffect(() => {
    setFilteredNav(filterNavigationByVersion(navigation, version));
  }, [version]);


  useEffect(() => {
    setIsClient(true);
    if (localStorage.getItem("version") === "admin") {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [setIsEditing, isEditing]);

  if (!isClient) {
    return null; // or a placeholder/loading state
  }

  // // Whenever adminMode changes, save it to localStorage
  // useEffect(() => {
  //   window.localStorage.setItem("adminMode", JSON.stringify(isEditing));
  // }, [isEditing]);

  const closeIntroModal = () => {
    setIsIntroModalOpen(false);
  };
  const versionOptions = ["research", "emergency", "patient", "oncology", "admin"];

  // const toggleVersion = () => {
  //   const currentVersion = localStorage.getItem("version");
  //   const currentVersionIndex = versionOptions.indexOf(currentVersion);
  //   const nextVersionIndex = (currentVersionIndex + 1) % versionOptions.length;
  //   const newVersion = versionOptions[nextVersionIndex];

  //   localStorage.setItem("version", newVersion);
  //   setVersion(newVersion);
  // };
  const toggleVersion = (selectedVersion) => {
    const currentVersion = localStorage.getItem("version");

    if (currentVersion === selectedVersion) {
      // Turn off the current version
      localStorage.setItem("version", "");
      setVersion("oncology");
      setIsEditing(false);
    } else {
      // Turn on the selected version
      localStorage.setItem("version", selectedVersion);
      setVersion(selectedVersion);
      if (selectedVersion === "admin") {
        setIsEditing(true);
      } else {
        setIsEditing(false);
      }
    }
  };





  return (
    <Disclosure as="nav" className="bg-gray-800 top-0 left-0 right-0 z-10">
      {({ open }) => (
        <>
          {/* {isIntroModalOpen && (
            <IntroModal
              show={isIntroModalOpen}
              fragment={Fragment}
              closeModal={closeIntroModal}
              setVersion={setVersion}
            />
          )} */}
          <div className="mx-auto w-3/4 px-4 sm:px-6 lg:px-">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="md:hidden flex items-center">
                  <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
                <div className="hidden md:flex md:items-center md:space-x-4">
                  {user?.user?.lastSignInAt.toISOString().split("T")[0] !==
                    user?.user?.createdAt.toISOString().split("T")[0]
                    ? filteredNav.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.current
                            ? "bg-gray-900 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white",
                          "rounded-md px-3 py-2 text-sm font-medium"
                        )}
                        aria-current={item.current ? "page" : undefined}
                      >
                        {item.name}
                      </a>
                    ))
                    : filteredNav
                      .filter((item) => item.version !== "recent")
                      .map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className={classNames(
                            item.current
                              ? "bg-gray-900 text-white"
                              : "text-gray-300 hover:bg-gray-700 hover:text-white",
                            "rounded-md px-3 py-2 text-sm font-medium"
                          )}
                          aria-current={item.current ? "page" : undefined}
                        >
                          {item.name}
                        </a>
                      ))}
                  <Menu as="div" className="relative inline-block text-left">
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                          {filteredNav.map((item) => (
                            <Menu.Item key={item.name}>
                              {({ active }) => (
                                <a
                                  href={item.href}
                                  className={classNames(
                                    active
                                      ? "bg-gray-100 text-gray-900"
                                      : "text-gray-700",
                                    "block px-4 py-2 text-sm"
                                  )}
                                  onClick={() => setVersion(item.version)}
                                >
                                  {item.name}
                                </a>
                              )}
                            </Menu.Item>
                          ))}
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
              <div className="flex items-center">
                <Menu as="div" className="relative inline-block text-left">
                  <div className="flex flex-cols">
                    <Menu.Button className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium pr-4">
                      <CogIcon className="h-5 w-5" aria-hidden="true" />
                    </Menu.Button>
                    <CustomUserButton />
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="origin-top-right absolute right-0 mt-2 w-44 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <>
                        <div className="py-1">
                          <div>
                            <Menu.Item>
                              <div className="flex justify-between mt-3 mx-2 mb-2">
                                <div className={"text-white px-2 self-center"}>
                                  <span className={"capitalize"}>
                                    Oncology
                                  </span>
                                </div>
                                <Switch
                                  checked={version === "oncology"}
                                  onChange={() => toggleVersion("oncology")}
                                  className={classNames(
                                    version === "oncology"
                                      ? "bg-blue-600"
                                      : "bg-gray-200",
                                    "relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                                  )}
                                ></Switch>
                              </div>
                            </Menu.Item>
                          </div>

                        </div>
                        <div className="py-1">
                          <div>
                            <Menu.Item>
                              <div className="flex justify-between mx-2 mb-4">

                                <div className={"text-white px-2 self-center"}>
                                  <span className={"capitalize"}>
                                    Emergency
                                  </span>
                                </div>
                                <Switch
                                  checked={version === "emergency"}
                                  onChange={() => toggleVersion("emergency")}
                                  className={classNames(
                                    version === "emergency"
                                      ? "bg-blue-600"
                                      : "bg-gray-200",
                                    "relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                                  )}
                                ></Switch>
                              </div>
                            </Menu.Item>
                          </div>

                        </div>
                        {isAdmin ? (
                          <div>
                            <Menu.Item>
                              <div className="flex justify-between mx-2 mb-4">
                                <div className={"text-white px-2 self-center"}>
                                  <span className={"capitalize"}>Admin</span>
                                </div>
                                <Switch
                                  checked={version === "admin"}
                                  onChange={() => toggleVersion("admin")}
                                  className={classNames(
                                    version === "admin" ? "bg-blue-600" : "bg-gray-200",
                                    "relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                                  )}
                                ></Switch>
                              </div>
                            </Menu.Item>
                          </div>
                        ) : null}
                      </>
                    </Menu.Items>

                  </Transition>
                </Menu>
              </div>
            </div>
          </div>
          {isEditing ? (
            <div className="w-full bg-red-500 p-2 text-white text-center">
              Admin Mode Enabled
            </div>
          ) : null}

          <Disclosure.Panel className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {filteredNav.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    item.current
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    "block px-3 py-2 rounded-md text-base font-medium"
                  )}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
