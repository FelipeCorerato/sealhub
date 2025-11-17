/**
 * Funções para gerenciar organizações no Firestore
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import type { DocumentData } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type {
  Organization,
  OrganizationMember,
  CreateOrganizationData,
  UpdateOrganizationData,
  EmailDomain,
} from '@/types/organization'

const ORGANIZATIONS_COLLECTION = 'organizations'
const ORGANIZATION_MEMBERS_COLLECTION = 'organizationMembers'

// ===== CONVERSORES =====

function timestampToDate(timestamp: unknown): Date {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate()
  }
  if (timestamp instanceof Date) {
    return timestamp
  }
  return new Date()
}

function firestoreToOrganization(id: string, data: DocumentData): Organization {
  return {
    id,
    name: data.name || '',
    tradeName: data.tradeName,
    cnpj: data.cnpj,
    description: data.description,
    status: data.status || 'active',
    emailDomains: (data.emailDomains || []).map((domain: DocumentData) => ({
      domain: domain.domain,
      active: domain.active ?? true,
      addedAt: timestampToDate(domain.addedAt),
      addedBy: domain.addedBy || '',
    })),
    theme: {
      primaryColor: data.theme?.primaryColor || '#D97B35',
      primaryHoverColor: data.theme?.primaryHoverColor || '#C16A2A',
      lightBackgroundColor: data.theme?.lightBackgroundColor || '#FFF5ED',
      logoUrl: data.theme?.logoUrl,
      faviconUrl: data.theme?.faviconUrl,
    },
    settings: {
      defaultSender: data.settings?.defaultSender || '',
      defaultSignature: data.settings?.defaultSignature,
      campaignCodePrefix: data.settings?.campaignCodePrefix,
      timezone: data.settings?.timezone || 'America/Sao_Paulo',
      language: data.settings?.language || 'pt-BR',
    },
    adminUsers: data.adminUsers || [],
    plan: data.plan,
    limits: data.limits,
    createdAt: timestampToDate(data.createdAt),
    createdBy: data.createdBy || '',
    updatedAt: timestampToDate(data.updatedAt),
    updatedBy: data.updatedBy || '',
  }
}

function firestoreToOrganizationMember(
  id: string,
  data: DocumentData
): OrganizationMember {
  return {
    id,
    userId: data.userId || '',
    organizationId: data.organizationId || '',
    email: data.email || '',
    name: data.name || '',
    role: data.role || 'member',
    permissions: data.permissions,
    status: data.status || 'active',
    joinedAt: timestampToDate(data.joinedAt),
    invitedBy: data.invitedBy,
  }
}

// ===== CRIAR ORGANIZAÇÃO =====

export async function createOrganization(
  data: CreateOrganizationData,
  userId: string
): Promise<Organization> {
  const orgRef = doc(collection(db, ORGANIZATIONS_COLLECTION))

  const emailDomains: EmailDomain[] = data.emailDomains.map((domain) => ({
    domain: domain.toLowerCase(),
    active: true,
    addedAt: new Date(),
    addedBy: userId,
  }))

  const now = new Date()
  const orgData = {
    name: data.name,
    tradeName: data.tradeName,
    cnpj: data.cnpj,
    description: data.description,
    status: 'active',
    emailDomains,
    theme: {
      primaryColor: data.theme?.primaryColor || '#D97B35',
      primaryHoverColor: data.theme?.primaryHoverColor || '#C16A2A',
      lightBackgroundColor: data.theme?.lightBackgroundColor || '#FFF5ED',
      logoUrl: data.theme?.logoUrl,
      faviconUrl: data.theme?.faviconUrl,
    },
    settings: {
      defaultSender: data.settings?.defaultSender || '',
      defaultSignature: data.settings?.defaultSignature,
      campaignCodePrefix: data.settings?.campaignCodePrefix,
      timezone: data.settings?.timezone || 'America/Sao_Paulo',
      language: data.settings?.language || 'pt-BR',
    },
    adminUsers: [userId],
    plan: 'basic',
    createdAt: now,
    createdBy: userId,
    updatedAt: now,
    updatedBy: userId,
  }

  await setDoc(orgRef, orgData)

  // Adicionar o criador como admin da organização
  await addOrganizationMember(orgRef.id, userId, 'admin', userId)

  return firestoreToOrganization(orgRef.id, orgData)
}

// ===== BUSCAR ORGANIZAÇÃO =====

export async function getOrganization(
  organizationId: string
): Promise<Organization | null> {
  const orgRef = doc(db, ORGANIZATIONS_COLLECTION, organizationId)
  const orgSnap = await getDoc(orgRef)

  if (!orgSnap.exists()) {
    return null
  }

  return firestoreToOrganization(orgSnap.id, orgSnap.data())
}

// ===== ATUALIZAR ORGANIZAÇÃO =====

export async function updateOrganization(
  organizationId: string,
  data: UpdateOrganizationData,
  userId: string
): Promise<void> {
  const orgRef = doc(db, ORGANIZATIONS_COLLECTION, organizationId)

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
    updatedBy: userId,
  }

  if (data.name) updateData.name = data.name
  if (data.tradeName !== undefined) updateData.tradeName = data.tradeName
  if (data.description !== undefined) updateData.description = data.description
  if (data.status) updateData.status = data.status
  
  // Remover campos undefined do theme
  if (data.theme) {
    const cleanTheme: Record<string, unknown> = {}
    Object.entries(data.theme).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanTheme[key] = value
      }
    })
    updateData.theme = cleanTheme
  }
  
  // Remover campos undefined do settings
  if (data.settings) {
    const cleanSettings: Record<string, unknown> = {}
    Object.entries(data.settings).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanSettings[key] = value
      }
    })
    updateData.settings = cleanSettings
  }

  await updateDoc(orgRef, updateData)
}

// ===== BUSCAR POR DOMÍNIO DE EMAIL =====

export async function getOrganizationByEmailDomain(
  email: string
): Promise<Organization | null> {
  const domain = '@' + email.split('@')[1]?.toLowerCase()
  if (!domain || domain === '@') return null

  const orgsRef = collection(db, ORGANIZATIONS_COLLECTION)
  const q = query(
    orgsRef,
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)

  for (const docSnap of snapshot.docs) {
    const org = firestoreToOrganization(docSnap.id, docSnap.data())
    const matchingDomain = org.emailDomains.find(
      (d) => d.active && d.domain.toLowerCase() === domain
    )
    if (matchingDomain) {
      return org
    }
  }

  return null
}

// ===== LISTAR ORGANIZAÇÕES =====

export async function listOrganizations(): Promise<Organization[]> {
  const orgsRef = collection(db, ORGANIZATIONS_COLLECTION)
  const q = query(orgsRef, orderBy('name', 'asc'))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) =>
    firestoreToOrganization(doc.id, doc.data())
  )
}

// ===== MEMBROS DA ORGANIZAÇÃO =====

export async function addOrganizationMember(
  organizationId: string,
  userId: string,
  role: OrganizationMember['role'],
  addedBy: string,
  userEmail?: string,
  userName?: string
): Promise<void> {
  // Usar ID previsível para facilitar regras de segurança: userId_organizationId
  const memberId = `${userId}_${organizationId}`
  const memberRef = doc(db, ORGANIZATION_MEMBERS_COLLECTION, memberId)

  const memberData = {
    userId,
    organizationId,
    email: userEmail || '',
    name: userName || '',
    role,
    status: 'active',
    joinedAt: new Date(),
    invitedBy: addedBy,
  }

  await setDoc(memberRef, memberData)
}

export async function getUserOrganization(
  userId: string
): Promise<Organization | null> {
  try {
    const membersRef = collection(db, ORGANIZATION_MEMBERS_COLLECTION)
    const q = query(membersRef, where('userId', '==', userId), where('status', '==', 'active'))
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return null
    }

    const member = firestoreToOrganizationMember(
      snapshot.docs[0].id,
      snapshot.docs[0].data()
    )
    
    return getOrganization(member.organizationId)
  } catch (error) {
    console.error('Erro ao buscar organização do usuário:', error)
    return null
  }
}

// ===== BUSCAR USUÁRIOS DA ORGANIZAÇÃO POR DOMÍNIO DE EMAIL =====

export async function getOrganizationUsers(
  organizationId: string
): Promise<Array<{
  id: string
  name: string
  email: string
  role: 'admin' | 'member'
  isAssociated: boolean
  createdAt: Date
  emailVerified: boolean
}>> {
  const org = await getOrganization(organizationId)
  if (!org) return []

  // Buscar membros associados
  const membersRef = collection(db, ORGANIZATION_MEMBERS_COLLECTION)
  const membersQuery = query(membersRef, where('organizationId', '==', organizationId))
  const membersSnapshot = await getDocs(membersQuery)
  
  const associatedUserIds = new Set<string>()
  membersSnapshot.docs.forEach((doc) => {
    const memberData = doc.data()
    if (memberData.status === 'active') {
      associatedUserIds.add(memberData.userId)
    }
  })

  // Buscar todos os usuários
  const usersRef = collection(db, 'users')
  const usersSnapshot = await getDocs(usersRef)

  const organizationUsers: Array<{
    id: string
    name: string
    email: string
    role: 'admin' | 'member'
    isAssociated: boolean
    createdAt: Date
    emailVerified: boolean
  }> = []

  // Filtrar usuários que pertencem aos domínios da organização
  usersSnapshot.docs.forEach((doc) => {
    const userData = doc.data()
    const userEmail = userData.email

    if (!userEmail) return

    const userDomain = '@' + userEmail.split('@')[1]?.toLowerCase()
    const belongsToOrg = org.emailDomains.some(
      (d) => d.active && d.domain.toLowerCase() === userDomain
    )

    if (belongsToOrg) {
      const isAdmin = org.adminUsers.includes(doc.id)
      const isAssociated = associatedUserIds.has(doc.id)
      
      organizationUsers.push({
        id: doc.id,
        name: userData.name || 'Sem nome',
        email: userEmail,
        role: isAdmin ? 'admin' : 'member',
        isAssociated,
        createdAt: userData.createdAt?.toDate() || new Date(),
        emailVerified: userData.emailVerified || false,
      })
    }
  })

  // Ordenar por associação (associados primeiro) e depois por nome
  return organizationUsers.sort((a, b) => {
    if (a.isAssociated !== b.isAssociated) {
      return a.isAssociated ? -1 : 1
    }
    return a.name.localeCompare(b.name)
  })
}

// ===== ALTERAR PAPEL DO USUÁRIO NA ORGANIZAÇÃO =====

export async function updateUserRole(
  organizationId: string,
  userId: string,
  newRole: 'admin' | 'member',
  currentUserId: string
): Promise<void> {
  const orgRef = doc(db, ORGANIZATIONS_COLLECTION, organizationId)
  const orgSnap = await getDoc(orgRef)

  if (!orgSnap.exists()) {
    throw new Error('Organização não encontrada')
  }

  const org = firestoreToOrganization(orgSnap.id, orgSnap.data())

  // Verificar se o usuário atual é admin
  if (!org.adminUsers.includes(currentUserId)) {
    throw new Error('Apenas administradores podem alterar permissões')
  }

  // Não permitir que o usuário remova a própria permissão de admin se for o único admin
  if (currentUserId === userId && newRole === 'member') {
    if (org.adminUsers.length === 1) {
      throw new Error('Não é possível remover o único administrador da organização')
    }
  }

  let newAdminUsers = [...org.adminUsers]

  if (newRole === 'admin') {
    // Adicionar como admin se não estiver
    if (!newAdminUsers.includes(userId)) {
      newAdminUsers.push(userId)
    }
  } else {
    // Remover de admin
    newAdminUsers = newAdminUsers.filter((id) => id !== userId)
  }

  await updateDoc(orgRef, {
    adminUsers: newAdminUsers,
    updatedAt: new Date(),
    updatedBy: currentUserId,
  })
}

// ===== ASSOCIAR USUÁRIO À ORGANIZAÇÃO =====

export async function associateUserToOrganization(
  organizationId: string,
  userId: string,
  userEmail: string,
  currentUserId: string
): Promise<void> {
  const orgRef = doc(db, ORGANIZATIONS_COLLECTION, organizationId)
  const orgSnap = await getDoc(orgRef)

  if (!orgSnap.exists()) {
    throw new Error('Organização não encontrada')
  }

  const org = firestoreToOrganization(orgSnap.id, orgSnap.data())

  // Verificar se o usuário atual é admin
  if (!org.adminUsers.includes(currentUserId)) {
    throw new Error('Apenas administradores podem associar usuários')
  }

  // Verificar se o usuário já está associado usando ID previsível
  const memberId = `${userId}_${organizationId}`
  const memberRef = doc(db, ORGANIZATION_MEMBERS_COLLECTION, memberId)
  const memberSnap = await getDoc(memberRef)

  if (memberSnap.exists()) {
    // Reativar se existir mas estiver inativo
    await updateDoc(memberRef, {
      status: 'active',
      updatedAt: new Date(),
    })
  } else {
    // Criar novo membro (a função já usa o ID previsível)
    await addOrganizationMember(
      organizationId,
      userId,
      'member',
      currentUserId,
      userEmail,
      ''
    )
  }
}

// ===== DESASSOCIAR USUÁRIO DA ORGANIZAÇÃO =====

export async function disassociateUserFromOrganization(
  organizationId: string,
  userId: string,
  currentUserId: string
): Promise<void> {
  const orgRef = doc(db, ORGANIZATIONS_COLLECTION, organizationId)
  const orgSnap = await getDoc(orgRef)

  if (!orgSnap.exists()) {
    throw new Error('Organização não encontrada')
  }

  const org = firestoreToOrganization(orgSnap.id, orgSnap.data())

  // Verificar se o usuário atual é admin
  if (!org.adminUsers.includes(currentUserId)) {
    throw new Error('Apenas administradores podem desassociar usuários')
  }

  // Não permitir desassociar admin
  if (org.adminUsers.includes(userId)) {
    throw new Error('Remova a permissão de admin antes de desassociar')
  }

  // Não permitir desassociar a si mesmo
  if (currentUserId === userId) {
    throw new Error('Você não pode desassociar a si mesmo')
  }

  // Buscar membro usando ID previsível
  const memberId = `${userId}_${organizationId}`
  const memberRef = doc(db, ORGANIZATION_MEMBERS_COLLECTION, memberId)
  const memberSnap = await getDoc(memberRef)

  if (!memberSnap.exists() || memberSnap.data()?.status !== 'active') {
    throw new Error('Usuário não está associado')
  }

  // Marcar como inativo
  await updateDoc(memberRef, {
    status: 'inactive',
    updatedAt: new Date(),
  })
}

export async function getOrganizationMembers(
  organizationId: string
): Promise<OrganizationMember[]> {
  const membersRef = collection(db, ORGANIZATION_MEMBERS_COLLECTION)
  const q = query(
    membersRef,
    where('organizationId', '==', organizationId),
    orderBy('joinedAt', 'desc')
  )
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) =>
    firestoreToOrganizationMember(doc.id, doc.data())
  )
}

// ===== VALIDAR EMAIL =====

export async function validateEmailDomain(email: string): Promise<{
  isValid: boolean
  organization: Organization | null
  message: string
}> {
  const org = await getOrganizationByEmailDomain(email)

  if (!org) {
    return {
      isValid: false,
      organization: null,
      message: 'Email corporativo não reconhecido. Entre em contato com o administrador.',
    }
  }

  if (org.status !== 'active') {
    return {
      isValid: false,
      organization: org,
      message: 'Esta organização está inativa. Entre em contato com o administrador.',
    }
  }

  return {
    isValid: true,
    organization: org,
    message: 'Email válido',
  }
}

// ===== ADICIONAR DOMÍNIO =====

export async function addEmailDomain(
  organizationId: string,
  domain: string,
  userId: string
): Promise<void> {
  const orgRef = doc(db, ORGANIZATIONS_COLLECTION, organizationId)
  const org = await getOrganization(organizationId)

  if (!org) {
    throw new Error('Organização não encontrada')
  }

  // Verificar se o domínio já existe
  const domainExists = org.emailDomains.some(
    (d) => d.domain.toLowerCase() === domain.toLowerCase()
  )

  if (domainExists) {
    throw new Error('Este domínio já está cadastrado')
  }

  const newDomain: EmailDomain = {
    domain: domain.toLowerCase(),
    active: true,
    addedAt: new Date(),
    addedBy: userId,
  }

  await updateDoc(orgRef, {
    emailDomains: [...org.emailDomains, newDomain],
    updatedAt: new Date(),
    updatedBy: userId,
  })
}

