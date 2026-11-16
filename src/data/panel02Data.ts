import type { ActivityId, ScenarioId, TerrainCondition } from '../three/activityKinematics';

export interface ActivityOption {
  id: ActivityId;
  label: string;
  shortLabel: string;
  environmentLabel: string;
  conventionalNote: string;
  nexlimbNote: string;
}

export interface ComparisonScenarioSpec {
  id: ScenarioId;
  code: string;
  navLabel: string;
  title: string;
  subtitle: string;
  defaultActivity: ActivityId;
  socketXray: boolean;
  highlightedSensors: string[];
  conventionalHeading: string;
  conventionalBullets: string[];
  nexlimbHeading: string;
  nexlimbBullets: string[];
  outcomeConventional: string;
  outcomeNexlimb: string;
  practicalAdvantage: string;
}

export interface GaitCycleStageSpec {
  index: number;
  title: string;
  phaseCenter: number;
  heelLoadPct: number;
  forefootLoadPct: number;
  kneeAngleDeg: number;
  activeSensors: string[];
  telemetrySummary: string;
}

export interface TerrainOptionSpec {
  id: TerrainCondition;
  label: string;
  surfaceDescription: string;
  orientationChange: string;
  loadingShift: string;
  detectionTitle: string;
  detectionMessage: string;
}

export interface SocketPressurePointSpec {
  id: string;
  code: string;
  regionName: string;
  svgX: number;
  svgY: number;
  simulatedKpa: number;
  baselineKpa: number;
  status: 'baseline' | 'watch' | 'elevated';
  trendSeries: number[];
  explanation: string;
}

export interface MaintenanceStepSpec {
  step: number;
  label: string;
  title: string;
  detail: string;
  separation01: number;
  busStatus: string;
}

export const PANEL02_ACTIVITIES: ActivityOption[] = [
  {
    id: 'walking',
    label: 'Normal Walking',
    shortLabel: 'Walking',
    environmentLabel: 'Moving Walkway Track',
    conventionalNote: 'Rigid passive pylon transfers heel impact directly with zero electronic gait data.',
    nexlimbNote: 'IMU, plantar FSRs, and joint encoder synchronize to classify every gait stage.',
  },
  {
    id: 'climbing-stairs',
    label: 'Climbing Stairs',
    shortLabel: 'Climb Stairs',
    environmentLabel: 'Ascending Stepped Rig',
    conventionalNote: 'High bulky knee block requires extra hip hike to clear each raised step.',
    nexlimbNote: 'AS5600 encoder and forefoot FSRs track raised step clearance and flexion angle.',
  },
  {
    id: 'descending-stairs',
    label: 'Descending Stairs',
    shortLabel: 'Descend Stairs',
    environmentLabel: 'Descending Stepped Rig',
    conventionalNote: 'Fixed mechanical pivot & rigid rubber heel require deliberate compensatory braking.',
    nexlimbNote: 'Monitors controlled flexion angle and forefoot-to-heel lowering load shifts.',
  },
  {
    id: 'uneven-terrain',
    label: 'Uneven Terrain',
    shortLabel: 'Uneven Ground',
    environmentLabel: 'Irregular Sloped Walkway',
    conventionalNote: 'No lateral compliance or awareness when sole encounters angled obstacles.',
    nexlimbNote: 'IMU roll impulses & asymmetric plantar FSR readings flag off-axis surface changes.',
  },
  {
    id: 'standing',
    label: 'Standing & Weight Shift',
    shortLabel: 'Standing',
    environmentLabel: 'Stationary Balance Pad',
    conventionalNote: 'Provides passive column support without visibility into weight balance or socket load.',
    nexlimbNote: 'Low gyro velocity + steady dual-zone FSR distribution confirms quiet stance.',
  },
  {
    id: 'sitting',
    label: 'Sitting & Standing Up',
    shortLabel: 'Sit & Stand',
    environmentLabel: 'Seated Clinic Rig',
    conventionalNote: 'Exposed mechanical block swings strictly passively during deep ~80° flexion.',
    nexlimbNote: 'Joint encoder tracks deep flexion excursion and logs sit-to-stand transition timing.',
  },
];

export const PANEL02_SCENARIOS: ComparisonScenarioSpec[] = [
  {
    id: 'walking',
    code: '01',
    navLabel: '01 — Walking',
    title: 'UNDERSTANDING EVERY STEP.',
    subtitle:
      'Comparing passive mechanical walking support against multi-sensor gait phase recognition and movement monitoring.',
    defaultActivity: 'walking',
    socketXray: false,
    highlightedSensors: ['imu-motion', 'foot-pressure', 'joint-angle', 'controller-module'],
    conventionalHeading: 'MECHANICAL MOVEMENT',
    conventionalBullets: [
      'Provides physical support during walking.',
      'Movement is governed solely by its mechanical construction.',
      'Does not inherently collect electronic gait data.',
      'Walking analysis generally requires external lab equipment or visual observation.',
    ],
    nexlimbHeading: 'INTELLIGENT MOVEMENT MONITORING',
    nexlimbBullets: [
      'IMU monitors tri-axial acceleration and spatial orientation.',
      'Foot-pressure sensors identify heel-to-toe loading patterns.',
      'Joint-angle sensors track prosthetic rotary joint movement.',
      'Multiple sensor readings combine to identify walking phases.',
      'AI-based analysis compares movement against the user’s personal baseline.',
    ],
    outcomeConventional: 'Provides mechanical support.',
    outcomeNexlimb:
      'Provides mechanical support alongside sensor-based movement monitoring and gait analysis.',
    practicalAdvantage: 'UNDERSTAND MOVEMENT. NOT JUST PERFORM IT.',
  },
  {
    id: 'extended-wear',
    code: '02',
    navLabel: '02 — Extended Wear',
    title: 'COMFORT THAT CAN BE MONITORED.',
    subtitle:
      'Tracking internal socket pressure, temperature, and humidity shifts across prolonged daily use.',
    defaultActivity: 'standing',
    socketXray: true,
    highlightedSensors: ['socket-pressure', 'temperature', 'humidity', 'controller-module'],
    conventionalHeading: 'TRADITIONAL COMFORT ASSESSMENT',
    conventionalBullets: [
      'Comfort primarily depends on initial socket fit and physical assessment.',
      'The user relies strictly on their own sensation to recognise discomfort.',
      'Pressure distribution inside the socket is not monitored electronically.',
      'Temperature and humidity buildup are not inherently tracked.',
    ],
    nexlimbHeading: 'SMART SOCKET MONITORING',
    nexlimbBullets: [
      'Embedded pressure sensors monitor selected socket contact regions.',
      'Temperature sensors monitor internal thermal conditions continuously.',
      'Humidity sensors track micro-climate moisture inside the ventilated liner.',
      'The system identifies unusual changes relative to calibrated wear ranges.',
      'The companion app surfaces timely comfort-related notices.',
    ],
    outcomeConventional:
      'Comfort assessment primarily depends on physical feedback and clinic evaluation.',
    outcomeNexlimb:
      'Adds continuous monitoring of selected socket pressure and environmental conditions.',
    practicalAdvantage: 'MORE VISIBILITY INTO SOCKET COMFORT CONDITIONS.',
  },
  {
    id: 'uneven-terrain',
    code: '03',
    navLabel: '03 — Uneven Terrain',
    title: 'MOVEMENT ISN’T ALWAYS PREDICTABLE.',
    subtitle:
      'Observing how multi-sensor awareness captures orientation and loading shifts across changing ground surfaces.',
    defaultActivity: 'uneven-terrain',
    socketXray: false,
    highlightedSensors: ['imu-motion', 'foot-pressure', 'joint-angle', 'controller-module'],
    conventionalHeading: 'MECHANICAL RESPONSE',
    conventionalBullets: [
      'Physical response depends strictly on the prosthetic’s fixed design.',
      'Mechanical behaviour is determined by alignment and elastomer stiffness.',
      'No inherent electronic analysis of changing movement patterns or slips.',
    ],
    nexlimbHeading: 'MOVEMENT AWARENESS',
    nexlimbBullets: [
      'IMU monitors abrupt shifts in acceleration and roll/pitch orientation.',
      'Foot-pressure sensors record asymmetric plantar loading patterns.',
      'Joint-angle sensors log knee and ankle trajectory deviations.',
      'Combined sensor streams identify changes relative to flat-ground baseline.',
      'Note: Current prototype logs deviations without claiming automatic active actuation.',
    ],
    outcomeConventional: 'Mechanical movement strictly according to its passive construction.',
    outcomeNexlimb:
      'Mechanical movement combined with electronic movement monitoring and deviation analysis.',
    practicalAdvantage: 'BETTER INSIGHT INTO CHANGING MOVEMENT CONDITIONS.',
  },
  {
    id: 'pressure-awareness',
    code: '04',
    navLabel: '04 — Pressure Awareness',
    title: 'IDENTIFYING WHAT YOU CANNOT ALWAYS SEE.',
    subtitle:
      'Mapping invisible limb-to-socket contact zones to make localized load concentrations visible early.',
    defaultActivity: 'standing',
    socketXray: true,
    highlightedSensors: ['socket-pressure', 'controller-module'],
    conventionalHeading: 'PHYSICAL ASSESSMENT',
    conventionalBullets: [
      'Socket fit is assessed through user recall and periodic clinical examination.',
      'Localized pressure concentrations remain invisible inside opaque plastic shells.',
      'Changes in residual limb volume generally require physical checkups.',
    ],
    nexlimbHeading: 'PRESSURE DISTRIBUTION MONITORING',
    nexlimbBullets: [
      'Six flexible polyimide pressure sensors monitor key socket anatomical regions.',
      'Individual readings combine into a unified pressure distribution view.',
      'Unusual localized concentrations are compared against established baselines.',
      'The companion interface highlights monitored regions showing rising load trends.',
    ],
    outcomeConventional: 'Relies primarily on physical assessment and subjective user feedback.',
    outcomeNexlimb: 'Adds electronic visibility into selected socket pressure regions.',
    practicalAdvantage: 'MAKE HIDDEN PRESSURE PATTERNS MORE VISIBLE.',
  },
  {
    id: 'maintenance',
    code: '05',
    navLabel: '05 — Maintenance',
    title: 'REPAIR WHAT NEEDS REPAIR. NOT EVERYTHING.',
    subtitle:
      'Replacing individual serviceable electronics and sensor modules without discarding the entire limb assembly.',
    defaultActivity: 'standing',
    socketXray: false,
    highlightedSensors: ['socket-pressure', 'controller-module', 'battery-module'],
    conventionalHeading: 'CONSTRUCTION-DEPENDENT MAINTENANCE',
    conventionalBullets: [
      'Repair requirements depend on the monolithic molded or glued construction.',
      'Damaged liners, joints, or cosmetic covers often require workshop downtime.',
      'Replacement procedures vary across proprietary brackets and components.',
    ],
    nexlimbHeading: 'MODULAR ENGINEERING',
    nexlimbBullets: [
      'Isolated, replaceable electronic controller PCB inside an open shin bay.',
      'Interchangeable liner, plantar, and rotary sensor modules.',
      'Tool-free snap-in battery cartridge with standardized gold pogo dock.',
      'Standardised sensor bus architecture supports individual component servicing.',
      'Upgradeable electronics architecture preserves the carbon structural frame.',
    ],
    outcomeConventional:
      'Repairability depends on the original integrated construction and workshop tooling.',
    outcomeNexlimb: 'Designed to support individual component replacement and future upgrades.',
    practicalAdvantage:
      'MAINTAIN INDIVIDUAL COMPONENTS WITHOUT REPLACING THE ENTIRE SYSTEM WHENEVER POSSIBLE.',
  },
];

export const GAIT_CYCLE_STAGES: GaitCycleStageSpec[] = [
  {
    index: 0,
    title: 'Initial Contact',
    phaseCenter: 0.06,
    heelLoadPct: 86,
    forefootLoadPct: 10,
    kneeAngleDeg: 5,
    activeSensors: ['foot-pressure', 'imu-motion'],
    telemetrySummary: 'Heel FSR spike + IMU longitudinal deceleration confirm heel strike.',
  },
  {
    index: 1,
    title: 'Loading Response',
    phaseCenter: 0.2,
    heelLoadPct: 72,
    forefootLoadPct: 48,
    kneeAngleDeg: 14,
    activeSensors: ['foot-pressure', 'joint-angle', 'socket-pressure'],
    telemetrySummary: 'Controlled ~14° loading cushion absorbed while plantar pressure shifts forward.',
  },
  {
    index: 2,
    title: 'Mid-Stance',
    phaseCenter: 0.38,
    heelLoadPct: 38,
    forefootLoadPct: 68,
    kneeAngleDeg: 6,
    activeSensors: ['imu-motion', 'foot-pressure'],
    telemetrySummary: 'Body center of mass passes smoothly over foot; tibial verticality detected.',
  },
  {
    index: 3,
    title: 'Terminal Stance & Toe-Off',
    phaseCenter: 0.54,
    heelLoadPct: 8,
    forefootLoadPct: 94,
    kneeAngleDeg: 22,
    activeSensors: ['foot-pressure', 'joint-angle'],
    telemetrySummary: 'Forefoot blade spring peak load + rapid ankle plantarflexion impulse.',
  },
  {
    index: 4,
    title: 'Swing Phase',
    phaseCenter: 0.78,
    heelLoadPct: 0,
    forefootLoadPct: 0,
    kneeAngleDeg: 58,
    activeSensors: ['imu-motion', 'joint-angle'],
    telemetrySummary: 'Zero plantar FSR load + peak ~58° knee flexion clearance logged by AS5600.',
  },
];

export const TERRAIN_CONDITIONS: TerrainOptionSpec[] = [
  {
    id: 'flat',
    label: 'FLAT SURFACE',
    surfaceDescription: 'Even, predictable level corridor walking with symmetric cadence.',
    orientationChange: '±2° nominal roll · Steady 1.1 Hz stride rhythm',
    loadingShift: 'Consistent heel-to-toe progression across baseline zones',
    detectionTitle: 'BASELINE GAIT MATCHED',
    detectionMessage:
      'IMU orientation and plantar loading follow the user’s calibrated flat-ground signature.',
  },
  {
    id: 'incline',
    label: 'INCLINE',
    surfaceDescription: 'Upward ramped walkway altering ankle dorsiflexion and forefoot load.',
    orientationChange: '+6° sustained pitch tilt · Elevated angular impulse',
    loadingShift: 'Earlier forefoot engagement & prolonged stance phase',
    detectionTitle: 'MOVEMENT CHANGE DETECTED',
    detectionMessage:
      'Sustained pitch inclination and shifted plantar load recorded for gait log analysis.',
  },
  {
    id: 'uneven',
    label: 'UNEVEN SURFACE',
    surfaceDescription: 'Irregular pavement slabs introducing lateral ankle roll and strike variance.',
    orientationChange: '±11° rapid roll perturbations · Variable stride timing',
    loadingShift: 'Asymmetric medial/lateral forefoot pressure distribution',
    detectionTitle: 'MOVEMENT CHANGE DETECTED',
    detectionMessage:
      'Changes in orientation and loading pattern identified. Movement data recorded for gait analysis.',
  },
];

export const SOCKET_PRESSURE_POINTS: SocketPressurePointSpec[] = [
  {
    id: 'anterior-crest',
    code: 'P-01',
    regionName: 'Anterior Tibial Crest',
    svgX: 146,
    svgY: 112,
    simulatedKpa: 82,
    baselineKpa: 54,
    status: 'elevated',
    trendSeries: [50, 53, 58, 66, 74, 82],
    explanation:
      'Simulated reading is +52% above baseline wear range, indicating concentrated anterior shin contact during stance.',
  },
  {
    id: 'patellar-bar',
    code: 'P-02',
    regionName: 'Patellar Tendon Bar',
    svgX: 118,
    svgY: 74,
    simulatedKpa: 64,
    baselineKpa: 60,
    status: 'baseline',
    trendSeries: [58, 59, 61, 60, 62, 64],
    explanation:
      'Weight-bearing load sits cleanly within the normal calibrated range for patellar tendon support.',
  },
  {
    id: 'medial-flare',
    code: 'P-03',
    regionName: 'Medial Flare',
    svgX: 84,
    svgY: 120,
    simulatedKpa: 52,
    baselineKpa: 48,
    status: 'baseline',
    trendSeries: [46, 47, 48, 49, 51, 52],
    explanation:
      'Stable medial containment pressure with minor physiological drift across the 6-hour simulated window.',
  },
  {
    id: 'lateral-wall',
    code: 'P-04',
    regionName: 'Lateral Wall',
    svgX: 192,
    svgY: 132,
    simulatedKpa: 67,
    baselineKpa: 55,
    status: 'watch',
    trendSeries: [53, 54, 57, 60, 64, 67],
    explanation:
      'Moderate upward drift suggesting slight lateral load compensation during extended walking.',
  },
  {
    id: 'posterior-calf',
    code: 'P-05',
    regionName: 'Posterior Calf',
    svgX: 146,
    svgY: 170,
    simulatedKpa: 49,
    baselineKpa: 46,
    status: 'baseline',
    trendSeries: [44, 45, 45, 47, 48, 49],
    explanation:
      'Even posterior contact near the lateral ventilation mesh channels; no localized pressure spike.',
  },
  {
    id: 'distal-pad',
    code: 'P-06',
    regionName: 'Distal End Pad',
    svgX: 138,
    svgY: 226,
    simulatedKpa: 71,
    baselineKpa: 45,
    status: 'watch',
    trendSeries: [44, 46, 52, 59, 65, 71],
    explanation:
      'Gradual distal increase typically reflects mild limb volume reduction causing deeper socket seating.',
  },
];

export const MAINTENANCE_SEQUENCE_STEPS: MaintenanceStepSpec[] = [
  {
    step: 1,
    label: '01 · Detect',
    title: 'Sensor Drift Flagged',
    detail: 'System identifies an intermittent reading on the monitored socket pressure sensor channel.',
    separation01: 0,
    busStatus: 'Channel S-03 Signal Drift',
  },
  {
    step: 2,
    label: '02 · Alert',
    title: 'Companion Notice Displayed',
    detail: 'The companion app displays a localized maintenance notice pointing specifically to module S-03.',
    separation01: 0.15,
    busStatus: 'Maintenance Alert Queued',
  },
  {
    step: 3,
    label: '03 · Highlight',
    title: 'Module Pinpointed on Limb',
    detail: 'The relevant sensor pod and flex harness are illuminated on the 3D assembly while other systems stay intact.',
    separation01: 0.3,
    busStatus: 'Target Bay Isolated',
  },
  {
    step: 4,
    label: '04 · Detach',
    title: 'Module Separates Cleanly',
    detail: 'The quick-release pressure sensor module unplugs from its standardized mounting dock.',
    separation01: 1.0,
    busStatus: 'Module Disconnected (Safe)',
  },
  {
    step: 5,
    label: '05 · Install',
    title: 'Replacement Seated',
    detail: 'A fresh drop-in sensor module snaps into the standardized connector without touching the carbon pylon.',
    separation01: 0.22,
    busStatus: 'Replacement Docked',
  },
  {
    step: 6,
    label: '06 · Verify',
    title: 'Simulated Connection Check',
    detail: 'Controller performs a simulated bus handshake and restores normal socket monitoring immediately.',
    separation01: 0,
    busStatus: 'Simulated Verification Passed',
  },
];

export const COMPARISON_PILLARS = [
  {
    code: '01',
    title: 'Movement Intelligence',
    description: 'Sensor-based movement monitoring and gait phase analysis across daily activities.',
  },
  {
    code: '02',
    title: 'Smart Comfort Awareness',
    description: 'Continuous socket pressure, temperature, and humidity visibility against personal baselines.',
  },
  {
    code: '03',
    title: 'Modular Engineering',
    description: 'Replaceable electronics and sensor modules designed for localized service and future upgrades.',
  },
];
