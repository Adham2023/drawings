<template>
  <div class="buttons">
    <button style="margin-right: 1em" @click="eraseData">Eraser</button>
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
    <div v-if="appearOverlay" @dblclick="appearOverlay = !appearOverlay" class="overlay"></div>
    <div class="ruler">
      <div 
        v-for="i in 300" :key="i" 
        class="lines"
        
        :style="{width: (i % 10 === 0 ? 25: 17) + 'px'}"
      >{{ i }}</div>
    </div>
  </div>
</template>

<script>
import { fabric } from "fabric";
import {
  addObj,
  emitDrawing,
  drawingOn,
  emitMouseDown,
  emitMouseUp,
  newOnMouseDown,
  newOnMouseUp,
  emitColorChange,
  newColorSet,
  emitBrushWidthChange,
  newBrushWidthSet,
} from "./socket-client";
export default {
  data() {
    return {
      pathColor: "#3fff06",
      isErasing: false,
      prevColor: this.pathColor,
      appearOverlay: false,
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
    eraseData() {
      if (this.isErasing) {
        canvas.freeDrawingBrush.width = 5;
        this.pathColor = this.prevColor;
        canvas.freeDrawingBrush.color = this.pathColor;
        emitColorChange(this.pathColor);
        emitBrushWidthChange(5);
        this.isErasing = false;
      } else {
        canvas.freeDrawingBrush.width = 15;
        this.isErasing = true;
        this.prevColor = this.pathColor;
        this.pathColor = "black";
        canvas.freeDrawingBrush.color = this.pathColor;
        emitColorChange(this.pathColor);
        emitBrushWidthChange(15);
      }
    },
    setColor(e) {
      this.pathColor = e.target.value;
      canvas.freeDrawingBrush.color = this.pathColor;
      emitColorChange(this.pathColor);
    },
    initFabric() {
      const ref = this.$refs.can;
      window.canvas = new fabric.Canvas(ref, {
        isDrawingMode: true,
        height: 2500,
        width: window.innerWidth,
        backgroundColor: "black",
      });
      canvas.setBackgroundColor({source: 'http://fabricjs.com/assets/escheresque_ste.png'}, 
      canvas.renderAll.bind(canvas));
    },
    setUpListeners() {
      let isDrwaing = false;
      canvas.freeDrawingBrush.width = 5;
      canvas.freeDrawingBrush.color = this.pathColor;
      canvas
        .on("mouse:down", (e) => {
          isDrwaing = true;
          onMouseDown(e);
        })
        .on("mouse:up", (e) => {
          isDrwaing = false;
          onMouseUp(e);
        })
        .on("mouse:move", (e) => {
          if (isDrwaing) {
            const pointer = canvas.getPointer(e);
            drawRealTime(e, pointer);
          }
        });

      function onMouseDown(e) {
        const pointer = canvas.getPointer(e);
        emitMouseDown({ pointer, e });
      }

      function onMouseUp(e) {
        const pointer = canvas.getPointer(e);
        emitMouseUp({ e, pointer });
      }

      function drawRealTime(e, pointer) {
        emitDrawing({ pointer, e });
      }
      newBrushWidthSet(canvas);
      newOnMouseUp(canvas);
      newOnMouseDown(canvas);
      drawingOn(canvas);
      addObj(canvas);
      newColorSet(canvas, (newColor) => {
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
  padding: 0 1em
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