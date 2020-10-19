import Phaser from "phaser";
import circle from './assets/circle.png'
import square from './assets/square.png'

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let graphics
let curves = []
let boxes
let points
let emitter
let camera
let button
let contextMenu
let contextMenuIsDisplaying = false

const game = new Phaser.Game(config);

function preload() {
  this.load.image('circle', circle)
  this.load.image('square', square)
}

function create() {
  // Setup environment
  emitter = new Phaser.Events.EventEmitter()
  camera = this.cameras.add(0, 0, 800, 600)
  camera.setBackgroundColor('#123456')
  graphics = this.add.graphics()


  // Set curve params
  const startPoint = new Phaser.Math.Vector2(50, 50)
  const controlPoint = new Phaser.Math.Vector2(400, 300)
  const endPoint = new Phaser.Math.Vector2(750, 550)

  curves.push(new Phaser.Curves.QuadraticBezier(startPoint, controlPoint, endPoint))

  // Instantiate boxes
  boxes = this.physics.add.group({
    collideWorldBounds: true,
  })

  const box0 = boxes.create(750, 50, 'square')
  const box1 = boxes.create(50, 550, 'square')

  boxes.getChildren().forEach(box => {
    box.setOrigin(0.5)
    box.setInteractive()
    box.on('pointerdown', (pointer, box) => {
      // check to see if menu is already open and clear if it is
      contextMenuIsDisplaying && contextMenu.destroy()
      if(pointer.rightButtonDown()){
        // show context menu
        contextMenu = this.add.container(pointer.x, pointer.y, [
          this.add.rectangle(0, 0, 100, 20, 0xffffff, 1),
          this.add.text(-45, -7, 'add wire', {
            fill: 'black'
          })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => { 
              console.log("cotext menu option pressed")
              // get index of new curve
              const index = curves.length
              // set params for new curve
              const newStartPoint = new Phaser.Math.Vector2(pointer.x, pointer.y)
              const newControlPoint = new Phaser.Math.Vector2(pointer.x + 50, pointer.y)
              const newEndPoint = new Phaser.Math.Vector2(pointer.x + 100, pointer.y)
              curves.push(new Phaser.Curves.QuadraticBezier(newStartPoint, newControlPoint, newEndPoint))
      
              // create new points
              const newPoint0 = points.create(curves[index].p0.x, curves[index].p0.y, 'circle', 0)
                newPoint0.setData('vector', curves[index].p0)
                newPoint0.setInteractive()
                this.input.setDraggable(newPoint0)
              const newPoint1 = points.create(curves[index].p1.x, curves[index].p1.y, 'circle', 0)
                newPoint1.setData('vector', curves[index].p1)
                newPoint1.setInteractive()
                this.input.setDraggable(newPoint1)
              const newPoint2 = points.create(curves[index].p2.x, curves[index].p2.y, 'circle', 0)
                newPoint2.setData('vector', curves[index].p2)
                newPoint2.setInteractive()
                this.input.setDraggable(newPoint2)
              contextMenu.destroy()
            })
        ])
        contextMenuIsDisplaying = true     
      }
    })
    this.input.setDraggable(box)
  })


  // Instantiate points
  points = this.physics.add.group({
    collideWorldBounds: true,
  })

  const point0 = points.create(curves[0].p0.x, curves[0].p0.y, 'circle', 0)
  const point1 = points.create(curves[0].p1.x, curves[0].p1.y, 'circle', 0)
  const point2 = points.create(curves[0].p2.x, curves[0].p2.y, 'circle', 0)

  points.getChildren().forEach(point => {
    point.setInteractive()
    this.input.setDraggable(point)
  })

  point0.setData('vector', curves[0].p0)
  point1.setData('vector', curves[0].p1)
  point2.setData('vector', curves[0].p2)

  // Instantiate controls
  button = this.add.text(720, 2, 'New Box', { fill: '#ffffff' })
    .setInteractive({ useHandCursor: true })

    // create new box instance on click event
    .on('pointerdown', () => { 
      const newBox = boxes.create(600, 300, 'square')
      newBox.setOrigin(0.5)
      newBox.setInteractive()
      newBox.on('pointerdown', (pointer, newBox) => {
        if(pointer.rightButtonDown()){
          // TODO: add context menu in between right click and functionality
          // get index of new curve
          const index = curves.length
          // set params for new curve
          const newStartPoint = new Phaser.Math.Vector2(pointer.x, pointer.y)
          const newControlPoint = new Phaser.Math.Vector2(pointer.x + 50, pointer.y)
          const newEndPoint = new Phaser.Math.Vector2(pointer.x + 100, pointer.y)
          curves.push(new Phaser.Curves.QuadraticBezier(newStartPoint, newControlPoint, newEndPoint))

          // create new points
          const newPoint0 = points.create(curves[index].p0.x, curves[index].p0.y, 'circle', 0)
            newPoint0.setData('vector', curves[index].p0)
            newPoint0.setInteractive()
            this.input.setDraggable(newPoint0)
          const newPoint1 = points.create(curves[index].p1.x, curves[index].p1.y, 'circle', 0)
            newPoint1.setData('vector', curves[index].p1)
            newPoint1.setInteractive()
            this.input.setDraggable(newPoint1)
          const newPoint2 = points.create(curves[index].p2.x, curves[index].p2.y, 'circle', 0)
            newPoint2.setData('vector', curves[index].p2)
            newPoint2.setInteractive()
            this.input.setDraggable(newPoint2)
        }
      })
      this.input.setDraggable(newBox)
    })

    // handle hover states
    .on('pointerover', () => button.setStyle({ fill: '#999999'}) )
    .on('pointerout', () => button.setStyle({ fill: '#ffffff' }) )


  // Handle drag
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    gameObject.x = dragX
    gameObject.y = dragY

    if (gameObject.data) {
      gameObject.data.get('vector').set(dragX, dragY)
    }
  })


  // Remove listener if not colliding
  this.input.on('dragend', (pointer, gameObject) => {
    emitter.removeListener('changeBackground')
  })


  // Stick together on collision
  this.physics.add.collider(points, boxes, (_point, _box) => {
    handleStick(_point, _box.x, _box.y)
  })


  // Trigger emit
  this.input.addListener('pointerup', () => {
    emitter.emit('changeBackground')
  })

  // handle context menu
  this.game.canvas.oncontextmenu = (e) => e.preventDefault()
  this.input.on('pointerdown', () => {
    clearContextMenu()
  })
}

function update() {
  graphics.clear()
  graphics.lineStyle(2, 0xffffff, 1)
  
  curves.forEach(curve => curve.draw(graphics))
}

// Stick box and point together and instantiate listener
function handleStick (gameObject, posX, posY) {
  gameObject.data.get('vector').set(posX, posY)
  gameObject.x = posX
  gameObject.y = posY
  
  emitter.addListener('changeBackground', handleColour, this)
}

function handleColour () {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  camera.setBackgroundColor(color)
}

function clearContextMenu (){
        // check to see if menu is already open and clear if it is
        contextMenuIsDisplaying && contextMenu.destroy()
}