export const WORLD_W   = 3200
export const WORLD_H   = 1280
export const WALL_H    = 260   // 牆面高度
export const GATE_X    = 1600  // 大門中心 X
export const GATE_DOOR = 1250  // 人物站在門口的 Y
export const GATE_OFF  = 1298  // 畫面外

export const R    = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a
export const PICK = a => a[R(0, a.length - 1)]
