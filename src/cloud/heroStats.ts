export const LEVEL_ATK = 25
export const LEVEL_HP = 150
export const STAR_ATK = 120
export const STAR_HP = 600
export const MAX_STARS = 5

export interface HeroTemplateLike {
  name: string
  atk: number
  maxHp: number
  level: number
  stars: number
}

export interface ItemLike {
  id: string
  statBonus: {
    atk?: number
    hp?: number
  }
}

export function deriveHeroStats(
  t: HeroTemplateLike,
  level: number,
  stars: number,
  equippedItemIds: readonly string[],
  items: readonly ItemLike[],
): { atk: number; maxHp: number } {
  const itemById = new Map<string, ItemLike>()
  for (const item of items) {
    itemById.set(item.id, item)
  }

  let bonusAtk = 0
  let bonusHp = 0
  for (const id of equippedItemIds) {
    const item = itemById.get(id)
    if (!item) continue
    bonusAtk += item.statBonus.atk ?? 0
    bonusHp += item.statBonus.hp ?? 0
  }

  const rawAtk = t.atk + LEVEL_ATK * (level - t.level) + STAR_ATK * (stars - t.stars) + bonusAtk
  const rawHp = t.maxHp + LEVEL_HP * (level - t.level) + STAR_HP * (stars - t.stars) + bonusHp

  return {
    atk: Math.max(10, rawAtk),
    maxHp: Math.max(50, rawHp),
  }
}
