import {
  ChangFlowInputs,
  ChangFlowResult,
  ConstructionCostSummary,
  FinanceSummary,
  LandCostSummary,
  LoanScheduleRow,
  MarketingCostSummary,
  ProjectTotals,
  SalesSummary,
} from "./types"
import { MONTHS, marketingRentMonths } from "./constants"

const toDecimal = (value: number) => value / 100

const buildLoanSchedule = (
  amount: number,
  annualRate: number,
  termMonths: number,
  type: ChangFlowInputs["finance"]["repaymentType"],
): LoanScheduleRow[] => {
  if (amount <= 0 || termMonths <= 0) {
    return []
  }

  const monthlyRate = toDecimal(annualRate) / 12
  const schedule: LoanScheduleRow[] = []

  if (type === "interestOnly") {
    for (let month = 1; month <= termMonths; month += 1) {
      const interest = amount * monthlyRate
      const principal = month === termMonths ? amount : 0
      schedule.push({
        month,
        interest,
        principal,
        payment: interest + principal,
      })
    }
    return schedule
  }

  if (type === "amortized") {
    if (monthlyRate === 0) {
      const principalPayment = amount / termMonths
      for (let month = 1; month <= termMonths; month += 1) {
        schedule.push({
          month,
          interest: 0,
          principal: principalPayment,
          payment: principalPayment,
        })
      }
      return schedule
    }

    const factor = Math.pow(1 + monthlyRate, termMonths)
    const payment = (amount * monthlyRate * factor) / (factor - 1)
    let balance = amount
    for (let month = 1; month <= termMonths; month += 1) {
      const interest = balance * monthlyRate
      const principal = payment - interest
      balance = Math.max(0, balance - principal)
      schedule.push({
        month,
        interest,
        principal,
        payment,
      })
    }
    return schedule
  }

  const interestOnlyMonths = Math.max(1, Math.floor(termMonths / 3))
  let balance = amount
  for (let month = 1; month <= termMonths; month += 1) {
    const interest = balance * monthlyRate
    if (month <= interestOnlyMonths) {
      schedule.push({
        month,
        interest,
        principal: 0,
        payment: interest,
      })
    } else {
      const remainingMonths = termMonths - interestOnlyMonths
      const principal = remainingMonths > 0 ? balance / remainingMonths : balance
      balance = Math.max(0, balance - principal)
      schedule.push({
        month,
        interest,
        principal,
        payment: interest + principal,
      })
    }
  }

  const paidPrincipal = schedule.reduce((sum, row) => sum + row.principal, 0)
  if (Math.abs(paidPrincipal - amount) > 1) {
    const lastIndex = schedule.length - 1
    schedule[lastIndex] = {
      ...schedule[lastIndex],
      principal: schedule[lastIndex].principal + (amount - paidPrincipal),
      payment: schedule[lastIndex].payment + (amount - paidPrincipal),
    }
  }

  return schedule
}

const calculateIRR = (cashFlows: number[], guess = 0.1) => {
  if (cashFlows.length < 2) {
    return 0
  }

  let rate = guess
  const maxIterations = 100
  const tolerance = 1e-7

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    let npv = 0
    let derivative = 0

    for (let t = 0; t < cashFlows.length; t += 1) {
      const cf = cashFlows[t]
      const factor = Math.pow(1 + rate, t)
      npv += cf / factor
      if (t > 0) {
        derivative -= (t * cf) / (factor * (1 + rate))
      }
    }

    if (Math.abs(derivative) < tolerance) {
      break
    }

    const nextRate = rate - npv / derivative

    if (Math.abs(nextRate - rate) < tolerance) {
      rate = nextRate
      break
    }

    rate = nextRate
  }

  if (!Number.isFinite(rate) || rate <= -1) {
    return 0
  }

  return rate
}

const calculateNPV = (cashFlows: number[], discountRate: number) => {
  const monthlyRate = toDecimal(discountRate) / 12
  return cashFlows.reduce(
    (accumulator, cashFlow, index) => accumulator + cashFlow / Math.pow(1 + monthlyRate, index),
    0,
  )
}

const createLandSummary = (inputs: ChangFlowInputs, landAreaOverride?: number): LandCostSummary => {
  const { land } = inputs
  const landArea = landAreaOverride ?? land.landAreaPy
  const baseCost = land.landPricePerPy * landArea
  const acquisitionTax = baseCost * toDecimal(land.acquisitionTaxRate)
  const registrationTax = baseCost * toDecimal(land.registrationTaxRate)
  const agencyFee = baseCost * toDecimal(land.registrationAgencyRate)
  const total = baseCost + acquisitionTax + registrationTax + agencyFee + land.evictionCost

  return {
    baseCost,
    acquisitionTax,
    registrationTax,
    agencyFee,
    evictionCost: land.evictionCost,
    total,
  }
}

const createConstructionSummary = (
  inputs: ChangFlowInputs,
  saleAreaOverride?: number,
): ConstructionCostSummary => {
  const { construction, sales } = inputs
  const saleArea = saleAreaOverride ?? sales.totalSaleArea

  const directCost = construction.directConstructionPerPy * saleArea
  const connectionCost = construction.connectionCostPerPy * saleArea
  const artCost = (directCost + connectionCost) * toDecimal(construction.artRate)
  const total =
    directCost +
    connectionCost +
    artCost +
    construction.waterSewerFee +
    construction.designSupervisionFee +
    construction.otherServiceCost

  return {
    directCost,
    connectionCost,
    artCost,
    waterSewerFee: construction.waterSewerFee,
    designSupervisionFee: construction.designSupervisionFee,
    otherServiceCost: construction.otherServiceCost,
    total,
  }
}

const createMarketingSummary = (
  inputs: ChangFlowInputs,
  grossRevenue: number,
): MarketingCostSummary => {
  const { marketing } = inputs
  const modelHouseRent = marketing.modelHouseRentMonthly * marketingRentMonths
  const advertisingCost = grossRevenue * toDecimal(marketing.advertisingRate)
  const agencyFee = grossRevenue * toDecimal(marketing.salesAgencyRate)
  const total =
    marketing.modelHouseBuildCost +
    modelHouseRent +
    marketing.customerCareCost +
    advertisingCost +
    agencyFee

  return {
    modelHouseBuildCost: marketing.modelHouseBuildCost,
    modelHouseRent,
    customerCareCost: marketing.customerCareCost,
    advertisingCost,
    agencyFee,
    total,
  }
}

const createFinanceSummary = (
  inputs: ChangFlowInputs,
  baseProjectCost: number,
): FinanceSummary => {
  const { finance } = inputs
  const loanAmount = baseProjectCost * toDecimal(finance.ltv)
  const schedule = buildLoanSchedule(
    loanAmount,
    finance.pfInterestRate,
    finance.loanTermMonths,
    finance.repaymentType,
  )
  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0)
  const pfFeeCost = loanAmount * toDecimal(finance.pfFeeRate)
  const financingCost = totalInterest + pfFeeCost

  return {
    loanAmount,
    totalInterest,
    pfFeeCost,
    financingCost,
    schedule,
  }
}

const createSalesSummary = (inputs: ChangFlowInputs): SalesSummary => {
  const { sales } = inputs
  const monthlySalesSum = sales.monthlySalesRates.reduce((sum, value) => sum + value, 0)
  const totalRevenuePotential = sales.salePricePerPy * sales.totalSaleArea
  const preSaleGross = totalRevenuePotential * toDecimal(sales.preSaleShare)
  const monthlySalesBase = totalRevenuePotential - preSaleGross
  const monthlyGrossTotal = monthlySalesBase * (monthlySalesSum / 100)
  const grossRevenue = preSaleGross + monthlyGrossTotal
  const taxRateDecimal = toDecimal(sales.taxRate)
  const preSaleNet = preSaleGross * (1 - taxRateDecimal)

  const monthlyDistribution = Array.from({ length: MONTHS }, (_, index) => sales.monthlySalesRates[index] || 0)
  const monthlyGross = monthlyDistribution.map((rate) => monthlySalesBase * (rate / 100))
  const monthlyNet = monthlyGross.map((value) => value * (1 - taxRateDecimal))
  const monthlyNetTotal = monthlyNet.reduce((sum, value) => sum + value, 0)
  const netRevenue = preSaleNet + monthlyNetTotal
  const salesTax = grossRevenue - netRevenue

  return {
    grossRevenue,
    netRevenue,
    salesTax,
    preSaleGross,
    preSaleNet,
    monthlySalesSum,
    monthlyDistribution,
  }
}

export const calculateChangFlow = (inputs: ChangFlowInputs): ChangFlowResult => {
  const landSummary = createLandSummary(inputs)
  const constructionSummary = createConstructionSummary(inputs)
  const salesSummary = createSalesSummary(inputs)
  const marketingSummary = createMarketingSummary(inputs, salesSummary.grossRevenue)

  const baseProjectCost =
    landSummary.total + constructionSummary.total + marketingSummary.total

  const financeSummary = createFinanceSummary(inputs, baseProjectCost)

  const totalProjectCost = baseProjectCost + financeSummary.financingCost
  const profit = salesSummary.netRevenue - totalProjectCost

  const debtService = financeSummary.schedule.reduce((sum, row) => sum + row.payment, 0)
  const operatingCashFlow = salesSummary.netRevenue -
    (landSummary.total + constructionSummary.total + marketingSummary.total)
  const dscr = debtService > 0 ? operatingCashFlow / debtService : 0

  const equityRequired = baseProjectCost + financeSummary.pfFeeCost - financeSummary.loanAmount

  const totalRevenuePotential = inputs.sales.salePricePerPy * inputs.sales.totalSaleArea
  const preSaleShareDecimal = toDecimal(inputs.sales.preSaleShare)
  const monthlySalesBase = totalRevenuePotential * (1 - preSaleShareDecimal)
  const netSaleMultiplier = 1 - toDecimal(inputs.sales.taxRate)

  const monthlyNetCashFlows = financeSummary.schedule.map((row, index) => {
    const monthlyRate = inputs.sales.monthlySalesRates[index] || 0
    const gross = monthlySalesBase * (monthlyRate / 100)
    const net = gross * netSaleMultiplier
    return net - row.payment
  })

  const cashFlows = [salesSummary.preSaleNet - equityRequired, ...monthlyNetCashFlows]
  const monthlyIrr = calculateIRR(cashFlows)
  const equityIrr = (1 + monthlyIrr) ** 12 - 1
  const npv = calculateNPV(cashFlows, inputs.finance.discountRate)

  const project: ProjectTotals = {
    baseProjectCost,
    totalProjectCost,
    financingCost: financeSummary.financingCost,
    equityRequired,
    profit,
    dscr,
    equityIrr,
    npv,
  }

  return {
    land: landSummary,
    construction: constructionSummary,
    marketing: marketingSummary,
    finance: financeSummary,
    sales: salesSummary,
    project,
    monthlyNetCashFlows,
  }
}
