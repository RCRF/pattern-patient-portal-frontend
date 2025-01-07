import { React, useState } from 'react';
import Link from 'next/link';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { getFormattedStage } from '@/utils/helpers';

export default function TypeCard({ cases, type }) {
  //create a unique list of subtypes

  const uniqueSubTypes = Array.from(
    new Map(cases.map((caseItem) => [caseItem.subtype.id, caseItem])).values()
  );

  return (
    <div className="overflow-y-scroll h-96">
      {uniqueSubTypes.map((subType) => (
        <div key={subType.id}>
          <h2 className="font-bold text-left text-lg mt-4 ml-1">
            {subType.subtype.name}
          </h2>
          <div className="grid gap-2 sm:grid-cols-5">
            {cases
              .filter((caseItem) => caseItem.subtype.id === subType.subtype.id)
              .map((caseItem) => (
                <a
                  className="shadow-lg max-w-sm w-full p-2 ml-1 lg:max-w-full lg:flex border justify-center self-center bg-whiterounded-b flex flex-row rounded mt-2"
                  key={caseItem.id}
                  href={
                    `/profile/` + caseItem.caseDetails[0].id + `?nonuser=true`
                  }
                >
                  <UserCircleIcon className="text-gray-300 w-[20%] h-[20%]" />
                  <div className="ml-2 text-sm text-left font-medium self-center">
                    Stage
                    {' ' +
                      getFormattedStage(
                        caseItem.caseDetails[0].current_stage
                      ) || 'N/A'}{' '}
                  </div>
                </a>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
