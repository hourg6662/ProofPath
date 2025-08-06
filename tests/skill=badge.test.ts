import { describe, it, expect, beforeEach } from "vitest"

interface Badge {
  name: string
  description: string
  issuer: string
}

const MAX_BADGES = 50

const mockContract = {
  admin: "ST1ADMINADDRESS",
  badges: new Map<number, Badge>(),
  userBadges: new Map<string, number[]>(),
  nextBadgeId: 1,

  isAdmin(caller: string) {
    return caller === this.admin
  },

  transferAdmin(caller: string, newAdmin: string) {
    if (!this.isAdmin(caller)) return { error: 100 }
    this.admin = newAdmin
    return { value: true }
  },

  createBadge(caller: string, name: string, description: string) {
    const badgeId = this.nextBadgeId++
    this.badges.set(badgeId, { name, description, issuer: caller })
    return { value: badgeId }
  },

  getBadge(badgeId: number) {
    const badge = this.badges.get(badgeId)
    if (!badge) return { error: 103 }
    return { value: badge }
  },

  issueBadge(
    caller: string,
    user: string,
    badgeId: number,
    userRegistry: { isRegistered: (addr: string) => boolean }
  ) {
    if (!this.isAdmin(caller)) return { error: 104 }
    if (!userRegistry.isRegistered(user)) return { error: 101 }
    const current = this.userBadges.get(user) || []
    if (current.length >= MAX_BADGES) return { error: 106 }
    this.userBadges.set(user, [...current, badgeId])
    return { value: true }
  },

  getUserBadges(user: string) {
    return { value: this.userBadges.get(user) || [] }
  }
}

describe("Skill Badge Contract", () => {
  const mockRegistry = {
    isRegistered: (user: string) => user.startsWith("ST")
  }

  beforeEach(() => {
    mockContract.admin = "ST1ADMINADDRESS"
    mockContract.badges = new Map()
    mockContract.userBadges = new Map()
    mockContract.nextBadgeId = 1
  })

  it("should allow admin to create a badge", () => {
    const res = mockContract.createBadge("ST1ADMINADDRESS", "Dev", "Top dev badge")
    expect(res.value).toBe(1)
    const badge = mockContract.badges.get(1)
    expect(badge).toEqual({ name: "Dev", description: "Top dev badge", issuer: "ST1ADMINADDRESS" })
  })

  it("should reject badge fetch if not found", () => {
    const res = mockContract.getBadge(999)
    expect(res).toEqual({ error: 103 })
  })

  it("should allow admin to issue badge to registered user", () => {
    mockContract.createBadge("ST1ADMINADDRESS", "Builder", "Awarded for contribution")
    const res = mockContract.issueBadge("ST1ADMINADDRESS", "ST2USERADDR", 1, mockRegistry)
    expect(res).toEqual({ value: true })
    const badges = mockContract.userBadges.get("ST2USERADDR")
    expect(badges).toEqual([1])
  })

  it("should reject issuing badge to unregistered user", () => {
    const res = mockContract.issueBadge("ST1ADMINADDRESS", "UNREGISTERED", 1, mockRegistry)
    expect(res).toEqual({ error: 101 })
  })

  it("should reject badge issuing from non-admin", () => {
    const res = mockContract.issueBadge("ST3NOTADMIN", "ST2USERADDR", 1, mockRegistry)
    expect(res).toEqual({ error: 104 })
  })

  it("should reject issuing more than 50 badges to one user", () => {
    const user = "ST2BADGEFLOOD"
    const badgeId = mockContract.createBadge("ST1ADMINADDRESS", "Badge", "Desc").value
    mockContract.userBadges.set(user, Array(50).fill(badgeId))
    const res = mockContract.issueBadge("ST1ADMINADDRESS", user, badgeId, mockRegistry)
    expect(res).toEqual({ error: 106 })
  })
})
