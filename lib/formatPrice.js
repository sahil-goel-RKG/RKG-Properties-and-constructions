export function formatPriceLabel(price) {
  if (!price) return null

  // Convert to string if it's a number
  const priceStr = typeof price === 'number' ? price.toString() : String(price)
  const lower = priceStr.toLowerCase()

  if (lower.includes('assured')) {
    return {
      label: '₹ Assured Best Price',
      variant: 'assured',
    }
  }

  // Check if price already contains a unit (Cr, Lakh, etc.)
  const hasUnit = /(cr|crore|lakh|million|billion)/i.test(priceStr)
  
  // If it's just a number or doesn't have a unit, treat it as Crore
  if (!hasUnit) {
    // Try to extract the number
    const numMatch = priceStr.match(/[\d.]+/)
    if (numMatch) {
      const amount = parseFloat(numMatch[0])
      // Format the number (remove trailing zeros if it's a whole number)
      const formattedAmount = amount % 1 === 0 ? amount.toString() : amount.toFixed(1)
      return {
        label: `₹ ${formattedAmount} Cr onwards`,
        variant: 'default',
      }
    }
  }

  // If it already has a unit, use the existing format
  const match = priceStr.match(/₹?\s*([\d.,]+)\s*([a-zA-Z]+)?/)
  if (match) {
    const amount = match[1]
    const unit = match[2] ? ` ${match[2]}` : ' Cr'
    return {
      label: `₹ ${amount}${unit} onwards`,
      variant: 'default',
    }
  }

  return {
    label: priceStr,
    variant: 'default',
  }
}
