'use server'

import { cookies } from 'next/headers'
import { ID, Models, Query } from 'node-appwrite'

import { createAdminClient } from '@/lib/appwrite'
import { appwriteConfig } from '@/lib/appwrite/config'
import { parseStringify } from '@/lib/utils'
import Session = Models.Session

type createAccountArgs = {
  fullName: string
  email: string
}

type verifySecretArgs = {
  accountId: string
  secret: string
}

async function getUserByEmail(email: string) {
  const { databases } = await createAdminClient()

  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    [Query.equal('email', [email])],
  )

  return !result.total ? null : result.documents[0]
}

function handleError(error: unknown, message: string) {
  console.error(`Error: ${error} ${message}`)
  throw error
}

export async function sendEmailOTP({ email }: { email: string }) {
  const { account } = await createAdminClient()

  try {
    const session = await account.createEmailToken(ID.unique(), email)

    return session.userId
  } catch (error) {
    handleError(error, 'Failed to send email OTP')
  }
}

async function createUser(
  accountId: string,
  { fullName, email }: createAccountArgs,
) {
  const { databases } = await createAdminClient()

  await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    ID.unique(),
    {
      fullName,
      email,
      avatar:
        'https://pngtree.com/freepng/gray-avatar-placeholder_6398267.html',
      accountId,
    },
  )
}

export async function createAccount({
                                      fullName,
                                      email,
                                    }: createAccountArgs): Promise<{ accountId: string }> {
  const existingUser = await getUserByEmail(email)
  const accountId = await sendEmailOTP({ email })

  if (!accountId) {
    throw new Error('Failed to send email OTP')
  }

  if (!existingUser) {
    createUser(accountId, { fullName, email })
  }

  return parseStringify({ accountId })
}

export async function verifySecret({ accountId, secret }: verifySecretArgs) {

  try {
    const { account } = await createAdminClient()
    const session: Session = await account.createSession(accountId, secret)

    const nCookies = await cookies()

    nCookies.set('appwrite-session', session.secret, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    })

    return parseStringify({ sessionId: session.$id })
  } catch (error) {
    handleError(error, 'Failed to verify OTP')
  }

}
