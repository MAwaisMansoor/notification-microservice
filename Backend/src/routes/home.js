import { Router } from "express";
const router = Router();

router.get("/", async (req, res) => {
  res.send("You have reached Home of the application.");
});

export const home = router;
