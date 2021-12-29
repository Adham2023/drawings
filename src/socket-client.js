import io from 'socket.io-client'
import { fabric } from 'fabric'

const socket = io("http://192.168.242.58:8180")

// emitters
export const emitAdd = obj => {
  socket.emit('object-added', obj)
}

export const emitModify = (obj) => {
  socket.emit('object-modified', obj)
}

export const emitDrawing = (obj) => {
  socket.emit('drawing-path', obj)
}

export const emitMouseUp = obj => {
  socket.emit('on-mouse-up', obj)
}

export const emitMouseDown = obj => {
  socket.emit('on-mouse-down', obj)
}

export const emitColorChange = obj => {
  socket.emit('emit-color-change', obj)
}

export const emitBrushWidthChange = obj => {
  socket.emit('emit-brush-width', obj)
}

// listeners
export const newBrushWidthSet = (canvas) => {
  socket.on('new-brush-width-set', newBurshWidth => {
    canvas.freeDrawingBrush.width = newBurshWidth
  })
}
export const newColorSet = (canvas, cb) => {
  socket.on('new-color-set', newColor => {
    canvas.freeDrawingBrush.color = newColor
    cb(newColor)
  })
}
export const newOnMouseDown = canvas => {
  socket.on('new-on-mouse-down', ({e, pointer}) => {
    canvas.freeDrawingBrush.onMouseDown(pointer, e);
  })
}

export const newOnMouseUp = canvas => {
  socket.on('new-on-mouse-up', ({e, pointer}) => {
    canvas.freeDrawingBrush.onMouseUp(e, pointer);
  })
}

export const drawingOn = canvas => {
  socket.on('new-drawingpath', data => {
    canvas.freeDrawingBrush.onMouseMove(data.pointer, data.e);
  })
}


export const addObj = canvas => {
  socket.off('new-add')
  socket.on('new-add', data => {
    const {obj, id} = data
    let object

    if (obj.type === 'rect') {
      object = new fabric.Rect({
        height: obj.height,
        width: obj.width,
      })
    } else if (obj.type === 'circle') {
      object = new fabric.Circle({
        radius: obj.radius,
      })
    } else if (obj.type === 'triangle') {
      object = new fabric.Triangle({
        width: obj.width,
        height: obj.height,
      })
    }
    
    object.set({id: id})
    canvas.add(object)
    canvas.renderAll()
  })
}

export const modifyObj = canvas => {
  socket.on('new-modification', data => {
    const { obj, id } = data
    canvas.getObjects().forEach(object => {
      if (object.id === id) {
        object.set(obj)
        object.setCoords()
        canvas.renderAll()
      }
    })
  })
}

export default socket