import React, { useEffect, useState } from "react";

//Key for FoodData API
//TODO: Improve security, should do .env file
const KEY = "wanopqgWN22qXI0xMejeJ7q2sp1wpAZNj3sT7RhN";

//Maximum length of autocomplete list
const AUTO_COMP_LENGTH = 10;

//Data types to be included in the search results
const TYPE_FILTER = ["Foundation", "SR Legacy", "Branded"];

const food = function (fdcId, description, nutrition, amount) {
  this.fdcId = fdcId;
  this.description = description;
  this.nutrition = nutrition;
  this.amount = amount;
};

//Adds a food item to the list
function AddFood(id, setDesc) {
  fetch(
    "https://api.nal.usda.gov/fdc/v1/food/" +
      id +
      "?api_key=" +
      KEY +
      "&nutrients=208"
  )
    .then((response) => response.json())
    .then((data) => {
      let cal = null;
      let g = 100;
      let modi = "100 grams";
      for (let i = 0; i < data.foodNutrients.length; i++) {
        if (data.foodNutrients[i].nutrient.id === 1008) {
          cal = data.foodNutrients[i].amount;
        }
      }
      if (data.foodPortions) {
        modi = data.foodPortions[0].modifier;
        g = data.foodPortions[0].gramWeight;
      }
      cal = (cal * g) / 100;
      setDesc((prev) => [
        ...prev,
        new food(data.fdcId, data.description, cal, modi)
      ]);
    });
}

//removes a food item at index from the list
function SubFood(index, setDesc, desc) {
  const temp = [...desc];
  temp.splice(index, 1);
  setDesc(temp);
}

//Autocompletes a list based on the string input
//Currently the main function; this will change later
function Autocomplete() {
  const [inputValue, setInputValue] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);
  //  const [qnt, setQnt] = useState([]);
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
        "&dataType=" +
        TYPE_FILTER +
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
              onClick={() => AddFood(option.fdcId, setDesc)}
            >
              {option.description}
            </button>
          </li>
        ))}
      </ul>
      <ul>
        {desc.map((item, indx) => (
          <li key={indx}>
            {item.description} {item.amount} {item.nutrition}
            <button
              className="link"
              onClick={() => SubFood(indx, setDesc, desc)}
            >
              Delete Entry
            </button>
          </li>
        ))}
      </ul>
      <p> Total Calories: {total}</p>
      <button className="link" onClick={() => setDesc([])}>
        Reset Counter
      </button>
    </div>
  );
}

export default Autocomplete;
