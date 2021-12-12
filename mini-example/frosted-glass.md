![image.png](https://cdn.nlark.com/yuque/0/2020/png/365194/1598957176684-6dfb44c7-88a3-4f63-a6ae-784eed10dbb3.png#align=left&display=inline&height=451&margin=%5Bobject%20Object%5D&name=image.png&originHeight=451&originWidth=506&size=469043&status=done&style=none&width=506)

```html
<!DOCTYPE html>
<html>
  <head>
    <title>pdf</title>
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <link rel="stylesheet" href="./index.css" />
  </head>
  <body>
    <div class="container">
      <div class="content">
        <div class="text">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dignissimos
          eius ratione accusamus, voluptatum porro illo vel, numquam fuga
          voluptatem officiis qui alias? Molestiae, a tempora debitis,
          voluptatem veniam vero aperiam.
        </div>
      </div>
    </div>
  </body>
</html>
```

**CSS**

```css
div.container {
  position: relative;
  width: 512px;
  height: 512px;
  margin: 0 auto;
  background: url("./HTML5.png");
  background-position: center center;
  background-repeat: no-repeat;
}

div.content {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300px;
  transform: translateY(-50%);
  margin-left: -150px;
  border-radius: 5px;
  overflow: hidden;
}

div.text {
  padding: 15px;
  color: #43341b;
  font-size: 20px;
}

div.content::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: -1;
  background: url("./HTML5.png");
  background-position: center center;
  background-repeat: no-repeat;
  filter: blur(20px);
  margin: -20px;
}
```

_参考_

- [CSS 秘密花园:磨砂玻璃效果](https://www.w3cplus.com/css3/css-secrets/frosted-glass-effect.html)
