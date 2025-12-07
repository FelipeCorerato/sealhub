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
import { getCNPJBase, onlyNumbers } from '@/lib/cnpj'

const COLLECTION_NAME = 'companies'

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
 * Converte um documento do Firestore para Company
 */
function docToCompany(id: string, data: DocumentData): Company {
  return {
    id,
    organizationId: data.organizationId,
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

/**
 * Prepara dados da empresa para salvar no Firestore, incluindo campos de relacionamento
 */
function prepareCompanyData(
  companyData: CompanyData | Company,
  userId: string,
  headquartersId?: string
): Record<string, unknown> {
  const cnpjBase = getCNPJBase(companyData.cnpj)
  
  const baseData: Record<string, unknown> = {
    cnpj: companyData.cnpj,
    name: companyData.name,
    address: companyData.address,
    type: companyData.type,
    status: companyData.status,
    // Campos de relacionamento
    cnpjBase, // Base do CNPJ (8 primeiros dígitos) - identifica matriz e filiais relacionadas
    createdBy: userId,
  }
  
  // Adiciona organizationId se presente (obrigatório para multi-tenant)
  if ('organizationId' in companyData && companyData.organizationId) {
    baseData.organizationId = companyData.organizationId
  }
  
  // Adiciona campos opcionais que podem existir em Company
  if ('legalName' in companyData && companyData.legalName) {
    baseData.legalName = companyData.legalName
  }
  if ('phone' in companyData && companyData.phone) {
    baseData.phone = companyData.phone
  }
  if ('email' in companyData && companyData.email) {
    baseData.email = companyData.email
  }
  if ('contactPerson' in companyData && companyData.contactPerson) {
    baseData.contactPerson = companyData.contactPerson
  }
  if ('notes' in companyData && companyData.notes) {
    baseData.notes = companyData.notes
  }
  if ('lastSyncedAt' in companyData && companyData.lastSyncedAt) {
    baseData.lastSyncedAt = companyData.lastSyncedAt instanceof Date
      ? Timestamp.fromDate(companyData.lastSyncedAt)
      : companyData.lastSyncedAt
  }
  
  // Se for filial e tiver ID da matriz, adiciona referência
  if (companyData.type === 'branch' && headquartersId) {
    baseData.headquartersId = headquartersId
  }
  
  // Se for matriz, marca como matriz
  if (companyData.type === 'headquarters') {
    baseData.isHeadquarters = true
  }
  
  return baseData
}

// ===== CRUD OPERATIONS =====

/**
 * Cria uma nova empresa no Firestore
 */
export async function createCompany(
  companyData: CreateCompanyData,
  headquartersId?: string,
): Promise<Company> {
  const companiesRef = collection(db, COLLECTION_NAME)

  const docData = prepareCompanyData(
    companyData,
    companyData.createdBy,
    headquartersId
  )

  docData.createdAt = Timestamp.now()
  docData.updatedAt = Timestamp.now()

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
 * Busca uma empresa por CNPJ dentro de uma organização
 * @param cnpj - CNPJ da empresa
 * @param organizationId - ID da organização
 */
export async function getCompanyByCNPJ(cnpj: string, organizationId: string): Promise<Company | null> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', organizationId),
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
 * Busca empresas por nome dentro de uma organização (pesquisa parcial - case insensitive)
 * @param searchTerm - Termo de busca
 * @param organizationId - ID da organização
 */
export async function searchCompaniesByName(searchTerm: string, organizationId: string): Promise<Company[]> {
  // Nota: Firestore não suporta busca case-insensitive nativamente
  // Esta implementação busca todas e filtra no cliente
  // Para produção, considere usar Algolia ou similar
  
  const q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', organizationId),
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
 * Busca empresas por parte do CNPJ dentro de uma organização
 * @param cnpjPart - Parte do CNPJ para buscar
 * @param organizationId - ID da organização
 */
export async function searchCompaniesByCNPJ(cnpjPart: string, organizationId: string): Promise<Company[]> {
  // Remove formatação do CNPJ de busca
  const cleanedCnpjPart = cnpjPart.replace(/[^\d]/g, '')
  
  // Similar ao searchByName, busca todas e filtra no cliente
  const q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', organizationId),
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
 * Lista todas as empresas de uma organização
 * @param organizationId - ID da organização
 */
export async function getAllCompanies(organizationId: string): Promise<Company[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', organizationId),
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
 * Verifica se um CNPJ já está cadastrado em uma organização
 * @param cnpj - CNPJ a verificar
 * @param organizationId - ID da organização
 */
export async function cnpjExists(cnpj: string, organizationId: string): Promise<boolean> {
  const company = await getCompanyByCNPJ(cnpj, organizationId)
  return company !== null
}

/**
 * Cria ou atualiza uma empresa a partir de dados da Receita Federal
 * @param receitaData - Dados da empresa vindos da Receita Federal
 * @param userId - ID do usuário
 * @param organizationId - ID da organização
 * @param headquartersId - ID da matriz (opcional, para filiais)
 */
export async function upsertCompanyFromReceita(
  receitaData: CompanyData,
  userId: string,
  organizationId: string,
  headquartersId?: string,
): Promise<Company> {
  // Verifica se já existe na organização
  const existing = await getCompanyByCNPJ(receitaData.cnpj, organizationId)

  if (existing) {
    // Atualiza com os novos dados da Receita
    const updateData: Record<string, unknown> = {
      ...receitaData,
      lastSyncedAt: new Date(),
    }
    
    // Atualiza campos de relacionamento se necessário
    const cnpjBase = getCNPJBase(receitaData.cnpj)
    updateData.cnpjBase = cnpjBase
    
    if (receitaData.type === 'branch' && headquartersId) {
      updateData.headquartersId = headquartersId
    }
    
    return updateCompany(existing.id, updateData)
  } else {
    // Cria novo
    const companyData = {
      ...receitaData,
      organizationId,
      createdBy: userId,
      lastSyncedAt: new Date(),
    }
    return createCompany(companyData, headquartersId)
  }
}

/**
 * Salva matriz e filiais relacionadas no Firestore
 * Estabelece relacionamento entre matriz e filiais
 * 
 * @param matrizData - Dados da matriz
 * @param filiaisData - Array com dados das filiais a serem salvas
 * @param userId - ID do usuário que está salvando
 * @param organizationId - ID da organização
 * @returns Array com matriz e filiais salvas
 */
export async function saveMatrizAndBranches(
  matrizData: CompanyData,
  filiaisData: CompanyData[],
  userId: string,
  organizationId: string,
): Promise<{ matriz: Company; filiais: Company[] }> {
  // 1. Salva a matriz primeiro
  const matriz = await upsertCompanyFromReceita(matrizData, userId, organizationId)
  
  // 2. Salva todas as filiais, referenciando a matriz
  const filiais: Company[] = []
  
  for (const filialData of filiaisData) {
    try {
      const filial = await upsertCompanyFromReceita(
        filialData,
        userId,
        organizationId,
        matriz.id // ID da matriz como referência
      )
      filiais.push(filial)
    } catch (error) {
      console.error(`Erro ao salvar filial ${filialData.cnpj}:`, error)
      // Continua salvando outras filiais mesmo se uma falhar
    }
  }
  
  return { matriz, filiais }
}

/**
 * Busca matriz e todas as filiais relacionadas a um CNPJ dentro de uma organização
 * Se o CNPJ fornecido for de uma filial, busca a matriz e todas as outras filiais
 * Se o CNPJ fornecido for de uma matriz, busca a matriz e todas as filiais
 * 
 * @param cnpj - CNPJ da matriz ou de qualquer filial
 * @param organizationId - ID da organização
 * @returns Array com empresas ordenadas: matriz primeiro, depois filiais
 */
export async function searchRelatedCompanies(cnpj: string, organizationId: string): Promise<Company[]> {
  // Extrai o número base (8 primeiros dígitos)
  const base = getCNPJBase(cnpj)
  
  // Busca todas as empresas da organização
  const q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', organizationId),
    orderBy('cnpj'),
  )

  const querySnapshot = await getDocs(q)
  const companies: Company[] = []

  querySnapshot.forEach((doc) => {
    const company = docToCompany(doc.id, doc.data())
    const companyCnpj = onlyNumbers(company.cnpj)
    const companyBase = getCNPJBase(companyCnpj)
    
    // Se o número base for o mesmo, é uma empresa relacionada
    if (companyBase === base) {
      companies.push(company)
    }
  })

  // Ordena: matriz primeiro (0001), depois filiais em ordem numérica
  companies.sort((a, b) => {
    const cnpjA = onlyNumbers(a.cnpj)
    const cnpjB = onlyNumbers(b.cnpj)
    return cnpjA.localeCompare(cnpjB)
  })

  return companies
}

