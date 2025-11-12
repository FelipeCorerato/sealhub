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
import type { Campaign, CreateCampaignData, UpdateCampaignData } from '@/types'

const COLLECTION_NAME = 'campaigns'

// ===== HELPERS =====

/**
 * Converte Timestamp do Firestore para Date
 */
function timestampToDate(timestamp: any): Date {
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
    companyIds: data.companyIds || [],
    status: data.status,
    createdAt: timestampToDate(data.createdAt),
    createdBy: data.createdBy,
    updatedAt: timestampToDate(data.updatedAt),
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

  const docData = {
    ...campaignData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
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
 */
export async function searchCampaignsByName(searchTerm: string): Promise<Campaign[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
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
 */
export async function getCampaignsByStatus(status: string): Promise<Campaign[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
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
 * Lista todas as campanhas
 */
export async function getAllCampaigns(): Promise<Campaign[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
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
 */
export async function updateCampaign(
  id: string,
  updates: UpdateCampaignData,
): Promise<Campaign> {
  const docRef = doc(db, COLLECTION_NAME, id)

  const updateData = {
    ...updates,
    updatedAt: Timestamp.now(),
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
 * Busca campanhas de um usuário específico
 */
export async function getCampaignsByUser(userId: string): Promise<Campaign[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
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

