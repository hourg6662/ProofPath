// user-identity.test.ts
import { describe, it, expect, beforeEach } from 'vitest'

type Role = 1 | 2 | 3

type ContractState = {
  contractOwner: string
  userRoles: Map<string, Role>
  userMetadata: Map<string, string>
}

let mock: ContractState

beforeEach(() => {
  mock = {
    contractOwner: 'ST1ADMIN0000000000000000000000000000X',
    userRoles: new Map(),
    userMetadata: new Map()
  }
})

function isOwner(caller: string) {
  return caller === mock.contractOwner
}

function registerUser(caller: string, role: Role, metadata: string) {
  if (mock.userRoles.has(caller)) return { error: 101 } // Already registered
  if (![1, 2, 3].includes(role)) return { error: 103 } // Invalid role
  mock.userRoles.set(caller, role)
  mock.userMetadata.set(caller, metadata)
  return { value: true }
}

function adminRegister(caller: string, user: string, role: Role, metadata: string) {
  if (!isOwner(caller)) return { error: 100 }
  if (mock.userRoles.has(user)) return { error: 101 }
  if (![1, 2, 3].includes(role)) return { error: 103 }
  mock.userRoles.set(user, role)
  mock.userMetadata.set(user, metadata)
  return { value: true }
}

function removeUser(caller: string, user: string) {
  if (!isOwner(caller)) return { error: 100 }
  if (!mock.userRoles.has(user)) return { error: 102 }
  mock.userRoles.delete(user)
  mock.userMetadata.delete(user)
  return { value: true }
}

function transferOwnership(caller: string, newOwner: string) {
  if (!isOwner(caller)) return { error: 100 }
  if (newOwner === 'SP000000000000000000002Q6VF78') return { error: 104 }
  mock.contractOwner = newOwner
  return { value: true }
}

describe('User Identity Contract', () => {
  const admin = 'ST1ADMIN0000000000000000000000000000X'
  const user1 = 'ST2USER0000000000000000000000000000Y'
  const user2 = 'ST3USER0000000000000000000000000000Z'

  it('allows a user to register', () => {
    const result = registerUser(user1, 1, 'alice@example.com')
    expect(result).toEqual({ value: true })
    expect(mock.userRoles.get(user1)).toBe(1)
    expect(mock.userMetadata.get(user1)).toBe('alice@example.com')
  })

  it('prevents double registration', () => {
    registerUser(user1, 1, 'alice@example.com')
    const result = registerUser(user1, 2, 'new-data')
    expect(result).toEqual({ error: 101 })
  })

  it('allows admin to register user', () => {
    const result = adminRegister(admin, user2, 2, 'bob@issuer.com')
    expect(result).toEqual({ value: true })
    expect(mock.userRoles.get(user2)).toBe(2)
    expect(mock.userMetadata.get(user2)).toBe('bob@issuer.com')
  })

  it('prevents non-admin from registering users', () => {
    const result = adminRegister(user1, user2, 1, 'fake@user.com')
    expect(result).toEqual({ error: 100 })
  })

  it('removes a user', () => {
    adminRegister(admin, user2, 3, 'verifier@proofpath.com')
    const result = removeUser(admin, user2)
    expect(result).toEqual({ value: true })
    expect(mock.userRoles.has(user2)).toBe(false)
  })

  it('transfers ownership', () => {
    const newOwner = 'ST4NEWOWNER000000000000000000000000'
    const result = transferOwnership(admin, newOwner)
    expect(result).toEqual({ value: true })
    expect(mock.contractOwner).toBe(newOwner)
  })

  it('prevents transfer to zero address', () => {
    const result = transferOwnership(admin, 'SP000000000000000000002Q6VF78')
    expect(result).toEqual({ error: 104 })
  })

  it('prevents non-owner from removing users', () => {
    const result = removeUser(user1, user2)
    expect(result).toEqual({ error: 100 })
  })
})
