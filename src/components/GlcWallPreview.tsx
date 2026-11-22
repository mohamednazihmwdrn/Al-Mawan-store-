import React from 'react';
import { isLightHex } from '../data/glcColors';
import { GraffiatoTextureGrade } from '../data/sipesColors';

export type RoomSceneType = 'exterior' | 'living' | 'bedroom' | 'wall';
export type WallLightingMode = 'daylight' | 'warm';
export type WallFinishType = 'matt' | 'silk' | 'semigloss';
export type WallTextureType = 'smooth' | GraffiatoTextureGrade;

export interface WallPreviewShade {
  code: string;
  hex: string;
  nameAr?: string;
  brandLabel?: string;
  texture?: WallTextureType;
}

interface GlcWallPreviewProps {
  primaryShade: WallPreviewShade;
  compareShade: WallPreviewShade | null;
  scene: RoomSceneType;
  lighting: WallLightingMode;
  finish: WallFinishType;
  texture?: WallTextureType;
}

export const TEXTURE_GRADE_LABELS_AR: Record<GraffiatoTextureGrade, string> = {
  fine: 'ناعم (FMC)',
  medium: 'متوسط الخشونة (MC)',
  coarse: 'خشن بأخاديد طولية',
};

export const GlcWallPreview: React.FC<GlcWallPreviewProps> = ({
  primaryShade,
  compareShade,
  scene,
  lighting,
  finish,
  texture = 'smooth',
}) => {
  const uid = React.useId().replace(/:/g, '');
  const isSplit = Boolean(compareShade);
  const primaryLightText = !isLightHex(primaryShade.hex);
  const compareLightText = compareShade ? !isLightHex(compareShade.hex) : false;

  const activeTexture: WallTextureType = texture;
  const compareTexture: WallTextureType =
    compareShade?.texture && compareShade.texture !== 'smooth'
      ? compareShade.texture
      : activeTexture;

  const texturePatternUrl = (t: WallTextureType) => {
    if (t === 'fine') return `url(#${uid}-tex-fine)`;
    if (t === 'medium') return `url(#${uid}-tex-medium)`;
    if (t === 'coarse') return `url(#${uid}-tex-coarse)`;
    return undefined;
  };

  const primaryTexUrl = texturePatternUrl(activeTexture);
  const compareTexUrl = texturePatternUrl(compareTexture);

  const sheenOpacity = finish === 'semigloss' ? 0.24 : finish === 'silk' ? 0.13 : 0.03;

  const textureBadgeLabel =
    activeTexture !== 'smooth' ? TEXTURE_GRADE_LABELS_AR[activeTexture] : null;

  return (
    <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 select-none">
      <svg
        viewBox="0 0 960 540"
        className="w-full h-full block"
        role="img"
        aria-label={`معاينة لون ${primaryShade.brandLabel || ''} ${primaryShade.code} على ${
          scene === 'exterior' ? 'الواجهة الخارجية' : 'الحائط'
        }`}
      >
        <defs>
          {/* ===================== GRAFFIATO SURFACE TEXTURE PATTERNS ===================== */}
          {/* 1. Fine Texture (FMC - حبة دقيقة ناعمة) */}
          <pattern id={`${uid}-tex-fine`} width="36" height="36" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="5" r="0.85" fill="#0f172a" fillOpacity="0.16" />
            <circle cx="11" cy="3" r="0.7" fill="#ffffff" fillOpacity="0.32" />
            <circle cx="19" cy="8" r="0.9" fill="#0f172a" fillOpacity="0.14" />
            <circle cx="28" cy="4" r="0.8" fill="#ffffff" fillOpacity="0.28" />
            <circle cx="7" cy="14" r="0.75" fill="#ffffff" fillOpacity="0.28" />
            <circle cx="15" cy="16" r="0.95" fill="#0f172a" fillOpacity="0.17" />
            <circle cx="24" cy="13" r="0.7" fill="#0f172a" fillOpacity="0.13" />
            <circle cx="33" cy="17" r="0.85" fill="#ffffff" fillOpacity="0.25" />
            <circle cx="4" cy="24" r="0.9" fill="#0f172a" fillOpacity="0.15" />
            <circle cx="13" cy="26" r="0.75" fill="#ffffff" fillOpacity="0.3" />
            <circle cx="21" cy="23" r="0.85" fill="#0f172a" fillOpacity="0.16" />
            <circle cx="30" cy="27" r="0.8" fill="#0f172a" fillOpacity="0.13" />
            <circle cx="9" cy="33" r="0.85" fill="#0f172a" fillOpacity="0.15" />
            <circle cx="18" cy="31" r="0.7" fill="#ffffff" fillOpacity="0.26" />
            <circle cx="26" cy="34" r="0.9" fill="#ffffff" fillOpacity="0.28" />
            <circle cx="34" cy="32" r="0.75" fill="#0f172a" fillOpacity="0.14" />
          </pattern>

          {/* 2. Medium Texture (MC - حبيبات متوسطة الخشونة) */}
          <pattern id={`${uid}-tex-medium`} width="44" height="44" patternUnits="userSpaceOnUse">
            <circle cx="5" cy="6" r="1.4" fill="#0f172a" fillOpacity="0.24" />
            <circle cx="6.2" cy="5.2" r="1.1" fill="#ffffff" fillOpacity="0.28" />
            <circle cx="17" cy="9" r="1.7" fill="#0f172a" fillOpacity="0.22" />
            <circle cx="18.3" cy="8.2" r="1.1" fill="#ffffff" fillOpacity="0.26" />
            <circle cx="31" cy="5" r="1.3" fill="#0f172a" fillOpacity="0.25" />
            <circle cx="40" cy="12" r="1.5" fill="#0f172a" fillOpacity="0.2" />
            <circle cx="10" cy="21" r="1.6" fill="#0f172a" fillOpacity="0.24" />
            <circle cx="11.4" cy="20" r="1.0" fill="#ffffff" fillOpacity="0.28" />
            <circle cx="24" cy="20" r="1.4" fill="#0f172a" fillOpacity="0.22" />
            <circle cx="35" cy="24" r="1.8" fill="#0f172a" fillOpacity="0.25" />
            <circle cx="36.5" cy="23" r="1.2" fill="#ffffff" fillOpacity="0.26" />
            <circle cx="5" cy="34" r="1.5" fill="#0f172a" fillOpacity="0.22" />
            <circle cx="18" cy="36" r="1.7" fill="#0f172a" fillOpacity="0.26" />
            <circle cx="19.3" cy="35" r="1.1" fill="#ffffff" fillOpacity="0.25" />
            <circle cx="29" cy="33" r="1.3" fill="#0f172a" fillOpacity="0.21" />
            <circle cx="41" cy="38" r="1.5" fill="#0f172a" fillOpacity="0.24" />
            <circle cx="14" cy="14" r="0.9" fill="#0f172a" fillOpacity="0.16" />
            <circle cx="28" cy="13" r="0.9" fill="#ffffff" fillOpacity="0.24" />
            <circle cx="2" cy="28" r="0.9" fill="#ffffff" fillOpacity="0.22" />
            <circle cx="23" cy="42" r="0.9" fill="#0f172a" fillOpacity="0.18" />
          </pattern>

          {/* 3. Coarse Grooved Graffiato (أخاديد طولية بارزة مثل الكتالوج) */}
          <pattern id={`${uid}-tex-coarse`} width="56" height="96" patternUnits="userSpaceOnUse">
            {/* Carved vertical trowel furrows (shadow + sun highlight edge) */}
            <path d="M7,4 L7,34 M7,44 L7,88" stroke="#0f172a" strokeOpacity="0.33" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M8.8,4 L8.8,34 M8.8,44 L8.8,88" stroke="#ffffff" strokeOpacity="0.34" strokeWidth="1.2" strokeLinecap="round" />

            <path d="M19,10 L19,58 M19,68 L19,93" stroke="#0f172a" strokeOpacity="0.29" strokeWidth="2.0" strokeLinecap="round" />
            <path d="M20.6,10 L20.6,58 M20.6,68 L20.6,93" stroke="#ffffff" strokeOpacity="0.30" strokeWidth="1.0" strokeLinecap="round" />

            <path d="M31,2 L31,26 M31,36 L31,74 M31,82 L31,95" stroke="#0f172a" strokeOpacity="0.34" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M33,2 L33,26 M33,36 L33,74 M33,82 L33,95" stroke="#ffffff" strokeOpacity="0.36" strokeWidth="1.2" strokeLinecap="round" />

            <path d="M44,14 L44,50 M44,60 L44,86" stroke="#0f172a" strokeOpacity="0.28" strokeWidth="2.1" strokeLinecap="round" />
            <path d="M45.7,14 L45.7,50 M45.7,60 L45.7,86" stroke="#ffffff" strokeOpacity="0.28" strokeWidth="1.0" strokeLinecap="round" />

            {/* Granite sand grains between furrows */}
            <circle cx="13" cy="18" r="1.2" fill="#0f172a" fillOpacity="0.2" />
            <circle cx="25" cy="30" r="1.4" fill="#0f172a" fillOpacity="0.22" />
            <circle cx="38" cy="12" r="1.1" fill="#ffffff" fillOpacity="0.28" />
            <circle cx="51" cy="28" r="1.3" fill="#0f172a" fillOpacity="0.21" />
            <circle cx="13" cy="52" r="1.3" fill="#ffffff" fillOpacity="0.26" />
            <circle cx="25" cy="66" r="1.2" fill="#0f172a" fillOpacity="0.22" />
            <circle cx="38" cy="48" r="1.4" fill="#0f172a" fillOpacity="0.2" />
            <circle cx="51" cy="70" r="1.2" fill="#ffffff" fillOpacity="0.24" />
            <circle cx="14" cy="80" r="1.4" fill="#0f172a" fillOpacity="0.21" />
            <circle cx="39" cy="84" r="1.2" fill="#0f172a" fillOpacity="0.2" />
          </pattern>

          {/* Side Wall Shadow Multiplier */}
          <linearGradient id={`${uid}-side-shade`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.08" />
          </linearGradient>

          {/* Exterior Sky Backdrop */}
          <linearGradient id={`${uid}-sky`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={lighting === 'daylight' ? '#5BA4DA' : '#1E293B'} />
            <stop offset="55%" stopColor={lighting === 'daylight' ? '#A7D2EE' : '#475569'} />
            <stop offset="100%" stopColor={lighting === 'daylight' ? '#E4F1FA' : '#9A6B4F'} />
          </linearGradient>

          {/* Exterior Facade Sunlit Raking Gradient */}
          <linearGradient id={`${uid}-ext-sun`} x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={lighting === 'daylight' ? '0.2' : '0.04'} />
            <stop offset="65%" stopColor="#0f172a" stopOpacity="0.0" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity={lighting === 'daylight' ? '0.14' : '0.28'} />
          </linearGradient>

          {/* Natural Side Daylight Shaft (Interior) */}
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

          {/* Exterior Sconce Up/Down Cones */}
          <radialGradient id={`${uid}-sconce-cone`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.72" />
            <stop offset="55%" stopColor="#F59E0B" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
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

          {/* Finish Sheen */}
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

          {/* Window Sky Glass */}
          <linearGradient id={`${uid}-glass`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={lighting === 'daylight' ? '#DCEBFA' : '#FDE68A'} />
            <stop offset="55%" stopColor={lighting === 'daylight' ? '#8DB4D4' : '#D97706'} />
            <stop offset="100%" stopColor={lighting === 'daylight' ? '#4F6E8B' : '#78350F'} />
          </linearGradient>

          {/* Wood Cladding Accent Slats */}
          <pattern id={`${uid}-wood-slats`} width="14" height="40" patternUnits="userSpaceOnUse">
            <rect width="14" height="40" fill="#4E3824" />
            <rect x="0" y="0" width="9" height="40" fill="#8C6743" />
            <rect x="7" y="0" width="2" height="40" fill="#6F5033" />
          </pattern>

          {/* Soft Shadows */}
          <filter id={`${uid}-soft-shadow`} x="-15%" y="-15%" width="130%" height="140%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        {/* ===================== SCENE A: EXTERIOR BUILDING FACADE (واجهة خارجية) ===================== */}
        {scene === 'exterior' ? (
          <g>
            {/* 1. Sky Background */}
            <rect x="0" y="0" width="960" height="450" fill={`url(#${uid}-sky)`} />
            {/* Crisp Soft Sun & Horizon Cloud */}
            <ellipse
              cx="175"
              cy="92"
              rx="110"
              ry="22"
              fill="#ffffff"
              fillOpacity={lighting === 'daylight' ? '0.45' : '0.08'}
            />
            <ellipse
              cx="790"
              cy="76"
              rx="145"
              ry="26"
              fill="#ffffff"
              fillOpacity={lighting === 'daylight' ? '0.35' : '0.06'}
            />

            {/* Distant Subtle Cypress / Palm Silhouette Behind Building */}
            <g fill={lighting === 'daylight' ? '#36543B' : '#1E2D24'} fillOpacity="0.9">
              <ellipse cx="98" cy="295" rx="44" ry="88" />
              <ellipse cx="64" cy="325" rx="34" ry="68" />
              <ellipse cx="878" cy="310" rx="42" ry="78" />
            </g>

            {/* 2. Rear / Recessed Architectural Tower (Left-Center) */}
            <rect
              x="160"
              y="72"
              width="290"
              height="360"
              fill={isSplit && compareShade ? compareShade.hex : primaryShade.hex}
              style={{ transition: 'fill 180ms ease-out' }}
            />
            {(isSplit ? compareTexUrl : primaryTexUrl) && (
              <rect
                x="160"
                y="72"
                width="290"
                height="360"
                fill={isSplit ? compareTexUrl : primaryTexUrl}
                pointerEvents="none"
              />
            )}
            {/* Ambient Depth Shade on Rear Wing */}
            <rect x="160" y="72" width="290" height="360" fill="#0f172a" fillOpacity="0.1" pointerEvents="none" />
            {/* Left Side Return of Rear Wing */}
            <polygon
              points="132,90 160,72 160,432 132,432"
              fill={isSplit && compareShade ? compareShade.hex : primaryShade.hex}
            />
            {(isSplit ? compareTexUrl : primaryTexUrl) && (
              <polygon points="132,90 160,72 160,432 132,432" fill={isSplit ? compareTexUrl : primaryTexUrl} />
            )}
            <polygon points="132,90 160,72 160,432 132,432" fill="#0f172a" fillOpacity="0.28" />

            {/* Dark Architectural Roof Coping (Rear Wing) */}
            <rect x="128" y="66" width="326" height="10" fill="#1E242B" />

            {/* Upper Balcony Window in Rear Wing */}
            <rect x="206" y="124" width="160" height="106" fill="#232931" />
            <rect x="214" y="132" width="68" height="90" fill={`url(#${uid}-glass)`} />
            <rect x="290" y="132" width="68" height="90" fill={`url(#${uid}-glass)`} />
            {/* Balcony Guard Rail */}
            <g stroke="#1E242B" strokeWidth="2.5">
              <line x1="206" y1="196" x2="366" y2="196" />
              <line x1="206" y1="208" x2="366" y2="208" />
              <line x1="206" y1="220" x2="366" y2="220" />
            </g>

            {/* 3. Main Dominant Front Facade Mass (Right & Center) */}
            {/* Cast Drop Shadow onto Rear Wing */}
            <rect x="422" y="54" width="20" height="378" fill="#0f172a" fillOpacity="0.26" />
            <rect
              x="438"
              y="48"
              width="392"
              height="384"
              fill={primaryShade.hex}
              style={{ transition: 'fill 180ms ease-out' }}
            />
            {primaryTexUrl && (
              <rect
                x="438"
                y="48"
                width="392"
                height="384"
                fill={primaryTexUrl}
                pointerEvents="none"
              />
            )}
            <rect
              x="438"
              y="48"
              width="392"
              height="384"
              fill={`url(#${uid}-ext-sun)`}
              pointerEvents="none"
            />
            {/* Right Angled Perspective Facade Return */}
            <polygon points="830,48 860,68 860,432 830,432" fill={primaryShade.hex} />
            {primaryTexUrl && <polygon points="830,48 860,68 860,432 830,432" fill={primaryTexUrl} />}
            <polygon points="830,48 860,68 860,432 830,432" fill="#0f172a" fillOpacity="0.24" />

            {/* Crisp Charcoal Roof Fascia Trim & Mid Floor Architectural Cantilever Band */}
            <rect x="434" y="42" width="400" height="12" fill="#1E242B" />
            <polygon points="834,42 864,62 864,72 834,54" fill="#13171C" />
            {/* Mid Cantilever Canopy Overhang */}
            <rect x="424" y="246" width="414" height="14" fill="#1E242B" />
            <rect x="438" y="260" width="392" height="14" fill="#0f172a" fillOpacity="0.24" />

            {/* Recessed Main Panorama Window Frame (2nd Floor) */}
            <rect x="492" y="102" width="224" height="114" fill="#1F252D" />
            <rect x="502" y="112" width="100" height="94" fill={`url(#${uid}-glass)`} />
            <rect x="610" y="112" width="96" height="94" fill={`url(#${uid}-glass)`} />
            <line x1="502" y1="158" x2="706" y2="158" stroke="#28303B" strokeWidth="2" />
            {/* Decorative Stone/Metal Sill Accent */}
            <rect x="486" y="216" width="236" height="8" fill="#334155" />

            {/* Ground Floor Vertical Timber Cladding Accent & Glass Entryway */}
            <rect x="580" y="286" width="224" height="146" fill={`url(#${uid}-wood-slats)`} />
            <rect x="478" y="286" width="94" height="146" fill="#1E242B" />
            <rect x="488" y="296" width="74" height="136" fill={`url(#${uid}-glass)`} />
            <rect x="550" y="352" width="4" height="28" rx="1" fill="#F8FAFC" />

            {/* Warm Exterior Facade Up/Down Wall Sconces */}
            {lighting === 'warm' && (
              <g pointerEvents="none">
                <ellipse cx="460" cy="158" rx="34" ry="70" fill={`url(#${uid}-sconce-cone)`} />
                <ellipse cx="766" cy="158" rx="34" ry="70" fill={`url(#${uid}-sconce-cone)`} />
                <ellipse cx="398" cy="296" rx="28" ry="56" fill={`url(#${uid}-sconce-cone)`} />
              </g>
            )}
            <rect x="455" y="150" width="10" height="18" rx="2" fill="#1E242B" />
            <rect x="761" y="150" width="10" height="18" rx="2" fill="#1E242B" />
            <rect x="393" y="288" width="10" height="16" rx="2" fill="#1E242B" />

            {/* 4. Exterior Courtyard Boundary Fence Wall (سور خارجي مطلي بنفس اللون أو لون المقارنة) */}
            <rect
              x="36"
              y="328"
              width="380"
              height="104"
              fill={isSplit && compareShade ? compareShade.hex : primaryShade.hex}
              style={{ transition: 'fill 180ms ease-out' }}
            />
            {(isSplit ? compareTexUrl : primaryTexUrl) && (
              <rect
                x="36"
                y="328"
                width="380"
                height="104"
                fill={isSplit ? compareTexUrl : primaryTexUrl}
                pointerEvents="none"
              />
            )}
            <rect x="36" y="328" width="380" height="104" fill={`url(#${uid}-ext-sun)`} pointerEvents="none" />
            {/* Fence Top Coping & Vertical Pillar */}
            <rect x="32" y="322" width="388" height="8" fill="#1E242B" />
            {/* Main Courtyard Wooden/Steel Entrance Gate */}
            <rect x="132" y="338" width="112" height="94" fill="#3B2B1E" />
            <line x1="188" y1="338" x2="188" y2="432" stroke="#1E242B" strokeWidth="3" />
            <rect x="144" y="352" width="32" height="24" fill="#543D2B" />
            <rect x="200" y="352" width="32" height="24" fill="#543D2B" />

            {/* Exterior Planter Boxes + Architectural Bushes */}
            <rect x="266" y="408" width="136" height="24" fill="#475569" stroke="#334155" strokeWidth="1" />
            <g fill="#42633D">
              <ellipse cx="290" cy="396" rx="18" ry="18" />
              <ellipse cx="324" cy="392" rx="22" ry="22" />
              <ellipse cx="362" cy="396" rx="19" ry="18" />
            </g>
            <g fill="#557D4E">
              <ellipse cx="308" cy="400" rx="14" ry="12" />
              <ellipse cx="344" cy="399" rx="15" ry="13" />
            </g>

            <rect x="650" y="408" width="150" height="24" fill="#475569" stroke="#334155" strokeWidth="1" />
            <g fill="#42633D">
              <ellipse cx="678" cy="396" rx="20" ry="18" />
              <ellipse cx="718" cy="391" rx="22" ry="22" />
              <ellipse cx="760" cy="396" rx="20" ry="18" />
            </g>

            {/* 5. Exterior Sidewalk & Street Foreground */}
            <rect x="0" y="432" width="960" height="44" fill="#CBD5E1" />
            <line x1="0" y1="432" x2="960" y2="432" stroke="#94A3B8" strokeWidth="2" />
            <g stroke="#94A3B8" strokeOpacity="0.55" strokeWidth="1">
              <line x1="120" y1="432" x2="80" y2="476" />
              <line x1="300" y1="432" x2="280" y2="476" />
              <line x1="480" y1="432" x2="480" y2="476" />
              <line x1="660" y1="432" x2="680" y2="476" />
              <line x1="840" y1="432" x2="880" y2="476" />
            </g>
            {/* Curb & Asphalt */}
            <rect x="0" y="476" width="960" height="10" fill="#94A3B8" />
            <rect x="0" y="486" width="960" height="54" fill="#1E293B" />
            <rect x="190" y="509" width="74" height="6" rx="2" fill="#E2E8F0" fillOpacity="0.65" />
            <rect x="443" y="509" width="74" height="6" rx="2" fill="#E2E8F0" fillOpacity="0.65" />
            <rect x="696" y="509" width="74" height="6" rx="2" fill="#E2E8F0" fillOpacity="0.65" />
          </g>
        ) : (
          /* ===================== SCENE B: INTERIOR ROOMS & CLOSE-UP WALL ===================== */
          <g>
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
                {primaryTexUrl && (
                  <rect x="0" y="0" width="480" height="432" fill={primaryTexUrl} pointerEvents="none" />
                )}
                <rect
                  x="480"
                  y="0"
                  width="480"
                  height="432"
                  fill={compareShade.hex}
                  style={{ transition: 'fill 180ms ease-out' }}
                />
                {compareTexUrl && (
                  <rect x="480" y="0" width="480" height="432" fill={compareTexUrl} pointerEvents="none" />
                )}
              </>
            ) : (
              <>
                <rect
                  x="0"
                  y="0"
                  width="960"
                  height="432"
                  fill={primaryShade.hex}
                  style={{ transition: 'fill 180ms ease-out' }}
                />
                {primaryTexUrl && (
                  <rect x="0" y="0" width="960" height="432" fill={primaryTexUrl} pointerEvents="none" />
                )}
              </>
            )}

            {/* Angled Architectural Left Return Wall (in Living & Bedroom scenes) */}
            {scene !== 'wall' && (
              <polygon points="0,0 92,26 92,418 0,446" fill={`url(#${uid}-side-shade)`} />
            )}

            {/* Ceiling Return (Interior) or Sky Strip + Coping (Exterior Texture Zoom) */}
            {scene !== 'wall' ? (
              <>
                <polygon points="0,0 960,0 960,24 92,26" fill="#F4F3EF" />
                <line x1="92" y1="26" x2="960" y2="24" stroke="#0f172a" strokeOpacity="0.1" strokeWidth="1.5" />
              </>
            ) : activeTexture !== 'smooth' ? (
              <>
                <rect x="0" y="0" width="960" height="28" fill={`url(#${uid}-sky)`} />
                <rect x="0" y="24" width="960" height="10" fill="#1E242B" />
                <rect x="0" y="34" width="960" height="8" fill="#0f172a" fillOpacity="0.22" />
              </>
            ) : null}

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
            {scene === 'wall' && activeTexture !== 'smooth' ? (
              <>
                <rect x="0" y="34" width="960" height="398" fill={`url(#${uid}-ext-sun)`} pointerEvents="none" />
                {lighting === 'warm' && (
                  <ellipse cx="480" cy="145" rx="220" ry="120" fill={`url(#${uid}-sconce-cone)`} pointerEvents="none" />
                )}
              </>
            ) : (
              <>
                <rect x="0" y="0" width="960" height="432" fill={`url(#${uid}-ceiling-shadow)`} pointerEvents="none" />
                <rect x="0" y="0" width="960" height="432" fill={`url(#${uid}-daylight)`} pointerEvents="none" />
                <rect x="0" y="0" width="960" height="432" fill={`url(#${uid}-spot1)`} pointerEvents="none" />
                <rect x="0" y="0" width="960" height="432" fill={`url(#${uid}-spot2)`} pointerEvents="none" />
                <rect x="0" y="0" width="960" height="432" fill={`url(#${uid}-sheen)`} pointerEvents="none" />
                {lighting === 'warm' && (
                  <rect x="0" y="0" width="960" height="432" fill={`url(#${uid}-warm-lamp)`} pointerEvents="none" />
                )}
              </>
            )}

            {/* Bottom Base: Exterior Stone Plinth & Sidewalk (Graffiato zoom) OR Interior Skirting & Oak Floor */}
            {scene === 'wall' && activeTexture !== 'smooth' ? (
              <g>
                <rect x="0" y="420" width="960" height="46" fill="#475569" />
                <rect x="0" y="420" width="960" height="5" fill="#1E242B" />
                <g stroke="#334155" strokeOpacity="0.55" strokeWidth="1.5">
                  <line x1="160" y1="425" x2="160" y2="466" />
                  <line x1="360" y1="425" x2="360" y2="466" />
                  <line x1="560" y1="425" x2="560" y2="466" />
                  <line x1="760" y1="425" x2="760" y2="466" />
                </g>
                <rect x="0" y="466" width="960" height="74" fill="#CBD5E1" />
                <line x1="0" y1="466" x2="960" y2="466" stroke="#94A3B8" strokeWidth="2" />
                <g stroke="#94A3B8" strokeOpacity="0.55" strokeWidth="1">
                  <line x1="180" y1="466" x2="140" y2="540" />
                  <line x1="480" y1="466" x2="480" y2="540" />
                  <line x1="780" y1="466" x2="820" y2="540" />
                </g>
              </g>
            ) : (
              <>
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
              </>
            )}

            {/* SCENE 1: MODERN LIVING ROOM */}
            {scene === 'living' && (
              <g>
                <rect x="336" y="100" width="128" height="164" rx="2" fill="#0f172a" fillOpacity="0.16" filter={`url(#${uid}-soft-shadow)`} />
                <rect x="502" y="100" width="128" height="164" rx="2" fill="#0f172a" fillOpacity="0.16" filter={`url(#${uid}-soft-shadow)`} />

                <rect x="332" y="94" width="128" height="164" rx="2" fill="#2A241E" />
                <rect x="339" y="101" width="114" height="150" fill="#F8F6F1" />
                <rect x="353" y="115" width="86" height="122" fill="#EAE4DA" />
                <circle cx="396" cy="166" r="24" fill="#B58B68" fillOpacity="0.85" />
                <path d="M353,237 Q396,178 439,237 Z" fill="#2F3B36" fillOpacity="0.85" />

                <rect x="498" y="94" width="128" height="164" rx="2" fill="#2A241E" />
                <rect x="505" y="101" width="114" height="150" fill="#F8F6F1" />
                <rect x="519" y="115" width="86" height="122" fill="#EAE4DA" />
                <path d="M519,170 C548,132 576,204 605,152 L605,237 L519,237 Z" fill="#8C6D53" fillOpacity="0.72" />

                <ellipse cx="758" cy="458" rx="46" ry="8" fill="#0f172a" fillOpacity="0.22" filter={`url(#${uid}-soft-shadow)`} />
                <rect x="718" y="346" width="80" height="9" rx="3" fill="#6F5138" />
                <rect x="752" y="355" width="12" height="95" fill="#4E3826" />
                <ellipse cx="758" cy="452" rx="24" ry="5" fill="#4E3826" />
                <ellipse cx="758" cy="332" rx="15" ry="18" fill="#DED7CB" />
                <rect x="754" y="305" width="8" height="12" fill="#B89B6A" />
                <polygon points="733,306 783,306 774,264 742,264" fill={lighting === 'warm' ? '#FFF2D6' : '#F4F1EA'} stroke="#CFC7BA" strokeWidth="1" />
                {lighting === 'warm' && (
                  <ellipse cx="758" cy="288" rx="44" ry="34" fill="#FDE68A" fillOpacity="0.32" filter={`url(#${uid}-soft-shadow)`} />
                )}

                <ellipse cx="475" cy="452" rx="225" ry="14" fill="#0f172a" fillOpacity="0.26" filter={`url(#${uid}-soft-shadow)`} />
                <polygon points="274,412 286,412 281,448 272,448" fill="#7D5C40" />
                <polygon points="664,412 676,412 680,448 671,448" fill="#7D5C40" />
                <rect x="260" y="294" width="430" height="82" rx="16" fill="#E3DDD3" stroke="#CFC7BA" strokeWidth="1" />
                <rect x="288" y="356" width="186" height="44" rx="8" fill="#EBE6DD" stroke="#D5CEC2" strokeWidth="1" />
                <rect x="476" y="356" width="186" height="44" rx="8" fill="#EBE6DD" stroke="#D5CEC2" strokeWidth="1" />
                <rect x="262" y="394" width="426" height="22" rx="6" fill="#D5CEC2" />
                <rect x="252" y="328" width="38" height="86" rx="12" fill="#DED8CD" stroke="#C8C0B3" strokeWidth="1" />
                <rect x="660" y="328" width="38" height="86" rx="12" fill="#DED8CD" stroke="#C8C0B3" strokeWidth="1" />
                <rect x="298" y="312" width="54" height="48" rx="8" fill="#C9BEB0" transform="rotate(-7 325 336)" />
                <rect x="598" y="312" width="54" height="48" rx="8" fill="#B5A898" transform="rotate(6 625 336)" />

                <ellipse cx="475" cy="490" rx="124" ry="9" fill="#0f172a" fillOpacity="0.22" filter={`url(#${uid}-soft-shadow)`} />
                <rect x="372" y="454" width="8" height="34" fill="#3B2B1E" />
                <rect x="570" y="454" width="8" height="34" fill="#3B2B1E" />
                <rect x="348" y="443" width="254" height="12" rx="5" fill="#7D5D42" />
                <rect x="435" y="432" width="46" height="11" rx="2" fill="#F8FAFC" />
                <rect x="441" y="424" width="34" height="8" rx="2" fill="#334155" />

                <ellipse cx="176" cy="458" rx="34" ry="8" fill="#0f172a" fillOpacity="0.24" filter={`url(#${uid}-soft-shadow)`} />
                <polygon points="154,394 198,394 190,452 162,452" fill="#D7CFC4" stroke="#BDB3A5" strokeWidth="1" />
                <path d="M176,394 C175,355 174,315 176,264" stroke="#5A4634" strokeWidth="4" fill="none" />
                <ellipse cx="152" cy="336" rx="24" ry="13" fill="#4A6B49" transform="rotate(-28 152 336)" />
                <ellipse cx="198" cy="316" rx="26" ry="14" fill="#3E5C3D" transform="rotate(24 198 316)" />
                <ellipse cx="158" cy="288" rx="22" ry="12" fill="#587C56" transform="rotate(-20 158 288)" />
                <ellipse cx="186" cy="264" rx="20" ry="12" fill="#638A61" transform="rotate(14 186 264)" />
              </g>
            )}

            {/* SCENE 2: MASTER BEDROOM */}
            {scene === 'bedroom' && (
              <g>
                <line x1="220" y1="24" x2="220" y2="212" stroke="#1e293b" strokeWidth="2" />
                <path d="M198,236 Q220,204 242,236 Z" fill={lighting === 'warm' ? '#FDE68A' : '#E7E5E4'} stroke="#475569" strokeWidth="1" />
                <line x1="740" y1="24" x2="740" y2="212" stroke="#1e293b" strokeWidth="2" />
                <path d="M718,236 Q740,204 762,236 Z" fill={lighting === 'warm' ? '#FDE68A' : '#E7E5E4'} stroke="#475569" strokeWidth="1" />

                <rect x="174" y="346" width="94" height="74" rx="4" fill="#8C6B4E" />
                <line x1="174" y1="382" x2="268" y2="382" stroke="#6E5138" strokeWidth="1.5" />
                <rect x="184" y="420" width="8" height="24" fill="#5A412B" />
                <rect x="250" y="420" width="8" height="24" fill="#5A412B" />

                <rect x="692" y="346" width="94" height="74" rx="4" fill="#8C6B4E" />
                <line x1="692" y1="382" x2="786" y2="382" stroke="#6E5138" strokeWidth="1.5" />
                <rect x="702" y="420" width="8" height="24" fill="#5A412B" />
                <rect x="768" y="420" width="8" height="24" fill="#5A412B" />

                <ellipse cx="480" cy="462" rx="220" ry="18" fill="#0f172a" fillOpacity="0.25" filter={`url(#${uid}-soft-shadow)`} />
                <rect x="294" y="242" width="372" height="128" rx="14" fill="#DFD9CF" stroke="#C5BEB2" strokeWidth="1.5" />
                <line x1="387" y1="244" x2="387" y2="368" stroke="#CDC6BA" strokeWidth="1" />
                <line x1="480" y1="244" x2="480" y2="368" stroke="#CDC6BA" strokeWidth="1" />
                <line x1="573" y1="244" x2="573" y2="368" stroke="#CDC6BA" strokeWidth="1" />

                <rect x="322" y="308" width="144" height="58" rx="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
                <rect x="494" y="308" width="144" height="58" rx="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />

                <rect x="290" y="358" width="380" height="96" rx="10" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
                <rect x="290" y="396" width="380" height="58" rx="6" fill="#E6E1D8" />
              </g>
            )}

            {/* SPLIT COMPARE DIVIDER (Interior) */}
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
          </g>
        )}
      </svg>

      {/* Clean Architectural Swatch Identification Overlays (Zero-Pill) */}
      <div className="pointer-events-none absolute top-3 right-3 flex items-center gap-2">
        <div
          className={`px-3 py-1.5 rounded-lg border backdrop-blur-xs shadow-xs ${
            primaryLightText || scene === 'exterior'
              ? 'bg-slate-950/75 border-white/20 text-white'
              : 'bg-white/85 border-slate-900/10 text-slate-900'
          }`}
        >
          <div className="text-[10px] opacity-80">
            {scene === 'exterior'
              ? isSplit
                ? 'الواجهة الرئيسية (أساسي)'
                : 'معاينة الواجهة الخارجية'
              : isSplit
              ? 'اللون الأساسي (يمين)'
              : 'اللون المعروض على الحائط'}
            {textureBadgeLabel ? ` · ${textureBadgeLabel}` : ''}
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
              compareLightText || scene === 'exterior'
                ? 'bg-slate-950/75 border-white/20 text-white'
                : 'bg-white/85 border-slate-900/10 text-slate-900'
            }`}
          >
            <div className="text-[10px] opacity-80">
              {scene === 'exterior' ? 'الجناح والسور (مقارنة)' : 'لون المقارنة (يسار)'}
              {compareTexture !== 'smooth' ? ` · ${TEXTURE_GRADE_LABELS_AR[compareTexture]}` : ''}
            </div>
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
