import Head from "next/head";
import { Footer } from "../components/HomePage/Footer";
import { Header } from "../components/HomePage/Header";
import { Fragment, useState } from "react";
import Modal from "../components/Modal";

import { Hero } from "../components/HomePage/Hero";
import { EnvelopeIcon } from "@heroicons/react/24/solid";
import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/clerk-react";
import { useRouter } from "next/router";

// import { Pricing } from "@/components/Pricing";
// import { PrimaryFeatures } from "@/components/PrimaryFeatures";
// import { SecondaryFeatures } from "@/components/SecondaryFeatures";
// import { Testimonials } from "@/components/Testimonials";

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    router.push("/dashboard");
  }

  return (
    <>
      <Head>
        <title>Patient Portal</title>
        <meta
          name="description"
          content="Med Resource Connect, connecting resources and records."
        />
        <meta property="og:title" content="PatientPortal" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://medresourceconnect.com" />
        <meta
          property="og:image"
          content="https://res.cloudinary.com/dyrev28qc/image/upload/v1688187311/MedResourceConnect_jsvkul.png"
        />
      </Head>
      <Header openModal={openModal} />
      <main>
        <Hero />

        {isModalOpen && (
          <Modal show={isModalOpen} fragment={Fragment} closeModal={closeModal}>
            <div>
              <div className="w-full mb-5 mt-10">
                <EnvelopeIcon className="w-20 h-20 mx-auto bg-blue-50 rounded p-3 text-blue-500" />
              </div>
              <h1 className="w-full text-center text-4xl font-semibold">
                Contact Us
              </h1>

              <p className="w-full pl-20 pr-20 pt-7 text-center font-sm">
                To submit a request for an account
              </p>
              <p className="w-full pb-10 pt-1 text-center font-sm">
                send a request to{" "}
                <a
                  href="mailto:MedResourceConnect@gmail.com"
                  className="text-blue-500"
                >
                  MedResourceConnect@gmail.com
                </a>
              </p>
            </div>
          </Modal>
        )}
      </main>
      <div className="mt-10">
        <Footer />
      </div>
    </>
  );
}
