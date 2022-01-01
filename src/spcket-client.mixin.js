import io from 'socket.io-client'
// import { fabric } from 'fabric'

const socket = io("https://drawing-io.de.r.appspot.com")
// const socket = io("http://192.168.32.58:8180")

export default {
    methods: {
        emitAdd(obj) {
            socket.emit('object-added', obj)
        },
        emitModify(obj) {
            socket.emit('object-modified', obj)
        },
        emitDrawing(obj) {
            socket.emit('drawing-path', obj)
        },
        emitMouseUp(obj) {
            socket.emit('on-mouse-up', obj)
        },
        emitMouseDown(obj) {
            socket.emit('on-mouse-down', obj)
        },
        emitColorChange(obj) {
            socket.emit('emit-color-change', obj)
        },
        emitBrushWidthChange(obj) {
            socket.emit('emit-brush-width', obj)
        },
        emitUndo() {
            socket.emit("undo-emitted")
        },
        emitRedo() {
            socket.emit("redo-emitted")
        },
        emitClearAll() {
            socket.emit("clear-all-emitted")
        },
        // listeners
        onClearAll() {
            socket.on("clear-all-set", () => {
                this.clearcanLocal()
            })
        },
        newUndo() {
            socket.on('undo-set', () => {
                console.log("new undo")
                this.undoLocal()
            })
        },
        newRedo() {
            socket.on('redo-set', () => {
                this.redoLocal()
            })
        },
        newBrushWidthSet(canvas) {
            socket.on('new-brush-width-set', newBurshWidth => {
                canvas.freeDrawingBrush.width = newBurshWidth
            })
        },
        newColorSet(canvas, cb) {
            socket.on('new-color-set', newColor => {
                canvas.freeDrawingBrush.color = newColor
                cb(newColor)
            })
        },
        newOnMouseDown(canvas) {
            socket.on('new-on-mouse-down', ({ e, pointer }) => {
                canvas.freeDrawingBrush.onMouseDown(pointer, e);
            })
        },
        newOnMouseUp(canvas) {
            socket.on('new-on-mouse-up', ({ e, pointer }) => {
                canvas.freeDrawingBrush.onMouseUp(e, pointer);
                this.updateModifications(true);
            })
        },
        drawingOn(canvas) {
            socket.on('new-drawingpath', data => {
                canvas.freeDrawingBrush.onMouseMove(data.pointer, data.e);
            })
        }
    }
}