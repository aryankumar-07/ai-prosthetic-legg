export interface ComparisonPoint {
  aspect: string;
  conventional: string;
  nexlimb: string;
}

export interface ActivityScenario {
  id: string;
  label: string;
  sensorSignature: string;
  detectionSummary: string;
  mechanicalResponse: string;
  userBenefit: string;
}

export interface ComfortScenario {
  id: string;
  label: string;
  statusLabel: string;
  isElevated: boolean;
  temperatureC: string;
  humidityPct: string;
  peakRegion: string;
  regionLevels: Array<{
    region: string;
    relativeLoad: 'baseline' | 'moderate' | 'elevated';
    note: string;
  }>;
  alertTitle: string;
  alertMessage: string;
  recommendation: string;
}

export interface ModularPartSpec {
  id: string;
  code: string;
  name: string;
  interfaceType: string;
  replacementTime: string;
  summary: string;
  repairAdvantage: string;
  upgradePath: string;
}

export interface CompanionScreenSpec {
  id: 'dashboard' | 'gait' | 'comfort' | 'telemetry' | 'maintenance';
  tabLabel: string;
  title: string;
  subtitle: string;
  purpose: string;
}

export const COMPARISON_POINTS: ComparisonPoint[] = [
  {
    aspect: 'Movement Awareness',
    conventional: 'Passive mechanical geometry with fixed resistance regardless of terrain.',
    nexlimb: 'Fuses 9-DOF IMU, plantar FSRs, and joint encoders to classify walking, standing, and transitions.',
  },
  {
    aspect: 'Socket Comfort',
    conventional: 'No feedback until soreness, chafing, or skin irritation becomes noticeable.',
    nexlimb: 'Tracks 6-zone liner pressure, skin-interface heat, and moisture against personal baselines.',
  },
  {
    aspect: 'Service & Repairs',
    conventional: 'Integrated assemblies often require full-unit servicing when one subsystem wears.',
    nexlimb: 'Standardized mechanical collars, pogo battery docks, and drop-in sensor modules enable local repair.',
  },
  {
    aspect: 'Clinical Insight',
    conventional: 'Relies strictly on brief in-clinic observation and subjective user recall.',
    nexlimb: 'Logs longitudinal gait symmetry and socket fit shifts to support prosthetist adjustments.',
  },
];

export const ACTIVITY_SCENARIOS: ActivityScenario[] = [
  {
    id: 'walking',
    label: 'Level Walking',
    sensorSignature: 'Periodic heel-to-toe FSR wave + steady 1.0–1.2 Hz IMU cadence',
    detectionSummary: 'Distinguishes initial contact, mid-stance loading, and toe-off smoothly.',
    mechanicalResponse: 'Maintains standard swing-phase clearance and baseline stance damping.',
    userBenefit: 'Consistent, energy-efficient stride timing across daily flat-ground walking.',
  },
  {
    id: 'fast-pace',
    label: 'Faster Walking',
    sensorSignature: 'Elevated tibial angular velocity + shortened stance-to-swing transition',
    detectionSummary: 'Recognizes higher stride frequency compared with the user baseline.',
    mechanicalResponse: 'Increases swing-phase damping resistance to keep shank return synchronized.',
    userBenefit: 'Prevents delayed foot placement when accelerating across crosswalks or corridors.',
  },
  {
    id: 'standing',
    label: 'Quiet Standing',
    sensorSignature: 'Balanced heel/forefoot FSR load + near-zero angular acceleration',
    detectionSummary: 'Confirms stationary weight-bearing without forward progression.',
    mechanicalResponse: 'Engages high stance stability support to minimize involuntary knee/ankle drift.',
    userBenefit: 'Reduces muscular fatigue during prolonged standing tasks.',
  },
  {
    id: 'uneven',
    label: 'Uneven Terrain',
    sensorSignature: 'Asymmetric forefoot FSR distribution + lateral IMU roll impulses',
    detectionSummary: 'Flags off-axis ground contact and unexpected ankle torque variations.',
    mechanicalResponse: 'Applies controlled adaptive damping to stabilize mid-stance roll-over.',
    userBenefit: 'Improves confidence on gravel, sloped walkways, and irregular pavements.',
  },
  {
    id: 'stairs',
    label: 'Stair Transition',
    sensorSignature: 'Forefoot-first loading + steep knee/ankle flexion profile from AS5600',
    detectionSummary: 'Identifies step ascent/descent kinematics distinct from level gait.',
    mechanicalResponse: 'Switches to preconfigured, safety-validated flexion resistance profile.',
    userBenefit: 'Controlled lowering during descent without sudden joint drop.',
  },
];

export const COMFORT_SCENARIOS: ComfortScenario[] = [
  {
    id: 'balanced',
    label: 'Balanced Wear',
    statusLabel: 'Within Personal Baseline',
    isElevated: false,
    temperatureC: '31.8 °C',
    humidityPct: '46%',
    peakRegion: 'None',
    regionLevels: [
      { region: 'Anterior Tibial Crest', relativeLoad: 'baseline', note: 'Even contact distribution' },
      { region: 'Patellar Tendon Bar', relativeLoad: 'baseline', note: 'Nominal weight sharing' },
      { region: 'Medial Flare', relativeLoad: 'baseline', note: 'Stable alignment' },
      { region: 'Lateral Wall', relativeLoad: 'baseline', note: 'Normal lateral containment' },
      { region: 'Posterior Calf', relativeLoad: 'baseline', note: 'Ventilation airflow active' },
      { region: 'Distal End Pad', relativeLoad: 'baseline', note: 'No bottoming-out shift' },
    ],
    alertTitle: 'Socket environment nominal',
    alertMessage: 'Monitored socket pressure, thermal, and moisture readings remain within your calibrated wear range.',
    recommendation: 'Continue normal wear; periodic liner check at end of day.',
  },
  {
    id: 'hotspot',
    label: 'Pressure Concentration',
    statusLabel: 'Fit Attention Suggested',
    isElevated: true,
    temperatureC: '33.4 °C',
    humidityPct: '58%',
    peakRegion: 'Anterior Tibial Crest',
    regionLevels: [
      { region: 'Anterior Tibial Crest', relativeLoad: 'elevated', note: 'Above personal baseline' },
      { region: 'Patellar Tendon Bar', relativeLoad: 'moderate', note: 'Slight load shift' },
      { region: 'Medial Flare', relativeLoad: 'baseline', note: 'Normal range' },
      { region: 'Lateral Wall', relativeLoad: 'moderate', note: 'Compensatory contact' },
      { region: 'Posterior Calf', relativeLoad: 'baseline', note: 'Normal range' },
      { region: 'Distal End Pad', relativeLoad: 'elevated', note: 'Increased distal sinking' },
    ],
    alertTitle: 'Socket condition notice',
    alertMessage: 'Unusual pressure concentration detected around the monitored anterior and distal socket regions.',
    recommendation: 'Consider pausing to inspect liner seating or adjusting sock ply. Consult your prosthetist if discomfort persists.',
  },
  {
    id: 'microclimate',
    label: 'High Moisture & Heat',
    statusLabel: 'Micro-Climate Alert',
    isElevated: true,
    temperatureC: '35.2 °C',
    humidityPct: '78%',
    peakRegion: 'Posterior Calf',
    regionLevels: [
      { region: 'Anterior Tibial Crest', relativeLoad: 'moderate', note: 'Slightly elevated friction' },
      { region: 'Patellar Tendon Bar', relativeLoad: 'baseline', note: 'Normal range' },
      { region: 'Medial Flare', relativeLoad: 'moderate', note: 'Moisture-linked shift' },
      { region: 'Lateral Wall', relativeLoad: 'baseline', note: 'Normal range' },
      { region: 'Posterior Calf', relativeLoad: 'elevated', note: 'Sustained high humidity' },
      { region: 'Distal End Pad', relativeLoad: 'moderate', note: 'Mild liner slip risk' },
    ],
    alertTitle: 'Extended moisture buildup detected',
    alertMessage: 'Elevated socket humidity and thermal rise sustained across prolonged continuous wear.',
    recommendation: 'Take a short break, dry the liner interface, and verify lateral ventilation vents are unobstructed.',
  },
];

export const MODULAR_PARTS: ModularPartSpec[] = [
  {
    id: 'mod-liner',
    code: 'MOD-01',
    name: 'Smart Liner & Flex Sensor Array',
    interfaceType: '6-Pin Sealed Magnetic Flex Connector',
    replacementTime: '< 2 min',
    summary: 'Breathable grey comfort liner integrated with a thin polyimide array of 6 circular FSR pressure zones and thermal probe.',
    repairAdvantage: 'Liner wear or a single damaged sensor trace is replaced independently without touching the carbon shell.',
    upgradePath: 'Supports higher-density FSR matrix layouts as custom socket profiles evolve.',
  },
  {
    id: 'mod-battery',
    code: 'MOD-02',
    name: 'Hot-Swappable Battery Cartridge',
    interfaceType: 'Spring-Loaded Gold Pogo-Pin Dock',
    replacementTime: '15 sec',
    summary: 'Sealed lower-shin Li-ion battery pack with integrated protection circuitry and 3-LED charge state indicator.',
    repairAdvantage: 'Degraded battery cells swap out tool-free in seconds—no soldering or clinic downtime required.',
    upgradePath: 'Compatible with higher-capacity cell packs sharing the standardized dock footprint.',
  },
  {
    id: 'mod-controller',
    code: 'MOD-03',
    name: 'Controller & Telemetry Bay',
    interfaceType: 'Standardized JST-GH Sensor Bus + USB-C Service Port',
    replacementTime: '5 min',
    summary: 'Finned anodized shin enclosure housing the dual-core sensor fusion MCU, wireless telemetry radio, and 9-DOF IMU.',
    repairAdvantage: 'Isolated from mechanical load paths so board diagnostics or replacements are quick and affordable.',
    upgradePath: 'Drop-in firmware OTA updates and future AI co-processor board compatibility.',
  },
  {
    id: 'mod-joint',
    code: 'MOD-04',
    name: 'Rotary Joint & Magnetic Encoder',
    interfaceType: 'ISO-Compatible Pyramid Adapter & Bearing Cap',
    replacementTime: '10 min',
    summary: 'Machined brushed-titanium rotary clevis housing a contactless 12-bit AS5600 magnetic induction angle encoder.',
    repairAdvantage: 'Wearable bearings and encoder PCBs are externally accessible via side caps without cutting the pylon.',
    upgradePath: 'Supports upgrading from passive-monitored clevis to semi-active variable-resistance actuator.',
  },
  {
    id: 'mod-pylon',
    code: 'MOD-05',
    name: 'Twin-Spar Carbon Exoskeleton',
    interfaceType: '30 mm Standard Clamping Collars',
    replacementTime: '8 min',
    summary: 'Fenestrated carbon-fiber shin structure balancing high axial stiffness with open electronics cooling and inspection.',
    repairAdvantage: 'Uses accessible composite layup and standard clamping hardware for low-cost local fabrication.',
    upgradePath: 'Interchangeable strut lengths and stiffness grades tailored to user weight and activity.',
  },
  {
    id: 'mod-foot',
    code: 'MOD-06',
    name: 'Multi-Blade Carbon Foot & FSR Insole',
    interfaceType: 'Titanium Side Linkage + Snap-In Outsole',
    replacementTime: '6 min',
    summary: 'Segmented 4-blade forefoot spring, arch shock strut, and replaceable 5-zone plantar pressure sensing insole.',
    repairAdvantage: 'Worn rubber soles or fatigued toe blades swap independently from the ankle clevis.',
    upgradePath: 'Switchable stiffness blades for everyday walking vs. high-impact outdoor terrain.',
  },
];

export const COMPANION_SCREENS: CompanionScreenSpec[] = [
  {
    id: 'dashboard',
    tabLabel: 'Dashboard',
    title: 'Daily Overview & Status',
    subtitle: 'Immediate answers: connection health, daily steps, gait consistency, and attention flags.',
    purpose: 'Gives the wearer a calm, at-a-glance medical companion overview without overwhelming raw telemetry.',
  },
  {
    id: 'gait',
    tabLabel: 'Gait AI',
    title: 'Personalised Gait Intelligence',
    subtitle: 'Cadence, stride timing, gait-phase balance, and week-over-week personal baseline comparison.',
    purpose: 'Turns IMU, plantar FSR, and joint-angle streams into longitudinal movement reports shareable with a prosthetist.',
  },
  {
    id: 'comfort',
    tabLabel: 'Comfort',
    title: 'Smart Socket Monitoring',
    subtitle: 'Color-coded socket pressure map, thermal/humidity tracking, and proactive comfort recommendations.',
    purpose: 'Highlights unusual pressure concentrations relative to calibrated wear ranges before skin irritation develops.',
  },
  {
    id: 'telemetry',
    tabLabel: 'Live Bus',
    title: 'Engineering Sensor Verification',
    subtitle: 'Multi-channel hardware status for IMU axes, plantar load zones, joint angle, and socket climate.',
    purpose: 'Allows engineers and prosthetists to verify sensor calibration, bus connectivity, and signal quality.',
  },
  {
    id: 'maintenance',
    tabLabel: 'Modularity',
    title: 'Modular Service & Diagnostics',
    subtitle: 'Per-module operational health, battery cycles, inspection reminders, and replacement history.',
    purpose: 'Pinpoints which serviceable module requires inspection so repairs stay localized and predictable.',
  },
];
