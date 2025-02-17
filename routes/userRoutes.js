const express = require("express");
const { getTurfsByLocation, getAllTurfs,searchTurfs,createBooking,addContact,availableTurfs} = require("../controllers/userController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/turfs", getTurfsByLocation);
router.get("/getallturfs", getAllTurfs);
router.get("/searchTurfs", searchTurfs);
router.post("/booking", createBooking);
router.post("/contact", addContact);
// router.post("/availableTurfs", availableTurfs);

module.exports = router;
