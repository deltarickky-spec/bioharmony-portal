export const PRICING_TIERS = [
  {
    id: "tier_33",
    name: "Inner Voice Scan",
    amount_cents: 3300,
    currency: "cad",
    description: "Entry offer: 10-second voice frequency scan",
    popular: false,
  },
  {
    id: "tier_77",
    name: "Comprehensive Wellness",
    amount_cents: 7700,
    currency: "cad",
    description: "Expanded scan + deeper insights",
    popular: true,
  },
  {
    id: "tier_133",
    name: "Complete Vitality Package",
    amount_cents: 13300,
    currency: "cad",
    description: "Premium scan + consultation add-on",
    popular: false,
  },
];

export function getTierById(tierId) {
  return PRICING_TIERS.find((t) => t.id === tierId) || null;
}
