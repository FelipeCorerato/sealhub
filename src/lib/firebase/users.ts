import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

const COLLECTION_NAME = 'users'

// ===== TYPES =====

export interface UserProfile {
  id: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}

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

// ===== OPERATIONS =====

/**
 * Cria ou atualiza o perfil de um usuário no Firestore
 * Deve ser chamado quando o usuário faz login/registro
 */
export async function upsertUserProfile(
  userId: string,
  name: string,
  email: string,
): Promise<void> {
  const userRef = doc(db, COLLECTION_NAME, userId)
  const userSnap = await getDoc(userRef)

  const now = Timestamp.now()

  if (!userSnap.exists()) {
    // Criar novo perfil
    await setDoc(userRef, {
      id: userId,
      name,
      email,
      createdAt: now,
      updatedAt: now,
    })
  } else {
    // Atualizar perfil existente (apenas nome e updatedAt)
    await setDoc(
      userRef,
      {
        name,
        email,
        updatedAt: now,
      },
      { merge: true }
    )
  }
}

/**
 * Busca o perfil de um usuário pelo ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, COLLECTION_NAME, userId)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      return null
    }

    const data = userSnap.data()
    return {
      id: userSnap.id,
      name: data.name,
      email: data.email,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    }
  } catch (error) {
    console.error(`Erro ao buscar perfil do usuário ${userId}:`, error)
    return null
  }
}

/**
 * Busca múltiplos perfis de usuários
 * Útil para popular informações de auditoria em listas
 */
export async function getUserProfiles(
  userIds: string[]
): Promise<Map<string, UserProfile>> {
  const profiles = new Map<string, UserProfile>()

  // Remove duplicatas
  const uniqueIds = [...new Set(userIds)]

  // Busca todos os perfis em paralelo
  const promises = uniqueIds.map(async (userId) => {
    const profile = await getUserProfile(userId)
    if (profile) {
      profiles.set(userId, profile)
    }
  })

  await Promise.all(promises)

  return profiles
}

/**
 * Retorna o nome de exibição de um usuário
 * Se não encontrar o perfil, retorna um fallback com o ID truncado
 */
export function getUserDisplayName(
  userId: string,
  userProfile?: UserProfile | null
): string {
  if (userProfile?.name) {
    return userProfile.name
  }
  
  // Fallback: exibe primeiros 8 caracteres do ID
  return `Usuário ${userId.substring(0, 8)}...`
}

