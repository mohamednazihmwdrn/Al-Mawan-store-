import React, { useEffect, useRef, useState } from 'react';
import { isLightHex } from '../data/glcColors';
import { GraffiatoTextureGrade } from '../data/sipesColors';
import { MouldingCategoryId, MouldingPatternKind } from '../data/futecCatalogs';

export type RoomSceneType =
  | 'living'
  | 'salon'
  | 'bedroom'
  | 'kids'
  | 'kitchen'
  | 'bathroom'
  | 'wall'
  | 'exterior';
export type WallLightingMode = 'daylight' | 'warm';
export type WallFinishType = 'matt' | 'silk' | 'semigloss';
export type WallTextureType = 'smooth' | GraffiatoTextureGrade;

export interface WallPreviewShade {
  code: string;
  hex: string;
  nameAr?: string;
  brandLabel?: string;
  texture?: WallTextureType;
  laserGlitter?: boolean;
}

export interface MouldingPreviewSpec {
  code: string;
  nameAr: string;
  brandLabel: string;
  dimensionsAr: string;
  categoryId?: MouldingCategoryId;
  catalogPage?: number;
  patternKind: MouldingPatternKind;
  widthTier: 'slim' | 'medium' | 'wide';
  trimHex?: string;
  imageUrl?: string;
  appliedImageUrl?: string;
  cornerImageUrl?: string;
  cornerKind?: 'corner' | 'crown';
}

interface GlcWallPreviewProps {
  primaryShade: WallPreviewShade;
  compareShade: WallPreviewShade | null;
  scene: RoomSceneType;
  lighting: WallLightingMode;
  finish: WallFinishType;
  texture?: WallTextureType;
  hasLaserGlitter?: boolean;
  moulding?: MouldingPreviewSpec | null;
  zoom?: number;
  onZoomChange?: (nextZoom: number) => void;
  enablePanZoom?: boolean;
}

export const TEXTURE_GRADE_LABELS_AR: Record<GraffiatoTextureGrade, string> = {
  fine: 'ناعم',
  medium: 'وسط',
  coarse: 'خشن',
};

const SCENE_LABELS_AR: Record<RoomSceneType, string> = {
  living: 'ركنة ومعيشة',
  salon: 'صالون استقبال',
  bedroom: 'غرفة نوم',
  kids: 'غرفة أطفال',
  kitchen: 'مطبخ',
  bathroom: 'حمام',
  wall: 'حائط كامل',
  exterior: 'واجهة خارجية',
};

const DADO_DIVIDER_CODES = new Set(['K 111', 'K 165', 'K 126', 'K 125', 'K 130', 'K 221']);

function getMouldingFocusPoint(
  scene: RoomSceneType,
  moulding: MouldingPreviewSpec | null
): { cx: number; cy: number } {
  if (!moulding) {
    return scene === 'exterior' ? { cx: 610, cy: 230 } : { cx: 480, cy: 225 };
  }
  if (scene === 'exterior') {
    if (moulding.patternKind === 'wood_slat_wide' || moulding.patternKind === 'wood_slat_fine' || moulding.patternKind === 'wood_wave') {
      return { cx: 690, cy: 350 };
    }
    if (moulding.patternKind === 'column' || moulding.patternKind === 'console') {
      return { cx: 525, cy: 335 };
    }
    return { cx: 625, cy: 135 };
  }
  switch (moulding.patternKind) {
    case 'corniche_plain':
    case 'corniche_ornate':
    case 'corniche_light':
    case 'exterior_corniche':
      return { cx: 340, cy: 52 };
    case 'medallion':
      return { cx: 480, cy: scene === 'wall' ? 195 : 64 };
    case 'skirting':
    case 'skirting_led':
      return { cx: 340, cy: 410 };
    case 'angle':
      return { cx: scene === 'wall' ? 110 : 140, cy: 215 };
    case 'door_frame':
      return { cx: 190, cy: 225 };
    case 'console':
      return { cx: 210, cy: 115 };
    case 'column':
      return { cx: 170, cy: 215 };
    default:
      return { cx: 480, cy: 195 };
  }
}

export const GlcWallPreview: React.FC<GlcWallPreviewProps> = ({
  primaryShade,
  compareShade,
  scene,
  lighting,
  finish,
  texture = 'smooth',
  hasLaserGlitter = false,
  moulding = null,
  zoom: controlledZoom,
  onZoomChange,
  enablePanZoom = false,
}) => {
  const uid = React.useId().replace(/:/g, '');
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [internalZoom, setInternalZoom] = useState(1);
  const activeZoom = Math.min(4, Math.max(1, controlledZoom ?? internalZoom));

  const setZoom = (next: number) => {
    const clamped = Math.min(4, Math.max(1, Math.round(next * 100) / 100));
    if (onZoomChange) {
      onZoomChange(clamped);
    } else {
      setInternalZoom(clamped);
    }
  };

  // Pan state in SVG viewBox top-left coordinates when zoomed > 1
  const [panOffset, setPanOffset] = useState<{ x: number; y: number } | null>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startVbX: number;
    startVbY: number;
    moved: boolean;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Reset custom pan when profile, scene, or zoom=1 resets so zoom auto-focuses the installed item
  useEffect(() => {
    setPanOffset(null);
  }, [moulding?.code, moulding?.appliedImageUrl, scene, activeZoom <= 1]);

  const vbW = 960 / activeZoom;
  const vbH = 540 / activeZoom;
  const focus = getMouldingFocusPoint(scene, moulding);
  const defaultVbX = Math.min(960 - vbW, Math.max(0, focus.cx - vbW / 2));
  const defaultVbY = Math.min(540 - vbH, Math.max(0, focus.cy - vbH / 2));
  const vbX = activeZoom <= 1 ? 0 : Math.min(960 - vbW, Math.max(0, panOffset?.x ?? defaultVbX));
  const vbY = activeZoom <= 1 ? 0 : Math.min(540 - vbH, Math.max(0, panOffset?.y ?? defaultVbY));

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!enablePanZoom || activeZoom <= 1) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStateRef.current = {
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startVbX: vbX,
      startVbY: vbY,
      moved: false,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const drag = dragStateRef.current;
    const svg = svgRef.current;
    if (!drag || !svg || activeZoom <= 1) return;
    const rect = svg.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dxPx = e.clientX - drag.startClientX;
    const dyPx = e.clientY - drag.startClientY;
    if (Math.abs(dxPx) > 3 || Math.abs(dyPx) > 3) {
      drag.moved = true;
    }
    const dxSvg = (dxPx / rect.width) * vbW;
    const dySvg = (dyPx / rect.height) * vbH;
    const nextX = Math.min(960 - vbW, Math.max(0, drag.startVbX - dxSvg));
    const nextY = Math.min(540 - vbH, Math.max(0, drag.startVbY - dySvg));
    setPanOffset({ x: nextX, y: nextY });
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (dragStateRef.current?.pointerId === e.pointerId) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore if already released
      }
      dragStateRef.current = null;
      setIsDragging(false);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!enablePanZoom) return;
    if (activeZoom > 1.05) {
      setZoom(1);
      setPanOffset(null);
      return;
    }
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const clickSvgX = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 960;
    const clickSvgY = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 540;
    const nextZoom = 2.5;
    const nextW = 960 / nextZoom;
    const nextH = 540 / nextZoom;
    setZoom(nextZoom);
    setPanOffset({
      x: Math.min(960 - nextW, Math.max(0, clickSvgX - nextW / 2)),
      y: Math.min(540 - nextH, Math.max(0, clickSvgY - nextH / 2)),
    });
  };

  const isSplit = Boolean(compareShade) && !moulding;
  const activeTexture: WallTextureType = texture;
  const compareTexture: WallTextureType =
    compareShade?.texture && compareShade.texture !== 'smooth'
      ? compareShade.texture
      : activeTexture;

  const primaryGlitter = Boolean(hasLaserGlitter || primaryShade.laserGlitter);
  const compareGlitter = Boolean(
    compareShade ? compareShade.laserGlitter ?? hasLaserGlitter : false
  );

  const texturePatternUrl = (t: WallTextureType) => {
    if (t === 'fine') return `url(#${uid}-tex-fine)`;
    if (t === 'medium') return `url(#${uid}-tex-medium)`;
    if (t === 'coarse') return `url(#${uid}-tex-coarse)`;
    return undefined;
  };

  const primaryTexUrl = texturePatternUrl(activeTexture);
  const compareTexUrl = texturePatternUrl(compareTexture);
  const laserPatternUrl = `url(#${uid}-laser-glitter)`;
  const sheenOpacity = finish === 'semigloss' ? 0.24 : finish === 'silk' ? 0.13 : 0.03;

  const trimHex = moulding?.trimHex || '#FFFFFF';
  const trimIsCustom = trimHex.toUpperCase() !== '#FFFFFF';
  const trimIsDark = !isLightHex(trimHex);
  const trimShadow = trimIsDark ? '#090D12' : '#94A3B8';
  const trimHighlight = trimIsDark ? '#CBD5E1' : '#FFFFFF';
  const tierScale =
    moulding?.widthTier === 'wide' ? 1.45 : moulding?.widthTier === 'medium' ? 1.1 : 0.78;
  const wallAccentHex = primaryShade.hex;

  // Real photographic moulding texture source (extracted applied PNG/cutout, fallback to catalog crop)
  const realTexHref = moulding?.appliedImageUrl || moulding?.imageUrl || '';
  const cornerHref = moulding?.cornerImageUrl || '';
  const trimFilterAttr = trimIsCustom ? `url(#${uid}-trim-tint)` : undefined;

  // Determine exact dimensional tiles for real moulding installation
  const isReady3dPanel =
    Boolean(moulding) &&
    (moulding!.patternKind.startsWith('wall_3d_') ||
      moulding!.patternKind.startsWith('wood_') ||
      moulding!.categoryId === 'panels_3d');

  const isDadoDivider = Boolean(moulding && DADO_DIVIDER_CODES.has(moulding.code));
  const isVerticalAppliqueSet = Boolean(
    moulding && (moulding.code === 'FD 19' || moulding.code === 'FD 15')
  );
  const isHorizontalApplique = Boolean(
    moulding &&
      moulding.patternKind === 'panel_ornate' &&
      moulding.code.startsWith('FD ') &&
      !isVerticalAppliqueSet &&
      !isReady3dPanel
  );

  const TILED_ORNATE_DIVIDER_CODES = ['K 111', 'K 165', 'K 126', 'K 33', 'K 34', 'K 10'];
  const useTiledPattern = Boolean(
    moulding &&
      (moulding.patternKind === 'corniche_ornate' ||
        TILED_ORNATE_DIVIDER_CODES.includes(moulding.code))
  );

  const corniceH = Math.round(
    (moulding?.patternKind === 'exterior_corniche' ? 28 : 20) * tierScale
  );
  const corniceTileW = Math.max(88, Math.round(corniceH * 3.8));
  const extCorniceH = Math.round(18 * tierScale);
  const extCorniceTileW = Math.max(76, Math.round(extCorniceH * 3.6));

  const skirtingH = Math.round(21 * tierScale);
  const skirtingTileW = Math.max(84, Math.round(skirtingH * 3.4));

  const panelBorderW =
    moulding?.widthTier === 'wide' ? 13 : moulding?.widthTier === 'medium' ? 9.5 : 6.5;
  const panelTileW = Math.max(52, Math.round(panelBorderW * 4.4));

  const dadoH = moulding?.widthTier === 'wide' ? 24 : 18;
  const dadoTileW = Math.max(82, Math.round(dadoH * 3.8));

  // Tile dimensions for 3D wall panels & ready-made FD30 / FD50 & wood slats
  const isWallClose = scene === 'wall';
  const featureZoneX = isWallClose ? 0 : 120;
  const featureZoneY = isWallClose ? 0 : 38;
  const featureZoneW = isWallClose ? 960 : 720;
  const featureZoneH = isWallClose ? 404 : 358;

  let tile3dW = isWallClose ? 116 : 82;
  let tile3dH = isWallClose ? 116 : 82;
  if (moulding?.patternKind === 'wall_3d_rock' || moulding?.code === '3D 9') {
    tile3dW = isWallClose ? 186 : 132;
    tile3dH = isWallClose ? 330 : 230;
  } else if (moulding?.code === 'FD 30') {
    tile3dW = isWallClose ? 112 : 84;
    tile3dH = isWallClose ? 202 : 156;
  } else if (moulding?.code === 'FD 50') {
    tile3dW = isWallClose ? 138 : 104;
    tile3dH = isWallClose ? 166 : 126;
  } else if (moulding?.patternKind.startsWith('wood_')) {
    tile3dW =
      moulding.patternKind === 'wood_slat_fine'
        ? isWallClose
          ? 52
          : 38
        : isWallClose
        ? 68
        : 48;
    tile3dH = featureZoneH;
  }

  return (
    <div
      className={`relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 select-none ${
        enablePanZoom && activeZoom > 1
          ? isDragging
            ? 'cursor-grabbing'
            : 'cursor-grab'
          : enablePanZoom
          ? 'cursor-zoom-in'
          : ''
      }`}
    >
      <svg
        ref={svgRef}
        viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
        className="w-full h-full block touch-none"
        role="img"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        aria-label={
          moulding
            ? `معاينة ${moulding.brandLabel} كود ${moulding.code} (${moulding.nameAr}) في ${SCENE_LABELS_AR[scene]}`
            : `معاينة لون ${primaryShade.brandLabel || ''} ${primaryShade.code} على ${SCENE_LABELS_AR[scene]}`
        }
      >
        <defs>
          {/* Real Moulding Photographic Finish Tinting & Drop Shadow Filters */}
          <filter id={`${uid}-trim-tint`} colorInterpolationFilters="sRGB">
            <feFlood floodColor={trimHex} floodOpacity={trimIsDark ? '0.88' : '0.96'} result="tint" />
            <feBlend mode="multiply" in="SourceGraphic" in2="tint" result="tinted" />
            <feComposite operator="in" in="tinted" in2="SourceAlpha" />
          </filter>

          <filter id={`${uid}-mould-shadow`} x="-10%" y="-10%" width="125%" height="130%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#0f172a" floodOpacity="0.28" />
          </filter>

          {/* ===================== GRAFFIATO SURFACE TEXTURE PATTERNS ===================== */}
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

          <pattern id={`${uid}-tex-coarse`} width="56" height="96" patternUnits="userSpaceOnUse">
            <path d="M7,4 L7,34 M7,44 L7,88" stroke="#0f172a" strokeOpacity="0.33" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M8.8,4 L8.8,34 M8.8,44 L8.8,88" stroke="#ffffff" strokeOpacity="0.34" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M19,10 L19,58 M19,68 L19,93" stroke="#0f172a" strokeOpacity="0.29" strokeWidth="2.0" strokeLinecap="round" />
            <path d="M20.6,10 L20.6,58 M20.6,68 L20.6,93" stroke="#ffffff" strokeOpacity="0.30" strokeWidth="1.0" strokeLinecap="round" />
            <path d="M31,2 L31,26 M31,36 L31,74 M31,82 L31,95" stroke="#0f172a" strokeOpacity="0.34" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M33,2 L33,26 M33,36 L33,74 M33,82 L33,95" stroke="#ffffff" strokeOpacity="0.36" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M44,14 L44,50 M44,60 L44,86" stroke="#0f172a" strokeOpacity="0.28" strokeWidth="2.1" strokeLinecap="round" />
            <path d="M45.7,14 L45.7,50 M45.7,60 L45.7,86" stroke="#ffffff" strokeOpacity="0.28" strokeWidth="1.0" strokeLinecap="round" />
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

          <pattern id={`${uid}-laser-glitter`} width="48" height="48" patternUnits="userSpaceOnUse">
            <polygon points="8,4 9.6,7 8,10 6.4,7" fill="#ffffff" fillOpacity="0.88" />
            <polygon points="24,14 25.8,17.2 24,20.4 22.2,17.2" fill="#FEF08A" fillOpacity="0.72" />
            <polygon points="40,7 41.3,9.5 40,12 38.7,9.5" fill="#ffffff" fillOpacity="0.8" />
            <polygon points="15,30 16.5,33 15,36 13.5,33" fill="#ffffff" fillOpacity="0.85" />
            <polygon points="34,36 35.8,39 34,42 32.2,39" fill="#FDE68A" fillOpacity="0.75" />
            <circle cx="5" cy="22" r="0.85" fill="#ffffff" fillOpacity="0.85" />
            <circle cx="29" cy="6" r="0.75" fill="#0f172a" fillOpacity="0.22" />
            <circle cx="44" cy="24" r="0.9" fill="#ffffff" fillOpacity="0.82" />
            <circle cx="20" cy="43" r="0.8" fill="#0f172a" fillOpacity="0.2" />
            <circle cx="42" cy="44" r="0.7" fill="#ffffff" fillOpacity="0.78" />
          </pattern>

          {/* ===================== REAL APPLIED MOULDING TEXTURE PATTERNS ===================== */}
          {realTexHref && isReady3dPanel && (
            <pattern
              id={`${uid}-real-3d-tile`}
              width={tile3dW}
              height={tile3dH}
              x={featureZoneX}
              y={featureZoneY}
              patternUnits="userSpaceOnUse"
            >
              <image
                href={realTexHref}
                width={tile3dW}
                height={tile3dH}
                preserveAspectRatio={moulding?.patternKind.startsWith('wood_') ? 'none' : 'xMidYMid slice'}
                filter={trimFilterAttr}
              />
            </pattern>
          )}

          {realTexHref && scene === 'exterior' && moulding?.patternKind.startsWith('wood_') && (
            <pattern
              id={`${uid}-real-ext-wood`}
              width="34"
              height="146"
              x="580"
              y="286"
              patternUnits="userSpaceOnUse"
            >
              <image
                href={realTexHref}
                width="34"
                height="146"
                preserveAspectRatio="none"
                filter={trimFilterAttr}
              />
            </pattern>
          )}

          {realTexHref && (
            <>
              {/* Interior Cornice Pattern (anchored cleanly to y = baseY) */}
              <pattern
                id={`${uid}-pat-cornice`}
                width={corniceTileW}
                height={corniceH}
                x={scene === 'wall' ? 0 : 92}
                y={scene === 'wall' ? 0 : 22}
                patternUnits="userSpaceOnUse"
              >
                <image
                  href={realTexHref}
                  width={corniceTileW}
                  height={corniceH}
                  preserveAspectRatio="none"
                  filter={trimFilterAttr}
                />
              </pattern>

              {/* Left Return Angled Cornice Pattern */}
              <pattern
                id={`${uid}-pat-cornice-ret`}
                width={corniceTileW}
                height={corniceH}
                x="0"
                y="0"
                patternUnits="userSpaceOnUse"
              >
                <image
                  href={realTexHref}
                  width={corniceTileW}
                  height={corniceH}
                  preserveAspectRatio="none"
                  filter={trimFilterAttr}
                />
              </pattern>

              {/* Exterior Cornice Patterns */}
              <pattern
                id={`${uid}-pat-ext-cornice-main`}
                width={extCorniceTileW}
                height={extCorniceH}
                x="430"
                y="40"
                patternUnits="userSpaceOnUse"
              >
                <image
                  href={realTexHref}
                  width={extCorniceTileW}
                  height={extCorniceH}
                  preserveAspectRatio="none"
                  filter={trimFilterAttr}
                />
              </pattern>
              <pattern
                id={`${uid}-pat-ext-cornice-belt`}
                width={extCorniceTileW}
                height={Math.round(extCorniceH * 0.85)}
                x="422"
                y="242"
                patternUnits="userSpaceOnUse"
              >
                <image
                  href={realTexHref}
                  width={extCorniceTileW}
                  height={Math.round(extCorniceH * 0.85)}
                  preserveAspectRatio="none"
                  filter={trimFilterAttr}
                />
              </pattern>
              <pattern
                id={`${uid}-pat-ext-cornice-rear`}
                width={extCorniceTileW}
                height={Math.round(extCorniceH * 0.78)}
                x="124"
                y="62"
                patternUnits="userSpaceOnUse"
              >
                <image
                  href={realTexHref}
                  width={extCorniceTileW}
                  height={Math.round(extCorniceH * 0.78)}
                  preserveAspectRatio="none"
                  filter={trimFilterAttr}
                />
              </pattern>

              {/* Skirting Horizontal & Left Return Patterns */}
              <pattern
                id={`${uid}-pat-skirting`}
                width={skirtingTileW}
                height={skirtingH}
                x={scene === 'wall' ? 0 : 92}
                y={(scene === 'wall' ? 432 : 420) - skirtingH}
                patternUnits="userSpaceOnUse"
              >
                <image
                  href={realTexHref}
                  width={skirtingTileW}
                  height={skirtingH}
                  preserveAspectRatio="none"
                  filter={trimFilterAttr}
                />
              </pattern>
              <pattern
                id={`${uid}-pat-skirting-ret`}
                width={skirtingTileW}
                height={skirtingH}
                x="0"
                y="0"
                patternUnits="userSpaceOnUse"
              >
                <image
                  href={realTexHref}
                  width={skirtingTileW}
                  height={skirtingH}
                  preserveAspectRatio="none"
                  filter={trimFilterAttr}
                />
              </pattern>

              {/* Dado Horizontal Divider Pattern */}
              <pattern
                id={`${uid}-pat-dado`}
                width={dadoTileW}
                height={dadoH}
                x={scene === 'wall' ? 0 : 92}
                y="280"
                patternUnits="userSpaceOnUse"
              >
                <image
                  href={realTexHref}
                  width={dadoTileW}
                  height={dadoH}
                  preserveAspectRatio="none"
                  filter={trimFilterAttr}
                />
              </pattern>

              {/* Panou Local Tile Patterns (inside group translated to panel origin) */}
              <pattern
                id={`${uid}-pat-rail-h`}
                width={panelTileW}
                height={panelBorderW}
                patternUnits="userSpaceOnUse"
              >
                <image
                  href={realTexHref}
                  width={panelTileW}
                  height={panelBorderW}
                  preserveAspectRatio="none"
                  filter={trimFilterAttr}
                />
              </pattern>
              <pattern
                id={`${uid}-pat-rail-v`}
                width={panelBorderW}
                height={panelTileW}
                patternUnits="userSpaceOnUse"
              >
                <image
                  href={realTexHref}
                  x={-panelTileW}
                  y="0"
                  width={panelTileW}
                  height={panelBorderW}
                  preserveAspectRatio="none"
                  transform="rotate(-90)"
                  filter={trimFilterAttr}
                />
              </pattern>
            </>
          )}

          {/* Side Wall Shadow Multiplier */}
          <linearGradient id={`${uid}-side-shade`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.08" />
          </linearGradient>

          <linearGradient id={`${uid}-sky`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={lighting === 'daylight' ? '#5BA4DA' : '#1E293B'} />
            <stop offset="55%" stopColor={lighting === 'daylight' ? '#A7D2EE' : '#475569'} />
            <stop offset="100%" stopColor={lighting === 'daylight' ? '#E4F1FA' : '#9A6B4F'} />
          </linearGradient>

          <linearGradient id={`${uid}-ext-sun`} x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={lighting === 'daylight' ? '0.2' : '0.04'} />
            <stop offset="65%" stopColor="#0f172a" stopOpacity="0.0" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity={lighting === 'daylight' ? '0.14' : '0.28'} />
          </linearGradient>

          <linearGradient id={`${uid}-daylight`} x1="0%" y1="0%" x2="100%" y2="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={lighting === 'daylight' ? '0.28' : '0.07'} />
            <stop offset="48%" stopColor="#ffffff" stopOpacity={lighting === 'daylight' ? '0.08' : '0.0'} />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.16" />
          </linearGradient>

          <linearGradient id={`${uid}-ceiling-shadow`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.18" />
            <stop offset="14%" stopColor="#0f172a" stopOpacity="0.03" />
            <stop offset="85%" stopColor="#0f172a" stopOpacity="0" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.1" />
          </linearGradient>

          <radialGradient id={`${uid}-warm-lamp`} cx="72%" cy="32%" r="58%">
            <stop offset="0%" stopColor="#ffdfa3" stopOpacity={lighting === 'warm' ? '0.42' : '0'} />
            <stop offset="45%" stopColor="#f59e0b" stopOpacity={lighting === 'warm' ? '0.16' : '0'} />
            <stop offset="100%" stopColor="#1e1b4b" stopOpacity={lighting === 'warm' ? '0.18' : '0'} />
          </radialGradient>

          <radialGradient id={`${uid}-sconce-cone`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.72" />
            <stop offset="55%" stopColor="#F59E0B" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>

          <radialGradient id={`${uid}-spot1`} cx="30%" cy="6%" r="48%">
            <stop offset="0%" stopColor="#fff8e7" stopOpacity={lighting === 'warm' ? '0.35' : '0.18'} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-spot2`} cx="68%" cy="6%" r="48%">
            <stop offset="0%" stopColor="#fff8e7" stopOpacity={lighting === 'warm' ? '0.35' : '0.18'} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          <linearGradient id={`${uid}-sheen`} x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="38%" stopColor="#ffffff" stopOpacity={sheenOpacity} />
            <stop offset="52%" stopColor="#ffffff" stopOpacity={sheenOpacity * 0.4} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          <linearGradient id={`${uid}-floor`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C9B396" />
            <stop offset="35%" stopColor="#D6C2A7" />
            <stop offset="100%" stopColor="#B89E7E" />
          </linearGradient>

          <linearGradient id={`${uid}-glass`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={lighting === 'daylight' ? '#DCEBFA' : '#FDE68A'} />
            <stop offset="55%" stopColor={lighting === 'daylight' ? '#8DB4D4' : '#D97706'} />
            <stop offset="100%" stopColor={lighting === 'daylight' ? '#4F6E8B' : '#78350F'} />
          </linearGradient>

          <pattern id={`${uid}-wood-slats`} width="14" height="40" patternUnits="userSpaceOnUse">
            <rect width="14" height="40" fill="#4E3824" />
            <rect x="0" y="0" width="9" height="40" fill="#8C6743" />
            <rect x="7" y="0" width="2" height="40" fill="#6F5033" />
          </pattern>

          <filter id={`${uid}-soft-shadow`} x="-15%" y="-15%" width="130%" height="140%">
            <feGaussianBlur stdDeviation="8" />
          </filter>

          <linearGradient id={`${uid}-led-wash`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={lighting === 'warm' ? '#FDE68A' : '#E0F2FE'} stopOpacity="0.9" />
            <stop offset="35%" stopColor={lighting === 'warm' ? '#FBBF24' : '#BAE6FD'} stopOpacity="0.34" />
            <stop offset="100%" stopColor={lighting === 'warm' ? '#F59E0B' : '#BAE6FD'} stopOpacity="0" />
          </linearGradient>

          <linearGradient id={`${uid}-led-up`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={lighting === 'warm' ? '#FDE68A' : '#E0F2FE'} stopOpacity="0.88" />
            <stop offset="100%" stopColor={lighting === 'warm' ? '#F59E0B' : '#BAE6FD'} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* ===================== SCENE A: EXTERIOR BUILDING FACADE (واجهة خارجية) ===================== */}
        {scene === 'exterior' ? (
          <g>
            {/* 1. Sky Background */}
            <rect x="0" y="0" width="960" height="450" fill={`url(#${uid}-sky)`} />
            <ellipse cx="175" cy="92" rx="110" ry="22" fill="#ffffff" fillOpacity={lighting === 'daylight' ? '0.45' : '0.08'} />
            <ellipse cx="790" cy="76" rx="145" ry="26" fill="#ffffff" fillOpacity={lighting === 'daylight' ? '0.35' : '0.06'} />

            <g fill={lighting === 'daylight' ? '#36543B' : '#1E2D24'} fillOpacity="0.9">
              <ellipse cx="98" cy="295" rx="44" ry="88" />
              <ellipse cx="64" cy="325" rx="34" ry="68" />
              <ellipse cx="878" cy="310" rx="42" ry="78" />
            </g>

            {/* 2. Rear Architectural Wing */}
            <rect
              x="160"
              y="72"
              width="290"
              height="360"
              fill={isSplit && compareShade ? compareShade.hex : primaryShade.hex}
              style={{ transition: 'fill 180ms ease-out' }}
            />
            {(isSplit ? compareTexUrl : primaryTexUrl) && (
              <rect x="160" y="72" width="290" height="360" fill={isSplit ? compareTexUrl : primaryTexUrl} pointerEvents="none" />
            )}
            {(isSplit ? compareGlitter : primaryGlitter) && (
              <rect x="160" y="72" width="290" height="360" fill={laserPatternUrl} pointerEvents="none" />
            )}
            <rect x="160" y="72" width="290" height="360" fill="#0f172a" fillOpacity="0.1" pointerEvents="none" />
            <polygon points="132,90 160,72 160,432 132,432" fill={isSplit && compareShade ? compareShade.hex : primaryShade.hex} />
            {(isSplit ? compareTexUrl : primaryTexUrl) && (
              <polygon points="132,90 160,72 160,432 132,432" fill={isSplit ? compareTexUrl : primaryTexUrl} />
            )}
            <polygon points="132,90 160,72 160,432 132,432" fill="#0f172a" fillOpacity="0.28" />

            <rect x="128" y="66" width="326" height="10" fill="#1E242B" />

            <rect x="206" y="124" width="160" height="106" fill="#232931" />
            <rect x="214" y="132" width="68" height="90" fill={`url(#${uid}-glass)`} />
            <rect x="290" y="132" width="68" height="90" fill={`url(#${uid}-glass)`} />
            <g stroke="#1E242B" strokeWidth="2.5">
              <line x1="206" y1="196" x2="366" y2="196" />
              <line x1="206" y1="208" x2="366" y2="208" />
              <line x1="206" y1="220" x2="366" y2="220" />
            </g>

            {/* 3. Main Dominant Front Facade Mass */}
            <rect x="422" y="54" width="20" height="378" fill="#0f172a" fillOpacity="0.26" />
            <rect x="438" y="48" width="392" height="384" fill={primaryShade.hex} style={{ transition: 'fill 180ms ease-out' }} />
            {primaryTexUrl && <rect x="438" y="48" width="392" height="384" fill={primaryTexUrl} pointerEvents="none" />}
            {primaryGlitter && <rect x="438" y="48" width="392" height="384" fill={laserPatternUrl} pointerEvents="none" />}
            <rect x="438" y="48" width="392" height="384" fill={`url(#${uid}-ext-sun)`} pointerEvents="none" />

            <polygon points="830,48 860,68 860,432 830,432" fill={primaryShade.hex} />
            {primaryTexUrl && <polygon points="830,48 860,68 860,432 830,432" fill={primaryTexUrl} />}
            {primaryGlitter && <polygon points="830,48 860,68 860,432 830,432" fill={laserPatternUrl} />}
            <polygon points="830,48 860,68 860,432 830,432" fill="#0f172a" fillOpacity="0.24" />

            <rect x="434" y="42" width="400" height="12" fill="#1E242B" />
            <polygon points="834,42 864,62 864,72 834,54" fill="#13171C" />
            <rect x="424" y="246" width="414" height="14" fill="#1E242B" />
            <rect x="438" y="260" width="392" height="14" fill="#0f172a" fillOpacity="0.24" />

            {/* Recessed Main Panorama Window Frame */}
            <rect x="492" y="102" width="224" height="114" fill="#1F252D" />
            <rect x="502" y="112" width="100" height="94" fill={`url(#${uid}-glass)`} />
            <rect x="610" y="112" width="96" height="94" fill={`url(#${uid}-glass)`} />
            <line x1="502" y1="158" x2="706" y2="158" stroke="#28303B" strokeWidth="2" />
            <rect x="486" y="216" width="236" height="8" fill="#334155" />

            {/* Ground Floor Cladding & Glass Entryway */}
            <rect x="580" y="286" width="224" height="146" fill={`url(#${uid}-wood-slats)`} />
            <rect x="478" y="286" width="94" height="146" fill="#1E242B" />
            <rect x="488" y="296" width="74" height="136" fill={`url(#${uid}-glass)`} />
            <rect x="550" y="352" width="4" height="28" rx="1" fill="#F8FAFC" />

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

            {/* 4. Boundary Fence Wall */}
            <rect x="36" y="328" width="380" height="104" fill={isSplit && compareShade ? compareShade.hex : primaryShade.hex} style={{ transition: 'fill 180ms ease-out' }} />
            {(isSplit ? compareTexUrl : primaryTexUrl) && (
              <rect x="36" y="328" width="380" height="104" fill={isSplit ? compareTexUrl : primaryTexUrl} pointerEvents="none" />
            )}
            {(isSplit ? compareGlitter : primaryGlitter) && (
              <rect x="36" y="328" width="380" height="104" fill={laserPatternUrl} pointerEvents="none" />
            )}
            <rect x="36" y="328" width="380" height="104" fill={`url(#${uid}-ext-sun)`} pointerEvents="none" />
            <rect x="32" y="322" width="388" height="8" fill="#1E242B" />
            <rect x="132" y="338" width="112" height="94" fill="#3B2B1E" />
            <line x1="188" y1="338" x2="188" y2="432" stroke="#1E242B" strokeWidth="3" />
            <rect x="144" y="352" width="32" height="24" fill="#543D2B" />
            <rect x="200" y="352" width="32" height="24" fill="#543D2B" />

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

            {/* 5. Sidewalk & Street */}
            <rect x="0" y="432" width="960" height="44" fill="#CBD5E1" />
            <line x1="0" y1="432" x2="960" y2="432" stroke="#94A3B8" strokeWidth="2" />
            <g stroke="#94A3B8" strokeOpacity="0.55" strokeWidth="1">
              <line x1="120" y1="432" x2="80" y2="476" />
              <line x1="300" y1="432" x2="280" y2="476" />
              <line x1="480" y1="432" x2="480" y2="476" />
              <line x1="660" y1="432" x2="680" y2="476" />
              <line x1="840" y1="432" x2="880" y2="476" />
            </g>
            <rect x="0" y="476" width="960" height="10" fill="#94A3B8" />
            <rect x="0" y="486" width="960" height="54" fill="#1E293B" />
            <rect x="190" y="509" width="74" height="6" rx="2" fill="#E2E8F0" fillOpacity="0.65" />
            <rect x="443" y="509" width="74" height="6" rx="2" fill="#E2E8F0" fillOpacity="0.65" />
            <rect x="696" y="509" width="74" height="6" rx="2" fill="#E2E8F0" fillOpacity="0.65" />

            {/* Exterior Real Moulding Installation */}
            {moulding && (
              <g pointerEvents="none" filter={`url(#${uid}-mould-shadow)`}>
                {/* Crown Eave & Mid-Floor Belt & Rear Crown using exact chosen profile texture */}
                {realTexHref && !useTiledPattern ? (
                  <>
                    <image
                      href={realTexHref}
                      x="430"
                      y="40"
                      width="408"
                      height={extCorniceH}
                      preserveAspectRatio="none"
                      filter={trimFilterAttr}
                    />
                    <image
                      href={realTexHref}
                      x="422"
                      y="242"
                      width="416"
                      height={Math.round(extCorniceH * 0.85)}
                      preserveAspectRatio="none"
                      filter={trimFilterAttr}
                    />
                    <image
                      href={realTexHref}
                      x="124"
                      y="62"
                      width="332"
                      height={Math.round(extCorniceH * 0.78)}
                      preserveAspectRatio="none"
                      filter={trimFilterAttr}
                    />
                  </>
                ) : (
                  <>
                    <rect
                      x="430"
                      y="40"
                      width="408"
                      height={extCorniceH}
                      fill={realTexHref ? `url(#${uid}-pat-ext-cornice-main)` : trimHex}
                      stroke={realTexHref ? undefined : trimShadow}
                    />
                    <rect
                      x="422"
                      y="242"
                      width="416"
                      height={Math.round(extCorniceH * 0.85)}
                      fill={realTexHref ? `url(#${uid}-pat-ext-cornice-belt)` : trimHex}
                    />
                    <rect
                      x="124"
                      y="62"
                      width="332"
                      height={Math.round(extCorniceH * 0.78)}
                      fill={realTexHref ? `url(#${uid}-pat-ext-cornice-rear)` : trimHex}
                    />
                  </>
                )}

                {/* Window Architraves & Sills */}
                <rect x="486" y="96" width="236" height="126" fill="none" stroke={trimHex} strokeWidth="7" />
                {realTexHref && !useTiledPattern ? (
                  <image
                    href={realTexHref}
                    x="480"
                    y="88"
                    width="248"
                    height="11"
                    preserveAspectRatio="none"
                    filter={trimFilterAttr}
                  />
                ) : (
                  <rect x="480" y="88" width="248" height="11" fill={realTexHref ? `url(#${uid}-pat-ext-cornice-rear)` : trimHex} />
                )}
                <rect x="480" y="218" width="248" height="9" fill={trimHex} stroke={trimShadow} strokeWidth="0.8" />
                <rect x="200" y="118" width="172" height="114" fill="none" stroke={trimHex} strokeWidth="5" />
                <rect x="196" y="112" width="180" height="8" fill={trimHex} stroke={trimShadow} strokeWidth="0.8" />

                {/* Columns / Consoles flanking villa entryway */}
                {moulding.patternKind === 'column' && realTexHref ? (
                  <>
                    <image
                      href={realTexHref}
                      x="456"
                      y="264"
                      width="34"
                      height="168"
                      preserveAspectRatio="xMidYMid meet"
                      filter={trimFilterAttr}
                    />
                    <image
                      href={realTexHref}
                      x="564"
                      y="264"
                      width="34"
                      height="168"
                      preserveAspectRatio="xMidYMid meet"
                      filter={trimFilterAttr}
                    />
                  </>
                ) : moulding.patternKind === 'console' && realTexHref ? (
                  <>
                    <image
                      href={realTexHref}
                      x="452"
                      y="260"
                      width="32"
                      height="42"
                      preserveAspectRatio="xMidYMid meet"
                      filter={trimFilterAttr}
                    />
                    <image
                      href={realTexHref}
                      x="570"
                      y="260"
                      width="32"
                      height="42"
                      preserveAspectRatio="xMidYMid meet"
                      filter={trimFilterAttr}
                    />
                  </>
                ) : (moulding.patternKind === 'exterior_corniche' || moulding.patternKind === 'door_frame') ? (
                  <g>
                    <rect x="460" y="274" width="16" height="158" fill={trimHex} stroke={trimShadow} strokeWidth="1" />
                    <rect x="456" y="270" width="24" height="9" fill={trimHex} stroke={trimShadow} strokeWidth="1" />
                    <rect x="572" y="274" width="16" height="158" fill={trimHex} stroke={trimShadow} strokeWidth="1" />
                    <rect x="568" y="270" width="24" height="9" fill={trimHex} stroke={trimShadow} strokeWidth="1" />
                  </g>
                ) : null}

                {/* Exterior Wood Slat Cladding Override */}
                {moulding.patternKind.startsWith('wood_') && realTexHref && (
                  <rect x="580" y="286" width="224" height="146" fill={`url(#${uid}-real-ext-wood)`} />
                )}
              </g>
            )}
          </g>
        ) : (
          /* ===================== SCENE B: INTERIOR ROOMS & CLOSE-UP WALL ===================== */
          <g>
            {isSplit && compareShade ? (
              <>
                <rect x="0" y="0" width="480" height="432" fill={primaryShade.hex} style={{ transition: 'fill 180ms ease-out' }} />
                {primaryTexUrl && <rect x="0" y="0" width="480" height="432" fill={primaryTexUrl} pointerEvents="none" />}
                {primaryGlitter && <rect x="0" y="0" width="480" height="432" fill={laserPatternUrl} pointerEvents="none" />}
                <rect x="480" y="0" width="480" height="432" fill={compareShade.hex} style={{ transition: 'fill 180ms ease-out' }} />
                {compareTexUrl && <rect x="480" y="0" width="480" height="432" fill={compareTexUrl} pointerEvents="none" />}
                {compareGlitter && <rect x="480" y="0" width="480" height="432" fill={laserPatternUrl} pointerEvents="none" />}
              </>
            ) : (
              <>
                <rect x="0" y="0" width="960" height="432" fill={primaryShade.hex} style={{ transition: 'fill 180ms ease-out' }} />
                {primaryTexUrl && <rect x="0" y="0" width="960" height="432" fill={primaryTexUrl} pointerEvents="none" />}
                {primaryGlitter && <rect x="0" y="0" width="960" height="432" fill={laserPatternUrl} pointerEvents="none" />}
              </>
            )}

            {/* Angled Left Return Wall */}
            {scene !== 'wall' && (
              <polygon points="0,0 92,26 92,418 0,446" fill={`url(#${uid}-side-shade)`} />
            )}

            {/* Ceiling Plane */}
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

            {/* Architectural Lighting & Wall Shadows */}
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

            {/* Baseboard & Oak Floor */}
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

            {/* ===================== ARCHITECTURAL WALL-SURFACE MOULDINGS (BEHIND FURNITURE!) ===================== */}
            {moulding && (
              <g pointerEvents="none">
                {/* 1. 3D Wall Tiles / Wood Slats / Ready Fiber Frames */}
                {isReady3dPanel && realTexHref && (
                  <g filter={!isWallClose ? `url(#${uid}-mould-shadow)` : undefined}>
                    <rect
                      x={featureZoneX}
                      y={featureZoneY}
                      width={featureZoneW}
                      height={featureZoneH}
                      fill={`url(#${uid}-real-3d-tile)`}
                    />
                    {!isWallClose && (
                      <rect
                        x={featureZoneX}
                        y={featureZoneY}
                        width={featureZoneW}
                        height={featureZoneH}
                        fill="none"
                        stroke={trimShadow}
                        strokeOpacity="0.4"
                        strokeWidth="2.5"
                      />
                    )}
                  </g>
                )}

                {/* 2. Dado Chair-Rail Wall Dividers (p.19: K 111, K 165, K 126, K 125, K 130, K 221) */}
                {isDadoDivider && realTexHref && (
                  <g filter={`url(#${uid}-mould-shadow)`}>
                    {scene !== 'wall' && (
                      <g transform="skewY(-5)">
                        {!useTiledPattern ? (
                          <image
                            href={realTexHref}
                            x="0"
                            y="288"
                            width="92"
                            height={dadoH}
                            preserveAspectRatio="none"
                            filter={trimFilterAttr}
                          />
                        ) : (
                          <rect x="0" y="288" width="92" height={dadoH} fill={`url(#${uid}-pat-dado)`} />
                        )}
                      </g>
                    )}
                    {!useTiledPattern ? (
                      <image
                        href={realTexHref}
                        x={scene === 'wall' ? 0 : 92}
                        y="280"
                        width={scene === 'wall' ? 960 : 868}
                        height={dadoH}
                        preserveAspectRatio="none"
                        filter={trimFilterAttr}
                      />
                    ) : (
                      <rect
                        x={scene === 'wall' ? 0 : 92}
                        y="280"
                        width={scene === 'wall' ? 960 : 868}
                        height={dadoH}
                        fill={`url(#${uid}-pat-dado)`}
                      />
                    )}
                    {scene !== 'wall' && (
                      <line
                        x1="92"
                        y1="280"
                        x2="92"
                        y2={280 + dadoH}
                        stroke={trimShadow}
                        strokeOpacity="0.3"
                        strokeWidth="1"
                      />
                    )}
                  </g>
                )}

                {/* 3. Sculpted Wall Panel Frames (PS + Newtec Classic/Ornate/Arch/Beaded/Appliques) */}
                {(moulding.patternKind === 'panel_classic' ||
                  moulding.patternKind === 'panel_ornate' ||
                  moulding.patternKind === 'panel_arch') &&
                  !isReady3dPanel && (() => {
                    const panels =
                      scene === 'wall'
                        ? [
                            { x: 64, y: 48, w: 248, h: 246 },
                            { x: 356, y: 48, w: 248, h: 246 },
                            { x: 648, y: 48, w: 248, h: 246 },
                          ]
                        : [
                            { x: 118, y: 58, w: 158, h: 222 },
                            { x: 306, y: 58, w: 348, h: 222 },
                            { x: 684, y: 58, w: 158, h: 222 },
                          ];
                    const dadoPanels =
                      scene === 'wall'
                        ? [
                            { x: 64, y: 314, w: 248, h: 68 },
                            { x: 356, y: 314, w: 248, h: 68 },
                            { x: 648, y: 314, w: 248, h: 68 },
                          ]
                        : [
                            { x: 118, y: 300, w: 158, h: 76 },
                            { x: 684, y: 300, w: 158, h: 76 },
                          ];
                    const cornerSz = Math.round(
                      panelBorderW * (moulding.patternKind === 'panel_arch' ? 4.4 : 4.8)
                    );
                    const crownW = Math.round(panelBorderW * 12.5);
                    const crownH = Math.round(crownW * 0.28);

                    const renderRealFrame = (p: { x: number; y: number; w: number; h: number }, key: string, includeCornerOrnaments = true) => {
                      const b = panelBorderW;
                      const clipTopId = `${uid}-${key}-mt`;
                      const clipBotId = `${uid}-${key}-mb`;
                      const clipLeftId = `${uid}-${key}-ml`;
                      const clipRightId = `${uid}-${key}-mr`;
                      return (
                      <g key={key} transform={`translate(${p.x}, ${p.y})`} filter={`url(#${uid}-mould-shadow)`}>
                        {realTexHref ? (
                          <>
                            <defs>
                              <clipPath id={clipTopId}>
                                <polygon points={`0,0 ${p.w},0 ${p.w - b},${b} ${b},${b}`} />
                              </clipPath>
                              <clipPath id={clipBotId}>
                                <polygon points={`${b},${p.h - b} ${p.w - b},${p.h - b} ${p.w},${p.h} 0,${p.h}`} />
                              </clipPath>
                              <clipPath id={clipLeftId}>
                                <polygon points={`0,0 ${b},${b} ${b},${p.h - b} 0,${p.h}`} />
                              </clipPath>
                              <clipPath id={clipRightId}>
                                <polygon points={`${p.w - b},${b} ${p.w},0 ${p.w},${p.h} ${p.w - b},${p.h - b}`} />
                              </clipPath>
                            </defs>
                            {!useTiledPattern ? (
                              <>
                                {/* Top continuous extruded bar */}
                                <g clipPath={`url(#${clipTopId})`}>
                                  <image href={realTexHref} x="0" y="0" width={p.w} height={b} preserveAspectRatio="none" filter={trimFilterAttr} />
                                </g>
                                {/* Bottom continuous bar (mirrored vertically around y = p.h - b/2) */}
                                <g clipPath={`url(#${clipBotId})`}>
                                  <g transform={`translate(${p.w}, ${p.h}) rotate(180)`}>
                                    <image href={realTexHref} x="0" y="0" width={p.w} height={b} preserveAspectRatio="none" filter={trimFilterAttr} />
                                  </g>
                                </g>
                                {/* Left continuous bar (rotated -90 deg) */}
                                <g clipPath={`url(#${clipLeftId})`}>
                                  <g transform={`translate(0, ${p.h}) rotate(-90)`}>
                                    <image href={realTexHref} x="0" y="0" width={p.h} height={b} preserveAspectRatio="none" filter={trimFilterAttr} />
                                  </g>
                                </g>
                                {/* Right continuous bar (rotated 90 deg) */}
                                <g clipPath={`url(#${clipRightId})`}>
                                  <g transform={`translate(${p.w}, 0) rotate(90)`}>
                                    <image href={realTexHref} x="0" y="0" width={p.h} height={b} preserveAspectRatio="none" filter={trimFilterAttr} />
                                  </g>
                                </g>
                              </>
                            ) : (
                              <>
                                <rect x="0" y="0" width={p.w} height={b} fill={`url(#${uid}-pat-rail-h)`} clipPath={`url(#${clipTopId})`} />
                                <rect x="0" y={p.h - b} width={p.w} height={b} fill={`url(#${uid}-pat-rail-h)`} clipPath={`url(#${clipBotId})`} />
                                <rect x="0" y="0" width={b} height={p.h} fill={`url(#${uid}-pat-rail-v)`} clipPath={`url(#${clipLeftId})`} />
                                <rect x={p.w - b} y="0" width={b} height={p.h} fill={`url(#${uid}-pat-rail-v)`} clipPath={`url(#${clipRightId})`} />
                              </>
                            )}
                            {/* True 45° architectural miter lines & subtle outer/inner bevel */}
                            <rect x="0" y="0" width={p.w} height={p.h} fill="none" stroke={trimShadow} strokeOpacity="0.24" strokeWidth="0.7" />
                            {(!includeCornerOrnaments || !cornerHref || moulding.cornerKind === 'crown') && (
                              <g stroke={trimShadow} strokeOpacity="0.32" strokeWidth="0.8">
                                <line x1="0" y1="0" x2={b} y2={b} />
                                <line x1={p.w} y1="0" x2={p.w - b} y2={b} />
                                <line x1="0" y1={p.h} x2={b} y2={p.h - b} />
                                <line x1={p.w} y1={p.h} x2={p.w - b} y2={p.h - b} />
                              </g>
                            )}
                          </>
                        ) : (
                          <rect x="0" y="0" width={p.w} height={p.h} fill="none" stroke={trimHex} strokeWidth={panelBorderW} />
                        )}

                        {/* Real Ornate Corner Pieces OR Royal Arch Crown */}
                        {includeCornerOrnaments && cornerHref && moulding.cornerKind === 'crown' && (
                          <image
                            href={cornerHref}
                            x={p.w / 2 - crownW / 2}
                            y={-crownH * 0.56}
                            width={crownW}
                            height={crownH}
                            preserveAspectRatio="xMidYMid meet"
                            filter={trimFilterAttr}
                          />
                        )}
                        {includeCornerOrnaments && cornerHref && moulding.cornerKind !== 'crown' && (
                          <>
                            {/* Top-Left */}
                            <image
                              href={cornerHref}
                              x={-Math.round(panelBorderW * 0.45)}
                              y={-Math.round(panelBorderW * 0.45)}
                              width={cornerSz}
                              height={cornerSz}
                              preserveAspectRatio="xMinYMin meet"
                              filter={trimFilterAttr}
                            />
                            {/* Top-Right (mirror X around p.w) */}
                            <g transform={`translate(${p.w}, 0) scale(-1, 1)`}>
                              <image
                                href={cornerHref}
                                x={-Math.round(panelBorderW * 0.45)}
                                y={-Math.round(panelBorderW * 0.45)}
                                width={cornerSz}
                                height={cornerSz}
                                preserveAspectRatio="xMinYMin meet"
                                filter={trimFilterAttr}
                              />
                            </g>
                            {/* Bottom-Left (mirror Y around p.h) */}
                            <g transform={`translate(0, ${p.h}) scale(1, -1)`}>
                              <image
                                href={cornerHref}
                                x={-Math.round(panelBorderW * 0.45)}
                                y={-Math.round(panelBorderW * 0.45)}
                                width={cornerSz}
                                height={cornerSz}
                                preserveAspectRatio="xMinYMin meet"
                                filter={trimFilterAttr}
                              />
                            </g>
                            {/* Bottom-Right (mirror XY around p.w, p.h) */}
                            <g transform={`translate(${p.w}, ${p.h}) scale(-1, -1)`}>
                              <image
                                href={cornerHref}
                                x={-Math.round(panelBorderW * 0.45)}
                                y={-Math.round(panelBorderW * 0.45)}
                                width={cornerSz}
                                height={cornerSz}
                                preserveAspectRatio="xMinYMin meet"
                                filter={trimFilterAttr}
                              />
                            </g>
                          </>
                        )}
                      </g>
                      );
                    };

                    return (
                      <g>
                        {/* If vertical 5-piece applique set (FD 19 / FD 15), mount directly in tall flanking bays */}
                        {isVerticalAppliqueSet && realTexHref ? (
                          <>
                            {panels.map((p, idx) => (
                              <g key={`vapp-${idx}`} filter={`url(#${uid}-mould-shadow)`}>
                                <rect x={p.x} y={p.y} width={p.w} height={p.h} fill="none" stroke={trimHex} strokeWidth="6" />
                                <rect x={p.x} y={p.y} width={p.w} height={p.h} fill="none" stroke={trimShadow} strokeOpacity="0.3" strokeWidth="1" />
                                {(idx !== 1 || scene === 'wall') && (
                                  <image
                                    href={realTexHref}
                                    x={p.x + p.w * 0.14}
                                    y={p.y + 12}
                                    width={p.w * 0.72}
                                    height={p.h - 24}
                                    preserveAspectRatio="xMidYMid meet"
                                    filter={trimFilterAttr}
                                  />
                                )}
                              </g>
                            ))}
                          </>
                        ) : isHorizontalApplique && realTexHref ? (
                          /* Horizontal Carved Crown Appliques (FD 1..FD 18) mounted atop sculpted panous */
                          <>
                            {panels.map((p, idx) => (
                              <g key={`happ-${idx}`} filter={`url(#${uid}-mould-shadow)`}>
                                <rect x={p.x} y={p.y} width={p.w} height={p.h} fill="none" stroke={trimHex} strokeWidth="6.5" />
                                <rect x={p.x + 8} y={p.y + 8} width={p.w - 16} height={p.h - 16} fill="none" stroke={trimHex} strokeOpacity="0.7" strokeWidth="2.5" />
                                <image
                                  href={realTexHref}
                                  x={p.x + p.w * 0.12}
                                  y={p.y - Math.round(p.w * 0.12)}
                                  width={p.w * 0.76}
                                  height={Math.round(p.w * 0.28)}
                                  preserveAspectRatio="xMidYMid meet"
                                  filter={trimFilterAttr}
                                />
                              </g>
                            ))}
                            {dadoPanels.map((d, idx) => (
                              <g key={`hdado-${idx}`} filter={`url(#${uid}-mould-shadow)`}>
                                <rect x={d.x} y={d.y} width={d.w} height={d.h} fill="none" stroke={trimHex} strokeWidth="5.5" />
                                <image
                                  href={realTexHref}
                                  x={d.x + d.w * 0.16}
                                  y={d.y + 8}
                                  width={d.w * 0.68}
                                  height={d.h - 16}
                                  preserveAspectRatio="xMidYMid meet"
                                  filter={trimFilterAttr}
                                />
                              </g>
                            ))}
                          </>
                        ) : (
                          /* Standard / Ornate Corner / Arch Panous with real rail texture */
                          <>
                            {panels.map((p, idx) => renderRealFrame(p, `pan-${idx}`, true))}
                            {!isDadoDivider && dadoPanels.map((d, idx) => renderRealFrame(d, `dado-${idx}`, false))}
                          </>
                        )}
                      </g>
                    );
                  })()}

                {/* 4. Framed Architectural Doorway (DF 93 / DF 12 / DF 13 / FD 75 / FD 22 / FD 90) */}
                {moulding.patternKind === 'door_frame' && (
                  <g filter={`url(#${uid}-mould-shadow)`}>
                    {moulding.code === 'DF 93' && realTexHref ? (
                      <image
                        href={realTexHref}
                        x="104"
                        y="56"
                        width="162"
                        height="344"
                        preserveAspectRatio="xMidYMax meet"
                        filter={trimFilterAttr}
                      />
                    ) : (moulding.code.startsWith('DF 12') || moulding.code.startsWith('DF 13')) && realTexHref ? (
                      <g>
                        {/* Pediment header */}
                        <rect x="108" y="64" width="152" height="18" fill={trimHex} stroke={trimShadow} strokeWidth="1" />
                        {/* Door Leaf */}
                        <rect x="128" y="82" width="112" height="314" fill={wallAccentHex} fillOpacity="0.18" />
                        <rect x="128" y="82" width="112" height="314" fill={trimHex} fillOpacity="0.88" />
                        {/* Real Carved Jambs on Left, Right, Top */}
                        <image href={realTexHref} x="112" y="82" width="22" height="314" preserveAspectRatio="none" filter={trimFilterAttr} />
                        <image href={realTexHref} x="234" y="82" width="22" height="314" preserveAspectRatio="none" filter={trimFilterAttr} />
                        <circle cx="226" cy="240" r="4.5" fill="#B69567" />
                      </g>
                    ) : (
                      <g>
                        <rect x="116" y="72" width="144" height="328" fill={trimHex} stroke={trimShadow} strokeWidth="1.5" />
                        <rect x="108" y="60" width="160" height="14" rx="2" fill={trimHex} stroke={trimShadow} strokeWidth="1.5" />
                        <rect x="132" y="88" width="112" height="310" fill={trimHex} />
                        {realTexHref ? (
                          <>
                            <image
                              href={realTexHref}
                              x="144"
                              y="102"
                              width="88"
                              height={moulding.code === 'FD 22' ? 42 : 124}
                              preserveAspectRatio="xMidYMid meet"
                              filter={trimFilterAttr}
                            />
                            <image
                              href={realTexHref}
                              x="144"
                              y="246"
                              width="88"
                              height={moulding.code === 'FD 22' ? 42 : 130}
                              preserveAspectRatio="xMidYMid meet"
                              filter={trimFilterAttr}
                            />
                          </>
                        ) : (
                          <>
                            <rect x="148" y="106" width="80" height="122" fill="none" stroke={trimShadow} strokeWidth="3.5" />
                            <rect x="148" y="246" width="80" height="128" fill="none" stroke={trimShadow} strokeWidth="3.5" />
                          </>
                        )}
                        <circle cx="228" cy="242" r="5" fill="#B69567" />
                      </g>
                    )}
                  </g>
                )}

                {/* 5. Vertical Corner Angles (RT32 / KB 21..115) */}
                {moulding.patternKind === 'angle' && (
                  <g filter={`url(#${uid}-mould-shadow)`}>
                    {[scene === 'wall' ? 32 : 80, 926].map((ax, idx) =>
                      realTexHref ? (
                        <image
                          key={idx}
                          href={realTexHref}
                          x={ax}
                          y="24"
                          width={moulding.widthTier === 'wide' ? 28 : 22}
                          height="396"
                          preserveAspectRatio="none"
                          filter={trimFilterAttr}
                        />
                      ) : (
                        <g key={idx}>
                          <rect x={ax} y="24" width="22" height="396" fill={trimHex} stroke={trimShadow} strokeOpacity="0.5" strokeWidth="1.2" />
                        </g>
                      )
                    )}
                  </g>
                )}

                {/* 6. Classical Fluted Columns & Corbel Consoles */}
                {(moulding.patternKind === 'column' || moulding.patternKind === 'console') && (
                  <g filter={`url(#${uid}-mould-shadow)`}>
                    {moulding.patternKind === 'column' && realTexHref ? (
                      <>
                        <image
                          href={realTexHref}
                          x="96"
                          y="28"
                          width="72"
                          height="368"
                          preserveAspectRatio="xMidYMid meet"
                          filter={trimFilterAttr}
                        />
                        <image
                          href={realTexHref}
                          x="792"
                          y="28"
                          width="72"
                          height="368"
                          preserveAspectRatio="xMidYMid meet"
                          filter={trimFilterAttr}
                        />
                      </>
                    ) : moulding.patternKind === 'console' && realTexHref ? (
                      <>
                        <image
                          href={realTexHref}
                          x="108"
                          y="34"
                          width={Math.round(52 * tierScale)}
                          height={Math.round(78 * tierScale)}
                          preserveAspectRatio="xMidYMin meet"
                          filter={trimFilterAttr}
                        />
                        <g transform="translate(852, 0) scale(-1, 1)">
                          <image
                            href={realTexHref}
                            x="0"
                            y="34"
                            width={Math.round(52 * tierScale)}
                            height={Math.round(78 * tierScale)}
                            preserveAspectRatio="xMidYMin meet"
                            filter={trimFilterAttr}
                          />
                        </g>
                      </>
                    ) : null}
                  </g>
                )}
              </g>
            )}

            {/* ===================== ROOM FURNITURE & DECOR PROPS ===================== */}
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

            {scene === 'salon' && (
              <g>
                <rect x="224" y="150" width="8" height="44" rx="3" fill="#B69567" />
                <polygon points="214,152 242,152 236,126 220,126" fill={lighting === 'warm' ? '#FEF3C7' : '#F8FAFC'} />
                <rect x="728" y="150" width="8" height="44" rx="3" fill="#B69567" />
                <polygon points="718,152 746,152 740,126 724,126" fill={lighting === 'warm' ? '#FEF3C7' : '#F8FAFC'} />

                <rect x="408" y="88" width="144" height="174" rx="72" fill="#B69567" stroke="#8A6B3F" strokeWidth="2" />
                <rect x="418" y="98" width="124" height="154" rx="62" fill="#EAE6DC" />
                <ellipse cx="465" cy="145" rx="34" ry="52" fill="#FFFFFF" fillOpacity="0.32" />

                <ellipse cx="480" cy="488" rx="260" ry="26" fill="#D6CEC0" stroke="#B69567" strokeWidth="2" />
                <ellipse cx="480" cy="456" rx="210" ry="13" fill="#0f172a" fillOpacity="0.24" filter={`url(#${uid}-soft-shadow)`} />
                <path d="M286,396 Q290,294 370,294 Q480,276 590,294 Q670,294 674,396 Z" fill="#EFEAE1" stroke="#B69567" strokeWidth="4" />
                <rect x="304" y="362" width="116" height="42" rx="10" fill="#F8F5EE" stroke="#D5CEC0" strokeWidth="1" />
                <rect x="422" y="362" width="116" height="42" rx="10" fill="#F8F5EE" stroke="#D5CEC0" strokeWidth="1" />
                <rect x="540" y="362" width="116" height="42" rx="10" fill="#F8F5EE" stroke="#D5CEC0" strokeWidth="1" />
                <rect x="284" y="400" width="392" height="16" rx="5" fill="#C4A476" />
                <rect x="306" y="416" width="10" height="34" rx="2" fill="#9A794C" />
                <rect x="644" y="416" width="10" height="34" rx="2" fill="#9A794C" />
                <rect x="318" y="324" width="44" height="40" rx="8" fill="#8C624A" transform="rotate(-6 340 344)" />
                <rect x="598" y="324" width="44" height="40" rx="8" fill="#8C624A" transform="rotate(6 620 344)" />

                <ellipse cx="480" cy="492" rx="92" ry="8" fill="#0f172a" fillOpacity="0.2" filter={`url(#${uid}-soft-shadow)`} />
                <rect x="422" y="454" width="6" height="34" fill="#B69567" />
                <rect x="532" y="454" width="6" height="34" fill="#B69567" />
                <rect x="396" y="443" width="168" height="11" rx="5" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
              </g>
            )}

            {scene === 'kids' && (
              <g>
                <rect x="328" y="114" width="96" height="118" rx="10" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
                <rect x="338" y="124" width="76" height="98" rx="6" fill="#E0F2FE" />
                <circle cx="376" cy="166" r="18" fill="#FBBF24" />
                <rect x="536" y="114" width="96" height="118" rx="10" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
                <rect x="546" y="124" width="76" height="98" rx="6" fill="#FEF3C7" />
                <ellipse cx="584" cy="172" rx="22" ry="12" fill="#FFFFFF" />
                <rect x="148" y="218" width="132" height="10" rx="4" fill="#C49A6C" />
                <rect x="172" y="182" width="22" height="36" rx="4" fill="#3B82F6" />
                <rect x="200" y="190" width="26" height="28" rx="4" fill="#F59E0B" />
                <circle cx="246" cy="202" r="14" fill="#10B981" />

                <ellipse cx="480" cy="456" rx="164" ry="14" fill="#0f172a" fillOpacity="0.22" filter={`url(#${uid}-soft-shadow)`} />
                <rect x="344" y="264" width="272" height="108" rx="16" fill="#B9D7EA" stroke="#7FA8C4" strokeWidth="2" />
                <rect x="392" y="314" width="176" height="52" rx="12" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
                <rect x="340" y="358" width="280" height="84" rx="10" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
                <rect x="340" y="394" width="280" height="48" rx="8" fill="#FDE68A" />
                <rect x="358" y="442" width="14" height="14" fill="#9A734C" />
                <rect x="588" y="442" width="14" height="14" fill="#9A734C" />
                <rect x="668" y="366" width="70" height="66" rx="10" fill="#C49A6C" />
                <rect x="698" y="340" width="10" height="26" fill="#475569" />
                <polygon points="682,342 724,342 716,312 690,312" fill={lighting === 'warm' ? '#FEF08A' : '#FFFFFF'} stroke="#CBD5E1" strokeWidth="1" />
              </g>
            )}

            {scene === 'kitchen' && (
              <g>
                <rect x="132" y="114" width="204" height="114" rx="4" fill="#F1EFEA" stroke="#CBD5E1" strokeWidth="1.5" />
                <line x1="234" y1="114" x2="234" y2="228" stroke="#CBD5E1" strokeWidth="1.5" />
                <rect x="624" y="114" width="204" height="114" rx="4" fill="#F1EFEA" stroke="#CBD5E1" strokeWidth="1.5" />
                <line x1="726" y1="114" x2="726" y2="228" stroke="#CBD5E1" strokeWidth="1.5" />
                <rect x="458" y="42" width="44" height="112" fill="#334155" />
                <polygon points="416,184 544,184 510,154 450,154" fill="#1E293B" />
                <rect x="132" y="302" width="696" height="130" fill="#4E5B61" stroke="#334155" strokeWidth="1.5" />
                <line x1="270" y1="302" x2="270" y2="432" stroke="#334155" strokeWidth="1.5" />
                <line x1="410" y1="302" x2="410" y2="432" stroke="#334155" strokeWidth="1.5" />
                <line x1="550" y1="302" x2="550" y2="432" stroke="#334155" strokeWidth="1.5" />
                <line x1="690" y1="302" x2="690" y2="432" stroke="#334155" strokeWidth="1.5" />
                <rect x="124" y="292" width="712" height="12" rx="2" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
                <path d="M214,292 L214,264 Q224,254 234,266" stroke="#94A3B8" strokeWidth="4" fill="none" />
                <rect x="440" y="286" width="80" height="6" rx="2" fill="#0F172A" />
                <rect x="652" y="264" width="28" height="28" rx="4" fill="#1E293B" />
                <rect x="720" y="272" width="16" height="20" rx="3" fill="#D9C08C" />
              </g>
            )}

            {scene === 'bathroom' && (
              <g>
                <ellipse cx="480" cy="184" rx="68" ry="86" fill="#FFFFFF" fillOpacity={lighting === 'warm' ? '0.65' : '0.45'} filter={`url(#${uid}-soft-shadow)`} />
                <ellipse cx="480" cy="184" rx="58" ry="76" fill="#DBEAFE" stroke="#B69567" strokeWidth="4" />
                <ellipse cx="464" cy="158" rx="22" ry="38" fill="#FFFFFF" fillOpacity="0.45" />
                <rect x="372" y="316" width="216" height="82" rx="6" fill="#8C6B4E" stroke="#5E4530" strokeWidth="1.5" />
                <line x1="480" y1="316" x2="480" y2="398" stroke="#5E4530" strokeWidth="1.5" />
                <rect x="366" y="306" width="228" height="12" rx="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
                <rect x="444" y="284" width="72" height="22" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                <path d="M480,306 L480,270 Q488,262 496,272" stroke="#B69567" strokeWidth="4" fill="none" />
                <rect x="136" y="138" width="142" height="282" fill="#E0F2FE" fillOpacity="0.28" stroke="#64748B" strokeWidth="3" />
                <line x1="206" y1="142" x2="206" y2="236" stroke="#475569" strokeWidth="4" />
                <rect x="194" y="168" width="24" height="5" rx="2" fill="#334155" />
                <g stroke="#334155" strokeWidth="3.5">
                  <line x1="704" y1="210" x2="704" y2="320" />
                  <line x1="780" y1="210" x2="780" y2="320" />
                  <line x1="704" y1="228" x2="780" y2="228" />
                  <line x1="704" y1="262" x2="780" y2="262" />
                  <line x1="704" y1="296" x2="780" y2="296" />
                </g>
                <rect x="714" y="264" width="56" height="44" rx="4" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
              </g>
            )}

            {/* ===================== FOREGROUND CEILING & FLOOR ARCHITECTURAL MOULDINGS ===================== */}
            {moulding && (
              <g pointerEvents="none">
                {/* 7. Real Ceiling Corniches (Rendered OVER wall/cabinet tops cleanly) */}
                {(moulding.patternKind === 'corniche_plain' ||
                  moulding.patternKind === 'corniche_ornate' ||
                  moulding.patternKind === 'corniche_light' ||
                  moulding.patternKind === 'exterior_corniche') && (() => {
                  const baseY = scene === 'wall' ? 0 : 22;
                  const startX = scene === 'wall' ? 0 : 92;
                  const widthX = scene === 'wall' ? 960 : 868;
                  const isLight = moulding.patternKind === 'corniche_light';
                  return (
                    <g filter={`url(#${uid}-mould-shadow)`}>
                      {isLight && (
                        <rect
                          x={startX}
                          y={baseY}
                          width={widthX}
                          height={corniceH + 68}
                          fill={`url(#${uid}-led-wash)`}
                        />
                      )}
                      {/* Left angled return perspective */}
                      {scene !== 'wall' && (
                        <g transform="skewY(13.45)">
                          {realTexHref && !useTiledPattern ? (
                            <image
                              href={realTexHref}
                              x="0"
                              y="0"
                              width="92"
                              height={corniceH}
                              preserveAspectRatio="none"
                              filter={trimFilterAttr}
                            />
                          ) : (
                            <rect
                              x="0"
                              y="0"
                              width="92"
                              height={corniceH}
                              fill={realTexHref ? `url(#${uid}-pat-cornice-ret)` : trimHex}
                            />
                          )}
                        </g>
                      )}
                      {/* Main straight cornice with real photographic molding */}
                      {realTexHref && !useTiledPattern ? (
                        <image
                          href={realTexHref}
                          x={startX}
                          y={baseY}
                          width={widthX}
                          height={corniceH}
                          preserveAspectRatio="none"
                          filter={trimFilterAttr}
                        />
                      ) : (
                        <rect
                          x={startX}
                          y={baseY}
                          width={widthX}
                          height={corniceH}
                          fill={realTexHref ? `url(#${uid}-pat-cornice)` : trimHex}
                        />
                      )}
                      {scene !== 'wall' && (
                        <line
                          x1={startX}
                          y1={baseY}
                          x2={startX}
                          y2={baseY + corniceH}
                          stroke={trimShadow}
                          strokeOpacity="0.28"
                          strokeWidth="1"
                        />
                      )}
                      <line
                        x1={startX}
                        y1={baseY + corniceH}
                        x2="960"
                        y2={baseY + corniceH}
                        stroke={trimShadow}
                        strokeOpacity="0.35"
                        strokeWidth="1.2"
                      />
                    </g>
                  );
                })()}

                {/* 8. Ceiling Rosette Medallion (Transparent Floodfilled Real PNG Cutout!) */}
                {moulding.patternKind === 'medallion' && (() => {
                  const cx = 480;
                  const cy = scene === 'wall' ? 195 : 54;
                  const rx = scene === 'wall' ? 132 : 114;
                  const ry = scene === 'wall' ? 132 : 31;
                  return (
                    <g filter={`url(#${uid}-mould-shadow)`}>
                      {realTexHref ? (
                        <image
                          href={realTexHref}
                          x={cx - rx}
                          y={cy - ry}
                          width={rx * 2}
                          height={ry * 2}
                          preserveAspectRatio={scene === 'wall' ? 'xMidYMid meet' : 'none'}
                          filter={trimFilterAttr}
                        />
                      ) : (
                        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={trimHex} stroke={trimShadow} strokeWidth="2" />
                      )}
                      {scene !== 'wall' && (
                        <>
                          <line x1={cx} y1={cy} x2={cx} y2={cy + 42} stroke="#1E293B" strokeWidth="2.5" />
                          <circle cx={cx} cy={cy + 46} r="10" fill={lighting === 'warm' ? '#FDE68A' : '#FFFFFF'} stroke="#B69567" strokeWidth="2" />
                        </>
                      )}
                    </g>
                  );
                })()}

                {/* 9. Real Floor Skirting / Baseboard (Layered cleanly over bottom room trim) */}
                {(moulding.patternKind === 'skirting' ||
                  moulding.patternKind === 'skirting_led') && (() => {
                  const baseTop = (scene === 'wall' ? 432 : 420) - skirtingH;
                  const startX = scene === 'wall' ? 0 : 92;
                  const widthX = scene === 'wall' ? 960 : 868;
                  return (
                    <g filter={`url(#${uid}-mould-shadow)`}>
                      {moulding.patternKind === 'skirting_led' && (
                        <rect x={startX} y={baseTop - 30} width={widthX} height="32" fill={`url(#${uid}-led-up)`} />
                      )}
                      {scene !== 'wall' && (
                        <g transform={`translate(0, ${baseTop + 26}) skewY(-15.78)`}>
                          {realTexHref ? (
                            <image
                              href={realTexHref}
                              x="0"
                              y="0"
                              width="92"
                              height={skirtingH}
                              preserveAspectRatio="none"
                              filter={trimFilterAttr}
                            />
                          ) : (
                            <rect x="0" y="0" width="92" height={skirtingH} fill={trimHex} />
                          )}
                        </g>
                      )}
                      {realTexHref ? (
                        <image
                          href={realTexHref}
                          x={startX}
                          y={baseTop}
                          width={widthX}
                          height={skirtingH}
                          preserveAspectRatio="none"
                          filter={trimFilterAttr}
                        />
                      ) : (
                        <rect x={startX} y={baseTop} width={widthX} height={skirtingH} fill={trimHex} />
                      )}
                      {scene !== 'wall' && (
                        <line
                          x1={startX}
                          y1={baseTop}
                          x2={startX}
                          y2={baseTop + skirtingH}
                          stroke={trimShadow}
                          strokeOpacity="0.28"
                          strokeWidth="1"
                        />
                      )}
                      {moulding.patternKind === 'skirting_led' && (
                        <rect
                          x={startX}
                          y={baseTop + skirtingH - 3.5}
                          width={widthX}
                          height="3.5"
                          fill={lighting === 'warm' ? '#FDE68A' : '#E0F2FE'}
                        />
                      )}
                    </g>
                  );
                })()}
              </g>
            )}

            {/* SPLIT COMPARE DIVIDER */}
            {isSplit && compareShade && (
              <g>
                <line x1="480" y1="0" x2="480" y2="420" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="6 4" />
                <line x1="480" y1="0" x2="480" y2="420" stroke="#0F172A" strokeOpacity="0.25" strokeWidth="1" />
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
};
