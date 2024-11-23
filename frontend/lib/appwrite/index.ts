'use server'

import { Account, Avatars, Client, Databases, Storage } from 'node-appwrite'
import { appwriteConfig } from '@/lib/appwrite/config'
import { cookies } from 'next/headers'

type clientReturn = {
  readonly databases: Databases
  readonly account: Account
  readonly storage?: Storage
  readonly avatars?: Avatars
}

export const createSessionClient = async (): Promise<clientReturn> => {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpointUrl)
    .setProject(appwriteConfig.projectId)

  const session = (await cookies()).get('appwrite-session')

  if (!session || !session.value) {
    throw new Error('No session')
  }

  client.setSession(session.value)

  return {
    get account() {
      return new Account(client)
    },

    get databases() {
      return new Databases(client)
    },
  }
}

export const createAdminClient = async (): Promise<clientReturn> => {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpointUrl)
    .setProject(appwriteConfig.projectId)
    .setKey(appwriteConfig.secret)

  return {
    get account() {
      return new Account(client)
    },

    get databases() {
      return new Databases(client)
    },

    get storage() {
      return new Storage(client)
    },

    get avatars() {
      return new Avatars(client)
    },
  }
}
