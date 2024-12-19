// src/lib/utils/constants.js
export const MESSAGES = {
  LOADING: "Loading...",
  NO_EPISODES: "No episodes found. Please add some data to Firestore!",
  NO_EPISODE_FOUND: "Episode not found",
  LOGIN_FAILED: "Login failed. Please try again.",
  LOGOUT_FAILED: "Logout failed. Please try again.",
  FACT_CHECKS_LOADING: "Loading fact checks...",
  FACT_CHECKS_ERROR: "Error loading fact checks: ",
};

export const LAYOUT = {
  SIDEBAR_WIDTH: 'w-[850px]',
  SIDEBAR_MIN_WIDTH: 'min-w-[850px]',
  CONTENT_WIDTH: 'w-[calc(100%-882px)]', // 500px + 32px gap
  SIDEBAR_GAP: 'gap-8',
};

export const FACT_CHECK = {
  VIEWPORT_PADDING: 100,
  FACT_CHECK_GAP: 16,
  FACT_CHECK_HEIGHT: 200,
  COLLAPSED_HEIGHT: 64
};