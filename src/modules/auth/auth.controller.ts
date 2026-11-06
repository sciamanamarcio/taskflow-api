import { asyncHandler } from "../../lib/async-handler";
import * as authService from "./auth.service";

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.json(result);
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.userId!);
  res.json({ user });
});
