**功能：**

- 回弹效果
- 方向锁定

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>carousel</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        list-style: none;
      }
      body {
        height: 3000px;
      }
      #container {
        width: 375px;
        overflow: hidden;
      }
      #slide {
        width: 1500px;
        font-size: 0;
      }
      img {
        width: 375px;
      }
    </style>
  </head>

  <body>
    <div id="container">
      <div id="slide">
        <img src="./imgs/029.jpg" alt="" />
        <img src="./imgs/030.jpg" alt="" />
        <img src="./imgs/031.jpg" alt="" />
        <img src="./imgs/032.jpg" alt="" />
      </div>
    </div>
    <script>
      var list = document.getElementsByTagName("img");
      var listX = [];
      Array.prototype.slice.call(list, 0).forEach(function (item) {
        listX.push(item.getBoundingClientRect().x);
      });

      var slide = document.getElementById("slide");
      var touch = {
        beginX: 0,
        beginY: 0,
        offsetW: 0,
      };
      var offsetW = 0;
      var direction = "left";
      var current = 0;
      var lockDirection = ""; // moveY

      slide.addEventListener("touchstart", function (e) {
        touch.beginX = e.targetTouches[0].clientX;
        touch.beginY = e.targetTouches[0].clientY;
        var offsetX = touch.beginX - touch.offsetW;

        for (var i = 0; i < listX.length; i++) {
          if (offsetX >= i * 375 && offsetX < (i + 1) * 375) {
            current = i;
            break;
          }
        }
      });

      slide.addEventListener("touchmove", function (e) {
        var distanceX = e.targetTouches[0].clientX - touch.beginX;
        var distanceY = e.targetTouches[0].clientY - touch.beginY;

        if (
          lockDirection === "" &&
          (Math.abs(distanceX) > 10 || Math.abs(distanceY) > 10)
        ) {
          if (Math.abs(distanceX) / Math.abs(distanceY) > 1) {
            lockDirection = "moveX";
          } else {
            lockDirection = "moveY";
          }
        }

        if (lockDirection === "moveY") {
          return;
        } else {
          e.preventDefault();
        }

        if (distanceX > 0) {
          direction = "right";
          if (current === 0 && Math.abs(distanceX) > 50) {
            return;
          }
        } else {
          direction = "left";
          if (current === listX.length - 1 && Math.abs(distanceX) > 50) {
            return;
          }
        }
        offsetW = distanceX + touch.offsetW;
        slide.style.transform = `translate(${offsetW}px, 0)`;
      });

      slide.addEventListener("touchend", function (e) {
        if (lockDirection === "moveY") {
          lockDirection = "";
          return;
        }
        lockDirection = "";

        if (direction === "right") {
          current -= 1;
          if (current < 0) current = 0;
        } else {
          current += 1;
          if (current > listX.length - 1) current = listX.length - 1;
        }
        offsetW = -listX[current];
        slide.style.transform = `translate(${offsetW}px, 0)`;
        slide.style.transition = "transform 500ms";
        touch.offsetW = offsetW;
      });
    </script>
  </body>
</html>
```
