// Re-export Firebase services

// Companies
export {
  createCompany,
  getCompanyById,
  getCompanyByCNPJ,
  searchCompaniesByName,
  searchCompaniesByCNPJ,
  getAllCompanies,
  updateCompany,
  deleteCompany,
  cnpjExists,
  upsertCompanyFromReceita,
} from './companies'

// Campaigns
export {
  createCampaign,
  getCampaignById,
  searchCampaignsByName,
  getCampaignsByStatus,
  getAllCampaigns,
  updateCampaign,
  deleteCampaign,
  getCampaignsByUser,
} from './campaigns'

// Users
export {
  upsertUserProfile,
  getUserProfile,
  getUserProfiles,
  getUserDisplayName,
  type UserProfile,
} from './users'

