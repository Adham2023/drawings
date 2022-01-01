<template>
  <div class="buttons">
    <button style="margin-right: 1em" @click="undo">undo</button>
    <button style="margin-right: 1em" @click="redo">redo</button>
    <button style="margin-right: 1em" @click="clearcan">clear all</button>
    <button style="margin-right: 1em" @click="eraseData">Eraser aa</button>
    <input
      type="color"
      style="margin-right: 1em"
      :value="isErasing ? prevColor : pathColor"
      @change="setColor"
    />
    <button @click="appearOverlay = !appearOverlay">scroll-mode</button>
  </div>
  <div class="canvaswrp">
    <canvas ref="can"></canvas>
    <div
      v-if="appearOverlay"
      @dblclick="appearOverlay = !appearOverlay"
      class="overlay"
    ></div>
    <div class="ruler">
      <div
        v-for="i in 300"
        :key="i"
        class="lines"
        :style="{ width: (i % 10 === 0 ? 25 : 17) + 'px' }"
      >
        {{ i }}
      </div>
    </div>
  </div>
</template>

<script>
import { fabric } from "fabric";
// import {
//   addObj,
//   emitDrawing,
//   drawingOn,
//   emitMouseDown,
//   emitMouseUp,
//   newOnMouseDown,
//   newOnMouseUp,
//   emitColorChange,
//   newColorSet,
//   emitBrushWidthChange,
//   newBrushWidthSet,
// } from "./socket-client";
import socketMixin from "./spcket-client.mixin";
export default {
  mixins: [socketMixin],
  data() {
    return {
      pathColor: "#3fff06",
      isErasing: false,
      prevColor: this.pathColor,
      appearOverlay: false,
      state: [],
      mods: 0,
    };
  },
  mounted() {
    this.initFabric();
    this.setUpListeners();
    setTimeout(() => {
      window.scrollTo(0, 500);
    }, 2000);
  },
  methods: {
    undoLocal() {
      console.log("undoLocal")
      console.log(this.mods, this.state.length);
      if (this.mods < this.state.length - 1) {
        canvas.clear().renderAll();
        canvas.loadFromJSON(this.state[this.state.length - 1 - this.mods - 1]);
        canvas.renderAll();
        this.mods += 1;
      }
    },
    undo() {
      console.log(this.mods, this.state.length);
      if (this.mods < this.state.length - 1) {
        canvas.clear().renderAll();
        canvas.loadFromJSON(this.state[this.state.length - 1 - this.mods - 1]);
        canvas.renderAll();
        this.mods += 1;
        this.emitUndo()
      }
    },
    redoLocal() {
      if (this.mods > 0) {
        canvas.clear().renderAll();
        canvas.loadFromJSON(this.state[this.state.length - 1 - this.mods + 1]);
        canvas.renderAll();
        this.mods -= 1;
      }
    },
    redo() {
      if (this.mods > 0) {
        canvas.clear().renderAll();
        canvas.loadFromJSON(this.state[this.state.length - 1 - this.mods + 1]);
        canvas.renderAll();
        this.mods -= 1;
        this.emitRedo()
      }
    },
    clearcanLocal() {
      canvas.clear().renderAll();
    },
    clearcan() {
      canvas.clear().renderAll();
      this.emitClearAll()
    },
    updateModifications(savehistory) {
      if (savehistory === true) {
        let myjson = JSON.stringify(canvas);
        this.state.push(myjson);
        console.log(this.state.length)
      }
    },
    eraseData() {
      if (this.isErasing) {
        canvas.freeDrawingBrush.width = 5;
        this.pathColor = this.prevColor;
        canvas.freeDrawingBrush.color = this.pathColor;
        this.emitColorChange(this.pathColor);
        this.emitBrushWidthChange(5);
        this.isErasing = false;
      } else {
        canvas.freeDrawingBrush.width = 15;
        this.isErasing = true;
        this.prevColor = this.pathColor;
        this.pathColor = "black";
        canvas.freeDrawingBrush.color = this.pathColor;
        this.emitColorChange(this.pathColor);
        this.emitBrushWidthChange(15);
      }
    },
    setColor(e) {
      this.pathColor = e.target.value;
      canvas.freeDrawingBrush.color = this.pathColor;
      this.emitColorChange(this.pathColor);
    },
    initFabric() {
      const ref = this.$refs.can;
      window.canvas = new fabric.Canvas(ref, {
        isDrawingMode: true,
        height: 2500,
        width: window.innerWidth,
        backgroundColor: "black",
      });
      canvas.counter = 0;
      this.updateModifications(true);
    },
    setUpListeners() {
      let isDrwaing = false;
      canvas.freeDrawingBrush.width = 3;
      canvas.freeDrawingBrush.color = this.pathColor;
      canvas
        .on("mouse:down", (e) => {
          isDrwaing = true;
          onMouseDown(e);
        })
        .on("mouse:up", (e) => {
          isDrwaing = false;
          onMouseUp(e);
          canvas.includeDefaultValues = false;
          this.updateModifications(true);
          canvas.counter++;
        })
        .on("mouse:move", (e) => {
          if (isDrwaing) {
            const pointer = canvas.getPointer(e);
            drawRealTime(e, pointer);
          }
        });
      let onMouseDown = (e) => {
        const pointer = canvas.getPointer(e);
        this.emitMouseDown({ pointer, e });
      }
      let onMouseUp = (e) => {
        const pointer = canvas.getPointer(e);
        this.emitMouseUp({ e, pointer });
      }
      let drawRealTime = (e, pointer) => {
        this.emitDrawing({ pointer, e });
      }
      this.newBrushWidthSet(canvas);
      this.newOnMouseUp(canvas);
      this.newOnMouseDown(canvas);
      this.drawingOn(canvas);
      this.onClearAll()
      this.newUndo()
      this.newRedo()
      this.newColorSet(canvas, (newColor) => {
        this.pathColor = newColor;
      });
    },
  },
};
</script>

<style>
*,
::after,
::before {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.buttons {
  height: 35px;
  z-index: 1000;
  background-color: rgb(0, 0, 0);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 1em;
}

.canvaswrp {
  height: calc(100vh - 35px);
  display: flex;
  justify-content: center;
  width: 100%;
  overflow-x: hident;
  overflow-y: auto;
  padding: 0;
  position: relative;
}

.overlay {
  position: absolute;
  height: 2500px;
  left: 0;
  right: 0;
  background-color: transparent;
}

.ruler {
  position: absolute;
  height: 2500px;
  width: 30px;
  left: 0;
  background-color: rgb(0, 0, 0);
}

.lines {
  border-bottom: 1px solid gray;
  font-size: 8px;
  width: 20px;
  color: gray;
  text-align: right;
  margin-bottom: 2px;
}
</style>