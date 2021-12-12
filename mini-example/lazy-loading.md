**图片懒加载的原理很简单：**只有当页面出现在可是区域内时，才去请求图片并加载。当然，为了让页面不闪烁，会先放一张占位图片。

核心 API：`getBoundingClientRect()`

这个方法很有用，它可以帮助我们确定元素在浏览器视口中的位置。

该方法返回一个 DOMRect 对象，包含 `left` 、 `top` 、 `right` 、 `bottom` 、 `x` 、 `y` 、 `width`  和 `height`  这几个属性。利用该方法，我们可以实现图片的懒加载。
![image.png](https://cdn.nlark.com/yuque/0/2021/png/365194/1615123417250-81d8dab9-1508-4017-8db7-58d263591645.png#align=left&display=inline&height=626&margin=%5Bobject%20Object%5D&name=image.png&originHeight=626&originWidth=1364&size=223410&status=done&style=stroke&width=1364)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>图片懒加载</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .container {
        width: 600px;
        margin: 0 auto;
        text-align: center;
        border: 1px solid #ccc;
        font-size: 0;
      }

      img {
        width: 400px;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <ul>
        <!-- <li><img src="./imgs/sample.png" alt="" data-url="./imgs/01.jpg" /></li> -->
      </ul>
    </div>
    <script>
      function createImgDOM() {
        var fragment = document.createDocumentFragment();
        for (var i = 1; i <= 31; i++) {
          var li = document.createElement("li");
          var img = document.createElement("img");
          img.src = "./imgs/sample.png";
          var number = i;
          if (number < 10) {
            number = "0" + i;
          }
          img.dataset.url = "./imgs/" + number + ".jpg";
          li.appendChild(img);
          fragment.appendChild(li);
        }
        var ul = document.querySelector("ul");
        ul.appendChild(fragment);
      }
      createImgDOM();

      var distance = -200;
      var clientHeight = document.documentElement.clientHeight;
      var imgs = document.getElementsByTagName("img");

      function loadImg() {
        for (var i = imgs.length - 1; i >= 0; i--) {
          (function (j) {
            var img = imgs[j];
            var rect = img.getBoundingClientRect();
            if (rect.top < clientHeight + distance) {
              img.src = img.dataset.url;
            }
          })(i);
        }
      }
      var img = new Image();
      img.src = "./imgs/sample.png";
      img.onload = function () {
        loadImg();
      };

      window.addEventListener("scroll", loadImg);
    </script>
  </body>
</html>
```
