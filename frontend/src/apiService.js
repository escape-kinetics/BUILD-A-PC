import axios from 'axios';

// Set the base URL for your FastAPI backend
const API_URL = 'http://localhost:8000'; // Or whatever port you run it on

const api = axios.create({
  baseURL: API_URL,
});

// === Authentication ===

export const loginUser = (username, password) => {
  return api.post('/auth/login', { username, password });
};

export const signupUser = (username, pwd) => {
  return api.post('/auth/signup', { username, pwd });
};

// === Public (User) Endpoints ===

export const fetchParts = (category, page = 1, limit = 10) => {
  return api.get(`/fetch/${category}?page=${page}&limit=${limit}`);
};

// Generic fetch for tables (used by admin dashboard) — returns full paginated response
export const fetchTable = (table, page = 1, limit = 100) => {
  return api.get(`/fetch/${table}?page=${page}&limit=${limit}`);
};
export const fetchSinglePart = (category, id) => {
  return api.get(`/fetch/${category}/${id}`);
};

export const getAllBuildDetails = () => {
  return api.get('/builds/details/all');
};

export const getBuildWithPrices = (buildId) => {
  return api.get(`/builds/${buildId}/prices`);
};

export const getBuildSummary = (buildId) => {
  return api.get(`/builds/${buildId}`);
};

export const createBuild = (buildData) => {
  // buildData should match your BuildCreate Pydantic model
  return api.post('/builds', buildData);
};

export const updateBuild = (buildId, buildUpdateData) => {
  // buildUpdateData should match your BuildUpdate Pydantic model
  return api.put(`/builds/${buildId}`, buildUpdateData);
};

export const deleteBuild = (buildId) => {
  return api.delete(`/builds/${buildId}`);
};

export const checkCompatibility = (comp1, id1, comp2, id2) => {
  return api.get(`/compatibility/${comp1}/${id1}/${comp2}/${id2}`);
};

export const searchParts = (category, keyword = "", minPrice = 0, maxPrice = 999999) => {
  return api.get(`/search/${category}?keyword=${keyword}&min_price=${minPrice}&max_price=${maxPrice}`);
};

export const estimatePower = (buildId) => {
  return api.get(`/power/${buildId}`);
};

export const getCompatibleParts = (category, buildState) => {
  return api.post(`/parts/compatible/${category}`, buildState);
};

// === Admin Endpoints ===
export const getCompatiblePSUs = (gpuId, caseId) => {
  return api.post(`/psus/compatibility?gpu_id=${gpuId}&case_id=${caseId}`);
};

export const adminCreateItem = (tableName, item) => {
  return api.post(`/admin/${tableName}`, item);
};

export const adminUpdateItem = (tableName, itemId, item) => {
  return api.put(`/admin/${tableName}/${itemId}`, item);
};

export const adminDeleteItem = (tableName, itemId) => {
  return api.delete(`/admin/${tableName}/${itemId}`);
};

export const adminUpdateAttribute = (tableName, itemId, column, value) => {
  return api.patch(`/admin/${tableName}/${itemId}/${column}`, { value });
};

export const getPartCounts = () => {
  return api.get('/parts/counts');
};

export const getHighPowerBuilds = () => {
  return api.get('/builds/analytics/high-power');
};

// Export default for easy import
const apiService = {
  loginUser,
  signupUser,
  fetchParts,
  fetchTable,
  fetchSinglePart,
  getAllBuildDetails,
  getBuildSummary,
  createBuild,
  updateBuild,
  deleteBuild,
  checkCompatibility,
  searchParts, 
  estimatePower,
  getCompatibleParts,
  getCompatiblePSUs,
  adminCreateItem,
  adminUpdateItem,
  adminDeleteItem,
  adminUpdateAttribute,
  getPartCounts,
  getHighPowerBuilds,
};

export default apiService;
