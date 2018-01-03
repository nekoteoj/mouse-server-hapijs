'use strict';

const Path = require('path');
const Hapi = require('hapi');
const Inert = require('inert');
const robot = require('robotjs');

const server = new Hapi.server({
  port: 3000,
  host: 'localhost',
  routes: { files: { relativeTo: Path.join(__dirname, 'public') } }
});

const handlers = {

  root: {
    file: 'index.html'
  },

  moveTo: function (request, h) {
    const { x, y } = request.payload;
    console.log(`moving cursor to (x: ${x}, y: ${y})`);
    robot.moveMouse(x | 0, y | 0);
    return h.close;
  },

  moveBy: function (request, h) {
    const { x, y } = request.payload;
    const mouse = robot.getMousePos();
    const [xx, yy] = [(mouse.x | 0) + (x | 0), (mouse.y | 0) + (y | 0)];
    console.log(`moving cursor by (x: ${x}, y: ${y}) from (x: ${mouse.x}, y: ${mouse.y}) to (x: ${xx}, y: ${yy})`);
    robot.moveMouse(xx, yy);
    return h.close;
  },

  leftClick: function (request, h) {
    console.log('left click');
    robot.mouseClick('left');
    return h.close;
  },

  rightClick: function (request, h) {
    console.log('right click');
    robot.mouseClick('right');
    return h.close;
  },

  scrollBy: function (request, h) {
    const { v: vs, h: hs } = request.payload;
    console.log(`scroll by (horz: ${hs | 0}, vert: ${vs | 0})`);
    robot.scrollMouse(hs | 0, vs | 0);
    return h.close;
  }

};

const routes = [
  { method: 'GET', path: '/', handler: handlers.root },
  { method: 'POST', path: '/move-to', handler: handlers.moveTo },
  { method: 'POST', path: '/move-by', handler: handlers.moveBy },
  { method: 'POST', path: '/left-click', handler: handlers.leftClick },
  { method: 'POST', path: '/right-click', handler: handlers.rightClick },
  { method: 'POST', path: '/scroll-by', handler: handlers.scrollBy }
];

(async () => {

  try {
    await server.register(Inert);
  } catch (err) {
    console.log(err);
  }

  server.route(routes);

  try {
    await server.start();
  } catch (err) {
    console.log(err);
  }

  console.log(`Server started at ${server.info.uri}`);

})();