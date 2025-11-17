import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Campaign, CreateCampaignData, UpdateCampaignData, Company } from '@/types'
import { getCompanyById } from './companies'

const COLLECTION_NAME = 'campaigns'

// ===== HELPERS =====

/**
 * Converte Timestamp do Firestore para Date
 */
function timestampToDate(timestamp: Timestamp | Date | null | undefined): Date {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate()
  }
  if (timestamp instanceof Date) {
    return timestamp
  }
  return new Date()
}

/**
 * Converte um documento do Firestore para Campaign
 */
function docToCampaign(id: string, data: DocumentData): Campaign {
  return {
    id,
    name: data.name,
    sender: data.sender,
    observation: data.observation,
    instructions: data.instructions,
    organizationId: data.organizationId,
    companyIds: data.companyIds || [],
    status: data.status,
    createdAt: timestampToDate(data.createdAt),
    createdBy: data.createdBy,
    updatedAt: timestampToDate(data.updatedAt),
    updatedBy: data.updatedBy || data.createdBy, // Fallback para createdBy caso não exista
  }
}

// ===== CRUD OPERATIONS =====

/**
 * Cria uma nova campanha no Firestore
 */
export async function createCampaign(
  campaignData: CreateCampaignData,
): Promise<Campaign> {
  const campaignsRef = collection(db, COLLECTION_NAME)

  const now = Timestamp.now()
  const docData = {
    ...campaignData,
    createdAt: now,
    updatedAt: now,
    updatedBy: campaignData.createdBy, // Inicialmente, quem criou é quem atualizou
  }

  const docRef = await addDoc(campaignsRef, docData)
  const newDoc = await getDoc(docRef)

  if (!newDoc.exists()) {
    throw new Error('Erro ao criar campanha')
  }

  return docToCampaign(docRef.id, newDoc.data())
}

/**
 * Busca uma campanha por ID
 */
export async function getCampaignById(id: string): Promise<Campaign | null> {
  const docRef = doc(db, COLLECTION_NAME, id)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  return docToCampaign(docSnap.id, docSnap.data())
}

/**
 * Busca campanhas por nome (pesquisa parcial - case insensitive)
 * @param searchTerm - Termo de busca
 * @param organizationId - ID da organização
 */
export async function searchCampaignsByName(searchTerm: string, organizationId: string): Promise<Campaign[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', organizationId),
    orderBy('name'),
  )

  const querySnapshot = await getDocs(q)
  const normalizedSearch = searchTerm.toLowerCase()

  const campaigns: Campaign[] = []
  querySnapshot.forEach((doc) => {
    const campaign = docToCampaign(doc.id, doc.data())
    if (campaign.name.toLowerCase().includes(normalizedSearch)) {
      campaigns.push(campaign)
    }
  })

  return campaigns
}

/**
 * Busca campanhas por status
 * @param status - Status da campanha
 * @param organizationId - ID da organização
 */
export async function getCampaignsByStatus(status: string, organizationId: string): Promise<Campaign[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', organizationId),
    where('status', '==', status),
    orderBy('createdAt', 'desc'),
  )

  const querySnapshot = await getDocs(q)
  const campaigns: Campaign[] = []

  querySnapshot.forEach((doc) => {
    campaigns.push(docToCampaign(doc.id, doc.data()))
  })

  return campaigns
}

/**
 * Lista todas as campanhas de uma organização
 * @param organizationId - ID da organização
 */
export async function getAllCampaigns(organizationId: string): Promise<Campaign[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', organizationId),
    orderBy('createdAt', 'desc'),
  )

  const querySnapshot = await getDocs(q)
  const campaigns: Campaign[] = []

  querySnapshot.forEach((doc) => {
    campaigns.push(docToCampaign(doc.id, doc.data()))
  })

  return campaigns
}

/**
 * Atualiza uma campanha
 * @param id - ID da campanha
 * @param updates - Dados a serem atualizados
 * @param userId - ID do usuário que está fazendo a atualização
 */
export async function updateCampaign(
  id: string,
  updates: UpdateCampaignData,
  userId: string,
): Promise<Campaign> {
  const docRef = doc(db, COLLECTION_NAME, id)

  const updateData = {
    ...updates,
    updatedAt: Timestamp.now(),
    updatedBy: userId,
  }

  await updateDoc(docRef, updateData)

  const updatedDoc = await getDoc(docRef)
  if (!updatedDoc.exists()) {
    throw new Error('Campanha não encontrada')
  }

  return docToCampaign(updatedDoc.id, updatedDoc.data())
}

/**
 * Deleta uma campanha
 */
export async function deleteCampaign(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id)
  await deleteDoc(docRef)
}

/**
 * Adiciona clientes a uma campanha existente
 * @param campaignId - ID da campanha
 * @param newCompanyIds - IDs dos novos clientes a serem adicionados
 * @param userId - ID do usuário que está fazendo a atualização
 * @returns Campanha atualizada
 */
export async function addCompaniesToCampaign(
  campaignId: string,
  newCompanyIds: string[],
  userId: string,
): Promise<Campaign> {
  const docRef = doc(db, COLLECTION_NAME, campaignId)
  const campaignDoc = await getDoc(docRef)

  if (!campaignDoc.exists()) {
    throw new Error('Campanha não encontrada')
  }

  const currentCampaign = docToCampaign(campaignDoc.id, campaignDoc.data())
  
  // Remove duplicatas - apenas adiciona IDs que ainda não existem
  const existingIds = new Set(currentCampaign.companyIds)
  const uniqueNewIds = newCompanyIds.filter(id => !existingIds.has(id))
  
  if (uniqueNewIds.length === 0) {
    throw new Error('Todos os clientes selecionados já estão vinculados a esta campanha')
  }

  const updatedCompanyIds = [...currentCampaign.companyIds, ...uniqueNewIds]

  const updateData = {
    companyIds: updatedCompanyIds,
    updatedAt: Timestamp.now(),
    updatedBy: userId,
  }

  await updateDoc(docRef, updateData)

  const updatedDoc = await getDoc(docRef)
  if (!updatedDoc.exists()) {
    throw new Error('Erro ao atualizar campanha')
  }

  return docToCampaign(updatedDoc.id, updatedDoc.data())
}

/**
 * Busca campanhas de um usuário específico dentro de uma organização
 * @param userId - ID do usuário
 * @param organizationId - ID da organização
 */
export async function getCampaignsByUser(userId: string, organizationId: string): Promise<Campaign[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', organizationId),
    where('createdBy', '==', userId),
    orderBy('createdAt', 'desc'),
  )

  const querySnapshot = await getDocs(q)
  const campaigns: Campaign[] = []

  querySnapshot.forEach((doc) => {
    campaigns.push(docToCampaign(doc.id, doc.data()))
  })

  return campaigns
}

/**
 * Tipo extendido de Campaign com os clientes populados
 */
export interface CampaignWithCompanies extends Campaign {
  companies: Company[]
}

/**
 * Popula os dados das empresas em uma campanha
 */
async function populateCampaignCompanies(
  campaign: Campaign,
): Promise<CampaignWithCompanies> {
  const companies: Company[] = []

  for (const companyId of campaign.companyIds) {
    try {
      const company = await getCompanyById(companyId)
      if (company) {
        companies.push(company)
      }
    } catch (error) {
      console.error(`Erro ao buscar empresa ${companyId}:`, error)
    }
  }

  return {
    ...campaign,
    companies,
  }
}

/**
 * Busca campanhas por nome com clientes populados
 * @param searchTerm - Termo de busca
 * @param organizationId - ID da organização
 */
export async function searchCampaignsWithCompaniesByName(
  searchTerm: string,
  organizationId: string,
): Promise<CampaignWithCompanies[]> {
  const campaigns = await searchCampaignsByName(searchTerm, organizationId)
  const campaignsWithCompanies: CampaignWithCompanies[] = []

  for (const campaign of campaigns) {
    const populated = await populateCampaignCompanies(campaign)
    campaignsWithCompanies.push(populated)
  }

  return campaignsWithCompanies
}

/**
 * Busca campanhas por nome do cliente
 * @param companyNameSearch - Nome do cliente a buscar
 * @param organizationId - ID da organização
 */
export async function searchCampaignsByCompanyName(
  companyNameSearch: string,
  organizationId: string,
): Promise<CampaignWithCompanies[]> {
  // Busca todas as campanhas da organização
  const allCampaigns = await getAllCampaigns(organizationId)
  const normalizedSearch = companyNameSearch.toLowerCase()
  const matchingCampaigns: CampaignWithCompanies[] = []

  for (const campaign of allCampaigns) {
    const populated = await populateCampaignCompanies(campaign)
    
    // Verifica se alguma empresa da campanha corresponde à busca
    const hasMatchingCompany = populated.companies.some((company) =>
      company.name.toLowerCase().includes(normalizedSearch),
    )

    if (hasMatchingCompany) {
      matchingCampaigns.push(populated)
    }
  }

  return matchingCampaigns
}

/**
 * Lista todas as campanhas com clientes populados de uma organização
 * @param organizationId - ID da organização
 */
export async function getAllCampaignsWithCompanies(organizationId: string): Promise<
  CampaignWithCompanies[]
> {
  const campaigns = await getAllCampaigns(organizationId)
  const campaignsWithCompanies: CampaignWithCompanies[] = []

  for (const campaign of campaigns) {
    const populated = await populateCampaignCompanies(campaign)
    campaignsWithCompanies.push(populated)
  }

  return campaignsWithCompanies
}

