import React from 'react';
import { isLightHex } from '../data/glcColors';

export type RoomSceneType = 'living' | 'bedroom' | 'wall';
export type WallLightingMode = 'daylight' | 'warm';
export type WallFinishType = 'matt' | 'silk' | 'semigloss';

export interface WallPreviewShade {
  code: string;
  hex: string;
  nameAr?: string;
  brandLabel?: string;
}

interface GlcWallPreviewProps {
  primaryShade: WallPreviewShade;
  compareShade: WallPreviewShade | null;
  scene: RoomSceneType;
  lighting: WallLightingMode;
  finish: WallFinishType;
}

export const GlcWallPreview: React.FC<GlcWallPreviewProps> = ({
  primaryShade,
  compareShade,
  scene,
  lighting,
  finish,
}) => {
  const uid = React.useId().replace(/:/g, '');
  const isSplit = Boolean(compareShade);
  const primaryLightText = !isLightHex(primaryShade.hex);
  const compareLightText = compareShade ? !isLightHex(compareShade.hex) : false;

  const sheenOpacity = finish === 'semigloss' ? 0.24 : finish === 'silk' ? 0.13 : 0.03;

  return (
    <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 select-none">
      <svg
        viewBox="0 0 960 540"
        className="w-full h-full block"
        role="img"
        aria-label={`معاينة لون ${primaryShade.brandLabel || ''} ${primaryShade.code} على الحائط`}
      >
        <defs>
          {/* Side Wall Shadow Multiplier */}
          <linearGradient id={`${uid}-side-shade`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.08" />
          </linearGradient>

          {/* Natural Side Daylight Shaft */}
          <linearGradient id={`${uid}-daylight`} x1="0%" y1="0%" x2="100%" y2="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={lighting === 'daylight' ? '0.28' : '0.07'} />
            <stop offset="48%" stopColor="#ffffff" stopOpacity={lighting === 'daylight' ? '0.08' : '0.0'} />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.16" />
          </linearGradient>

          {/* Ceiling Occlusion Shadow */}
          <linearGradient id={`${uid}-ceiling-shadow`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.18" />
            <stop offset="14%" stopColor="#0f172a" stopOpacity="0.03" />
            <stop offset="85%" stopColor="#0f172a" stopOpacity="0" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.1" />
          </linearGradient>

          {/* Warm Architectural Lighting Overlay */}
          <radialGradient id={`${uid}-warm-lamp`} cx="72%" cy="32%" r="58%">
            <stop offset="0%" stopColor="#ffdfa3" stopOpacity={lighting === 'warm' ? '0.42' : '0'} />
            <stop offset="45%" stopColor="#f59e0b" stopOpacity={lighting === 'warm' ? '0.16' : '0'} />
            <stop offset="100%" stopColor="#1e1b4b" stopOpacity={lighting === 'warm' ? '0.18' : '0'} />
          </radialGradient>

          {/* Recessed Spotlight Cones */}
          <radialGradient id={`${uid}-spot1`} cx="30%" cy="6%" r="48%">
            <stop offset="0%" stopColor="#fff8e7" stopOpacity={lighting === 'warm' ? '0.35' : '0.18'} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-spot2`} cx="68%" cy="6%" r="48%">
            <stop offset="0%" stopColor="#fff8e7" stopOpacity={lighting === 'warm' ? '0.35' : '0.18'} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Finish Sheen (Silk / Semi-Gloss specular sweep) */}
          <linearGradient id={`${uid}-sheen`} x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="38%" stopColor="#ffffff" stopOpacity={sheenOpacity} />
            <stop offset="52%" stopColor="#ffffff" stopOpacity={sheenOpacity * 0.4} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Oak Floor Gradient */}
          <linearGradient id={`${uid}-floor`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C9B396" />
            <stop offset="35%" stopColor="#D6C2A7" />
            <stop offset="100%" stopColor="#B89E7E" />
          </linearGradient>

          {/* Clip Paths for Split Wall Comparison */}
          <clipPath id={`${uid}-clip-left`}>
            <rect x="0" y="0" width="480" height="540" />
          </clipPath>
          <clipPath id={`${uid}-clip-right`}>
            <rect x="480" y="0" width="480" height="540" />
          </clipPath>

          {/* Soft Furniture Drop Shadows */}
          <filter id={`${uid}-soft-shadow`} x="-15%" y="-15%" width="130%" height="140%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        {/* ===================== PAINTED WALL BASE LAYER ===================== */}
        {isSplit && compareShade ? (
          <>
            <rect
              x="0"
              y="0"
              width="480"
              height="432"
              fill={primaryShade.hex}
              style={{ transition: 'fill 180ms ease-out' }}
            />
            <rect
              x="480"
              y="0"
              width="480"
              height="432"
              fill={compareShade.hex}
              style={{ transition: 'fill 180ms ease-out' }}
            />
          </>
        ) : (
          <rect
            x="0"
            y="0"
            width="960"
            height="432"
            fill={primaryShade.hex}
            style={{ transition: 'fill 180ms ease-out' }}
          />
        )}

        {/* Angled Architectural Left Return Wall (in Living & Bedroom scenes) */}
        {scene !== 'wall' && (
          <polygon points="0,0 92,26 92,418 0,446" fill={`url(#${uid}-side-shade)`} />
        )}

        {/* Ceiling Return */}
        {scene !== 'wall' && (
          <>
            <polygon points="0,0 960,0 960,24 92,26" fill="#F4F3EF" />
            <line x1="92" y1="26" x2="960" y2="24" stroke="#0f172a" strokeOpacity="0.1" strokeWidth="1.5" />
          </>
        )}

        {/* Subtle Wall Decorative Wainscoting Paneling for Bedroom Scene */}
        {scene === 'bedroom' && (
          <g stroke="#0f172a" strokeOpacity="0.14" strokeWidth="1.5" fill="none">
            <rect x="135" y="72" width="170" height="230" rx="2" />
            <rect x="142" y="79" width="156" height="216" rx="1" stroke="#ffffff" strokeOpacity="0.32" />
            <rect x="335" y="72" width="290" height="230" rx="2" />
            <rect x="342" y="79" width="276" height="216" rx="1" stroke="#ffffff" strokeOpacity="0.32" />
            <rect x="655" y="72" width="170" height="230" rx="2" />
            <rect x="662" y="79" width="156" height="216" rx="1" stroke="#ffffff" strokeOpacity="0.32" />
          </g>
        )}

        {/* Realism Light / Shadow / Sheen Overlays on Wall Only */}
        <rect x="0" y="0" width="960" height="432" fill={`url(#${uid}-ceiling-shadow)`} pointerEvents="none" />
        <rect x="0" y="0" width="960" height="432" fill={`url(#${uid}-daylight)`} pointerEvents="none" />
        <rect x="0" y="0" width="960" height="432" fill={`url(#${uid}-spot1)`} pointerEvents="none" />
        <rect x="0" y="0" width="960" height="432" fill={`url(#${uid}-spot2)`} pointerEvents="none" />
        <rect x="0" y="0" width="960" height="432" fill={`url(#${uid}-sheen)`} pointerEvents="none" />
        {lighting === 'warm' && (
          <rect x="0" y="0" width="960" height="432" fill={`url(#${uid}-warm-lamp)`} pointerEvents="none" />
        )}

        {/* Crisp White Skirting / Baseboard (الوزرة) */}
        <polygon
          points={scene === 'wall' ? '0,404 960,404 960,432 0,432' : '92,396 960,396 960,420 92,420'}
          fill="#F5F4F1"
        />
        {scene !== 'wall' && <polygon points="0,418 92,396 92,420 0,446" fill="#E6E4DF" />}
        <line
          x1={scene === 'wall' ? '0' : '92'}
          y1={scene === 'wall' ? '404' : '396'}
          x2="960"
          y2={scene === 'wall' ? '404' : '396'}
          stroke="#ffffff"
          strokeWidth="1.5"
        />

        {/* Floor */}
        <polygon
          points={scene === 'wall' ? '0,432 960,432 960,540 0,540' : '0,446 92,420 960,420 960,540 0,540'}
          fill={`url(#${uid}-floor)`}
        />
        <g stroke="#8C7152" strokeOpacity="0.22" strokeWidth="1">
          <line x1="0" y1="458" x2="960" y2="458" />
          <line x1="0" y1="484" x2="960" y2="484" />
          <line x1="0" y1="512" x2="960" y2="512" />
          <line x1="210" y1="420" x2="150" y2="540" />
          <line x1="480" y1="420" x2="465" y2="540" />
          <line x1="750" y1="420" x2="795" y2="540" />
        </g>

        {/* ===================== SCENE 1: MODERN LIVING ROOM ===================== */}
        {scene === 'living' && (
          <g>
            {/* Framed Architectural Art Canvas on Wall (with real cast shadow) */}
            <rect x="336" y="100" width="128" height="164" rx="2" fill="#0f172a" fillOpacity="0.16" filter={`url(#${uid}-soft-shadow)`} />
            <rect x="502" y="100" width="128" height="164" rx="2" fill="#0f172a" fillOpacity="0.16" filter={`url(#${uid}-soft-shadow)`} />

            {/* Left Art Frame */}
            <rect x="332" y="94" width="128" height="164" rx="2" fill="#2A241E" />
            <rect x="339" y="101" width="114" height="150" fill="#F8F6F1" />
            <rect x="353" y="115" width="86" height="122" fill="#EAE4DA" />
            <circle cx="396" cy="166" r="24" fill="#B58B68" fillOpacity="0.85" />
            <path d="M353,237 Q396,178 439,237 Z" fill="#2F3B36" fillOpacity="0.85" />

            {/* Right Art Frame */}
            <rect x="498" y="94" width="128" height="164" rx="2" fill="#2A241E" />
            <rect x="505" y="101" width="114" height="150" fill="#F8F6F1" />
            <rect x="519" y="115" width="86" height="122" fill="#EAE4DA" />
            <path d="M519,170 C548,132 576,204 605,152 L605,237 L519,237 Z" fill="#8C6D53" fillOpacity="0.72" />

            {/* Modern Floor / Side Table Lamp (Right) */}
            <ellipse cx="758" cy="458" rx="46" ry="8" fill="#0f172a" fillOpacity="0.22" filter={`url(#${uid}-soft-shadow)`} />
            {/* Side Table */}
            <rect x="718" y="346" width="80" height="9" rx="3" fill="#6F5138" />
            <rect x="752" y="355" width="12" height="95" fill="#4E3826" />
            <ellipse cx="758" cy="452" rx="24" ry="5" fill="#4E3826" />
            {/* Ceramic Lamp */}
            <ellipse cx="758" cy="332" rx="15" ry="18" fill="#DED7CB" />
            <rect x="754" y="305" width="8" height="12" fill="#B89B6A" />
            <polygon points="733,306 783,306 774,264 742,264" fill={lighting === 'warm' ? '#FFF2D6' : '#F4F1EA'} stroke="#CFC7BA" strokeWidth="1" />
            {lighting === 'warm' && (
              <ellipse cx="758" cy="288" rx="44" ry="34" fill="#FDE68A" fillOpacity="0.32" filter={`url(#${uid}-soft-shadow)`} />
            )}

            {/* Sofa Floor Shadow */}
            <ellipse cx="475" cy="452" rx="225" ry="14" fill="#0f172a" fillOpacity="0.26" filter={`url(#${uid}-soft-shadow)`} />

            {/* Oak Tapered Sofa Legs */}
            <polygon points="274,412 286,412 281,448 272,448" fill="#7D5C40" />
            <polygon points="664,412 676,412 680,448 671,448" fill="#7D5C40" />

            {/* Modern Linen/Boucle Sofa */}
            <rect x="260" y="294" width="430" height="82" rx="16" fill="#E3DDD3" stroke="#CFC7BA" strokeWidth="1" />
            {/* Seat Cushions */}
            <rect x="288" y="356" width="186" height="44" rx="8" fill="#EBE6DD" stroke="#D5CEC2" strokeWidth="1" />
            <rect x="476" y="356" width="186" height="44" rx="8" fill="#EBE6DD" stroke="#D5CEC2" strokeWidth="1" />
            {/* Sofa Base Rail */}
            <rect x="262" y="394" width="426" height="22" rx="6" fill="#D5CEC2" />
            {/* Armrests */}
            <rect x="252" y="328" width="38" height="86" rx="12" fill="#DED8CD" stroke="#C8C0B3" strokeWidth="1" />
            <rect x="660" y="328" width="38" height="86" rx="12" fill="#DED8CD" stroke="#C8C0B3" strokeWidth="1" />
            {/* Accent Cushions */}
            <rect x="298" y="312" width="54" height="48" rx="8" fill="#C9BEB0" transform="rotate(-7 325 336)" />
            <rect x="598" y="312" width="54" height="48" rx="8" fill="#B5A898" transform="rotate(6 625 336)" />

            {/* Minimalist Foreground Coffee Table */}
            <ellipse cx="475" cy="490" rx="124" ry="9" fill="#0f172a" fillOpacity="0.22" filter={`url(#${uid}-soft-shadow)`} />
            <rect x="372" y="454" width="8" height="34" fill="#3B2B1E" />
            <rect x="570" y="454" width="8" height="34" fill="#3B2B1E" />
            <rect x="348" y="443" width="254" height="12" rx="5" fill="#7D5D42" />
            <rect x="435" y="432" width="46" height="11" rx="2" fill="#F8FAFC" />
            <rect x="441" y="424" width="34" height="8" rx="2" fill="#334155" />

            {/* Potted Fiddle-Leaf Fig Plant (Left) */}
            <ellipse cx="176" cy="458" rx="34" ry="8" fill="#0f172a" fillOpacity="0.24" filter={`url(#${uid}-soft-shadow)`} />
            <polygon points="154,394 198,394 190,452 162,452" fill="#D7CFC4" stroke="#BDB3A5" strokeWidth="1" />
            <path d="M176,394 C175,355 174,315 176,264" stroke="#5A4634" strokeWidth="4" fill="none" />
            <ellipse cx="152" cy="336" rx="24" ry="13" fill="#4A6B49" transform="rotate(-28 152 336)" />
            <ellipse cx="198" cy="316" rx="26" ry="14" fill="#3E5C3D" transform="rotate(24 198 316)" />
            <ellipse cx="158" cy="288" rx="22" ry="12" fill="#587C56" transform="rotate(-20 158 288)" />
            <ellipse cx="186" cy="264" rx="20" ry="12" fill="#638A61" transform="rotate(14 186 264)" />
          </g>
        )}

        {/* ===================== SCENE 2: MASTER BEDROOM ===================== */}
        {scene === 'bedroom' && (
          <g>
            {/* Hanging Warm Pendant Lamps */}
            <line x1="220" y1="24" x2="220" y2="212" stroke="#1e293b" strokeWidth="2" />
            <path d="M198,236 Q220,204 242,236 Z" fill={lighting === 'warm' ? '#FDE68A' : '#E7E5E4'} stroke="#475569" strokeWidth="1" />
            <line x1="740" y1="24" x2="740" y2="212" stroke="#1e293b" strokeWidth="2" />
            <path d="M718,236 Q740,204 762,236 Z" fill={lighting === 'warm' ? '#FDE68A' : '#E7E5E4'} stroke="#475569" strokeWidth="1" />

            {/* Soft Bedside Nightstands */}
            <rect x="174" y="346" width="94" height="74" rx="4" fill="#8C6B4E" />
            <line x1="174" y1="382" x2="268" y2="382" stroke="#6E5138" strokeWidth="1.5" />
            <rect x="184" y="420" width="8" height="24" fill="#5A412B" />
            <rect x="250" y="420" width="8" height="24" fill="#5A412B" />

            <rect x="692" y="346" width="94" height="74" rx="4" fill="#8C6B4E" />
            <line x1="692" y1="382" x2="786" y2="382" stroke="#6E5138" strokeWidth="1.5" />
            <rect x="702" y="420" width="8" height="24" fill="#5A412B" />
            <rect x="768" y="420" width="8" height="24" fill="#5A412B" />

            {/* Bed Floor Shadow */}
            <ellipse cx="480" cy="462" rx="220" ry="18" fill="#0f172a" fillOpacity="0.25" filter={`url(#${uid}-soft-shadow)`} />

            {/* Upholstered Headboard */}
            <rect x="294" y="242" width="372" height="128" rx="14" fill="#DFD9CF" stroke="#C5BEB2" strokeWidth="1.5" />
            <line x1="387" y1="244" x2="387" y2="368" stroke="#CDC6BA" strokeWidth="1" />
            <line x1="480" y1="244" x2="480" y2="368" stroke="#CDC6BA" strokeWidth="1" />
            <line x1="573" y1="244" x2="573" y2="368" stroke="#CDC6BA" strokeWidth="1" />

            {/* Crisp White Pillows */}
            <rect x="322" y="308" width="144" height="58" rx="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
            <rect x="494" y="308" width="144" height="58" rx="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />

            {/* Linen Duvet & Bed Base */}
            <rect x="290" y="358" width="380" height="96" rx="10" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
            <rect x="290" y="396" width="380" height="58" rx="6" fill="#E6E1D8" />
          </g>
        )}

        {/* ===================== SPLIT COMPARE DIVIDER ===================== */}
        {isSplit && compareShade && (
          <g>
            <line
              x1="480"
              y1="0"
              x2="480"
              y2="420"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeDasharray="6 4"
            />
            <line
              x1="480"
              y1="0"
              x2="480"
              y2="420"
              stroke="#0F172A"
              strokeOpacity="0.25"
              strokeWidth="1"
            />
          </g>
        )}
      </svg>

      {/* Clean Architectural Swatch Identification Overlays (Zero-Pill / Uncluttered) */}
      <div className="pointer-events-none absolute top-3 right-3 flex items-center gap-2">
        <div
          className={`px-3 py-1.5 rounded-lg border backdrop-blur-xs shadow-xs ${
            primaryLightText
              ? 'bg-slate-950/65 border-white/20 text-white'
              : 'bg-white/85 border-slate-900/10 text-slate-900'
          }`}
        >
          <div className="text-[10px] opacity-75">
            {isSplit ? 'اللون الأساسي (يمين)' : 'اللون المعروض على الحائط'}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono-nums text-xs sm:text-sm font-extrabold tracking-wide">
              {primaryShade.brandLabel ? `${primaryShade.brandLabel} ` : ''}
              {primaryShade.code}
            </span>
            {primaryShade.nameAr && (
              <span className="text-[11px] font-bold opacity-90 truncate max-w-[140px]">
                {primaryShade.nameAr}
              </span>
            )}
          </div>
        </div>
      </div>

      {isSplit && compareShade && (
        <div className="pointer-events-none absolute top-3 left-3 flex items-center gap-2">
          <div
            className={`px-3 py-1.5 rounded-lg border backdrop-blur-xs shadow-xs ${
              compareLightText
                ? 'bg-slate-950/65 border-white/20 text-white'
                : 'bg-white/85 border-slate-900/10 text-slate-900'
            }`}
          >
            <div className="text-[10px] opacity-75">لون المقارنة (يسار)</div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono-nums text-xs sm:text-sm font-extrabold tracking-wide">
                {compareShade.brandLabel ? `${compareShade.brandLabel} ` : ''}
                {compareShade.code}
              </span>
              {compareShade.nameAr && (
                <span className="text-[11px] font-bold opacity-90 truncate max-w-[140px]">
                  {compareShade.nameAr}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
