export type RepaymentType = "interestOnly" | "amortized" | "graduated"

export type LandCostInputs = {
  landPricePerPy: number
  landAreaPy: number
  acquisitionTaxRate: number
  registrationTaxRate: number
  registrationAgencyRate: number
  evictionCost: number
}

export type ConstructionInputs = {
  directConstructionPerPy: number
  connectionCostPerPy: number
  artRate: number
  waterSewerFee: number
  designSupervisionFee: number
  otherServiceCost: number
}

export type MarketingInputs = {
  modelHouseBuildCost: number
  modelHouseRentMonthly: number
  advertisingRate: number
  salesAgencyRate: number
  customerCareCost: number
}

export type FinanceInputs = {
  ltv: number
  pfInterestRate: number
  pfFeeRate: number
  loanTermMonths: number
  repaymentType: RepaymentType
  discountRate: number
}

export type SalesInputs = {
  salePricePerPy: number
  totalSaleArea: number
  monthlySalesRates: number[]
  preSaleShare: number
  taxRate: number
}

export type LoanScheduleRow = {
  month: number
  interest: number
  principal: number
  payment: number
}

export type ChangFlowInputs = {
  land: LandCostInputs
  construction: ConstructionInputs
  marketing: MarketingInputs
  finance: FinanceInputs
  sales: SalesInputs
}

export type LandCostSummary = {
  baseCost: number
  acquisitionTax: number
  registrationTax: number
  agencyFee: number
  evictionCost: number
  total: number
}

export type ConstructionCostSummary = {
  directCost: number
  connectionCost: number
  artCost: number
  waterSewerFee: number
  designSupervisionFee: number
  otherServiceCost: number
  total: number
}

export type MarketingCostSummary = {
  modelHouseBuildCost: number
  modelHouseRent: number
  customerCareCost: number
  advertisingCost: number
  agencyFee: number
  total: number
}

export type FinanceSummary = {
  loanAmount: number
  totalInterest: number
  pfFeeCost: number
  financingCost: number
  schedule: LoanScheduleRow[]
}

export type SalesSummary = {
  grossRevenue: number
  netRevenue: number
  salesTax: number
  preSaleGross: number
  preSaleNet: number
  monthlySalesSum: number
  monthlyDistribution: number[]
}

export type ProjectTotals = {
  baseProjectCost: number
  totalProjectCost: number
  financingCost: number
  equityRequired: number
  profit: number
  dscr: number
  equityIrr: number
  npv: number
}

export type ChangFlowResult = {
  land: LandCostSummary
  construction: ConstructionCostSummary
  marketing: MarketingCostSummary
  finance: FinanceSummary
  sales: SalesSummary
  project: ProjectTotals
  monthlyNetCashFlows: number[]
}
