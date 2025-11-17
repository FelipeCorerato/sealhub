/**
 * Script para criar a organização IASA Brasil
 * Execute uma vez para criar a organização no Firestore
 */

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { createOrganization } from '../src/lib/firebase/organizations'

// Configuração do Firebase (use suas credenciais)
const firebaseConfig = {
  // Cole aqui as credenciais do seu firebase
  // Encontre em: Firebase Console > Project Settings > General
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function createIASAOrganization() {
  console.log('🏢 Criando organização IASA Brasil...\n')

  try {
    // Substitua pelo ID de um usuário admin existente
    const adminUserId = 'SEU_USER_ID_AQUI'
    
    const org = await createOrganization({
      name: 'IASA Brasil',
      tradeName: 'IASA',
      cnpj: '12.345.678/0001-90', // Substitua pelo CNPJ real
      description: 'Instituto de Auditoria e Segurança Alimentar',
      emailDomains: [
        '@iasabrasil.com.br',
        // Adicione outros domínios se necessário
      ],
      theme: {
        primaryColor: '#D97B35',
        primaryHoverColor: '#C16A2A',
        lightBackgroundColor: '#FFF5ED',
        // logoUrl: 'https://...', // Opcional
        // faviconUrl: 'https://...', // Opcional
      },
      settings: {
        defaultSender: 'IASA Brasil',
        defaultSignature: 'Atenciosamente,\nEquipe IASA Brasil',
        campaignCodePrefix: 'IASA',
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
      }
    }, adminUserId)

    console.log('✅ Organização criada com sucesso!')
    console.log('📋 ID da Organização:', org.id)
    console.log('🏢 Nome:', org.name)
    console.log('📧 Domínios:', org.emailDomains.map(d => d.domain).join(', '))
    console.log('🎨 Cor Primária:', org.theme.primaryColor)
    console.log('\n🎉 Pronto! Agora os usuários com @iasabrasil.com.br podem se registrar!')
    
  } catch (error) {
    console.error('❌ Erro ao criar organização:', error)
  }
}

// Execute
createIASAOrganization()

