export type SubsystemCategory = 'smart-sensing' | 'smart-comfort' | 'modular-hardware';

export interface ProstheticSensorSpec {
  id: string;
  code: string;
  name: string;
  shortLabel: string;
  hardwareRef: string;
  subsystem: SubsystemCategory;
  subsystemLabel: string;
  functionText: string;
  purposeText: string;
  benefitText: string;
  /** 3D world position on the prosthetic model (model grounded at y=0, height ~3.25) */
  anchor: [number, number, number];
  /** Camera position offset when inspecting this component */
  focusCameraPos: [number, number, number];
  /** Orbit target when inspecting this component */
  focusTarget: [number, number, number];
  /** Optional visual mode hint when focusing */
  recommendedVisualMode?: 'standard' | 'xray' | 'sensors';
}

export interface IntelligenceStage {
  step: string;
  title: string;
  summary: string;
  inputs: string;
}

export const INTELLIGENCE_STAGES: IntelligenceStage[] = [
  {
    step: '01',
    title: 'Understand',
    summary: 'Classifies walking, standing, sitting, and gait cycle phases in real time.',
    inputs: '9-DOF IMU + Plantar FSR + Joint Encoders',
  },
  {
    step: '02',
    title: 'Detect',
    summary: 'Identifies gait deviations, stumble events, localized socket pressure peaks, and thermal buildup.',
    inputs: 'Socket FSR Array + DS18B20 + SI7021',
  },
  {
    step: '03',
    title: 'Respond',
    summary: 'Supplies validated kinematic signals for variable-resistance joint control and adaptive damping.',
    inputs: 'Closed-Loop Embedded Controller',
  },
  {
    step: '04',
    title: 'Inform',
    summary: 'Translates raw multi-sensor streams into clear comfort alerts, fit trends, and modular service flags.',
    inputs: 'NEXLIMB Companion Diagnostics',
  },
];

export const PROSTHETIC_SENSORS: ProstheticSensorSpec[] = [
  {
    id: 'imu-motion',
    code: 'S-01',
    name: 'IMU Motion Sensor',
    shortLabel: 'IMU Sensor',
    hardwareRef: '9-DOF AHRS Inertial Module (BNO085 class)',
    subsystem: 'smart-sensing',
    subsystemLabel: 'Smart Sensor Technology',
    functionText: 'Measures tri-axial acceleration, angular velocity, and 3D spatial orientation.',
    purposeText: 'Recognizes walking, standing, sitting, stride cadence, and sudden stumble events across the gait cycle.',
    benefitText: 'Enables the prosthesis to understand real-time motion intent instead of behaving like a passive strut.',
    anchor: [0.06, 1.56, 0.14],
    focusCameraPos: [1.35, 1.75, 1.65],
    focusTarget: [0.02, 1.52, 0.04],
    recommendedVisualMode: 'sensors',
  },
  {
    id: 'foot-pressure',
    code: 'S-02',
    name: 'Foot Pressure Sensors',
    shortLabel: 'Foot FSR Array',
    hardwareRef: '5-Zone Plantar Force-Sensing Resistor Insole',
    subsystem: 'smart-sensing',
    subsystemLabel: 'Smart Sensor Technology',
    functionText: 'Measures ground reaction loading and weight distribution across heel, midfoot, and forefoot zones.',
    purposeText: 'Distinguishes initial heel strike, mid-stance loading, and toe-off transitions during each step.',
    benefitText: 'Provides phase-accurate loading feedback for gait symmetry tracking and adaptive stance control.',
    anchor: [0.08, 0.11, 0.28],
    focusCameraPos: [1.45, 0.65, 1.75],
    focusTarget: [0.0, 0.14, 0.16],
    recommendedVisualMode: 'xray',
  },
  {
    id: 'socket-pressure',
    code: 'S-03',
    name: 'Socket Pressure Sensors',
    shortLabel: 'Socket FSRs',
    hardwareRef: '6-Channel Flexible Polyimide Liner Array',
    subsystem: 'smart-comfort',
    subsystemLabel: 'Intelligent Comfort Monitoring',
    functionText: 'Monitors interface pressure distribution at six anatomical contact regions inside the socket liner.',
    purposeText: 'Detects unusual pressure concentrations and fit shifts as residual limb volume changes during wear.',
    benefitText: 'Flags potential socket fit issues early before localized hotspots escalate into tissue discomfort.',
    anchor: [0.13, 2.84, 0.2],
    focusCameraPos: [1.55, 2.88, 1.95],
    focusTarget: [0.02, 2.74, 0.0],
    recommendedVisualMode: 'xray',
  },
  {
    id: 'temperature',
    code: 'S-04',
    name: 'Temperature Sensor',
    shortLabel: 'Thermal Probe',
    hardwareRef: 'Digital Skin-Interface Thermal Sensor (DS18B20 class)',
    subsystem: 'smart-comfort',
    subsystemLabel: 'Intelligent Comfort Monitoring',
    functionText: 'Tracks internal socket thermal conditions continuously across extended wear sessions.',
    purposeText: 'Identifies sustained heat accumulation against individually established comfort thresholds.',
    benefitText: 'Helps users and prosthetists correlate thermal buildup with activity load and liner ventilation needs.',
    anchor: [-0.24, 2.72, 0.06],
    focusCameraPos: [-1.65, 2.85, 1.4],
    focusTarget: [-0.08, 2.7, 0.02],
    recommendedVisualMode: 'sensors',
  },
  {
    id: 'humidity',
    code: 'S-05',
    name: 'Humidity Sensor',
    shortLabel: 'Humidity Module',
    hardwareRef: 'Perforated Micro-Climate RH Sensor (SI7021 class)',
    subsystem: 'smart-comfort',
    subsystemLabel: 'Intelligent Comfort Monitoring',
    functionText: 'Monitors relative moisture and micro-climate humidity within the ventilated socket wall.',
    purposeText: 'Detects prolonged high-humidity periods that increase skin friction and liner slip risk.',
    benefitText: 'Prompts timely liner airing or inspection to maintain skin integrity and daily comfort.',
    anchor: [0.27, 2.54, 0.04],
    focusCameraPos: [1.75, 2.65, 1.35],
    focusTarget: [0.1, 2.54, 0.02],
    recommendedVisualMode: 'sensors',
  },
  {
    id: 'joint-angle',
    code: 'S-06',
    name: 'Joint-Angle Sensor',
    shortLabel: 'Magnetic Encoder',
    hardwareRef: '12-Bit Contactless Magnetic Encoder (AS5600 class)',
    subsystem: 'smart-sensing',
    subsystemLabel: 'Smart Sensor Technology',
    functionText: 'Tracks real-time flexion, extension, and angular range of motion at the rotary joint clevis.',
    purposeText: 'Compares measured joint kinematics against expected gait trajectories to flag mechanical drift.',
    benefitText: 'Supports closed-loop movement analysis and early diagnostics of joint bearing or damper wear.',
    anchor: [0.19, 2.0, 0.0],
    focusCameraPos: [1.45, 2.08, 1.35],
    focusTarget: [0.04, 1.98, 0.0],
    recommendedVisualMode: 'sensors',
  },
  {
    id: 'controller-module',
    code: 'M-07',
    name: 'Controller Module',
    shortLabel: 'AI Controller',
    hardwareRef: 'Dual-Core Embedded Sensor Fusion & Telemetry PCB',
    subsystem: 'modular-hardware',
    subsystemLabel: 'Modular Architecture',
    functionText: 'Aggregates IMU, FSR, encoder, and socket environmental streams for real-time gait processing.',
    purposeText: 'Acts as the prosthesis nervous system—fusing signals, running anomaly detection, and syncing diagnostics.',
    benefitText: 'Housed in a standardized serviceable shin bay for rapid firmware updates or drop-in board upgrades.',
    anchor: [0.0, 1.24, 0.11],
    focusCameraPos: [1.15, 1.32, 1.45],
    focusTarget: [0.0, 1.24, 0.02],
    recommendedVisualMode: 'sensors',
  },
  {
    id: 'battery-module',
    code: 'M-08',
    name: 'Replaceable Battery Module',
    shortLabel: 'Battery Pack',
    hardwareRef: 'Hot-Swappable Sealed Li-Ion Pack with Pogo Dock',
    subsystem: 'modular-hardware',
    subsystemLabel: 'Modular Architecture',
    functionText: 'Supplies regulated power to the sensor bus, controller PCB, and telemetry radio via gold pogo contacts.',
    purposeText: 'Isolates power storage as a quick-release lower-shin cartridge rather than an integrated sealed cell.',
    benefitText: 'Allows tool-free field battery swaps and independent cell servicing without taking the leg offline.',
    anchor: [0.0, 0.88, 0.1],
    focusCameraPos: [1.2, 0.96, 1.5],
    focusTarget: [0.0, 0.88, 0.02],
    recommendedVisualMode: 'standard',
  },
];
