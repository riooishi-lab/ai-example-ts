import { FiAlertTriangle, FiHome } from 'react-icons/fi'
import { FlexBox } from '../../components/common/FlexBox'
import { PageHeader } from '../../components/common/PageHeader'
import { StatusLabel } from '../../components/common/StatusLabel'
import { formatDate } from '../../libs/dayjs'
import { fetchDashboardData } from './actions/fetchDashboardData'
import { DailyInspectionChart } from './components/DailyInspectionChart'
import { MonthlyFailureChart } from './components/MonthlyFailureChart'
import styles from './page.module.css'

function formatInspectorName(inspector: { firstName: string; lastName: string }) {
  return `${inspector.lastName} ${inspector.firstName}`
}

export default async function Page() {
  const {
    equipmentCount,
    todayInspectionCount,
    failureReportCount,
    recentAbnormalCount,
    recentFailureReports,
    recentInspectionRecords,
    uninspectedEquipment,
    monthlyFailureData,
    dailyInspectionData,
  } = await fetchDashboardData()

  return (
    <div className={styles.container}>
      <FlexBox flexDirection='column' gap='1.5rem'>
        <PageHeader icon={<FiHome size={32} />} title='ダッシュボード' subtitle='設備保全の概況' />

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>設備数</span>
            <span className={styles.statValue}>{equipmentCount}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>本日の点検完了数</span>
            <span className={styles.statValue}>{todayInspectionCount}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>不具合報告数</span>
            <span className={styles.statValue}>{failureReportCount}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>直近7日の異常値</span>
            <span className={styles.statValue}>{recentAbnormalCount}</span>
          </div>
        </div>

        {uninspectedEquipment.length > 0 && (
          <div className={styles.alertSection}>
            <div className={styles.alertHeader}>
              <FiAlertTriangle size={18} />
              <span>未点検設備アラート ({uninspectedEquipment.length}件)</span>
            </div>
            <div className={styles.alertBody}>
              {uninspectedEquipment.map((eq) => (
                <div key={eq.id} className={styles.alertItem}>
                  <span className={styles.alertEquipmentName}>{eq.name}</span>
                  <span className={styles.alertLineName}>{eq.lineName}</span>
                  <span className={styles.alertLastDate}>
                    {eq.lastInspectedAt ? `最終点検: ${formatDate(eq.lastInspectedAt, 'YYYY/MM/DD')}` : '点検記録なし'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.chartsGrid}>
          <div className={styles.listCard}>
            <div className={styles.listHeader}>月別不具合報告数 (直近6ヶ月)</div>
            <div className={styles.chartBody}>
              <MonthlyFailureChart data={monthlyFailureData} />
            </div>
          </div>
          <div className={styles.listCard}>
            <div className={styles.listHeader}>日別点検完了数 (直近14日)</div>
            <div className={styles.chartBody}>
              <DailyInspectionChart data={dailyInspectionData} />
            </div>
          </div>
        </div>

        <div className={styles.listsGrid}>
          <div className={styles.listCard}>
            <div className={styles.listHeader}>最近の不具合報告</div>
            <div className={styles.listBody}>
              {recentFailureReports.length === 0 ? (
                <div className={styles.emptyMessage}>不具合報告はありません</div>
              ) : (
                recentFailureReports.map((report) => (
                  <div key={report.publicId} className={styles.listItem}>
                    <div className={styles.listItemHeader}>
                      <span className={styles.equipmentName}>{report.equipment.name}</span>
                      <span className={styles.listItemDate}>{formatDate(report.occurredAt, 'YYYY/MM/DD')}</span>
                    </div>
                    <span className={styles.symptomText}>{report.symptom}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={styles.listCard}>
            <div className={styles.listHeader}>最近の点検記録</div>
            <div className={styles.listBody}>
              {recentInspectionRecords.length === 0 ? (
                <div className={styles.emptyMessage}>点検記録はありません</div>
              ) : (
                recentInspectionRecords.map((record) => (
                  <div key={record.publicId} className={styles.listItem}>
                    <div className={styles.listItemHeader}>
                      <span className={styles.equipmentName}>{record.equipment.name}</span>
                      <StatusLabel
                        theme={record.status === 'COMPLETED' ? 'success' : 'warn'}
                        text={record.status === 'COMPLETED' ? '完了' : '進行中'}
                      />
                    </div>
                    <FlexBox justifyContent='space-between' alignItems='center'>
                      <span className={styles.inspectorName}>{formatInspectorName(record.inspector)}</span>
                      <span className={styles.listItemDate}>{formatDate(record.inspectedAt, 'YYYY/MM/DD')}</span>
                    </FlexBox>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </FlexBox>
    </div>
  )
}
