import { ChangeEvent, useMemo, useState } from "react"
import styled from "@emotion/styled"
import { FiInfo } from "react-icons/fi"

import { calculateChangFlow } from "./calculations"
import { defaultInputs, repaymentOptions, MONTHS } from "./constants"
import {
  ChangFlowInputs,
  ConstructionInputs,
  FinanceInputs,
  LandCostInputs,
  MarketingInputs,
  RepaymentType,
  SalesInputs,
} from "./types"

const numberFormatter = new Intl.NumberFormat("ko-KR")

const formatCurrency = (value: number) => `₩${numberFormatter.format(Math.round(value))}`
const formatCurrencyWithUnit = (value: number, unit?: string) =>
  `${formatCurrency(value)}${unit ? ` ${unit}` : ""}`
const formatNumberWithUnit = (value: number, unit?: string) =>
  `${numberFormatter.format(value)}${unit ? ` ${unit}` : ""}`
const formatPercent = (value: number, digits = 1) => `${value.toFixed(digits)}%`

const sanitizeNumber = (value: string) => {
  const sanitized = value.replace(/[^0-9.]/g, "")
  if (sanitized === "") return 0
  return parseFloat(sanitized)
}

const formatCurrencyInput = (value: number) => {
  if (!Number.isFinite(value)) return ""
  const [integer, decimal] = value.toString().split(".")
  const formattedInteger = numberFormatter.format(Number(integer))
  return decimal ? `${formattedInteger}.${decimal}` : formattedInteger
}

type NumericFieldType = "currency" | "percent" | "count"

type BaseFieldConfig = {
  label: string
  tooltip: string
  unit: string
  type?: NumericFieldType
  precision?: number
}

type FieldConfig<T> = BaseFieldConfig & {
  key: keyof T
}

const landFieldConfigs: FieldConfig<LandCostInputs>[] = [
  {
    key: "landPricePerPy",
    label: "토지비",
    tooltip: "사업 대상 토지의 평당 매입단가입니다.",
    unit: "원/평",
    type: "currency",
  },
  {
    key: "landAreaPy",
    label: "토지면적",
    tooltip: "총 대지 면적을 입력하세요.",
    unit: "평",
    type: "count",
  },
  {
    key: "acquisitionTaxRate",
    label: "토지 취득세 비율",
    tooltip: "취득세는 토지 구입 시 발생하는 지방세입니다.",
    unit: "%",
    type: "percent",
    precision: 1,
  },
  {
    key: "registrationTaxRate",
    label: "등록세 비율",
    tooltip: "등록세는 토지 소유권 이전 시 부과되는 세금입니다.",
    unit: "%",
    type: "percent",
    precision: 1,
  },
  {
    key: "registrationAgencyRate",
    label: "등기대행료",
    tooltip: "등기대행료는 법무사 수수료 등 기타 등기 관련비용입니다.",
    unit: "%",
    type: "percent",
    precision: 1,
  },
  {
    key: "evictionCost",
    label: "명도비용",
    tooltip: "기존 점유자 철거·이전 등에 드는 비용입니다.",
    unit: "원",
    type: "currency",
  },
]

const constructionFieldConfigs: FieldConfig<ConstructionInputs>[] = [
  {
    key: "directConstructionPerPy",
    label: "직접공사비",
    tooltip: "건축물 시공에 직접 투입되는 평당 공사비입니다.",
    unit: "원/평",
    type: "currency",
  },
  {
    key: "connectionCostPerPy",
    label: "인입비용",
    tooltip: "전기·가스·상하수도 등 외부 인프라 연결비용입니다.",
    unit: "원/평",
    type: "currency",
  },
  {
    key: "artRate",
    label: "예술작품비",
    tooltip: "연면적 기준 법정 설치비율(1%)이 적용됩니다.",
    unit: "%",
    type: "percent",
    precision: 1,
  },
  {
    key: "waterSewerFee",
    label: "상하수도 부담금",
    tooltip: "상하수도 원인자부담금 등 공과금입니다.",
    unit: "원",
    type: "currency",
  },
  {
    key: "designSupervisionFee",
    label: "설계 및 감리비",
    tooltip: "설계사무소 및 감리비용입니다.",
    unit: "원",
    type: "currency",
  },
  {
    key: "otherServiceCost",
    label: "기타 용역비",
    tooltip: "측량·감정평가·토목 용역 등 기술용역 비용입니다.",
    unit: "원",
    type: "currency",
  },
]

const marketingFieldConfigs: FieldConfig<MarketingInputs>[] = [
  {
    key: "modelHouseBuildCost",
    label: "모델하우스 구축비",
    tooltip: "모델하우스 설계·시공 비용입니다.",
    unit: "원",
    type: "currency",
  },
  {
    key: "modelHouseRentMonthly",
    label: "모델하우스 임차료",
    tooltip: "월 기준 모델하우스 임차료입니다.",
    unit: "원/월",
    type: "currency",
  },
  {
    key: "advertisingRate",
    label: "광고홍보비 비율",
    tooltip: "매출 대비 광고홍보비 비중입니다.",
    unit: "%",
    type: "percent",
    precision: 1,
  },
  {
    key: "salesAgencyRate",
    label: "분양대행수수료",
    tooltip: "외부 분양대행사에 지급하는 수수료입니다.",
    unit: "%",
    type: "percent",
    precision: 1,
  },
  {
    key: "customerCareCost",
    label: "고객관리비",
    tooltip: "입주지원 및 고객관리 관련 비용입니다.",
    unit: "원",
    type: "currency",
  },
]

const financeFieldConfigs: FieldConfig<FinanceInputs>[] = [
  {
    key: "ltv",
    label: "LTV",
    tooltip: "총사업비 대비 PF 대출 실행 비율입니다.",
    unit: "%",
    type: "percent",
    precision: 1,
  },
  {
    key: "pfInterestRate",
    label: "PF 금리",
    tooltip: "프로젝트 파이낸싱 연간 이자율입니다.",
    unit: "%",
    type: "percent",
    precision: 2,
  },
  {
    key: "pfFeeRate",
    label: "PF 수수료",
    tooltip: "PF 취급수수료 및 설정비율입니다.",
    unit: "%",
    type: "percent",
    precision: 2,
  },
  {
    key: "discountRate",
    label: "할인율",
    tooltip: "NPV 계산에 사용할 연간 할인율입니다.",
    unit: "%",
    type: "percent",
    precision: 1,
  },
]

const salesFieldConfigs: FieldConfig<SalesInputs>[] = [
  {
    key: "salePricePerPy",
    label: "분양가",
    tooltip: "평당 분양가입니다.",
    unit: "원/평",
    type: "currency",
  },
  {
    key: "totalSaleArea",
    label: "총 분양면적",
    tooltip: "분양 대상 총면적입니다.",
    unit: "평",
    type: "count",
  },
  {
    key: "preSaleShare",
    label: "사전계약 비중",
    tooltip: "본 분양 전 확정되는 매출 비율입니다.",
    unit: "%",
    type: "percent",
    precision: 1,
  },
  {
    key: "taxRate",
    label: "세금비율",
    tooltip: "부가세 및 매출 관련 세금 비율입니다.",
    unit: "%",
    type: "percent",
    precision: 1,
  },
]

const cloneDefaults = (): ChangFlowInputs => ({
  land: { ...defaultInputs.land },
  construction: { ...defaultInputs.construction },
  marketing: { ...defaultInputs.marketing },
  finance: { ...defaultInputs.finance },
  sales: { ...defaultInputs.sales, monthlySalesRates: [...defaultInputs.sales.monthlySalesRates] },
})

type InputFieldProps = BaseFieldConfig & {
  value: number
  onChange: (value: number) => void
  isDefault?: boolean
}

function InputField({
  label,
  tooltip,
  unit,
  type = "currency",
  precision = 1,
  value,
  onChange,
  isDefault,
}: InputFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = sanitizeNumber(event.target.value)
    if (type === "currency") {
      onChange(Math.max(0, Math.floor(nextValue)))
      return
    }
    onChange(Math.max(0, nextValue))
  }

  const formattedValue =
    type === "currency"
      ? formatCurrencyInput(value)
      : value.toString()

  const displayValue =
    type === "currency"
      ? formatCurrencyWithUnit(value, unit)
      : type === "percent"
      ? `${formatPercent(value, precision)}${unit !== "%" ? ` ${unit}` : ""}`
      : formatNumberWithUnit(value, unit)

  return (
    <Field>
      <LabelRow>
        <span>{label}</span>
        <TooltipBubble>
          <FiInfo />
          <TooltipContent>{tooltip}</TooltipContent>
        </TooltipBubble>
      </LabelRow>
      <ValueDescriptor>
        {`현재 값: ${displayValue}`}
        {isDefault ? " (기본값)" : ""}
      </ValueDescriptor>
      <div className="field">
        <input type="text" inputMode="decimal" value={formattedValue} onChange={handleChange} />
        <span className="suffix">{unit}</span>
      </div>
    </Field>
  )
}
const ChangFlow = () => {
  const [inputs, setInputs] = useState<ChangFlowInputs>(() => cloneDefaults())

  const result = useMemo(() => calculateChangFlow(inputs), [inputs])

  const handleLandChange = <K extends keyof LandCostInputs>(key: K) => (value: number) => {
    setInputs((prev) => ({
      ...prev,
      land: {
        ...prev.land,
        [key]: value,
      },
    }))
  }

  const handleConstructionChange = <K extends keyof ConstructionInputs>(key: K) => (value: number) => {
    setInputs((prev) => ({
      ...prev,
      construction: {
        ...prev.construction,
        [key]: value,
      },
    }))
  }

  const handleMarketingChange = <K extends keyof MarketingInputs>(key: K) => (value: number) => {
    setInputs((prev) => ({
      ...prev,
      marketing: {
        ...prev.marketing,
        [key]: value,
      },
    }))
  }

  const handleFinanceChange = <K extends keyof FinanceInputs>(key: K) => (value: number) => {
    setInputs((prev) => ({
      ...prev,
      finance: {
        ...prev.finance,
        [key]: value,
      },
    }))
  }

  const handleSalesChange = <K extends keyof SalesInputs>(key: K) => (value: number) => {
    setInputs((prev) => ({
      ...prev,
      sales: {
        ...prev.sales,
        [key]: value,
        monthlySalesRates:
          key === "monthlySalesRates"
            ? (value as unknown as number[])
            : [...prev.sales.monthlySalesRates],
      },
    }))
  }

  const handleLoanTermChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = Number(event.target.value)
    setInputs((prev) => ({
      ...prev,
      finance: {
        ...prev.finance,
        loanTermMonths: Number.isFinite(raw) ? Math.max(1, Math.round(raw)) : prev.finance.loanTermMonths,
      },
    }))
  }

  const handleRepaymentChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextValue = event.target.value as RepaymentType
    setInputs((prev) => ({
      ...prev,
      finance: {
        ...prev.finance,
        repaymentType: nextValue,
      },
    }))
  }

  const handleMonthlyRateChange = (index: number) => (value: number) => {
    setInputs((prev) => {
      const nextRates = [...prev.sales.monthlySalesRates]
      nextRates[index] = value
      return {
        ...prev,
        sales: {
          ...prev.sales,
          monthlySalesRates: nextRates,
        },
      }
    })
  }

  const monthlyRateWarning = Math.abs(result.sales.monthlySalesSum - 100) > 0.1

  return (
    <Wrapper>
      <HeaderSection>
        <div>
          <Title>ChangFlow 분양형 사업 수지 분석</Title>
          <Subtitle>
            토지, 건축, 마케팅, 금융, 매출 입력값을 조정하면 총사업비·IRR·NPV·DSCR이 실시간으로 갱신됩니다.
          </Subtitle>
        </div>
      </HeaderSection>

      <KpiGrid>
        <KpiCard>
          <span className="label">총사업비</span>
          <span className="value">{formatCurrencyWithUnit(result.project.totalProjectCost, "원")}</span>
        </KpiCard>
        <KpiCard>
          <span className="label">총매출(세전)</span>
          <span className="value">{formatCurrencyWithUnit(result.sales.grossRevenue, "원")}</span>
        </KpiCard>
        <KpiCard>
          <span className="label">예상 순이익</span>
          <span className="value">{formatCurrencyWithUnit(result.project.profit, "원")}</span>
        </KpiCard>
        <KpiCard>
          <span className="label">Equity IRR</span>
          <span className="value">
            {Number.isFinite(result.project.equityIrr)
              ? formatPercent(result.project.equityIrr * 100, 2)
              : "-"}
          </span>
        </KpiCard>
        <KpiCard>
          <span className="label">NPV</span>
          <span className="value">{formatCurrencyWithUnit(result.project.npv, "원")}</span>
        </KpiCard>
        <KpiCard>
          <span className="label">DSCR</span>
          <span className="value">
            {Number.isFinite(result.project.dscr) ? result.project.dscr.toFixed(2) : "-"}
          </span>
        </KpiCard>
      </KpiGrid>

      <SectionCard>
        <SectionHeader>
          <SectionTitle>1️⃣ 토지비용</SectionTitle>
          <TooltipBubble>
            <FiInfo />
            <TooltipContent>
              <p>취득세·등록세는 토지 구입 시 발생하는 부대세금입니다.</p>
              <p>등기대행료는 법무사 수수료 등 등기 관련비용입니다.</p>
              <p>명도비용은 기존 점유자 철거·이전 비용입니다.</p>
            </TooltipContent>
          </TooltipBubble>
        </SectionHeader>
        <InputGrid>
          {landFieldConfigs.map(({ key, ...config }) => (
            <InputField
              key={`land-${String(key)}`}
              {...config}
              value={inputs.land[key]}
              isDefault={inputs.land[key] === defaultInputs.land[key]}
              onChange={handleLandChange(key)}
            />
          ))}
        </InputGrid>
        <Subtotal>
          <div>
            <span>기본 토지비</span>
            <strong>{formatCurrencyWithUnit(result.land.baseCost, "원")}</strong>
          </div>
          <div>
            <span>취득세</span>
            <strong>{formatCurrencyWithUnit(result.land.acquisitionTax, "원")}</strong>
          </div>
          <div>
            <span>등록세</span>
            <strong>{formatCurrencyWithUnit(result.land.registrationTax, "원")}</strong>
          </div>
          <div>
            <span>등기대행료</span>
            <strong>{formatCurrencyWithUnit(result.land.agencyFee, "원")}</strong>
          </div>
          <div>
            <span>명도비용</span>
            <strong>{formatCurrencyWithUnit(result.land.evictionCost, "원")}</strong>
          </div>
          <div>
            <span>총 토지비용</span>
            <strong>{formatCurrencyWithUnit(result.land.total, "원")}</strong>
          </div>
        </Subtotal>
      </SectionCard>

      <SectionCard>
        <SectionHeader>
          <SectionTitle>2️⃣ 건축 및 부대비용</SectionTitle>
          <TooltipBubble>
            <FiInfo />
            <TooltipContent>
              <p>인입비용은 전기·가스·상하수도 등 외부 인프라 연결비용입니다.</p>
              <p>예술작품비는 연면적 기준으로 법정 설치비율(1%)이 적용됩니다.</p>
              <p>기타 용역비는 설계 외 기술용역 및 인허가 비용을 포함합니다.</p>
            </TooltipContent>
          </TooltipBubble>
        </SectionHeader>
        <InputGrid>
          {constructionFieldConfigs.map(({ key, ...config }) => (
            <InputField
              key={`construction-${String(key)}`}
              {...config}
              value={inputs.construction[key]}
              isDefault={inputs.construction[key] === defaultInputs.construction[key]}
              onChange={handleConstructionChange(key)}
            />
          ))}
        </InputGrid>
        <Subtotal>
          <div>
            <span>직접공사비</span>
            <strong>{formatCurrencyWithUnit(result.construction.directCost, "원")}</strong>
          </div>
          <div>
            <span>인입비용</span>
            <strong>{formatCurrencyWithUnit(result.construction.connectionCost, "원")}</strong>
          </div>
          <div>
            <span>예술작품비</span>
            <strong>{formatCurrencyWithUnit(result.construction.artCost, "원")}</strong>
          </div>
          <div>
            <span>상하수도 부담금</span>
            <strong>{formatCurrencyWithUnit(result.construction.waterSewerFee, "원")}</strong>
          </div>
          <div>
            <span>설계 및 감리비</span>
            <strong>{formatCurrencyWithUnit(result.construction.designSupervisionFee, "원")}</strong>
          </div>
          <div>
            <span>기타 용역비</span>
            <strong>{formatCurrencyWithUnit(result.construction.otherServiceCost, "원")}</strong>
          </div>
          <div>
            <span>총 건축비용</span>
            <strong>{formatCurrencyWithUnit(result.construction.total, "원")}</strong>
          </div>
        </Subtotal>
      </SectionCard>

      <SectionCard>
        <SectionHeader>
          <SectionTitle>3️⃣ 마케팅 및 판매비용</SectionTitle>
          <TooltipBubble>
            <FiInfo />
            <TooltipContent>
              <p>모델하우스 구축·임차료는 분양 전시시설 관련비용입니다.</p>
              <p>광고홍보비는 온·오프라인 등 마케팅 비용입니다.</p>
              <p>분양대행수수료는 외부 대행사에 지급하는 수수료입니다.</p>
            </TooltipContent>
          </TooltipBubble>
        </SectionHeader>
        <InputGrid>
          {marketingFieldConfigs.map(({ key, ...config }) => (
            <InputField
              key={`marketing-${String(key)}`}
              {...config}
              value={inputs.marketing[key]}
              isDefault={inputs.marketing[key] === defaultInputs.marketing[key]}
              onChange={handleMarketingChange(key)}
            />
          ))}
        </InputGrid>
        <Subtotal>
          <div>
            <span>모델하우스 구축비</span>
            <strong>{formatCurrencyWithUnit(result.marketing.modelHouseBuildCost, "원")}</strong>
          </div>
          <div>
            <span>모델하우스 임차료(12개월)</span>
            <strong>{formatCurrencyWithUnit(result.marketing.modelHouseRent, "원")}</strong>
          </div>
          <div>
            <span>고객관리비</span>
            <strong>{formatCurrencyWithUnit(result.marketing.customerCareCost, "원")}</strong>
          </div>
          <div>
            <span>광고홍보비</span>
            <strong>{formatCurrencyWithUnit(result.marketing.advertisingCost, "원")}</strong>
          </div>
          <div>
            <span>분양대행수수료</span>
            <strong>{formatCurrencyWithUnit(result.marketing.agencyFee, "원")}</strong>
          </div>
          <div>
            <span>총 마케팅비용</span>
            <strong>{formatCurrencyWithUnit(result.marketing.total, "원")}</strong>
          </div>
        </Subtotal>
      </SectionCard>

      <SectionCard>
        <SectionHeader>
          <SectionTitle>4️⃣ 금융비용</SectionTitle>
          <TooltipBubble>
            <FiInfo />
            <TooltipContent>
              <p>LTV는 사업비 대비 대출 비율입니다.</p>
              <p>PF 금리는 프로젝트 파이낸싱 연이자율입니다.</p>
              <p>PF 수수료는 설정비·취급수수료를 포함합니다.</p>
            </TooltipContent>
          </TooltipBubble>
        </SectionHeader>
        <InputGrid columns={3}>
          {financeFieldConfigs.map(({ key, ...config }) => (
            <InputField
              key={`finance-${String(key)}`}
              {...config}
              value={inputs.finance[key]}
              isDefault={inputs.finance[key] === defaultInputs.finance[key]}
              onChange={handleFinanceChange(key)}
            />
          ))}
          <NumberField>
            <LabelRow>
              <span>대출만기</span>
              <TooltipBubble>
                <FiInfo />
                <TooltipContent>PF 상환 기간(개월)입니다.</TooltipContent>
              </TooltipBubble>
            </LabelRow>
            <ValueDescriptor>
              {`${inputs.finance.loanTermMonths}개월`}
              {inputs.finance.loanTermMonths === defaultInputs.finance.loanTermMonths ? " (기본값)" : ""}
            </ValueDescriptor>
            <div className="field">
              <input type="number" min={1} value={inputs.finance.loanTermMonths} onChange={handleLoanTermChange} />
              <span className="suffix">개월</span>
            </div>
          </NumberField>
          <SelectField>
            <LabelRow>
              <span>상환방식</span>
              <TooltipBubble>
                <FiInfo />
                <TooltipContent>대출 상환 스케줄을 선택하세요.</TooltipContent>
              </TooltipBubble>
            </LabelRow>
            <ValueDescriptor>
              {
                repaymentOptions.find((option) => option.value === inputs.finance.repaymentType)?.label
              }
              {inputs.finance.repaymentType === defaultInputs.finance.repaymentType ? " (기본값)" : ""}
            </ValueDescriptor>
            <div className="field">
              <select value={inputs.finance.repaymentType} onChange={handleRepaymentChange}>
                {repaymentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </SelectField>
        </InputGrid>
        <Subtotal>
          <div>
            <span>PF 대출금액</span>
            <strong>{formatCurrencyWithUnit(result.finance.loanAmount, "원")}</strong>
          </div>
          <div>
            <span>총 이자비용</span>
            <strong>{formatCurrencyWithUnit(result.finance.totalInterest, "원")}</strong>
          </div>
          <div>
            <span>PF 수수료</span>
            <strong>{formatCurrencyWithUnit(result.finance.pfFeeCost, "원")}</strong>
          </div>
          <div>
            <span>총 금융비용</span>
            <strong>{formatCurrencyWithUnit(result.finance.financingCost, "원")}</strong>
          </div>
        </Subtotal>
      </SectionCard>

      <SectionCard>
        <SectionHeader>
          <SectionTitle>5️⃣ 매출 및 분양정보</SectionTitle>
          <TooltipBubble>
            <FiInfo />
            <TooltipContent>
              <p>분양률은 월별 예상 분양속도입니다. 총합이 100%가 되도록 입력하세요.</p>
              <p>사전계약은 본 분양 전 확정 매출 비율입니다.</p>
              <p>세금비율은 부가세 및 기타 매출 관련 세금입니다.</p>
            </TooltipContent>
          </TooltipBubble>
        </SectionHeader>
        <InputGrid>
          {salesFieldConfigs.map(({ key, ...config }) => (
            <InputField
              key={`sales-${String(key)}`}
              {...config}
              value={inputs.sales[key]}
              isDefault={inputs.sales[key] === defaultInputs.sales[key]}
              onChange={handleSalesChange(key)}
            />
          ))}
        </InputGrid>

        <MonthlyGrid>
          {Array.from({ length: MONTHS }).map((_, index) => {
            const rate = inputs.sales.monthlySalesRates[index] ?? 0
            const defaultRate = defaultInputs.sales.monthlySalesRates[index] ?? 0
            return (
              <MonthlyCell key={`sales-rate-${index}`}>
                <LabelRow>
                  <span>{index + 1}월 분양률</span>
                </LabelRow>
                <ValueDescriptor>
                  {`${formatPercent(rate, 1)}${rate === defaultRate ? " (기본값)" : ""}`}
                </ValueDescriptor>
                <div className="field">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={rate}
                    onChange={(event) => handleMonthlyRateChange(index)(sanitizeNumber(event.target.value))}
                  />
                  <span className="suffix">%</span>
                </div>
              </MonthlyCell>
            )
          })}
        </MonthlyGrid>

        <Subtotal>
          <div>
            <span>월별 분양률 합계</span>
            <strong data-warning={monthlyRateWarning}>{formatPercent(result.sales.monthlySalesSum, 1)}</strong>
          </div>
          <div>
            <span>사전계약 매출</span>
            <strong>{formatCurrencyWithUnit(result.sales.preSaleGross, "원")}</strong>
          </div>
          <div>
            <span>총매출(세전)</span>
            <strong>{formatCurrencyWithUnit(result.sales.grossRevenue, "원")}</strong>
          </div>
          <div>
            <span>매출 세금</span>
            <strong>{formatCurrencyWithUnit(result.sales.salesTax, "원")}</strong>
          </div>
          <div>
            <span>총매출(세후)</span>
            <strong>{formatCurrencyWithUnit(result.sales.netRevenue, "원")}</strong>
          </div>
        </Subtotal>
        {monthlyRateWarning && (
          <WarningNote>월별 분양률 합계를 100%로 맞추면 수지 분석이 더욱 정확해집니다.</WarningNote>
        )}
      </SectionCard>

      <FinalSummary>
        <div>
          <span>총 토지비용</span>
          <strong>{formatCurrencyWithUnit(result.land.total, "원")}</strong>
        </div>
        <div>
          <span>총 건축비용</span>
          <strong>{formatCurrencyWithUnit(result.construction.total, "원")}</strong>
        </div>
        <div>
          <span>총 마케팅비용</span>
          <strong>{formatCurrencyWithUnit(result.marketing.total, "원")}</strong>
        </div>
        <div>
          <span>총 금융비용</span>
          <strong>{formatCurrencyWithUnit(result.finance.financingCost, "원")}</strong>
        </div>
        <div>
          <span>총매출(세전)</span>
          <strong>{formatCurrencyWithUnit(result.sales.grossRevenue, "원")}</strong>
        </div>
        <div>
          <span>세후 순매출</span>
          <strong>{formatCurrencyWithUnit(result.sales.netRevenue, "원")}</strong>
        </div>
        <div>
          <span>필요 자기자본</span>
          <strong>{formatCurrencyWithUnit(result.project.equityRequired, "원")}</strong>
        </div>
        <div>
          <span>예상 순이익</span>
          <strong>{formatCurrencyWithUnit(result.project.profit, "원")}</strong>
        </div>
      </FinalSummary>
    </Wrapper>
  )
}

export default ChangFlow

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem 0 4rem;
`

const HeaderSection = styled.section`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.gray11};
  font-size: 1rem;
`

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`

const KpiCard = styled.div`
  background-color: ${({ theme }) =>
    theme.scheme === "light" ? "white" : theme.colors.gray4};
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: ${({ theme }) =>
    theme.scheme === "light" ? "0 10px 30px rgba(15, 15, 15, 0.08)" : "none"};
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .label {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.gray11};
  }

  .value {
    font-size: 1.25rem;
    font-weight: 700;
  }
`

const SectionCard = styled.section`
  background-color: ${({ theme }) =>
    theme.scheme === "light" ? "white" : theme.colors.gray4};
  border-radius: 1rem;
  padding: 1.75rem;
  box-shadow: ${({ theme }) =>
    theme.scheme === "light" ? "0 18px 40px rgba(15, 15, 15, 0.08)" : "none"};
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
`

const InputGrid = styled.div<{ columns?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ columns }) => columns || 2}, minmax(0, 1fr));
  gap: 1.25rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .field {
    position: relative;
    display: flex;
    align-items: center;
  }

  input {
    width: 100%;
    border-radius: 0.75rem;
    border: 1px solid ${({ theme }) => theme.colors.gray5};
    padding: 0.75rem 1rem;
    font-size: 1rem;
    background: ${({ theme }) =>
      theme.scheme === "light" ? theme.colors.gray1 : theme.colors.gray5};
    color: ${({ theme }) => theme.colors.gray12};
  }

  .suffix {
    position: absolute;
    right: 1rem;
    color: ${({ theme }) => theme.colors.gray10};
    font-size: 0.875rem;
  }
`

const NumberField = styled(Field)`
  input {
    padding-right: 3.25rem;
  }
`

const SelectField = styled(Field)`
  select {
    width: 100%;
    border-radius: 0.75rem;
    border: 1px solid ${({ theme }) => theme.colors.gray5};
    padding: 0.75rem 1rem;
    font-size: 1rem;
    background: ${({ theme }) =>
      theme.scheme === "light" ? theme.colors.gray1 : theme.colors.gray5};
    color: ${({ theme }) => theme.colors.gray12};
  }
`

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
`

const TooltipContent = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 50%;
  transform: translateX(-50%);
  min-width: 220px;
  padding: 0.75rem;
  background: ${({ theme }) =>
    theme.scheme === "light" ? "rgba(28, 28, 28, 0.92)" : theme.colors.gray1};
  color: ${({ theme }) => (theme.scheme === "light" ? "white" : theme.colors.gray12)};
  font-size: 0.75rem;
  line-height: 1.2;
  border-radius: 0.5rem;
  box-shadow: 0 10px 30px rgba(15, 15, 15, 0.15);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease;
  z-index: 10;

  @media (max-width: 768px) {
    left: auto;
    right: 0;
    transform: none;
  }

  p {
    margin: 0 0 0.25rem;

    &:last-of-type {
      margin-bottom: 0;
    }
  }
`

const TooltipBubble = styled.div.attrs({ tabIndex: 0 })`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.colors.gray5};
  color: ${({ theme }) => theme.colors.gray12};
  cursor: pointer;

  &:hover ${TooltipContent},
  &:focus-within ${TooltipContent} {
    opacity: 1;
    visibility: visible;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.indigo6};
  }
`

const ValueDescriptor = styled.span<{ warning?: boolean }>`
  font-size: 0.875rem;
  color: ${({ theme, warning }) => (warning ? theme.colors.red10 : theme.colors.gray10)};
  font-weight: ${({ warning }) => (warning ? 600 : 400)};
`

const Subtotal = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;

  span {
    color: ${({ theme }) => theme.colors.gray10};
  }

  strong {
    font-size: 1.125rem;
  }

  strong[data-warning="true"] {
    color: ${({ theme }) => theme.colors.red10};
  }
`

const MonthlyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
`

const MonthlyCell = styled(Field)`
  input {
    padding-right: 3rem;
  }
`

const WarningNote = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.red10};
`

const FinalSummary = styled.section`
  background-color: ${({ theme }) =>
    theme.scheme === "light" ? "white" : theme.colors.gray4};
  border-radius: 1.25rem;
  padding: 1.75rem;
  box-shadow: ${({ theme }) =>
    theme.scheme === "light" ? "0 18px 40px rgba(15, 15, 15, 0.08)" : "none"};
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));

  span {
    color: ${({ theme }) => theme.colors.gray10};
  }

  strong {
    font-size: 1.2rem;
  }
`
