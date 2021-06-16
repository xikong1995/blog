早在 2001 年 W3C 就完成了 CSS3 的工作草案，但是在 2013 年之后各大浏览器才开始逐步兼容 CSS3 的属性，到现在如果进行移动端 Web 应用的开发，那你不用考虑直接使用 CSS3 中的新属性即可。

# 动画前世今生

互联网早期，动画大多使用 flash 制作，简单的会用 gif 图。但是这些都不够灵活，更重要的是还引发安全性问题。iPhone 手机浏览器更是直接禁止使用 flash。

于此，很多 Web 开发人员都是使用 js 来实现动画，利用 `setTimeout` 和 `setInterval` 方法。当然 HTML5 后，新出了一个方法 `requestAnimationFrame`，使用它可以实现更加流畅的动画。

即使有了这些方法，对于开发人员来说，实现一个动画的成本还是很高。本质来说，Web 中的动画就是改变 DOM 的样式。所以它和 CSS 联系紧密，因此 CSS3 中制定了很多快速实现动画的属性。

# 动画属性

CSS3 中涉及动画的属性主要有两个，transition 和 animation。

## Transition

Transition 是过渡的意思。把一个盒子的宽度从 100 变成 200，如果中间没有过渡的过程，肉眼看到就不是动画，只是瞬变；但如果中间慢慢的改变，先变成 110、120...190 最后变成 200，那么肉眼看到的就是动画。Transition 属性就能帮助我们实现这样的功能。

transition 语法结构：

```
transition: transition-property transition-duration	transition-timing-function transition-delay

例：transition: width 1s linear 2s;
```

transition 主要有四个值，第一个表示要应用过渡的属性名，第二个是过渡动画执行的时间，第三个是动画执行速率的变化函数（如匀速，先快后慢等），最后一个是延迟时间。总提来说还是蛮简单的。

## Animation

过渡属性只能实现一些简单的动画，而且一般只能控制起始态和终止态这两种状态。如果我们想要实现复杂的动画，就需要使用 animation 了。

如果要实现一个 animation 动画，需要使用两个属性，`@keyframes` 和 `animation`。

@keyframes 表示一个动画步骤，即声明每一个阶段元素的状态。而每个阶段中间的动画由浏览器引擎帮我们自动补齐，这种动画叫做补间动画。

@keyframes 语法结构：

```
@keyframes myfirst
{
    from {background: red;}
    to {background: yellow;}
}

或者

@keyframes myfirst
{
    0%   {background: red;}
    25%  {background: yellow;}
    50%  {background: blue;}
    100% {background: green;}
}
```

前一种方式中的 from 和 to 分别表示 0% 和 100%。

animation 主要用来告诉元素使用哪个动画，同时声明动画的执行时间、执行顺序等。

animation 的语法结构：

```
animation: animation-name | animation-duration | animation-timing-function | animation-delay | animation-iteration-count | animation-direction | animation-fill-mode | animation-play-state

例：animation: myfirst 5s linear 2s infinite alternate running
```

前面四个和过渡属性类似，无需多说，后面几个值需要注意下。

- animation-iteration-count：表示动画执行的次数，infinite 表示无限次
- animation-direction：规定动画是否在下一周期逆向地播放，reverse 表示反向播放，alternate 表示正反都播放
- animation-fill-mode：规定当动画不播放时（当动画完成时，或当动画有一个延迟未开始播放时），要应用到元素的样式。forwards 表示动画结束后不会回到初始位置，而是停留在动画结束的那个位置。backwards 表示在动画播放前直接跳到第一帧的位置。both 兼顾前面两者。**注意 animation-fill-mode 可能看描述不太好理解，建议写份代码自己运行看看**
- animation-play-state：这个值可以控制动画的播放状态。我们可以使用 js 改变这个值以此控制动画播放和暂停

## transitionend

之前面试时被人问到如何监听动画的结束，这里也写一写。

我们可以监听 `transitionend` 事件，返回一个 TransitionEvent 对象，它有两个特殊的属性 propertyName 和  elapsedTime。前者是动画执行的属性，后者是动画运行的时间。

下面是一个简单的例子：

```js
el.addEventListener("transitionend", updateTransition, true);
```

与之对应的还有两个事件，transitionrun 和 transitionstart，分别表示动画播放中和动画播放结束。

# 二维与三维

Web 技术飞速发展，但是绝大数技术人员并没有跟上其脚步，博主就是其中一员。当我们还在琢磨上一代技术时，那些技术前沿的弄潮儿开始打造新一代技术。这里聊一聊非高频却十分炫酷的 3D 技术，使用 CSS3 即可实现。

在说到三维之前，我们先聊一聊二维。

二维很好理解，即平面。我们使用 x 轴和 y 轴就可以轻松表示。

三维是在二维的基础上增加了一个维度。这个稍微有点难理解，可以参考下图：

![三维坐标系](https://img-blog.csdnimg.cn/20190817210814632.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3pob3VsZWkxOTk1,size_16,color_FFFFFF,t_70)

我们在网页里面构造一个正方形非常简单，但是如果想构造一个正方体，那就麻烦了。正常情况下，页面是一个二维空间，所以无法构造立体图。如果想构造立方体，我们必须在三维空间里面。

先认识下 CSS3 中提供的一些 3d 属性：

- perspective：规定 3D 元素的透视效果。
- perspective-origin：规定 3D 元素的底部位置。
- transform-style：规定被嵌套元素如何在 3D 空间中显示。
- transform-origin：允许你改变被转换元素的位置。
- transform：向元素应用 2D 或 3D 转换。
- backface-visibility：定义元素在不面对屏幕时是否可见。

## perspective

这个属性表示眼睛离物体的距离，并且这个值是非负的。在 Web 3d 的世界中，该值表示屏幕离物体的距离。

由此不难理解，该值越大，界面呈现的物体越小。该值越小，界面呈现的物体越大。

## perspective-origin

表示视线灭点的位置，默认值是物体的中心。可以简单理解为视线的焦点。

## transform-style

表示空间内元素的展示模式，有平面和立体两种，flat 和 preserve-3d。

> `perspective`、`perspective-origin`、`transform-style` 这三个属性都作用于父元素，即 3d 物体的元素的上级元素。

## backface-visibility

表示当元素不面向屏幕时是否可见。如果我们把一个元素翻转 180 度，并且不想看到这个元素，那么我们将 `backface-visibility` 设为 `false` 即可。

> `transform` 和 `transform-origin` 不在赘述，在[上一篇博文](https://blog.csdn.net/zhoulei1995/article/details/98785725)里有讲述。

# 动画实例

实践出真知，很多时候我们看了一些知识点，但由于没有结合实际运用，所以导致很快就忘了。这里我给出几个例子，来帮助大家巩固知识，加深印象。

## 运动的小球

**描述：** 

让一个小球从左运动到右，然后从右运动到左，再从左运动到右，最后停在右边。

**效果：**

![运动的小球](https://img-blog.csdnimg.cn/20190808000719421.gif)

**代码：**

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>小球动画</title>
	<style>
		.ball {
			width: 50px;
			height: 50px;
			border-radius: 50%;
			background-color: orange;
			animation-name: move;
			animation-duration: 2s;
			animation-direction: alternate;
			animation-iteration-count: 3;
			animation-fill-mode: forwards;
		}
		@keyframes move {
			from {
				transform: translateX(0);
			}
			to {
				transform: translateX(200px);
			}
		}
	</style>
</head>
<body>
	<div class="ball"></div>
</body>
</html>
```

## 翻页动画

**效果：**

![翻书效果](https://img-blog.csdnimg.cn/20190810010750514.gif)

**代码：**

这个效果难度不大，就是需要注意下层级。

```html
 <div class="container">
   <ul>
     <li><div class="box">1</div></li>
     <li><div class="box">2</div></li>
     <li><div class="box">3</div></li>
     <li><div class="box">4</div></li>
     <li><div class="box">5</div></li>
   </ul>
 </div>
```

```css
.container {
  perspective: 600px;
}
ul {
  position: relative;
  width: 82px;
  height: 122px;
  margin: 0 auto;
  transform-style: preserve-3d;
}
li {
  position: absolute;
  list-style: none;
  width: 80px;
  height: 120px;
  border: 1px solid #ccc;
  background-color: #fff;
  transform-origin: left center;
  transition: transform 3s;
}

li:nth-child(1) {
  z-index: 5
}
li:nth-child(2) {
  z-index: 4
}
li:nth-child(3) {
  z-index: 3
}
li:nth-child(4) {
  z-index: 2
}
li:nth-child(5) {
  z-index: 1
}

.box {
  width: 30px;
  height: 30px;
  margin: 0 auto;
  margin-top: 50%;
  border-radius: 50%;
  border: 1px solid #333;
  text-align: center;
  line-height: 30px;
  font-size: 14px;
}
```

```js
var items = document.getElementsByTagName('li')
var initIndex = 0
for (let i = 0; i < items.length; i++) {
  items[i].addEventListener('click', function() {
    if (i === 0) {
      initIndex = getComputedStyle(items[i]).zIndex
    } else {
      items[i].style.zIndex = initIndex + i
    }
    items[i].style.transform = 'rotateY(-180deg)'
  })
}
```

## 正方体

正方体的实现思路就是利用六个面，经过旋转变化组合而成。

前后两个面，通过 z 轴方向的偏移可以得到。

左右两个面，需要先经过一次 y 轴方向的旋转，再经过 z 轴方向的偏移。

上下两个面，需要先经过一次 x 轴方向的旋转，再经过 z 轴方向的偏移。

![正方体](https://img-blog.csdnimg.cn/20190818233854809.gif)

**关键代码**

```html
<div class="cube">
	<div class="c1"><img src="./img/1.jpg" alt=""></div>
	<div class="c2"><img src="./img/2.jpg" alt=""></div>
	<div class="c3"><img src="./img/3.jpg" alt=""></div>
	<div class="c4"><img src="./img/4.jpg" alt=""></div>
	<div class="c5"><img src="./img/5.jpg" alt=""></div>
	<div class="c6"><img src="./img/6.jpg" alt=""></div>
</div>
```

```css
.cube {
	position: relative;
	transform-style: preserve-3d;
	animation: move 10s linear infinite;
	border: 1px solid #ccc;
	width: 200px;
	height: 200px;
}
@keyframes move {
	from {
		transform: rotateX(0deg) rotateY(0deg);
	}
	to {
		transform: rotateX(-360deg) rotateY(360deg);
	}
}
.cube div {
	position: absolute;
	width: 200px;
	height: 200px;
	border: 1px solid #ccc;
	text-align: center;
	line-height: 100px;
	box-shadow: inset 0 0 20px #3333FF;
	opacity: .8;
}
img {
	width: 100%;
	height: 100%;
}
.c1 {
	transform: translateZ(100px);
}
.c2 {
	transform: rotateY(180deg) translateZ(100px);
}
.c3 {
	transform: rotateY(90deg) translateZ(100px);
}	
.c4 {
	transform: rotateY(270deg) translateZ(100px);
}
.c5 {
	transform: rotateX(-90deg) translateZ(100px);
}
.c6 {
	transform: rotateX(90deg) translateZ(100px);
}
```

## 3d轮播图

![3d轮播](https://img-blog.csdnimg.cn/20190818234332470.gif)

思路和上个正方体一样，细节可以参考代码。

```html
<div class="container">
	<h2>埃菲尔铁塔</h2>

	<ul>
		<li><img src="./img/1.jpg" alt=""></li>
		<li><img src="./img/2.jpg" alt=""></li>
		<li><img src="./img/3.jpg" alt=""></li>
		<li><img src="./img/4.jpg" alt=""></li>
		<li><img src="./img/5.jpg" alt=""></li>
		<li><img src="./img/6.jpg" alt=""></li>
	</ul>

	<div class="btn-wrapper">
		<button class="prev">上一张</button>
		<button class="next">下一张</button>
	</div>
</div>
```

```css
.container {
	width: 800px;
	height: 400px;
	border: 1px solid #ccc;
	margin: 50px auto 0 auto;
	display: flex;;
	align-items: center;
	justify-content: center;
	perspective: 800px;
	position: relative;
	background-color: #99CCCC;
	border-radius: 10px;
}

ul {
	position: relative;
	width: 200px;
	height: 200px;
	transform-style: preserve-3d;
	transition: transform 1s ease;
}

li {
	position: absolute;
	width: 200px;
	height: 200px;
	opacity: .9;
	box-shadow: 0px 0px 5px #3399FF;
	border-radius: 5%;
}

li:nth-child(1) {
	transform: rotateY(0) translateZ(180px);
}
li:nth-child(2) {
	transform: rotateY(60deg) translateZ(180px);
}
li:nth-child(3) {
	transform: rotateY(120deg) translateZ(180px);
}
li:nth-child(4) {
	transform: rotateY(180deg) translateZ(180px);
}
li:nth-child(5) {
	transform: rotateY(240deg) translateZ(180px);
}
li:nth-child(6) {
	transform: rotateY(300deg) translateZ(180px);
}

img {
	width: 100%;
	height: 100%;
	border-radius: 5%;
}

.btn-wrapper {
	position: absolute;
	left: 50%;
	bottom: 10px;
	transform: translateX(-50%);
}
button {
	padding: 8px 25px;
	font-size: 14px;
	color: #333;
	background-color: #3399FF;
	color: #fff;
	border: none;
	outline: none;
	border-radius: 4px;
}
button:last-child {
	margin-left: 20px;
}

h2 {
	position: absolute;
	top: 10px;
	left: 50%;
	transform: translateX(-50%);
	color: #333;
}
```

```js
var cities = [
	'埃菲尔铁塔',
	'故宫',
	'凯旋门',
	'长城',
	'黄鹤楼',
	'悉尼歌剧院'
]
var prev = document.querySelector('.prev');
var next = document.querySelector('.next');
var ul = document.querySelector('ul');
var h2 = document.querySelector('h2');
var deg = 0
var i = 0
prev.addEventListener('click', function() {
	deg += 60
	i--
	if (i < 0) {
		i = 5
	}
	h2.innerHTML = cities[i]
	ul.style.transform = `rotateY(${deg}deg)`
})
next.addEventListener('click', function() {
	deg -= 60
	i++
	if (i > 5) {
		i = 0
	}
	h2.innerHTML = cities[i]
	ul.style.transform = `rotateY(${deg}deg)`
})
```

# 动画优化

虽然 CSS3 的这些属性给予了我们很大的方便，但是如果我们滥用动画，页面的交互效果不仅没提高，反而由于卡顿影响了正常功能。 故有必要聊一聊动画的注意事项和优化。

在讲优化技巧前，我们先回顾下浏览器的渲染过程。当然不同的渲染引擎，有不同的渲染过程。这里我们主要讲 Chrome 浏览器。
![webkit](https://img-blog.csdnimg.cn/20190810154318738.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3pob3VsZWkxOTk1,size_16,color_FFFFFF,t_70)
1. 解析 HTML，生成 DOM 树；解析 CSS，生成 Style 树
2. 合并  DOM 树和 Style 树，生成 Render 树
3. 页面绘制

我们这里不作深究，只需要知道 reflow（重排或回流） 和 repaint（重绘）是渲染过程中的两个重要步骤。（如果对浏览器渲染没有基础，可以先去了解下，这里不展开讲）

**对于动画的每一帧，浏览器都要重新计算元素的形状位置（reflow），把新状态渲染出来（repaint），再显示到屏幕上。** 简单来说，我们如果想提高动画的性能，可以减少 reflow 和 repaint。

transform 和 opacity 这两个属性不会触发触发 reflow 和 repaint，所以我们做动画变化时，尽量优先使用这个属性。

___

*参考*

- [深入浏览器理解CSS animations 和 transitions的性能问题](http://sy-tang.github.io/2014/05/14/CSS%20animations%20and%20transitions%20performance-%20looking%20inside%20the%20browser/)
- [前端性能优化（CSS动画篇）](https://segmentfault.com/a/1190000000490328)
- [好吧，CSS3 3D transform变换，不过如此！](https://www.zhangxinxu.com/wordpress/2012/09/css3-3d-transform-perspective-animate-transition/)
- [3d transform的坐标空间及位置](https://segmentfault.com/a/1190000004233074)
- [Using CSS transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions/Using_CSS_transitions)
