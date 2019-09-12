QUnit.test( "hello test", function( assert ) {
    gameTurf.world.init([1,1,0,0], 2, 2)
    gameTurf.game.init({});
    assert.notOk(gameTurf.game.isRunning);

    var player = {
      physics   : gameTurf.physics({
        position: {
          x: 1
        , y: 1
        }
        , mass              : 10
        , width             : 20
        , height            : 20
        , frictionMagnitude : 1
        , speed             : 2
        , runSpeed          : 3
      })
    , update: function(timeElapsed){
        playerInput = gameTurf.input.getPlayerMovementDirection()
        player.physics.update(timeElapsed, playerInput)
      }
    }
    gameTurf.entityManager.add(player)
    gameTurf.input.keyPressed[38] = true //up

    gameTurf.game.step()

    assert.equal(player.physics.velocity.y, -1)
    assert.equal(player.physics.velocity.x, 0)

    // velocity 1 -> 100px pro 1 sekunde 100 px/s

});

QUnit.test("Test vectorToDegree 1", function( assert ) {
  assert.equal(gameTurf.util.vectorToDegree({ x: 0, y: 0}), 0);

  assert.equal(gameTurf.util.vectorToDegree({ x: 1, y: 0}), 90);
  assert.equal(gameTurf.util.vectorToDegree({ x: 1, y: 1}), 45);
  assert.equal(gameTurf.util.vectorToDegree({ x: 0, y: 1}), 0);
  assert.equal(gameTurf.util.vectorToDegree({ x: -1, y: 1}), -45);
  assert.equal(gameTurf.util.vectorToDegree({ x: -1, y: 0}), -90);
  assert.equal(gameTurf.util.vectorToDegree({ x: -1, y: -1}), -135);
  assert.equal(gameTurf.util.vectorToDegree({ x: 0, y: -1}), 180);
  assert.equal(gameTurf.util.vectorToDegree({ x: 1, y: -1}), 135);
  
});

QUnit.test("Test getVectorAngleDegree 1", function( assert ) {
  assert.equal(gameTurf.util.getVectorAngleDegree({x:1,y:1},{ x: 1, y: 1}), 0);

  assert.equal(gameTurf.util.getVectorAngleDegree({x:1,y:1},{ x:2,y:1}), 90);
  assert.equal(gameTurf.util.getVectorAngleDegree({x:1,y:1},{ x:2,y:2}), 45);
  assert.equal(gameTurf.util.getVectorAngleDegree({x:1,y:1},{ x:1,y:2}), 0);
  assert.equal(gameTurf.util.getVectorAngleDegree({x:1,y:1},{ x:0,y:2}), -45);
  assert.equal(gameTurf.util.getVectorAngleDegree({x:1,y:1},{ x:0,y:1}), -90);
  assert.equal(gameTurf.util.getVectorAngleDegree({x:1,y:1},{ x:0,y:0}), -135);
  assert.equal(gameTurf.util.getVectorAngleDegree({x:1,y:1},{ x:1,y:0}), 180);
  assert.equal(gameTurf.util.getVectorAngleDegree({x:1,y:1},{ x:2,y:0}), 135);
  
});


QUnit.test("Test getPositionByDegree 1", function( assert ) {
  var result = gameTurf.util.getPositionByDegree({x:1,y:1}, 180, 10);
  assert.equal(result.x, 1);
  assert.equal(result.y, -9);
});

QUnit.test("Physics test", function(assert){
  var physics = gameTurf.physics({
    position: {
      x: 2
    , y: 10
    },
    speed: 1,
    width: 15,
    height: 30
  });

  physics.update(16, {
    isRunning: false,
    vector: {
      x: 1,
      y: 1
    }
  });

  assert.equal(0.5, physics.velocity.x);
  assert.equal(0.5, physics.velocity.y);

  assert.equal(2.8, physics.position.x);
  assert.equal(10.8, physics.position.y);
});