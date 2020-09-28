
function $(element) {
  return document.querySelector(element);
}

function $$(element) {
  return document.querySelectorAll(element);
}

let difficult;
let points;
let counter;
let level;
let nextLevel = false;
let randomIds;
const container = $('#container');
const header = $('#header');
let activeDropZone = undefined;
let endGameTimer;

var doc_w = document.documentElement["clientWidth"];
var doc_h = document.documentElement["clientHeight"];

function delegate(parent, type, selector, fn) {

  function delegatedFunction(e) {
    if (e.target.matches(`${selector},${selector} *`)) {
      let target = e.target;
      while (!target.matches(selector)) {
        target = target.parentNode;
      }
      e.delegatedTarget = target;
      return fn(e);
    }
  }

  parent.addEventListener(type, delegatedFunction, false);
}

delegate(container, 'pointerdown', '.draggable', onPointerDown);
delegate(container, 'pointermove', '.draggable', onPointerMove);
delegate(container, 'pointerup', '.draggable', onPointerUp);
delegate(container, 'pointerup', '.level', onPointerUpOnStartPage);
delegate(container, 'pointerup', '.difficult', onPointerUpOnDifficultSelector);
delegate(container, 'pointerup', '.next', onPointerUpOnNextLevel);
delegate(header, 'pointerup', '.exit', initStartPage);


//Game properties######################################

window.onload = init();

function init() {
  randomIds = setCardIdRandomly();
  points = 0;
  let wW = window.screen.availWidth;
  let wH = window.screen.availHeight;

  window.onresize = function (event) {
    if (window.screen.availWidth != wW || window.screen.availHeight != wH) {
      $$('.draggable').forEach(function (elem) {
        placeDraggableElementRandomly(elem);
      });
      wW = window.screen.availWidth;
      wH = window.screen.availHeight;
    }
  };
}

function placeAllDraggableElementRandomly() {
  const draggableElements = $$('.draggable');
  for (var i = 0; i<draggableElements.length-1; i++) {
    placeDraggableElementRandomly(draggableElements[i]);
  }
}

function placeDraggableElementRandomly(element) {
  var id;
  for (var i=0; i < randomIds.length; ++i) {
    if (randomIds[i] == element.id) {
      id = i+1;
      break;
    }
  }
  var elems = $$('.draggable');
  var footer_h = $('footer').offsetHeight;
  var footer_w = $('footer').offsetWidth;
  var footer_x = $('footer').getBoundingClientRect().x;
  var footer_y = $('footer').getBoundingClientRect().y;
  setCardSize(element);
  var max_width = (footer_w / 3) - element.offsetWidth;
  var max_height = (footer_h / 3) - element.offsetHeight;
  if (id <= 3) {
    var posy = footer_y + Math.floor(Math.random() * max_height);
    var posx = footer_x + ((footer_w / 3) * (id - 1)) + Math.floor(Math.random() * max_width);
  } else if (id > 3 && id < 7) {
    var posy = footer_y + (footer_h / 3) + Math.floor(Math.random() * max_height);
    var posx = footer_x + ((footer_w / 3) * ((id) - 4)) + Math.floor(Math.random() * max_width);
  } else if (id >= 7) {
    var posy = footer_y + (footer_h / 3) * 2 + Math.floor(Math.random() * max_height);
    var posx = footer_x + ((footer_w / 3) * ((id) - 7)) + Math.floor(Math.random() * max_width);
  }

  element.style.top = posy + 'px';
  element.style.left = posx + 'px';
}

function setCardSize(element) {
  if (element != undefined) {
    var w = $('.dropzone').offsetWidth - 1;
    var h = $('.dropzone').offsetHeight - 1;
    element.style.width = w + 'px';
    element.style.height = h + 'px';
  }
}

function setImagesToDropZoneCards(n) {
  var img;
  $$(".dropzone").forEach(function (element) {
    if (element.nodeName != 'FOOTER') {
      img = 'url(media/stage' + n + '/L' + n + 'C' + element.id + '.png)';
      element.style.background = img + ' no-repeat center';
      element.style.backgroundSize = "100%";
    }
  })
}

function setImagesToDraggableCards(n) {
  var img;
  $$(".draggable").forEach(function (element) {
    img = 'url(media/stage' + n + '/L' + n + 'C' + element.id + 'M.png)';
    element.style.background = img + ' no-repeat center';
    element.style.backgroundSize = "100%";
  })
}

function setCardIdRandomly() {
  Ids = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  var a, b, c;
  for (a = Ids.length -1; a > 0; a--) {
    b = Math.floor(Math.random()* (a + 1));
    c = Ids[a];
    Ids[a] = Ids[b];
    Ids[b] = c;
  }
  var i=0;
  $$('.draggable').forEach(function(elem) {
    elem.id = Ids[i];
    i++;
  })
  return Ids;
}

function onPointerDown(e) {
  container.classList.add('dragging');
  e.target.classList.remove("filler");
  setCardSize(e.target);
  e.target.classList.add('active');
  e.target.setPointerCapture(e.pointerId);
}

function onPointerMove(e) {
  e.preventDefault();
  if (e.target.hasPointerCapture(e.pointerId)) {
    const { clientX: x, clientY: y } = e;
    const element = document.elementFromPoint(x, y);

    if (element.matches('.dropzone')) {
      if (!activeDropZone) {
        activeDropZone = element;

        element.classList.add('active');
      }
      else if (element != activeDropZone) {
        activeDropZone.classList.remove('active');
        activeDropZone = element;
        element.classList.add('active');
      }
    }
    else {
      if (activeDropZone) {
        activeDropZone.classList.remove('active');
      }
    }
    e.target.style.left = `${x - e.target.offsetWidth / 2}px`;
    e.target.style.top = `${y - e.target.offsetHeight / 2}px`;
  }
}

function onPointerUp(e) {
  container.classList.remove('dragging');
  e.target.classList.remove('nonfiller');
  if (activeDropZone) {

    if (difficult == "easy") {
      if (activeDropZone.nodeName != 'FOOTER') {
        if (activeDropZone.id == e.target.id) {
          activeDropZone.appendChild(e.target);
          e.target.classList.add('filler');
          counter = 0;
          $$(".dropzone").forEach(function (elem) {
            if (elem.nodeName != 'FOOTER') {
              if (elem.children.length != 0) {
                counter++;
              }
            }
          })
        } else {
          placeDraggableElementRandomly(e.target);
        }
        if (activeDropZone.nodeName == 'FOOTER') {
          activeDropZone.appendChild(e.target);
        }
      }
    }

    else if (difficult == "hard") {
      if (activeDropZone.nodeName != 'FOOTER') {
        if (activeDropZone.children.length == 0) {
          activeDropZone.appendChild(e.target);
          counter = 0;
          $$(".dropzone").forEach(function (elem) {
            if (elem.nodeName != 'FOOTER') {
              if (elem.children.length != 0) {
                counter++;
              }
            }
          })
        } else {
          placeDraggableElementRandomly(e.target);
        }
      } else if (activeDropZone.nodeName == 'FOOTER') {
        activeDropZone.appendChild(e.target);
      }

      if (activeDropZone.nodeName != 'FOOTER') {
        e.target.classList.add('filler');
      }
      if (counter == 9) {
        $$('.draggable').forEach(function (elem) {
          if (elem.id != elem.parentElement.id) {
            $('footer').appendChild(elem);
            placeDraggableElementRandomly(elem);
          }
        })
      }
    }

    points = 0;
    $$('.draggable').forEach(function (elem) {
      if (elem.id == elem.parentElement.id) {
        points++;
      }
    })

    activeDropZone.classList.remove('active');
    activeDropZone = undefined;
  }

  e.target.classList.remove('active');

  if (points == 9) {
    $('.shadow').style.visibility = "visible";
    winnerAnimation();
    points = 0;
    endGameTimer = setTimeout(backToStartPage, 15000);
    function backToStartPage() {
      if (!nextLevel) {
        initStartPage();
      }
    }
  }
  
}

function onPointerUpOnStartPage(e) {
  initStage(e.target.id);
}

function onPointerUpOnDifficultSelector(e) {
  if (e.target.className == "difficult") {
    if (e.target.id == "easy") {
      $('.shadow').style.visibility = "hidden";
      $('#easy').style.visibility = "hidden";
      $('#hard').style.visibility = "hidden";
      difficult = e.target.id;
    } else if (e.target.id = "hard") {
      $('.shadow').style.visibility = "hidden";
      $('#easy').style.visibility = "hidden";
      $('#hard').style.visibility = "hidden";
      difficult = e.target.id;
      counter = 0;
    }
  }
}

function onPointerUpOnNextLevel(e) {
  clearTimeout(endGameTimer);
  $('.shadow').style.visibility = "visible";
  $('#easy').style.visibility = "visible";
  $('#hard').style.visibility = "visible";
  $(".next").style.visibility = "hidden";
  $('.win').style.visibility = "hidden";
  level++;
  if (level > 3) level = 1;
  setImagesToDropZoneCards(level);
  setImagesToDraggableCards(level);
  initStage(level);
  nextLevel = true;
}

function initStage(id) {
  $('#easy').style.background = "url(media/easy.png) no-repeat center";
  $('#easy').style.backgroundSize = "100%";
  $('#hard').style.background = "url(media/hard.png) no-repeat center";
  $('#hard').style.backgroundSize = "100%";
  if (id == 'L1') {
    setImagesToDropZoneCards(1);
    setImagesToDraggableCards(1);
    $('.startPage').style.visibility = "hidden";
    $('.exit').style.visibility = "visible"
    level = 1;
  } else if (id == 'L2') {
    setImagesToDropZoneCards(2);
    setImagesToDraggableCards(2);
    $('.startPage').style.visibility = "hidden";
    $('.exit').style.visibility = "visible"
    level = 2;
  } else if (id == 'L3') {
    setImagesToDropZoneCards(3);
    setImagesToDraggableCards(3);
    $('.startPage').style.visibility = "hidden";
    $('.exit').style.visibility = "visible"
    level = 3;
  }
  $$('.draggable').forEach(function(elem) {
    $('footer').appendChild(elem);
    placeDraggableElementRandomly(elem);
  });
}

function initStartPage() {
  clearTimeout(endGameTimer);
  $('.shadow').style.visibility = "";
  $('#easy').style.visibility = "";
  $('#hard').style.visibility = "";
  $('.startPage').style.visibility = "";
  $('.exit').style.visibility = "";
  $('.win').style.visibility = "hidden";
  $('.next').style.visibility = "hidden";
}

function winnerAnimation() {
  var elem = $('.win');
  var next = $('.next');
  var size = 0;
  elem.style.width = size + 'px'; 
  elem.style.height = size + 'px';
  elem.style.visibility = "visible";
  var id = setInterval(frame, 1);
  function frame() {
      if (size >= (doc_h+doc_w)/3) {
          clearInterval(id);
          next.style.visibility = "visible";
          next.style.top = (doc_h/3*2 - next.offsetHeight/2) + 'px';
          next.style.left = (doc_w/2 - next.offsetHeight/2) + 'px';
          nextArrowAnimation();
      } else {
          size+=3;
          elem.style.width = size + 'px'; 
          elem.style.height = size + 'px';
          elem.style.top = (doc_h/3 - elem.offsetHeight/2) + 'px';
          elem.style.left = (doc_w/2 - elem.offsetWidth/2) + 'px';
      }
  }
}

function nextArrowAnimation() {
  var elem = $('.next');
  var sizeN = elem.offsetHeight;
  var sizeO = elem.offsetHeight;
  var id = setInterval(frame, 150);
  var del = setTimeout(shutdown, 15000);
  function frame() {
    if (sizeN <= sizeO+1) {
      sizeN+=2;
      elem.style.width = sizeN + 'px';
      elem.style.height = sizeN + 'px';
    } else if (sizeN > sizeO+1) {
      sizeN-=2;
      elem.style.width = sizeN + 'px';
      elem.style.height = sizeN + 'px';
    }
  }
  function shutdown() {
    clearInterval(id);
  }
}
