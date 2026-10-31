// UI checks are not authorization: database policies must independently enforce it.
export const ADMIN_ID = '570c23fa-e6d0-46fb-b77a-656eacd639bb'
export const ADMIN_EMAIL = 'omarprom120@gmail.com'

export async function verifiedAdmin(auth) {
  try {
    const { data, error } = await auth.getUser()
    return !error && data?.user?.id === ADMIN_ID && !!data.user.email_confirmed_at
  } catch {
    return false
  }
}

export async function signInAdmin(auth, password) {
  const { error } = await auth.signInWithPassword({ email: ADMIN_EMAIL, password })
  if (error) return false
  if (await verifiedAdmin(auth)) return true
  await auth.signOut()
  return false
}
