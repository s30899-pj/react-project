import type { IconType } from 'react-icons'
import {
  LuBrush,
  LuEraser,
  LuSlash,
  LuSquare,
  LuCircle,
  LuPaintBucket,
  LuStamp,
  LuHand,
  LuMousePointer2,
  LuFlag,
  LuRoute,
  LuMountain,
  LuTrees,
  LuShieldBan,
  LuSparkles,
  LuPuzzle,
} from 'react-icons/lu'
import type { LayerType, ToolId } from '@/types'

export {
  LuBrush as BrushIcon,
  LuEraser as EraserIcon,
  LuSquare as SquareIcon,
  LuCircle as CircleIcon,
  LuPaintBucket as FillIcon,
  LuStamp as CloneIcon,
  LuHand as HandIcon,
  LuUndo2 as UndoIcon,
  LuRedo2 as RedoIcon,
  LuZoomIn as ZoomInIcon,
  LuZoomOut as ZoomOutIcon,
  LuRotateCw as RotateIcon,
  LuBox as IsoIcon,
  LuCrosshair as CenterIcon,
  LuMaximize as FullscreenIcon,
  LuBookmark as SnapshotIcon,
  LuSave as SaveIcon,
  LuLayers as LayersIcon,
  LuTrees as ObjectsIcon,
  LuPuzzle as LogicIcon,
  LuSettings2 as SettingsIcon,
  LuClipboardCheck as ValidateIcon,
  LuPackage as ExportIcon,
  LuEye as EyeIcon,
  LuEyeOff as EyeOffIcon,
  LuLock as LockIcon,
  LuLockOpen as UnlockIcon,
  LuArrowUp as ArrowUpIcon,
  LuArrowDown as ArrowDownIcon,
  LuCopyPlus as DuplicateIcon,
  LuCombine as MergeIcon,
  LuTrash2 as TrashIcon,
  LuPaintbrush as ClearIcon,
  LuFlipHorizontal2 as FlipHorizontalIcon,
  LuFlipVertical2 as FlipVerticalIcon,
  LuRotateCw as RotateLayerIcon,
  LuPlus as PlusIcon,
  LuSun as SunIcon,
  LuMoon as MoonIcon,
  LuUser as UserIcon,
  LuLogOut as LogoutIcon,
  LuCheck as CheckIcon,
  LuX as CloseIcon,
  LuInfo as InfoIcon,
  LuTriangleAlert as WarningIcon,
  LuPalette as PaletteIcon,
  LuFlaskConical as FlaskIcon,
  LuShieldBan as CollisionIcon,
  LuShield as ShieldIcon,
  LuDownload as DownloadIcon,
  LuSearch as SearchIcon,
  LuFolderOpen as OpenIcon,
  LuMountain as TerrainIcon,
  LuSparkles as EffectIcon,
  LuRotateCcw as RestoreIcon,
} from 'react-icons/lu'

export { FaGithub as GithubIcon, FaDiscord as DiscordIcon } from 'react-icons/fa6'
export { FcGoogle as GoogleIcon } from 'react-icons/fc'

const TOOL_ICONS: Record<ToolId, IconType> = {
  brush: LuBrush,
  erase: LuEraser,
  line: LuSlash,
  rect: LuSquare,
  circle: LuCircle,
  fill: LuPaintBucket,
  clone: LuStamp,
  pan: LuHand,
  select: LuMousePointer2,
  region: LuFlag,
  path: LuRoute,
}

const LAYER_ICONS: Record<LayerType, IconType> = {
  terrain: LuMountain,
  object: LuTrees,
  collision: LuShieldBan,
  effect: LuSparkles,
  logic: LuPuzzle,
}

export function ToolIcon({ tool, size = 18 }: { tool: ToolId; size?: number }) {
  const Icon = TOOL_ICONS[tool]
  return <Icon size={size} aria-hidden />
}

ToolIcon.displayName = 'ToolIcon'

export function LayerTypeIcon({ type, size = 16 }: { type: LayerType; size?: number }) {
  const Icon = LAYER_ICONS[type]
  return <Icon size={size} aria-hidden />
}

LayerTypeIcon.displayName = 'LayerTypeIcon'
