import React, { useEffect, useState } from "react";

const KEY = "DEMO_KEY";
const AUTO_COMP_LENGTH = 10;

const food = function (fdcId, description, nutrition) {
  this.fdcId = fdcId;
  this.description = description;
  this.nutrition = nutrition;
};

function AddFood(id, setDesc, desc) {
  fetch(
    "https://api.nal.usda.gov/fdc/v1/food/" +
      id +
      "?api_key=" +
      KEY +
      "&nutrients=208&format=abridged"
  )
    .then((response) => response.json())
    .then((data) => {
      const cal = data.foodNutrients.map((nut) => nut.amount);
      setDesc((prev) => [
        ...prev,
        new food(data.fdcId, data.description, cal[0])
      ]);
    });
}

function Autocomplete() {
  const [inputValue, setInputValue] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [desc, setDesc] = useState([]);
  const [total, setTotal] = useState(0);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  useEffect(() => {
    const s = desc.map((a) => a.nutrition);
    const sum = s.reduce((acc, nutrition) => acc + nutrition, 0);
    setTotal(sum);
  }, [desc]);

  useEffect(() => {
    fetch(
      "https://api.nal.usda.gov/fdc/v1/foods/search?api_key=" +
        KEY +
        "&query=" +
        inputValue +
        "&pageSize=" +
        AUTO_COMP_LENGTH
    )
      .then((response) => response.json())
      .then((data) => setFilteredOptions(data.foods));
  }, [inputValue]);

  return (
    <div>
      <input type="text" value={inputValue} onChange={handleInputChange} />
      <ul>
        {filteredOptions.map((option, index) => (
          <li key={index}>
            <button
              className="link"
              onClick={() => AddFood(option.fdcId, setDesc, desc)}
            >
              {option.description}
            </button>
          </li>
        ))}
      </ul>
      <ul>
        {desc.map((item, index) => (
          <li key={index}>
            {item.description}
            {item.nutrition}
          </li>
        ))}
      </ul>
      <p> Total Calories: {total}</p>
    </div>
  );
}

export default Autocomplete;
