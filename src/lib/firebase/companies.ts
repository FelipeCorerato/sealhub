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
  limit,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Company, CompanyData, CreateCompanyData, UpdateCompanyData } from '@/types'

const COLLECTION_NAME = 'companies'

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
 * Converte um documento do Firestore para Company
 */
function docToCompany(id: string, data: DocumentData): Company {
  return {
    id,
    cnpj: data.cnpj,
    name: data.name,
    legalName: data.legalName,
    address: data.address,
    type: data.type,
    status: data.status,
    phone: data.phone,
    email: data.email,
    contactPerson: data.contactPerson,
    notes: data.notes,
    createdAt: timestampToDate(data.createdAt),
    createdBy: data.createdBy,
    updatedAt: timestampToDate(data.updatedAt),
    lastSyncedAt: data.lastSyncedAt ? timestampToDate(data.lastSyncedAt) : undefined,
  }
}

// ===== CRUD OPERATIONS =====

/**
 * Cria uma nova empresa no Firestore
 */
export async function createCompany(
  companyData: CreateCompanyData,
): Promise<Company> {
  const companiesRef = collection(db, COLLECTION_NAME)

  const docData = {
    ...companyData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }

  const docRef = await addDoc(companiesRef, docData)
  const newDoc = await getDoc(docRef)

  if (!newDoc.exists()) {
    throw new Error('Erro ao criar empresa')
  }

  return docToCompany(docRef.id, newDoc.data())
}

/**
 * Busca uma empresa por ID
 */
export async function getCompanyById(id: string): Promise<Company | null> {
  const docRef = doc(db, COLLECTION_NAME, id)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  return docToCompany(docSnap.id, docSnap.data())
}

/**
 * Busca uma empresa por CNPJ
 */
export async function getCompanyByCNPJ(cnpj: string): Promise<Company | null> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('cnpj', '==', cnpj),
    limit(1),
  )

  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
    return null
  }

  const doc = querySnapshot.docs[0]
  return docToCompany(doc.id, doc.data())
}

/**
 * Busca empresas por nome (pesquisa parcial - case insensitive)
 */
export async function searchCompaniesByName(searchTerm: string): Promise<Company[]> {
  // Nota: Firestore não suporta busca case-insensitive nativamente
  // Esta implementação busca todas e filtra no cliente
  // Para produção, considere usar Algolia ou similar
  
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('name'),
  )

  const querySnapshot = await getDocs(q)
  const normalizedSearch = searchTerm.toLowerCase()

  const companies: Company[] = []
  querySnapshot.forEach((doc) => {
    const company = docToCompany(doc.id, doc.data())
    if (company.name.toLowerCase().includes(normalizedSearch)) {
      companies.push(company)
    }
  })

  return companies
}

/**
 * Busca empresas por parte do CNPJ
 */
export async function searchCompaniesByCNPJ(cnpjPart: string): Promise<Company[]> {
  // Remove formatação do CNPJ de busca
  const cleanedCnpjPart = cnpjPart.replace(/[^\d]/g, '')
  
  // Similar ao searchByName, busca todas e filtra no cliente
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('cnpj'),
  )

  const querySnapshot = await getDocs(q)
  const companies: Company[] = []

  querySnapshot.forEach((doc) => {
    const company = docToCompany(doc.id, doc.data())
    // Remove formatação do CNPJ do documento para comparação
    const cleanedCnpj = company.cnpj.replace(/[^\d]/g, '')
    if (cleanedCnpj.includes(cleanedCnpjPart)) {
      companies.push(company)
    }
  })

  return companies
}

/**
 * Lista todas as empresas
 */
export async function getAllCompanies(): Promise<Company[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('name'),
  )

  const querySnapshot = await getDocs(q)
  const companies: Company[] = []

  querySnapshot.forEach((doc) => {
    companies.push(docToCompany(doc.id, doc.data()))
  })

  return companies
}

/**
 * Atualiza uma empresa
 */
export async function updateCompany(
  id: string,
  updates: UpdateCompanyData,
): Promise<Company> {
  const docRef = doc(db, COLLECTION_NAME, id)

  const updateData = {
    ...updates,
    updatedAt: Timestamp.now(),
  }

  await updateDoc(docRef, updateData)

  const updatedDoc = await getDoc(docRef)
  if (!updatedDoc.exists()) {
    throw new Error('Empresa não encontrada')
  }

  return docToCompany(updatedDoc.id, updatedDoc.data())
}

/**
 * Deleta uma empresa
 */
export async function deleteCompany(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id)
  await deleteDoc(docRef)
}

/**
 * Verifica se um CNPJ já está cadastrado
 */
export async function cnpjExists(cnpj: string): Promise<boolean> {
  const company = await getCompanyByCNPJ(cnpj)
  return company !== null
}

/**
 * Cria ou atualiza uma empresa a partir de dados da Receita Federal
 */
export async function upsertCompanyFromReceita(
  receitaData: CompanyData,
  userId: string,
): Promise<Company> {
  // Verifica se já existe
  const existing = await getCompanyByCNPJ(receitaData.cnpj)

  if (existing) {
    // Atualiza com os novos dados da Receita
    return updateCompany(existing.id, {
      ...receitaData,
      lastSyncedAt: new Date(),
    })
  } else {
    // Cria novo
    return createCompany({
      ...receitaData,
      createdBy: userId,
      lastSyncedAt: new Date(),
    })
  }
}

