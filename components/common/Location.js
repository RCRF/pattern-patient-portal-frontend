import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Country, State, City } from "country-state-city";

const Location = () => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    const countryOptions = Country.getAllCountries().map(
      ({ isoCode, name }) => ({
        label: name,
        value: isoCode,
      })
    );
    setCountries(countryOptions);
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const stateOptions = State.getStatesOfCountry(selectedCountry).map(
        ({ isoCode, name }) => ({
          label: name,
          value: isoCode,
        })
      );
      setStates(stateOptions);
    } else {
      setStates([]);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState) {
      const cityOptions = City.getCitiesOfState(
        selectedCountry,
        selectedState
      ).map(({ name }) => ({
        label: name,
        value: name,
      }));
      setCities(cityOptions);
    } else {
      setCities([]);
    }
  }, [selectedState]);

  return (
    <div>
      <Select
        options={countries}
        onChange={(option) => setSelectedCountry(option.value)}
        placeholder="Select Country"
      />
      <Select
        options={states}
        onChange={(option) => setSelectedState(option.value)}
        placeholder="Select State"
        isDisabled={!selectedCountry}
      />
      <Select
        options={cities}
        onChange={(option) => setSelectedCity(option.value)}
        placeholder="Select City"
        isDisabled={!selectedState}
      />
    </div>
  );
};

export default Location;
