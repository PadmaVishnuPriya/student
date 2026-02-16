const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getStudents, deleteStudent } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/students", authMiddleware, getStudents);
router.delete("/:id", authMiddleware, deleteStudent);

module.exports = router;
