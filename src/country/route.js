const { Router } = require("express");
const { addCountry, updateCountry, getCountry, getCountriesList, deleteCountry } = require("./controllers/country");
const router = Router();

router.post("/add", addCountry);
router.put("/update", updateCountry);
router.get("/:id", getCountry);
router.get("/", getCountriesList);
router.delete("/:id", deleteCountry);

module.exports = router;