import Phaser from 'phaser'
import { guildStore } from '../store/guild'
import { WORLD_W, WORLD_H, WALL_H, GATE_X, GATE_DOOR, GATE_OFF, R } from './constants'
import { hashPalette } from './palette'

function addLog(action, username) {
  const t = new Date().toLocaleTimeString('zh-TW', { hour12: false })
  guildStore.logEntries.push({
    css:  action.css,
    text: `[${t}]  ${action.icon}  ${username}  ${action.msg}`,
  })
  if (guildStore.logEntries.length > 4) {
    guildStore.logEntries.splice(0, guildStore.logEntries.length - 4)
  }
}

export class Guild extends Phaser.Scene {
  constructor() {
    super('G')
    this.roster = new Map()
  }

  create() {
    this.drawHall()
    this.waitMsg = this.add.text(WORLD_W / 2, WORLD_H / 2, '等待成員加入...', {
      fontSize: '16px', fontFamily: 'monospace', color: '#444444',
    }).setOrigin(0.5).setDepth(30)

    // ── 攝影機 ──────────────────────────────────────────────────
    const cam = this.cameras.main
    cam.setBounds(0, 0, WORLD_W, WORLD_H)
    cam.setScroll(WORLD_W / 2 - 400, 0)

    this.followTarget = null
    this.drag         = null
    this.selRing      = this.add.graphics().setDepth(18)

    // 拖曳平移（未追蹤時）
    this.input.on('pointerdown', (ptr, gameObjects) => {
      if (gameObjects.length === 0 && !this.followTarget) {
        this.drag = { x: ptr.x, y: ptr.y, sx: cam.scrollX, sy: cam.scrollY }
      }
    })
    this.input.on('pointermove', (ptr) => {
      if (!this.drag || this.followTarget) return
      cam.setScroll(
        this.drag.sx - (ptr.x - this.drag.x) / cam.zoom,
        this.drag.sy - (ptr.y - this.drag.y) / cam.zoom,
      )
    })
    this.input.on('pointerup', () => { this.drag = null })

    // 滾輪縮放
    this.input.on('wheel', (ptr, objs, dx, dy) => {
      cam.setZoom(Phaser.Math.Clamp(cam.zoom - dy * 0.001, 0.25, 2))
    })

    window._guild = this
    if (guildStore.pendingInitMembers) {
      this.initMembers(guildStore.pendingInitMembers)
      guildStore.pendingInitMembers = null
    }
  }

  update(time) {
    if (this.followTarget) {
      const c     = this.followTarget
      const pulse = 0.4 + 0.6 * Math.abs(Math.sin(time * 0.003))
      this.selRing.clear()
      this.selRing.lineStyle(2.5, 0x58a6ff, pulse)
      this.selRing.strokeCircle(c.x, c.y - 10, 26)
    }
    this.updateMinimap()
  }

  // ── 攝影機追蹤 ────────────────────────────────────────────────
  followChar(c) {
    if (this.followTarget === c) { this.unlockCamera(); return }
    this.followTarget = c
    this.cameras.main.startFollow(c, true, 0.08, 0.08)
    guildStore.followName = c.username
    guildStore.following  = true
  }

  unlockCamera() {
    this.followTarget = null
    this.cameras.main.stopFollow()
    this.selRing.clear()
    guildStore.following  = false
    guildStore.followName = ''
  }

  // ── 小地圖 ───────────────────────────────────────────────────
  updateMinimap() {
    const canvas = document.getElementById('minimap')
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const mw = canvas.width, mh = canvas.height
    const cam = this.cameras.main

    ctx.fillStyle = '#0d1117'
    ctx.fillRect(0, 0, mw, mh)

    const sx = mw / WORLD_W, sy = mh / WORLD_H
    ctx.fillStyle = '#2a1a0a'
    ctx.fillRect(0, 0, mw, Math.round(WALL_H * sy))
    ctx.fillStyle = '#3a2a0a'
    ctx.fillRect(0, Math.round(WALL_H * sy), mw, mh - Math.round(WALL_H * sy))

    const vx = cam.scrollX * sx
    const vy = cam.scrollY * sy
    const vw = (cam.width  / cam.zoom) * sx
    const vh = (cam.height / cam.zoom) * sy
    ctx.fillStyle = 'rgba(88,166,255,0.15)'
    ctx.fillRect(vx, vy, vw, vh)
    ctx.strokeStyle = '#58a6ff'
    ctx.lineWidth = 1
    ctx.strokeRect(Math.round(vx) + 0.5, Math.round(vy) + 0.5, Math.round(vw), Math.round(vh))

    if (this.followTarget) {
      ctx.fillStyle = '#f5d076'
      ctx.beginPath()
      ctx.arc(this.followTarget.x * sx, this.followTarget.y * sy, 2.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // ── 成員管理 ─────────────────────────────────────────────────
  initMembers(list) {
    list.forEach(u => this.addMember(u))
  }

  addMember(username) {
    if (this.roster.has(username)) return
    if (this.waitMsg) { this.waitMsg.destroy(); this.waitMsg = null }
    this._spawnChar(username)
    guildStore.memberCount = this.roster.size
  }

  removeMember(username) {
    const c = this.roster.get(username)
    if (!c) return
    if (this.followTarget === c) this.unlockCamera()
    this.roster.delete(username)
    guildStore.memberCount = this.roster.size
    c.timer?.destroy()
    this.tweens.killTweensOf(c)
    this.tweens.add({ targets: c, alpha: 0, duration: 400, onComplete: () => c.destroy() })
  }

  pushServerEvent({ actor, anonymous, action }) {
    if (!action) return
    if (anonymous) {
      const target = this.roster.get(action.targetActor)
      if (target) this._spawnAnonymous(actor, action)
      return
    }
    if (!this.roster.has(actor)) this.addMember(actor)
    const c = this.roster.get(actor)
    if (!c) return
    c.evQueue.push(action)
    if (!c.qRunning) this._runCharQueue(c)
  }

  // ── 每人事件佇列 ─────────────────────────────────────────────
  _runCharQueue(c) {
    if (!c.evQueue.length) { c.qRunning = false; this.idle(c); return }
    c.qRunning = true
    if (c.alpha < 1) { this.time.delayedCall(200, () => this._runCharQueue(c)); return }

    const action = c.evQueue.shift()
    c.timer?.destroy()
    this.tweens.killTweensOf(c)

    const next = () => this.time.delayedCall(400, () => this._runCharQueue(c))

    if (!action.targetActor) {
      this.popup(c, action.icon + ' ' + action.msg, action.col, () => {
        addLog(action, c.username); next()
      })
    } else if (this.roster.has(action.targetActor)) {
      const target = this.roster.get(action.targetActor)
      this.chase(c, target, () => {
        this.popup(c, action.icon + ' ' + action.msg, action.col, () => {
          addLog(action, c.username); next()
        })
      })
    } else {
      this.go(c, GATE_X, GATE_DOOR, () => {
        this.popup(c, action.icon + ' ' + action.msg, action.col, () => {
          addLog(action, c.username)
          this.tweens.add({
            targets: c, y: GATE_OFF, alpha: 0, duration: 500,
            onComplete: () => this.time.delayedCall(R(2000, 4000), () => {
              c.setPosition(GATE_X, GATE_OFF).setAlpha(0)
              this.tweens.add({
                targets: c, alpha: 1, duration: 300,
                onComplete: () => this.go(c, R(200, WORLD_W - 200), R(290, WORLD_H - 80), () => {
                  this.time.delayedCall(300, () => this._runCharQueue(c))
                }),
              })
            }),
          })
        })
      })
    }
  }

  // ── 匿名訪客 ─────────────────────────────────────────────────
  _spawnAnonymous(actorName, action) {
    const target = this.roster.get(action.targetActor)
    if (!target) return
    const c = this.add.container(GATE_X, GATE_OFF).setDepth(5).setAlpha(0)
    const g = this.add.graphics()
    g.fillStyle(0x555555, 0.65); g.fillRect(-7, 9, 6, 14); g.fillRect(1, 9, 6, 14)
    g.fillStyle(0x444444, 1);    g.fillRoundedRect(-11, -12, 22, 22, 3)
    g.fillStyle(0x666666, 1);    g.fillCircle(0, -22, 13)
    g.fillStyle(0x888888);       g.fillCircle(-4, -23, 2.5); g.fillCircle(4, -23, 2.5)
    g.fillStyle(0xcccccc);       g.fillCircle(-3, -24, 1);   g.fillCircle(5, -24, 1)
    const lbl = this.add.text(0, 14, '???', {
      fontSize: '9px', fontFamily: 'monospace', color: '#aaa', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5, 0)
    c.add([g, lbl]); c.gfx = g
    this.tweens.add({
      targets: c, alpha: 1, duration: 300,
      onComplete: () => this.chase(c, target, () => {
        this.popup(c, action.icon + ' ' + action.msg, action.col, () => {
          addLog(action, actorName)
          this.go(c, GATE_X, GATE_DOOR, () => {
            this.tweens.add({
              targets: c, y: GATE_OFF, alpha: 0, duration: 400,
              onComplete: () => c.destroy(),
            })
          })
        })
      }),
    })
  }

  // ── 場景繪製 ─────────────────────────────────────────────────
  drawHall() {
    const g = this.add.graphics()

    // 牆面
    g.fillStyle(0x5a3118); g.fillRect(0, 0, WORLD_W, WALL_H)
    g.lineStyle(1, 0x3d2007, 0.4)
    for (let y = 0; y < WALL_H; y += 48) {
      const odd = Math.floor(y / 48) % 2
      for (let x = odd ? -60 : 0; x < WORLD_W; x += 120) g.strokeRect(x, y, 120, 48)
    }

    // 地板
    g.fillStyle(0x9b7422); g.fillRect(0, WALL_H, WORLD_W, WORLD_H - WALL_H)
    g.lineStyle(1, 0x886219, 0.35)
    for (let y = WALL_H + 36; y < WORLD_H; y += 36) g.lineBetween(0, y, WORLD_W, y)
    for (let x = 0; x < WORLD_W; x += 70)            g.lineBetween(x, WALL_H, x, WORLD_H)

    // 牆地交界
    g.fillStyle(0x3d2007); g.fillRect(0, WALL_H - 8, WORLD_W, 8)

    // 窗戶
    for (let wx = 220; wx < WORLD_W - 100; wx += 500) {
      g.fillStyle(0x3d2007);      g.fillRect(wx - 5, 18, 90, 176)
      g.fillStyle(0x87ceeb, 0.5); g.fillRect(wx, 23, 80, 171)
      g.fillStyle(0x3d2007);      g.fillRect(wx + 37, 23, 6, 171); g.fillRect(wx, 108, 80, 5)
      g.fillStyle(0xffffff, 0.04)
      g.fillTriangle(wx + 40, 194, wx - 20, WALL_H, wx + 100, WALL_H)
    }

    // 公告欄
    g.fillStyle(0x6b3e1e); g.fillRect(100, 80, 150, 140)
    g.fillStyle(0xd4b483); g.fillRect(107, 87, 136, 126)
    ;[[112, 92, 56, 32], [172, 92, 60, 32], [112, 132, 126, 28]].forEach(([x, y, w, h]) => {
      g.fillStyle(0xfff9e6); g.fillRect(x, y, w, h)
    })
    g.fillStyle(0xcc3333); g.fillCircle(160, 87, 5)
    this.add.text(160, 80, '公告欄', {
      fontSize: '12px', fontFamily: 'serif', color: '#c8a050', stroke: '#3d2007', strokeThickness: 2,
    }).setOrigin(0.5, 1)

    // 壁爐
    for (const fx of [600, 1600, 2600]) {
      g.fillStyle(0x4a2810); g.fillRect(fx - 55, 90, 110, WALL_H - 90)
      g.fillStyle(0x111111); g.fillRect(fx - 42, 110, 84, WALL_H - 110)
      g.fillStyle(0x5a3118); g.fillRect(fx - 63, 82, 126, 12)
      const gl = this.add.graphics().setDepth(1)
      gl.fillStyle(0xff7700, 0.05); gl.fillCircle(fx, WALL_H, 180)
    }
    this.firePositions = [600, 1600, 2600]
    this.fireG = this.add.graphics().setDepth(2)
    this.time.addEvent({ delay: 85, loop: true, callback: this.flicker, callbackScope: this })

    // 桌子
    for (const [tx, ty] of [
      [500, 380], [900, 520], [1300, 400], [1700, 560], [2100, 420], [2500, 500], [2900, 380],
      [700, 800], [1100, 950], [1500, 820], [1900, 900], [2300, 780], [2700, 880],
    ]) {
      g.fillStyle(0x6b3e1e)
      g.fillRect(tx - 70, ty + 32, 12, 40); g.fillRect(tx + 58, ty + 32, 12, 40)
      g.fillStyle(0x8b5a2b); g.fillRect(tx - 80, ty, 172, 32)
      g.lineStyle(1, 0xb8845a, 0.4); g.lineBetween(tx - 74, ty + 6, tx + 80, ty + 6)
    }

    // 大廳標題
    this.add.text(WORLD_W / 2, 16, '── G U I L D   H A L L ──', {
      fontSize: '18px', fontFamily: 'Georgia, serif',
      color: '#f5d076', stroke: '#3d2007', strokeThickness: 4,
    }).setOrigin(0.5)

    // 大門
    g.fillStyle(0x060200); g.fillRect(GATE_X - 50, 1240, 100, 40)
    const gf = this.add.graphics().setDepth(20)
    gf.fillStyle(0x4a2810)
    gf.fillRect(GATE_X - 63, 1224, 14, 56)
    gf.fillRect(GATE_X + 49, 1224, 14, 56)
    gf.fillStyle(0x5a3118); gf.fillRect(GATE_X - 68, 1216, 136, 12)
    gf.fillStyle(0x3d2007, 0.8); gf.fillRect(GATE_X - 68, 1227, 136, 4)
    gf.lineStyle(1, 0x8b6914, 0.9)
    gf.strokeRect(GATE_X - 63, 1216, 126, 64)
    gf.fillStyle(0x8b6914)
    gf.fillCircle(GATE_X - 18, 1255, 4); gf.fillCircle(GATE_X + 18, 1255, 4)
    this.add.text(GATE_X, 1213, '大門', {
      fontSize: '12px', fontFamily: 'serif', color: '#f5d076', stroke: '#3d2007', strokeThickness: 3,
    }).setOrigin(0.5, 1).setDepth(21)
  }

  flicker() {
    const g = this.fireG, base = WALL_H
    g.clear()
    for (const cx of this.firePositions) {
      const f = () => Math.random()
      g.fillStyle(0xff2200, 0.70 + f() * .25); g.fillTriangle(cx + (f() - .5) * 10, base - 90 - f() * 20, cx - 30, base, cx + 30, base)
      g.fillStyle(0xff7700, 0.65 + f() * .20); g.fillTriangle(cx + (f() - .5) * 7,  base - 62 - f() * 14, cx - 20, base, cx + 20, base)
      g.fillStyle(0xffcc00, 0.50 + f() * .20); g.fillTriangle(cx + (f() - .5) * 4,  base - 36 - f() * 9,  cx - 11, base, cx + 13, base)
    }
  }

  // ── 角色 ────────────────────────────────────────────────────
  _spawnChar(username) {
    const pal = hashPalette(username)
    const c   = this.add.container(GATE_X, GATE_OFF).setDepth(5).setAlpha(0)
    const g   = this.add.graphics()
    g.fillStyle(pal.bc, 0.65); g.fillRect(-7, 9, 6, 14); g.fillRect(1, 9, 6, 14)
    g.fillStyle(pal.bc, 1);    g.fillRoundedRect(-11, -12, 22, 22, 3)
    g.fillStyle(pal.hc, 1);    g.fillCircle(0, -22, 13)
    g.fillStyle(0x222222);     g.fillCircle(-4, -23, 2.5); g.fillCircle(4, -23, 2.5)
    g.fillStyle(0xffffff);     g.fillCircle(-3, -24, 1);   g.fillCircle(5, -24, 1)
    const display = username.length > 14 ? username.substring(0, 12) + '..' : username
    const lbl = this.add.text(0, 14, display, {
      fontSize: '9px', fontFamily: 'monospace',
      color: '#fff', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5, 0)
    c.add([g, lbl])
    c.gfx = g; c.username = username; c.evQueue = []; c.qRunning = false; c.timer = null

    c.setInteractive(new Phaser.Geom.Rectangle(-15, -38, 30, 52), Phaser.Geom.Rectangle.Contains)
    c.on('pointerdown', () => { this.drag = null; this.followChar(c) })

    this.roster.set(username, c)
    this.tweens.add({
      targets: c, alpha: 1, duration: 300,
      onComplete: () => this.go(c, R(200, WORLD_W - 200), R(290, WORLD_H - 80), () => this.idle(c)),
    })
    return c
  }

  // ── 走動 ─────────────────────────────────────────────────────
  idle(c) {
    if (c.qRunning) return
    c.timer?.destroy(); this.tweens.killTweensOf(c)
    const tx = R(150, WORLD_W - 150), ty = R(280, WORLD_H - 80)
    const dist = Phaser.Math.Distance.Between(c.x, c.y, tx, ty)
    this.tweens.add({
      targets: c, x: tx, y: ty, duration: dist * 5.5, ease: 'Linear',
      onUpdate:   () => { c.gfx.y = Math.sin(this.time.now * .013) * 2.5; c.setDepth(4 + c.y / 100) },
      onComplete: () => { c.gfx.y = 0; if (!c.qRunning) c.timer = this.time.delayedCall(R(600, 2200), () => this.idle(c)) },
    })
  }

  go(c, tx, ty, cb) {
    c.timer?.destroy(); this.tweens.killTweensOf(c)
    const dist = Phaser.Math.Distance.Between(c.x, c.y, tx, ty)
    this.tweens.add({
      targets: c, x: tx, y: ty, duration: Math.max(dist * 4.5, 350), ease: 'Linear',
      onUpdate:   () => { c.gfx.y = Math.sin(this.time.now * .013) * 2.5; c.setDepth(4 + c.y / 100) },
      onComplete: () => { c.gfx.y = 0; cb?.() },
    })
  }

  // 追蹤移動中的角色：每步重新讀目標座標，直到足夠接近
  chase(c, target, cb) {
    c.timer?.destroy(); this.tweens.killTweensOf(c)
    const ox = R(-25, 25), oy = R(-20, 20)   // 停靠偏移，只決定一次

    const step = () => {
      const tx   = target.x + ox
      const ty   = target.y + oy
      const dist = Phaser.Math.Distance.Between(c.x, c.y, tx, ty)

      if (dist <= 40) { c.gfx.y = 0; cb?.(); return }

      const stepDist = Math.min(dist, 200)   // 每步最多 200 單位（約 900ms）
      const ratio    = stepDist / dist

      this.tweens.add({
        targets: c,
        x: c.x + (tx - c.x) * ratio,
        y: c.y + (ty - c.y) * ratio,
        duration: stepDist * 4.5,
        ease: 'Linear',
        onUpdate:   () => { c.gfx.y = Math.sin(this.time.now * .013) * 2.5; c.setDepth(4 + c.y / 100) },
        onComplete: () => { c.gfx.y = 0; step() },
      })
    }

    step()
  }

  // ── 對話泡泡 ─────────────────────────────────────────────────
  popup(c, text, col, cb) {
    const px = c.x, py = c.y - 55
    const tmp = this.add.text(-9999, -9999, text, { fontSize: '11px', fontFamily: 'monospace' })
    const bw = Math.max(tmp.width + 18, 90), bh = tmp.height + 14; tmp.destroy()
    const bg = this.add.graphics().setDepth(22)
    bg.fillStyle(0xffffff, 0.96); bg.fillRoundedRect(px - bw / 2, py - bh, bw, bh, 7)
    bg.fillTriangle(px - 7, py, px + 7, py, px, py + 11)
    bg.lineStyle(2, col, 1); bg.strokeRoundedRect(px - bw / 2, py - bh, bw, bh, 7)
    const txt = this.add.text(px, py - bh / 2, text, {
      fontSize: '11px', fontFamily: 'monospace', color: '#111',
    }).setOrigin(0.5).setDepth(23)
    for (let i = 0; i < 6; i++) {
      const sp = this.add.circle(px + R(-5, 5), py - bh, R(2, 4), col, 0.85).setDepth(19)
      this.tweens.add({
        targets: sp, x: px + R(-45, 45), y: py - bh - R(10, 55), alpha: 0, scale: 0,
        duration: 450 + i * 70, delay: i * 45, onComplete: () => sp.destroy(),
      })
    }
    ;[bg, txt].forEach(o => o.setAlpha(0))
    this.tweens.add({
      targets: [bg, txt], alpha: 1, duration: 160,
      onComplete: () => this.time.delayedCall(2800, () =>
        this.tweens.add({
          targets: [bg, txt], alpha: 0, duration: 280,
          onComplete: () => { bg.destroy(); txt.destroy(); cb?.() },
        })
      ),
    })
  }
}
