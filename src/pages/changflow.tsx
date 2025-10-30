import ChangFlow from "src/routes/ChangFlow"
import MetaConfig from "src/components/MetaConfig"
import { CONFIG } from "../../site.config"
import { NextPageWithLayout } from "src/types"

const ChangFlowPage: NextPageWithLayout = () => {
  const meta = {
    title: "ChangFlow – 분양형 사업 수지분석",
    description:
      "토지, 건축, 마케팅, 금융, 매출 정보를 입력하고 총사업비, IRR, NPV, DSCR을 즉시 확인하세요.",
    type: "website",
    url: `${CONFIG.link}/changflow`,
  }

  return (
    <>
      <MetaConfig {...meta} />
      <ChangFlow />
    </>
  )
}

export default ChangFlowPage
