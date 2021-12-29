<template>
  <div class="App">
    <div class="buttons">
      <button name="circle" @click="addShape">
        Add a Circle
      </button>
       <button name="triangle" @click="addShape">
        Add a Triangle
      </button>
       <button name="rectangle" @click="addShape">
        Add a Rectangle
      </button>
    </div>
    <div>
      <canvas id="canv"></canvas>
    </div>
  </div>
</template>

<script>
import { fabric } from "fabric"
import { v1 as uuid } from 'uuid' 
export default {
  data() {
    return {
    }
  },
  mounted() {
    window.canvas = this.initCanvas()
    console.log(this.canvas)
  },
  methods: {
    addShape(e) {
      let type = e.target.name;
      console.log(type)
      let object;
      if(type === "rectangle") {
        object = new fabric.Rect({
          height: 75,
          width: 150
        })
      } else if (type === "triangle") {
        object = new fabric.Triangle({
          width: 100,
          height: 100
        })
      } else if(type === "circle") {
        object = new fabric.Circle({
          radius: 50
        })
      }
      console.log(object)
      object.set({id: uuid()})
      this.canvas.add(object)
      this.canvas.renderAll()
    },
    initCanvas() {
      return new fabric.Canvas("canv", {
        height: 500,
        width: 500,
        backgroundColor: "black",
      })
    }
  },
};
</script>

<style>
</style>