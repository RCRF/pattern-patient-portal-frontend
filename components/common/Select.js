import { useEffect, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Menu, Transition, Fragment } from "@headlessui/react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Select({ options, setValue, name }) {
  const [selectedItem, setSelectedItem] = useState();

  const handleOptionClick = (item) => {
    setValue(name, item.id);
    setSelectedItem(item);
  };

  useEffect(() => {
    setValue(name, selectedItem);
  }, [setValue, selectedItem]);

  return (
    <Menu as="div" className="relative inline-block text-left w-full">
      <div>
        <Menu.Button type="button" className="inline-flex w-full justify-between items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          {name === "provider" && selectedItem ? (
            <span className="w-full text-center">
              {" "}
              {selectedItem?.lastName +
                " " +
                selectedItem?.firstName +
                ", " +
                selectedItem?.designation}
            </span>
          ) : (
            <span className="w-full text-center capitalize">
              {selectedItem?.title}
            </span>
          )}
          <ChevronDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Menu.Button>
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
        <Menu.Items className="absolute z-10 mt-1 w-full max-h-48 overflow-auto origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {name === "provider"
              ? options?.map((option) => (
                <Menu.Item key={option.title}>
                  {({ active }) => (
                    <button
                      type="button"
                      onClick={() => handleOptionClick(option)}
                      className={classNames(
                        active
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-700",
                        "block w-full text-center text-sm"
                      )}
                    >
                      {option.firstName +
                        " " +
                        option.lastName +
                        ", " +
                        option.designation}
                    </button>
                  )}
                </Menu.Item>
              ))
              : options?.map((option) => (
                <Menu.Item key={option.title}>
                  {({ active }) => (
                    <button
                      type="button"
                      onClick={() => handleOptionClick(option)}
                      className={classNames(
                        active
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-700",
                        "block w-full text-center text-sm capitalize"
                      )}
                    >
                      {option.title}
                    </button>
                  )}
                </Menu.Item>
              ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
