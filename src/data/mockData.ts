import { Route, Bus } from '../types';

// Hyderabad / Secunderabad route coordinates
const RADHIKA_LAT = 17.47711;
const RADHIKA_LNG = 78.56341;

const SAKET_LAT = 17.48550;
const SAKET_LNG = 78.57450;

const DAMMAIGUDA_LAT = 17.5018;
const DAMMAIGUDA_LNG = 78.5890;

const PS_RAO_LAT = 17.499562;
const PS_RAO_LNG = 78.596045;

const DUBAI_BUILDING_LAT = 17.49336;
const DUBAI_BUILDING_LNG = 78.59577;

const ANURAG_LAT = 17.4193102;
const ANURAG_LNG = 78.6565403;


export const MOCK_ROUTES: Route[] = [
  {
    id: 'R101',
    name: 'Radhika - Anurag University',
    type: 'Regular',
    color: '#3b82f6',

    path: [
      [RADHIKA_LAT, RADHIKA_LNG],
      [SAKET_LAT, SAKET_LNG],
      [DAMMAIGUDA_LAT, DAMMAIGUDA_LNG],
      [PS_RAO_LAT, PS_RAO_LNG],
      [DUBAI_BUILDING_LAT, DUBAI_BUILDING_LNG],
      [ANURAG_LAT, ANURAG_LNG],
    ],

    stops: [
      {
        id: 'S1',
        name: 'Radhika Bus Stop',
        location: [RADHIKA_LAT, RADHIKA_LNG],
      },
      {
        id: 'S2',
        name: 'Saket',
        location: [SAKET_LAT, SAKET_LNG],
      },
      {
        id: 'S3',
        name: 'Dammaiguda X Roads',
        location: [DAMMAIGUDA_LAT, DAMMAIGUDA_LNG],
      },
      {
        id: 'S4',
        name: 'PS Rao Nagar',
        location: [PS_RAO_LAT, PS_RAO_LNG],
      },
      {
        id: 'S5',
        name: 'Dubai Building',
        location: [DUBAI_BUILDING_LAT, DUBAI_BUILDING_LNG],
      },
      {
        id: 'S6',
        name: 'Anurag University',
        location: [ANURAG_LAT, ANURAG_LNG],
      },
    ],
  },
  {
    id: 'R102', name: 'Nagaram - ECIL - Anurag University', type: 'Regular', color: '#10b981',
    path: [[17.4709,78.5794],[17.4778,78.5630],[17.4761,78.5590],[17.4740,78.5480],[17.4658,78.5485],[ANURAG_LAT,ANURAG_LNG]],
    stops: [
      { id: 'S07', name: 'Nagaram X Roads', location: [17.4709,78.5794] },
      { id: 'S08', name: 'Radhika Theatre Junction', location: [17.4778,78.5630] },
      { id: 'S09', name: 'ECIL X Roads', location: [17.4761,78.5590] },
      { id: 'S10', name: 'AS Rao Nagar', location: [17.4740,78.5480] },
      { id: 'S11', name: 'Sainikpuri Main Road', location: [17.4658,78.5485] },
      { id: 'S12', name: 'Anurag University', location: [ANURAG_LAT,ANURAG_LNG] },
    ],
  },
  {
    id: 'R103', name: 'Uppal - Boduppal - Anurag University', type: 'Regular', color: '#f59e0b',
    path: [[17.4018,78.5590],[17.4075,78.5688],[17.4135,78.5780],[17.4200,78.5900],[17.4308,78.6025],[ANURAG_LAT,ANURAG_LNG]],
    stops: [
      { id: 'S13', name: 'Uppal Metro Station', location: [17.4018,78.5590] },
      { id: 'S14', name: 'Boduppal Main Road', location: [17.4075,78.5688] },
      { id: 'S15', name: 'Peerzadiguda Junction', location: [17.4135,78.5780] },
      { id: 'S16', name: 'Medipally X Roads', location: [17.4200,78.5900] },
      { id: 'S17', name: 'Ghatkesar Road Junction', location: [17.4308,78.6025] },
      { id: 'S18', name: 'Anurag University', location: [ANURAG_LAT,ANURAG_LNG] },
    ],
  },
  {
    id: 'R104', name: 'LB Nagar - Hayathnagar - Anurag University', type: 'Regular', color: '#8b5cf6',
    path: [[17.3465,78.5521],[17.3518,78.5795],[17.3655,78.5902],[17.3832,78.6045],[17.4010,78.6250],[ANURAG_LAT,ANURAG_LNG]],
    stops: [
      { id: 'S19', name: 'LB Nagar Metro Station', location: [17.3465,78.5521] },
      { id: 'S20', name: 'Hayathnagar Bus Stop', location: [17.3518,78.5795] },
      { id: 'S21', name: 'Vanasthalipuram', location: [17.3655,78.5902] },
      { id: 'S22', name: 'Pedda Amberpet', location: [17.3832,78.6045] },
      { id: 'S23', name: 'Ghatkesar Road', location: [17.4010,78.6250] },
      { id: 'S24', name: 'Anurag University', location: [ANURAG_LAT,ANURAG_LNG] },
    ],
  },
  {
    id: 'R105', name: 'Tarnaka - Habsiguda - Anurag University', type: 'Regular', color: '#ec4899',
    path: [[17.4287,78.5386],[17.4165,78.5438],[17.4055,78.5510],[17.4142,78.5820],[17.4270,78.6160],[ANURAG_LAT,ANURAG_LNG]],
    stops: [
      { id: 'S25', name: 'Tarnaka', location: [17.4287,78.5386] },
      { id: 'S26', name: 'Habsiguda', location: [17.4165,78.5438] },
      { id: 'S27', name: 'Nacharam X Roads', location: [17.4055,78.5510] },
      { id: 'S28', name: 'Mallapur', location: [17.4142,78.5820] },
      { id: 'S29', name: 'Chengicherla', location: [17.4270,78.6160] },
      { id: 'S30', name: 'Anurag University', location: [ANURAG_LAT,ANURAG_LNG] },
    ],
  },
  {
    id: 'R106', name: 'Keesara - Nagaram - Anurag University', type: 'Regular', color: '#14b8a6',
    path: [[17.5030,78.6610],[17.4930,78.6420],[17.4850,78.6200],[17.4709,78.5794],[17.4510,78.6200],[ANURAG_LAT,ANURAG_LNG]],
    stops: [
      { id: 'S31', name: 'Keesara', location: [17.5030,78.6610] },
      { id: 'S32', name: 'Keesara X Roads', location: [17.4930,78.6420] },
      { id: 'S33', name: 'Nagaram', location: [17.4850,78.6200] },
      { id: 'S34', name: 'Nagaram X Roads', location: [17.4709,78.5794] },
      { id: 'S35', name: 'Ghatkesar Approach', location: [17.4510,78.6200] },
      { id: 'S36', name: 'Anurag University', location: [ANURAG_LAT,ANURAG_LNG] },
    ],
  },
 ];


export const MOCK_BUSES: Bus[] = [
  {
    id: 'B001',
    routeId: 'R101',
    plate: 'TS-08-1024',
    driverName: 'Ravi Kumar',
    capacity: 60,
    passengers: 42,

    // Current location: Radhika Bus Stop
    location: [RADHIKA_LAT, RADHIKA_LNG],

    speed: 0,
    heading: 90,
    nextStopId: 'S2',
    status: 'on_time',
    delayInSeconds: 0,
  },

  {
    id: 'B002',
    routeId: 'R101',
    plate: 'TS-08-1025',
    driverName: 'Suresh Reddy',
    capacity: 60,
    passengers: 48,

    // Current location: Saket
    location: [SAKET_LAT, SAKET_LNG],

    speed: 25,
    heading: 110,
    nextStopId: 'S3',
    status: 'on_time',
    delayInSeconds: 0,
  },

  {
    id: 'B003',
    routeId: 'R101',
    plate: 'TS-08-9900',
    driverName: 'Prakash Rao',
    capacity: 50,
    passengers: 35,

    // Current location: Dammaiguda X Roads
    location: [DAMMAIGUDA_LAT, DAMMAIGUDA_LNG],

    speed: 30,
    heading: 120,
    nextStopId: 'S4',
    status: 'on_time',
    delayInSeconds: 0,
  },

  {
    id: 'B004',
    routeId: 'R101',
    plate: 'TS-08-5544',
    driverName: 'Mahesh Kumar',
    capacity: 80,
    passengers: 65,

    // Current location: PS Rao Nagar
    location: [PS_RAO_LAT, PS_RAO_LNG],

    speed: 28,
    heading: 125,
    nextStopId: 'S5',
    status: 'delayed',
    delayInSeconds: 120,
  },

  {
    id: 'B005',
    routeId: 'R101',
    plate: 'TS-08-7788',
    driverName: 'Venkatesh',
    capacity: 60,
    passengers: 40,

    // Current location: Dubai Building
    location: [DUBAI_BUILDING_LAT, DUBAI_BUILDING_LNG],

    speed: 35,
    heading: 140,
    nextStopId: 'S6',
    status: 'on_time',
    delayInSeconds: 0,
  },
  {
    id: 'B006', routeId: 'R102', plate: 'TS-08-6606', driverName: 'Driver To Be Assigned', capacity: 55, passengers: 0,
    location: [17.4709,78.5794], speed: 0, heading: 90, nextStopId: 'S08', status: 'stopped', delayInSeconds: 0,
  },
  {
    id: 'B007', routeId: 'R103', plate: 'TS-08-7707', driverName: 'Driver To Be Assigned', capacity: 55, passengers: 0,
    location: [17.4018,78.5590], speed: 0, heading: 90, nextStopId: 'S14', status: 'stopped', delayInSeconds: 0,
  },
  { id: 'B008', routeId: 'R101', plate: 'TS-08-8808', driverName: 'Driver To Be Assigned', capacity: 60, passengers: 0, location: [RADHIKA_LAT, RADHIKA_LNG], speed: 0, heading: 90, nextStopId: 'S2', status: 'stopped', delayInSeconds: 0 },
  { id: 'B009', routeId: 'R101', plate: 'TS-08-8809', driverName: 'Driver To Be Assigned', capacity: 60, passengers: 0, location: [SAKET_LAT, SAKET_LNG], speed: 0, heading: 90, nextStopId: 'S3', status: 'stopped', delayInSeconds: 0 },
  { id: 'B010', routeId: 'R104', plate: 'TS-08-8810', driverName: 'Driver To Be Assigned', capacity: 55, passengers: 0, location: [17.3465,78.5521], speed: 0, heading: 90, nextStopId: 'S20', status: 'stopped', delayInSeconds: 0 },
  { id: 'B011', routeId: 'R105', plate: 'TS-08-8811', driverName: 'Driver To Be Assigned', capacity: 55, passengers: 0, location: [17.4287,78.5386], speed: 0, heading: 90, nextStopId: 'S26', status: 'stopped', delayInSeconds: 0 },
  { id: 'B012', routeId: 'R106', plate: 'TS-08-8812', driverName: 'Driver To Be Assigned', capacity: 55, passengers: 0, location: [17.5030,78.6610], speed: 0, heading: 90, nextStopId: 'S32', status: 'stopped', delayInSeconds: 0 },
];