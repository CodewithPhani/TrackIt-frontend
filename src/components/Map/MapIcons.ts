import L from 'leaflet';
const getBusMarkerSVG = (color: string, heading: number, delay: number) => {
  const isDelayed = delay > 0;
  const statusColor = isDelayed ? '#ef4444' : '#10b981';

  return `
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#drop-shadow)">
      <circle cx="24" cy="24" r="16" fill="${color}" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
      <g transform="rotate(${heading}, 24, 24)">
         <path d="M24 10 L30 20 L18 20 Z" fill="white" />
      </g>
      <circle cx="24" cy="24" r="6" fill="#1e293b"/>
      <circle cx="34" cy="14" r="5" fill="${statusColor}" stroke="white" stroke-width="1.5"/>
    </g>
    <defs>
      <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.5"/>
      </filter>
    </defs>
  </svg>
  `;
};

export const createBusIcon = (color: string, heading: number, delay: number, plate: string) => {
  const svg = getBusMarkerSVG(color, heading, delay);
  return L.divIcon({
    className: 'custom-bus-marker transition-all duration-300',
    html: `<div class="relative max-w-none hover:scale-110 transition-transform cursor-pointer">
             ${svg}
             <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-surface/90 text-[10px] text-white px-2 py-0.5 rounded border border-white/10 glass-panel">
               ${plate}
             </div>
           </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -20]
  });
};

export const createStopIcon = () => {
    return L.divIcon({
        className: 'custom-stop-marker',
        html: `<div class="w-4 h-4 bg-white rounded-full border-4 border-surface shadow-md cursor-pointer hover:border-primary transition-colors"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -10]
    });
};
