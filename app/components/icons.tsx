import Svg, { Path } from 'react-native-svg';

const P: Record<string, string> = {
  bulletin: 'M4 4h7a2 2 0 0 1 2 2v14a1.5 1.5 0 0 0-1.5-1.5H4zM20 4h-7a2 2 0 0 0-2 2v14a1.5 1.5 0 0 1 1.5-1.5H20z',
  notes: 'M4 20l4.5-1 10-10-3.5-3.5-10 10zM14 6.5l3.5 3.5 2-2a1.5 1.5 0 0 0 0-2.1L18.1 4.5a1.5 1.5 0 0 0-2.1 0z',
  wall: 'M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4v-4H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z',
  church: 'M12 2v3M10 4h4M5 21v-9l7-5 7 5v9h-5v-5h-4v5z',
  bible: 'M6 3h11a1 1 0 0 1 1 1v16H7a2 2 0 0 1-2-2V4a1 1 0 0 1 1-1zM5 18a2 2 0 0 1 2-2h11M11 7h4M13 5v6',
  bookmark: 'M6 3h12v18l-6-4-6 4z',
  search: 'M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM15.5 15.5L20 20',
};

export function Icon({ name, color, size = 22 }: { name: keyof typeof P; color: import('react-native').ColorValue; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinejoin="round" strokeLinecap="round">
      <Path d={P[name]} />
    </Svg>
  );
}
