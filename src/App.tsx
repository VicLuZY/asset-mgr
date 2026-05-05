import { useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  Banknote,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Database,
  Download,
  FileText,
  FileSpreadsheet,
  Plus,
  Printer,
  Save,
  Search,
  Trash2,
  Upload,
  Wrench,
} from 'lucide-react'
import './App.css'

type AnyRecord = Record<string, string | number | boolean | null | undefined>

type Asset = {
  assetId: string
  assetName: string
  assetType: string
  quantity: string | number
  description: string
  facility: string
  location: string
  roomArea: string
  system: string
  parentAssetId: string
  fedFrom: string
  voltageBand: string
  rating: string
  makeModel: string
  serialNumber: string
  installationYear: string | number
  age: string | number
  expectedUsefulLife: string | number
  conditionBand: string
  conditionScore: string | number
  criticality: string
  riskScore: string | number
  replacementValue: string | number
  remainingUsefulLife: string | number
  capitalCandidate: string
  recommendedAction: string
  replacementDriver: string
  lastServiceDate: string
  arcFlashLabelDate: string
  nextReviewDate: string
  status: string
  owner: string
  notes: string
  sourceDocument: string
  sourceRef: string
  lastUpdated: string
  maintenanceFrequencyMonths?: string | number
  estimatedAnnualMaintenanceCost?: string | number
  estimatedReplacementCost?: string | number
  replacementYear?: string | number
  replacementValueBasis?: string
}

type MaintenancePlan = {
  planId: string
  assetId: string
  assetName: string
  assetType: string
  roomArea: string
  location: string
  conditionBand: string
  conditionClass: string
  criticality: string
  riskScore: string | number
  strategy: string
  frequencyMonths: string | number
  visualInspectionFrequencyMonths: string | number
  testingFrequencyMonths: string | number
  infraredFrequencyMonths: string | number
  nextDueDate: string
  estimatedAnnualMaintenanceCost: string | number
  estimatedWorkOrderCost: string | number
  estimatedReplacementCost: string | number
  replacementYear: string | number
  expectedUsefulLifeYears: string | number
  priority: string
  replacementPriority: string
  shutdownRequired: string
  assignedTo: string
  sourceBasis: string
  tasks: string[]
  checklist: string[]
  closeoutLogFields: string[]
  safetyNotes: string[]
}

type WorkOrder = {
  workOrderId: string
  planId: string
  assetId: string
  assetName: string
  assetType: string
  roomArea: string
  location: string
  status: string
  priority: string
  workType: string
  dueDate: string
  frequencyMonths: string | number
  estimatedCost: string | number
  estimatedHours: string | number
  assignedTo: string
  shutdownRequired: string
  lockoutRequired: string
  partsMaterials: string
  tasks: string[]
  checklist: string[]
  logFields: string[]
  safetyNotes: string[]
}

type AnnualPlan = {
  year: string | number
  maintenanceCount: string | number
  replacementCount: string | number
  maintenanceCost: string | number
  replacementCost: string | number
  totalCost: string | number
}

type AssetPlan = {
  generatedAt: string
  currency: string
  horizonYears: Array<string | number>
  assumptions: Array<{ name: string; value: string }>
  annual: AnnualPlan[]
  maintenanceSchedule: AnyRecord[]
  replacementSchedule: AnyRecord[]
  totals: Record<string, string | number>
}

type AssetDb = {
  metadata: {
    name: string
    format: string
    version: number
    sourceWorkbook?: string
    generatedAt?: string
    notes?: string
  }
  schema: {
    assetFields: string[]
    planningFieldsAddedFromResearch: string[]
    basis: Array<{ name: string; url: string; usedFor: string }>
  }
  lists: Record<string, string[]>
  assets: Asset[]
  maintenance: AnyRecord[]
  inspections: AnyRecord[]
  capitalProjects: AnyRecord[]
  documents: AnyRecord[]
  dataDictionary: AnyRecord[]
  maintenancePlans?: MaintenancePlan[]
  workOrders?: WorkOrder[]
  checklists?: Record<string, string[]>
  assetPlan?: AssetPlan
}

type Tab = 'portfolio' | 'assets' | 'capital' | 'plan' | 'work' | 'guide'

const seedDatabase: AssetDb = {
  metadata: {
    name: 'Asset Planning Dashboard',
    format: 'assetdb-json',
    version: 1,
    notes: 'Public dashboard shell. Load a local .assetdb.json or workbook to work with private asset data in your browser.',
  },
  schema: {
    assetFields: [
      'assetId',
      'assetName',
      'assetType',
      'quantity',
      'description',
      'facility',
      'location',
      'roomArea',
      'system',
      'parentAssetId',
      'fedFrom',
      'voltageBand',
      'rating',
      'makeModel',
      'serialNumber',
      'installationYear',
      'expectedUsefulLife',
      'conditionBand',
      'conditionScore',
      'criticality',
      'riskScore',
      'replacementValue',
      'remainingUsefulLife',
      'capitalCandidate',
      'recommendedAction',
      'replacementDriver',
      'lastServiceDate',
      'arcFlashLabelDate',
      'nextReviewDate',
      'status',
      'owner',
      'notes',
      'sourceDocument',
      'sourceRef',
      'lastUpdated',
    ],
    planningFieldsAddedFromResearch: [
      'maintenanceFrequencyMonths',
      'estimatedAnnualMaintenanceCost',
      'estimatedReplacementCost',
      'replacementYear',
      'printableWorkOrder',
      'assetChecklist',
      'assetPlanSummary',
    ],
    basis: [
      {
        name: 'NFPA 70B public 2022 revision report',
        url: 'https://docinfofiles.nfpa.org/files/AboutTheCodes/70B/70B_F2022_NEC_AAC_SD_SCRReport.pdf',
        usedFor: 'condition-based maintenance intervals, infrared thermography, visual inspection, and interval reduction logic',
      },
      {
        name: 'ANSI/NETA MTS-2023 overview',
        url: 'https://www.netaworld.org/standards/ansi-neta-mts',
        usedFor: 'maintenance testing scope for electrical power equipment and systems',
      },
      {
        name: 'NETA Frequency of Maintenance Tests',
        url: 'https://www.netaworld.org/standards/frequency-maintenance',
        usedFor: 'reliability-based frequency model, unique to each plant and piece of equipment',
      },
      {
        name: 'FEMP O&M Best Practices Guide',
        url: 'https://www.energy.gov/femp/articles/operations-and-maintenance-best-practices-guide-achieving-operational-efficiency',
        usedFor: 'preventive maintenance, work order, maintenance log, and budget planning structure',
      },
    ],
  },
  lists: {
    assetType: [
      'Disconnect switch',
      'Distribution or switchgear',
      'Life safety',
      'Lighting',
      'Other',
      'Panelboard',
      'Power factor equipment',
      'Protection or relay',
      'Spare parts',
      'Transformer',
    ],
    conditionBand: ['Good', 'Acceptable', 'Approaching Life', 'Needs Review', 'Beyond Life', 'Well Beyond Life', 'Not Located', 'Unknown'],
    criticality: ['High', 'Medium', 'Low'],
    capitalCandidate: ['Yes', 'Review', 'Monitor'],
    status: ['Active', 'Verify', 'Monitor', 'Planned Renewal', 'Replaced', 'Retired', 'Not in Scope'],
    workType: ['Inspection', 'Preventive maintenance', 'Repair', 'Testing', 'Replacement', 'Shutdown', 'Documentation', 'Other'],
    yesNo: ['Yes', 'No', 'N/A'],
    priority: ['Immediate', 'High', 'Medium', 'Low', 'Monitor'],
    budgetClass: ['Study / testing', 'Under $50k', '$50k-$100k', '$100k-$250k', '$250k-$500k', '$500k-$1M', '$1M+', 'TBD'],
    driver: ['Age and remaining life', 'Parts availability', 'Capacity', 'Reliability', 'Safety', 'Tenant impact', 'Code or AHJ', 'Documentation', 'Routine maintenance'],
  },
  assets: [],
  maintenance: [],
  inspections: [],
  capitalProjects: [],
  documents: [],
  dataDictionary: [],
  maintenancePlans: [],
  workOrders: [],
  checklists: {},
  assetPlan: {
    generatedAt: '',
    currency: 'CAD',
    horizonYears: [],
    assumptions: [],
    annual: [],
    maintenanceSchedule: [],
    replacementSchedule: [],
    totals: {
      tenYearMaintenanceCost: 0,
      tenYearReplacementCost: 0,
      tenYearTotalCost: 0,
      annualizedMaintenanceCost: 0,
      assetsPlanned: 0,
      workOrdersCreated: 0,
    },
  },
}

const blankAsset: Asset = {
  assetId: '',
  assetName: '',
  assetType: 'Distribution or switchgear',
  quantity: 1,
  description: '',
  facility: 'Asset facility',
  location: '',
  roomArea: '',
  system: 'Electrical distribution',
  parentAssetId: '',
  fedFrom: '',
  voltageBand: '',
  rating: '',
  makeModel: '',
  serialNumber: '',
  installationYear: '',
  age: '',
  expectedUsefulLife: '',
  conditionBand: 'Needs Review',
  conditionScore: '',
  criticality: 'Medium',
  riskScore: '',
  replacementValue: '',
  remainingUsefulLife: '',
  capitalCandidate: 'Review',
  recommendedAction: 'Confirm condition and planning basis',
  replacementDriver: 'Condition',
  lastServiceDate: '',
  arcFlashLabelDate: '',
  nextReviewDate: '',
  status: 'Active',
  owner: '',
  notes: '',
  sourceDocument: '',
  sourceRef: '',
  lastUpdated: '',
}

const assetColumns: Array<{ key: keyof Asset; label: string; type?: 'number' | 'date' | 'money' | 'textarea' }> = [
  { key: 'assetId', label: 'Asset ID' },
  { key: 'assetName', label: 'Asset name' },
  { key: 'assetType', label: 'Type' },
  { key: 'quantity', label: 'Quantity', type: 'number' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'facility', label: 'Facility' },
  { key: 'location', label: 'Location' },
  { key: 'roomArea', label: 'Room / area' },
  { key: 'system', label: 'System' },
  { key: 'parentAssetId', label: 'Parent asset' },
  { key: 'fedFrom', label: 'Fed from' },
  { key: 'voltageBand', label: 'Voltage band' },
  { key: 'rating', label: 'Rating' },
  { key: 'makeModel', label: 'Make / model' },
  { key: 'serialNumber', label: 'Serial number' },
  { key: 'installationYear', label: 'Install year / date' },
  { key: 'expectedUsefulLife', label: 'Expected useful life', type: 'number' },
  { key: 'conditionBand', label: 'Condition' },
  { key: 'conditionScore', label: 'Condition score', type: 'number' },
  { key: 'criticality', label: 'Criticality' },
  { key: 'riskScore', label: 'Risk score', type: 'number' },
  { key: 'replacementValue', label: 'Replacement value', type: 'money' },
  { key: 'remainingUsefulLife', label: 'Remaining useful life', type: 'number' },
  { key: 'capitalCandidate', label: 'Capital candidate' },
  { key: 'recommendedAction', label: 'Recommended action' },
  { key: 'replacementDriver', label: 'Replacement driver' },
  { key: 'lastServiceDate', label: 'Last service', type: 'date' },
  { key: 'arcFlashLabelDate', label: 'Arc flash label', type: 'date' },
  { key: 'nextReviewDate', label: 'Next review', type: 'date' },
  { key: 'status', label: 'Status' },
  { key: 'owner', label: 'Owner' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
  { key: 'sourceDocument', label: 'Source document' },
  { key: 'sourceRef', label: 'Source ref' },
]

const conditionScores: Record<string, number> = {
  Good: 1,
  Acceptable: 2,
  'Approaching Life': 3,
  'Needs Review': 3,
  'Not Located': 3,
  'Beyond Life': 4,
  'Well Beyond Life': 5,
}

const criticalityScores: Record<string, number> = { Low: 1, Medium: 2, High: 3 }

function normalizeString(value: unknown) {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value)
}

function numberValue(value: unknown) {
  const parsed = Number(String(value ?? '').replace(/[$,]/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

function yearValue(value: unknown) {
  const match = String(value ?? '').match(/(?:19|20)\d{2}/)
  return match ? Number(match[0]) : 0
}

function slug(value: string) {
  const parts = value.toLowerCase().match(/[a-z0-9]+/g) || []
  return parts.map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1))).join('')
}

function calculateAge(asset: Asset) {
  const year = yearValue(asset.installationYear)
  return year ? new Date().getFullYear() - year : 0
}

function deriveAsset(asset: Asset): Asset {
  const age = calculateAge(asset)
  const usefulLife = numberValue(asset.expectedUsefulLife)
  const remainingUsefulLife = usefulLife ? Math.max(usefulLife - age, 0) : numberValue(asset.remainingUsefulLife)
  const conditionScore = numberValue(asset.conditionScore) || conditionScores[asset.conditionBand] || 2
  const ageScore = age >= 45 || remainingUsefulLife === 0 ? 2 : age >= 30 || remainingUsefulLife <= 5 ? 1 : 0
  const riskScore = conditionScore + (criticalityScores[asset.criticality] || 2) + ageScore
  const capitalCandidate = riskScore >= 7 ? 'Yes' : riskScore >= 5 ? 'Review' : 'Monitor'
  return {
    ...asset,
    quantity: 1,
    age: age || '',
    conditionScore,
    riskScore,
    remainingUsefulLife: usefulLife ? remainingUsefulLife : asset.remainingUsefulLife,
    capitalCandidate,
    lastUpdated: new Date().toISOString().slice(0, 10),
  }
}

function formatMoney(value: unknown) {
  const amount = numberValue(value)
  return amount ? amount.toLocaleString(undefined, { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }) : 'Unpriced'
}

function formatDate(value: unknown) {
  const text = normalizeString(value)
  if (!text) return 'Not scheduled'
  const parsed = new Date(`${text.slice(0, 10)}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? text : parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatFrequency(value: unknown) {
  const months = numberValue(value)
  if (!months) return 'Review'
  if (months === 6) return 'Every 6 months'
  if (months === 12) return 'Annual'
  return `Every ${months} months`
}

function printAssetPlan(mode: 'summary' | 'work-order') {
  document.body.setAttribute('data-print-mode', mode)
  window.print()
  window.setTimeout(() => document.body.removeAttribute('data-print-mode'), 500)
}

function nextId(prefix: string, count: number) {
  return `${prefix}-${String(count + 1).padStart(4, '0')}`
}

function downloadFile(filename: string, text: string, type = 'application/json') {
  const blob = new Blob([text], { type })
  const href = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  link.click()
  URL.revokeObjectURL(href)
}

function sheetRowsToObjects(rows: unknown[][]) {
  const headers = (rows[3] || []).map((header) => slug(String(header)))
  return rows.slice(4).reduce<AnyRecord[]>((items, row) => {
    const item: AnyRecord = {}
    let populated = false
    headers.forEach((key, index) => {
      if (!key) return
      const value = normalizeString(row[index])
      item[key] = value
      if (value) populated = true
    })
    if (populated) items.push(item)
    return items
  }, [])
}

async function importWorkbook(file: File, current: AssetDb): Promise<AssetDb> {
  const xlsx = await import('@e965/xlsx')
  const workbook = xlsx.read(await file.arrayBuffer(), { type: 'array', cellDates: true })
  const readObjects = (sheetName: string) => {
    const sheet = workbook.Sheets[sheetName]
    if (!sheet) return []
    const rows = xlsx.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: false, defval: '' })
    return sheetRowsToObjects(rows)
  }
  const rawAssets = readObjects('Asset Register') as Partial<Asset>[]
  const assets = rawAssets.map((asset) =>
    deriveAsset({
      ...blankAsset,
      ...asset,
      facility: normalizeString(asset.facility) || 'Asset facility',
      system: normalizeString(asset.system) || 'Electrical distribution',
    }),
  )
  return {
    ...current,
    metadata: {
      ...current.metadata,
      name: 'Imported electrical asset planning database',
      sourceWorkbook: 'User imported workbook',
      generatedAt: new Date().toISOString(),
    },
    assets,
    maintenance: readObjects('Maintenance Log'),
    inspections: readObjects('Inspection Checklist'),
    capitalProjects: readObjects('Capital Plan'),
    documents: readObjects('Documents'),
    dataDictionary: readObjects('Data Dictionary'),
  }
}

function App() {
  const [db, setDb] = useState<AssetDb>(() => seedDatabase as AssetDb)
  const [tab, setTab] = useState<Tab>('portfolio')
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('All types')
  const [selectedAssetId, setSelectedAssetId] = useState(db.assets[0]?.assetId || '')
  const [dirty, setDirty] = useState(false)
  const [notice, setNotice] = useState('Public shell loaded. Use Load to open a private asset database from this computer.')
  const fileRef = useRef<HTMLInputElement>(null)

  const selectedAsset = db.assets.find((asset) => asset.assetId === selectedAssetId) || null
  const assetTypes = useMemo(() => ['All types', ...Array.from(new Set(db.assets.map((asset) => asset.assetType).filter(Boolean))).sort()], [db.assets])

  const filteredAssets = useMemo(() => {
    const text = query.toLowerCase()
    return db.assets.filter((asset) => {
      const matchesText = [asset.assetId, asset.assetName, asset.location, asset.roomArea, asset.notes, asset.recommendedAction]
        .join(' ')
        .toLowerCase()
        .includes(text)
      const matchesType = typeFilter === 'All types' || asset.assetType === typeFilter
      return matchesText && matchesType
    })
  }, [db.assets, query, typeFilter])

  const metrics = useMemo(() => {
    const totalReplacement = db.assets.reduce((sum, asset) => sum + numberValue(asset.replacementValue), 0)
    const capital = db.assets.filter((asset) => asset.capitalCandidate === 'Yes')
    const review = db.assets.filter((asset) => asset.capitalCandidate === 'Review')
    const highRisk = db.assets.filter((asset) => numberValue(asset.riskScore) >= 7 || asset.criticality === 'High')
    const missingCost = db.assets.filter((asset) => !numberValue(asset.replacementValue)).length
    const overdueReview = db.assets.filter((asset) => asset.nextReviewDate && new Date(asset.nextReviewDate) < new Date()).length
    const capex = db.capitalProjects.reduce((sum, project) => sum + numberValue(project.escalatedCost || project.estimatedCost), 0)
    return { totalReplacement, capital, review, highRisk, missingCost, overdueReview, capex }
  }, [db.assets, db.capitalProjects])

  function replaceAsset(updated: Asset) {
    setDb((current) => ({
      ...current,
      assets: current.assets.map((asset) => (asset.assetId === updated.assetId ? deriveAsset(updated) : asset)),
    }))
    setDirty(true)
  }

  function updateSelected(key: keyof Asset, value: string) {
    if (!selectedAsset) return
    replaceAsset({ ...selectedAsset, [key]: value })
  }

  function addAsset() {
    const asset = deriveAsset({
      ...blankAsset,
      assetId: `ASSET-NEW-${String(db.assets.length + 1).padStart(3, '0')}`,
      assetName: 'New planning asset',
    })
    setDb((current) => ({ ...current, assets: [asset, ...current.assets] }))
    setSelectedAssetId(asset.assetId)
    setTab('assets')
    setDirty(true)
  }

  function deleteSelected() {
    if (!selectedAsset) return
    const nextAssets = db.assets.filter((asset) => asset.assetId !== selectedAsset.assetId)
    setDb((current) => ({ ...current, assets: nextAssets }))
    setSelectedAssetId(nextAssets[0]?.assetId || '')
    setDirty(true)
  }

  function addPlanningRow(kind: 'maintenance' | 'inspections' | 'capitalProjects' | 'documents') {
    const selected = selectedAsset || db.assets[0]
    const row: AnyRecord =
      kind === 'capitalProjects'
        ? {
            projectId: nextId('CAP', db.capitalProjects.length),
            projectName: selected ? `${selected.roomArea || selected.location} renewal planning` : 'New capital project',
            assetIdOrGroup: selected?.assetId || '',
            assetName: selected?.assetName || '',
            roomArea: selected?.roomArea || '',
            driver: selected?.replacementDriver || 'Condition',
            priority: selected?.capitalCandidate === 'Yes' ? 'High' : 'Medium',
            targetYear: new Date().getFullYear() + 1,
            budgetClass: 'TBD',
            estimatedCost: '',
            escalation: 0.05,
            status: 'Proposed',
            owner: '',
            notes: '',
          }
        : kind === 'maintenance'
          ? {
              logId: nextId('ML', db.maintenance.length),
              assetId: selected?.assetId || '',
              assetName: selected?.assetName || '',
              location: selected?.location || '',
              date: new Date().toISOString().slice(0, 10),
              workType: 'Inspection',
              workSummary: '',
              serviceProvider: '',
              findings: '',
              nextAction: '',
              nextActionDue: '',
              enteredBy: '',
            }
          : kind === 'inspections'
            ? {
                inspectionId: nextId('INSP', db.inspections.length),
                assetId: selected?.assetId || '',
                assetName: selected?.assetName || '',
                roomArea: selected?.roomArea || '',
                inspectionDate: new Date().toISOString().slice(0, 10),
                visualCondition: selected?.conditionBand || 'Needs Review',
                labelsReadable: 'N/A',
                clearanceOk: 'N/A',
                accessOk: 'N/A',
                followUpRequired: 'No',
                followUpNotes: '',
              }
            : {
                documentId: nextId('DOC', db.documents.length),
                documentName: '',
                type: 'Report',
                date: new Date().toISOString().slice(0, 10),
                relatedAssetIDsOrRoom: selected?.assetId || '',
                filePathOrLink: '',
                owner: '',
                notes: '',
              }
    setDb((current) => ({ ...current, [kind]: [row, ...current[kind]] }))
    setDirty(true)
    setNotice(`Added a ${kind === 'capitalProjects' ? 'capital project' : kind.slice(0, -1)} row`)
  }

  function updatePlanningRow(kind: 'maintenance' | 'inspections' | 'capitalProjects' | 'documents', index: number, key: string, value: string) {
    setDb((current) => ({
      ...current,
      [kind]: current[kind].map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)),
    }))
    setDirty(true)
  }

  async function loadFile(file: File) {
    try {
      if (file.name.toLowerCase().endsWith('.json')) {
        const nextDb = JSON.parse(await file.text()) as AssetDb
        setDb(nextDb)
        setSelectedAssetId(nextDb.assets[0]?.assetId || '')
        setNotice(`Loaded ${file.name}`)
      } else if (file.name.toLowerCase().endsWith('.xlsx')) {
        const nextDb = await importWorkbook(file, db)
        setDb(nextDb)
        setSelectedAssetId(nextDb.assets[0]?.assetId || '')
        setNotice(`Imported workbook ${file.name}`)
      } else {
        setNotice('Use a portable .assetdb.json file or the original .xlsx workbook')
      }
      setDirty(false)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'File could not be loaded')
    }
  }

  async function savePortableFile() {
    const text = JSON.stringify({ ...db, metadata: { ...db.metadata, generatedAt: new Date().toISOString() } }, null, 2)
    const picker = window as Window & {
      showSaveFilePicker?: (options: unknown) => Promise<{
        createWritable: () => Promise<{ write: (text: string) => Promise<void>; close: () => Promise<void> }>
      }>
    }
    if (picker.showSaveFilePicker) {
      try {
        const handle = await picker.showSaveFilePicker({
          suggestedName: 'asset-planning-dashboard.assetdb.json',
          types: [{ description: 'Portable asset database', accept: { 'application/json': ['.json'] } }],
        })
        const writable = await handle.createWritable()
        await writable.write(text)
        await writable.close()
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          downloadFile('asset-planning-dashboard.assetdb.json', text)
        } else {
          throw error
        }
      }
    } else {
      downloadFile('asset-planning-dashboard.assetdb.json', text)
    }
    setDirty(false)
    setNotice('Saved a portable JSON database file')
  }

  function exportAssetsCsv() {
    const rows = [assetColumns.map((column) => column.label)]
    db.assets.forEach((asset) => rows.push(assetColumns.map((column) => normalizeString(asset[column.key]))))
    const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')
    downloadFile('asset-register.csv', csv, 'text/csv')
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <Database size={28} />
          <div>
            <strong>Asset Planner</strong>
            <span>Electrical portfolio</span>
          </div>
        </div>
        <nav>
          <button className={tab === 'portfolio' ? 'active' : ''} onClick={() => setTab('portfolio')}>
            <ClipboardList size={18} /> Portfolio
          </button>
          <button className={tab === 'assets' ? 'active' : ''} onClick={() => setTab('assets')}>
            <FileSpreadsheet size={18} /> Assets
          </button>
          <button className={tab === 'capital' ? 'active' : ''} onClick={() => setTab('capital')}>
            <Banknote size={18} /> Capital plan
          </button>
          <button className={tab === 'plan' ? 'active' : ''} onClick={() => setTab('plan')}>
            <CalendarDays size={18} /> Asset plan
          </button>
          <button className={tab === 'work' ? 'active' : ''} onClick={() => setTab('work')}>
            <Wrench size={18} /> Work history
          </button>
          <button className={tab === 'guide' ? 'active' : ''} onClick={() => setTab('guide')}>
            <BookOpen size={18} /> Field guide
          </button>
        </nav>
        <div className="source-panel">
          <span>Portable data</span>
          <strong>{db.assets.length} assets</strong>
          <p>{dirty ? 'Unsaved edits are in the browser.' : 'Database is ready to save or share.'}</p>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <h1>{db.metadata.name}</h1>
            <p>{notice}</p>
          </div>
          <div className="actions">
            <input
              ref={fileRef}
              type="file"
              accept=".json,.xlsx"
              onChange={(event) => event.target.files?.[0] && void loadFile(event.target.files[0])}
            />
            <button onClick={() => fileRef.current?.click()}>
              <Upload size={17} /> Load
            </button>
            <button onClick={exportAssetsCsv}>
              <Download size={17} /> CSV
            </button>
            <button className="primary" onClick={() => void savePortableFile()}>
              <Save size={17} /> Save file
            </button>
          </div>
        </header>

        {tab === 'portfolio' && (
          <section className="view-grid">
            <div className="kpis">
              <Metric label="Assets tracked" value={db.assets.length.toString()} note={`${metrics.highRisk.length} high criticality or high risk`} />
              <Metric label="Capital candidates" value={metrics.capital.length.toString()} note={`${metrics.review.length} should be reviewed`} />
              <Metric label="Planned capex" value={formatMoney(metrics.capex)} note="From capital plan rows with costs" />
              <Metric label="Missing costs" value={metrics.missingCost.toString()} note="Replacement values still blank" />
            </div>
            <div className="panel span-2">
              <div className="panel-heading">
                <div>
                  <h2>Risk triage</h2>
                  <p>Prioritize assets by condition, criticality, age, and remaining useful life.</p>
                </div>
                <AlertTriangle size={20} />
              </div>
              <div className="risk-list">
                {[...db.assets]
                  .sort((a, b) => numberValue(b.riskScore) - numberValue(a.riskScore))
                  .slice(0, 8)
                  .map((asset) => (
                    <button key={asset.assetId} onClick={() => { setSelectedAssetId(asset.assetId); setTab('assets') }}>
                      <strong>{asset.assetName}</strong>
                      <span>{asset.roomArea || asset.location}</span>
                      <em>{asset.riskScore || 'Review'}</em>
                    </button>
                  ))}
              </div>
            </div>
            <div className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Planning coverage</h2>
                  <p>Gaps that weaken budgeting confidence.</p>
                </div>
                <CheckCircle2 size={20} />
              </div>
              <ul className="check-list">
                <li><span>{metrics.missingCost}</span> assets need replacement value</li>
                <li><span>{metrics.overdueReview}</span> assets have past review dates</li>
                <li><span>{db.maintenance.length}</span> maintenance events available</li>
                <li><span>{db.documents.length}</span> evidence documents linked</li>
              </ul>
            </div>
          </section>
        )}

        {tab === 'assets' && (
          <section className="asset-layout">
            <div className="asset-main panel">
              <div className="toolbar">
                <div className="searchbox">
                  <Search size={17} />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search assets, rooms, actions, notes" />
                </div>
                <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                  {assetTypes.map((type) => <option key={type}>{type}</option>)}
                </select>
                <button onClick={addAsset}><Plus size={17} /> Asset</button>
              </div>
              <div className="asset-table">
                <table>
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Room</th>
                      <th>Condition</th>
                      <th>Criticality</th>
                      <th>Risk</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssets.map((asset) => (
                      <tr key={asset.assetId} className={asset.assetId === selectedAssetId ? 'selected' : ''} onClick={() => setSelectedAssetId(asset.assetId)}>
                        <td><strong>{asset.assetName}</strong><span>{asset.assetId}</span></td>
                        <td>{asset.roomArea || asset.location}</td>
                        <td>{asset.conditionBand}</td>
                        <td>{asset.criticality}</td>
                        <td><b>{asset.riskScore || 'Review'}</b></td>
                        <td>{asset.recommendedAction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <AssetEditor asset={selectedAsset} lists={db.lists} onChange={updateSelected} onDelete={deleteSelected} />
          </section>
        )}

        {tab === 'capital' && (
          <PlanningTable
            title="Capital plan"
            description="Turn asset risk into budget-ready project rows."
            rows={db.capitalProjects}
            onAdd={() => addPlanningRow('capitalProjects')}
            onChange={(index, key, value) => updatePlanningRow('capitalProjects', index, key, value)}
          />
        )}

        {tab === 'plan' && (
          <AssetPlanModule
            db={db}
            selectedAssetId={selectedAssetId}
            onSelectAsset={(assetId) => setSelectedAssetId(assetId)}
          />
        )}

        {tab === 'work' && (
          <section className="stack">
            <PlanningTable
              title="Maintenance log"
              description="Record service, testing, shutdowns, findings, and next actions."
              rows={db.maintenance}
              onAdd={() => addPlanningRow('maintenance')}
              onChange={(index, key, value) => updatePlanningRow('maintenance', index, key, value)}
            />
            <PlanningTable
              title="Inspection checklist"
              description="Field-friendly inspection outcomes tied back to asset IDs."
              rows={db.inspections}
              onAdd={() => addPlanningRow('inspections')}
              onChange={(index, key, value) => updatePlanningRow('inspections', index, key, value)}
            />
            <PlanningTable
              title="Documents"
              description="Evidence links for reports, photos, invoices, manuals, test sheets, and single lines."
              rows={db.documents}
              onAdd={() => addPlanningRow('documents')}
              onChange={(index, key, value) => updatePlanningRow('documents', index, key, value)}
            />
          </section>
        )}

        {tab === 'guide' && (
          <section className="guide-grid">
            <div className="panel">
              <h2>Improved planning fields</h2>
              <p>The workbook fields were kept and extended with plain-language fields that support asset hierarchy, useful-life planning, replacement value, ownership, and evidence quality.</p>
              <div className="field-chips">
                {db.schema.planningFieldsAddedFromResearch.map((field) => <span key={field}>{field}</span>)}
              </div>
            </div>
            <div className="panel">
              <h2>Research basis</h2>
              <div className="basis-list">
                {db.schema.basis.map((source) => (
                  <a key={source.url} href={source.url} target="_blank">
                    <strong>{source.name}</strong>
                    <span>{source.usedFor}</span>
                  </a>
                ))}
              </div>
            </div>
            <div className="panel span-2">
              <h2>Plain-English data dictionary</h2>
              <div className="dictionary">
                {db.dataDictionary.slice(0, 24).map((row, index) => (
                  <div key={`${row.field}-${index}`}>
                    <strong>{normalizeString(row.field)}</strong>
                    <span>{normalizeString(row.plainEnglishMeaning)}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  )
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{note}</p>
    </div>
  )
}

function AssetEditor({
  asset,
  lists,
  onChange,
  onDelete,
}: {
  asset: Asset | null
  lists: Record<string, string[]>
  onChange: (key: keyof Asset, value: string) => void
  onDelete: () => void
}) {
  if (!asset) {
    return <aside className="asset-editor panel empty">Select an asset to edit its planning record.</aside>
  }
  const options: Partial<Record<keyof Asset, string[]>> = {
    assetType: lists.assetType,
    conditionBand: lists.conditionBand,
    criticality: lists.criticality,
    capitalCandidate: lists.capitalCandidate,
    status: lists.status,
  }
  return (
    <aside className="asset-editor panel">
      <div className="editor-heading">
        <div>
          <span>{asset.assetId}</span>
          <h2>{asset.assetName}</h2>
        </div>
        <button className="icon-button" onClick={onDelete} title="Delete asset"><Trash2 size={17} /></button>
      </div>
      <div className="score-strip">
        <span>Risk <strong>{asset.riskScore}</strong></span>
        <span>{asset.capitalCandidate}</span>
        <span>{asset.remainingUsefulLife || 'RUL n/a'} yrs</span>
      </div>
      <div className="form-grid">
        {assetColumns.map((column) => (
          <label key={column.key} className={column.type === 'textarea' ? 'wide' : ''}>
            <span>{column.label}</span>
            {options[column.key] ? (
              <select value={normalizeString(asset[column.key])} onChange={(event) => onChange(column.key, event.target.value)}>
                {options[column.key]?.map((option) => <option key={option}>{option}</option>)}
              </select>
            ) : column.type === 'textarea' ? (
              <textarea value={normalizeString(asset[column.key])} onChange={(event) => onChange(column.key, event.target.value)} />
            ) : (
              <input
                type={column.type === 'number' || column.type === 'money' ? 'number' : column.type === 'date' ? 'date' : 'text'}
                value={normalizeString(asset[column.key])}
                onChange={(event) => onChange(column.key, event.target.value)}
              />
            )}
          </label>
        ))}
      </div>
    </aside>
  )
}

function AssetPlanModule({
  db,
  selectedAssetId,
  onSelectAsset,
}: {
  db: AssetDb
  selectedAssetId: string
  onSelectAsset: (assetId: string) => void
}) {
  const plans = db.maintenancePlans || []
  const workOrders = db.workOrders || []
  const assetPlan = db.assetPlan
  const selectedPlan = plans.find((plan) => plan.assetId === selectedAssetId) || plans[0] || null
  const selectedWorkOrder = selectedPlan ? workOrders.find((order) => order.assetId === selectedPlan.assetId) || null : null
  const annualRows = assetPlan?.annual || []
  const maintenanceRows = assetPlan?.maintenanceSchedule || []
  const replacementRows = assetPlan?.replacementSchedule || []
  const currentYear = new Date().getFullYear()
  const tenYearReplacements = replacementRows.filter((row) => numberValue(row.year) <= currentYear + 9)
  const totalMaintenance = numberValue(assetPlan?.totals.tenYearMaintenanceCost)
  const totalReplacement = numberValue(assetPlan?.totals.tenYearReplacementCost)
  const nextTwelveMonths = maintenanceRows.filter((row) => numberValue(row.year) <= currentYear + 1).length

  if (!assetPlan || !plans.length) {
    return (
      <section className="panel empty-state">
        <h2>Asset plan not generated</h2>
        <p>Run scripts/generate_asset_plans.py to build maintenance plans, work orders, checklists, and annual budget schedules for the current database.</p>
      </section>
    )
  }

  return (
    <section className="asset-plan-module stack">
      <div className="kpis no-print">
        <Metric label="Assets planned" value={plans.length.toString()} note={`${workOrders.length} printable work orders available`} />
        <Metric label="10-year maintenance" value={formatMoney(totalMaintenance)} note={`${nextTwelveMonths} scheduled events through ${currentYear + 1}`} />
        <Metric label="10-year replacement" value={formatMoney(totalReplacement)} note={`${tenYearReplacements.length} assets inside the planning horizon`} />
        <Metric label="Annual PM budget" value={formatMoney(assetPlan.totals.annualizedMaintenanceCost)} note="Generated from asset type, condition, and risk" />
      </div>

      <section className="panel plan-summary summary-print">
        <div className="panel-heading">
          <div>
            <h2>Asset planning summary</h2>
            <p>Annual maintenance and replacement forecast for {assetPlan.horizonYears[0]}-{assetPlan.horizonYears[assetPlan.horizonYears.length - 1]}.</p>
          </div>
          <button className="no-print" onClick={() => printAssetPlan('summary')}>
            <Printer size={17} /> Print summary
          </button>
        </div>
        <AnnualBars annual={annualRows} />
        <div className="plan-assumptions">
          {assetPlan.assumptions.map((assumption) => (
            <div key={assumption.name}>
              <strong>{assumption.name}</strong>
              <span>{assumption.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="plan-columns">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h2>Maintenance schedule</h2>
              <p>Next generated preventive work orders across the portfolio.</p>
            </div>
            <CalendarDays size={20} />
          </div>
          <ScheduleTable
            rows={maintenanceRows.slice(0, 18)}
            columns={[
              ['dueDate', 'Due'],
              ['assetId', 'Asset'],
              ['roomArea', 'Room'],
              ['priority', 'Priority'],
              ['estimatedCost', 'Cost'],
            ]}
            moneyKeys={['estimatedCost']}
            dateKeys={['dueDate']}
          />
        </div>

        <div className="panel">
          <div className="panel-heading">
            <div>
              <h2>Replacement schedule</h2>
              <p>Every asset has an estimated replacement year and cost.</p>
            </div>
            <BarChart3 size={20} />
          </div>
          <ScheduleTable
            rows={replacementRows.slice(0, 18)}
            columns={[
              ['year', 'Year'],
              ['assetId', 'Asset'],
              ['roomArea', 'Room'],
              ['priority', 'Priority'],
              ['estimatedCost', 'Cost'],
            ]}
            moneyKeys={['estimatedCost']}
          />
        </div>
      </section>

      <section className="panel work-order-print">
        <div className="panel-heading">
          <div>
            <h2>Printable work order, log, and checklist</h2>
            <p>Select any asset to print its next planned work order and closeout log.</p>
          </div>
          <div className="work-order-actions no-print">
            <select value={selectedPlan?.assetId || ''} onChange={(event) => onSelectAsset(event.target.value)}>
              {plans.map((plan) => (
                <option key={plan.assetId} value={plan.assetId}>
                  {plan.assetId} - {plan.assetName}
                </option>
              ))}
            </select>
            <button onClick={() => printAssetPlan('work-order')}>
              <Printer size={17} /> Print asset
            </button>
          </div>
        </div>
        {selectedPlan && selectedWorkOrder ? (
          <WorkOrderPrint plan={selectedPlan} workOrder={selectedWorkOrder} />
        ) : (
          <p>No work order is available for the selected asset.</p>
        )}
      </section>
    </section>
  )
}

function AnnualBars({ annual }: { annual: AnnualPlan[] }) {
  const maxTotal = Math.max(1, ...annual.map((row) => numberValue(row.totalCost)))
  return (
    <div className="annual-bars">
      {annual.map((row) => {
        const maintenance = numberValue(row.maintenanceCost)
        const replacement = numberValue(row.replacementCost)
        const maintenanceWidth = Math.max(maintenance ? 2 : 0, (maintenance / maxTotal) * 100)
        const replacementWidth = Math.max(replacement ? 2 : 0, (replacement / maxTotal) * 100)
        return (
          <div className="annual-row" key={normalizeString(row.year)}>
            <span>{row.year}</span>
            <div className="bar-track" aria-label={`${row.year} total ${formatMoney(row.totalCost)}`}>
              <i className="maintenance-bar" style={{ width: `${maintenanceWidth}%` }} />
              <i className="replacement-bar" style={{ left: `${maintenanceWidth}%`, width: `${Math.min(replacementWidth, 100 - maintenanceWidth)}%` }} />
            </div>
            <strong>{formatMoney(row.totalCost)}</strong>
            <em>{row.maintenanceCount} PM / {row.replacementCount} replacements</em>
          </div>
        )
      })}
      <div className="bar-legend">
        <span><i className="maintenance-dot" /> Maintenance</span>
        <span><i className="replacement-dot" /> Replacement</span>
      </div>
    </div>
  )
}

function ScheduleTable({
  rows,
  columns,
  moneyKeys = [],
  dateKeys = [],
}: {
  rows: AnyRecord[]
  columns: Array<[string, string]>
  moneyKeys?: string[]
  dateKeys?: string[]
}) {
  return (
    <div className="planning-table compact-table">
      <table>
        <thead>
          <tr>{columns.map(([, label]) => <th key={label}>{label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.assetId}-${row.year || row.dueDate}-${index}`}>
              {columns.map(([key]) => {
                const value = row[key]
                return (
                  <td key={key}>
                    {moneyKeys.includes(key) ? formatMoney(value) : dateKeys.includes(key) ? formatDate(value) : normalizeString(value)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function WorkOrderPrint({ plan, workOrder }: { plan: MaintenancePlan; workOrder: WorkOrder }) {
  return (
    <article className="work-order-sheet">
      <div className="work-order-title">
        <div>
          <span>{workOrder.workOrderId}</span>
          <h2>{workOrder.assetName}</h2>
        </div>
        <FileText size={26} />
      </div>

      <div className="work-order-meta">
        <span><strong>Asset ID</strong>{workOrder.assetId}</span>
        <span><strong>Room</strong>{workOrder.roomArea || 'Unassigned'}</span>
        <span><strong>Due</strong>{formatDate(workOrder.dueDate)}</span>
        <span><strong>Frequency</strong>{formatFrequency(workOrder.frequencyMonths)}</span>
        <span><strong>Priority</strong>{workOrder.priority}</span>
        <span><strong>Shutdown</strong>{workOrder.shutdownRequired}</span>
        <span><strong>Budget</strong>{formatMoney(workOrder.estimatedCost)}</span>
        <span><strong>Hours</strong>{workOrder.estimatedHours}</span>
      </div>

      <div className="work-order-section">
        <h3>Maintenance Plan</h3>
        <p>{plan.strategy}. {plan.sourceBasis}</p>
        <ol>
          {workOrder.tasks.map((task) => <li key={task}>{task}</li>)}
        </ol>
      </div>

      <div className="work-order-section checklist-print">
        <h3>Checklist</h3>
        <div>
          {workOrder.checklist.map((item) => (
            <label key={item}>
              <b />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="work-order-section">
        <h3>Safety Notes</h3>
        <ul>
          {workOrder.safetyNotes.map((note) => <li key={note}>{note}</li>)}
        </ul>
      </div>

      <div className="work-order-section log-print">
        <h3>Closeout Log</h3>
        <div>
          {workOrder.logFields.map((field) => (
            <label key={field}>
              <span>{field}</span>
              <i />
            </label>
          ))}
        </div>
      </div>
    </article>
  )
}

function PlanningTable({
  title,
  description,
  rows,
  onAdd,
  onChange,
}: {
  title: string
  description: string
  rows: AnyRecord[]
  onAdd: () => void
  onChange: (index: number, key: string, value: string) => void
}) {
  const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row)))).slice(0, 12)
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <button onClick={onAdd}><Plus size={17} /> Row</button>
      </div>
      <div className="planning-table">
        <table>
          <thead>
            <tr>{keys.map((key) => <th key={key}>{key.replace(/([A-Z])/g, ' $1')}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {keys.map((key) => (
                  <td key={key}>
                    <input value={normalizeString(row[key])} onChange={(event) => onChange(rowIndex, key, event.target.value)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default App
