export function formatPriceLabel(price) {
  if (!price) return null

  const lower = price.toLowerCase()

  if (lower.includes('assured')) {
    return {
      label: '₹ Assured Best Price',
      variant: 'assured',
    }
  }

  const match = price.match(/₹?\s*([\d.,]+)\s*([a-zA-Z]+)?/)
  if (match) {
    const amount = match[1]
    const unit = match[2] ? ` ${match[2]}` : ''
    return {
      label: `₹ ${amount}${unit} onwards`,
      variant: 'default',
    }
  }

  return {
    label: price,
    variant: 'default',
  }
}
