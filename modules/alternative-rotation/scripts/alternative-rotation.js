import { libWrapper } from './libwrapper-shim.js'

const MODULE_ID = 'alternative-rotation'
const radToDeg = 180 / Math.PI
const degToRad = Math.PI / 180
let drawnArrow = null
let currentMim = null
let isNowRotating = false
let isAvoidingRefresh = false
let isRotatingMultipleTokens = false

function getSetting (settingName) {
  return game.settings.get(MODULE_ID, settingName)
}

function isDragButtonHeld () {
  return game.keyboard._downKeys.has('Shift')
}

function isDragSnapButtonHeld () {
  return game.keyboard._downKeys.has('Control') || game.keyboard._downKeys.has('Control')
}

function isDoingDrag (mouseInteractionManager) {
  const obj = mouseInteractionManager.object
  return !mouseInteractionManager._dragRight && (obj instanceof Token || obj instanceof Tile)
}

/**
 * Can only multi-rotate tokens and tiles (could add others in the future if needed)
 */
function controlledObjectsOnCurrentLayer () {
  if (canvas.activeLayer instanceof TilesLayer) {
    return canvas.tiles.controlled
  }
  if (canvas.activeLayer instanceof TokenLayer) {
    return canvas.tokens.controlled
  }
  return []
}

function drawDirectionalArrow (from, to) {
  const width = isDragSnapButtonHeld() ? 8 : 5
  const color = 0xFF9829
  const alpha = 0.8
  const circleRadius = 10
  const arrowCornerLength = 30
  const arrowCornerAngle = 150 * degToRad
  const angle = Math.atan2(to.y - from.y, to.x - from.x)
  const arrowStart = {
    x: from.x + Math.cos(angle) * (circleRadius - width / 2 - 2),
    y: from.y + Math.sin(angle) * (circleRadius - width / 2 - 2),
  }
  const arrowCorner1 = {
    x: to.x + Math.cos(angle + arrowCornerAngle) * arrowCornerLength,
    y: to.y + Math.sin(angle + arrowCornerAngle) * arrowCornerLength,
  }
  const arrowCorner2 = {
    x: to.x + Math.cos(angle - arrowCornerAngle) * arrowCornerLength,
    y: to.y + Math.sin(angle - arrowCornerAngle) * arrowCornerLength,
  }
  // drawing using the canvas selection rectangle, yes, it's a hack
  drawnArrow = canvas.controls.select.clear()
    .lineStyle(width, color, alpha) // width, color, alpha
    .drawCircle(from.x, from.y, circleRadius)
    .drawPolygon(arrowStart.x, arrowStart.y, to.x, to.y)
    .drawPolygon(to.x, to.y, arrowCorner1.x, arrowCorner1.y, to.x, to.y, arrowCorner2.x, arrowCorner2.y)
}

function getCenter (object) {
  if (object instanceof Token) return object.center
  if (object instanceof Tile) return {
    x: object.data.x + object.tile.img.width / 2,
    y: object.data.y + object.tile.img.height / 2,
  }
  throw Error('shouldn\'t call getCenter() on other stuff')
}

/**
 * Returns result in degrees
 */
function rotationTowardsCursor (object, cursor) {
  const obj = getCenter(object)
  const target = Math.atan2(cursor.y - obj.y, cursor.x - obj.x) + Math.PI * 3 / 2 // down = 0
  const degrees = target * radToDeg
  const dBig = canvas.grid.type > CONST.GRID_TYPES.SQUARE ? 60 : 45
  const dSmall = getSetting('smooth-rotation') ? 0.1 : 5
  const snap = isDragSnapButtonHeld() ? dBig : dSmall
  return Math.round(degrees / snap) * snap
}

function _handleDragStart_Override (_handleDragStart, event) {
  // Wrap unless shift+leftpress on a tile or token
  if (!isDoingDrag(this) || !isDragButtonHeld()) {
    if (isDragButtonHeld() && controlledObjectsOnCurrentLayer().length >= 2) {
      isRotatingMultipleTokens = true
      // todo visual effect?
      return
    }
    // Call wrapped function
    return _handleDragStart.bind(this)(event)
  }
  // Start drag rotation
  isNowRotating = true
  currentMim = this
}

function _handleMouseOut_Override (_handleMouseOut, event) {
  // special case: when user shift-drags from a deselected token
  // (here `this` is the canvas, so we need to get the token/tile's mouse interaction manager)
  const mim = event.currentTarget.mouseInteractionManager
  const obj = mim ? mim.object : null
  // lots of checks because handleMouseOut can be called by anyone at any point
  if (
    mim && isDoingDrag(mim) && !isNowRotating
    && isDragButtonHeld() && event.data.originalEvent.buttons === 1
    && game.activeTool === 'select' && this.state === this.states.CLICKED
    && (game.user.isGM || (!game.paused && (obj.actor && obj.actor.hasPerm(game.user, 'OWNER'))))
  ) {
    // Start drag rotation
    isNowRotating = true
    mim.state = this.states.DRAG
    // activating drag events so that _handleDragMove_Override will be called from now on
    mim._activateDragEvents()
    currentMim = mim
  }
  // calling wrapper function either way
  return _handleMouseOut.bind(this)(event)
}

function _onDragLeftStart_Override (_onDragLeftStart, event) {
  const oe = event.data.originalEvent
  if (
    (oe.ctrlKey || oe.metaKey) && oe.shiftKey && this.activeLayer.name === 'TokenLayer'
  ) {
    // do nothing; preventing the ctrl+drag ruler shortcut
    return
  }
  return _onDragLeftStart.bind(this)(event)
}

function _handleDragMove_Override (_handleDragMove, event) {
  if (isRotatingMultipleTokens) {
    const updates = controlledObjectsOnCurrentLayer().map(object => {
      const angle = rotationTowardsCursor(object, event.data.destination)
      if (getSetting('fast-preview')) {
        // fast preview:  rotate image of token/tile in client, which feels very fast
        if (object instanceof Token)
          object.icon.rotation = angle * degToRad
        else
          object.tile.img.rotation = angle * degToRad
        return null
      }
      let update = { _id: object.id }
      const rotation = object._updateRotation({ angle })
      mergeObject(update, { rotation })
      return update
    })
    if (updates.length > 0 && !getSetting('fast-preview')) {
      canvas.activeLayer.updateMany(updates)
    }
    return
  }
  if (!isDoingDrag(this) || !isNowRotating) {
    // Call wrapped function
    return _handleDragMove.bind(this)(event)
  }

  // Continue drag rotation, showing "preview"
  const object = this.object
  const cursor = event.data.destination
  const targetRotation = rotationTowardsCursor(object, cursor)
  // draw arrow
  const start = getCenter(object)
  drawDirectionalArrow(start, cursor)
  if (getSetting('fast-preview')) {
    // fast preview:  rotate image of token/tile in client, which feels very fast
    if (object instanceof Token)
      object.icon.rotation = targetRotation * degToRad
    else
      object.tile.img.rotation = targetRotation * degToRad
  } else {
    // not fast preview:  rotate data of token/tile.  will be sent to remote server (and other players), but lag
    object.update({ rotation: targetRotation })
  }
}

function completeDragRotation (mim, event) {
  const object = mim.object
  const targetRotation = rotationTowardsCursor(object, event.data.destination)
  object.rotate(targetRotation)
  mim.state = mim.states.DROP
}

function _handleDragDrop_Override (_handleDragDrop, event) {
  if (!isDoingDrag(this) || !isNowRotating) {
    if (isRotatingMultipleTokens) {
      completeMultiRotation(this, event)
      return
    }
    // Call wrapped function
    return _handleDragDrop.bind(this)(event)
  }
  // Complete drag rotation
  completeDragRotation(this, event)
}

function _handleMouseUp_Override (_handleMouseUp, event) {
  // workaround to solve an edge case bug that should drop the drag when mouse is let go:
  // when letting go of the mouse while hovering over a second token with
  if (isNowRotating && this.state === this.states.HOVER) {
    return completeDragRotation(currentMim, event)
  }
  return _handleMouseUp.bind(this)(event)
}

function _handleDragCancel_Override (_handleDragCancel, event) {
  if (!isDoingDrag(this) || !isNowRotating) {
    // Call wrapped function
    return _handleDragCancel.bind(this)(event)
  }
  isNowRotating = false
  if (this.state === this.states.DRAG) {
    const object = this.object
    // Cancel drag rotation
    // reset rotation to match data
    if (object instanceof Token)
      object.icon.rotation = object.data.rotation
    else
      object.tile.img.rotation = object.data.rotation
  }
  if (drawnArrow) {
    drawnArrow.clear()
    drawnArrow = null
  }
  isAvoidingRefresh = true
  this.object.control()
  isAvoidingRefresh = false
  this.state = this.states.NONE
  currentMim = null
}

function _onControl_Override (_onControl, { releaseOthers = true, updateSight = true, pan = false } = {}) {
  if (!isAvoidingRefresh)
    return _onControl.bind(this)({ releaseOthers, updateSight, pan })
  this.zIndex = 1
  //NOTABLY ABSENT:
  // this.refresh();
  if (updateSight) canvas.addPendingOperation(`Canvas.initializeSources`, canvas.initializeSources, canvas)
  if (pan) canvas.addPendingOperation('Canvas.animatePan', canvas.animatePan, canvas, [{ x: this.x, y: this.y }])
  canvas.sounds.refresh()
}

function _onClickStart_Override (_onClickStart, event) {
  if (isDragButtonHeld() && controlledObjectsOnCurrentLayer().length >= 2) {
    // do nothing; preventing the release of all controlled tokens
    return
  }
  return _onClickStart.bind(this)(event)
}

function completeMultiRotation (mim, event) {
  isRotatingMultipleTokens = false
  const updates = controlledObjectsOnCurrentLayer().map(object => {
    let update = { _id: object.id }
    const angle = rotationTowardsCursor(object, event.data.destination)
    const rotation = object._updateRotation({ angle })
    mergeObject(update, { rotation })
    return update
  })
  if (updates.length > 0) {
    canvas.activeLayer.updateMany(updates)
  }
}

Hooks.once('init', function () {
  game.settings.register(MODULE_ID, 'smooth-rotation', {
    name: 'Smooth rotation',
    hint: 'Disable snapping to 5-degree increments when using the module.',
    scope: 'client',
    config: true,
    default: false,
    type: Boolean,
  })
  game.settings.register(MODULE_ID, 'fast-preview', {
    name: 'Fast Preview',
    hint: 'If true, there will be no lag when rotating, but other players won\'t see the change until you let go.',
    scope: 'client',
    config: true,
    default: true,
    type: Boolean,
  })
})

Hooks.once('setup', function () {
  libWrapper.register(MODULE_ID,
    'MouseInteractionManager.prototype._handleDragStart', _handleDragStart_Override, 'MIXED')
  libWrapper.register(MODULE_ID,
    'MouseInteractionManager.prototype._handleDragMove', _handleDragMove_Override, 'MIXED')
  libWrapper.register(MODULE_ID,
    'MouseInteractionManager.prototype._handleDragDrop', _handleDragDrop_Override, 'MIXED')
  libWrapper.register(MODULE_ID,
    'MouseInteractionManager.prototype._handleDragCancel', _handleDragCancel_Override, 'MIXED')
  libWrapper.register(MODULE_ID,
    'MouseInteractionManager.prototype._handleMouseOut', _handleMouseOut_Override, 'MIXED')
  libWrapper.register(MODULE_ID,
    'MouseInteractionManager.prototype._handleMouseUp', _handleMouseUp_Override, 'MIXED')
  libWrapper.register(MODULE_ID,
    'Token.prototype._onControl', _onControl_Override, 'MIXED')
  libWrapper.register(MODULE_ID,
    'Canvas.prototype._onDragLeftStart', _onDragLeftStart_Override, 'MIXED')
  libWrapper.register(MODULE_ID,
    'PlaceablesLayer.prototype._onClickLeft', _onClickStart_Override, 'MIXED')
  console.log(`Alternative Rotation | initialized`)
})
