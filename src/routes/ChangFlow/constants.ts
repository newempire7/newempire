import { ChangFlowInputs, FinanceInputs, RepaymentType } from "./types"

export const MONTHS = 12

export const repaymentOptions: { label: string; value: RepaymentType }[] = [
  { label: "만기일시", value: "interestOnly" },
  { label: "원리금균등", value: "amortized" },
  { label: "체증", value: "graduated" },
]

export const defaultInputs: ChangFlowInputs = {
  land: {
    landPricePerPy: 15000000,
    landAreaPy: 3000,
    acquisitionTaxRate: 2,
    registrationTaxRate: 2,
    registrationAgencyRate: 0.3,
    evictionCost: 500000000,
  },
  construction: {
    directConstructionPerPy: 7000000,
    connectionCostPerPy: 200000,
    artRate: 1,
    waterSewerFee: 100000000,
    designSupervisionFee: 150000000,
    otherServiceCost: 80000000,
  },
  marketing: {
    modelHouseBuildCost: 300000000,
    modelHouseRentMonthly: 20000000,
    advertisingRate: 2,
    salesAgencyRate: 1.5,
    customerCareCost: 50000000,
  },
  finance: {
    ltv: 60,
    pfInterestRate: 6.5,
    pfFeeRate: 1,
    loanTermMonths: 36,
    repaymentType: "interestOnly",
    discountRate: 8,
  },
  sales: {
    salePricePerPy: 22000000,
    totalSaleArea: 3000,
    monthlySalesRates: [12, 10, 9, 9, 9, 9, 8, 8, 8, 8, 5, 5],
    preSaleShare: 10,
    taxRate: 3,
  },
}

export const marketingRentMonths = MONTHS

export const defaultFinanceInputs: FinanceInputs = defaultInputs.finance
